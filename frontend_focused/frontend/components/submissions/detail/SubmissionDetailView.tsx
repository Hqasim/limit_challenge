'use client';

import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { Box, Breadcrumbs, Button, Card, Link, Snackbar, Stack, Typography } from '@mui/material';

import ErrorState from '@/components/feedback/ErrorState';
import PageHeader from '@/components/layout/PageHeader';
import ContactsSection from '@/components/submissions/detail/ContactsSection';
import SectionCard from '@/components/layout/SectionCard';
import DetailSkeleton from '@/components/submissions/detail/DetailSkeleton';
import DocumentsSection from '@/components/submissions/detail/DocumentsSection';
import EmailBrokerMenu from '@/components/submissions/detail/EmailBrokerMenu';
import NotesTimeline from '@/components/submissions/detail/NotesTimeline';
import PartiesSection from '@/components/submissions/detail/PartiesSection';
import PriorityIndicator from '@/components/submissions/PriorityIndicator';
import RelativeTime from '@/components/submissions/RelativeTime';
import StatusChip from '@/components/submissions/StatusChip';
import { toApiError } from '@/lib/api-errors';
import { formatDate } from '@/lib/format';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { useListReturnHref } from '@/lib/submissions/list-return';

// The /submissions/[id] page body: one submission's full record. Summary and the notes
// timeline take the wide column; the parties, contacts and documents sit alongside.
export default function SubmissionDetailView({ id }: { id: number }) {
  const { data: submission, isPending, error, refetch } = useSubmissionDetail(id);
  // Back to the list with the filters, sort and page the user last had.
  const listHref = useListReturnHref();
  const clipboard = useCopyToClipboard();

  const breadcrumbs = (
    <Breadcrumbs aria-label="Breadcrumb" sx={{ mb: 2, typography: 'body2' }}>
      <Link href={listHref} sx={{ fontWeight: 600 }}>
        Submissions
      </Link>
      <Typography
        variant="body2"
        color="text.primary"
        aria-current="page"
        noWrap
        sx={{ maxWidth: { xs: 220, sm: 480 } }}
      >
        {submission?.company.legalName ?? `Submission #${id}`}
      </Typography>
    </Breadcrumbs>
  );

  if (isPending) {
    return (
      <>
        {breadcrumbs}
        <DetailSkeleton />
      </>
    );
  }

  if (!submission) {
    const notFound = toApiError(error).kind === 'not_found';
    const backButton = (
      <Button variant={notFound ? 'contained' : 'outlined'} href={listHref}>
        Back to submissions
      </Button>
    );
    return (
      <>
        {breadcrumbs}
        <Card>
          {notFound ? (
            <ErrorState
              titleComponent="h1"
              title={`Submission #${id} not found`}
              description="It may have been removed, or the link may be incorrect."
              actions={backButton}
            />
          ) : (
            <ErrorState
              titleComponent="h1"
              title="Couldn't load this submission"
              description={toApiError(error).message}
              onRetry={() => refetch()}
              actions={backButton}
            />
          )}
        </Card>
      </>
    );
  }

  const { company, broker } = submission;

  return (
    <>
      {breadcrumbs}
      <PageHeader
        eyebrow={`Submission #${submission.id}`}
        title={company.legalName}
        description={
          <Stack
            direction="row"
            sx={{ flexWrap: 'wrap', alignItems: 'center', columnGap: 1.5, rowGap: 1 }}
          >
            <StatusChip status={submission.status} />
            <PriorityIndicator priority={submission.priority} />
            <Typography variant="body2" color="text.secondary">
              Created {formatDate(submission.createdAt)} · Updated{' '}
              <RelativeTime iso={submission.updatedAt} />
            </Typography>
          </Stack>
        }
        actions={
          <>
            <Button
              variant="outlined"
              startIcon={<LinkRoundedIcon />}
              onClick={() => clipboard.copy(window.location.href, 'Link copied')}
            >
              Copy link
            </Button>
            {/* Only when the broker has an address on file. */}
            {broker.primaryContactEmail && (
              <EmailBrokerMenu
                email={broker.primaryContactEmail}
                subject={`Submission #${submission.id}: ${company.legalName}`}
                onCopy={clipboard.copy}
              />
            )}
          </>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          alignItems: 'start',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(0, 1fr)' },
        }}
      >
        <Stack spacing={3}>
          <SectionCard title="Summary">
            <Typography sx={{ whiteSpace: 'pre-line' }}>
              {submission.summary || 'No summary provided.'}
            </Typography>
          </SectionCard>
          <NotesTimeline notes={submission.notes} />
        </Stack>

        <Stack spacing={3}>
          <PartiesSection submission={submission} />
          <ContactsSection contacts={submission.contacts} onCopy={clipboard.copy} />
          <DocumentsSection documents={submission.documents} />
        </Stack>
      </Box>

      <Snackbar
        open={clipboard.feedback.open}
        message={clipboard.feedback.message}
        autoHideDuration={3000}
        onClose={clipboard.close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
