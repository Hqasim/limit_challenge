import { waitFor } from '@testing-library/react';

import { apiClient } from '@/lib/api-client';
import {
  submissionDetailQueryKey,
  submissionsListQueryKey,
  useSubmissionCounts,
  useSubmissionDetail,
  useSubmissionsList,
} from '@/lib/hooks/useSubmissions';
import { SubmissionListQuery } from '@/lib/types';
import { networkError } from '@/test/axios-errors';
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

describe('useSubmissionCounts', () => {
  // Answers each count request with a total that depends on its status filter.
  const totals: Record<string, number> = { new: 6, lost: 4 };
  const statusOf = (config?: { params?: unknown }) => (config?.params as { status: string }).status;

  it('requests one row per filter set, in parallel, and returns each total', async () => {
    get.mockImplementation(async (_url, config) => ({
      data: buildPage([buildListItem()], totals[statusOf(config)]),
    }));
    const { result } = renderHookWithProviders(() =>
      useSubmissionCounts([{ status: ['new'] }, { status: ['lost'] }]),
    );

    await waitFor(() => expect(result.current.counts).toEqual([6, 4]));
    expect(get).toHaveBeenCalledTimes(2);
    expect(get.mock.calls[0][1]?.params).toMatchObject({ status: 'new', pageSize: 1 });
  });

  it('reports a failure and retries only the counts that failed', async () => {
    get.mockImplementation(async (_url, config) => {
      if (statusOf(config) === 'lost') throw networkError();
      return { data: buildPage([], totals[statusOf(config)]) };
    });
    const { result } = renderHookWithProviders(() =>
      useSubmissionCounts([{ status: ['new'] }, { status: ['lost'] }]),
    );
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.counts).toEqual([6, undefined]);

    get.mockClear();
    result.current.retry();
    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    expect(get.mock.calls[0][1]?.params).toMatchObject({ status: 'lost' });
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
