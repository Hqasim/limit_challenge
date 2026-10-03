import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import SearchField from '@/components/submissions/list/SearchField';
import { renderWithProviders } from '@/test/render';

describe('SearchField', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  // userEvent waits between keystrokes with timers, so it must drive Jest's fake clock.
  const setupUser = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  function renderField(value = '') {
    const onCommit = jest.fn();
    const view = renderWithProviders(
      <SearchField label="Company" value={value} onCommit={onCommit} />,
    );
    const input = screen.getByRole('textbox', { name: 'Company' });
    return { ...view, onCommit, input };
  }

  it('shows typing immediately but commits once, after the user pauses', async () => {
    const user = setupUser();
    const { input, onCommit } = renderField();

    await user.type(input, 'acme');
    expect(input).toHaveValue('acme');
    expect(onCommit).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(300));
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('acme');
  });

  it('clears immediately with the clear button or Escape', async () => {
    const user = setupUser();
    const { input, onCommit } = renderField('acme');

    await user.click(screen.getByRole('button', { name: 'Clear company' }));
    expect(input).toHaveValue('');
    expect(onCommit).toHaveBeenLastCalledWith('');

    await user.type(input, 'x{Escape}');
    expect(input).toHaveValue('');
    act(() => jest.advanceTimersByTime(300));
    expect(onCommit).not.toHaveBeenCalledWith('x');
  });

  it('follows the URL when it changes elsewhere and drops the stale pending commit', async () => {
    const user = setupUser();
    const { input, onCommit, rerender } = renderField('acme');

    await user.type(input, ' co');
    // e.g. "Clear all" empties the URL before the debounce fires.
    rerender(<SearchField label="Company" value="" onCommit={onCommit} />);
    act(() => jest.advanceTimersByTime(300));

    expect(input).toHaveValue('');
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('keeps a trailing space the user is typing when the trimmed term is committed', async () => {
    const user = setupUser();
    const { input, onCommit, rerender } = renderField();

    await user.type(input, 'acme ');
    act(() => jest.advanceTimersByTime(300));
    // The URL stores the trimmed term.
    rerender(<SearchField label="Company" value="acme" onCommit={onCommit} />);

    expect(input).toHaveValue('acme ');
  });
});
