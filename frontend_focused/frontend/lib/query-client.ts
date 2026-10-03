import { QueryClient, QueryObserverOptions } from '@tanstack/react-query';

// Builds the React Query client with the app's defaults. Used once by app/providers.tsx and by
// the test helpers (which pass `{ retry: false }`), so tests run with the app's caching rules.
export function createQueryClient(overrides: Partial<QueryObserverOptions> = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is treated as fresh for 30s: moving between pages or back to a list within
        // that window renders from cache instead of refetching. Hooks can override this.
        staleTime: 30_000,
        ...overrides,
      },
    },
  });
}
