# SubmissionQuerySet (querysets.py): the query shapes behind the list and detail endpoints.
from datetime import timedelta

import pytest

from submissions.models import Submission
from submissions.querysets import related_count
from submissions.tests.factories import (
    ContactFactory,
    DocumentFactory,
    NoteFactory,
    SubmissionFactory,
)
from submissions.tests.helpers import BASE_TIME

pytestmark = pytest.mark.django_db


def test_counts_each_relation_independently():
    busy = SubmissionFactory()
    DocumentFactory.create_batch(2, submission=busy)
    NoteFactory.create_batch(3, submission=busy)
    quiet = SubmissionFactory()

    counts = {s.id: (s.document_count, s.note_count) for s in Submission.objects.for_list()}

    # 2 and 3, not 6 and 6: the counts must not multiply each other's rows.
    assert counts == {busy.id: (2, 3), quiet.id: (0, 0)}


def test_latest_note_is_the_newest_by_created_at():
    submission = SubmissionFactory()
    NoteFactory(submission=submission, created_at=BASE_TIME)
    newest = NoteFactory(submission=submission, created_at=BASE_TIME + timedelta(hours=2))
    NoteFactory(submission=submission, created_at=BASE_TIME + timedelta(hours=1))

    row = Submission.objects.for_list().get()

    assert row.latest_notes == [newest]


def test_latest_note_tie_goes_to_the_note_inserted_last():
    submission = SubmissionFactory()
    NoteFactory(submission=submission, created_at=BASE_TIME)
    inserted_last = NoteFactory(submission=submission, created_at=BASE_TIME)

    row = Submission.objects.for_list().get()

    assert row.latest_notes == [inserted_last]


def test_submission_without_notes_has_no_latest_note():
    SubmissionFactory()

    row = Submission.objects.for_list().get()

    assert row.latest_notes == []


def test_priority_rank_sorts_by_urgency_not_alphabetically():
    high = SubmissionFactory(priority=Submission.Priority.HIGH)
    low = SubmissionFactory(priority=Submission.Priority.LOW)
    medium = SubmissionFactory(priority=Submission.Priority.MEDIUM)

    ranked = Submission.objects.with_priority_rank().order_by("priority_rank")

    assert list(ranked) == [low, medium, high]


def test_for_list_is_newest_first_with_id_as_tie_breaker():
    oldest = SubmissionFactory(created_at=BASE_TIME)
    tied_first = SubmissionFactory(created_at=BASE_TIME + timedelta(days=1))
    tied_second = SubmissionFactory(created_at=BASE_TIME + timedelta(days=1))

    assert list(Submission.objects.for_list()) == [tied_second, tied_first, oldest]


@pytest.mark.parametrize("row_count", [1, 15])
def test_for_list_query_count_does_not_grow_with_rows(row_count, django_assert_num_queries):
    for submission in SubmissionFactory.create_batch(row_count):
        DocumentFactory.create_batch(2, submission=submission)
        NoteFactory.create_batch(2, submission=submission)

    # 1 SELECT for the rows with their parties and counts + 1 for the newest notes.
    with django_assert_num_queries(2):
        for row in Submission.objects.for_list():
            assert row.broker.name and row.company.legal_name and row.owner.full_name
            assert row.document_count == 2 and row.note_count == 2
            assert len(row.latest_notes) == 1


def test_for_detail_loads_related_records_in_stable_order(django_assert_num_queries):
    submission = SubmissionFactory()
    contact_b = ContactFactory(submission=submission, name="Bea")
    contact_a1 = ContactFactory(submission=submission, name="Ada")
    contact_a2 = ContactFactory(submission=submission, name="Ada")
    first_document, second_document = DocumentFactory.create_batch(2, submission=submission)
    older_note = NoteFactory(submission=submission, created_at=BASE_TIME)
    tied_note_1 = NoteFactory(submission=submission, created_at=BASE_TIME + timedelta(hours=1))
    tied_note_2 = NoteFactory(submission=submission, created_at=BASE_TIME + timedelta(hours=1))

    # 1 SELECT for the submission and its parties + 1 per related list.
    with django_assert_num_queries(4):
        row = Submission.objects.for_detail().get(pk=submission.pk)
        assert row.broker.name and row.company.legal_name and row.owner.full_name
        contacts = list(row.contacts.all())
        documents = list(row.documents.all())
        notes = list(row.notes.all())

    assert contacts == [contact_a1, contact_a2, contact_b]
    assert documents == [second_document, first_document]
    assert notes == [tied_note_2, tied_note_1, older_note]


def test_related_count_rejects_a_forward_foreign_key():
    with pytest.raises(ValueError, match="not a reverse foreign key"):
        related_count(Submission, "broker")
