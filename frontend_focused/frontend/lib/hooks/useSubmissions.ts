'use client';

import { useCallback } from 'react';
import { keepPreviousData, queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import {
  PaginatedResponse,
  SubmissionDetail,
  SubmissionListFilters,
  SubmissionListItem,
  SubmissionListQuery,
} from '@/lib/types';

// Data access for submissions: API fetchers, cache keys and the React Query hooks built on
// them. Components never call axios directly.

// Root of every submissions cache key, so queryClient.invalidateQueries({ queryKey:
// ['submissions'] }) refreshes list, count and detail queries at once.
const SUBMISSIONS_QUERY_KEY = 'submissions';

// GET /api/submissions/?status=new,in_review&brokerId=3&page=2 ...
// Arrays are sent comma-separated, as the backend expects; axios drops undefined params.
// `signal` lets React Query cancel a request whose result is no longer needed (e.g. the user
// changed a filter while it was in flight).
async function fetchSubmissions(query: SubmissionListQuery, signal?: AbortSignal) {
  const response = await apiClient.get<PaginatedResponse<SubmissionListItem>>('/submissions/', {
    params: {
      ...query,
      status: query.status?.join(','),
      priority: query.priority?.join(','),
    },
    signal,
  });
  return response.data;
}

// GET /api/submissions/<id>/ -> full submission with contacts, documents and notes.
async function fetchSubmissionDetail(id: number, signal?: AbortSignal) {
  const response = await apiClient.get<SubmissionDetail>(`/submissions/${id}/`, { signal });
  return response.data;
}

// Cache keys: ['submissions', 'list', query] and ['submissions', 'detail', id]. The query
// object is part of the key, so every filter/page combination is cached separately.
export function submissionsListQueryKey(query: SubmissionListQuery) {
  return [SUBMISSIONS_QUERY_KEY, 'list', query] as const;
}

export function submissionDetailQueryKey(id: number) {
  return [SUBMISSIONS_QUERY_KEY, 'detail', id] as const;
}

// Query definitions shared by the hooks below and by prefetching, so a prefetched result is
// exactly what the page would have fetched.
export function submissionsListQueryOptions(query: SubmissionListQuery) {
  return queryOptions({
    queryKey: submissionsListQueryKey(query),
    queryFn: ({ signal }) => fetchSubmissions(query, signal),
  });
}

export function submissionDetailQueryOptions(id: number) {
  return queryOptions({
    queryKey: submissionDetailQueryKey(id),
    queryFn: ({ signal }) => fetchSubmissionDetail(id, signal),
    staleTime: 60_000, // a detail record is treated as fresh for a minute
  });
}

// One page of submissions. While a new page/filter combination loads, the previous results
// stay on screen (keepPreviousData) instead of flashing back to a skeleton; `isPlaceholderData`
// tells the UI it is showing older results.
export function useSubmissionsList(query: SubmissionListQuery) {
  return useQuery({ ...submissionsListQueryOptions(query), placeholderData: keepPreviousData });
}

// Number of submissions matching some filters (e.g. per status on the overview). Requests a
// single row and reads the total from the pagination envelope.
export function useSubmissionCount(filters: SubmissionListFilters) {
  return useQuery({
    ...submissionsListQueryOptions({ ...filters, pageSize: 1 }),
    select: (page) => page.count,
  });
}

// Ids come from the URL, so anything that is not a positive integer is never requested.
function isValidSubmissionId(id: number) {
  return Number.isSafeInteger(id) && id > 0;
}

// Full detail for one submission.
export function useSubmissionDetail(id: number) {
  return useQuery({ ...submissionDetailQueryOptions(id), enabled: isValidSubmissionId(id) });
}

// Returns a function that loads a submission's detail into the cache ahead of navigation
// (called on row hover/focus), so the detail page usually renders without a spinner.
export function usePrefetchSubmission() {
  const queryClient = useQueryClient();
  return useCallback(
    (id: number) => queryClient.prefetchQuery(submissionDetailQueryOptions(id)),
    [queryClient],
  );
}

// Returns a function that loads a list page into the cache (used for the next page).
export function usePrefetchSubmissionsList() {
  const queryClient = useQueryClient();
  return useCallback(
    (query: SubmissionListQuery) => queryClient.prefetchQuery(submissionsListQueryOptions(query)),
    [queryClient],
  );
}
