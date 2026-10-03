import { Box, Button, Stack } from '@mui/material';

import PageHeader from '@/components/layout/PageHeader';

// Branded 404, shown for unknown URLs and whenever a route calls notFound() (e.g. a
// non-numeric submission id). Server component; Buttons with an href navigate through
// next/link via the theme (lib/theme.ts).
export default function NotFound() {
  return (
    <Box sx={{ py: { xs: 2, md: 6 } }}>
      <PageHeader
        eyebrow="Error 404"
        title="This page doesn't exist"
        description="The link may be broken or the page may have moved. Head to the submissions workspace, or start from the overview."
        decorated
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button variant="contained" size="large" href="/submissions">
          Open submissions
        </Button>
        <Button variant="outlined" size="large" href="/">
          Go to overview
        </Button>
      </Stack>
    </Box>
  );
}
