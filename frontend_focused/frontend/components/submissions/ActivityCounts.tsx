'use client';

import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { ReactNode } from 'react';

import { visuallyHidden } from '@/lib/a11y';
import { formatCount, formatRelativeTime } from '@/lib/format';
import { NoteSummary } from '@/lib/types';

// One icon + number, e.g. a document icon and "2". Sighted users get the details in a
// tooltip; screen readers get `label` as hidden text instead of a bare number.
function Count({
  icon,
  count,
  label,
  tooltip = label,
}: {
  icon: ReactNode;
  count: number;
  label: string;
  tooltip?: ReactNode;
}) {
  return (
    <Tooltip title={tooltip} describeChild>
      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          // Zero counts use the same colour: a lighter grey would fall below AA contrast.
          color: 'text.secondary',
          '& svg': { fontSize: 16 },
        }}
      >
        <Box component="span" aria-hidden="true" sx={{ display: 'inline-flex', gap: 0.5 }}>
          {icon}
          {count}
        </Box>
        <Box component="span" sx={visuallyHidden}>
          {label}
        </Box>
      </Box>
    </Tooltip>
  );
}

// "3 notes", then who wrote the latest one, when, and its opening words.
function NotesTooltip({ label, latestNote }: { label: string; latestNote: NoteSummary }) {
  return (
    <Box sx={{ maxWidth: 280, py: 0.25 }}>
      <Typography variant="caption" component="p" sx={{ fontWeight: 600 }}>
        {label} · latest by {latestNote.authorName}, {formatRelativeTime(latestNote.createdAt)}
      </Typography>
      <Typography variant="caption" component="p" sx={{ opacity: 0.85 }}>
        {latestNote.bodyPreview}
      </Typography>
    </Box>
  );
}

type ActivityCountsProps = {
  documentCount: number;
  noteCount: number;
  // When given, hovering the note count previews the latest note (used by the table, which
  // has no room for a note column).
  latestNote?: NoteSummary | null;
};

// Document and note counts for a submission, shown in table rows and cards.
export default function ActivityCounts({
  documentCount,
  noteCount,
  latestNote,
}: ActivityCountsProps) {
  const notesLabel = formatCount(noteCount, 'note');

  return (
    <Stack direction="row" spacing={1.5} sx={{ typography: 'body2' }}>
      <Count
        icon={<DescriptionOutlinedIcon sx={{ marginTop: '2px' }} />}
        count={documentCount}
        label={formatCount(documentCount, 'document')}
      />
      <Count
        icon={<ChatBubbleOutlineRoundedIcon sx={{ marginTop: '3px' }} />}
        count={noteCount}
        label={notesLabel}
        tooltip={
          latestNote ? <NotesTooltip label={notesLabel} latestNote={latestNote} /> : notesLabel
        }
      />
    </Stack>
  );
}
