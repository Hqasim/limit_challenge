import { useMemo, useSyncExternalStore } from 'react';

// Test stand-in for `next/navigation`, backed by jsdom's real window.location and History API.
// Like the real Next.js router, usePathname/useSearchParams re-render when code calls
// history.pushState/replaceState, so URL-driven components can be tested end to end.
//
// Use in a test file:
//   jest.mock('next/navigation', () => jest.requireActual('@/test/next-navigation').navigationMock);
// and set the starting URL with setTestUrl('/submissions?status=new').

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  listeners.forEach((listener) => listener());
}

// Wrap pushState/replaceState once so every URL change notifies the hooks below.
const historyPatched = Symbol.for('test.historyPatched');
const patchableHistory = window.history as History & { [historyPatched]?: boolean };
if (!patchableHistory[historyPatched]) {
  const { pushState, replaceState } = window.history;
  window.history.pushState = function (...args) {
    pushState.apply(this, args);
    notify();
  };
  window.history.replaceState = function (...args) {
    replaceState.apply(this, args);
    notify();
  };
  window.addEventListener('popstate', notify);
  patchableHistory[historyPatched] = true;
}

// Sets the current URL (path + query) without adding a history entry.
export function setTestUrl(url: string) {
  window.history.replaceState(null, '', url);
}

export const routerMock = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

export const navigationMock = {
  usePathname: () => useSyncExternalStore(subscribe, () => window.location.pathname),
  useSearchParams: () => {
    const search = useSyncExternalStore(subscribe, () => window.location.search);
    return useMemo(() => new URLSearchParams(search), [search]);
  },
  useRouter: () => routerMock,
  useParams: jest.fn(() => ({})),
  notFound: jest.fn(),
};
