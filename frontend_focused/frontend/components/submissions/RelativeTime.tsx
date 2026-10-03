'use client';

import { Box, Tooltip } from '@mui/material';

import { formatDateTime, formatRelativeTime } from '@/lib/format';

// "3 days ago", with the exact date and time in a tooltip. `describeChild` keeps the visible
// text as what screen readers announce (the tooltip becomes a description, not a rename), and
// the machine-readable date sits in the <time> element's dateTime attribute.
export default function RelativeTime({ iso }: { iso: string }) {
  return (
    <Tooltip title={formatDateTime(iso)} describeChild>
      <Box component="time" dateTime={iso} sx={{ whiteSpace: 'nowrap' }}>
        {formatRelativeTime(iso)}
      </Box>
    </Tooltip>
  );
}
