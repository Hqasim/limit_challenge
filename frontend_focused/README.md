# Submission Tracker Take-home Challenge

This repository hosts the boilerplate for the Submission Tracker assignment. It includes a Django +
Django REST Framework backend and a Next.js frontend scaffold so candidates can focus on API
design, relational data modelling, and product-focused UI work.

## Challenge Overview

Operations managers need a workspace to review broker-submitted opportunities. Build a lightweight
tool that lets them browse incoming submissions, filter by business context, and inspect full
details per record. Deliver a polished frontend experience backed by clean APIs.

### Goals

- **Backend:** Model the domain, expose list and detail endpoints, and support realistic filtering.
- **Frontend (higher weight):** Craft an intuitive list and detail experience with filters that map
  to query parameters. Focus on UX clarity, organization, and maintainability.

## Data Model

Required entities (already defined in `submissions/models.py`):

- `Broker`: name, contact email
- `Company`: legal name, industry, headquarters city
- `TeamMember`: internal owner for a submission
- `Submission`: links to company, broker, owner with status, priority, and summary
- `Contact`: primary contacts for a submission
- `Document`: references to supporting files
- `Note`: threaded context for collaboration

Seed data (~25 submissions with dozens of related contacts, documents, and notes) is available via
`python manage.py seed_submissions`. Re-run with `--force` to rebuild the dataset.

## API Requirements

- `GET /api/submissions/`
  - Returns paginated submissions with company, broker, owner, counts of related documents/notes,
    and the latest note preview.
  - Supports filters via query params. `status` is wired up; extend filters for `brokerId` and
    `companySearch` (plus optional extras like `createdFrom`, `createdTo`, `hasDocuments`, `hasNotes`).
- `GET /api/submissions/<id>/`
  - Returns the full submission plus related contacts, documents, and notes.
- `GET /api/brokers/`
  - Returns brokers for the frontend dropdown.

## Frontend Workspace Overview

The Next.js 16 + React 19 app in `frontend/` is pre-wired for this challenge. Material UI handles
layout, axios powers HTTP requests, and `@tanstack/react-query` is ready for data fetching. The list
and detail routes under `/submissions` are scaffolded so you can focus on API consumption and UX
polish.

### What is pre-built?

- Global providers supply Material UI theming and a shared React Query client.
- `/submissions` hosts the list view with filter inputs and hints about required query params.
- `/submissions/[id]` hosts the detail shell and links back to the list.
- Custom hooks in `lib/hooks` define how to fetch submissions and brokers. Each hook is disabled by
  default (`enabled: false`) so no network requests fire until you enable them.

### What you need to implement

- Wire the filter state to query parameters and React Query `queryFn`s.
- Render table/card layouts for the submission list along with loading, empty, and error states.
- Build the detail page sections for summary data, contacts, documents, and notes.
- Enable the queries and handle pagination or other UX you want to highlight.

## Project Structure

- `backend/`: Django project with REST API, seed command, and submission models.
- `frontend/`: Next.js app described above.

## Environment Variables

- Frontend requests default to `http://localhost:8000/api`. Override this by creating
  `frontend/.env.local` and setting `NEXT_PUBLIC_API_BASE_URL`.
- The backend reads its deployment settings from environment variables. The defaults suit local
  development, so nothing needs to be set to run it locally.

  | Variable | Default | Purpose |
  | --- | --- | --- |
  | `DJANGO_DEBUG` | `true` | `true`/`false` (also `1`/`0`, `yes`/`no`, `on`/`off`); any other value fails at startup |
  | `DJANGO_SECRET_KEY` | committed dev key | Required when `DJANGO_DEBUG=false`; the server refuses to start with the dev key |
  | `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,[::1]` | Comma-separated host names |
  | `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated browser origins allowed to call `/api/` |

## Getting Started

### Backend
Note: Recommended to use python version 3.13.16 for seamless install and resolution of current project's dependencies

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # optional: test tools (pytest, pytest-django, factory_boy)
python manage.py migrate
python manage.py seed_submissions  # optional but recommended
# add --force to rebuild the generated sample data
python manage.py runserver 0.0.0.0:8000
```

The API is then available at `http://localhost:8000/api/`, with interactive docs at
`http://localhost:8000/api/docs/` (see [API documentation](#api-documentation)).

### Backend tests

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest                                     # full suite
python -m pytest submissions/tests/test_submission_filters.py -v
python -m pytest -k query_count                      # the N+1 query-count guards
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # create if you want a custom API base
# NEXT_PUBLIC_API_BASE_URL defaults to http://localhost:8000/api
npm run dev
```

Visit `http://localhost:3000/submissions` to start building.

## Development Workflow

1. Start the Django server on port 8000 (`python manage.py runserver`).
2. Start the Next.js dev server on port 3000 (`npm run dev`).
3. Iterate on backend filters, serializers, and viewsets, then refresh the frontend to see updated
   data.
4. When ready, add README notes summarizing your approach, tradeoffs, and any stretch goals.

## Submission Instructions

- Provide a short README update summarizing approach, tradeoffs, and how to run the solution.
- Record and share a brief screen capture (max 2 minutes) demonstrating the frontend working end-to-end with the backend.
- Call out any stretch goals implemented.
- Automated tests are optional, but including targeted backend or frontend tests is a strong signal.

## Evaluation Rubric

- **Frontend (45%)** – UX clarity, filter UX tied to query params, state/data management, handling
  of loading/empty/error cases, and overall polish.
- **Backend (30%)** – API design, serialization choices, filtering implementation, and attention to
  relational data handling.
- **Code Quality (15%)** – Structure, naming, documentation/readability, testing where it adds
  value.
- **Product Thinking (10%)** – Workflow clarity, assumptions noted, and thoughtful UX details.

## Optional Bonus

Authentication, deployment, or extra tooling are not required but welcome if scope allows.

## Solution Notes

### Backend approach

The API is read-only and split into layers with one job each, so a new resource or a write
endpoint can be added without reworking the existing ones:

- **Query layer** (`submissions/querysets.py`): `SubmissionQuerySet` owns every query decision.
  - `for_list()` joins broker, company and owner (`select_related`) and counts documents and
    notes with correlated `COUNT` subqueries, which avoids the row multiplication and
    `GROUP BY` of `Count()` joins.
  - It also fetches the latest note of every row on a page in one extra query: a sliced
    `Prefetch`, which Django runs as a window function.
  - `for_detail()` prefetches contacts, documents and notes, each in a stable order.
- **Filters** (`submissions/filters/`): `SubmissionFilterSet` validates every query param.
  Invalid input returns a `400` that names the param instead of being silently ignored.
- **Serializers** (`submissions/serializers.py`): read-only, with explicit field lists that
  match `frontend/lib/types.ts`. They only read data the queryset has already loaded.
- **Views** (`submissions/views.py`): thin `ReadOnlyModelViewSet`s that choose the queryset and
  serializer for each action.

The number of database queries per request is fixed, whatever the page size, and tests enforce
it. The list takes 3 queries (pagination count, the page, latest notes), the detail 4 and brokers 1.

### API reference

| Endpoint | Returns |
| --- | --- |
| `GET /api/submissions/` | Paginated `{count, next, previous, results}`, 10 per page, newest first |
| `GET /api/submissions/<id>/` | One submission with every contact, document and note |
| `GET /api/brokers/` | Every broker as a plain array, sorted by name (feeds the dropdown) |
| `GET /api/brokers/<id>/` | One broker |

List query params (all optional, combined with AND):

| Param | Example | Notes |
| --- | --- | --- |
| `status` | `new,in_review` | One or more statuses, comma-separated |
| `priority` | `high,medium` | One or more priorities, comma-separated |
| `brokerId` | `3` | Integer; an unknown id matches nothing |
| `companySearch` | `acme` | Case-insensitive match on part of the company's legal name |
| `createdFrom` / `createdTo` | `2026-09-01` | Inclusive days (UTC); `createdFrom` after `createdTo` is a `400` |
| `hasDocuments` / `hasNotes` | `true` | `true`/`false` (or `1`/`0`) |
| `ordering` | `-priority,company` | `createdAt`, `updatedAt`, `priority` (by urgency), `company`; prefix `-` for descending |
| `page` / `pageSize` | `2` / `25` | `pageSize` defaults to 10 and is capped at 100 |

Status codes:

- `400`: a query param is invalid; the body maps each param to its error messages.
- `404`: unknown id, or a page out of range.
- `405`: any write method (`POST`, `PUT`, `PATCH`, `DELETE`).

GET responses carry an `ETag`, so repeated requests can be answered with `304 Not Modified`.

### API documentation

- **Swagger UI:** `http://localhost:8000/api/docs/`. Expand an endpoint, click **Try it out**,
  then **Execute**. The OpenAPI schema is generated by drf-spectacular and uses the same camelCase
  names as the API.
- **OpenAPI schema:** `http://localhost:8000/api/schema/` (add `?format=json` for JSON).
- **Postman:**
  1. Choose **Import → Link** and enter `http://localhost:8000/api/schema/?format=json`.
  2. Set the collection variable `baseUrl` to `http://localhost:8000`.
  3. Untick any query params you don't use. Postman fills them with placeholders, which the API
     rejects with a `400`.

### Testing

The backend suite (pytest + pytest-django + factory_boy) covers:

- the exact response shape the frontend expects;
- every filter with valid, edge and invalid input;
- pagination and stable ordering;
- query counts, so an N+1 regression fails the suite;
- CORS and ETag behaviour, and environment-driven settings;
- OpenAPI schema validity: the build fails on any schema warning.

### Stretch goals implemented (backend)

- OpenAPI 3 schema and Swagger UI.
- Extra filters: multi-value `status`, `priority`, and `ordering` (priority sorts by urgency).
- A `pageSize` param, capped at 100.
- Environment-driven settings:
  - production guards, so the server refuses to start with the committed dev secret key when
    `DEBUG` is off;
  - a CORS allow-list instead of allow-all;
  - the browsable API only in development.
- Conditional GET (`ETag` / `304`).
- Automated backend tests.

### Known issues

- Every seeded document shows the date the seed command ran. `Document.uploaded_at` uses
  `auto_now_add`, which overwrites the backdated value the seed passes. Fixing it needs a
  migration, which was left out to keep the provided schema unchanged.
- The seed command dates notes up to 72 hours after their submission, so notes on the most
  recent submissions can be dated in the future.
- No extra database indexes were added. Foreign keys are indexed by default, which is enough at
  this data size.

### Tradeoffs and future work

- **Read-only, per the brief.** Write endpoints (change status or priority, add a note) would
  add their own serializers, permissions and tests.
- **The API is public**: no authentication classes and `AllowAny`. Adding auth means changing
  those two defaults in `server/settings.py`, not every view.
- **Brokers are unpaginated**, because the dropdown needs all of them. With thousands of brokers
  this should become a paginated `?search=` autocomplete.
- **The detail endpoint returns every note.** Long threads would move to a paginated
  `/api/submissions/<id>/notes/` sub-resource.
- **Next steps at scale:**
  - composite indexes, on `(status, created_at)` and on notes by `(submission, created_at)`;
  - Postgres trigram search for `companySearch`;
  - URL versioning (`/api/v1/`) once a breaking change is needed.
