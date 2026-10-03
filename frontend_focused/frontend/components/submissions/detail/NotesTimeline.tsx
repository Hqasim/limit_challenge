'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import SectionCard, { SectionEmpty } from '@/components/layout/SectionCard';
import PersonAvatar from '@/components/submissions/PersonAvatar';
import RelativeTime from '@/components/submissions/RelativeTime';
import { clampLines } from '@/lib/sx';
import { NoteDetail } from '@/lib/types';

// Notes longer than this start collapsed to four lines, with "Show more".
const LONG_NOTE_CHARACTERS = 320;

function NoteItem({ note, isLast }: { note: NoteDetail; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const long = note.body.length > LONG_NOTE_CHARACTERS;

  return (
    <Box
      component="li"
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '36px minmax(0, 1fr)',
        columnGap: 1.5,
        pb: isLast ? 0 : 3,
      }}
    >
      {/* The vertical line joining one note's avatar to the next. */}
      {!isLast && (
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            left: 17,
            top: 44,
            bottom: 6,
            width: 2,
            borderRadius: 1,
            bgcolor: 'divider',
          }}
        />
      )}
      <PersonAvatar name={note.authorName} size={36} />
      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {note.authorName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <RelativeTime iso={note.createdAt} />
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, whiteSpace: 'pre-line', ...(long && !expanded ? clampLines(4) : {}) }}
        >
          {note.body}
        </Typography>
        {long && (
          <Button
            size="small"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
            sx={{ mt: 0.5, px: 0.5, ml: -0.5 }}
          >
            {expanded ? 'Show less' : 'Show more'}
          </Button>
        )}
      </Box>
    </Box>
  );
}

// Collaboration history, newest first (the order the API returns).
export default function NotesTimeline({ notes }: { notes: NoteDetail[] }) {
  return (
    <SectionCard title="Notes" count={notes.length}>
      {notes.length === 0 ? (
        <SectionEmpty>No notes yet.</SectionEmpty>
      ) : (
        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {notes.map((note, index) => (
            <NoteItem key={note.id} note={note} isLast={index === notes.length - 1} />
          ))}
        </Box>
      )}
    </SectionCard>
  );
}
