# Serializers for the submissions API: they turn model instances into the JSON shapes that
# frontend/lib/types.ts describes.
#
# - Read-only, with every field listed explicitly (never "__all__"), so a new model column is
#   never exposed by accident.
# - They only read data the querysets in querysets.py have already loaded (joins,
#   annotations, prefetches), so serializing a page runs no extra queries.
# - Keys are snake_case here; CamelCaseJSONRenderer turns them into camelCase on the way out
#   (document_count -> documentCount).
from django.utils.text import Truncator
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from submissions import models

# Maximum length of Note bodies in list rows (latestNote.bodyPreview), ellipsis included.
NOTE_PREVIEW_LENGTH = 200


# Parties a submission links to, nested in both list rows and the detail payload.
# BrokerSerializer also backs GET /api/brokers/.
class BrokerSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Broker
        fields = ["id", "name", "primary_contact_email"]
        read_only_fields = fields


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Company
        fields = ["id", "legal_name", "industry", "headquarters_city"]
        read_only_fields = fields


class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.TeamMember
        fields = ["id", "full_name", "email"]
        read_only_fields = fields


# Related records, returned in full by the detail endpoint.
class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Contact
        fields = ["id", "name", "role", "email", "phone"]
        read_only_fields = fields


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Document
        fields = ["id", "title", "doc_type", "uploaded_at", "file_url"]
        read_only_fields = fields


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Note
        fields = ["id", "author_name", "body", "created_at"]
        read_only_fields = fields


# The newest note as shown in a list row: author, date and the start of the body. The body is
# cut to NOTE_PREVIEW_LENGTH characters and ends with "…" only when it was actually cut.
class NotePreviewSerializer(serializers.ModelSerializer):
    body_preview = serializers.SerializerMethodField()

    class Meta:
        model = models.Note
        fields = ["author_name", "body_preview", "created_at"]
        read_only_fields = fields

    def get_body_preview(self, note: models.Note) -> str:
        return Truncator(note.body).chars(NOTE_PREVIEW_LENGTH)


# Fields shared by list rows and the detail payload: the submission itself plus its broker,
# company and owner (loaded by SubmissionQuerySet.with_parties()).
class SubmissionBaseSerializer(serializers.ModelSerializer):
    broker = BrokerSerializer(read_only=True)
    company = CompanySerializer(read_only=True)
    owner = TeamMemberSerializer(read_only=True)

    class Meta:
        model = models.Submission
        fields = [
            "id",
            "status",
            "priority",
            "summary",
            "created_at",
            "updated_at",
            "broker",
            "company",
            "owner",
        ]
        read_only_fields = fields


# One row of GET /api/submissions/ (SubmissionListItem). Requires a queryset built with
# Submission.objects.for_list(), which provides document_count, note_count and latest_notes.
class SubmissionListSerializer(SubmissionBaseSerializer):
    document_count = serializers.IntegerField(read_only=True)
    note_count = serializers.IntegerField(read_only=True)
    latest_note = serializers.SerializerMethodField()

    class Meta(SubmissionBaseSerializer.Meta):
        fields = [
            *SubmissionBaseSerializer.Meta.fields,
            "document_count",
            "note_count",
            "latest_note",
        ]

    @extend_schema_field(NotePreviewSerializer(allow_null=True))
    def get_latest_note(self, submission: models.Submission) -> dict | None:
        latest_notes = submission.latest_notes
        return NotePreviewSerializer(latest_notes[0]).data if latest_notes else None


# GET /api/submissions/<id>/ (SubmissionDetail): the shared fields plus every contact,
# document and note. Requires Submission.objects.for_detail(), which prefetches the lists.
class SubmissionDetailSerializer(SubmissionBaseSerializer):
    contacts = ContactSerializer(many=True, read_only=True)
    documents = DocumentSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)

    class Meta(SubmissionBaseSerializer.Meta):
        fields = [*SubmissionBaseSerializer.Meta.fields, "contacts", "documents", "notes"]
