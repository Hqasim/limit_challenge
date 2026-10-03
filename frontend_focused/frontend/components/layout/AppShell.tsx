import { Box, Container } from '@mui/material';
import { PropsWithChildren } from 'react';

import AppFooter from '@/components/layout/AppFooter';
import AppHeader from '@/components/layout/AppHeader';

// Frame shared by every page: skip link, sticky header, the page content in a centred column,
// and the footer pinned to the bottom on short pages.
export default function AppShell({ children }: PropsWithChildren) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Keyboard users can jump past the navigation; hidden until it receives focus. */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 16,
          top: -64,
          zIndex: 'tooltip',
          px: 2,
          py: 1,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 600,
          textDecoration: 'none',
          '&:focus': { top: 12 },
        }}
      >
        Skip to content
      </Box>

      <AppHeader />

      <Box component="main" id="main-content" tabIndex={-1} sx={{ flex: 1, outline: 'none' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
          {children}
        </Container>
      </Box>

      <AppFooter />
    </Box>
  );
}
