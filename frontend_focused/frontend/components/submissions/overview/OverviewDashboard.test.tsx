import { screen, within } from '@testing-library/react';

import OverviewDashboard from '@/components/submissions/overview/OverviewDashboard';
import { apiClient } from '@/lib/api-client';
import { networkError } from '@/test/axios-errors';
import { buildListItem, buildPage } from '@/test/fixtures';
import { renderWithProviders } from '@/test/render';

jest.mock('@/lib/api-client', () => ({
  ...jest.requireActual('@/lib/api-client'),
  apiClient: { get: jest.fn() },
}));
const get = jest.mocked(apiClient.get);

const STATUS_TOTALS: Record<string, number> = { new: 6, in_review: 8, closed: 2, lost: 9 };

const NEEDS_ATTENTION_ROWS = [
  buildListItem({ id: 7, status: 'in_review' }),
  buildListItem({
    id: 8,
    company: { id: 2, legalName: 'Beta Freight Co', industry: 'Freight', headquartersCity: 'Reno' },
  }),
];

type Params = { status?: string; pageSize?: number };

// Routes the dashboard's requests: single-row count queries per status, and the five-row
// "needs attention" list. `override` can answer either kind differently.
function mockApi(override?: (params: Params) => unknown) {
  get.mockImplementation(async (_url, config) => {
    const params = config?.params as Params;
    const overridden = override?.(params);
    if (overridden !== undefined) return { data: overridden };
    if (params.pageSize === 1) return { data: buildPage([], STATUS_TOTALS[params.status ?? '']) };
    return { data: buildPage(NEEDS_ATTENTION_ROWS, 7) };
  });
}

afterEach(() => get.mockReset());

describe('OverviewDashboard', () => {
  it('shows each status count with its share, linking to the filtered list', async () => {
    mockApi();
    renderWithProviders(<OverviewDashboard />);

    const tiles = screen.getByRole('list', { name: 'Submissions by status' });
    const newTile = await within(tiles).findByRole('link', { name: /^New: 6 submissions/ });
    expect(newTile).toHaveAttribute('href', '/submissions?status=new');
    expect(newTile).toHaveTextContent('24% of all submissions'); // 6 of 25
    expect(within(tiles).getByRole('link', { name: /^In review: 8/ })).toHaveAttribute(
      'href',
      '/submissions?status=in_review',
    );
  });

  it('reports failed counts once, without breaking the tiles, and retries them', async () => {
    let failLost = true;
    mockApi((params) => {
      if (params.pageSize === 1 && params.status === 'lost' && failLost) throw networkError();
      return undefined;
    });
    const { user } = renderWithProviders(<OverviewDashboard />);

    expect(await screen.findByText("Couldn't load some of the status counts.")).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Lost submissions/ })).toHaveTextContent('—');

    failLost = false;
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByRole('link', { name: /^Lost: 9 submissions/ })).toBeInTheDocument();
  });

  it('lists high-priority open submissions, each linking to its detail page', async () => {
    mockApi();
    renderWithProviders(<OverviewDashboard />);

    const section = screen.getByRole('region', { name: /^Needs attention/ });
    expect(await within(section).findByRole('link', { name: /Beta Freight Co/ })).toHaveAttribute(
      'href',
      '/submissions/8',
    );
    expect(within(section).getByRole('link', { name: /View all/ })).toHaveAttribute(
      'href',
      '/submissions?status=new,in_review&priority=high',
    );
    expect(section).toHaveTextContent('7'); // total count pill

    const listRequest = get.mock.calls.find(
      ([, config]) => (config?.params as Params | undefined)?.pageSize === 5,
    );
    expect(listRequest?.[1]?.params).toMatchObject({
      status: 'new,in_review',
      priority: 'high',
    });
  });

  it('says "All clear" when nothing needs attention', async () => {
    mockApi((params) => (params.pageSize === 5 ? buildPage([]) : undefined));
    renderWithProviders(<OverviewDashboard />);

    expect(await screen.findByText('All clear')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /View all/ })).not.toBeInTheDocument();
  });

  it('shows a retryable error in the list when it fails to load', async () => {
    let fail = true;
    mockApi((params) => {
      if (params.pageSize === 5 && fail) throw networkError();
      return undefined;
    });
    const { user } = renderWithProviders(<OverviewDashboard />);

    const section = screen.getByRole('region', { name: /^Needs attention/ });
    expect(await within(section).findByRole('alert')).toHaveTextContent("Couldn't load this list");
    fail = false;
    await user.click(within(section).getByRole('button', { name: 'Retry' }));

    expect(
      await within(section).findByRole('link', { name: /Beta Freight Co/ }),
    ).toBeInTheDocument();
  });

  it('offers quick views as links into the filtered list', () => {
    mockApi();
    renderWithProviders(<OverviewDashboard />);

    const quickViews = screen.getByRole('region', { name: /^Quick views/ });
    expect(within(quickViews).getByRole('link', { name: /Missing documents/ })).toHaveAttribute(
      'href',
      '/submissions?status=new,in_review&hasDocuments=false',
    );
    expect(within(quickViews).getByRole('link', { name: /Waiting longest/ })).toHaveAttribute(
      'href',
      '/submissions?status=new&ordering=createdAt',
    );
  });
});
