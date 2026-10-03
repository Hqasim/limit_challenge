import { screen } from '@testing-library/react';

import StatusChip from '@/components/submissions/StatusChip';
import { SubmissionStatus } from '@/lib/types';
import { renderWithProviders } from '@/test/render';

describe('StatusChip', () => {
  it.each<[SubmissionStatus, string]>([
    ['new', 'New'],
    ['in_review', 'In review'],
    ['closed', 'Closed'],
    ['lost', 'Lost'],
  ])('labels %s as "%s"', (status, label) => {
    renderWithProviders(<StatusChip status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});
