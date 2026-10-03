import type { Metadata } from 'next';
import { Suspense } from 'react';

import PageHeader from '@/components/layout/PageHeader';
import { WorkspaceSkeleton } from '@/components/submissions/list/ListSkeleton';
import SubmissionsWorkspace from '@/components/submissions/list/SubmissionsWorkspace';

export const metadata: Metadata = { title: 'Submissions' };

// List page at /submissions. A server component, so it can set the page title; the
// interactive workspace below is a client component.
export default function SubmissionsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Submissions"
        description="Review and triage broker-submitted opportunities."
      />
      {/* The workspace reads the URL with useSearchParams, which Next.js requires to sit
          inside a Suspense boundary: the static page shell is prerendered and the
          URL-dependent part renders in the browser. */}
      <Suspense fallback={<WorkspaceSkeleton />}>
        <SubmissionsWorkspace />
      </Suspense>
    </>
  );
}
