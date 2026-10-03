import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { List, ListItem, ListItemButton, ListItemText } from '@mui/material';

import SectionCard from '@/components/layout/SectionCard';
import { ListParams, listHref } from '@/lib/submissions/list-params';

// Ready-made filters for common triage questions. Because the list's state lives in the URL,
// each one is simply a link.
export const QUICK_VIEWS: { label: string; description: string; params: ListParams }[] = [
  {
    label: 'Waiting longest',
    description: 'New submissions, oldest first',
    params: { status: ['new'], ordering: 'createdAt' },
  },
  {
    label: 'Missing documents',
    description: 'Open submissions with no documents yet',
    params: { status: ['new', 'in_review'], hasDocuments: false },
  },
  {
    label: 'No notes yet',
    description: 'Submissions nobody has commented on',
    params: { hasNotes: false },
  },
  {
    label: 'Recently updated',
    description: 'Latest activity first',
    params: { ordering: '-updatedAt' },
  },
];

export default function QuickViews() {
  return (
    <SectionCard title="Quick views" description="One-click filters for common triage tasks.">
      <List disablePadding sx={{ mx: -1 }}>
        {QUICK_VIEWS.map((view) => (
          <ListItem key={view.label} disablePadding>
            <ListItemButton href={listHref(view.params)} sx={{ borderRadius: 2 }}>
              <ListItemText
                primary={view.label}
                secondary={view.description}
                slotProps={{ primary: { sx: { typography: 'body2', fontWeight: 600 } } }}
              />
              <ChevronRightRoundedIcon sx={{ color: 'text.secondary' }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </SectionCard>
  );
}
