# GET /api/brokers/ and /api/brokers/<id>/: the broker filter dropdown's options.
import pytest

from submissions.tests.factories import BrokerFactory
from submissions.tests.helpers import broker_json

pytestmark = pytest.mark.django_db

LIST_URL = "/api/brokers/"


def test_brokers_are_a_plain_array_sorted_by_name(api_client):
    zenith = BrokerFactory(name="Zenith Brokerage")
    atlas_first = BrokerFactory(name="Atlas Brokerage")
    atlas_second = BrokerFactory(name="Atlas Brokerage")

    response = api_client.get(LIST_URL)

    assert response.status_code == 200
    # Not a paginated envelope: the dropdown gets every broker in one response.
    assert response.json() == [
        broker_json(atlas_first),
        broker_json(atlas_second),
        broker_json(zenith),
    ]


def test_brokers_take_a_single_query(api_client, django_assert_num_queries):
    BrokerFactory.create_batch(15)

    with django_assert_num_queries(1):
        response = api_client.get(LIST_URL)

    assert len(response.json()) == 15


def test_broker_detail(api_client):
    broker = BrokerFactory()

    response = api_client.get(f"{LIST_URL}{broker.id}/")

    assert response.status_code == 200
    assert response.json() == broker_json(broker)


@pytest.mark.parametrize("broker_id", ["999999", "abc"])
def test_unknown_or_malformed_broker_is_not_found(api_client, broker_id):
    response = api_client.get(f"{LIST_URL}{broker_id}/")

    assert response.status_code == 404
