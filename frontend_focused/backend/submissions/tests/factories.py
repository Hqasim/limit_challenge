# factory_boy factories that build valid, saved rows for every submissions model.
#
# Each test spells out only the fields it asserts on, e.g. SubmissionFactory(status="closed"),
# and the factory fills in the rest with Faker values. Parents (company, broker, owner,
# submission) are created through SubFactory unless the test passes one in.
#
# Fields the factories leave unset keep their model defaults: a submission is "new" with
# "medium" priority, and created_at is "now". Tests that depend on ordering or date filters
# pass created_at explicitly. Document.uploaded_at cannot be set (auto_now_add, see models.py).
import factory
from factory.django import DjangoModelFactory

from submissions import models


class BrokerFactory(DjangoModelFactory):
    class Meta:
        model = models.Broker

    name = factory.Faker("company")
    primary_contact_email = factory.Faker("company_email")


class CompanyFactory(DjangoModelFactory):
    class Meta:
        model = models.Company

    legal_name = factory.Faker("company")
    industry = factory.Faker(
        "random_element", elements=["Logistics", "Manufacturing", "Retail", "Healthcare"]
    )
    headquarters_city = factory.Faker("city")


# TeamMember.email is unique in the database, so it comes from a sequence, not from Faker.
class TeamMemberFactory(DjangoModelFactory):
    class Meta:
        model = models.TeamMember

    full_name = factory.Faker("name")
    email = factory.Sequence(lambda n: f"owner{n}@example.com")


class SubmissionFactory(DjangoModelFactory):
    class Meta:
        model = models.Submission

    company = factory.SubFactory(CompanyFactory)
    broker = factory.SubFactory(BrokerFactory)
    owner = factory.SubFactory(TeamMemberFactory)
    summary = factory.Faker("sentence")


class ContactFactory(DjangoModelFactory):
    class Meta:
        model = models.Contact

    submission = factory.SubFactory(SubmissionFactory)
    name = factory.Faker("name")
    role = factory.Faker("job")
    email = factory.Faker("email")
    phone = factory.Faker("phone_number")


class DocumentFactory(DjangoModelFactory):
    class Meta:
        model = models.Document

    submission = factory.SubFactory(SubmissionFactory)
    title = factory.Faker("catch_phrase")
    doc_type = factory.Faker(
        "random_element", elements=["Summary", "Spreadsheet", "Presentation", "Contract"]
    )
    file_url = factory.Faker("url")


class NoteFactory(DjangoModelFactory):
    class Meta:
        model = models.Note

    submission = factory.SubFactory(SubmissionFactory)
    author_name = factory.Faker("name")
    body = factory.Faker("paragraph", nb_sentences=3)
