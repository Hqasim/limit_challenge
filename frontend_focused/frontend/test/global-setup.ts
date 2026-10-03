// Runs once before the test workers start. Pinning the time zone makes date formatting tests
// give the same result on every machine and in CI.
export default function globalSetup() {
  process.env.TZ = 'UTC';
}
