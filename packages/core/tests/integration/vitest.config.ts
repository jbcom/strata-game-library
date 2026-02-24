import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Vitest configuration for integration tests
 *
 * Integration tests test React components with Three.js
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.tsx'],
    exclude: ['node_modules', 'dist', 'tests/unit', 'tests/e2e'],
    setupFiles: [resolve(__dirname, 'setup.ts')],
  },
  resolve: {
    alias: {
      '@jbcom/strata': resolve(__dirname, '../../src'),
      '@jbcom/strata/components': resolve(__dirname, '../../src/components'),
    },
  },
});
