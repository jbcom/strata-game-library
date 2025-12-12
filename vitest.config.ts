import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

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
        environment: 'jsdom',
        include: ['tests/unit/**/*.test.ts', 'src/**/__tests__/**/*.test.ts'],
        exclude: ['node_modules', 'dist', 'tests/integration', 'tests/e2e'],
        setupFiles: [resolve(__dirname, 'tests/unit/setup.ts')],
        // Suppress unhandled errors in teardown phase (Vitest jsdom bug workaround)
        dangerouslyIgnoreUnhandledErrors: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules',
                'dist',
                'tests',
                'examples',
                '**/*.config.ts',
                '**/index.ts',
            ],
        },
    },
    resolve: {
        alias: {
            '@jbcom/strata': resolve(__dirname, 'src'),
            '@jbcom/strata/core': resolve(__dirname, 'src/core'),
        },
    },
});
