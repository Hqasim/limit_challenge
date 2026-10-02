'use client';

import { useMemo } from 'react';
import { QueryKey, useQuery } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import {
  PaginatedResponse,
  SubmissionDetail,
  SubmissionListFilters,
  SubmissionListItem,
} from '@/lib/types';

// Root of every submissions cache key, so queryClient.invalidateQueries({ queryKey:
// ['submissions'] }) refreshes both list and detail queries.
const SUBMISSIONS_QUERY_KEY = 'submissions';

// GET /api/submissions/?status=...&brokerId=...&companySearch=...
// axios drops undefined params, so "All" filters are simply not sent.
// There is no `page` param yet; pagination needs to be added here and in the filters type.
async function fetchSubmissions(filters: SubmissionListFilters) {
  const response = await apiClient.get<PaginatedResponse<SubmissionListItem>>('/submissions/', {
    params: {
      status: filters.status,
      brokerId: filters.brokerId,
      companySearch: filters.companySearch,
    },
  });
  return response.data;
}

// GET /api/submissions/<id>/ -> full submission with contacts, documents and notes.
async function fetchSubmissionDetail(id: string | number) {
  if (!id) {
    throw new Error('Submission id is required');
  }

  const response = await apiClient.get<SubmissionDetail>(`/submissions/${id}/`);
  return response.data;
}

// Key builders used by the hooks below. Exported because useQuery's result does not expose
// its key, so components that need it (e.g. to display or invalidate it) build it here.
export function submissionsListQueryKey(filters: SubmissionListFilters): QueryKey {
  return [SUBMISSIONS_QUERY_KEY, filters];
}

export function submissionDetailQueryKey(id: string | number): QueryKey {
  return [SUBMISSIONS_QUERY_KEY, id];
}

// List query. The filters object is part of the key, so each filter combination is cached
// separately and changing a filter triggers a new fetch (once `enabled` is turned on).
export function useSubmissionsList(filters: SubmissionListFilters) {
  return useQuery({
    queryKey: submissionsListQueryKey(filters),
    queryFn: () => fetchSubmissions(filters),
    enabled: false,
  });
}

// Detail query for one submission; the result is considered fresh for 60 seconds.
// The key is ['submissions', id] while the list key is ['submissions', filters], so they
// never collide.
export function useSubmissionDetail(id: string | number) {
  return useQuery({
    queryKey: submissionDetailQueryKey(id),
    queryFn: () => fetchSubmissionDetail(id),
    enabled: false,
    staleTime: 60_000,
  });
}

// Helper returning the list key for a set of filters (e.g. for prefetching or cache
// updates). Not used anywhere yet.
export function useSubmissionQueryKey(filters: SubmissionListFilters) {
  return useMemo(() => submissionsListQueryKey(filters), [filters]);
}
