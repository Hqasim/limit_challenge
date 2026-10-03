// Hides content visually while keeping it available to screen readers (the standard
// "sr-only" pattern). Use as `sx={visuallyHidden}`.
export const visuallyHidden = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: '1px',
  width: '1px',
  margin: '-1px',
  overflow: 'hidden',
  padding: 0,
  position: 'absolute',
  whiteSpace: 'nowrap',
} as const;
