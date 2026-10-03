# GET /api/submissions/: row shape, pagination, ordering, list aggregates and query count.
# Query-param filters are covered in test_submission_filters.py.
from datetime import timedelta

import pytest

from submissions.models import Submission
from submissions.serializers import NOTE_PREVIEW_LENGTH
from submissions.tests.factories import DocumentFactory, NoteFactory, SubmissionFactory
from submissions.tests.helpers import (
    BASE_TIME,
    broker_json,
    company_json,
    iso,
    result_ids,
    team_member_json,
)

pytestmark = pytest.mark.django_db

LIST_URL = "/api/submissions/"


def test_row_matches_the_frontend_contract(api_client):
    submission = SubmissionFactory(
        status=Submission.Status.IN_REVIEW,
        priority=Submission.Priority.HIGH,
        summary="Fleet policy renewal",
        created_at=BASE_TIME,
    )
    DocumentFactory.create_batch(2, submission=submission)
    note = NoteFactory(
        submission=submission,
        author_name="Ada Lovelace",
        body="Called the broker.",
        created_at=BASE_TIME + timedelta(hours=3),
    )

    response = api_client.get(LIST_URL)

    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 1
    assert body["next"] is None
    assert body["previous"] is None
    assert body["results"] == [
        {
            "id": submission.id,
            "status": "in_review",
            "priority": "high",
            "summary": "Fleet policy renewal",
            "createdAt": iso(BASE_TIME),
            "updatedAt": iso(submission.updated_at),
            "broker": broker_json(submission.broker),
            "company": company_json(submission.company),
            "owner": team_member_json(submission.owner),
            "documentCount": 2,
            "noteCount": 1,
            "latestNote": {
                "authorName": "Ada Lovelace",
                "bodyPreview": "Called the broker.",
                "createdAt": iso(note.created_at),
            },
        }
    ]


def test_submission_without_activity_has_zero_counts_and_no_latest_note(api_client):
    SubmissionFactory()

    row = api_client.get(LIST_URL).json()["results"][0]

    assert (row["documentCount"], row["noteCount"], row["latestNote"]) == (0, 0, None)


def test_latest_note_preview_is_truncated_with_an_ellipsis(api_client):
    NoteFactory(body="x" * (NOTE_PREVIEW_LENGTH * 2))

    preview = api_client.get(LIST_URL).json()["results"][0]["latestNote"]["bodyPreview"]

    assert len(preview) == NOTE_PREVIEW_LENGTH
    assert preview == "x" * (NOTE_PREVIEW_LENGTH - 1) + "…"


def test_latest_note_preview_keeps_a_body_that_fits(api_client):
    body = "y" * NOTE_PREVIEW_LENGTH
    NoteFactory(body=body)

    preview = api_client.get(LIST_URL).json()["results"][0]["latestNote"]["bodyPreview"]

    assert preview == body


def test_rows_are_newest_first_with_a_stable_order_for_ties(api_client):
    oldest = SubmissionFactory(created_at=BASE_TIME)
    tied_first = SubmissionFactory(created_at=BASE_TIME + timedelta(days=1))
    tied_second = SubmissionFactory(created_at=BASE_TIME + timedelta(days=1))

    response = api_client.get(LIST_URL)

    assert result_ids(response) == [tied_second.id, tied_first.id, oldest.id]


def test_pages_hold_ten_rows_and_link_to_each_other(api_client):
    SubmissionFactory.create_batch(12)

    first = api_client.get(LIST_URL)
    second = api_client.get(first.json()["next"])

    assert first.json()["count"] == 12
    assert len(result_ids(first)) == 10
    assert first.json()["previous"] is None
    assert first.json()["next"].endswith("/api/submissions/?page=2")
    assert len(result_ids(second)) == 2
    assert second.json()["next"] is None
    # Every row appears exactly once across the two pages.
    assert len(set(result_ids(first)) | set(result_ids(second))) == 12


@pytest.mark.parametrize(
    ("page_size", "expected_rows"),
    [("5", 5), ("12", 12), ("0", 10), ("-3", 10), ("abc", 10)],
    ids=["custom", "larger-than-default", "zero", "negative", "not-a-number"],
)
def test_page_size_param_falls_back_to_the_default_when_invalid(
    api_client, page_size, expected_rows
):
    SubmissionFactory.create_batch(12)

    response = api_client.get(LIST_URL, {"pageSize": page_size})

    assert len(result_ids(response)) == expected_rows


def test_page_size_is_capped_at_one_hundred(api_client):
    first = SubmissionFactory()
    SubmissionFactory.create_batch(
        100, company=first.company, broker=first.broker, owner=first.owner
    )

    response = api_client.get(LIST_URL, {"pageSize": 1000})

    assert response.json()["count"] == 101
    assert len(result_ids(response)) == 100


@pytest.mark.parametrize("page", ["2", "0", "abc"])
def test_page_out_of_range_or_invalid_is_not_found(api_client, page):
    SubmissionFactory()

    response = api_client.get(LIST_URL, {"page": page})

    assert response.status_code == 404


@pytest.mark.parametrize("row_count", [1, 15])
def test_query_count_does_not_grow_with_rows(api_client, django_assert_num_queries, row_count):
    for submission in SubmissionFactory.create_batch(row_count):
        DocumentFactory.create_batch(2, submission=submission)
        NoteFactory.create_batch(2, submission=submission)

    # COUNT for pagination + 1 SELECT for the page + 1 for the newest notes.
    with django_assert_num_queries(3):
        response = api_client.get(LIST_URL)

    assert response.status_code == 200
