import { Link, Typography } from '@mui/material';

import { brand } from '@/lib/brand';

// The product's own mark (deliberately not Limit's logo): a rounded square holding a short
// list of submissions, with a sky-blue status dot. app/icon.svg is the same drawing.
export function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill={brand.blue} />
      <rect x="8" y="9" width="16" height="3" rx="1.5" fill="#fff" />
      <rect x="8" y="14.5" width="11" height="3" rx="1.5" fill="#fff" fillOpacity="0.8" />
      <rect x="8" y="20" width="7" height="3" rx="1.5" fill="#fff" fillOpacity="0.6" />
      <circle cx="22.5" cy="21.5" r="2.75" fill={brand.sky} />
    </svg>
  );
}

// Mark + wordmark, linking home. `inverse` renders the wordmark white for dark surfaces.
export function BrandLogo({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      underline="none"
      aria-label="Submission Tracker home"
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, flexShrink: 0 }}
    >
      <BrandMark />
      {/* The link's aria-label already names it; the header hides the wordmark on phones. */}
      <Typography
        component="span"
        aria-hidden="true"
        sx={{
          display: { xs: inverse ? 'inline' : 'none', sm: 'inline' },
          fontSize: '1.125rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: inverse ? '#fff' : 'text.primary',
        }}
      >
        Submission Tracker
      </Typography>
    </Link>
  );
}
