import {
  DEFAULT_ORDERING,
  DEFAULT_PAGE_SIZE,
  LIST_VIEWS,
  PAGE_SIZE_OPTIONS,
  SUBMISSION_ORDERINGS,
  SUBMISSION_PRIORITIES,
  SUBMISSION_STATUSES,
  SUBMISSIONS_PATH,
} from '@/lib/submissions/constants';
import type { ListView, SubmissionListFilters, SubmissionListQuery } from '@/lib/types';

// The list page's URL <-> state codec. Pure functions with no React, so they are easy to read
// and to test.
//
// URL param names are the API's param names (plus the UI-only `view`), so the address bar is
// literally the API query:
//   /submissions?status=new,in_review&brokerId=3&page=2&view=cards
//
// Every state has exactly one canonical form: invalid values are dropped and defaults are left
// out (page 1, 10 per page, newest first). The same filters therefore always produce the same
// URL and the same React Query cache key.

// Everything the list page keeps in its URL: the API query plus how results are displayed.
export type ListParams = SubmissionListQuery & { view?: ListView };

// The params that narrow results (as opposed to sorting, paging and display).
const FILTER_KEYS: (keyof SubmissionListFilters)[] = [
  'status',
  'priority',
  'brokerId',
  'companySearch',
  'createdFrom',
  'createdTo',
  'hasDocuments',
  'hasNotes',
];

// Order params are written to the URL in, so equal states produce identical URLs.
const URL_PARAM_ORDER: (keyof ListParams)[] = [
  ...FILTER_KEYS,
  'ordering',
  'page',
  'pageSize',
  'view',
];

const PAGE_SIZES: readonly number[] = PAGE_SIZE_OPTIONS;

// ---------------------------------------------------------------------------------------
// Parsing: each helper returns undefined for missing or invalid input, so a hand-edited URL
// never puts a bad value into the API request.

// Comma-separated enum list, e.g. "new,in_review". Unknown values are dropped; the result is
// deduplicated and in canonical order.
function parseEnumList<T extends string>(raw: string | null, allowed: readonly T[]) {
  const values = raw?.split(',').map((value) => value.trim()) ?? [];
  const valid = allowed.filter((value) => values.includes(value));
  return valid.length > 0 ? valid : undefined;
}

// A single allowed value, e.g. ?view=cards.
function parseEnum<T extends string>(raw: string | null, allowed: readonly T[]) {
  return allowed.find((value) => value === raw);
}

// Digits only, so "1.5", "-2" and "1e3" are rejected rather than coerced.
function parsePositiveInt(raw: string | null) {
  if (!raw || !/^\d+$/.test(raw)) return undefined;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

// YYYY-MM-DD that is a real calendar day (rejects 2026-02-30).
function parseIsoDate(raw: string | null) {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return undefined;
  const date = new Date(`${raw}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(raw) ? raw : undefined;
}

// Exactly "true" or "false", the spellings this app writes.
function parseBoolean(raw: string | null) {
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return undefined;
}

// Reads list params from a URL's query string (URLSearchParams or Next's
// ReadonlyURLSearchParams).
export function parseListParams(search: Pick<URLSearchParams, 'get'>): ListParams {
  return normalizeListParams({
    status: parseEnumList(search.get('status'), SUBMISSION_STATUSES),
    priority: parseEnumList(search.get('priority'), SUBMISSION_PRIORITIES),
    brokerId: parsePositiveInt(search.get('brokerId')),
    // The backend caps the search term at 255 characters.
    companySearch: search.get('companySearch')?.slice(0, 255),
    createdFrom: parseIsoDate(search.get('createdFrom')),
    createdTo: parseIsoDate(search.get('createdTo')),
    hasDocuments: parseBoolean(search.get('hasDocuments')),
    hasNotes: parseBoolean(search.get('hasNotes')),
    ordering: parseEnum(search.get('ordering'), SUBMISSION_ORDERINGS),
    page: parsePositiveInt(search.get('page')),
    pageSize: PAGE_SIZES.find((size) => String(size) === search.get('pageSize')),
    view: parseEnum(search.get('view'), LIST_VIEWS),
  });
}

// ---------------------------------------------------------------------------------------
// Canonical form

// Drops empty values and defaults, and removes undefined keys, so equal states are equal
// objects.
export function normalizeListParams(params: ListParams): ListParams {
  const normalized: ListParams = {
    ...params,
    status: params.status?.length
      ? SUBMISSION_STATUSES.filter((status) => params.status?.includes(status))
      : undefined,
    priority: params.priority?.length
      ? SUBMISSION_PRIORITIES.filter((priority) => params.priority?.includes(priority))
      : undefined,
    companySearch: params.companySearch?.trim() || undefined,
    ordering: params.ordering === DEFAULT_ORDERING ? undefined : params.ordering,
    page: params.page && params.page > 1 ? params.page : undefined,
    pageSize: params.pageSize === DEFAULT_PAGE_SIZE ? undefined : params.pageSize,
  };
  return Object.fromEntries(
    Object.entries(normalized).filter(([, value]) => value !== undefined),
  ) as ListParams;
}

// ---------------------------------------------------------------------------------------
// Writing

// Serialises params to a query string (without "?") in a fixed param order.
export function toSearchString(params: ListParams): string {
  const normalized = normalizeListParams(params);
  return URL_PARAM_ORDER.flatMap((key) => {
    const value = normalized[key];
    if (value === undefined) return [];
    const text = Array.isArray(value) ? value.join(',') : String(value);
    // Commas are legal in a query string; leaving them unencoded keeps shared links readable.
    return [`${key}=${encodeURIComponent(text).replace(/%2C/gi, ',')}`];
  }).join('&');
}

// Link to the list page showing these params, e.g. for the overview's status tiles.
export function listHref(params: ListParams = {}): string {
  const search = toSearchString(params);
  return search ? `${SUBMISSIONS_PATH}?${search}` : SUBMISSIONS_PATH;
}

// ---------------------------------------------------------------------------------------
// Updating

// Applies a change from the UI. Changing what is listed (a filter, the sort or the page size)
// returns to page 1, because the old page may not exist in the new results. Switching the
// view or the page keeps everything else.
export function updateListParams(current: ListParams, patch: Partial<ListParams>): ListParams {
  const keepsPage = Object.keys(patch).every((key) => key === 'page' || key === 'view');
  return normalizeListParams({ ...current, ...(keepsPage ? {} : { page: undefined }), ...patch });
}

// Removes every filter but keeps the sort, page size and view the user chose.
export function clearListFilters(params: ListParams): ListParams {
  return normalizeListParams({
    ordering: params.ordering,
    pageSize: params.pageSize,
    view: params.view,
  });
}

// Number of active filters, for the "Clear all (n)" and "Filters (n)" labels. A created-date
// range is one filter even when both ends are set (it is also one chip).
export function countActiveFilters(params: ListParams): number {
  const active = FILTER_KEYS.filter((key) => params[key] !== undefined).length;
  return params.createdFrom && params.createdTo ? active - 1 : active;
}

// The API request for these params: everything except the UI-only `view`.
export function toListQuery(params: ListParams): SubmissionListQuery {
  const query: ListParams = { ...params };
  delete query.view;
  return query;
}
