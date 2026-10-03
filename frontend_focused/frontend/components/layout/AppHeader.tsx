'use client';

import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { AppBar, Box, Button, Container, Toolbar } from '@mui/material';
import { usePathname } from 'next/navigation';

import { BrandLogo } from '@/components/layout/BrandMark';
import { apiDocsUrl } from '@/lib/api-client';

// Primary navigation. `isActive` decides which item is highlighted for the current path, so
// /submissions/12 still highlights "Submissions".
const NAV_ITEMS = [
  { label: 'Overview', href: '/', isActive: (path: string) => path === '/' },
  {
    label: 'Submissions',
    href: '/submissions',
    isActive: (path: string) => path.startsWith('/submissions'),
  },
];

// Sticky white header, as on limit.com: logo on the left, grey text links on the right with
// an underline on the active one, and an outlined button (here: the backend's API docs).
export default function AppHeader() {
  const pathname = usePathname();

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 72 }, gap: 2 }}>
          <BrandLogo />

          <Box
            component="nav"
            aria-label="Main"
            sx={{ ml: 'auto', alignSelf: 'stretch', display: 'flex', alignItems: 'stretch' }}
          >
            {NAV_ITEMS.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Button
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  disableRipple
                  sx={{
                    position: 'relative',
                    borderRadius: 0,
                    px: { xs: 1.25, md: 2 },
                    fontWeight: 600,
                    color: active ? 'text.primary' : 'text.secondary',
                    '&:hover': { backgroundColor: 'transparent', color: 'text.primary' },
                    // Active indicator: a short bar along the bottom edge of the header.
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: { xs: 10, md: 16 },
                      right: { xs: 10, md: 16 },
                      bottom: 0,
                      height: 2,
                      borderRadius: 1,
                      backgroundColor: active ? 'primary.main' : 'transparent',
                    },
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* External link to the backend's Swagger UI; hidden on phones to save room. */}
          <Button
            variant="outlined"
            color="primary"
            href={apiDocsUrl}
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewRoundedIcon fontSize="small" />}
            sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
          >
            API docs
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
