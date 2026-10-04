/* eslint-disable prettier/prettier */
'use client';

import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import {
  Autocomplete,
  Box,
  Chip,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useId } from 'react';

import SearchField from '@/components/submissions/list/SearchField';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import {
  DEFAULT_ORDERING,
  ORDERING_LABELS,
  PRIORITY_META,
  STATUS_META,
  SUBMISSION_ORDERINGS,
  SUBMISSION_PRIORITIES,
  SUBMISSION_STATUSES,
} from '@/lib/submissions/constants';
import { ListParams } from '@/lib/submissions/list-params';
import { Broker, SubmissionOrdering } from '@/lib/types';

// The list's filter controls. Each one is wired to its URL param here, once, so the desktop
// filter panel and the mobile filter drawer render the same controls with the same behaviour.
// None keeps its own copy of the filter value: they read `params` and report changes.

export type FilterFieldProps = {
  params: ListParams;
  onChange: (patch: Partial<ListParams>) => void;
};

// Small caption above a group of buttons, also used as the group's accessible name.
function GroupLabel({ id, children }: { id: string; children: string }) {
  return (
    <Typography
      id={id}
      variant="caption"
      component="p"
      color="text.secondary"
      sx={{ fontWeight: 600, mb: 0.75 }}
    >
      {children}
    </Typography>
  );
}

// ---------------------------------------------------------------------------------------
// Multi-select chips (status, priority): each chip is a toggle button (aria-pressed).

type ChipOption<T> = { value: T; label: string; dotColor: string };

function ChipFilter<T extends string>({
  label,
  options,
  selected = [],
  onChange,
}: {
  label: string;
  options: ChipOption<T>[];
  selected?: T[];
  onChange: (values: T[]) => void;
}) {
  const labelId = useId();
  const toggle = (value: T) =>
    onChange(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
    );

  return (
    <Box role="group" aria-labelledby={labelId}>
      <GroupLabel id={labelId}>{label}</GroupLabel>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <Chip
              key={option.value}
              label={option.label}
              aria-pressed={active}
              onClick={() => toggle(option.value)}
              variant="outlined"
              // Selected: a check mark. Otherwise: the option's colour dot, as in the list.
              icon={
                active ? (
                  <CheckRoundedIcon />
                ) : (
                  <Box
                    component="span"
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: option.dotColor }}
                  />
                )
              }
              sx={[
                (theme) => ({
                  backgroundColor: active
                    ? theme.vars.palette.action.selected
                    : theme.vars.palette.background.paper,
                  borderColor: active
                    ? theme.vars.palette.primary.main
                    : theme.vars.palette.divider,
                  color: active ? theme.vars.palette.primary.dark : theme.vars.palette.text.primary,
                  '& .MuiChip-icon': { color: 'inherit', ml: 1 },
                }),
                // The darker blue would be too dim on navy; the selected label uses the lighter one.
                (theme) =>
                  theme.applyStyles(
                    'dark',
                    active ? { color: theme.vars.palette.primary.light } : {},
                  ),
              ]}
            />
          );
        })}
      </Stack>
    </Box>
  );
}

const STATUS_OPTIONS = SUBMISSION_STATUSES.map((status) => ({
  value: status,
  label: STATUS_META[status].label,
  dotColor: `${STATUS_META[status].color}.main`,
}));

const PRIORITY_OPTIONS = SUBMISSION_PRIORITIES.map((priority) => ({
  value: priority,
  label: PRIORITY_META[priority].label,
  dotColor: PRIORITY_META[priority].dotColor,
}));

export function StatusFilter({ params, onChange }: FilterFieldProps) {
  return (
    <ChipFilter
      label="Status"
      options={STATUS_OPTIONS}
      selected={params.status}
      onChange={(status) => onChange({ status })}
    />
  );
}

export function PriorityFilter({ params, onChange }: FilterFieldProps) {
  return (
    <ChipFilter
      label="Priority"
      options={PRIORITY_OPTIONS}
      selected={params.priority}
      onChange={(priority) => onChange({ priority })}
    />
  );
}

// ---------------------------------------------------------------------------------------
// Text search, broker and sort

export function CompanySearchFilter({ params, onChange }: FilterFieldProps) {
  return (
    <SearchField
      label="Company"
      placeholder="Search by company name"
      value={params.companySearch ?? ''}
      onCommit={(companySearch) => onChange({ companySearch })}
    />
  );
}

// Type-ahead broker picker fed by /api/brokers/.
export function BrokerFilter({ params, onChange }: FilterFieldProps) {
  const { data: brokers = [], isPending, isError } = useBrokerOptions();
  const brokerId = params.brokerId;

  // A broker id from the URL that is not in the list (still loading, or since deleted) still
  // appears, so the user can see the filter is on and clear it.
  const known = brokers.find(({ id }) => id === brokerId);
  const selected: Broker | null = brokerId
    ? (known ?? {
      id: brokerId,
      name: isPending ? 'Loading…' : `Broker #${brokerId}`,
      primaryContactEmail: null,
    })
    : null;
  const options = selected && !known ? [selected, ...brokers] : brokers;

  return (
    <Autocomplete
      options={options}
      value={selected}
      onChange={(_, broker) => onChange({ brokerId: broker?.id })}
      getOptionLabel={(broker) => broker.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      loading={isPending}
      noOptionsText={isError ? "Couldn't load brokers" : 'No brokers match'}
      // The label always sits above the field (like Company and Sort by), so the "All brokers"
      // placeholder is visible when nothing is selected. Autocomplete's own label props (the
      // id/htmlFor linking label and input) are kept, since slotProps replaces them.
      renderInput={(inputProps) => (
        <TextField
          {...inputProps}
          label="Broker"
          placeholder="All brokers"
          slotProps={{ inputLabel: { ...inputProps.InputLabelProps, shrink: true } }}
        />
      )}
      fullWidth
    />
  );
}

// Sort order; the table's column headers change the same param.
export function SortField({ params, onChange }: FilterFieldProps) {
  return (
    <TextField
      select
      label="Sort by"
      value={params.ordering ?? DEFAULT_ORDERING}
      onChange={(event) => onChange({ ordering: event.target.value as SubmissionOrdering })}
      fullWidth
    >
      {SUBMISSION_ORDERINGS.map((ordering) => (
        <MenuItem key={ordering} value={ordering}>
          {ORDERING_LABELS[ordering]}
        </MenuItem>
      ))}
    </TextField>
  );
}

// ---------------------------------------------------------------------------------------
// Created date range

// Two native date pickers (accessible and mobile-friendly, no picker library). The range
// stays valid by construction: the pickers limit each other (min/max), and a day typed on the
// wrong side of the other swaps the two, so the range always spans the two chosen days.
export function CreatedRangeFilter({ params, onChange }: FilterFieldProps) {
  const { createdFrom, createdTo } = params;

  function update(edge: 'createdFrom' | 'createdTo', day: string) {
    let range = { createdFrom, createdTo, [edge]: day || undefined };
    if (range.createdFrom && range.createdTo && range.createdFrom > range.createdTo) {
      range = { createdFrom: range.createdTo, createdTo: range.createdFrom };
    }
    onChange(range);
  }

  return (
    <Stack direction="row" spacing={1.5}>
      <TextField
        type="date"
        label="Created from"
        value={createdFrom ?? ''}
        onChange={(event) => update('createdFrom', event.target.value)}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: createdTo } }}
        fullWidth
        sx={{ paddingTop: '8px' }}
      />
      <TextField
        type="date"
        label="Created to"
        value={createdTo ?? ''}
        onChange={(event) => update('createdTo', event.target.value)}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: createdFrom } }}
        fullWidth
        sx={{ paddingTop: '8px' }}
      />
    </Stack>
  );
}

// ---------------------------------------------------------------------------------------
// Has documents / has notes: Any | Yes | No

type Presence = 'any' | 'yes' | 'no';

function PresenceFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}) {
  const labelId = useId();
  const current: Presence = value === undefined ? 'any' : value ? 'yes' : 'no';

  return (
    <Box>
      <GroupLabel id={labelId}>{label}</GroupLabel>
      <ToggleButtonGroup
        exclusive
        fullWidth
        size="small"
        value={current}
        aria-labelledby={labelId}
        // null means the selected button was clicked again: keep it.
        onChange={(_, next: Presence | null) =>
          next && onChange(next === 'any' ? undefined : next === 'yes')
        }
      >
        <ToggleButton value="any">Any</ToggleButton>
        <ToggleButton value="yes">Yes</ToggleButton>
        <ToggleButton value="no">No</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}

export function HasDocumentsFilter({ params, onChange }: FilterFieldProps) {
  return (
    <PresenceFilter
      label="Has documents"
      value={params.hasDocuments}
      onChange={(hasDocuments) => onChange({ hasDocuments })}
    />
  );
}

export function HasNotesFilter({ params, onChange }: FilterFieldProps) {
  return (
    <PresenceFilter
      label="Has notes"
      value={params.hasNotes}
      onChange={(hasNotes) => onChange({ hasNotes })}
    />
  );
}
