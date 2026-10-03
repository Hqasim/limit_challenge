'use client';

import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import EmptyState from '@/components/feedback/EmptyState';
import ErrorState from '@/components/feedback/ErrorState';
import SectionCard from '@/components/layout/SectionCard';
import PersonAvatar from '@/components/submissions/PersonAvatar';
import RelativeTime from '@/components/submissions/RelativeTime';
import StatusChip from '@/components/submissions/StatusChip';
import { visuallyHidden } from '@/lib/a11y';
import { toApiError } from '@/lib/api-errors';
import { usePrefetchSubmission, useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { SUBMISSIONS_PATH } from '@/lib/submissions/constants';
import { listHref } from '@/lib/submissions/list-params';
import { SubmissionListFilters } from '@/lib/types';

// What "needs attention" means: high priority and still open (new or in review).
export const NEEDS_ATTENTION_FILTERS: SubmissionListFilters = {
  status: ['new', 'in_review'],
  priority: ['high'],
};

const PREVIEW_SIZE = 5;

function RowsSkeleton() {
  return (
    <Stack spacing={2} aria-hidden="true">
      {Array.from({ length: PREVIEW_SIZE }, (_, row) => (
        <Stack key={row} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Skeleton variant="circular" width={28} height={28} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="45%" />
            <Skeleton width="70%" height={18} />
          </Box>
          <Skeleton variant="rounded" width={72} height={24} />
        </Stack>
      ))}
    </Stack>
  );
}

// The newest high-priority open submissions, each one click from its detail page, and a link
// to the full filtered list.
export default function NeedsAttention() {
  const { data, isPending, error, refetch } = useSubmissionsList({
    ...NEEDS_ATTENTION_FILTERS,
    pageSize: PREVIEW_SIZE,
  });
  const prefetchSubmission = usePrefetchSubmission();

  let content;
  if (isPending) {
    content = (
      <Box role="status" aria-busy="true">
        <Box component="span" sx={visuallyHidden}>
          Loading submissions that need attention
        </Box>
        <RowsSkeleton />
      </Box>
    );
  } else if (!data) {
    content = (
      <ErrorState
        compact
        titleComponent="h3"
        title="Couldn't load this list"
        description={toApiError(error).message}
        onRetry={() => refetch()}
      />
    );
  } else if (data.count === 0) {
    content = (
      <EmptyState
        compact
        titleComponent="h3"
        icon={<TaskAltRoundedIcon />}
        title="All clear"
        description="No high-priority submissions are waiting for review."
      />
    );
  } else {
    content = (
      <List disablePadding sx={{ mx: -1 }}>
        {data.results.map((submission, index) => (
          <ListItem key={submission.id} disablePadding divider={index < data.results.length - 1}>
            <ListItemButton
              href={`${SUBMISSIONS_PATH}/${submission.id}`}
              onMouseEnter={() => prefetchSubmission(submission.id)}
              onFocus={() => prefetchSubmission(submission.id)}
              sx={{ borderRadius: 2, py: 1.25, gap: 1.5 }}
            >
              <PersonAvatar name={submission.owner.fullName} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {submission.company.legalName}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {submission.broker.name} · <RelativeTime iso={submission.createdAt} />
                </Typography>
              </Box>
              <StatusChip status={submission.status} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  }

  return (
    <SectionCard
      title="Needs attention"
      count={data?.count}
      description="High-priority submissions that are new or in review, newest first."
      action={
        data && data.count > 0 ? (
          <Button
            href={listHref(NEEDS_ATTENTION_FILTERS)}
            endIcon={<ArrowForwardRoundedIcon />}
            size="small"
          >
            View all
          </Button>
        ) : undefined
      }
    >
      <Divider sx={{ mb: 1.5, mx: -2.5 }} />
      {content}
    </SectionCard>
  );
}
