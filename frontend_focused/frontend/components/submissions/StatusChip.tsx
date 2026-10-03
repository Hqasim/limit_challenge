'use client';

import { Chip } from '@mui/material';

import { STATUS_META } from '@/lib/submissions/constants';
import { SubmissionStatus } from '@/lib/types';

// Status as a soft tinted chip: the status colour at 12% behind its darker shade as text,
// which keeps every status readable (WCAG AA) while staying visually distinct.
export default function StatusChip({ status }: { status: SubmissionStatus }) {
  const { label, color } = STATUS_META[status];

  return (
    <Chip
      size="small"
      label={label}
      sx={(theme) => ({
        color: theme.vars.palette[color].dark,
        backgroundColor: `rgba(${theme.vars.palette[color].mainChannel} / 0.12)`,
      })}
    />
  );
}
