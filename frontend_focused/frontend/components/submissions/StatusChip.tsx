'use client';

import { Chip } from '@mui/material';

import { STATUS_META } from '@/lib/submissions/constants';
import { tinted } from '@/lib/theme';
import { SubmissionStatus } from '@/lib/types';

// Status as a soft tinted chip in the status colour, readable (WCAG AA) in both the light
// and dark schemes while staying visually distinct.
export default function StatusChip({ status }: { status: SubmissionStatus }) {
  const { label, color } = STATUS_META[status];
  return <Chip size="small" label={label} sx={tinted(color)} />;
}
