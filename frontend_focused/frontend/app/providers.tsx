'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { PropsWithChildren, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { createQueryClient } from '@/lib/query-client';
import { theme } from '@/lib/theme';

// App-wide client-side context, rendered once by app/layout.tsx.
export default function Providers({ children }: PropsWithChildren) {
  // useState initialiser keeps one QueryClient (and its cache) for the component's lifetime
  // instead of creating a new, empty one on every render.
  const [queryClient] = useState(() => createQueryClient());

  return (
    // Collects Emotion styles during server rendering so pages arrive styled (no flash of
    // unstyled content). MUI's recommended setup for the App Router.
    <AppRouterCacheProvider>
      <QueryClientProvider client={queryClient}>
        {/* Light/dark follows the OS until the user picks one (saved in localStorage).
            Transitions are paused while switching, so colours change at once instead of
            animating element by element. */}
        <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange>
          {/* Normalises browser CSS and applies the theme's background colour to <body>. */}
          <CssBaseline />
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </AppRouterCacheProvider>
  );
}
