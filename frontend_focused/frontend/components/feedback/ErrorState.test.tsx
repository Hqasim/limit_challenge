import { Button } from '@mui/material';
import { screen } from '@testing-library/react';

import ErrorState from '@/components/feedback/ErrorState';
import { renderWithProviders } from '@/test/render';

describe('ErrorState', () => {
  it('is announced as an alert and retries on click', async () => {
    const onRetry = jest.fn();
    const { user } = renderWithProviders(
      <ErrorState
        title="Can't reach the API"
        description="Is the backend running?"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent("Can't reach the API");
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows extra actions and no Retry button when there is nothing to retry', () => {
    renderWithProviders(
      <ErrorState title="Not found" actions={<Button href="/submissions">Back to list</Button>} />,
    );

    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Back to list' })).toHaveAttribute(
      'href',
      '/submissions',
    );
  });
});
