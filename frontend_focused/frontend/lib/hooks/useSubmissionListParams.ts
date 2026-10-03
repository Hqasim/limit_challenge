'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

import { rememberListSearch } from '@/lib/submissions/list-return';
import {
  clearListFilters,
  ListParams,
  parseListParams,
  toSearchString,
  updateListParams,
} from '@/lib/submissions/list-params';

// The list page's state, read from and written to the URL. The URL is the single source of
// truth for filters, sort, page, page size and view: a refresh, a shared link or the Back
// button all restore exactly what the user was looking at.
//
// Updates use the browser History API. Next.js keeps useSearchParams in sync with
// pushState/replaceState, and unlike router.push it does not request the route from the
// server again: only the data query changes.
//
// History policy:
// - filter, sort, page-size and view changes REPLACE the current entry, so Back leaves the
//   list instead of stepping through every keystroke and click;
// - page changes PUSH an entry, so Back returns to the previous page of results.
export function useSubmissionListParams() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parsed and validated; recomputed only when the query string changes.
  const params = useMemo(() => parseListParams(searchParams), [searchParams]);

  // Keep the address bar truthful: a hand-edited or old link (invalid values, defaults,
  // encoded commas) is rewritten in place to the canonical form of what is actually applied.
  // Also remember it for the detail page's "Back to submissions" link.
  useEffect(() => {
    const search = toSearchString(params);
    rememberListSearch(search);
    if (window.location.search !== (search ? `?${search}` : '')) {
      window.history.replaceState(null, '', search ? `${pathname}?${search}` : pathname);
    }
  }, [params, pathname]);

  const navigate = useCallback(
    (next: ListParams, mode: 'push' | 'replace') => {
      const search = toSearchString(next);
      const url = search ? `${pathname}?${search}` : pathname;
      if (mode === 'push') {
        window.history.pushState(null, '', url);
      } else {
        window.history.replaceState(null, '', url);
      }
    },
    [pathname],
  );

  // Merge a change into the current params (filters, sort, page size or view).
  const setParams = useCallback(
    (patch: Partial<ListParams>) => navigate(updateListParams(params, patch), 'replace'),
    [navigate, params],
  );

  const setPage = useCallback(
    (page: number) => navigate(updateListParams(params, { page }), 'push'),
    [navigate, params],
  );

  const clearFilters = useCallback(
    () => navigate(clearListFilters(params), 'replace'),
    [navigate, params],
  );

  return { params, setParams, setPage, clearFilters };
}
