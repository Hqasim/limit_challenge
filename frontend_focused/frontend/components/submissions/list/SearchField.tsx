'use client';

import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

import { useDebouncedCallback } from '@/lib/hooks/useDebouncedCallback';

type SearchFieldProps = {
  label: string;
  // The committed value (from the URL).
  value: string;
  // Called with the typed text once the user pauses typing, or immediately on clear.
  onCommit: (value: string) => void;
  placeholder?: string;
  delayMs?: number;
};

// Text search that shows every keystroke immediately but only commits after a short pause.
//
// The input keeps its own draft; the committed value lives in the URL. When the URL changes
// for another reason (Clear all, browser Back), the draft follows it, and a commit still
// waiting to fire is dropped so it cannot bring the old text back.
export default function SearchField({
  label,
  value,
  onCommit,
  placeholder,
  delayMs = 300,
}: SearchFieldProps) {
  const [draft, setDraft] = useState(value);
  const debouncedCommit = useDebouncedCallback(onCommit, delayMs);
  const { cancel } = debouncedCommit;

  // Adopt a new committed value during render (React's pattern for syncing state to a prop).
  // Comparing trimmed text keeps a trailing space the user just typed: the URL stores the
  // trimmed term, and "acme " -> "acme" must not erase the space mid-typing.
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    if (draft.trim() !== value) setDraft(value);
  }

  // The committed value changed: anything still pending is now stale.
  useEffect(() => cancel, [value, cancel]);

  const clear = () => {
    setDraft('');
    debouncedCommit.cancel();
    onCommit('');
  };

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        debouncedCommit.schedule(event.target.value);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && draft) clear();
      }}
      fullWidth
      autoComplete="off"
      slotProps={{
        htmlInput: { enterKeyHint: 'search' },
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: draft ? (
            <InputAdornment position="end">
              <IconButton size="small" aria-label={`Clear ${label.toLowerCase()}`} onClick={clear}>
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
