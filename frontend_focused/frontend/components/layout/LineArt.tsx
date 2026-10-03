import { Box, SxProps, Theme } from '@mui/material';

import { brand } from '@/lib/brand';

// Decorative line art in the spirit of limit.com's illustrations (wave line, dotted diamond,
// starburst), drawn from scratch. Purely visual: hidden from assistive technology.

// Starburst: 16 rays around a centre point. Coordinates are rounded so the server and the
// browser render identical attributes (no hydration mismatch).
const STAR = { cx: 262, cy: 46, inner: 5, outer: 26 };
const RAYS = Array.from({ length: 16 }, (_, index) => {
  const angle = (index / 16) * Math.PI * 2;
  const point = (radius: number) => ({
    x: Number((STAR.cx + Math.cos(angle) * radius).toFixed(2)),
    y: Number((STAR.cy + Math.sin(angle) * radius).toFixed(2)),
  });
  return { from: point(STAR.inner), to: point(STAR.outer) };
});

// Dotted diamond: every grid point within 5 steps (Manhattan distance) of the centre.
const DIAMOND = { cx: 84, cy: 60, steps: 5, gap: 6 };
const DOTS = Array.from({ length: (DIAMOND.steps * 2 + 1) ** 2 }, (_, index) => ({
  i: (index % (DIAMOND.steps * 2 + 1)) - DIAMOND.steps,
  j: Math.floor(index / (DIAMOND.steps * 2 + 1)) - DIAMOND.steps,
})).filter(({ i, j }) => Math.abs(i) + Math.abs(j) <= DIAMOND.steps);

export default function LineArt({ sx }: { sx?: SxProps<Theme> }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 320 130"
      aria-hidden="true"
      focusable="false"
      // MUI's pattern for merging a caller's sx (object, array or function) with our own.
      sx={[{ width: 320, height: 130, pointerEvents: 'none' }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <path
        d="M0 104 C 56 58, 116 128, 176 92 S 276 34, 320 64"
        fill="none"
        stroke={brand.sky}
        strokeWidth="1.5"
        strokeOpacity="0.7"
      />
      {DOTS.map(({ i, j }) => (
        <circle
          key={`${i}:${j}`}
          cx={DIAMOND.cx + i * DIAMOND.gap}
          cy={DIAMOND.cy + j * DIAMOND.gap}
          r="1.1"
          fill={brand.purple}
          fillOpacity="0.55"
        />
      ))}
      {RAYS.map(({ from, to }, index) => (
        <line
          key={index}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke={brand.purple}
          strokeWidth="1.2"
          strokeOpacity="0.75"
        />
      ))}
      <circle cx={STAR.cx} cy={STAR.cy} r="3" fill={brand.blue} />
    </Box>
  );
}
