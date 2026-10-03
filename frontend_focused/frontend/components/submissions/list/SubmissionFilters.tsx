'use client';

import { Card, CardContent, MenuItem, Stack, TextField } from '@mui/material';

import SearchField from '@/components/submissions/list/SearchField';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { STATUS_META, SUBMISSION_STATUSES } from '@/lib/submissions/constants';
import { ListParams } from '@/lib/submissions/list-params';
import { SubmissionStatus } from '@/lib/types';

type SubmissionFiltersProps = {
  params: ListParams;
  onChange: (patch: Partial<ListParams>) => void;
};

// Filter bar above the results. Every control reads from and writes to the URL params.
export default function SubmissionFilters({ params, onChange }: SubmissionFiltersProps) {
  const brokerQuery = useBrokerOptions();

  return (
    <Card>
      <CardContent>
        {/* Stacked on phones, one row from the "sm" breakpoint up. */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <SearchField
            label="Company"
            placeholder="Search by company name"
            value={params.companySearch ?? ''}
            onCommit={(companySearch) => onChange({ companySearch })}
          />
          <TextField
            select
            label="Status"
            value={params.status?.[0] ?? ''}
            onChange={(event) => {
              const status = event.target.value as SubmissionStatus | '';
              onChange({ status: status ? [status] : undefined });
            }}
            fullWidth
          >
            <MenuItem value="">All statuses</MenuItem>
            {SUBMISSION_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {STATUS_META[status].label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Broker"
            value={params.brokerId ? String(params.brokerId) : ''}
            onChange={(event) =>
              onChange({ brokerId: event.target.value ? Number(event.target.value) : undefined })
            }
            fullWidth
          >
            <MenuItem value="">All brokers</MenuItem>
            {brokerQuery.data?.map((broker) => (
              <MenuItem key={broker.id} value={String(broker.id)}>
                {broker.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </CardContent>
    </Card>
  );
}
