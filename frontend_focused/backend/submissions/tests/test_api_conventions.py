# HTTP behaviour shared by every API endpoint: read-only methods, the CORS allow-list,
# conditional GET, and the OpenAPI schema that documents it all.
#
# CORS and ETag cases run against the router's API root (/api/), so they hold for any
# endpoint registered under it.
import io

import pytest
from django.core.management import call_command

from submissions.tests.factories import SubmissionFactory

API_ROOT = "/api/"
FRONTEND_ORIGIN = "http://localhost:3000"
RESOURCE_URLS = [
    "/api/submissions/",
    "/api/submissions/{submission_id}/",
    "/api/brokers/",
    "/api/brokers/{broker_id}/",
]


@pytest.mark.django_db
@pytest.mark.parametrize("url", RESOURCE_URLS)
@pytest.mark.parametrize("method", ["post", "put", "patch", "delete"])
def test_write_methods_are_not_allowed(api_client, url, method):
    submission = SubmissionFactory()
    url = url.format(submission_id=submission.id, broker_id=submission.broker_id)

    response = getattr(api_client, method)(url, {}, format="json")

    assert response.status_code == 405
    assert response.headers["Allow"] == "GET, HEAD, OPTIONS"


@pytest.mark.django_db
@pytest.mark.parametrize("url", RESOURCE_URLS)
def test_head_is_answered_without_a_body(api_client, url):
    submission = SubmissionFactory()
    url = url.format(submission_id=submission.id, broker_id=submission.broker_id)

    response = api_client.head(url)

    assert response.status_code == 200
    assert response.content == b""


@pytest.mark.parametrize("origin", ["http://localhost:3000", "http://127.0.0.1:3000"])
def test_cors_allows_the_frontend_dev_origins(api_client, origin):
    response = api_client.get(API_ROOT, HTTP_ORIGIN=origin)

    assert response.status_code == 200
    assert response.headers["Access-Control-Allow-Origin"] == origin


def test_cors_gives_other_origins_no_access(api_client):
    response = api_client.get(API_ROOT, HTTP_ORIGIN="https://evil.example")

    assert "Access-Control-Allow-Origin" not in response.headers


def test_cors_headers_are_limited_to_api_urls(api_client):
    response = api_client.get("/admin/", HTTP_ORIGIN=FRONTEND_ORIGIN)

    assert "Access-Control-Allow-Origin" not in response.headers


def test_get_returns_an_etag_and_revalidates_to_304(api_client):
    first = api_client.get(API_ROOT)
    etag = first.headers["ETag"]

    second = api_client.get(API_ROOT, HTTP_IF_NONE_MATCH=etag, HTTP_ORIGIN=FRONTEND_ORIGIN)

    assert second.status_code == 304
    assert second.content == b""
    # The 304 keeps its CORS header, so a browser can use its cached copy cross-origin.
    assert second.headers["Access-Control-Allow-Origin"] == FRONTEND_ORIGIN


def test_stale_etag_gets_a_full_response(api_client):
    response = api_client.get(API_ROOT, HTTP_IF_NONE_MATCH='"stale"')

    assert response.status_code == 200
    assert response.content


# The schema must generate without a single drf-spectacular warning and pass OpenAPI 3
# validation, so a change that blurs the documented contract fails the suite.
def test_openapi_schema_is_valid_without_warnings():
    call_command("spectacular", "--validate", "--fail-on-warn", stdout=io.StringIO())


def test_openapi_schema_documents_the_camel_case_contract(api_client):
    response = api_client.get("/api/schema/", {"format": "json"})

    assert response.status_code == 200
    schema = response.json()
    list_operation = schema["paths"]["/api/submissions/"]["get"]
    assert {param["name"] for param in list_operation["parameters"]} == {
        "status",
        "priority",
        "brokerId",
        "companySearch",
        "createdFrom",
        "createdTo",
        "hasDocuments",
        "hasNotes",
        "ordering",
        "page",
        "pageSize",
    }
    row_fields = schema["components"]["schemas"]["SubmissionList"]["properties"]
    assert {"createdAt", "documentCount", "noteCount", "latestNote"} <= row_fields.keys()
    assert row_fields["latestNote"]["nullable"] is True


def test_swagger_ui_is_served(api_client):
    response = api_client.get("/api/docs/")

    assert response.status_code == 200
    assert response["Content-Type"].startswith("text/html")
