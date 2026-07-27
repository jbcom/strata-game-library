import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['node_modules', 'dist', 'tests', '**/*.config.ts'],
      thresholds: {
        lines: 60,
        branches: 50,
        functions: 60,
        statements: 60,
      },
    },
  },
});
