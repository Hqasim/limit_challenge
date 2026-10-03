'use client';

import { Stack, Typography } from '@mui/material';

import ViewToggle from '@/components/submissions/list/ViewToggle';
import { formatCount, formatNumber } from '@/lib/format';
import { ListView } from '@/lib/types';

// "Showing 11–20 of 25 submissions" for a page of results.
export function describeResults(page: number, pageSize: number, count: number): string {
  if (count === 0) return 'No submissions';
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, count);
  if (from === 1 && to === count) return `Showing ${formatCount(count, 'submission')}`;
  return `Showing ${formatNumber(from)}–${formatNumber(to)} of ${formatCount(count, 'submission')}`;
}

type ResultsToolbarProps = {
  // What is being shown, e.g. describeResults(...) or "Loading submissions…".
  summary: string;
  view: ListView;
  onViewChange: (view: ListView) => void;
};

// Bar above the results: what is being shown, and the table/cards switch.
export default function ResultsToolbar({ summary, view, onViewChange }: ResultsToolbarProps) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      {/* Announced politely whenever the results change (new filter, new page). */}
      <Typography color="text.secondary" variant="body2" aria-live="polite" aria-atomic="true">
        {summary}
      </Typography>
      <ViewToggle value={view} onChange={onViewChange} />
    </Stack>
  );
}
