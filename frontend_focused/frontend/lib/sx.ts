// Small reusable style objects for MUI's `sx` prop.

// Shows at most `lines` lines of text, ending with an ellipsis.
export const clampLines = (lines: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
});
