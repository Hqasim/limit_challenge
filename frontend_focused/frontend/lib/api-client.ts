// Shared axios instance used by every data-fetching hook in lib/hooks.
import axios from 'axios';

// NEXT_PUBLIC_* env vars are inlined into the browser bundle at build time, so changing
// .env.local requires restarting `npm run dev`. Trailing slashes are trimmed so paths can
// always be appended as `${apiBaseUrl}/...`.
export const apiBaseUrl = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api'
).replace(/\/+$/, '');

// Swagger UI served by the backend (drf-spectacular), linked from the header.
export const apiDocsUrl = `${apiBaseUrl}/docs/`;

// Every request goes through this instance: one base URL and one timeout for the whole app.
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000, // ms; a hung request rejects and surfaces as a React Query error.
});
