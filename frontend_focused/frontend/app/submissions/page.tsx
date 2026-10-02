'use client';

import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { submissionsListQueryKey, useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SubmissionStatus } from '@/lib/types';

// List page at /submissions: filter bar + submission list (currently a debug placeholder).

// Options for the Status select. '' means "no status filter"; the other values must match
// Submission.Status in the backend.
const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];

export default function SubmissionsPage() {
  // Filter state lives in local React state, so it is lost on refresh and not shareable.
  // Syncing it with the URL (?status=...) is part of the task.
  const [status, setStatus] = useState<SubmissionStatus | ''>('');
  const [brokerId, setBrokerId] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');

  // Converts empty inputs to undefined so they are left out of the request. Memoised so the
  // object (part of the React Query key) only changes when a filter value changes.
  // companySearch updates on every keystroke; debouncing it would avoid a request per key.
  const filters = useMemo(
    () => ({
      status: status || undefined,
      brokerId: brokerId || undefined,
      companySearch: companyQuery || undefined,
    }),
    [status, brokerId, companyQuery],
  );

  // Both queries are disabled in their hooks, so neither makes a network request yet.
  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        {/* Page header */}
        <Box>
          <Typography variant="h4" component="h1">
            Submissions
          </Typography>
          <Typography color="text.secondary">
            Filters update the query parameters and drive backend filtering. Hook these inputs to
            your API calls when you implement the actual data fetching.
          </Typography>
        </Box>

        {/* Filter bar: stacked on phones, one row from the "sm" breakpoint up */}
        <Card variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value as SubmissionStatus | '')}
                fullWidth
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Broker"
                value={brokerId}
                onChange={(event) => setBrokerId(event.target.value)}
                fullWidth
                helperText="Populate options via /api/brokers"
              >
                {/* Options stay empty until the brokers query is enabled. */}
                <MenuItem value="">All brokers</MenuItem>
                {brokerQuery.data?.map((broker) => (
                  <MenuItem key={broker.id} value={String(broker.id)}>
                    {broker.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Company search"
                value={companyQuery}
                onChange={(event) => setCompanyQuery(event.target.value)}
                fullWidth
                helperText="Send as ?companySearch=..."
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Results area: placeholder that prints the current filters, query key and query
            status. Replace with the table/cards, pagination, and loading/empty/error states.
            The key is rebuilt with submissionsListQueryKey because useQuery results do not
            expose a `queryKey` property. */}
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Submission list</Typography>
              <Typography color="text.secondary">
                Hook `submissionsQuery` to render rows, totals, and pagination states. The query is
                disabled by default so no network calls fire until you enable it.
              </Typography>
              <Divider />
              <Box>
                <pre style={{ margin: 0, fontSize: 14 }}>
                  {JSON.stringify(
                    {
                      filters,
                      queryKey: submissionsListQueryKey(filters),
                      status: submissionsQuery.status,
                    },
                    null,
                    2,
                  )}
                </pre>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
