# Plain helper functions and constants shared by the API tests. They live here rather than
# in conftest.py because pytest discourages importing from conftest modules.
import datetime

from rest_framework.response import Response

from submissions import models

# Fixed reference time for tests that depend on ordering or date ranges.
BASE_TIME = datetime.datetime(2026, 9, 1, 12, 0, tzinfo=datetime.UTC)


# Ids of the rows in a paginated list response, in the order the API returned them.
def result_ids(response: Response) -> list[int]:
    return [row["id"] for row in response.json()["results"]]


# A datetime as DRF renders it: ISO 8601, with UTC written as "Z".
def iso(value: datetime.datetime) -> str:
    return value.isoformat().replace("+00:00", "Z")


# Expected JSON for the parties nested in list rows and the detail payload, spelled out in
# camelCase so the tests pin the contract in frontend/lib/types.ts, not the serializer code.
def broker_json(broker: models.Broker) -> dict:
    return {
        "id": broker.id,
        "name": broker.name,
        "primaryContactEmail": broker.primary_contact_email,
    }


def company_json(company: models.Company) -> dict:
    return {
        "id": company.id,
        "legalName": company.legal_name,
        "industry": company.industry,
        "headquartersCity": company.headquarters_city,
    }


def team_member_json(member: models.TeamMember) -> dict:
    return {"id": member.id, "fullName": member.full_name, "email": member.email}
