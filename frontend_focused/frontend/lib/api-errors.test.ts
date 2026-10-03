import { apiBaseUrl } from '@/lib/api-client';
import { isRetryable, toApiError } from '@/lib/api-errors';
import { httpError, networkError, timeoutError } from '@/test/axios-errors';

describe('toApiError', () => {
  it('explains an unreachable backend', () => {
    const error = toApiError(networkError());
    expect(error.kind).toBe('network');
    expect(error.message).toBe(
      `Can't reach the API at ${apiBaseUrl}. Check that the backend is running.`,
    );
  });

  it('recognises a timeout', () => {
    expect(toApiError(timeoutError()).kind).toBe('timeout');
  });

  it('turns a 400 into a message that names each invalid param', () => {
    const error = toApiError(
      httpError(400, {
        createdTo: ['Must be the same as or later than createdFrom.'],
        status: 'Select a valid choice.',
      }),
    );

    expect(error).toEqual({
      kind: 'bad_request',
      status: 400,
      fieldErrors: {
        createdTo: ['Must be the same as or later than createdFrom.'],
        status: ['Select a valid choice.'],
      },
      message:
        'Created to: Must be the same as or later than createdFrom. Status: Select a valid choice.',
    });
  });

  it('falls back to a generic message for a 400 without field errors', () => {
    expect(toApiError(httpError(400, 'Bad request')).message).toBe('The request was not valid.');
  });

  it.each([
    [404, 'not_found'],
    [500, 'server'],
    [503, 'server'],
    [418, 'unknown'],
  ])('classifies HTTP %i as %s', (status, kind) => {
    expect(toApiError(httpError(status)).kind).toBe(kind);
  });

  it('handles errors that did not come from axios', () => {
    expect(toApiError(new TypeError('boom'))).toEqual({
      kind: 'unknown',
      message: 'Something went wrong. Please try again.',
    });
  });
});

describe('isRetryable', () => {
  it('retries failures that may be temporary', () => {
    expect(isRetryable(networkError())).toBe(true);
    expect(isRetryable(httpError(502))).toBe(true);
  });

  it('does not retry answers that would repeat', () => {
    expect(isRetryable(httpError(400))).toBe(false);
    expect(isRetryable(httpError(404))).toBe(false);
  });
});
