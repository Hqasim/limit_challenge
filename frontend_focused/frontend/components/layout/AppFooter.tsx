'use client';

import { Box, Container, Stack, Typography } from '@mui/material';

import { BrandLogo } from '@/components/layout/BrandMark';
import { brand } from '@/lib/brand';

// Slim deep-navy footer, echoing limit.com's footer. In the dark scheme the page itself is
// navy, so the footer goes a shade darker and gets a hairline border to stay distinct.
export default function AppFooter() {
  return (
    <Box
      component="footer"
      sx={[
        { bgcolor: brand.midnight, color: 'rgba(255, 255, 255, 0.72)', py: { xs: 4, md: 5 } },
        (theme) =>
          theme.applyStyles('dark', {
            bgcolor: '#07081F',
            borderTop: `1px solid ${theme.vars.palette.divider}`,
          }),
      ]}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
        >
          <BrandLogo inverse />
          <Typography variant="body2">
            Review and triage broker-submitted opportunities. Built for the Limit front-end
            take-home.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
