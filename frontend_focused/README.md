# Submission Tracker Take-home Challenge

![CI](https://github.com/Hqasim/limit_challenge/actions/workflows/frontend-focused-ci.yml/badge.svg)

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

  | Variable               | Default                                       | Purpose                                                                                 |
  | ---------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
  | `DJANGO_DEBUG`         | `true`                                        | `true`/`false` (also `1`/`0`, `yes`/`no`, `on`/`off`); any other value fails at startup |
  | `DJANGO_SECRET_KEY`    | committed dev key                             | Required when `DJANGO_DEBUG=false`; the server refuses to start with the dev key        |
  | `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1,[::1]`                   | Comma-separated host names                                                              |
  | `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated browser origins allowed to call `/api/`                                 |

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

**Author:** Hamzah Qasim · **Demo:** [watch the 2-minute walkthrough](docs/submission-tracker-demo.mp4)

### What was built

- **Read-only REST API** (Django + DRF): a paginated, filterable submission list, the full
  record of one submission, broker options, and an OpenAPI schema with Swagger UI.
- **Overview** (`/`): status tiles with counts, a "Needs attention" queue (open and high
  priority) and one-click quick views for common triage questions.
- **Submissions workspace** (`/submissions`): company search, broker, status, priority, created
  date range, has documents/notes, sort, page size and a table/cards toggle. All of it lives in
  the URL, so every view survives a refresh and can be shared as a link.
- **Detail page** (`/submissions/<id>`): summary, notes timeline, parties, contacts and
  documents, with Copy link and Email broker. The Back link restores the list exactly as it was.
- **Quality:** 126 backend and 165 frontend tests, accessibility audits, dark mode, and a
  GitHub Actions pipeline that runs every check.

### How to run

Requirements: Python 3.13 and Node.js 24 (Node 20.9+ works). Run the backend and frontend in
two terminals. No configuration is needed; the defaults connect them.

```bash
# Terminal 1: backend, http://localhost:8000/api/ (Swagger UI at /api/docs/)
cd backend
python -m venv .venv
source .venv/bin/activate              # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt    # runtime requirements + test tools
python manage.py migrate
python manage.py seed_submissions      # add --force to rebuild the sample data
python manage.py runserver 0.0.0.0:8000
```

```bash
# Terminal 2: frontend, http://localhost:3000
cd frontend
npm install
npm run dev
```

To point the frontend at another API, set `NEXT_PUBLIC_API_BASE_URL` in `frontend/.env.local`
(see `.env.example`). Backend deployment settings are listed under
[Environment Variables](#environment-variables).

```bash
# Checks (the same ones CI runs)
(cd backend && python -m pytest)
(cd frontend && npm test && npm run lint && npm run format && npm run typecheck && npm run build)
```

### Architecture

```
/submissions?status=new&page=2
  -> lib/submissions/list-params.ts   parse + validate the URL into one canonical state
  -> lib/hooks/useSubmissions.ts      React Query: cache key, prefetch, cancel, retry
  -> GET /api/submissions/?status=new&page=2
  -> SubmissionFilterSet              validate params (400 names the bad one)
  -> SubmissionQuerySet.for_list()    joins + count subqueries + latest-note prefetch
  -> SubmissionListSerializer         camelCase JSON matching frontend/lib/types.ts
```

**Frontend** (`frontend/`, Next.js 16, React 19, TypeScript strict, MUI 7, TanStack Query 5)

- `app/` holds thin routes. Server pages set titles and return a real 404 for invalid ids;
  client components fetch the data.
- `components/` is grouped by feature (`layout`, `feedback`, `submissions/list`, `detail`,
  `overview`). `lib/` holds everything that isn't UI: the API client and error mapping, hooks,
  the URL codec, formatting, safe links and the theme.
- **State without a store.** The URL is the single source of truth for filters, sort, page,
  page size and view. Every state has exactly one canonical URL, and therefore one cache key.
  Filter changes replace the history entry and page changes push one, so Back behaves as
  expected. Server data lives in React Query, and component state holds only ephemeral UI.

**Backend** (`backend/`, Django 5.2, DRF 3.17, django-filter, drf-spectacular)

- `submissions/querysets.py` owns every query decision. The list joins broker, company and
  owner, counts documents and notes with correlated subqueries (no `GROUP BY` row
  multiplication), and fetches each row's latest note with one sliced prefetch.
- Each request runs a fixed number of queries whatever the page size: 3 for the list, 4 for
  the detail, 1 for brokers. Tests enforce these counts, so an N+1 regression fails the build.
- `submissions/filters/` validates every query param, `serializers.py` lists every field
  explicitly (read-only), and `views.py` is a pair of thin `ReadOnlyModelViewSet`s.
- Settings come from environment variables: a CORS allow-list, the browsable API only in
  development, and a server that refuses to start in production with the committed dev
  secret key.

### API reference

| Endpoint                     | Returns                                                                  |
| ---------------------------- | ------------------------------------------------------------------------ |
| `GET /api/submissions/`      | Paginated `{count, next, previous, results}`, newest first               |
| `GET /api/submissions/<id>/` | One submission with every contact, document and note                     |
| `GET /api/brokers/`          | Every broker as a plain array, sorted by name                            |
| `GET /api/schema/`, `/docs/` | OpenAPI 3 schema and Swagger UI (importable into Postman via the schema) |

List params (all optional, combined with AND):

| Param                       | Example             | Notes                                                                  |
| --------------------------- | ------------------- | ---------------------------------------------------------------------- |
| `status` / `priority`       | `new,in_review`     | One or more values, comma-separated                                    |
| `brokerId`                  | `3`                 | Integer; an unknown id matches nothing                                 |
| `companySearch`             | `acme`              | Case-insensitive match on part of the company's legal name             |
| `createdFrom` / `createdTo` | `2026-09-01`        | Inclusive days (UTC); an inverted range is a `400`                     |
| `hasDocuments` / `hasNotes` | `true`              | `true` or `false`                                                      |
| `ordering`                  | `-priority,company` | `createdAt`, `updatedAt`, `priority` (by urgency), `company`; `-` desc |
| `page` / `pageSize`         | `2` / `25`          | `pageSize` defaults to 10 and is capped at 100                         |

A `400` names each invalid param, a `404` means an unknown id or a page out of range, and
write methods return `405`. Responses carry an `ETag`, so repeat requests can get a `304`.

### Product and UX details

- **Every state is designed:** skeletons shaped like the content, previous results kept on
  screen while new ones load, "no matches" separate from "no data", and plain-language errors
  that offer the right fix (Retry, Reset filters, or Go to page 1).
- **Fast:** company search is debounced, the next page and hovered rows are prefetched, stale
  requests are cancelled, and only network/5xx failures are retried.
- **Filters:** removable chips, Clear all, and "More filters", which opens automatically when a
  link uses one of those filters. On phones the filters move into a bottom sheet with a
  "Show N results" button.
- **Accessibility:** landmarks, a skip link, one h1 per page, labelled controls, visible focus
  rings, announced result counts, and AA contrast in both themes. jest-axe runs in the tests
  and axe-core in a real browser, with zero violations.
- **Responsive and themed:** cards on phones and a table on larger screens; light/dark mode
  follows the OS, can be overridden, and never flashes on load.
- **Security:** only http(s) document links are rendered, mailto/tel values are sanitised,
  external links use `noopener`, security headers are set, and `dangerouslySetInnerHTML` is
  never used.

### Testing and CI

- **Backend** (pytest, pytest-django, factory_boy; 126 tests): the exact response contract,
  every filter with valid, edge and invalid input, pagination and stable ordering, query
  counts, CORS/ETag, environment settings, and OpenAPI validity (any schema warning fails).
- **Frontend** (Jest, React Testing Library, jest-axe; 165 tests): the URL codec, hooks, error
  mapping, formatting and safe links, plus each screen's states, interactions and
  accessibility.
- **CI** (`.github/workflows/frontend-focused-ci.yml`) runs on pull requests and pushes to
  `main`. Backend: Django checks, missing-migration check, pytest. Frontend: ESLint, Prettier,
  type check, Jest, production build.

### Stretch goals implemented

- Overview dashboard with status counts, a "Needs attention" queue and quick views.
- Extra filters (multi-select status and priority, date range, has documents/notes), sorting,
  page size, and table/cards views.
- Dark mode, plus accessibility audited in tests and in a real browser.
- OpenAPI 3 schema and Swagger UI; conditional GET (`ETag`/`304`).
- Production-ready settings (environment-driven, CORS allow-list, secret-key guard).
- Automated backend and frontend tests and a CI pipeline.

### Tradeoffs

- **Client-side fetching over server components.** The workspace is interactive and driven by
  the URL; the server still validates ids and sets page titles.
- **URL + React Query instead of a global store.** There's less code, every state is
  shareable, and no store has to be kept in sync with the address bar.
- **Read-only API**, as the brief asks. Writes would add their own serializers, permissions
  and tests.
- **The provided schema is unchanged** (no new migrations), so there are no extra indexes.
  Foreign keys are indexed, which is enough at this size.
- **Native date inputs** over a picker library: accessible, native on phones, no dependency.
- **No latest-note column** in the table, since it crowded out the essentials. The note shows
  on hover over the note count, in the cards and on the detail page.
- **Brokers are unpaginated** because the dropdown needs all of them.
- **No Content-Security-Policy yet.** Emotion's inline styles need per-request nonces.

### Known issues

- Seed data: every document shows the date the seed ran (`Document.uploaded_at` uses
  `auto_now_add`, which overwrites the backdated value), and notes on the newest submissions
  can be dated a little in the future.
- "Open in email app" needs a mail app registered with the OS; the menu offers Gmail, Outlook
  and copying the address instead.

### Future work

- **Authentication and roles**, then triage actions: change status or owner, add notes,
  upload documents (with optimistic updates).
- **Scale:** paginate notes as a sub-resource, a broker search autocomplete, Postgres
  composite indexes (`status, created_at`) and trigram search for `companySearch`.
- **Workflow:** saved views per user, bulk actions, and live updates when a teammate changes a
  submission.
- **Platform:** CSP with nonces, Playwright end-to-end tests, Docker Compose and a hosted
  deployment, and `/api/v1/` versioning once a breaking change is needed.
