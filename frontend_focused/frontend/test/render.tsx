import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

import { createQueryClient } from '@/lib/query-client';
import { theme } from '@/lib/theme';

// Renders a component inside the same providers the app uses (MUI theme + React Query), with
// a fresh cache per test and retries turned off so failing requests fail immediately.
// Returns Testing Library's queries plus a userEvent instance for realistic interactions.
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const queryClient = createQueryClient({ retry: false });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {ui}
      </ThemeProvider>
    </QueryClientProvider>,
    options,
  );

  return { ...result, queryClient, user: userEvent.setup() };
}
