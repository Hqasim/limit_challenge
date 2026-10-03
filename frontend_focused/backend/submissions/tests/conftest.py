# Shared pytest fixtures for the submissions API tests.
#
# pytest-django supplies the database fixtures (`db`, `django_assert_num_queries`, ...);
# test modules opt into database access with `pytestmark = pytest.mark.django_db`.
import factory.random
import pytest
from rest_framework.test import APIClient

# Seed factory_boy's and Faker's random generators once per run, so a failing test
# reproduces with exactly the same generated names, emails and texts.
factory.random.reseed_random("submission-tracker")


# Unauthenticated DRF test client; the API is read-only and open (AllowAny).
@pytest.fixture
def api_client() -> APIClient:
    return APIClient()
