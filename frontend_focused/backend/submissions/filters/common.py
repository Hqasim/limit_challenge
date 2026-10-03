# Reusable django-filter building blocks for the API's FilterSets.
#
# Each one tightens a django-filter default so that bad input is rejected with a 400 that
# names the param, instead of being silently ignored or matching nothing.
import django_filters
from django import forms
from django.core.exceptions import ValidationError
from django.db.models import QuerySet
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field


# Whole numbers only. NumberFilter accepts decimals ("1.5"), which can never match an integer
# key; this rejects them, like any other non-integer, with a 400.
@extend_schema_field(OpenApiTypes.INT)
class IntegerFilter(django_filters.NumberFilter):
    field_class = forms.IntegerField


# Comma-separated choices: ?status=new,in_review becomes status IN ('new', 'in_review'), and a
# single value works too. Every value is checked against `choices`, so a typo is a 400.
class ChoiceInFilter(django_filters.BaseInFilter, django_filters.ChoiceFilter):
    pass


# A form field for "true"/"false" (or "1"/"0") that rejects anything else with a 400.
class StrictBooleanField(forms.Field):
    TRUE_VALUES = {"true", "1"}
    FALSE_VALUES = {"false", "0"}

    def to_python(self, value: object) -> bool | None:
        if value in self.empty_values:
            return None
        normalized = str(value).strip().lower()
        if normalized in self.TRUE_VALUES:
            return True
        if normalized in self.FALSE_VALUES:
            return False
        raise ValidationError("Must be true or false.", code="invalid")


# Boolean filter on top of StrictBooleanField. django-filter's own BooleanFilter (in its DRF
# variant) maps unknown values such as "yes" or "maybe" to "not set" and quietly drops the
# filter.
class StrictBooleanFilter(django_filters.BooleanFilter):
    field_class = StrictBooleanField


# OrderingFilter that always ends with the primary key, in the same direction as the first
# sort key. Rows with equal sort values (same priority, same company) then keep a stable
# order, so pagination never repeats or skips one between pages.
class StableOrderingFilter(django_filters.OrderingFilter):
    def filter(self, qs: QuerySet, value: list[str] | None) -> QuerySet:
        qs = super().filter(qs, value)
        if not value:
            return qs
        ordering = list(qs.query.order_by)
        tie_breaker = "-pk" if ordering[0].startswith("-") else "pk"
        return qs.order_by(*ordering, tie_breaker)
