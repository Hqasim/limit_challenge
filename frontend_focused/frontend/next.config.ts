import type { NextConfig } from 'next';

// Baseline security headers for every route. A Content-Security-Policy is left out: with
// Emotion's inline styles it needs per-request nonces (generated in proxy.ts), which is
// listed as future work.
const securityHeaders = [
  // Stop browsers guessing content types (MIME sniffing).
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send only the origin to other sites, never full URLs with filter params.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The app is never meant to be embedded in another site (clickjacking protection).
  { key: 'X-Frame-Options', value: 'DENY' },
  // Turn off powerful browser features the app does not use.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework in an `X-Powered-By` response header.
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
