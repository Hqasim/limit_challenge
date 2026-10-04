import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SubmissionDetailView from '@/components/submissions/detail/SubmissionDetailView';
import { parseSubmissionId } from '@/lib/submissions/ids';

// In Next.js 16 a dynamic segment's params arrive as a Promise.
type SubmissionPageProps = { params: Promise<{ id: string }> };

// Browser tab title, e.g. "Submission #12" (the root layout's template adds the app name).
export async function generateMetadata({ params }: SubmissionPageProps): Promise<Metadata> {
  const id = parseSubmissionId((await params).id);
  return { title: id ? `Submission #${id}` : 'Submission not found' };
}

// Detail page at /submissions/[id]. A server component: it rejects ids that cannot exist
// (/submissions/abc) with the 404 page before any API request, then hands a valid numeric id
// to the client view, which loads the record.
export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const id = parseSubmissionId((await params).id);
  if (id === null) notFound();

  return <SubmissionDetailView id={id} />;
}
