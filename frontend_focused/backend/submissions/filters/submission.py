# django-filter FilterSet for GET /api/submissions/: turns the list page's query params into
# queryset predicates. Every param is optional; given params combine with AND. Invalid input
# is rejected with a 400 whose body names the param, e.g. {"status": ["Select a valid choice."]}.
#
#   status          one or more statuses, comma-separated     ?status=new,in_review
#   priority        one or more priorities, comma-separated   ?priority=high
#   brokerId        broker id                                 ?brokerId=3
#   companySearch   part of the company's legal name          ?companySearch=acme
#   createdFrom     created on/after this day (inclusive)     ?createdFrom=2026-09-01
#   createdTo       created on/before this day (inclusive)    ?createdTo=2026-09-30
#   hasDocuments    has at least one document / none          ?hasDocuments=true
#   hasNotes        has at least one note / none              ?hasNotes=false
#   ordering        sort keys, "-" for descending             ?ordering=-priority,company
#
# Note: DRF's camelCase settings convert JSON bodies, not query params, so the filters are
# declared under their public camelCase names. The OpenAPI schema then documents exactly
# what a client sends.
import datetime

import django_filters
from django import forms
from django.db.models import QuerySet
from django.utils import timezone
from django_filters.rest_framework import FilterSet

from submissions import models
from submissions.filters.common import (
    ChoiceInFilter,
    IntegerFilter,
    StableOrderingFilter,
    StrictBooleanFilter,
)
from submissions.querysets import related_exists


# Cross-field validation: an inverted date range is a client mistake, so it gets a 400 rather
# than an always-empty result.
class SubmissionFilterForm(forms.Form):
    def clean(self) -> dict:
        cleaned_data = super().clean()
        created_from = cleaned_data.get("createdFrom")
        created_to = cleaned_data.get("createdTo")
        if created_from and created_to and created_from > created_to:
            self.add_error("createdTo", "Must be the same as or later than createdFrom.")
        return cleaned_data


class SubmissionFilterSet(FilterSet):
    status = ChoiceInFilter(
        choices=models.Submission.Status.choices,
        help_text="One or more statuses, comma-separated (e.g. new,in_review).",
    )
    priority = ChoiceInFilter(
        choices=models.Submission.Priority.choices,
        help_text="One or more priorities, comma-separated (e.g. high,medium).",
    )
    brokerId = IntegerFilter(
        field_name="broker_id",
        help_text="Only submissions sent in by this broker. An unknown id matches nothing.",
    )
    companySearch = django_filters.CharFilter(
        method="filter_company_search",
        max_length=255,
        help_text="Case-insensitive match on part of the company's legal name.",
    )
    createdFrom = django_filters.DateFilter(
        method="filter_created_from",
        help_text="Created on or after this day (YYYY-MM-DD, inclusive, UTC).",
    )
    createdTo = django_filters.DateFilter(
        method="filter_created_to",
        help_text="Created on or before this day (YYYY-MM-DD, inclusive, UTC).",
    )
    hasDocuments = StrictBooleanFilter(
        method="filter_has_documents",
        help_text="true: at least one document; false: no documents.",
    )
    hasNotes = StrictBooleanFilter(
        method="filter_has_notes",
        help_text="true: at least one note; false: no notes.",
    )
    # Public sort keys mapped to queryset fields. "priority" sorts by urgency
    # (low < medium < high, see SubmissionQuerySet.with_priority_rank), not alphabetically.
    ordering = StableOrderingFilter(
        fields=(
            ("created_at", "createdAt"),
            ("updated_at", "updatedAt"),
            ("priority_rank", "priority"),
            ("company__legal_name", "company"),
        ),
        field_labels={
            "created_at": "Created at",
            "updated_at": "Updated at",
            "priority_rank": "Priority",
            "company__legal_name": "Company legal name",
        },
        help_text=(
            "Comma-separated sort keys; prefix with - for descending (e.g. -priority,company). "
            "priority sorts by urgency (low < medium < high). Default: -createdAt (newest first)."
        ),
    )

    class Meta:
        model = models.Submission
        fields = []  # Every filter is declared explicitly above.
        form = SubmissionFilterForm

    def filter_company_search(self, queryset: QuerySet, name: str, value: str) -> QuerySet:
        return queryset.filter(company__legal_name__icontains=value)

    # Date filters compare against the start of a day as a half-open range, rather than using
    # created_at__date, so the database can still use an index on created_at.
    def filter_created_from(self, queryset: QuerySet, name: str, value: datetime.date) -> QuerySet:
        return queryset.filter(created_at__gte=_start_of_day(value))

    def filter_created_to(self, queryset: QuerySet, name: str, value: datetime.date) -> QuerySet:
        if value == datetime.date.max:  # No next day to stop before; nothing to exclude.
            return queryset
        return queryset.filter(created_at__lt=_start_of_day(value + datetime.timedelta(days=1)))

    def filter_has_documents(self, queryset: QuerySet, name: str, value: bool) -> QuerySet:
        return _filter_by_presence(queryset, "documents", value)

    def filter_has_notes(self, queryset: QuerySet, name: str, value: bool) -> QuerySet:
        return _filter_by_presence(queryset, "notes", value)


# Midnight at the start of `day` in the active time zone (TIME_ZONE, UTC).
def _start_of_day(day: datetime.date) -> datetime.datetime:
    return timezone.make_aware(datetime.datetime.combine(day, datetime.time.min))


# Keeps rows that have (present=True) or lack (present=False) related rows of `relation`.
def _filter_by_presence(queryset: QuerySet, relation: str, present: bool) -> QuerySet:
    exists = related_exists(queryset.model, relation)
    return queryset.filter(exists if present else ~exists)
