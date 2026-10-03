# GET /api/submissions/<id>/: the full submission with its contacts, documents and notes.
from datetime import timedelta

import pytest

from submissions.models import Submission
from submissions.tests.factories import (
    ContactFactory,
    DocumentFactory,
    NoteFactory,
    SubmissionFactory,
)
from submissions.tests.helpers import (
    BASE_TIME,
    broker_json,
    company_json,
    iso,
    team_member_json,
)

pytestmark = pytest.mark.django_db


def detail_url(submission_id: int | str) -> str:
    return f"/api/submissions/{submission_id}/"


def test_detail_matches_the_frontend_contract(api_client):
    submission = SubmissionFactory(
        status=Submission.Status.CLOSED,
        priority=Submission.Priority.LOW,
        summary="Cargo coverage",
        created_at=BASE_TIME,
    )
    contact = ContactFactory(submission=submission)
    document = DocumentFactory(submission=submission)
    older_note = NoteFactory(submission=submission, created_at=BASE_TIME + timedelta(hours=1))
    newer_note = NoteFactory(submission=submission, created_at=BASE_TIME + timedelta(hours=2))

    response = api_client.get(detail_url(submission.id))

    assert response.status_code == 200
    assert response.json() == {
        "id": submission.id,
        "status": "closed",
        "priority": "low",
        "summary": "Cargo coverage",
        "createdAt": iso(BASE_TIME),
        "updatedAt": iso(submission.updated_at),
        "broker": broker_json(submission.broker),
        "company": company_json(submission.company),
        "owner": team_member_json(submission.owner),
        "contacts": [
            {
                "id": contact.id,
                "name": contact.name,
                "role": contact.role,
                "email": contact.email,
                "phone": contact.phone,
            }
        ],
        "documents": [
            {
                "id": document.id,
                "title": document.title,
                "docType": document.doc_type,
                "uploadedAt": iso(document.uploaded_at),
                "fileUrl": document.file_url,
            }
        ],
        "notes": [
            {
                "id": note.id,
                "authorName": note.author_name,
                "body": note.body,
                "createdAt": iso(note.created_at),
            }
            for note in (newer_note, older_note)
        ],
    }


def test_detail_query_count_is_fixed(api_client, django_assert_num_queries):
    submission = SubmissionFactory()
    ContactFactory.create_batch(3, submission=submission)
    DocumentFactory.create_batch(3, submission=submission)
    NoteFactory.create_batch(3, submission=submission)

    # 1 SELECT for the submission and its parties + 1 per related list.
    with django_assert_num_queries(4):
        response = api_client.get(detail_url(submission.id))

    assert response.status_code == 200


@pytest.mark.parametrize("submission_id", ["999999", "abc", "1.5"])
def test_unknown_or_malformed_id_is_not_found(api_client, submission_id):
    SubmissionFactory()

    response = api_client.get(detail_url(submission_id))

    assert response.status_code == 404


def test_list_query_params_do_not_affect_the_detail_view(api_client):
    submission = SubmissionFactory(status=Submission.Status.NEW)
    # One param that would exclude this submission, one that would be rejected on the list.
    list_params = {"status": "closed", "hasNotes": "maybe"}

    response = api_client.get(detail_url(submission.id), list_params)

    assert response.status_code == 200
    assert response.json()["id"] == submission.id
