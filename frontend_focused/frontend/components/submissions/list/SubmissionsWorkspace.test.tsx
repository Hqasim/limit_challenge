import { screen, waitFor, within } from '@testing-library/react';

import SubmissionsWorkspace from '@/components/submissions/list/SubmissionsWorkspace';
import { apiClient } from '@/lib/api-client';
import { httpError, networkError } from '@/test/axios-errors';
import { buildBroker, buildListItem, buildPage } from '@/test/fixtures';
import { DESKTOP_WIDTH, PHONE_WIDTH, resetScreen, setScreenWidth } from '@/test/media';
import { routerMock, setTestUrl } from '@/test/next-navigation';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render';

jest.mock('next/navigation', () => jest.requireActual('@/test/next-navigation').navigationMock);
jest.mock('@/lib/api-client', () => ({
  ...jest.requireActual('@/lib/api-client'),
  apiClient: { get: jest.fn() },
}));
const get = jest.mocked(apiClient.get);

// Ten rows of a 25-row result set, with distinct ids and company names.
const PAGE_ROWS = Array.from({ length: 10 }, (_, index) =>
  buildListItem({
    id: index + 1,
    company: {
      id: index + 1,
      legalName: `Company ${index + 1}`,
      industry: 'Retail',
      headquartersCity: 'Austin',
    },
  }),
);

// Request params as the list fetcher sends them (arrays already comma-joined).
type ListParams = Record<string, unknown>;
type ListResponder = (params: ListParams) => unknown;

// Routes mocked GET requests: brokers always succeed; the list answers with `respond`
// (return data, or throw to fail); anything else (detail prefetches) gets an empty object.
function mockApi(respond: ListResponder = () => buildPage(PAGE_ROWS, 25)) {
  get.mockImplementation(async (url, config) => {
    if (url === '/brokers/') return { data: [buildBroker()] };
    if (url === '/submissions/') return { data: respond(config?.params as ListParams) };
    return { data: {} };
  });
}

// The params of the most recent list request.
const lastListParams = () =>
  get.mock.calls.filter(([url]) => url === '/submissions/').at(-1)?.[1]?.params;

const currentUrl = () => `${window.location.pathname}${window.location.search}`;

function renderAt(url: string) {
  setTestUrl(url);
  return renderWithProviders(<SubmissionsWorkspace />);
}

afterEach(() => {
  resetScreen();
  get.mockReset();
  routerMock.push.mockClear();
});

describe('SubmissionsWorkspace', () => {
  it('shows a loading state, then the submissions with a result summary', async () => {
    mockApi();
    renderAt('/submissions?view=table');

    expect(screen.getByRole('status', { name: '' })).toHaveTextContent('Loading submissions');

    const link = await screen.findByRole('link', { name: 'Company 1' });
    expect(link).toHaveAttribute('href', '/submissions/1');
    expect(screen.getByText('Showing 1–10 of 25 submissions')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11); // header + 10 rows
  });

  it('defaults to cards on small screens and to the table on desktops', async () => {
    mockApi();
    setScreenWidth(PHONE_WIDTH);
    const { unmount } = renderAt('/submissions');
    expect(
      within(await screen.findByRole('list', { name: 'Submissions' })).getAllByRole('listitem'),
    ).toHaveLength(10);
    unmount();

    setScreenWidth(DESKTOP_WIDTH);
    renderAt('/submissions');
    expect(await screen.findByRole('table')).toBeInTheDocument();
  });

  it('switches to the card view and records it in the URL', async () => {
    mockApi();
    const { user } = renderAt('/submissions?view=table&page=2');
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Cards view' }));

    expect(currentUrl()).toBe('/submissions?page=2&view=cards');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      within(screen.getByRole('list', { name: 'Submissions' })).getAllByRole('listitem'),
    ).toHaveLength(10);
  });

  it('pages through results with a new history entry and scrolls back to the top', async () => {
    mockApi(({ page }) => buildPage(page === 2 ? [buildListItem({ id: 11 })] : PAGE_ROWS, 25));
    const { user } = renderAt('/submissions?view=table');
    await screen.findByRole('link', { name: 'Company 1' });
    const historyLength = window.history.length;

    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

    expect(currentUrl()).toBe('/submissions?page=2&view=table');
    expect(window.history.length).toBe(historyLength + 1);
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    expect(await screen.findByText('Showing 11–20 of 25 submissions')).toBeInTheDocument();
    expect(lastListParams()).toMatchObject({ page: 2 });
  });

  it('changes the page size and returns to page 1', async () => {
    mockApi();
    const { user } = renderAt('/submissions?view=table&page=2');
    await screen.findByRole('table');

    await user.click(screen.getByRole('combobox', { name: 'Per page' }));
    await user.click(screen.getByRole('option', { name: '25' }));

    expect(currentUrl()).toBe('/submissions?pageSize=25&view=table');
  });

  it('sorts by a column header, reversing on the second click', async () => {
    mockApi();
    const { user } = renderAt('/submissions?view=table');
    await screen.findByRole('table');

    await user.click(screen.getByRole('button', { name: 'Submission' }));
    expect(currentUrl()).toBe('/submissions?ordering=company&view=table');
    expect(screen.getByRole('columnheader', { name: /submission/i })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );

    await user.click(screen.getByRole('button', { name: /submission/i }));
    expect(currentUrl()).toBe('/submissions?ordering=-company&view=table');
  });

  it('opens a submission when its row is clicked, and prefetches it on hover', async () => {
    mockApi();
    const { user } = renderAt('/submissions?view=table');
    const link = await screen.findByRole('link', { name: 'Company 3' });
    const row = link.closest('tr') as HTMLElement;

    await user.hover(row);
    await waitFor(() => expect(get).toHaveBeenCalledWith('/submissions/3/', expect.anything()));

    await user.click(within(row).getByText('High')); // plain text in the row, not the link
    expect(routerMock.push).toHaveBeenCalledWith('/submissions/3');
  });

  it('explains when filters match nothing and clears them on request', async () => {
    mockApi(() => buildPage([]));
    const { user } = renderAt('/submissions?companySearch=zzz&view=cards');

    expect(await screen.findByText('No submissions match these filters')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(currentUrl()).toBe('/submissions?view=cards');
  });

  it('has a distinct message when there is no data at all', async () => {
    mockApi(() => buildPage([]));
    renderAt('/submissions');

    expect(await screen.findByText('No submissions yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Clear filters' })).not.toBeInTheDocument();
  });

  it('shows a retryable error when the API is unreachable', async () => {
    let fail = true;
    mockApi(() => {
      if (fail) throw networkError();
      return buildPage(PAGE_ROWS, 25);
    });
    const { user } = renderAt('/submissions?view=table');

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load submissions");
    fail = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByRole('link', { name: 'Company 1' })).toBeInTheDocument();
  });

  it('offers page 1 when the page in the URL no longer exists', async () => {
    mockApi(({ page }) => {
      if (page === 9) throw httpError(404, { detail: 'Invalid page.' });
      return buildPage(PAGE_ROWS, 25);
    });
    const { user } = renderAt('/submissions?page=9&view=table');

    expect(await screen.findByText("Page 9 doesn't exist")).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go to page 1' }));

    expect(currentUrl()).toBe('/submissions?view=table');
    expect(await screen.findByRole('link', { name: 'Company 1' })).toBeInTheDocument();
  });

  it('names an invalid filter the backend rejected and resets filters', async () => {
    mockApi(({ createdTo }) => {
      if (createdTo) {
        throw httpError(400, { createdTo: ['Must be the same as or later than createdFrom.'] });
      }
      return buildPage(PAGE_ROWS, 25);
    });
    const { user } = renderAt('/submissions?createdFrom=2026-09-30&createdTo=2026-09-01');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("Some filters aren't valid");
    expect(alert).toHaveTextContent('Created to: Must be the same as or later than createdFrom.');

    await user.click(screen.getByRole('button', { name: 'Reset filters' }));
    expect(currentUrl()).toBe('/submissions');
  });

  it('has no detectable accessibility problems in either view', async () => {
    mockApi();
    const { container, user } = renderAt('/submissions?view=table');
    await screen.findByRole('link', { name: 'Company 1' });
    expect(await axe(container)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: 'Cards view' }));
    expect(await axe(container)).toHaveNoViolations();
  });
});
