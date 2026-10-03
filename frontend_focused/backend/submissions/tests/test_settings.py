# Environment-driven settings (server/settings.py). A misconfiguration must fail at startup,
# not at request time.
#
# Settings are evaluated once, at import, so each case imports server.settings in a fresh
# interpreter with its own environment and reads back the resulting values as JSON.
import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parents[2]
CONFIG_VARIABLES = (
    "DJANGO_DEBUG",
    "DJANGO_SECRET_KEY",
    "DJANGO_ALLOWED_HOSTS",
    "CORS_ALLOWED_ORIGINS",
)
REPORTED_SETTINGS = (
    "DEBUG",
    "ALLOWED_HOSTS",
    "CORS_ALLOWED_ORIGINS",
    "SESSION_COOKIE_SECURE",
    "CSRF_COOKIE_SECURE",
    "REST_FRAMEWORK",
)
PRODUCTION_SECRET_KEY = "test-only-" + "x" * 50
BROWSABLE_API_RENDERER = "rest_framework.renderers.BrowsableAPIRenderer"


# Imports server.settings in a new interpreter. Only the variables passed in are set; any
# DJANGO_* / CORS_* values from the developer's shell are removed so they cannot leak in.
def import_settings(**variables: str) -> subprocess.CompletedProcess[str]:
    environment = {k: v for k, v in os.environ.items() if k not in CONFIG_VARIABLES}
    script = (
        "import json, server.settings as s; "
        f"print(json.dumps({{name: getattr(s, name) for name in {REPORTED_SETTINGS!r}}}))"
    )
    return subprocess.run(
        [sys.executable, "-c", script],
        cwd=BACKEND_DIR,
        env={**environment, **variables},
        capture_output=True,
        text=True,
        check=False,
    )


# Like import_settings, but expects the import to succeed and returns the settings values.
def load_settings(**variables: str) -> dict:
    result = import_settings(**variables)
    assert result.returncode == 0, result.stderr
    return json.loads(result.stdout)


def test_defaults_suit_local_development():
    settings = load_settings()

    assert settings["DEBUG"] is True
    assert settings["ALLOWED_HOSTS"] == ["localhost", "127.0.0.1", "[::1]"]
    assert settings["CORS_ALLOWED_ORIGINS"] == ["http://localhost:3000", "http://127.0.0.1:3000"]
    assert BROWSABLE_API_RENDERER in settings["REST_FRAMEWORK"]["DEFAULT_RENDERER_CLASSES"]
    assert settings["SESSION_COOKIE_SECURE"] is False


def test_production_values_come_from_the_environment():
    settings = load_settings(
        DJANGO_DEBUG="false",
        DJANGO_SECRET_KEY=PRODUCTION_SECRET_KEY,
        DJANGO_ALLOWED_HOSTS=" api.example.com, ,admin.example.com ",
        CORS_ALLOWED_ORIGINS="https://app.example.com",
    )

    assert settings["DEBUG"] is False
    assert settings["ALLOWED_HOSTS"] == ["api.example.com", "admin.example.com"]
    assert settings["CORS_ALLOWED_ORIGINS"] == ["https://app.example.com"]
    assert settings["SESSION_COOKIE_SECURE"] is True
    assert settings["CSRF_COOKIE_SECURE"] is True
    assert BROWSABLE_API_RENDERER not in settings["REST_FRAMEWORK"]["DEFAULT_RENDERER_CLASSES"]


def test_production_refuses_the_committed_dev_secret_key():
    result = import_settings(DJANGO_DEBUG="false")

    assert result.returncode != 0
    assert "DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is false" in result.stderr


@pytest.mark.parametrize(
    ("raw", "expected"),
    [("true", True), ("1", True), (" Yes ", True), ("ON", True), ("false", False), ("0", False)],
)
def test_debug_flag_accepts_common_boolean_spellings(raw, expected):
    settings = load_settings(DJANGO_DEBUG=raw, DJANGO_SECRET_KEY=PRODUCTION_SECRET_KEY)

    assert settings["DEBUG"] is expected


def test_unrecognised_debug_value_fails_fast():
    result = import_settings(DJANGO_DEBUG="flase")

    assert result.returncode != 0
    assert "DJANGO_DEBUG must be one of" in result.stderr
