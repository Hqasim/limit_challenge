import { createTheme, Theme } from '@mui/material/styles';
import type { LinkProps } from '@mui/material/Link';
// Types theme.vars as always defined, since cssVariables is enabled below.
import type {} from '@mui/material/themeCssVarsAugmentation';
import NextLink from 'next/link';

import { brand } from '@/lib/brand';

// App-wide Material UI theme, modelled on limit.com: Inter, navy text instead of black, an
// electric-blue primary, purple and sky accents, flat bordered surfaces and uppercase
// "eyebrow" labels above headings.
//
// Two colour schemes. Light is limit.com's palette. Dark is built from limit.com's deep-navy
// footer, with lighter shades of the brand colours so text keeps AA contrast. The palette is
// emitted as CSS variables and the active scheme is a class on <html> ("light" / "dark"), so
// switching schemes changes variables only: nothing re-renders and nothing flashes.

// Light scheme surfaces.
const light = {
  border: '#E9EBF1',
  borderStrong: '#C9CCDB',
  surfaceMuted: '#F7F8FB',
};

// Dark scheme surfaces: deep navy page, slightly lighter cards.
const dark = {
  page: '#0C0E32',
  paper: '#15174A',
  border: '#2A2D62',
  borderStrong: '#45498A',
  hover: 'rgba(255, 255, 255, 0.05)',
  tooltip: '#2E3170',
};

// Tight tracking on bold headings, as on limit.com (about -0.028em at display sizes).
const heading = (fontSize: string, letterSpacing: string, fontWeight = 700) => ({
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight: 1.2,
});

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'class' },
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
        background: { default: light.surfaceMuted, paper: '#FFFFFF' },
        divider: light.border,
        action: { hover: 'rgba(45, 51, 245, 0.04)', selected: 'rgba(45, 51, 245, 0.08)' },
      },
    },
    dark: {
      palette: {
        // Light enough to read as link text on navy; filled buttons use dark text on it.
        primary: { main: '#8B90FF', dark: '#6C71FF', light: '#B3B6FF', contrastText: dark.page },
        secondary: { main: '#9B86F5', dark: '#7B61ED', light: '#C1B3FA' },
        info: { main: '#4FB3F7', dark: '#2CA1F5', light: '#8DD0FA' },
        success: { main: '#3FCB8E', dark: '#12A16B', light: '#7EDDB2' },
        warning: { main: '#F5B544', dark: '#F0A020', light: '#F8CF82' },
        error: { main: '#F2777B', dark: '#E5484D', light: '#F6A3A6' },
        text: { primary: '#EEF0FF', secondary: '#A6A9CC', disabled: '#6B6E99' },
        background: { default: dark.page, paper: dark.paper },
        divider: dark.border,
        action: { hover: dark.hover, selected: 'rgba(139, 144, 255, 0.16)' },
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
        // Keyboard focus ring for plain elements (links, native buttons, anything focusable).
        // MUI's button-like components get the same ring from MuiButtonBase below. :where()
        // keeps this selector's specificity low so components can adjust it. tabindex="-1"
        // elements (e.g. <main> as the skip-link target) are only focused by script: no ring.
        ':where(a, button, [role="button"], [tabindex]:not([tabindex="-1"])):focus-visible': {
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
      // The focus ring for every MUI button-like component (buttons, chips, menu items, sort
      // labels, pagination, card links). ButtonBase removes the browser outline, and marks
      // keyboard focus with .Mui-focusVisible.
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-focusVisible': {
            outline: `2px solid ${theme.vars.palette.primary.main}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 8, paddingInline: 16 },
        sizeLarge: { paddingBlock: 10, paddingInline: 22, fontSize: '1rem' },
        // Limit's secondary button: white, hairline border, dark-blue label.
        outlined: ({ theme }) => [
          {
            backgroundColor: theme.vars.palette.background.paper,
            borderColor: theme.vars.palette.divider,
            '&:hover': { borderColor: light.borderStrong, backgroundColor: light.surfaceMuted },
          },
          theme.applyStyles('dark', {
            '&:hover': { borderColor: dark.borderStrong, backgroundColor: dark.hover },
          }),
        ],
        outlinedPrimary: ({ theme }) => [
          { color: theme.vars.palette.primary.dark },
          theme.applyStyles('dark', { color: theme.vars.palette.primary.light }),
        ],
      },
    },
    // Menu items fill their menu edge to edge, so their focus ring is drawn inside them rather
    // than outside, where the menu would clip it.
    MuiMenuItem: {
      styleOverrides: {
        root: { '&.Mui-focusVisible': { outlineOffset: -2 } },
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
        root: ({ theme }) => [
          {
            backgroundColor: theme.vars.palette.background.paper,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: theme.vars.palette.divider },
            '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
              borderColor: light.borderStrong,
            },
          },
          theme.applyStyles('dark', {
            '&:hover:not(.Mui-focused) .MuiOutlinedInput-notchedOutline': {
              borderColor: dark.borderStrong,
            },
          }),
        ],
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
        head: ({ theme }) => ({
          backgroundColor: theme.vars.palette.background.default,
          color: theme.vars.palette.text.secondary,
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }),
      },
    },
    // Navy tooltips; on the navy dark scheme they are lifted to a lighter navy to stand out.
    MuiTooltip: {
      defaultProps: { arrow: true },
      styleOverrides: {
        tooltip: ({ theme }) => [
          { backgroundColor: brand.navy, fontSize: '0.75rem', fontWeight: 500 },
          theme.applyStyles('dark', { backgroundColor: dark.tooltip }),
        ],
        arrow: ({ theme }) => [
          { color: brand.navy },
          theme.applyStyles('dark', { color: dark.tooltip }),
        ],
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.vars.palette.divider,
          color: theme.vars.palette.text.secondary,
          '&.Mui-selected': {
            color: theme.vars.palette.primary.main,
            backgroundColor: theme.vars.palette.action.selected,
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
          // MUI lightens dark-mode surfaces with a gradient overlay; keep the flat look.
          backgroundImage: 'none',
        }),
      },
    },
  },
});

// Palette colours used for tinted badges.
export type TintColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

// A softly tinted badge in `color` (status chips, avatars): text in the colour's darker
// shade on a light tint, and in its lighter shade on a stronger tint in the dark scheme, so it
// keeps AA contrast in both. Use as `sx={tinted('info')}` or `sx={[{ ... }, ...tinted('info')]}`.
export function tinted(color: TintColor, opacity = 0.12) {
  return [
    (theme: Theme) => ({
      color: theme.vars.palette[color].dark,
      backgroundColor: `rgba(${theme.vars.palette[color].mainChannel} / ${opacity})`,
    }),
    (theme: Theme) =>
      theme.applyStyles('dark', {
        color: theme.vars.palette[color].light,
        backgroundColor: `rgba(${theme.vars.palette[color].mainChannel} / ${opacity + 0.08})`,
      }),
  ];
}
