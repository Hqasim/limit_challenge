'use client';

import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import { useParams } from 'next/navigation';

import PageHeader from '@/components/layout/PageHeader';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { useListReturnHref } from '@/lib/submissions/list-return';

// Detail page at /submissions/[id]: one submission's full record (currently a debug view of
// the live query).
export default function SubmissionDetailPage() {
  // [id] is the dynamic URL segment, e.g. "12" for /submissions/12 (always a string).
  const { id } = useParams<{ id: string }>();
  const detailQuery = useSubmissionDetail(Number(id));
  // Back to the list with the filters the user last had.
  const listHref = useListReturnHref();

  return (
    <>
      <PageHeader
        eyebrow={`Submission #${id}`}
        title={detailQuery.data?.company.legalName ?? 'Submission detail'}
        actions={
          <Button variant="outlined" href={listHref}>
            Back to submissions
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2" gutterBottom>
            API data
          </Typography>
          <Box component="pre" sx={{ m: 0, fontSize: 13, overflowX: 'auto' }}>
            {JSON.stringify(
              {
                status: detailQuery.status,
                contacts: detailQuery.data?.contacts.length,
                documents: detailQuery.data?.documents.length,
                notes: detailQuery.data?.notes.length,
              },
              null,
              2,
            )}
          </Box>
        </CardContent>
      </Card>
    </>
  );
}
