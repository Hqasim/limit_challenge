import { waitFor } from '@testing-library/react';

import { apiClient } from '@/lib/api-client';
import {
  submissionDetailQueryKey,
  submissionsListQueryKey,
  useSubmissionCount,
  useSubmissionDetail,
  useSubmissionsList,
} from '@/lib/hooks/useSubmissions';
import { SubmissionListQuery } from '@/lib/types';
import { buildDetail, buildListItem, buildPage } from '@/test/fixtures';
import { renderHookWithProviders } from '@/test/render';

// The axios instance is replaced so tests can see exactly what each hook requests.
jest.mock('@/lib/api-client', () => ({
  ...jest.requireActual('@/lib/api-client'),
  apiClient: { get: jest.fn() },
}));
const get = jest.mocked(apiClient.get);

// Resolves the next request with `data`, as axios would.
const respondWith = (data: unknown) => get.mockResolvedValueOnce({ data });

afterEach(() => get.mockReset());

describe('useSubmissionsList', () => {
  it('sends filters as the API expects, with multi-value params comma-separated', async () => {
    respondWith(buildPage([buildListItem()]));
    const { result } = renderHookWithProviders(() =>
      useSubmissionsList({ status: ['new', 'in_review'], brokerId: 3, hasNotes: false, page: 2 }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get).toHaveBeenCalledWith('/submissions/', {
      params: {
        status: 'new,in_review',
        priority: undefined,
        brokerId: 3,
        hasNotes: false,
        page: 2,
      },
      signal: expect.any(AbortSignal),
    });
    expect(result.current.data?.results[0].company.legalName).toBe('Acme Logistics LLC');
  });

  it('keeps showing the previous results while the next page loads', async () => {
    respondWith(buildPage([buildListItem({ id: 1 })], 30));
    let query: SubmissionListQuery = { page: 1 };
    const { result, rerender } = renderHookWithProviders(() => useSubmissionsList(query));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    get.mockReturnValueOnce(new Promise(() => {})); // page 2 never resolves in this test
    query = { page: 2 };
    rerender();

    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.data?.results[0].id).toBe(1);
  });
});

describe('useSubmissionCount', () => {
  it('requests a single row and returns the total', async () => {
    respondWith(buildPage([buildListItem()], 7));
    const { result } = renderHookWithProviders(() => useSubmissionCount({ status: ['new'] }));

    await waitFor(() => expect(result.current.data).toBe(7));
    expect(get.mock.calls[0][1]?.params).toMatchObject({ status: 'new', pageSize: 1 });
  });
});

describe('useSubmissionDetail', () => {
  it('fetches one submission by id', async () => {
    respondWith(buildDetail({ id: 12 }));
    const { result } = renderHookWithProviders(() => useSubmissionDetail(12));

    await waitFor(() => expect(result.current.data?.id).toBe(12));
    expect(get).toHaveBeenCalledWith('/submissions/12/', { signal: expect.any(AbortSignal) });
  });

  it.each([0, -1, Number.NaN, 1.5])('never requests an invalid id (%p)', (id) => {
    const { result } = renderHookWithProviders(() => useSubmissionDetail(id));

    expect(result.current.fetchStatus).toBe('idle');
    expect(get).not.toHaveBeenCalled();
  });
});

describe('query keys', () => {
  it('roots list and detail keys at "submissions" so one invalidation refreshes both', () => {
    expect(submissionsListQueryKey({ page: 2 })).toEqual(['submissions', 'list', { page: 2 }]);
    expect(submissionDetailQueryKey(12)).toEqual(['submissions', 'detail', 12]);
  });
});
