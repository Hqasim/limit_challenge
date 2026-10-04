'use client';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import { formatNumber } from '@/lib/format';
import { useSubmissionCounts } from '@/lib/hooks/useSubmissions';
import { STATUS_META, SUBMISSION_STATUSES } from '@/lib/submissions/constants';
import { listHref } from '@/lib/submissions/list-params';
import { SubmissionStatus } from '@/lib/types';

// One filter per status: the tiles' counts and links.
const STATUS_FILTERS = SUBMISSION_STATUSES.map((status) => ({ status: [status] }));

type StatusTileProps = {
  status: SubmissionStatus;
  // undefined while loading (or after a failed load).
  count?: number;
  // Sum of all statuses, once every count is known; used for the share line.
  total?: number;
  failed: boolean;
};

// A status's count, its share of the pipeline, and a link to the list filtered to it.
function StatusTile({ status, count, total, failed }: StatusTileProps) {
  const { label, color } = STATUS_META[status];
  const share = count !== undefined && total ? Math.round((count / total) * 100) : undefined;

  return (
    <Card sx={{ height: '100%', '&:hover': { borderColor: `${color}.main` } }}>
      <CardActionArea
        href={listHref({ status: [status] })}
        aria-label={
          count === undefined
            ? `${label} submissions. View in list`
            : `${label}: ${formatNumber(count)} submissions. View in list`
        }
        sx={{
          height: '100%',
          p: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${color}.main` }} />
          <Typography
            variant="overline"
            sx={[
              { color: `${color}.dark`, lineHeight: 1.4 },
              (theme) => theme.applyStyles('dark', { color: theme.vars.palette[color].light }),
            ]}
          >
            {label}
          </Typography>
        </Stack>

        <Typography
          component="p"
          sx={{
            mt: 1,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          {count !== undefined ? formatNumber(count) : failed ? '—' : <Skeleton width={56} />}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 22 }}>
          {share !== undefined && `${share}% of all submissions`}
        </Typography>

        <Stack
          direction="row"
          spacing={0.5}
          sx={{ mt: 'auto', pt: 2, alignItems: 'center', color: 'primary.main', fontWeight: 600 }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            View in list
          </Typography>
          <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
        </Stack>
      </CardActionArea>
    </Card>
  );
}

// One tile per status. The counts load in parallel and share one error message, since a
// retry button cannot sit inside a tile that is itself a link.
export default function StatusTiles() {
  const { counts, isError, retry } = useSubmissionCounts(STATUS_FILTERS);
  const total = counts.every((count) => count !== undefined)
    ? counts.reduce<number>((sum, count) => sum + (count ?? 0), 0)
    : undefined;

  return (
    <Stack spacing={2}>
      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={retry}>
              Retry
            </Button>
          }
        >
          Couldn&apos;t load some of the status counts.
        </Alert>
      )}
      <Box
        component="ul"
        aria-label="Submissions by status"
        sx={{
          listStyle: 'none',
          m: 0,
          p: 0,
          display: 'grid',
          gap: 2,
          // Two by two on phones (the tiles are compact), one row of four from tablets up.
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        }}
      >
        {SUBMISSION_STATUSES.map((status, index) => (
          <li key={status}>
            <StatusTile
              status={status}
              count={counts[index]}
              total={total}
              failed={isError && counts[index] === undefined}
            />
          </li>
        ))}
      </Box>
    </Stack>
  );
}
