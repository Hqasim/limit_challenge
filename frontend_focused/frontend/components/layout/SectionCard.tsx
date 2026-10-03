import { Box, Card, Stack, Typography } from '@mui/material';
import { ReactNode, useId } from 'react';

type SectionCardProps = {
  title: string;
  // Number of items, shown as a pill next to the title (e.g. Notes 4).
  count?: number;
  // One line under the title explaining what the section shows.
  description?: ReactNode;
  // A link or button on the right of the title, e.g. "View all".
  action?: ReactNode;
  children: ReactNode;
};

// A titled card used on the detail and overview pages. Rendered as a <section> named by its
// <h2>, so screen reader users can jump between sections.
export default function SectionCard({
  title,
  count,
  description,
  action,
  children,
}: SectionCardProps) {
  const headingId = useId();

  return (
    <Card component="section" aria-labelledby={headingId}>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          px: 2.5,
          pt: 2.5,
          pb: 1.5,
        }}
      >
        <Box>
          <Typography
            id={headingId}
            variant="h4"
            component="h2"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
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
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {description}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
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
