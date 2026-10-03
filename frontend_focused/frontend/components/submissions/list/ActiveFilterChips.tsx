'use client';

import { Box, Chip } from '@mui/material';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { describeActiveFilters } from '@/lib/submissions/filter-summary';
import { ListParams } from '@/lib/submissions/list-params';
import { SubmissionListFilters } from '@/lib/types';

type ActiveFilterChipsProps = {
  params: ListParams;
  // Only summarise these filters (the ones whose controls are currently hidden).
  only?: (keyof SubmissionListFilters)[];
  onRemove: (patch: Partial<ListParams>) => void;
};

// One removable chip per active filter, e.g. "Created: Sep 1, 2026 – Sep 30, 2026 ×". Shows
// filters the user cannot currently see (phones, collapsed "More filters"), so nothing is
// filtered silently. Clicking a chip, or pressing Delete on it, removes that filter.
export default function ActiveFilterChips({ params, only, onRemove }: ActiveFilterChipsProps) {
  const { data: brokers } = useBrokerOptions();
  const filters = describeActiveFilters(params, brokers).filter(
    ({ clears }) => !only || clears.some((key) => only.includes(key)),
  );

  if (filters.length === 0) return null;

  return (
    <Box
      component="ul"
      aria-label="Active filters"
      sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, listStyle: 'none', m: 0, p: 0 }}
    >
      {filters.map(({ id, label, clears }) => {
        const remove = () => onRemove(Object.fromEntries(clears.map((key) => [key, undefined])));
        return (
          <li key={id}>
            <Chip
              label={label}
              size="small"
              onClick={remove}
              onDelete={remove}
              aria-label={`Remove filter ${label}`}
              sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
            />
          </li>
        );
      })}
    </Box>
  );
}
