import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';

// Builders for the errors axios throws, so tests can simulate a failing API exactly.

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig;

// The server answered with an error status (and optionally a JSON body).
export function httpError(status: number, data: unknown = {}) {
  return new AxiosError(
    'Request failed',
    'ERR_BAD_RESPONSE',
    config,
    {},
    {
      status,
      statusText: '',
      data,
      headers: {},
      config,
    },
  );
}

// No response at all: the backend is down or unreachable.
export function networkError() {
  return new AxiosError('Network Error', 'ERR_NETWORK', config, {});
}

// The request ran past apiClient's timeout.
export function timeoutError() {
  return new AxiosError('timeout of 15000ms exceeded', 'ECONNABORTED', config, {});
}
