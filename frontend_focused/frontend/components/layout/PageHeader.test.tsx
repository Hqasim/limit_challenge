import { Button } from '@mui/material';
import { screen } from '@testing-library/react';

import PageHeader from '@/components/layout/PageHeader';
import { renderWithProviders } from '@/test/render';

describe('PageHeader', () => {
  it('renders the title as the page heading with its eyebrow, description and actions', () => {
    renderWithProviders(
      <PageHeader
        eyebrow="Workspace"
        title="Submissions"
        description="Review and triage broker-submitted opportunities."
        actions={<Button>Export</Button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Submissions' })).toBeInTheDocument();
    expect(screen.getByText('Workspace')).toBeInTheDocument();
    expect(screen.getByText('Review and triage broker-submitted opportunities.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('keeps the decorative line art out of the accessibility tree', () => {
    const { container } = renderWithProviders(<PageHeader title="Overview" decorated />);

    const art = container.querySelector('svg');
    expect(art).toHaveAttribute('aria-hidden', 'true');
  });
});
