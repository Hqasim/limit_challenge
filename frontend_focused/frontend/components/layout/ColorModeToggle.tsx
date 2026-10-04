'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessOutlinedIcon from '@mui/icons-material/SettingsBrightnessOutlined';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import { ReactNode, useId, useState } from 'react';

type Mode = 'system' | 'light' | 'dark';

const MODES: { mode: Mode; label: string; icon: ReactNode }[] = [
  { mode: 'system', label: 'System', icon: <SettingsBrightnessOutlinedIcon fontSize="small" /> },
  { mode: 'light', label: 'Light', icon: <LightModeOutlinedIcon fontSize="small" /> },
  { mode: 'dark', label: 'Dark', icon: <DarkModeOutlinedIcon fontSize="small" /> },
];

// Header button for the colour scheme: follow the OS (default), or force light or dark. MUI
// stores the choice in localStorage and InitColorSchemeScript (app/layout.tsx) applies it
// before the first paint on later visits.
export default function ColorModeToggle() {
  const { mode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const buttonId = useId();
  const menuId = useId();

  // `mode` is undefined until the stored choice is read on the client. Showing "System" until
  // then keeps the server and first client render identical (no hydration mismatch).
  const current = MODES.find((option) => option.mode === mode) ?? MODES[0];

  return (
    <>
      <Tooltip title="Color theme">
        <IconButton
          id={buttonId}
          aria-label={`Color theme: ${current.label}`}
          aria-haspopup="menu"
          aria-expanded={anchor ? 'true' : undefined}
          aria-controls={anchor ? menuId : undefined}
          onClick={(event) => setAnchor(event.currentTarget)}
          sx={{ color: 'text.secondary' }}
        >
          {current.icon}
        </IconButton>
      </Tooltip>
      <Menu
        id={menuId}
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ list: { 'aria-labelledby': buttonId }, paper: { sx: { minWidth: 180 } } }}
      >
        {MODES.map((option) => {
          const selected = option.mode === mode;
          return (
            <MenuItem
              key={option.mode}
              // A single-choice menu: assistive technology announces which mode is checked.
              role="menuitemradio"
              aria-checked={selected}
              selected={selected}
              onClick={() => {
                setMode(option.mode);
                setAnchor(null);
              }}
            >
              <ListItemIcon>{option.icon}</ListItemIcon>
              <ListItemText>{option.label}</ListItemText>
              {selected && (
                <CheckRoundedIcon fontSize="small" sx={{ ml: 2, color: 'primary.main' }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
