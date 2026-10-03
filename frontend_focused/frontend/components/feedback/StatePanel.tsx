'use client';

import { Box, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';

export type StatePanelTone = 'primary' | 'error';

export type StatePanelProps = {
  icon: ReactNode;
  tone?: StatePanelTone;
  title: ReactNode;
  description?: ReactNode;
  // Buttons shown under the text (e.g. "Retry", "Clear filters").
  actions?: ReactNode;
  // Smaller padding and heading, for use inside a card next to other content.
  compact?: boolean;
  // Heading level for the title, so it fits the surrounding document outline.
  titleComponent?: 'h2' | 'h3';
  // "alert" announces errors immediately; "status" announces politely (empty states).
  role: 'alert' | 'status';
};

// Centred icon + title + description + actions layout shared by the empty and error states,
// so every "nothing to show" moment in the app looks and behaves the same.
export default function StatePanel({
  icon,
  tone = 'primary',
  title,
  description,
  actions,
  compact = false,
  titleComponent = 'h2',
  role,
}: StatePanelProps) {
  return (
    <Box
      role={role}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1,
        px: 2,
        py: compact ? 3 : { xs: 5, md: 7 },
      }}
    >
      {/* Icon in a softly tinted circle of the tone's colour. */}
      <Box
        aria-hidden="true"
        sx={(theme) => ({
          display: 'grid',
          placeItems: 'center',
          width: compact ? 44 : 56,
          height: compact ? 44 : 56,
          mb: 1,
          borderRadius: '50%',
          color: theme.vars.palette[tone].main,
          backgroundColor: `rgba(${theme.vars.palette[tone].mainChannel} / 0.1)`,
        })}
      >
        {icon}
      </Box>
      <Typography variant={compact ? 'h5' : 'h3'} component={titleComponent}>
        {title}
      </Typography>
      {description && (
        <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
          {description}
        </Typography>
      )}
      {actions && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ mt: 1.5, alignItems: 'center' }}
        >
          {actions}
        </Stack>
      )}
    </Box>
  );
}
