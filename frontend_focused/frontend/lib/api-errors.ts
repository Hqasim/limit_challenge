import axios from 'axios';

import { apiBaseUrl } from '@/lib/api-client';
import { PARAM_LABELS } from '@/lib/submissions/constants';

// Turns whatever a failed request threw into one predictable shape, so every page can show a
// specific, human message (and the right recovery action) without inspecting axios errors.

export type ApiErrorKind =
  | 'network'
  | 'timeout'
  | 'bad_request'
  | 'not_found'
  | 'server'
  | 'unknown';

export interface ApiError {
  kind: ApiErrorKind;
  status?: number;
  message: string;
  // 400s only: the backend's per-param messages, e.g. { createdTo: ['Must be ...'] }.
  fieldErrors?: Record<string, string[]>;
}

// DRF validation bodies map each param to a list of messages (sometimes a single string).
function readFieldErrors(data: unknown): Record<string, string[]> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
  return Object.fromEntries(
    Object.entries(data).flatMap(([key, value]) => {
      const messages = (Array.isArray(value) ? value : [value]).filter(
        (message): message is string => typeof message === 'string',
      );
      return messages.length > 0 ? [[key, messages]] : [];
    }),
  );
}

// "Created to: Must be the same as or later than createdFrom." for each invalid param.
function describeFieldErrors(fieldErrors: Record<string, string[]>): string | undefined {
  const lines = Object.entries(fieldErrors).map(([param, messages]) => {
    const label = PARAM_LABELS[param as keyof typeof PARAM_LABELS];
    return label ? `${label}: ${messages.join(' ')}` : messages.join(' ');
  });
  return lines.length > 0 ? lines.join(' ') : undefined;
}

// Classifies a thrown value: requests that got no response (timeout, unreachable API) first,
// then the rest by HTTP status. Anything that isn't an axios error is 'unknown'.
export function toApiError(error: unknown): ApiError {
  if (!axios.isAxiosError(error)) {
    return { kind: 'unknown', message: 'Something went wrong. Please try again.' };
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return { kind: 'timeout', message: 'The API took too long to respond. Please try again.' };
  }
  // No response at all: the server is down, unreachable, or blocked by CORS.
  if (!error.response) {
    return {
      kind: 'network',
      message: `Can't reach the API at ${apiBaseUrl}. Check that the backend is running.`,
    };
  }

  const { status, data } = error.response;
  if (status === 400) {
    const fieldErrors = readFieldErrors(data);
    return {
      kind: 'bad_request',
      status,
      fieldErrors,
      message: describeFieldErrors(fieldErrors) ?? 'The request was not valid.',
    };
  }
  if (status === 404) {
    return { kind: 'not_found', status, message: 'The requested record was not found.' };
  }
  if (status >= 500) {
    return {
      kind: 'server',
      status,
      message: 'The API ran into a problem. Please try again in a moment.',
    };
  }
  return { kind: 'unknown', status, message: `The API returned an unexpected error (${status}).` };
}

// Only failures that may succeed on a second attempt are retried (lib/query-client.ts).
// Retrying a 400 or 404 would just repeat the same answer more slowly.
export function isRetryable(error: unknown): boolean {
  const { kind } = toApiError(error);
  return kind === 'network' || kind === 'timeout' || kind === 'server';
}
