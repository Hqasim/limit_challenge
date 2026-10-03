import { Button } from '@mui/material';
import type { Metadata } from 'next';

import PageHeader from '@/components/layout/PageHeader';

export const metadata: Metadata = { title: 'Overview' };

// Landing page at "/": a short intro and a link to the submissions workspace.
export default function HomePage() {
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Submission overview"
        description="Browse broker-submitted opportunities, filter them by business context and inspect every record in full."
        decorated
      />
      <Button variant="contained" size="large" href="/submissions">
        Open submissions
      </Button>
    </>
  );
}
