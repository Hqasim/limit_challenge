import type {
  ListView,
  SubmissionListQuery,
  SubmissionOrdering,
  SubmissionPriority,
  SubmissionStatus,
} from '@/lib/types';

// Domain constants for submissions, shared by the list, detail and overview pages. Each enum
// is described once as a Record, so TypeScript errors if a backend value is added to the
// type but not given a label here.

export const SUBMISSIONS_PATH = '/submissions';

// Status labels and the palette colour their chips use (lib/theme.ts). Order = display order.
export const STATUS_META: Record<
  SubmissionStatus,
  { label: string; color: 'info' | 'secondary' | 'success' | 'error' }
> = {
  new: { label: 'New', color: 'info' },
  in_review: { label: 'In review', color: 'secondary' },
  closed: { label: 'Closed', color: 'success' },
  lost: { label: 'Lost', color: 'error' },
};

// Priority labels and the colour of their indicator dot, most urgent first.
export const PRIORITY_META: Record<SubmissionPriority, { label: string; dotColor: string }> = {
  high: { label: 'High', dotColor: 'error.main' },
  medium: { label: 'Medium', dotColor: 'warning.main' },
  low: { label: 'Low', dotColor: 'text.disabled' },
};

// Sort options, in the order the Sort menu lists them.
export const ORDERING_LABELS: Record<SubmissionOrdering, string> = {
  '-createdAt': 'Newest first',
  createdAt: 'Oldest first',
  '-priority': 'Priority: high to low',
  priority: 'Priority: low to high',
  company: 'Company: A to Z',
  '-company': 'Company: Z to A',
  '-updatedAt': 'Recently updated',
  updatedAt: 'Least recently updated',
};

export const VIEW_LABELS: Record<ListView, string> = { table: 'Table', cards: 'Cards' };

export const SUBMISSION_STATUSES = Object.keys(STATUS_META) as SubmissionStatus[];
export const SUBMISSION_PRIORITIES = Object.keys(PRIORITY_META) as SubmissionPriority[];
export const SUBMISSION_ORDERINGS = Object.keys(ORDERING_LABELS) as SubmissionOrdering[];
export const LIST_VIEWS = Object.keys(VIEW_LABELS) as ListView[];

// Defaults match the backend's, so leaving a param out of the URL changes nothing.
export const DEFAULT_ORDERING: SubmissionOrdering = '-createdAt';
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

// Human-readable names for query params, used in validation messages and filter chips.
export const PARAM_LABELS: Record<keyof SubmissionListQuery, string> = {
  status: 'Status',
  priority: 'Priority',
  brokerId: 'Broker',
  companySearch: 'Company',
  createdFrom: 'Created from',
  createdTo: 'Created to',
  hasDocuments: 'Has documents',
  hasNotes: 'Has notes',
  ordering: 'Sort',
  page: 'Page',
  pageSize: 'Page size',
};
