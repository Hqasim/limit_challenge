import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Providers from './providers';
import './globals.css';

// Root layout (App Router): the HTML shell that wraps every route.

// Geist fonts are self-hosted by next/font and exposed as CSS variables used in globals.css.
// In practice <body> is set to Arial in globals.css and MUI components use the MUI theme's
// font, so Geist only shows where Tailwind's font-sans / font-mono classes are applied.
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Default <title> and meta description for every page.
export const metadata: Metadata = {
  title: 'Submission Tracker Challenge',
  description: 'Frontend scaffold for the take-home assignment',
};

// Server component. Client-only context (MUI theme, React Query) is pushed down into
// <Providers> so this layout can stay on the server.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
