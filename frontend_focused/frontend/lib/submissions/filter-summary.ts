import { formatCalendarDate } from '@/lib/format';
import { PRIORITY_META, STATUS_META } from '@/lib/submissions/constants';
import { ListParams } from '@/lib/submissions/list-params';
import type { Broker, SubmissionListFilters } from '@/lib/types';

// Human-readable summaries of the active filters, e.g. "Status: New, In review", used for the
// removable chips that show filters the user can't currently see (on phones, or when "More
// filters" is collapsed). Pure, so it is easy to test.

export interface ActiveFilter {
  // Stable id for React keys.
  id: string;
  label: string;
  // The params that removing this chip clears (a date range is one chip, two params).
  clears: (keyof SubmissionListFilters)[];
}

// Filters shown under "More filters" on desktop.
export const ADVANCED_FILTER_KEYS: (keyof SubmissionListFilters)[] = [
  'createdFrom',
  'createdTo',
  'hasDocuments',
  'hasNotes',
];

const yesNo = (value: boolean) => (value ? 'Yes' : 'No');

// "Sep 1, 2026 – Sep 30, 2026", "From Sep 1, 2026" or "Until Sep 30, 2026".
function describeDateRange(from?: string, to?: string): string {
  if (from && to) return `${formatCalendarDate(from)} – ${formatCalendarDate(to)}`;
  if (from) return `From ${formatCalendarDate(from)}`;
  return `Until ${formatCalendarDate(to as string)}`;
}

export function describeActiveFilters(params: ListParams, brokers: Broker[] = []): ActiveFilter[] {
  const filters: ActiveFilter[] = [];

  if (params.companySearch) {
    filters.push({
      id: 'companySearch',
      label: `Company: “${params.companySearch}”`,
      clears: ['companySearch'],
    });
  }
  if (params.status) {
    filters.push({
      id: 'status',
      label: `Status: ${params.status.map((status) => STATUS_META[status].label).join(', ')}`,
      clears: ['status'],
    });
  }
  if (params.priority) {
    filters.push({
      id: 'priority',
      label: `Priority: ${params.priority.map((priority) => PRIORITY_META[priority].label).join(', ')}`,
      clears: ['priority'],
    });
  }
  if (params.brokerId) {
    // Until brokers load (or for an id that no longer exists) show the id instead of a name.
    const broker = brokers.find(({ id }) => id === params.brokerId);
    filters.push({
      id: 'brokerId',
      label: `Broker: ${broker?.name ?? `#${params.brokerId}`}`,
      clears: ['brokerId'],
    });
  }
  if (params.createdFrom || params.createdTo) {
    filters.push({
      id: 'created',
      label: `Created: ${describeDateRange(params.createdFrom, params.createdTo)}`,
      clears: ['createdFrom', 'createdTo'],
    });
  }
  if (params.hasDocuments !== undefined) {
    filters.push({
      id: 'hasDocuments',
      label: `Has documents: ${yesNo(params.hasDocuments)}`,
      clears: ['hasDocuments'],
    });
  }
  if (params.hasNotes !== undefined) {
    filters.push({
      id: 'hasNotes',
      label: `Has notes: ${yesNo(params.hasNotes)}`,
      clears: ['hasNotes'],
    });
  }

  return filters;
}
