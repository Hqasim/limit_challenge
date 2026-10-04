import { screen, within } from '@testing-library/react';

import ColorModeToggle from '@/components/layout/ColorModeToggle';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

const html = document.documentElement;

afterEach(() => {
  window.localStorage.clear();
  html.classList.remove('light', 'dark');
});

describe('ColorModeToggle', () => {
  it('follows the system setting until the user chooses', () => {
    renderWithProviders(<ColorModeToggle />);
    expect(screen.getByRole('button', { name: 'Color theme: System' })).toBeInTheDocument();
  });

  it('offers System, Light and Dark as a single choice', async () => {
    const { user } = renderWithProviders(<ColorModeToggle />);

    await user.click(screen.getByRole('button', { name: 'Color theme: System' }));
    const menu = screen.getByRole('menu', { name: /color theme/i });
    const options = within(menu).getAllByRole('menuitemradio');

    expect(options.map((option) => option.textContent)).toEqual(['System', 'Light', 'Dark']);
    expect(within(menu).getByRole('menuitemradio', { name: 'System' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  });

  it('switches to dark, applies it to the page and remembers it', async () => {
    const { user } = renderWithProviders(<ColorModeToggle />);

    await user.click(screen.getByRole('button', { name: 'Color theme: System' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Dark' }));

    // The scheme is a class on <html> (the theme's colorSchemeSelector); the choice is saved
    // for InitColorSchemeScript to apply before the first paint on the next visit.
    expect(html).toHaveClass('dark');
    expect(window.localStorage.getItem('mui-mode')).toBe('dark');
    expect(screen.getByRole('button', { name: 'Color theme: Dark' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Color theme: Dark' }));
    await user.click(screen.getByRole('menuitemradio', { name: 'Light' }));
    expect(html).toHaveClass('light');
    expect(html).not.toHaveClass('dark');
  });

  it('has no detectable accessibility problems with the menu open', async () => {
    const { user } = renderWithProviders(<ColorModeToggle />);
    await user.click(screen.getByRole('button', { name: 'Color theme: System' }));
    expect(await axe(document.body)).toHaveNoViolations();
  });
});
