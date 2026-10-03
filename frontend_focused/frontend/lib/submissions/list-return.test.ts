import { renderHook } from '@testing-library/react';

import { rememberListSearch, useListReturnHref } from '@/lib/submissions/list-return';

describe('useListReturnHref', () => {
  beforeEach(() => window.sessionStorage.clear());

  it('links to the plain list when nothing was remembered', () => {
    const { result } = renderHook(() => useListReturnHref());
    expect(result.current).toBe('/submissions');
  });

  it('restores the remembered filters', () => {
    rememberListSearch('status=new,in_review&page=2');
    const { result } = renderHook(() => useListReturnHref());
    expect(result.current).toBe('/submissions?status=new,in_review&page=2');
  });

  it('only ever produces a valid list URL from the stored value', () => {
    rememberListSearch('status=hacked&next=https://evil.test&brokerId=3');
    const { result } = renderHook(() => useListReturnHref());
    expect(result.current).toBe('/submissions?brokerId=3');
  });
});
