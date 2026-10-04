'use client';

import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import { Button, Card } from '@mui/material';

import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import { toApiError } from '@/lib/api-errors';

// The list's "nothing to show" states. Each one explains what happened in plain words and
// offers the action that fixes it, so the user is never left at a dead end.

type ResultsErrorProps = {
  error: unknown;
  page: number;
  onRetry: () => void;
  onResetFilters: () => void;
  onFirstPage: () => void;
};

// A failed list request, with the fix that matches the cause: page out of range, invalid
// filter, or a network/server error.
export function ResultsError({
  error,
  page,
  onRetry,
  onResetFilters,
  onFirstPage,
}: ResultsErrorProps) {
  const apiError = toApiError(error);

  // The list endpoint only 404s for a page past the end (e.g. an old link to page 9).
  if (apiError.kind === 'not_found') {
    return (
      <Card>
        <ErrorState
          title={`Page ${page} doesn't exist`}
          description={`There aren't enough results to fill page ${page}. The list may have changed since this link was made.`}
          actions={
            <Button variant="contained" onClick={onFirstPage}>
              Go to page 1
            </Button>
          }
        />
      </Card>
    );
  }

  // The backend rejected a filter value; retrying would fail the same way.
  if (apiError.kind === 'bad_request') {
    return (
      <Card>
        <ErrorState
          title="Some filters aren't valid"
          description={apiError.message}
          actions={
            <Button variant="contained" onClick={onResetFilters}>
              Reset filters
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <ErrorState
        title="Couldn't load submissions"
        description={apiError.message}
        onRetry={onRetry}
      />
    </Card>
  );
}

type ResultsEmptyProps = {
  // Whether any filter is active: "no matches" and "no data at all" need different help.
  filtered: boolean;
  onClearFilters: () => void;
};

// A successful request with no rows: no matches for the filters, or no submissions at all.
export function ResultsEmpty({ filtered, onClearFilters }: ResultsEmptyProps) {
  if (filtered) {
    return (
      <Card>
        <EmptyState
          icon={<SearchOffRoundedIcon />}
          title="No submissions match these filters"
          description="Try removing a filter or searching for a different company name."
          actions={
            <Button variant="outlined" onClick={onClearFilters}>
              Clear filters
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      <EmptyState
        title="No submissions yet"
        description={
          <>
            New broker submissions will appear here. For local development, load the sample data
            with <code>python manage.py seed_submissions</code>.
          </>
        }
      />
    </Card>
  );
}
