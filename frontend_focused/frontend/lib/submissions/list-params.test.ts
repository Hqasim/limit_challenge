import {
  clearListFilters,
  countActiveFilters,
  listHref,
  parseListParams,
  toListQuery,
  toSearchString,
  updateListParams,
} from '@/lib/submissions/list-params';

const parse = (search: string) => parseListParams(new URLSearchParams(search));

describe('parseListParams', () => {
  it('reads every supported param', () => {
    expect(
      parse(
        'status=new,in_review&priority=high&brokerId=3&companySearch=acme&createdFrom=2026-09-01' +
          '&createdTo=2026-09-30&hasDocuments=true&hasNotes=false&ordering=-priority&page=2' +
          '&pageSize=25&view=cards',
      ),
    ).toEqual({
      status: ['new', 'in_review'],
      priority: ['high'],
      brokerId: 3,
      companySearch: 'acme',
      createdFrom: '2026-09-01',
      createdTo: '2026-09-30',
      hasDocuments: true,
      hasNotes: false,
      ordering: '-priority',
      page: 2,
      pageSize: 25,
      view: 'cards',
    });
  });

  it('drops invalid values instead of sending them to the API', () => {
    expect(
      parse(
        'status=new,bogus&priority=urgent&brokerId=abc&createdFrom=2026-02-30&createdTo=yesterday' +
          '&hasDocuments=maybe&ordering=random&page=-1&pageSize=7&view=grid',
      ),
    ).toEqual({ status: ['new'] });
  });

  it('dedupes multi-value params and puts them in canonical order', () => {
    expect(parse('status=lost,new,lost').status).toEqual(['new', 'lost']);
  });

  it('leaves defaults out so equal states have one canonical form', () => {
    expect(parse('page=1&pageSize=10&ordering=-createdAt&companySearch=%20%20')).toEqual({});
  });

  it('accepts encoded commas as well as plain ones', () => {
    expect(parse('status=new%2Cclosed').status).toEqual(['new', 'closed']);
  });
});

describe('toSearchString', () => {
  it('writes params in a fixed order with readable commas', () => {
    expect(
      toSearchString({
        view: 'cards',
        page: 2,
        status: ['in_review', 'new'],
        companySearch: 'a&b',
      }),
    ).toBe('status=new,in_review&companySearch=a%26b&page=2&view=cards');
  });

  it('omits defaults and empty values', () => {
    expect(toSearchString({ page: 1, pageSize: 10, ordering: '-createdAt', status: [] })).toBe('');
  });

  it('round-trips through parseListParams', () => {
    const params = parse('priority=low,high&hasNotes=true&createdTo=2026-09-30&ordering=company');
    expect(parse(toSearchString(params))).toEqual(params);
  });
});

describe('updateListParams', () => {
  it('returns to page 1 when a filter, the sort or the page size changes', () => {
    const current = { status: ['new' as const], page: 3 };

    expect(updateListParams(current, { brokerId: 2 })).toEqual({ status: ['new'], brokerId: 2 });
    expect(updateListParams(current, { ordering: 'company' })).not.toHaveProperty('page');
    expect(updateListParams(current, { pageSize: 50 })).not.toHaveProperty('page');
  });

  it('keeps the page when only the view or the page changes', () => {
    expect(updateListParams({ page: 3 }, { view: 'cards' })).toEqual({ page: 3, view: 'cards' });
    expect(updateListParams({ page: 3 }, { page: 4 })).toEqual({ page: 4 });
  });

  it('removes a filter set to undefined', () => {
    expect(updateListParams({ brokerId: 2, status: ['new'] }, { brokerId: undefined })).toEqual({
      status: ['new'],
    });
  });
});

describe('clearListFilters', () => {
  it('removes every filter but keeps sort, page size and view', () => {
    const params = parse('status=new&brokerId=3&ordering=company&pageSize=25&page=4&view=cards');
    expect(clearListFilters(params)).toEqual({ ordering: 'company', pageSize: 25, view: 'cards' });
  });
});

describe('countActiveFilters', () => {
  it('counts filter groups, not sort, paging or view', () => {
    expect(countActiveFilters(parse('status=new,lost&hasNotes=false&page=2&view=cards'))).toBe(2);
    expect(countActiveFilters({})).toBe(0);
  });

  it('counts a created-date range once, whether one or both ends are set', () => {
    expect(countActiveFilters(parse('createdFrom=2026-09-01&createdTo=2026-09-30'))).toBe(1);
    expect(countActiveFilters(parse('createdTo=2026-09-30&hasNotes=true'))).toBe(2);
  });
});

describe('toListQuery', () => {
  it('drops the UI-only view param from the API query', () => {
    expect(toListQuery({ status: ['new'], view: 'cards' })).toEqual({ status: ['new'] });
  });
});

describe('listHref', () => {
  it('links to the list with or without params', () => {
    expect(listHref()).toBe('/submissions');
    expect(listHref({ status: ['new'] })).toBe('/submissions?status=new');
  });
});
