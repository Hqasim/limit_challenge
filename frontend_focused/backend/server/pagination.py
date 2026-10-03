# Project-wide pagination for DRF list endpoints (DEFAULT_PAGINATION_CLASS in settings.py).
#
# Keeps DRF's PageNumberPagination contract, the ?page=N param and the
# {count, next, previous, results} envelope that PaginatedResponse<T> in
# frontend/lib/types.ts mirrors, and adds:
# - ?pageSize=N so a client can choose its page size (camelCase, like every other param);
# - max_page_size, which caps that choice so no request can ask for an unbounded page.
#   Larger values are clamped to the cap; invalid ones fall back to the default size.
# The default size comes from REST_FRAMEWORK['PAGE_SIZE'].
from rest_framework.pagination import PageNumberPagination


class StandardPageNumberPagination(PageNumberPagination):
    page_size_query_param = 'pageSize'
    max_page_size = 100
