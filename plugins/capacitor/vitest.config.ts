import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // src/react/useDevice.tsx and useInput.tsx are .tsx sources exercised by
      // react-hooks.test.tsx; a .ts-only glob would silently omit them.
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['tests/**/*.test.{ts,tsx}'],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
        statements: 60,
      },
    },
  },
});
