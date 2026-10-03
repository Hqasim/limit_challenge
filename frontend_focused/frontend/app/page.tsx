import type { Metadata } from 'next';

import PageHeader from '@/components/layout/PageHeader';
import OverviewDashboard from '@/components/submissions/overview/OverviewDashboard';

export const metadata: Metadata = { title: 'Overview' };

// Home page at "/": a summary of the submission pipeline. A server component for the static
// heading; the live dashboard below is a client component.
export default function OverviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Submission overview"
        description="Where the broker pipeline stands today, and what needs attention first."
        decorated
      />
      <OverviewDashboard />
    </>
  );
}
