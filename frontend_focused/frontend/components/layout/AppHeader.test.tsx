import { screen, within } from '@testing-library/react';
import { usePathname } from 'next/navigation';

import AppHeader from '@/components/layout/AppHeader';
import { apiDocsUrl } from '@/lib/api-client';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));

function renderAt(pathname: string) {
  jest.mocked(usePathname).mockReturnValue(pathname);
  return renderWithProviders(<AppHeader />);
}

describe('AppHeader', () => {
  it('links to the overview and the submissions workspace', () => {
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Main' });

    expect(within(nav).getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/');
    expect(within(nav).getByRole('link', { name: 'Submissions' })).toHaveAttribute(
      'href',
      '/submissions',
    );
  });

  it.each([
    ['/', 'Overview'],
    ['/submissions', 'Submissions'],
    ['/submissions/12', 'Submissions'],
  ])('marks the active item for %s', (pathname, activeLabel) => {
    renderAt(pathname);
    const nav = screen.getByRole('navigation', { name: 'Main' });

    // Exactly one item is the current page, and it is the expected one.
    const current = within(nav)
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent(activeLabel);
  });

  it('opens the API docs in a new tab without leaking the opener', () => {
    renderAt('/');
    const docsLink = screen.getByRole('link', { name: /api docs/i });

    expect(docsLink).toHaveAttribute('href', apiDocsUrl);
    expect(apiDocsUrl).toMatch(/\/api\/docs\/$/);
    expect(docsLink).toHaveAttribute('target', '_blank');
    expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('keeps the logo link accessible when the wordmark is hidden', () => {
    renderAt('/');
    expect(screen.getByRole('link', { name: 'Submission Tracker home' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('has no detectable accessibility problems', async () => {
    const { container } = renderAt('/submissions');
    expect(await axe(container)).toHaveNoViolations();
  });
});
