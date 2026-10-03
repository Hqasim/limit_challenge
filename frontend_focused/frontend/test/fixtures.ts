import type { Broker, PaginatedResponse, SubmissionDetail, SubmissionListItem } from '@/lib/types';

// Typed builders for API payloads. Each returns a complete, realistic object; tests override
// only the fields they care about, e.g. buildListItem({ status: 'lost' }).

export function buildBroker(overrides: Partial<Broker> = {}): Broker {
  return {
    id: 1,
    name: 'Northwind Brokerage',
    primaryContactEmail: 'ops@northwind.test',
    ...overrides,
  };
}

// Fields shared by list rows and the detail payload.
function buildSubmissionBase() {
  return {
    id: 1,
    status: 'new' as const,
    priority: 'high' as const,
    summary: 'Cyber liability renewal for a regional logistics operator.',
    createdAt: '2026-09-28T14:03:00Z',
    updatedAt: '2026-09-30T09:15:00Z',
    broker: buildBroker(),
    company: {
      id: 1,
      legalName: 'Acme Logistics LLC',
      industry: 'Logistics',
      headquartersCity: 'Denver',
    },
    owner: { id: 1, fullName: 'Jordan Lee', email: 'jordan.lee@limit.test' },
  };
}

export function buildListItem(overrides: Partial<SubmissionListItem> = {}): SubmissionListItem {
  return {
    ...buildSubmissionBase(),
    documentCount: 1,
    noteCount: 1,
    latestNote: {
      authorName: 'Sam Rivera',
      bodyPreview: 'Broker confirmed revenue figures; waiting on loss runs.',
      createdAt: '2026-09-30T09:15:00Z',
    },
    ...overrides,
  };
}

export function buildDetail(overrides: Partial<SubmissionDetail> = {}): SubmissionDetail {
  return {
    ...buildSubmissionBase(),
    contacts: [
      {
        id: 1,
        name: 'Taylor Brooks',
        role: 'Risk Manager',
        email: 'taylor@acme.test',
        phone: '(555) 010-2030',
      },
    ],
    documents: [
      {
        id: 1,
        title: 'Loss runs 2021-2025',
        docType: 'Spreadsheet',
        uploadedAt: '2026-09-29T10:00:00Z',
        fileUrl: 'https://files.example.com/loss-runs.xlsx',
      },
    ],
    notes: [
      {
        id: 1,
        authorName: 'Sam Rivera',
        body: 'Broker confirmed revenue figures; waiting on loss runs.',
        createdAt: '2026-09-30T09:15:00Z',
      },
    ],
    ...overrides,
  };
}

// Wraps rows in DRF's pagination envelope; `count` defaults to the number of rows.
export function buildPage<T>(results: T[], count = results.length): PaginatedResponse<T> {
  return { count, next: null, previous: null, results };
}
