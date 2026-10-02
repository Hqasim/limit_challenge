// Shared axios instance used by every data-fetching hook in lib/hooks.
import axios from 'axios';

// NEXT_PUBLIC_* env vars are inlined into the browser bundle at build time, so changing
// .env.local requires restarting `npm run dev`.
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 15_000, // ms; a hung request rejects and surfaces as a React Query error.
});
