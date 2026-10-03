import { act, renderHook } from '@testing-library/react';

import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('calls once, with the latest arguments, after calls stop', () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current.schedule('a');
      jest.advanceTimersByTime(200);
      result.current.schedule('ac');
      jest.advanceTimersByTime(200);
      result.current.schedule('acme');
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(300));
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('acme');
  });

  it('drops a pending call on cancel and on unmount', () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current.schedule('a');
      result.current.cancel();
      jest.advanceTimersByTime(300);
    });
    act(() => result.current.schedule('b'));
    unmount();
    act(() => jest.advanceTimersByTime(300));

    expect(callback).not.toHaveBeenCalled();
  });
});
