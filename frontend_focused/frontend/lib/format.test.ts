import {
  formatCount,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  getInitials,
} from '@/lib/format';

// Tests run in UTC (test/global-setup.ts), so absolute dates are deterministic.
const NOW = Date.parse('2026-10-04T12:00:00Z');

describe('formatDate / formatDateTime', () => {
  it('formats ISO timestamps in en-US style', () => {
    expect(formatDate('2026-09-28T14:03:00Z')).toBe('Sep 28, 2026');
    // Recent ICU versions put a narrow no-break space before "PM"; \s matches it, so the
    // comparison uses plain spaces.
    expect(formatDateTime('2026-09-28T14:03:00Z').replace(/\s/g, ' ')).toBe(
      'Sep 28, 2026, 2:03 PM',
    );
  });

  it('never throws on a bad value', () => {
    expect(formatDate('not a date')).toBe('Unknown date');
  });
});

describe('formatRelativeTime', () => {
  it.each([
    ['2026-10-04T11:59:30Z', 'just now'],
    ['2026-10-04T11:55:00Z', '5 minutes ago'],
    ['2026-10-04T09:00:00Z', '3 hours ago'],
    ['2026-10-03T10:00:00Z', 'yesterday'],
    ['2026-09-30T12:00:00Z', '4 days ago'],
    ['2026-09-13T12:00:00Z', '3 weeks ago'],
    ['2026-07-01T12:00:00Z', '3 months ago'],
    ['2024-09-01T12:00:00Z', '2 years ago'],
    ['2026-10-04T14:00:00Z', 'in 2 hours'],
  ])('describes %s as "%s"', (iso, expected) => {
    expect(formatRelativeTime(iso, NOW)).toBe(expected);
  });
});

describe('formatCount', () => {
  it('pluralises and groups thousands', () => {
    expect(formatCount(1, 'note')).toBe('1 note');
    expect(formatCount(0, 'note')).toBe('0 notes');
    expect(formatCount(1204, 'submission')).toBe('1,204 submissions');
    expect(formatCount(2, 'person', 'people')).toBe('2 people');
  });
});

describe('getInitials', () => {
  it('uses the first and last word', () => {
    expect(getInitials('Jane van Doe')).toBe('JD');
    expect(getInitials('  prince  ')).toBe('P');
    expect(getInitials('')).toBe('?');
  });
});
