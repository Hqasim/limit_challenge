'use client';

import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useId, useState } from 'react';

import ActiveFilterChips from '@/components/submissions/list/ActiveFilterChips';
import {
  BrokerFilter,
  CompanySearchFilter,
  CreatedRangeFilter,
  FilterFieldProps,
  HasDocumentsFilter,
  HasNotesFilter,
  PriorityFilter,
  SortField,
  StatusFilter,
} from '@/components/submissions/list/FilterFields';
import FiltersDrawer from '@/components/submissions/list/FiltersDrawer';
import { ADVANCED_FILTER_KEYS } from '@/lib/submissions/filter-summary';
import { countActiveFilters } from '@/lib/submissions/list-params';

type SubmissionFiltersProps = FilterFieldProps & {
  onClear: () => void;
  // Matching submissions, shown on the mobile drawer's button (undefined while loading).
  resultCount?: number;
};

// Desktop: everything in one panel. The everyday filters are always visible; dates and the
// has-documents/notes switches sit behind "More filters" (opened automatically when a link
// already uses them), with chips summarising them while collapsed.
function FilterPanel({ params, onChange, onClear }: SubmissionFiltersProps) {
  const activeCount = countActiveFilters(params);
  const { createdFrom, createdTo, hasDocuments, hasNotes } = params;
  const advancedCount = countActiveFilters({ createdFrom, createdTo, hasDocuments, hasNotes });
  const [moreOpen, setMoreOpen] = useState(advancedCount > 0);
  const morePanelId = useId();
  const fieldProps = { params, onChange };

  return (
    <Stack spacing={1.5}>
      <Card>
        <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
          <Stack spacing={2.5}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: '2fr 1.5fr 1fr' }}>
              <CompanySearchFilter {...fieldProps} />
              <BrokerFilter {...fieldProps} />
              <SortField {...fieldProps} />
            </Box>

            <Stack direction="row" sx={{ flexWrap: 'wrap', alignItems: 'flex-end', gap: 3 }}>
              <StatusFilter {...fieldProps} />
              <PriorityFilter {...fieldProps} />
              <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                <Button
                  variant="outlined"
                  startIcon={<TuneRoundedIcon />}
                  aria-expanded={moreOpen}
                  aria-controls={morePanelId}
                  onClick={() => setMoreOpen((open) => !open)}
                >
                  More filters{advancedCount > 0 && ` (${advancedCount})`}
                </Button>
                {activeCount > 0 && <Button onClick={onClear}>Clear all ({activeCount})</Button>}
              </Stack>
            </Stack>

            <Collapse in={moreOpen} id={morePanelId} unmountOnExit>
              <Divider sx={{ mb: 2.5 }} />
              {/* Bottom-aligned, so the date fields line up with the Any/Yes/No toggles,
                  whose caption makes them taller. */}
              <Box
                sx={{
                  display: 'grid',
                  gap: 2.5,
                  gridTemplateColumns: '2fr 1fr 1fr',
                  alignItems: 'end',
                }}
              >
                <CreatedRangeFilter {...fieldProps} />
                <HasDocumentsFilter {...fieldProps} />
                <HasNotesFilter {...fieldProps} />
              </Box>
            </Collapse>
          </Stack>
        </CardContent>
      </Card>

      {!moreOpen && (
        <ActiveFilterChips params={params} only={ADVANCED_FILTER_KEYS} onRemove={onChange} />
      )}
    </Stack>
  );
}

// Phones and small tablets: the search box stays in view, every other filter moves into a
// bottom sheet, and chips show what is applied.
function CompactFilters({ params, onChange, onClear, resultCount }: SubmissionFiltersProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeCount = countActiveFilters(params);
  // The search term is visible in its own box, so it isn't counted on the Filters button.
  const hiddenCount = activeCount - (params.companySearch ? 1 : 0);

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1}>
        <CompanySearchFilter params={params} onChange={onChange} />
        <Button
          variant="outlined"
          startIcon={<TuneRoundedIcon />}
          onClick={() => setDrawerOpen(true)}
          aria-haspopup="dialog"
          sx={{ flexShrink: 0 }}
        >
          Filters{hiddenCount > 0 && ` (${hiddenCount})`}
        </Button>
      </Stack>

      <ActiveFilterChips
        params={params}
        only={['status', 'priority', 'brokerId', ...ADVANCED_FILTER_KEYS]}
        onRemove={onChange}
      />

      <FiltersDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        params={params}
        onChange={onChange}
        onClear={onClear}
        activeCount={activeCount}
        resultCount={resultCount}
      />
    </Stack>
  );
}

// The list's filters. Every control reads from and writes to the URL params, so the layout
// can change with the screen size without losing anything.
export default function SubmissionFilters(props: SubmissionFiltersProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  return isDesktop ? <FilterPanel {...props} /> : <CompactFilters {...props} />;
}
