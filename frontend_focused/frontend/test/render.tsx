import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PropsWithChildren, ReactElement } from 'react';

import { createQueryClient } from '@/lib/query-client';
import { theme } from '@/lib/theme';

// The providers the app uses (MUI theme + React Query), around a given client.
function createWrapper(queryClient: QueryClient) {
  return function Providers({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    );
  };
}

// A fresh cache per test, with retries off so failing requests fail immediately.
function createTestQueryClient() {
  return createQueryClient({ retry: false });
}

// Renders a component inside the app's providers. Returns Testing Library's queries, the
// QueryClient (to inspect the cache) and a userEvent instance for realistic interactions.
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const queryClient = createTestQueryClient();
  const result = render(ui, { wrapper: createWrapper(queryClient), ...options });
  return { ...result, queryClient, user: userEvent.setup() };
}

// Same providers for testing a hook on its own.
export function renderHookWithProviders<Result>(hook: () => Result) {
  const queryClient = createTestQueryClient();
  const result = renderHook(hook, { wrapper: createWrapper(queryClient) });
  return { ...result, queryClient };
}
