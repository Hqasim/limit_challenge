# Query building blocks for the submissions API.
#
# Every query-shaping decision (joins, aggregates, prefetches, computed sort keys) lives on
# SubmissionQuerySet, so views stay thin and each endpoint runs a fixed number of queries
# however many rows it returns:
#
#   Submission.objects.for_list()    1 SELECT for the rows (joins + count subqueries)
#                                    + 1 SELECT for the newest note of every row
#   Submission.objects.for_detail()  1 SELECT for the row + 1 each for contacts, documents, notes
#
# Related models are reached through Submission._meta instead of being imported, because
# models.py imports this module and a direct import back would be circular.
from typing import Self

from django.db import models
from django.db.models import Case, Count, Exists, OuterRef, Prefetch, Subquery, Value, When
from django.db.models.functions import Coalesce


# Resolves a reverse foreign key such as Submission "documents" to the related model
# (Document) and the name of its foreign key back to `model` ("submission").
def _reverse_fk(model: type[models.Model], relation: str) -> tuple[type[models.Model], str]:
    field = model._meta.get_field(relation)
    if not field.one_to_many:
        raise ValueError(f"{model.__name__}.{relation} is not a reverse foreign key.")
    return field.related_model, field.field.name


# Related rows that point at the outer query's current row (for use inside a subquery).
def _rows_of_outer_row(model: type[models.Model], relation: str) -> tuple[models.QuerySet, str]:
    related_model, fk_name = _reverse_fk(model, relation)
    return related_model._default_manager.filter(**{fk_name: OuterRef("pk")}), fk_name


# Correlated COUNT of a reverse foreign key, e.g. related_count(Submission, "documents").
#
# Count("documents") would JOIN and GROUP BY the outer query, and two such counts multiply
# each other's rows (documents x notes). A scalar subquery per count keeps the outer query a
# plain SELECT, so counts, filters and ordering compose freely. No related rows -> 0, not NULL.
def related_count(model: type[models.Model], relation: str) -> Coalesce:
    rows, fk_name = _rows_of_outer_row(model, relation)
    totals = rows.order_by().values(fk_name).annotate(total=Count("pk")).values("total")
    return Coalesce(Subquery(totals, output_field=models.IntegerField()), Value(0))


# EXISTS test for a reverse foreign key, e.g. "submissions that have at least one document".
# Negate it with ~ for "none". The database can stop at the first matching row.
def related_exists(model: type[models.Model], relation: str) -> Exists:
    rows, _ = _rows_of_outer_row(model, relation)
    return Exists(rows)


class SubmissionQuerySet(models.QuerySet):
    # Broker, company and owner come back in the same SELECT (all three foreign keys are
    # required, so these are inner joins) and cost no extra queries when serialized.
    def with_parties(self) -> Self:
        return self.select_related("broker", "company", "owner")

    # List-row aggregates: document_count, note_count and latest_notes (a list holding at most
    # the newest note). The newest notes of a whole page come from one query: Django applies
    # the [:1] slice per submission with a window function. Ties on created_at go to the
    # higher id, i.e. the note inserted last.
    def with_activity_summary(self) -> Self:
        note_model, _ = _reverse_fk(self.model, "notes")
        newest_note = Prefetch(
            "notes",
            queryset=note_model._default_manager.order_by("-created_at", "-id")[:1],
            to_attr="latest_notes",
        )
        return self.annotate(
            document_count=related_count(self.model, "documents"),
            note_count=related_count(self.model, "notes"),
        ).prefetch_related(newest_note)

    # priority_rank sorts priorities by meaning instead of alphabetically ("high" < "low" <
    # "medium"): low = 1, medium = 2, high = 3, so "-priority_rank" puts the most urgent first.
    def with_priority_rank(self) -> Self:
        priority = self.model.Priority
        return self.annotate(
            priority_rank=Case(
                When(priority=priority.LOW, then=Value(1)),
                When(priority=priority.MEDIUM, then=Value(2)),
                When(priority=priority.HIGH, then=Value(3)),
                output_field=models.IntegerField(),
            )
        )

    # Full related records for the detail page, one query per relation. Each list follows its
    # model's default ordering plus an id tie-breaker, so equal names or timestamps (every
    # seeded document shares one uploaded_at) still come back in a stable order.
    def with_related_records(self) -> Self:
        return self.prefetch_related(
            self._ordered_prefetch("contacts", "name", "id"),
            self._ordered_prefetch("documents", "-uploaded_at", "-id"),
            self._ordered_prefetch("notes", "-created_at", "-id"),
        )

    # Named query shapes used by the API views. A new consumer (an export, a report) should
    # reuse these rather than rebuild them.
    #
    # for_list: list rows, newest first. The id tie-breaker keeps rows that share a created_at
    # in a stable order, so pagination never repeats or skips one between pages.
    def for_list(self) -> Self:
        return (
            self.with_parties()
            .with_activity_summary()
            .with_priority_rank()
            .order_by("-created_at", "-id")
        )

    def for_detail(self) -> Self:
        return self.with_parties().with_related_records()

    def _ordered_prefetch(self, relation: str, *ordering: str) -> Prefetch:
        related_model, _ = _reverse_fk(self.model, relation)
        return Prefetch(relation, queryset=related_model._default_manager.order_by(*ordering))
