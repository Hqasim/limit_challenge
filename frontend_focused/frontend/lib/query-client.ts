import { QueryClient, QueryObserverOptions } from '@tanstack/react-query';

import { isRetryable } from '@/lib/api-errors';

// Builds the React Query client with the app's defaults. Used once by app/providers.tsx and by
// the test helpers (which pass `{ retry: false }`), so tests run with the app's caching rules.
export function createQueryClient(overrides: Partial<QueryObserverOptions> = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is treated as fresh for 30s: moving between pages or back to a list within
        // that window renders from cache instead of refetching. Hooks can override this.
        staleTime: 30_000,
        // Retry network, timeout and 5xx failures up to twice; never retry 4xx responses,
        // which would fail the same way again.
        retry: (failureCount, error) => isRetryable(error) && failureCount < 2,
        ...overrides,
      },
    },
  });
}
