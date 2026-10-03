'use client';

import { Avatar } from '@mui/material';

import { getInitials } from '@/lib/format';

// Palette colours avatars rotate through.
const AVATAR_COLORS = ['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const;

// The same name always gets the same colour, so people are easy to recognise across pages.
function colorFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

type PersonAvatarProps = {
  name: string;
  size?: number;
};

// Initials avatar. Decorative: the person's name is always shown next to it, so it is hidden
// from screen readers to avoid reading the initials as well.
export default function PersonAvatar({ name, size = 28 }: PersonAvatarProps) {
  const color = colorFor(name);

  return (
    <Avatar
      aria-hidden="true"
      sx={(theme) => ({
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 700,
        color: theme.vars.palette[color].dark,
        backgroundColor: `rgba(${theme.vars.palette[color].mainChannel} / 0.14)`,
      })}
    >
      {getInitials(name)}
    </Avatar>
  );
}
