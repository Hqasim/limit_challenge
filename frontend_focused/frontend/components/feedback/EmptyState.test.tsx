import { Button } from '@mui/material';
import { screen } from '@testing-library/react';

import EmptyState from '@/components/feedback/EmptyState';
import { renderWithProviders } from '@/test/render';

describe('EmptyState', () => {
  it('is announced politely as a status with its heading and actions', () => {
    renderWithProviders(
      <EmptyState
        title="No submissions match these filters"
        titleComponent="h3"
        actions={<Button>Clear filters</Button>}
      />,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'No submissions match these filters' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Clear filters' })).toBeInTheDocument();
  });
});
