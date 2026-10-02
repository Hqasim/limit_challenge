# Domain model for the Submission Tracker.
#
# A Submission is the central record: an opportunity a Broker sends in on behalf of a
# Company, assigned to an internal TeamMember (owner). Each submission has many Contacts,
# Documents and Notes hanging off it.
#
#   Broker -------------+                     +--< Contact
#   Company ------------+--< Submission ------+--< Document
#   TeamMember (owner) -+                     +--< Note
#
#   ("--<" = one-to-many; e.g. one Broker has many Submissions.)
from django.db import models
from django.utils import timezone


# External brokerage that submits opportunities. Feeds the "Broker" filter dropdown.
class Broker(models.Model):
    name = models.CharField(max_length=255)
    primary_contact_email = models.EmailField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.name


# The client business the submission is about. Target of the "companySearch" filter.
class Company(models.Model):
    legal_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255, blank=True)
    headquarters_city = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["legal_name"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.legal_name


# Internal employee who owns (is responsible for) a submission.
class TeamMember(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)

    class Meta:
        ordering = ["full_name"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.full_name


# The core record shown in the list and detail pages.
class Submission(models.Model):
    # Stored values ("in_review") are what the API returns and what ?status= expects;
    # the second element ("In Review") is the human-readable label.
    class Status(models.TextChoices):
        NEW = "new", "New"
        IN_REVIEW = "in_review", "In Review"
        CLOSED = "closed", "Closed"
        LOST = "lost", "Lost"

    class Priority(models.TextChoices):
        HIGH = "high", "High"
        MEDIUM = "medium", "Medium"
        LOW = "low", "Low"

    # Deleting a company deletes its submissions; brokers and owners cannot be deleted
    # while they still have submissions (PROTECT).
    company = models.ForeignKey(
        Company, on_delete=models.CASCADE, related_name="submissions"
    )
    broker = models.ForeignKey(
        Broker, on_delete=models.PROTECT, related_name="submissions"
    )
    owner = models.ForeignKey(
        TeamMember, on_delete=models.PROTECT, related_name="submissions"
    )
    status = models.CharField(max_length=32, choices=Status.choices, default=Status.NEW)
    priority = models.CharField(
        max_length=32, choices=Priority.choices, default=Priority.MEDIUM
    )
    summary = models.TextField(blank=True)
    # default (not auto_now_add) so the seed command can backdate submissions.
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.company} ({self.status})"


# A person at the company/broker to talk to about this submission.
class Contact(models.Model):
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="contacts"
    )
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=64, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.name


# A link to a supporting file (no file is stored; only its URL).
class Document(models.Model):
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="documents"
    )
    title = models.CharField(max_length=255)
    doc_type = models.CharField(max_length=255)
    # auto_now_add always overwrites this with the insert time, so the backdated value the
    # seed command passes is ignored: every seeded document shows the date the seed ran.
    uploaded_at = models.DateTimeField(auto_now_add=True)
    file_url = models.URLField(blank=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.title


# A free-text comment on a submission. The newest note is the "latest note preview" in the
# list endpoint; the full list (newest first) is the timeline on the detail page.
class Note(models.Model):
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="notes"
    )
    author_name = models.CharField(max_length=255)
    body = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.author_name} - {self.created_at:%Y-%m-%d}"
