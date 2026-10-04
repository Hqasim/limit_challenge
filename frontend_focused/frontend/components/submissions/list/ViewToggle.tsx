'use client';

import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import TableRowsRoundedIcon from '@mui/icons-material/TableRowsRounded';
import { ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import { ReactNode } from 'react';

import { VIEW_LABELS } from '@/lib/submissions/constants';
import { ListView } from '@/lib/types';

// Icon per layout; the visible labels come from VIEW_LABELS.
const VIEW_ICONS: Record<ListView, ReactNode> = {
  table: <TableRowsRoundedIcon fontSize="small" />,
  cards: <GridViewRoundedIcon fontSize="small" />,
};

type ViewToggleProps = {
  value: ListView;
  onChange: (view: ListView) => void;
};

// Switches the results between the table and the card grid. Icon buttons with tooltips and
// accessible names; MUI marks the selected one with aria-pressed.
export default function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      size="small"
      aria-label="Results view"
      // Clicking the selected button reports null; keep the current view in that case.
      onChange={(_, view: ListView | null) => view && onChange(view)}
    >
      {(Object.keys(VIEW_ICONS) as ListView[]).map((view) => (
        <Tooltip key={view} title={`${VIEW_LABELS[view]} view`}>
          <ToggleButton value={view} aria-label={`${VIEW_LABELS[view]} view`} sx={{ px: 1.25 }}>
            {VIEW_ICONS[view]}
          </ToggleButton>
        </Tooltip>
      ))}
    </ToggleButtonGroup>
  );
}
