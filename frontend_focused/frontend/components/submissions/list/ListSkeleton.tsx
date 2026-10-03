'use client';

import {
  Box,
  Card,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

import { visuallyHidden } from '@/lib/a11y';
import { ListView } from '@/lib/types';

// Loading placeholders shaped like the real content, so nothing jumps when data arrives.
// The shapes are hidden from screen readers; a single "Loading submissions" status replaces
// them.

const COLUMNS = ['Submission', 'Status', 'Priority', 'Broker', 'Activity', 'Created'];

function TableSkeleton({ rows }: { rows: number }) {
  return (
    <Card>
      <Table aria-hidden="true">
        <TableHead>
          <TableRow>
            {COLUMNS.map((column) => (
              <TableCell key={column}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }, (_, row) => (
            <TableRow key={row}>
              <TableCell>
                <Skeleton width="70%" />
                <Skeleton width="90%" height={18} />
              </TableCell>
              <TableCell>
                <Skeleton variant="rounded" width={72} height={24} />
              </TableCell>
              {COLUMNS.slice(2).map((column) => (
                <TableCell key={column}>
                  <Skeleton width="80%" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function CardsSkeleton({ cards }: { cards: number }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
      }}
    >
      {Array.from({ length: cards }, (_, index) => (
        <Card key={index} sx={{ p: 2.5 }}>
          <Stack spacing={1.5}>
            <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
              <Skeleton width="55%" height={28} />
              <Skeleton variant="rounded" width={72} height={24} />
            </Stack>
            <Skeleton width="40%" />
            <Skeleton width="100%" />
            <Skeleton width="85%" />
            <Skeleton variant="rounded" height={64} />
          </Stack>
        </Card>
      ))}
    </Box>
  );
}

type ListSkeletonProps = {
  // Which layout to imitate. Without one (server render, before the screen size is known)
  // CSS shows the table on desktops and cards on smaller screens.
  view?: ListView;
  // How many placeholder rows/cards to draw (the expected page size, capped).
  count?: number;
};

export default function ListSkeleton({ view, count = 10 }: ListSkeletonProps) {
  const table = <TableSkeleton rows={Math.min(count, 10)} />;
  const cards = <CardsSkeleton cards={Math.min(count, 6)} />;

  return (
    <Box role="status" aria-busy="true">
      <Box component="span" sx={visuallyHidden}>
        Loading submissions
      </Box>
      {view === 'table' && table}
      {view === 'cards' && cards}
      {!view && (
        <>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>{table}</Box>
          <Box sx={{ display: { xs: 'block', md: 'none' } }}>{cards}</Box>
        </>
      )}
    </Box>
  );
}

// Placeholder for the whole workspace (filter bar + results), shown while the page's
// client-side part loads.
export function WorkspaceSkeleton() {
  return (
    <Stack spacing={3}>
      <Skeleton variant="rounded" height={88} sx={{ borderRadius: 3 }} />
      <Skeleton width={180} />
      <ListSkeleton />
    </Stack>
  );
}
