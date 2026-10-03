'use client';

import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { Button } from '@mui/material';
import { ReactNode } from 'react';

import StatePanel, { StatePanelProps } from '@/components/feedback/StatePanel';

type ErrorStateProps = Pick<
  StatePanelProps,
  'title' | 'description' | 'compact' | 'titleComponent'
> & {
  // Shows a primary "Retry" button that calls this (typically a React Query refetch).
  onRetry?: () => void;
  retryLabel?: string;
  // Extra actions next to Retry, e.g. a link back to the list.
  actions?: ReactNode;
};

// Error state: something failed and the user can usually recover. Announced immediately to
// screen readers (role="alert").
export default function ErrorState({
  onRetry,
  retryLabel = 'Retry',
  actions,
  ...panelProps
}: ErrorStateProps) {
  return (
    <StatePanel
      {...panelProps}
      role="alert"
      tone="error"
      icon={<ErrorOutlineRoundedIcon />}
      actions={
        (onRetry || actions) && (
          <>
            {onRetry && (
              <Button variant="contained" startIcon={<RefreshRoundedIcon />} onClick={onRetry}>
                {retryLabel}
              </Button>
            )}
            {actions}
          </>
        )
      }
    />
  );
}
