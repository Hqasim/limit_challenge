'use client';

import {
  Box,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import SearchField from '@/components/submissions/list/SearchField';
import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionListParams } from '@/lib/hooks/useSubmissionListParams';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { STATUS_META, SUBMISSION_STATUSES } from '@/lib/submissions/constants';
import { toListQuery } from '@/lib/submissions/list-params';
import { SubmissionStatus } from '@/lib/types';

// The /submissions workspace: filters (kept in the URL) and the matching submissions.
// Currently a plain filter bar plus a debug view of the live query.
export default function SubmissionsWorkspace() {
  const { params, setParams } = useSubmissionListParams();
  const query = toListQuery(params);
  const submissionsQuery = useSubmissionsList(query);
  const brokerQuery = useBrokerOptions();

  return (
    <Stack spacing={4}>
      {/* Filter bar: stacked on phones, one row from the "sm" breakpoint up */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Status"
              value={params.status?.[0] ?? ''}
              onChange={(event) => {
                const status = event.target.value as SubmissionStatus | '';
                setParams({ status: status ? [status] : undefined });
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
                setParams({ brokerId: event.target.value ? Number(event.target.value) : undefined })
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
            <SearchField
              label="Company"
              placeholder="Search by company name"
              value={params.companySearch ?? ''}
              onCommit={(companySearch) => setParams({ companySearch })}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Debug view of the URL state and the live query. */}
      <Card>
        <CardContent>
          <Typography variant="h6" component="h2">
            Submission list
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box component="pre" sx={{ m: 0, fontSize: 13, overflowX: 'auto' }}>
            {JSON.stringify(
              {
                urlParams: params,
                apiQuery: query,
                status: submissionsQuery.status,
                count: submissionsQuery.data?.count,
                companies: submissionsQuery.data?.results.map((row) => row.company.legalName),
              },
              null,
              2,
            )}
          </Box>
        </CardContent>
      </Card>
    </Stack>
  );
}
