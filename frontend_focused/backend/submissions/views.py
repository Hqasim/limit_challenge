# API views for the submissions app. Intentionally empty in this version of the challenge.
#
# The frontend expects three read-only endpoints (see the root README "API Requirements"):
#   GET /api/submissions/       paginated list + filters (status, brokerId, companySearch, ...)
#   GET /api/submissions/<id>/  one submission with its contacts, documents and notes
#   GET /api/brokers/           broker options for the filter dropdown
# Viewsets defined here must also be registered on the router in server/urls.py.
