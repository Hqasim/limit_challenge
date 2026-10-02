'use client';

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { PropsWithChildren, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// App-wide client-side context, rendered once by app/layout.tsx.

// MUI theme: brand blue primary color, light grey page background, 8px corner radius.
// Memoised so the theme object is created once instead of on every render.
function useTheme() {
  return useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            main: '#0f62fe',
          },
          background: {
            default: '#f5f7fb',
          },
        },
        shape: { borderRadius: 8 },
      }),
    [],
  );
}

export default function Providers({ children }: PropsWithChildren) {
  const theme = useTheme();
  // useState initialiser keeps one QueryClient (and its cache) for the component's lifetime
  // instead of creating a new, empty one on every render.
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {/* Normalises browser CSS and applies the theme's background colour to <body>. */}
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
