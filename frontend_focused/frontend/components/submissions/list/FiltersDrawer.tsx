'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Box, Button, Divider, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { useId } from 'react';

import {
  BrokerFilter,
  CreatedRangeFilter,
  FilterFieldProps,
  HasDocumentsFilter,
  HasNotesFilter,
  PriorityFilter,
  SortField,
  StatusFilter,
} from '@/components/submissions/list/FilterFields';
import { formatCount } from '@/lib/format';

type FiltersDrawerProps = FilterFieldProps & {
  open: boolean;
  onClose: () => void;
  onClear: () => void;
  activeCount: number;
  // Number of matching submissions, for the "Show 12 results" button (undefined while loading).
  resultCount?: number;
};

// Bottom sheet holding every filter on phones. Filters apply as they change (the results
// behind the sheet update live); "Show results" just closes it.
export default function FiltersDrawer({
  open,
  onClose,
  onClear,
  activeCount,
  resultCount,
  ...fieldProps
}: FiltersDrawerProps) {
  const titleId = useId();

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-labelledby': titleId,
          sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '88vh' },
        },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', px: 2.5, py: 1.5 }}
      >
        <Typography id={titleId} variant="h3" component="h2">
          Filters
        </Typography>
        <IconButton aria-label="Close filters" onClick={onClose} edge="end">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <Divider />

      <Stack spacing={2.5} sx={{ p: 2.5, overflowY: 'auto' }}>
        <BrokerFilter {...fieldProps} />
        <SortField {...fieldProps} />
        <StatusFilter {...fieldProps} />
        <PriorityFilter {...fieldProps} />
        <CreatedRangeFilter {...fieldProps} />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <HasDocumentsFilter {...fieldProps} />
          <HasNotesFilter {...fieldProps} />
        </Box>
      </Stack>

      <Divider />
      <Stack direction="row" spacing={1.5} sx={{ px: 2.5, py: 1.5 }}>
        <Button onClick={onClear} disabled={activeCount === 0}>
          Clear all
        </Button>
        <Button variant="contained" onClick={onClose} sx={{ flex: 1 }}>
          {resultCount === undefined
            ? 'Show results'
            : `Show ${formatCount(resultCount, 'result')}`}
        </Button>
      </Stack>
    </Drawer>
  );
}
