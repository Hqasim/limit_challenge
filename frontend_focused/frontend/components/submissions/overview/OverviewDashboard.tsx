'use client';

import { Box, Stack } from '@mui/material';

import NeedsAttention from '@/components/submissions/overview/NeedsAttention';
import QuickViews from '@/components/submissions/overview/QuickViews';
import StatusTiles from '@/components/submissions/overview/StatusTiles';

// The overview at "/": where the pipeline stands (a tile per status), what to look at first
// (high-priority open submissions), and shortcuts into the filtered list. Each part loads and
// fails on its own, so one slow or broken request never blanks the whole page.
export default function OverviewDashboard() {
  return (
    <Stack spacing={3}>
      <StatusTiles />
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          alignItems: 'start',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
        }}
      >
        <NeedsAttention />
        <QuickViews />
      </Box>
    </Stack>
  );
}
