'use client';

import { Box, Card, CardActionArea, Divider, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

import ActivityCounts from '@/components/submissions/ActivityCounts';
import PersonAvatar from '@/components/submissions/PersonAvatar';
import PriorityIndicator from '@/components/submissions/PriorityIndicator';
import RelativeTime from '@/components/submissions/RelativeTime';
import StatusChip from '@/components/submissions/StatusChip';
import { SUBMISSIONS_PATH } from '@/lib/submissions/constants';
import { SubmissionListItem } from '@/lib/types';

// Clamps text to a number of lines with an ellipsis.
const clampLines = (lines: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});

// Label + value pair in a card's details grid.
function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" component="p">
        {label}
      </Typography>
      <Box sx={{ typography: 'body2', fontWeight: 500 }}>{children}</Box>
    </Box>
  );
}

// One submission as a card. The whole card is a single link (CardActionArea renders
// next/link through the theme), so it holds no other interactive elements.
function SubmissionCard({
  submission,
  onPrefetch,
}: {
  submission: SubmissionListItem;
  onPrefetch: (id: number) => void;
}) {
  const { company, latestNote } = submission;

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'border-color 150ms, box-shadow 150ms',
        '&:hover': { borderColor: 'primary.main', boxShadow: '0 6px 20px rgba(33, 36, 92, 0.08)' },
      }}
    >
      <CardActionArea
        href={`${SUBMISSIONS_PATH}/${submission.id}`}
        onMouseEnter={() => onPrefetch(submission.id)}
        onFocus={() => onPrefetch(submission.id)}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Stack spacing={2} sx={{ p: 2.5, flex: 1 }}>
          {/* Header: company and status */}
          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h4" component="h3" sx={clampLines(2)}>
                {company.legalName}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {[company.industry, company.headquartersCity].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
            <Box sx={{ flexShrink: 0 }}>
              <StatusChip status={submission.status} />
            </Box>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={clampLines(2)}>
            {submission.summary || 'No summary provided.'}
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Detail label="Priority">
              <PriorityIndicator priority={submission.priority} />
            </Detail>
            <Detail label="Broker">
              <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                {submission.broker.name}
              </Typography>
            </Detail>
            <Detail label="Owner">
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                <PersonAvatar name={submission.owner.fullName} size={22} />
                <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                  {submission.owner.fullName}
                </Typography>
              </Stack>
            </Detail>
            <Detail label="Created">
              <RelativeTime iso={submission.createdAt} />
            </Detail>
          </Box>

          {/* Latest note, in a tinted box so it reads as quoted context. */}
          <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1.5, mt: 'auto' }}>
            {latestNote ? (
              <>
                <Typography variant="caption" color="text.secondary" component="p">
                  {latestNote.authorName} · <RelativeTime iso={latestNote.createdAt} />
                </Typography>
                <Typography variant="body2" sx={clampLines(2)}>
                  {latestNote.bodyPreview}
                </Typography>
              </>
            ) : (
              <Typography variant="body2" color="text.disabled">
                No notes yet
              </Typography>
            )}
          </Box>
        </Stack>

        <Divider />
        <Box sx={{ px: 2.5, py: 1.25 }}>
          <ActivityCounts
            documentCount={submission.documentCount}
            noteCount={submission.noteCount}
          />
        </Box>
      </CardActionArea>
    </Card>
  );
}

type SubmissionCardsProps = {
  rows: SubmissionListItem[];
  onPrefetch: (id: number) => void;
};

// Responsive card grid: one column on phones, two on tablets, three on desktops. Better than
// the table on small screens, and handy for reading summaries and latest notes.
export default function SubmissionCards({ rows, onPrefetch }: SubmissionCardsProps) {
  return (
    <Box
      component="ul"
      aria-label="Submissions"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      }}
    >
      {rows.map((submission) => (
        <Box component="li" key={submission.id}>
          <SubmissionCard submission={submission} onPrefetch={onPrefetch} />
        </Box>
      ))}
    </Box>
  );
}
