import { Box, Card, Typography } from '@mui/material';
import { ReactNode, useId } from 'react';

type DetailSectionProps = {
  title: string;
  // Number of items, shown as a pill next to the title (e.g. Notes 4).
  count?: number;
  children: ReactNode;
};

// A titled card on the detail page. Rendered as a <section> named by its <h2>, so screen
// reader users can jump between Summary, Notes, Contacts and so on.
export default function DetailSection({ title, count, children }: DetailSectionProps) {
  const headingId = useId();

  return (
    <Card component="section" aria-labelledby={headingId}>
      <Typography
        id={headingId}
        variant="h4"
        component="h2"
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2.5, pb: 1.5 }}
      >
        {title}
        {count !== undefined && (
          <Box
            component="span"
            sx={{
              px: 1,
              borderRadius: 10,
              bgcolor: 'background.default',
              color: 'text.secondary',
              fontSize: '0.8125rem',
              fontWeight: 600,
              lineHeight: '22px',
            }}
          >
            {count}
          </Box>
        )}
      </Typography>
      <Box sx={{ px: 2.5, pb: 2.5 }}>{children}</Box>
    </Card>
  );
}

// Muted one-line message for a section with nothing in it.
export function SectionEmpty({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {children}
    </Typography>
  );
}
