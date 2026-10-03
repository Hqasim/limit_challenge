'use client';

import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { ReactNode, useEffect, useMemo, useRef } from 'react';

import ListSkeleton from '@/components/submissions/list/ListSkeleton';
import ResultsToolbar, { describeResults } from '@/components/submissions/list/ResultsToolbar';
import { ResultsEmpty, ResultsError } from '@/components/submissions/list/ResultsStates';
import SubmissionCards from '@/components/submissions/list/SubmissionCards';
import SubmissionFilters from '@/components/submissions/list/SubmissionFilters';
import SubmissionsPagination from '@/components/submissions/list/SubmissionsPagination';
import SubmissionsTable from '@/components/submissions/list/SubmissionsTable';
import { visuallyHidden } from '@/lib/a11y';
import { useSubmissionListParams } from '@/lib/hooks/useSubmissionListParams';
import {
  usePrefetchSubmission,
  usePrefetchSubmissionsList,
  useSubmissionsList,
} from '@/lib/hooks/useSubmissions';
import { DEFAULT_ORDERING, DEFAULT_PAGE_SIZE } from '@/lib/submissions/constants';
import { countActiveFilters, toListQuery } from '@/lib/submissions/list-params';

// The /submissions workspace: filters, then the matching submissions as a table or cards,
// with pagination. All state lives in the URL (useSubmissionListParams); the data comes from
// React Query (useSubmissionsList). This component only decides what to show.
export default function SubmissionsWorkspace() {
  const { params, setParams, setPage, clearFilters } = useSubmissionListParams();
  const query = useMemo(() => toListQuery(params), [params]);
  const listQuery = useSubmissionsList(query);
  const { data, isPending, isFetching, isPlaceholderData, isError, error, refetch } = listQuery;

  const prefetchSubmission = usePrefetchSubmission();
  const prefetchList = usePrefetchSubmissionsList();

  // An explicit ?view= wins. Otherwise: the table on desktops, cards on smaller screens.
  // (useMediaQuery reports false while hydrating server HTML, then the real value; the
  // loading skeleton below uses CSS breakpoints instead, so it never flips.)
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const view = params.view ?? (isDesktop ? 'table' : 'cards');

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ordering = params.ordering ?? DEFAULT_ORDERING;

  // Load the next page in the background, so "Next" usually renders instantly.
  const hasNextPage = Boolean(data?.next) && !isPlaceholderData;
  useEffect(() => {
    if (hasNextPage) prefetchList({ ...query, page: page + 1 });
  }, [hasNextPage, page, prefetchList, query]);

  // On a page change, bring the top of the results into view (the pagination is at the
  // bottom). Smooth unless the user prefers reduced motion.
  const resultsRef = useRef<HTMLElement>(null);
  function handlePageChange(next: number) {
    setPage(next);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    resultsRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  let summary = 'Loading submissions…';
  let results: ReactNode = <ListSkeleton view={params.view} count={pageSize} />;

  if (!isPending && !data) {
    // Failed with nothing to fall back on.
    summary = 'Results unavailable';
    results = (
      <ResultsError
        error={error}
        page={page}
        onRetry={() => refetch()}
        onResetFilters={clearFilters}
        onFirstPage={() => setParams({ page: undefined })}
      />
    );
  } else if (data && data.count === 0) {
    summary = describeResults(page, pageSize, 0);
    results = (
      <ResultsEmpty filtered={countActiveFilters(params) > 0} onClearFilters={clearFilters} />
    );
  } else if (data) {
    summary = describeResults(page, pageSize, data.count);
    results = (
      <Stack spacing={2}>
        {/* A refresh failed but older results are still useful: keep them, say so. */}
        {isError && (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            Couldn&apos;t refresh the results. Showing the last ones loaded.
          </Alert>
        )}

        <Box sx={{ position: 'relative' }} aria-busy={isFetching}>
          {/* Thin progress bar while new results load; it keeps its space to avoid layout
              shift. Previous results stay visible, dimmed, until the new ones arrive. */}
          <LinearProgress
            aria-label="Updating results"
            sx={{
              position: 'absolute',
              top: -10,
              left: 0,
              right: 0,
              height: 2,
              borderRadius: 1,
              visibility: isFetching ? 'visible' : 'hidden',
            }}
          />
          <Box sx={{ opacity: isPlaceholderData ? 0.55 : 1, transition: 'opacity 150ms' }}>
            {view === 'table' ? (
              <SubmissionsTable
                rows={data.results}
                ordering={ordering}
                onSort={(next) => setParams({ ordering: next })}
                onPrefetch={prefetchSubmission}
              />
            ) : (
              <SubmissionCards rows={data.results} onPrefetch={prefetchSubmission} />
            )}
          </Box>
        </Box>

        <SubmissionsPagination
          page={page}
          pageCount={Math.max(1, Math.ceil(data.count / pageSize))}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={(next) => setParams({ pageSize: next })}
        />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <SubmissionFilters
        params={params}
        onChange={setParams}
        onClear={clearFilters}
        resultCount={isPlaceholderData ? undefined : data?.count}
      />

      {/* Offset so the sticky header doesn't cover the results when scrolled into view. */}
      <Box
        component="section"
        aria-labelledby="results-heading"
        ref={resultsRef}
        sx={{ position: 'relative', scrollMarginTop: { xs: 76, md: 92 } }}
      >
        {/* Hidden heading: keeps the outline h1 Submissions > h2 Results > h3 per card for
            screen reader users, without repeating a visible title. */}
        <Typography id="results-heading" component="h2" sx={visuallyHidden}>
          Results
        </Typography>
        <Stack spacing={2}>
          <ResultsToolbar
            summary={summary}
            view={view}
            onViewChange={(next) => setParams({ view: next })}
          />
          {results}
        </Stack>
      </Box>
    </Stack>
  );
}
