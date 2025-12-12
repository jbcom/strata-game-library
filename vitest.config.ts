import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

/**
 * Main Vitest configuration
 * 
 * This is the default config. For specific test types, see:
 * - tests/unit/vitest.config.ts - Unit tests
 * - tests/integration/vitest.config.ts - Integration tests
 */
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'], // Include both test directories
    exclude: ['node_modules', 'dist', 'tests/integration', 'tests/e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        'tests',
        'examples',
        '**/*.config.ts',
        '**/index.ts' // Barrel exports
      ]
    }
  },
  resolve: {
    alias: {
      '@jbcom/strata': resolve(__dirname, 'src'),
      '@jbcom/strata/core': resolve(__dirname, 'src/core'),
    }
  }
});
