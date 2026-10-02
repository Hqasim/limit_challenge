// TypeScript shapes of the API responses. Keys are camelCase because the Django backend
// renders JSON through djangorestframework-camel-case (see backend/server/settings.py).

// Mirror Submission.Status / Submission.Priority in backend/submissions/models.py.
export type SubmissionStatus = 'new' | 'in_review' | 'closed' | 'lost';
export type SubmissionPriority = 'high' | 'medium' | 'low';

export interface Broker {
  id: number;
  name: string;
  primaryContactEmail: string | null;
}

export interface Company {
  id: number;
  legalName: string;
  industry: string;
  headquartersCity: string;
}

export interface TeamMember {
  id: number;
  fullName: string;
  email: string;
}

// Preview of a submission's newest note, embedded in each list row (not a model field;
// the list endpoint is expected to compute it).
export interface NoteSummary {
  authorName: string;
  bodyPreview: string;
  createdAt: string;
}

// One row of GET /api/submissions/: the submission with nested broker/company/owner and
// aggregate counts instead of the full related lists.
export interface SubmissionListItem {
  id: number;
  status: SubmissionStatus;
  priority: SubmissionPriority;
  summary: string;
  createdAt: string;
  updatedAt: string;
  broker: Broker;
  company: Company;
  owner: TeamMember;
  documentCount: number;
  noteCount: number;
  latestNote: NoteSummary | null;
}

// Related records returned in full by the detail endpoint.
export interface Contact {
  id: number;
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface Document {
  id: number;
  title: string;
  docType: string;
  uploadedAt: string;
  fileUrl: string;
}

export interface NoteDetail {
  id: number;
  authorName: string;
  body: string;
  createdAt: string;
}

// GET /api/submissions/<id>/: same fields as a list row, minus the counts/preview, plus
// the complete contacts, documents and notes arrays.
export interface SubmissionDetail extends Omit<
  SubmissionListItem,
  'documentCount' | 'noteCount' | 'latestNote'
> {
  contacts: Contact[];
  documents: Document[];
  notes: NoteDetail[];
}

// DRF PageNumberPagination envelope (10 items per page; next/previous are full URLs or null).
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Filters sent as query params on the list request; undefined values are omitted by axios.
export interface SubmissionListFilters {
  status?: SubmissionStatus;
  brokerId?: string;
  companySearch?: string;
}
