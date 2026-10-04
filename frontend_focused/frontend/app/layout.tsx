import type { Metadata } from 'next';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';
import { Inter } from 'next/font/google';

import AppShell from '@/components/layout/AppShell';
import Providers from './providers';

// Root layout (App Router): the HTML shell that wraps every route.

// Inter, the typeface limit.com uses. next/font self-hosts it and exposes it as the
// --font-inter CSS variable, which the MUI theme's fontFamily reads (lib/theme.ts).
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

// Pages set their own title ("Submissions"); the template turns it into
// "Submissions · Submission Tracker".
export const metadata: Metadata = {
  title: {
    template: '%s · Submission Tracker',
    default: 'Submission Tracker',
  },
  description: 'Review, filter and inspect broker-submitted insurance opportunities.',
};

// Server component. Client-only context (MUI theme, React Query) is pushed down into
// <Providers> so this layout can stay on the server.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: InitColorSchemeScript adds the colour scheme class to <html>
    // before React hydrates, which React would otherwise report as a mismatch.
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body>
        {/* Applies the saved (or system) light/dark scheme before the first paint, so a dark
            mode visit never flashes light. Must match the theme's colorSchemeSelector. */}
        <InitColorSchemeScript attribute="class" />
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
