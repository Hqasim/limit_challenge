import type { Config } from 'jest';
import nextJest from 'next/jest.js';

// Jest set up the way the Next.js docs recommend: next/jest compiles TS/TSX with SWC, mocks
// style and image imports, and loads next.config.ts and .env files.
const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  globalSetup: '<rootDir>/test/global-setup.ts',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Mirror the "@/*" path alias from tsconfig.json.
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
  // Tests live next to the code they cover: Foo.tsx -> Foo.test.tsx.
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
};

// Exported this way so next/jest can load the (async) Next.js config first.
export default createJestConfig(config);
