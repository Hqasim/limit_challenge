# django-filter FilterSet for the submissions list endpoint. Intentionally empty in this
# version of the challenge.
#
# It maps the list page's query params (?status=, ?brokerId=, ?companySearch=, and optional
# extras like createdFrom/createdTo/hasDocuments/hasNotes) onto Submission queryset lookups.
# Note: DRF camelCase settings convert JSON bodies, not query params, so brokerId and
# companySearch arrive camelCased and must be declared under those names.
