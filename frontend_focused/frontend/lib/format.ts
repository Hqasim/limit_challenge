// Display formatting built on the browser's Intl APIs (no date library needed). The locale is
// fixed to en-US so output is the same for every user and in tests; times are shown in the
// user's own time zone.

const LOCALE = 'en-US';

const dateFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' });
const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' });
const relativeFormat = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
const numberFormat = new Intl.NumberFormat(LOCALE);

function toDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

// "Sep 28, 2026"
export function formatDate(iso: string): string {
  const date = toDate(iso);
  return date ? dateFormat.format(date) : 'Unknown date';
}

// A calendar day such as a filter's "2026-09-01" -> "Sep 1, 2026". Built from its parts as a
// local date: `new Date('2026-09-01')` would mean UTC midnight, which is still Aug 31 for
// anyone west of Greenwich.
export function formatCalendarDate(day: string): string {
  const [year, month, date] = day.split('-').map(Number);
  if (!year || !month || !date) return 'Unknown date';
  return dateFormat.format(new Date(year, month - 1, date));
}

// "Sep 28, 2026, 2:03 PM"
export function formatDateTime(iso: string): string {
  const date = toDate(iso);
  return date ? dateTimeFormat.format(date) : 'Unknown date';
}

// Largest unit first; a difference is expressed in the first unit it reaches.
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

// "just now", "5 minutes ago", "yesterday", "3 weeks ago", "in 2 hours" (future dates occur:
// the seed data can date notes slightly ahead).
export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const date = toDate(iso);
  if (!date) return 'Unknown date';

  const seconds = Math.round((date.getTime() - now) / 1000);
  for (const [unit, unitSeconds] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeFormat.format(Math.trunc(seconds / unitSeconds), unit);
    }
  }
  return 'just now';
}

// "1 note", "12 notes", "1,204 submissions"
export function formatCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${numberFormat.format(count)} ${count === 1 ? singular : plural}`;
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

// "Jane van Doe" -> "JD": first and last word, for avatars.
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : '';
  return `${first}${last}`.toUpperCase();
}
