'use client';

import { useSyncExternalStore } from 'react';

import { listHref, parseListParams } from '@/lib/submissions/list-params';

// Remembers the list page's last URL for this browser tab, so the detail page's
// "Back to submissions" link returns to the same filters, sort and page, even when the user
// arrived at the detail page by a route other than the browser's Back button.

const STORAGE_KEY = 'submission-tracker:list-search';

// Called by the list page whenever its URL changes. Storage can be unavailable (private mode,
// blocked cookies); the link then simply falls back to the unfiltered list.
export function rememberListSearch(search: string) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, search);
  } catch {
    // ignore: remembering filters is a convenience
  }
}

function readListSearch(): string {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

// sessionStorage has no change events within a tab, and the value only changes while the user
// is on the list page, so there is nothing to subscribe to.
const subscribe = () => () => {};

// href back to the list with the remembered params. The stored value is re-parsed, so a
// tampered entry can only ever produce a valid list URL. During server rendering (no storage)
// it is the plain list URL; useSyncExternalStore then updates it on the client without a
// hydration mismatch.
export function useListReturnHref(): string {
  const search = useSyncExternalStore(subscribe, readListSearch, () => '');
  return listHref(parseListParams(new URLSearchParams(search)));
}
