import { alpha, createTheme } from '@mui/material/styles';
import type { LinkProps } from '@mui/material/Link';
// Types theme.vars as always defined, since cssVariables is enabled below.
import type {} from '@mui/material/themeCssVarsAugmentation';
import NextLink from 'next/link';

import { brand } from '@/lib/brand';

// App-wide Material UI theme, modelled on limit.com: Inter, navy text instead of black, an
// electric-blue primary, purple and sky accents, flat bordered surfaces and uppercase
// "eyebrow" labels above headings.

const border = '#E9EBF1';
const borderStrong = '#C9CCDB';
const surfaceMuted = '#F7F8FB';

// Tight tracking on bold headings, as on limit.com (about -0.028em at display sizes).
const heading = (fontSize: string, letterSpacing: string, fontWeight = 700) => ({
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight: 1.2,
});

export const theme = createTheme({
  // Emit the palette as CSS variables (var(--mui-palette-...)). Components read colours
  // through theme.vars, so adding a dark colour scheme later needs no component changes.
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: brand.blue, dark: '#1F23AB', light: '#5C61F7', contrastText: '#FFFFFF' },
        secondary: { main: brand.purple, dark: '#4B2FC4', light: '#7B61ED' },
        info: { main: brand.sky, dark: '#0B6CB3', light: '#6CC0F8' },
        success: { main: '#12A16B', dark: '#0B7A50', light: '#4CC596' },
        warning: { main: '#F0A020', dark: '#9A5B00', light: '#F7C567' },
        error: { main: '#E5484D', dark: '#B42318', light: '#F08A8D' },
        text: { primary: brand.navy, secondary: '#5A5C7E', disabled: '#9A9CB5' },
        background: { default: surfaceMuted, paper: '#FFFFFF' },
        divider: border,
        action: { hover: alpha(brand.blue, 0.04), selected: alpha(brand.blue, 0.08) },
      },
    },
  },
  shape: { borderRadius: 8 },
  typography: {
    // --font-inter is set on <html> by next/font in app/layout.tsx.
    fontFamily: 'var(--font-inter), Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    h1: {
      ...heading('2.25rem', '-0.028em'),
      '@media (max-width:600px)': { fontSize: '1.75rem' },
    },
    h2: heading('1.75rem', '-0.024em'),
    h3: heading('1.375rem', '-0.02em'),
    h4: heading('1.125rem', '-0.016em'),
    h5: heading('1rem', '-0.01em', 600),
    h6: heading('0.9375rem', '-0.005em', 600),
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    body2: { lineHeight: 1.55 },
    // Eyebrow label: small, bold, uppercase and widely tracked.
    overline: { fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.08em', lineHeight: 1.5 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
        // One visible keyboard focus ring for every interactive element.
        // tabindex="-1" elements (e.g. <main> as the skip-link target) are only focused by
        // script, so they get no ring.
        'a:focus-visible, button:focus-visible, [role="button"]:focus-visible, [tabindex]:not([tabindex="-1"]):focus-visible':
          {
            outline: `2px solid ${theme.vars.palette.primary.main}`,
            outlineOffset: 2,
          },
        // Respect the OS "reduce motion" setting for transitions, skeleton pulses and scrolling.
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      }),
    },
    // Container maxWidth="lg" grows to 1360px on large screens: a 1312px content column like
    // limit.com's, which also gives the submissions table room for its columns.
    MuiContainer: {
      styleOverrides: {
        maxWidthLg: ({ theme }) => ({ [theme.breakpoints.up('lg')]: { maxWidth: 1360 } }),
      },
    },
    // Every MUI Link, and every Button/ButtonBase given an href, navigates client-side through
    // next/link (MUI's documented routing integration). Non-route hrefs such as mailto: or
    // external URLs still behave as plain anchors.
    MuiLink: {
      defaultProps: { component: NextLink, underline: 'hover' } as LinkProps,
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiButtonBase: {
      defaultProps: { LinkComponent: NextLink },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 16 },
        sizeLarge: { paddingBlock: 10, paddingInline: 22, fontSize: '1rem' },
        // Limit's secondary button: white, hairline border, dark-blue label.
        outlined: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.paper,
          borderColor: theme.vars.palette.divider,
          '&:hover': { borderColor: borderStrong, backgroundColor: surfaceMuted },
        }),
        outlinedPrimary: ({ theme }) => ({ color: theme.vars.palette.primary.dark }),
      },
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8, fontWeight: 600 },
        sizeSmall: { fontSize: '0.75rem' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.paper,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.divider },
          '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
            borderColor: borderStrong,
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
        head: ({ theme }) => ({
          backgroundColor: surfaceMuted,
          color: theme.vars.palette.text.secondary,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }),
      },
    },
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: { backgroundColor: brand.navy, fontSize: '0.75rem', fontWeight: 500 },
        arrow: { color: brand.navy },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
          color: theme.vars.palette.text.secondary,
          '&.Mui-selected': {
            color: theme.vars.palette.primary.main,
            backgroundColor: alpha(brand.blue, 0.08),
          },
        }),
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'inherit' },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.paper,
          borderBottom: `1px solid ${theme.vars.palette.divider}`,
        }),
      },
    },
  },
});
