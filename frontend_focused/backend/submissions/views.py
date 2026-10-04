# API views for the submissions app: read-only viewsets, registered on the router in
# server/urls.py.
#
#   GET /api/submissions/       paginated list of submissions
#   GET /api/submissions/<id>/  one submission with its contacts, documents and notes
#   GET /api/brokers/           every broker, unpaginated (filter dropdown)
#   GET /api/brokers/<id>/      one broker
#
# Views only wire things together: query shapes live in querysets.py, query-param filters in
# filters/, the JSON shapes in serializers.py, and pagination in server/pagination.py. Write
# methods are not routed, so POST/PUT/PATCH/DELETE answer 405 Method Not Allowed.
#
# Class docstrings are shown in the browsable API; the extend_schema texts describe each
# operation in the OpenAPI schema and Swagger UI (/api/docs/).
from django.db.models import QuerySet
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import viewsets

from submissions import models, serializers
from submissions.filters import SubmissionFilterSet

INVALID_FILTER_RESPONSE = OpenApiResponse(
    description=(
        "A query param is invalid. The body maps each invalid param to its error messages, "
        'e.g. {"brokerId": ["Enter a whole number."]}.'
    )
)


@extend_schema_view(
    list=extend_schema(
        summary="List submissions",
        description=(
            "Paginated submissions, newest first. Each row embeds its broker, company and "
            "owner, the number of documents and notes, and a preview of the latest note. "
            "All filters are optional and combine with AND."
        ),
        responses={
            200: serializers.SubmissionListSerializer(many=True),
            400: INVALID_FILTER_RESPONSE,
        },
    ),
    retrieve=extend_schema(
        summary="Retrieve a submission",
        description=(
            "One submission with its broker, company and owner, plus every contact, document "
            "and note (contacts by name; documents and notes newest first)."
        ),
        responses={
            200: serializers.SubmissionDetailSerializer,
            404: OpenApiResponse(description="No submission has this id."),
        },
    ),
)
class SubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Broker-submitted opportunities, newest first.

    The list is paginated and returns each submission with its broker, company and owner,
    its document and note counts, and a preview of its latest note. The detail view returns
    the full submission with every contact, document and note.
    """

    filterset_class = SubmissionFilterSet

    # List rows need counts and the latest note; the detail needs every related record.
    def get_queryset(self) -> QuerySet:
        if self.action == "list":
            return models.Submission.objects.for_list()
        return models.Submission.objects.for_detail()

    # The serializer matching each queryset shape above.
    def get_serializer_class(self) -> type[serializers.SubmissionBaseSerializer]:
        if self.action == "list":
            return serializers.SubmissionListSerializer
        return serializers.SubmissionDetailSerializer

    # Filters decide which submissions belong in the list. A detail URL names one record, so
    # it resolves the same way whatever list params happen to be attached to it.
    def filter_queryset(self, queryset: QuerySet) -> QuerySet:
        if self.action != "list":
            return queryset
        return super().filter_queryset(queryset)


@extend_schema_view(
    list=extend_schema(
        summary="List brokers",
        description="Every broker, sorted by name, as a plain (unpaginated) array.",
    ),
    retrieve=extend_schema(
        summary="Retrieve a broker",
        responses={
            200: serializers.BrokerSerializer,
            404: OpenApiResponse(description="No broker has this id."),
        },
    ),
)
class BrokerViewSet(viewsets.ReadOnlyModelViewSet):
    """Brokerages that send in submissions, sorted by name."""

    queryset = models.Broker.objects.order_by("name", "id")
    serializer_class = serializers.BrokerSerializer
    # A small lookup set that the broker dropdown needs in full, so the list is a plain array
    # (Broker[] in frontend/lib/types.ts) rather than a paginated envelope. If brokers grow to
    # thousands, switch the dropdown to a paginated ?search= autocomplete instead.
    pagination_class = None
    filter_backends = []
