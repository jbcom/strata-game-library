import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

/**
 * Main Vitest configuration for @strata-game-library/core
 *
 * Core is pure TypeScript with no React dependencies.
 * React component tests are in @strata-game-library/r3f.
 */
export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: [
            'tests/unit/**/*.test.ts',
            'src/**/__tests__/**/*.test.ts',
        ],
        exclude: ['node_modules', 'dist', 'tests/integration', 'tests/e2e', 'packages', 'internal'],
        setupFiles: [resolve(__dirname, 'tests/unit/setup.ts')],
        dangerouslyIgnoreUnhandledErrors: true,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            reportsDirectory: './coverage',
            exclude: [
                'node_modules',
                'dist',
                'tests',
                'examples',
                '**/*.config.ts',
                '**/index.ts',
            ],
            thresholds: {
                lines: 60,
                branches: 50,
                functions: 60,
                statements: 60,
            },
        },
    },
    resolve: {
        alias: {
            '@strata-game-library/core': resolve(__dirname, 'src'),
            '@strata-game-library/core/core': resolve(__dirname, 'src/core'),
        },
    },
});
