'use client';

import { Button, Card, CardContent, Divider, Typography } from '@mui/material';
import { useParams } from 'next/navigation';

import PageHeader from '@/components/layout/PageHeader';
import { submissionDetailQueryKey, useSubmissionDetail } from '@/lib/hooks/useSubmissions';

// Detail page at /submissions/[id]: one submission's full record (currently a placeholder).
export default function SubmissionDetailPage() {
  // [id] is the dynamic URL segment, e.g. "12" for /submissions/12 (always a string).
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  // Disabled in the hook, so no request is made yet.
  const detailQuery = useSubmissionDetail(submissionId);

  return (
    <>
      {/* The back link does not carry the list's filters, so they reset unless they live in
          the URL. */}
      <PageHeader
        eyebrow={`Submission #${submissionId}`}
        title="Submission detail"
        description="Use this page to present the full submission payload along with contacts, documents, and notes."
        actions={
          <Button variant="outlined" href="/submissions">
            Back to list
          </Button>
        }
      />

      {/* Placeholder that prints the id, query key and query status. Replace with summary,
          contacts, documents and notes sections plus loading/error/not-found states.
          The key is rebuilt with submissionDetailQueryKey because useQuery results do not
          expose a `queryKey` property. */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            API data placeholder
          </Typography>
          <Typography color="text.secondary">
            The React Query call is disabled until you turn it on. Once you enable it and wire up
            serializers on the backend you can render key facts, contacts, documents, and note
            timelines.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <pre style={{ margin: 0, fontSize: 14 }}>
            {JSON.stringify(
              {
                submissionId,
                queryKey: submissionDetailQueryKey(submissionId),
                status: detailQuery.status,
              },
              null,
              2,
            )}
          </pre>
        </CardContent>
      </Card>
    </>
  );
}
