import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

import LineArt from '@/components/layout/LineArt';

// Eyebrow colours. Both pass WCAG AA contrast for small text on the page background (the
// brighter brand sky does not, so the sky variant uses its darker shade).
const EYEBROW_COLOR = {
  purple: 'secondary.main',
  sky: 'info.dark',
} as const;

type PageHeaderProps = {
  // Small uppercase label above the title, e.g. "Workspace" or "Submission #12".
  eyebrow?: ReactNode;
  eyebrowTone?: keyof typeof EYEBROW_COLOR;
  title: ReactNode;
  description?: ReactNode;
  // Buttons or other controls shown on the right (below the title on phones).
  actions?: ReactNode;
  // Adds the decorative line art behind the header's right side (desktop only). It shares
  // that space with `actions`, so use one or the other.
  decorated?: boolean;
};

// Page heading block used by every page, so titles, spacing and the eyebrow style stay
// consistent. Renders the page's single <h1>.
export default function PageHeader({
  eyebrow,
  eyebrowTone = 'purple',
  title,
  description,
  actions,
  decorated = false,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { md: 'flex-end' },
        justifyContent: 'space-between',
        gap: 2,
        mb: { xs: 3, md: 4 },
      }}
    >
      {decorated && (
        <LineArt
          sx={{ position: 'absolute', right: 0, top: -28, display: { xs: 'none', md: 'block' } }}
        />
      )}

      <Box sx={{ position: 'relative', maxWidth: 720 }}>
        {eyebrow && (
          <Typography
            variant="overline"
            component="p"
            sx={{ color: EYEBROW_COLOR[eyebrowTone], mb: 0.5 }}
          >
            {eyebrow}
          </Typography>
        )}
        <Typography variant="h1">{title}</Typography>
        {description && (
          <Typography color="text.secondary" sx={{ mt: 1, fontSize: { md: '1.0625rem' } }}>
            {description}
          </Typography>
        )}
      </Box>

      {actions && (
        <Box sx={{ position: 'relative', display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}
