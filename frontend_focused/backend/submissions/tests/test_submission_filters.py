# Query-param filters on GET /api/submissions/ (filters/submission.py): a table of cases per
# param covering the happy path, edge cases and rejected input.
import datetime
from datetime import timedelta

import pytest

from submissions.models import Submission
from submissions.tests.factories import (
    BrokerFactory,
    CompanyFactory,
    DocumentFactory,
    NoteFactory,
    SubmissionFactory,
)
from submissions.tests.helpers import BASE_TIME, result_ids

pytestmark = pytest.mark.django_db

LIST_URL = "/api/submissions/"
UTC = datetime.UTC


# Ids returned for `params`, in response order. Fails loudly if the request was rejected.
def listed_ids(api_client, params: dict) -> list[int]:
    response = api_client.get(LIST_URL, params)
    assert response.status_code == 200, response.json()
    return result_ids(response)


def matching_ids(api_client, params: dict) -> set[int]:
    return set(listed_ids(api_client, params))


# Asserts that `params` are rejected with a 400 that names `param`.
def assert_rejected(api_client, params: dict, param: str) -> None:
    response = api_client.get(LIST_URL, params)
    assert response.status_code == 400
    assert param in response.json()


# --- status / priority -----------------------------------------------------------------------


@pytest.fixture
def one_per_status() -> dict[str, Submission]:
    return {status.value: SubmissionFactory(status=status) for status in Submission.Status}


@pytest.mark.parametrize(
    ("status", "expected"),
    [
        ("new", {"new"}),
        ("new,in_review", {"new", "in_review"}),
        ("closed,lost", {"closed", "lost"}),
        ("", {"new", "in_review", "closed", "lost"}),
    ],
)
def test_status_filter(api_client, one_per_status, status, expected):
    ids = matching_ids(api_client, {"status": status})

    assert ids == {one_per_status[value].id for value in expected}


@pytest.mark.parametrize("status", ["bogus", "new,bogus", "NEW", "In Review"])
def test_status_filter_rejects_unknown_values(api_client, status):
    assert_rejected(api_client, {"status": status}, "status")


def test_priority_filter(api_client):
    high = SubmissionFactory(priority=Submission.Priority.HIGH)
    medium = SubmissionFactory(priority=Submission.Priority.MEDIUM)
    SubmissionFactory(priority=Submission.Priority.LOW)

    assert matching_ids(api_client, {"priority": "high,medium"}) == {high.id, medium.id}


def test_priority_filter_rejects_unknown_values(api_client):
    assert_rejected(api_client, {"priority": "urgent"}, "priority")


# --- brokerId --------------------------------------------------------------------------------


def test_broker_filter(api_client):
    broker = BrokerFactory()
    from_broker = SubmissionFactory(broker=broker)
    SubmissionFactory()

    assert matching_ids(api_client, {"brokerId": broker.id}) == {from_broker.id}


def test_unknown_broker_matches_nothing(api_client):
    SubmissionFactory()

    assert matching_ids(api_client, {"brokerId": 999999}) == set()


@pytest.mark.parametrize("broker_id", ["abc", "1.5"])
def test_broker_filter_rejects_non_integers(api_client, broker_id):
    assert_rejected(api_client, {"brokerId": broker_id}, "brokerId")


# --- companySearch ---------------------------------------------------------------------------


@pytest.fixture
def companies() -> dict[str, Submission]:
    return {
        "acme": SubmissionFactory(company=CompanyFactory(legal_name="Acme Logistics LLC")),
        "zenith": SubmissionFactory(company=CompanyFactory(legal_name="Zenith Freight Inc")),
    }


@pytest.mark.parametrize(
    ("search", "expected"),
    [
        ("acme", {"acme"}),
        ("LOGISTICS", {"acme"}),
        ("  freight  ", {"zenith"}),
        ("   ", {"acme", "zenith"}),
        ("Globex", set()),
    ],
    ids=["prefix", "case-insensitive", "trimmed", "blank-is-ignored", "no-match"],
)
def test_company_search(api_client, companies, search, expected):
    ids = matching_ids(api_client, {"companySearch": search})

    assert ids == {companies[key].id for key in expected}


def test_company_search_rejects_overlong_input(api_client):
    assert_rejected(api_client, {"companySearch": "x" * 256}, "companySearch")


# --- createdFrom / createdTo -----------------------------------------------------------------


# Submissions at the edges of 2026-09-10 (UTC).
@pytest.fixture
def around_september_10() -> dict[str, Submission]:
    moments = {
        "sep09_last_second": datetime.datetime(2026, 9, 9, 23, 59, 59, tzinfo=UTC),
        "sep10_midnight": datetime.datetime(2026, 9, 10, 0, 0, 0, tzinfo=UTC),
        "sep10_last_instant": datetime.datetime(2026, 9, 10, 23, 59, 59, 999999, tzinfo=UTC),
        "sep11_midnight": datetime.datetime(2026, 9, 11, 0, 0, 0, tzinfo=UTC),
    }
    return {key: SubmissionFactory(created_at=moment) for key, moment in moments.items()}


@pytest.mark.parametrize(
    ("params", "expected"),
    [
        (
            {"createdFrom": "2026-09-10"},
            {"sep10_midnight", "sep10_last_instant", "sep11_midnight"},
        ),
        (
            {"createdTo": "2026-09-10"},
            {"sep09_last_second", "sep10_midnight", "sep10_last_instant"},
        ),
        (
            {"createdFrom": "2026-09-10", "createdTo": "2026-09-10"},
            {"sep10_midnight", "sep10_last_instant"},
        ),
        (
            {"createdTo": "9999-12-31"},
            {"sep09_last_second", "sep10_midnight", "sep10_last_instant", "sep11_midnight"},
        ),
    ],
    ids=["from-is-inclusive", "to-is-inclusive", "single-day", "far-future-to"],
)
def test_created_date_range(api_client, around_september_10, params, expected):
    ids = matching_ids(api_client, params)

    assert ids == {around_september_10[key].id for key in expected}


@pytest.mark.parametrize(
    ("params", "param"),
    [
        ({"createdFrom": "2026-13-01"}, "createdFrom"),
        ({"createdTo": "yesterday"}, "createdTo"),
        ({"createdFrom": "2026-09-11", "createdTo": "2026-09-10"}, "createdTo"),
    ],
    ids=["impossible-date", "not-a-date", "inverted-range"],
)
def test_created_date_range_rejects_bad_input(api_client, params, param):
    assert_rejected(api_client, params, param)


# --- hasDocuments / hasNotes -----------------------------------------------------------------


@pytest.fixture
def by_activity() -> dict[str, Submission]:
    both = SubmissionFactory()
    DocumentFactory(submission=both)
    NoteFactory(submission=both)
    documents_only = DocumentFactory().submission
    notes_only = NoteFactory().submission
    neither = SubmissionFactory()
    return {
        "both": both,
        "documents_only": documents_only,
        "notes_only": notes_only,
        "neither": neither,
    }


@pytest.mark.parametrize(
    ("params", "expected"),
    [
        ({"hasDocuments": "true"}, {"both", "documents_only"}),
        ({"hasDocuments": "false"}, {"notes_only", "neither"}),
        ({"hasNotes": "1"}, {"both", "notes_only"}),
        ({"hasNotes": "0"}, {"documents_only", "neither"}),
        ({"hasDocuments": "True", "hasNotes": "FALSE"}, {"documents_only"}),
    ],
)
def test_presence_filters(api_client, by_activity, params, expected):
    ids = matching_ids(api_client, params)

    assert ids == {by_activity[key].id for key in expected}


@pytest.mark.parametrize("value", ["yes", "maybe", "2"])
def test_presence_filters_reject_non_booleans(api_client, value):
    assert_rejected(api_client, {"hasNotes": value}, "hasNotes")


# --- combined --------------------------------------------------------------------------------


def test_filters_combine_with_and(api_client):
    broker = BrokerFactory()
    match = SubmissionFactory(
        broker=broker,
        status=Submission.Status.NEW,
        company=CompanyFactory(legal_name="Acme One"),
    )
    SubmissionFactory(  # wrong status
        broker=broker,
        status=Submission.Status.CLOSED,
        company=CompanyFactory(legal_name="Acme Two"),
    )
    SubmissionFactory(  # wrong broker
        status=Submission.Status.NEW,
        company=CompanyFactory(legal_name="Acme Three"),
    )
    SubmissionFactory(  # wrong company
        broker=broker,
        status=Submission.Status.NEW,
        company=CompanyFactory(legal_name="Globex"),
    )

    response = api_client.get(
        LIST_URL, {"status": "new", "brokerId": broker.id, "companySearch": "acme"}
    )

    assert result_ids(response) == [match.id]
    assert response.json()["count"] == 1


# --- ordering --------------------------------------------------------------------------------


@pytest.fixture
def sortable() -> dict[str, Submission]:
    return {
        "low_bravo_oldest": SubmissionFactory(
            priority=Submission.Priority.LOW,
            company=CompanyFactory(legal_name="Bravo"),
            created_at=BASE_TIME,
        ),
        "high_alpha_middle": SubmissionFactory(
            priority=Submission.Priority.HIGH,
            company=CompanyFactory(legal_name="Alpha"),
            created_at=BASE_TIME + timedelta(days=1),
        ),
        "medium_charlie_newest": SubmissionFactory(
            priority=Submission.Priority.MEDIUM,
            company=CompanyFactory(legal_name="Charlie"),
            created_at=BASE_TIME + timedelta(days=2),
        ),
    }


@pytest.mark.parametrize(
    ("ordering", "expected"),
    [
        ("", ["medium_charlie_newest", "high_alpha_middle", "low_bravo_oldest"]),
        ("createdAt", ["low_bravo_oldest", "high_alpha_middle", "medium_charlie_newest"]),
        ("-createdAt", ["medium_charlie_newest", "high_alpha_middle", "low_bravo_oldest"]),
        ("updatedAt", ["low_bravo_oldest", "high_alpha_middle", "medium_charlie_newest"]),
        ("priority", ["low_bravo_oldest", "medium_charlie_newest", "high_alpha_middle"]),
        ("-priority", ["high_alpha_middle", "medium_charlie_newest", "low_bravo_oldest"]),
        ("company", ["high_alpha_middle", "low_bravo_oldest", "medium_charlie_newest"]),
        ("-company", ["medium_charlie_newest", "low_bravo_oldest", "high_alpha_middle"]),
    ],
)
def test_ordering(api_client, sortable, ordering, expected):
    ids = listed_ids(api_client, {"ordering": ordering})

    assert ids == [sortable[key].id for key in expected]


def test_ordering_by_several_keys(api_client):
    high_bravo = SubmissionFactory(
        priority=Submission.Priority.HIGH, company=CompanyFactory(legal_name="Bravo")
    )
    high_alpha = SubmissionFactory(
        priority=Submission.Priority.HIGH, company=CompanyFactory(legal_name="Alpha")
    )
    low_alpha = SubmissionFactory(
        priority=Submission.Priority.LOW, company=CompanyFactory(legal_name="Alpha")
    )

    ids = listed_ids(api_client, {"ordering": "-priority,company"})

    assert ids == [high_alpha.id, high_bravo.id, low_alpha.id]


def test_ordering_ties_follow_the_id_in_the_same_direction(api_client):
    first, second = SubmissionFactory.create_batch(2, priority=Submission.Priority.HIGH)

    assert listed_ids(api_client, {"ordering": "priority"}) == [first.id, second.id]
    assert listed_ids(api_client, {"ordering": "-priority"}) == [second.id, first.id]


@pytest.mark.parametrize("ordering", ["bogus", "created_at", "-status"])
def test_ordering_rejects_unknown_keys(api_client, ordering):
    assert_rejected(api_client, {"ordering": ordering}, "ordering")
