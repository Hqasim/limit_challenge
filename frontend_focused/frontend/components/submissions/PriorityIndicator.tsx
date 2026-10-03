import { Box, Typography } from '@mui/material';

import { PRIORITY_META } from '@/lib/submissions/constants';
import { SubmissionPriority } from '@/lib/types';

// Coloured dot plus the priority's name; colour is never the only signal.
export default function PriorityIndicator({ priority }: { priority: SubmissionPriority }) {
  const { label, dotColor } = PRIORITY_META[priority];

  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
      <Box
        component="span"
        aria-hidden="true"
        sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: dotColor, flexShrink: 0 }}
      />
      <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  );
}
