'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { submissionDetailQueryKey, useSubmissionDetail } from '@/lib/hooks/useSubmissions';

// Detail page at /submissions/[id]: one submission's full record (currently a placeholder).
export default function SubmissionDetailPage() {
  // [id] is the dynamic URL segment, e.g. "12" for /submissions/12 (always a string).
  const params = useParams<{ id: string }>();
  const submissionId = params?.id ?? '';

  // Disabled in the hook, so no request is made yet.
  const detailQuery = useSubmissionDetail(submissionId);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Stack spacing={3}>
        {/* Header with title and a client-side link back to the list. The link does not
            carry the list's filters, so they reset unless they live in the URL. */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <div>
            <Typography variant="h4">Submission detail</Typography>
            <Typography color="text.secondary">
              Use this page to present the full submission payload along with contacts, documents,
              and notes.
            </Typography>
          </div>
          <MuiLink component={Link} href="/submissions" underline="none">
            Back to list
          </MuiLink>
        </Box>

        {/* Placeholder that prints the id, query key and query status. Replace with summary,
            contacts, documents and notes sections plus loading/error/not-found states.
            The key is rebuilt with submissionDetailQueryKey because useQuery results do not
            expose a `queryKey` property. */}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
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
      </Stack>
    </Container>
  );
}
