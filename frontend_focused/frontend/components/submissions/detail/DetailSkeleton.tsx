import { Box, Card, Skeleton, Stack } from '@mui/material';

import { visuallyHidden } from '@/lib/a11y';

// A section card placeholder with a title and `lines` lines of text.
function SectionSkeleton({ lines }: { lines: number }) {
  return (
    <Card sx={{ p: 2.5 }}>
      <Skeleton width={120} height={28} />
      {Array.from({ length: lines }, (_, line) => (
        <Skeleton key={line} width={`${90 - line * 8}%`} />
      ))}
    </Card>
  );
}

// Loading placeholder shaped like the detail page (header, then the two columns), so the
// page does not jump when the data arrives.
export default function DetailSkeleton() {
  return (
    <Box role="status" aria-busy="true">
      <Box component="span" sx={visuallyHidden}>
        Loading submission
      </Box>
      <Stack spacing={1} sx={{ mb: 4 }} aria-hidden="true">
        <Skeleton width={140} />
        <Skeleton width="45%" height={48} />
        <Skeleton width={300} />
      </Stack>
      <Box
        aria-hidden="true"
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
        }}
      >
        <Stack spacing={3}>
          <SectionSkeleton lines={3} />
          <SectionSkeleton lines={6} />
        </Stack>
        <Stack spacing={3}>
          <SectionSkeleton lines={5} />
          <SectionSkeleton lines={3} />
        </Stack>
      </Box>
    </Box>
  );
}
