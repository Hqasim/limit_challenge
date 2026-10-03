import { describeActiveFilters } from '@/lib/submissions/filter-summary';
import { buildBroker } from '@/test/fixtures';

const labels = (...args: Parameters<typeof describeActiveFilters>) =>
  describeActiveFilters(...args).map(({ label }) => label);

describe('describeActiveFilters', () => {
  it('describes every active filter in reading order', () => {
    expect(
      labels(
        {
          status: ['new', 'in_review'],
          priority: ['high'],
          brokerId: 3,
          companySearch: 'acme',
          createdFrom: '2026-09-01',
          createdTo: '2026-09-30',
          hasDocuments: true,
          hasNotes: false,
          ordering: 'company',
          page: 2,
        },
        [buildBroker({ id: 3, name: 'Northwind Brokerage' })],
      ),
    ).toEqual([
      'Company: “acme”',
      'Status: New, In review',
      'Priority: High',
      'Broker: Northwind Brokerage',
      'Created: Sep 1, 2026 – Sep 30, 2026',
      'Has documents: Yes',
      'Has notes: No',
    ]);
  });

  it('describes open-ended date ranges', () => {
    expect(labels({ createdFrom: '2026-09-01' })).toEqual(['Created: From Sep 1, 2026']);
    expect(labels({ createdTo: '2026-09-30' })).toEqual(['Created: Until Sep 30, 2026']);
  });

  it('falls back to the broker id until the broker list is available', () => {
    expect(labels({ brokerId: 7 })).toEqual(['Broker: #7']);
  });

  it('clears both ends of a date range together', () => {
    const [created] = describeActiveFilters({ createdFrom: '2026-09-01', createdTo: '2026-09-30' });
    expect(created.clears).toEqual(['createdFrom', 'createdTo']);
  });

  it('ignores sorting, paging and view', () => {
    expect(describeActiveFilters({ ordering: 'company', page: 3, view: 'cards' })).toEqual([]);
  });
});
