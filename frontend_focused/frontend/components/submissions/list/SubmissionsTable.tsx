'use client';

import {
  Box,
  Card,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { MouseEvent } from 'react';

import ActivityCounts from '@/components/submissions/ActivityCounts';
import PersonAvatar from '@/components/submissions/PersonAvatar';
import PriorityIndicator from '@/components/submissions/PriorityIndicator';
import RelativeTime from '@/components/submissions/RelativeTime';
import StatusChip from '@/components/submissions/StatusChip';
import { visuallyHidden } from '@/lib/a11y';
import { SUBMISSIONS_PATH } from '@/lib/submissions/constants';
import { SubmissionListItem, SubmissionOrdering } from '@/lib/types';

// The Owner column needs room, so it appears from 1200px (cards and the detail page always
// show the owner). The latest note is not a column: it would crowd out the essentials, so the
// table shows it on hover over the note count, and the cards view shows it in full.
const FROM_LG = { display: { xs: 'none', lg: 'table-cell' } };

type SortKey = 'company' | 'priority' | 'createdAt';

type SubmissionsTableProps = {
  rows: SubmissionListItem[];
  ordering: SubmissionOrdering;
  onSort: (ordering: SubmissionOrdering) => void;
  // Called when a row is hovered or focused, to load its detail ahead of a click.
  onPrefetch: (id: number) => void;
};

// Column header that sorts the list. A first click uses the column's natural direction
// (A to Z for names, most urgent / newest first otherwise); clicking again reverses it.
// MUI sets aria-sort on the header cell, so screen readers announce the active sort.
function SortableHeader({
  label,
  sortKey,
  firstDirection,
  ordering,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  firstDirection: 'asc' | 'desc';
  ordering: SubmissionOrdering;
  onSort: (ordering: SubmissionOrdering) => void;
}) {
  const active = ordering.replace(/^-/, '') === sortKey;
  const direction = ordering.startsWith('-') ? 'desc' : 'asc';
  const nextDirection = active ? (direction === 'asc' ? 'desc' : 'asc') : firstDirection;

  return (
    <TableCell sortDirection={active ? direction : false}>
      <TableSortLabel
        active={active}
        direction={active ? direction : firstDirection}
        onClick={() =>
          onSort(`${nextDirection === 'desc' ? '-' : ''}${sortKey}` as SubmissionOrdering)
        }
      >
        {label}
        {active && (
          <Box component="span" sx={visuallyHidden}>
            {direction === 'desc' ? 'sorted descending' : 'sorted ascending'}
          </Box>
        )}
      </TableSortLabel>
    </TableCell>
  );
}

// Dense, scannable list of submissions for desktop triage.
export default function SubmissionsTable({
  rows,
  ordering,
  onSort,
  onPrefetch,
}: SubmissionsTableProps) {
  const router = useRouter();

  // The whole row opens the submission, so users don't have to aim for the name. The company
  // name stays a real link for keyboard users, screen readers and "open in new tab".
  function handleRowClick(event: MouseEvent<HTMLTableRowElement>, href: string) {
    const target = event.target as HTMLElement;
    if (target.closest('a, button')) return; // the link handles its own clicks
    if (window.getSelection()?.toString()) return; // the user is selecting text to copy
    if (event.metaKey || event.ctrlKey) {
      window.open(href, '_blank', 'noopener');
    } else {
      router.push(href);
    }
  }

  return (
    <Card>
      {/* Scrolls sideways on narrow screens instead of squashing the columns. Positioned so
          that absolutely positioned screen-reader text inside the table is clipped by this
          scroll area instead of widening the whole page. */}
      <TableContainer sx={{ position: 'relative' }}>
        <Table sx={{ minWidth: 720 }}>
          <Box component="caption" sx={visuallyHidden}>
            Submissions. Select a row to open its details.
          </Box>
          <TableHead>
            <TableRow>
              <SortableHeader
                label="Submission"
                sortKey="company"
                firstDirection="asc"
                ordering={ordering}
                onSort={onSort}
              />
              <TableCell>Status</TableCell>
              <SortableHeader
                label="Priority"
                sortKey="priority"
                firstDirection="desc"
                ordering={ordering}
                onSort={onSort}
              />
              <TableCell>Broker</TableCell>
              <TableCell sx={FROM_LG}>Owner</TableCell>
              <TableCell>Activity</TableCell>
              <SortableHeader
                label="Created"
                sortKey="createdAt"
                firstDirection="desc"
                ordering={ordering}
                onSort={onSort}
              />
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const href = `${SUBMISSIONS_PATH}/${row.id}`;
              return (
                <TableRow
                  key={row.id}
                  hover
                  onClick={(event) => handleRowClick(event, href)}
                  onMouseEnter={() => onPrefetch(row.id)}
                  onFocus={() => onPrefetch(row.id)}
                  sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                >
                  <TableCell>
                    <Box sx={{ maxWidth: 280 }}>
                      <Link
                        href={href}
                        sx={{ color: 'text.primary', fontWeight: 600, display: 'inline-block' }}
                      >
                        {row.company.legalName}
                      </Link>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {row.summary || `${row.company.industry} · ${row.company.headquartersCity}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>
                    <PriorityIndicator priority={row.priority} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ maxWidth: 170 }} noWrap>
                      {row.broker.name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={FROM_LG}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <PersonAvatar name={row.owner.fullName} />
                      <Typography variant="body2" noWrap>
                        {row.owner.fullName}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <ActivityCounts
                      documentCount={row.documentCount}
                      noteCount={row.noteCount}
                      latestNote={row.latestNote}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" component="span">
                      <RelativeTime iso={row.createdAt} />
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
