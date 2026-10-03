import { act } from '@testing-library/react';

import { useSubmissionListParams } from '@/lib/hooks/useSubmissionListParams';
import { setTestUrl } from '@/test/next-navigation';
import { renderHookWithProviders } from '@/test/render';

jest.mock('next/navigation', () => jest.requireActual('@/test/next-navigation').navigationMock);

const currentUrl = () => `${window.location.pathname}${window.location.search}`;

describe('useSubmissionListParams', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    setTestUrl('/submissions?status=new&page=3');
  });

  it('reads validated params from the URL', () => {
    setTestUrl('/submissions?status=new,bogus&brokerId=2&view=cards');
    const { result } = renderHookWithProviders(() => useSubmissionListParams());

    expect(result.current.params).toEqual({ status: ['new'], brokerId: 2, view: 'cards' });
  });

  it('replaces the history entry on a filter change and returns to page 1', () => {
    const { result } = renderHookWithProviders(() => useSubmissionListParams());
    const historyLength = window.history.length;

    act(() => result.current.setParams({ priority: ['high'] }));

    expect(currentUrl()).toBe('/submissions?status=new&priority=high');
    expect(window.history.length).toBe(historyLength);
    expect(result.current.params).toEqual({ status: ['new'], priority: ['high'] });
  });

  it('pushes a history entry on a page change so Back returns to the previous page', () => {
    const { result } = renderHookWithProviders(() => useSubmissionListParams());
    const historyLength = window.history.length;

    act(() => result.current.setPage(4));

    expect(currentUrl()).toBe('/submissions?status=new&page=4');
    expect(window.history.length).toBe(historyLength + 1);
  });

  it('keeps the page when switching view', () => {
    const { result } = renderHookWithProviders(() => useSubmissionListParams());

    act(() => result.current.setParams({ view: 'cards' }));

    expect(currentUrl()).toBe('/submissions?status=new&page=3&view=cards');
  });

  it('clears filters but keeps the chosen sort and view', () => {
    setTestUrl('/submissions?status=new&brokerId=2&ordering=company&page=2&view=cards');
    const { result } = renderHookWithProviders(() => useSubmissionListParams());

    act(() => result.current.clearFilters());

    expect(currentUrl()).toBe('/submissions?ordering=company&view=cards');
  });

  it('rewrites a hand-edited URL to the filters actually applied, without a history entry', () => {
    setTestUrl('/submissions?status=new%2Cbogus&page=1&brokerId=abc');
    const historyLength = window.history.length;
    renderHookWithProviders(() => useSubmissionListParams());

    expect(currentUrl()).toBe('/submissions?status=new');
    expect(window.history.length).toBe(historyLength);
  });

  it('remembers the canonical list URL for the detail page Back link', () => {
    setTestUrl('/submissions?status=new%2Cclosed&page=1');
    renderHookWithProviders(() => useSubmissionListParams());

    expect(window.sessionStorage.getItem('submission-tracker:list-search')).toBe(
      'status=new,closed',
    );
  });
});
