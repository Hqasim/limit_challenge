'use client'; // Error boundaries must be client components.

import { Button, Card } from '@mui/material';
import { useEffect } from 'react';

import ErrorState from '@/components/feedback/ErrorState';

type RouteErrorProps = {
  error: Error & { digest?: string };
  // Next 16: re-fetches and re-renders the failed segment (preferred over `reset`).
  unstable_retry: () => void;
};

// Catches unexpected render errors in any page below the root layout, so a crash shows a
// recoverable message inside the normal header and footer instead of a blank screen.
// Expected failures (API errors) are handled inline by each page, not here.
export default function RouteError({ error, unstable_retry }: RouteErrorProps) {
  useEffect(() => {
    // Hook point for an error-reporting service; the console is enough for this project.
    console.error(error);
  }, [error]);

  return (
    <Card>
      <ErrorState
        title="Something went wrong"
        description="An unexpected error stopped this page from loading. Try again, or go back to the overview."
        retryLabel="Try again"
        onRetry={() => unstable_retry()}
        actions={
          <Button variant="outlined" href="/">
            Go to overview
          </Button>
        }
      />
    </Card>
  );
}
