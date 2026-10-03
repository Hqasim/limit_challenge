'use client';

import { useCallback, useEffect, useRef } from 'react';

// Delays calling `callback` until `delayMs` have passed without another call. Used for the
// company search, so the URL (and the API) update once the user pauses typing, not on every
// key. `cancel` drops a pending call; a pending call is also dropped on unmount.
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs = 300,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Always call the latest callback, without restarting the timer when the parent re-renders.
  const latestCallback = useRef(callback);
  useEffect(() => {
    latestCallback.current = callback;
  });

  const cancel = useCallback(() => clearTimeout(timer.current), []);

  const schedule = useCallback(
    (...args: Args) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => latestCallback.current(...args), delayMs);
    },
    [delayMs],
  );

  useEffect(() => cancel, [cancel]);

  return { schedule, cancel };
}
