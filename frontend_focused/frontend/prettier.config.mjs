// Code formatting rules, checked by `npm run format` and enforced by ESLint.
/** @type {import('prettier').Config} */
const config = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  semi: true,
  // Keep whichever line ending the file already has (git's autocrlf checks out CRLF on Windows).
  endOfLine: 'auto',
};

export default config;
