'use client';

import InboxRoundedIcon from '@mui/icons-material/InboxRounded';

import StatePanel, { StatePanelProps } from '@/components/feedback/StatePanel';

type EmptyStateProps = Omit<StatePanelProps, 'role' | 'tone' | 'icon'> & {
  // Defaults to an inbox; pass a more specific icon (e.g. a search icon for "no matches").
  icon?: StatePanelProps['icon'];
};

// Empty state: the request worked but there is nothing to show. Announced politely to screen
// readers (role="status").
export default function EmptyState({
  icon = <InboxRoundedIcon />,
  ...panelProps
}: EmptyStateProps) {
  return <StatePanel {...panelProps} role="status" tone="primary" icon={icon} />;
}
