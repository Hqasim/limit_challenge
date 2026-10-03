import { fireEvent, screen, waitFor, within } from '@testing-library/react';

import SubmissionFilters from '@/components/submissions/list/SubmissionFilters';
import { apiClient } from '@/lib/api-client';
import { useSubmissionListParams } from '@/lib/hooks/useSubmissionListParams';
import { buildBroker } from '@/test/fixtures';
import { DESKTOP_WIDTH, PHONE_WIDTH, resetScreen, setScreenWidth } from '@/test/media';
import { setTestUrl } from '@/test/next-navigation';
import { renderWithProviders } from '@/test/render';

jest.mock('next/navigation', () => jest.requireActual('@/test/next-navigation').navigationMock);
jest.mock('@/lib/api-client', () => ({
  ...jest.requireActual('@/lib/api-client'),
  apiClient: { get: jest.fn() },
}));

const BROKERS = [
  buildBroker({ id: 25, name: 'Allen Group Brokerage' }),
  buildBroker({ id: 1, name: 'Northwind Brokerage' }),
];

// The filters wired to the real URL state hook, as the workspace uses them.
function FiltersWithUrlState() {
  const { params, setParams, clearFilters } = useSubmissionListParams();
  return (
    <SubmissionFilters
      params={params}
      onChange={setParams}
      onClear={clearFilters}
      resultCount={12}
    />
  );
}

const currentUrl = () => `${window.location.pathname}${window.location.search}`;

function renderAt(url: string) {
  setTestUrl(url);
  return renderWithProviders(<FiltersWithUrlState />);
}

beforeEach(() => {
  jest.mocked(apiClient.get).mockResolvedValue({ data: BROKERS });
});
afterEach(() => resetScreen());

describe('SubmissionFilters on desktop', () => {
  beforeEach(() => setScreenWidth(DESKTOP_WIDTH));

  it('toggles statuses as a multi-select', async () => {
    const { user } = renderAt('/submissions');
    const status = screen.getByRole('group', { name: 'Status' });

    await user.click(within(status).getByRole('button', { name: 'New' }));
    await user.click(within(status).getByRole('button', { name: 'In review' }));
    expect(currentUrl()).toBe('/submissions?status=new,in_review');
    expect(within(status).getByRole('button', { name: 'New' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(within(status).getByRole('button', { name: 'New' }));
    expect(currentUrl()).toBe('/submissions?status=in_review');
  });

  it('filters by priority', async () => {
    const { user } = renderAt('/submissions?page=3');

    await user.click(
      within(screen.getByRole('group', { name: 'Priority' })).getByRole('button', {
        name: 'High',
      }),
    );

    // A filter change also returns to page 1.
    expect(currentUrl()).toBe('/submissions?priority=high');
  });

  it('picks a broker by typing part of its name, and clears it', async () => {
    const { user } = renderAt('/submissions');

    await user.type(screen.getByRole('combobox', { name: 'Broker' }), 'allen');
    await user.click(await screen.findByRole('option', { name: 'Allen Group Brokerage' }));
    expect(currentUrl()).toBe('/submissions?brokerId=25');

    await user.click(screen.getByLabelText('Clear'));
    expect(currentUrl()).toBe('/submissions');
  });

  it('sorts, leaving the default order out of the URL', async () => {
    const { user } = renderAt('/submissions');

    await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await user.click(screen.getByRole('option', { name: 'Priority: high to low' }));
    expect(currentUrl()).toBe('/submissions?ordering=-priority');

    await user.click(screen.getByRole('combobox', { name: 'Sort by' }));
    await user.click(screen.getByRole('option', { name: 'Newest first' }));
    expect(currentUrl()).toBe('/submissions');
  });

  it('keeps dates and has-documents/notes behind "More filters"', async () => {
    const { user } = renderAt('/submissions');
    const more = screen.getByRole('button', { name: 'More filters' });

    expect(more).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByLabelText('Created from')).not.toBeInTheDocument();

    await user.click(more);
    expect(more).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Created from')).toBeInTheDocument();
  });

  it('opens "More filters" by itself when the link already uses them', () => {
    renderAt('/submissions?hasNotes=true');

    expect(screen.getByRole('button', { name: 'More filters (1)' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('keeps the created date range valid', async () => {
    renderAt('/submissions?createdFrom=2026-09-10');

    // Each picker is limited by the other...
    expect(screen.getByLabelText('Created to')).toHaveAttribute('min', '2026-09-10');

    // ...and a day typed on the wrong side swaps the two, instead of sending an invalid range.
    fireEvent.change(screen.getByLabelText('Created to'), { target: { value: '2026-09-01' } });
    expect(currentUrl()).toBe('/submissions?createdFrom=2026-09-01&createdTo=2026-09-10');
  });

  it('filters by whether a submission has documents or notes', async () => {
    const { user } = renderAt('/submissions?hasNotes=false');
    const documents = screen.getByRole('group', { name: 'Has documents' });

    await user.click(within(documents).getByRole('button', { name: 'Yes' }));
    expect(currentUrl()).toBe('/submissions?hasDocuments=true&hasNotes=false');

    await user.click(within(documents).getByRole('button', { name: 'Any' }));
    expect(currentUrl()).toBe('/submissions?hasNotes=false');
  });

  it('pre-fills every control from a shared link', async () => {
    renderAt(
      '/submissions?status=new&priority=high&brokerId=25&companySearch=acme' +
        '&createdFrom=2026-09-01&hasNotes=false&ordering=company',
    );

    const pressed = (group: string, name: string) =>
      within(screen.getByRole('group', { name: group })).getByRole('button', { name });
    expect(pressed('Status', 'New')).toHaveAttribute('aria-pressed', 'true');
    expect(pressed('Priority', 'High')).toHaveAttribute('aria-pressed', 'true');
    expect(pressed('Has notes', 'No')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('textbox', { name: 'Company' })).toHaveValue('acme');
    expect(screen.getByRole('combobox', { name: 'Sort by' })).toHaveTextContent('Company: A to Z');
    expect(screen.getByLabelText('Created from')).toHaveValue('2026-09-01');
    expect(await screen.findByDisplayValue('Allen Group Brokerage')).toBeInTheDocument();
  });

  it('clears every filter at once but keeps the sort', async () => {
    const { user } = renderAt('/submissions?status=new&brokerId=25&hasNotes=true&ordering=company');

    await user.click(screen.getByRole('button', { name: 'Clear all (3)' }));

    expect(currentUrl()).toBe('/submissions?ordering=company');
    expect(screen.queryByRole('button', { name: /clear all/i })).not.toBeInTheDocument();
  });

  it('shows collapsed advanced filters as chips that remove them', async () => {
    const { user } = renderAt('/submissions?hasDocuments=true');

    await user.click(screen.getByRole('button', { name: 'More filters (1)' }));
    await user.click(
      await screen.findByRole('button', { name: 'Remove filter Has documents: Yes' }),
    );

    expect(currentUrl()).toBe('/submissions');
  });
});

describe('SubmissionFilters on phones', () => {
  beforeEach(() => setScreenWidth(PHONE_WIDTH));

  it('keeps search in view and moves the other filters into a bottom sheet', async () => {
    const { user } = renderAt('/submissions?status=new&brokerId=25');

    expect(screen.getByRole('textbox', { name: 'Company' })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Status' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Filters (2)' }));
    const sheet = screen.getByRole('dialog', { name: 'Filters' });
    await user.click(
      within(within(sheet).getByRole('group', { name: 'Priority' })).getByRole('button', {
        name: 'High',
      }),
    );
    expect(currentUrl()).toBe('/submissions?status=new&priority=high&brokerId=25');

    await user.click(within(sheet).getByRole('button', { name: 'Show 12 results' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('summarises applied filters as chips that remove them', async () => {
    const { user } = renderAt('/submissions?status=new&brokerId=25');

    expect(
      await screen.findByRole('button', { name: 'Remove filter Broker: Allen Group Brokerage' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove filter Status: New' }));

    expect(currentUrl()).toBe('/submissions?brokerId=25');
  });
});
