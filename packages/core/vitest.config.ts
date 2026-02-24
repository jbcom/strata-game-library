import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

/**
 * Resolve a package to its ESM entry point (the "module" field in package.json).
 * Falls back to the default entry if no "module" field exists.
 */
function resolveEsmEntry(pkg: string): string {
    const pkgJsonPath = require.resolve(`${pkg}/package.json`);
    const pkgDir = dirname(pkgJsonPath);
    const pkgJson = require(pkgJsonPath);
    if (pkgJson.module) {
        return resolve(pkgDir, pkgJson.module);
    }
    return pkgDir;
}

/**
 * Resolve a package to its directory (for packages that need to be anchored
 * to a specific location in pnpm's virtual store).
 */
function resolvePkgDir(pkg: string): string {
    return dirname(require.resolve(`${pkg}/package.json`));
}

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
        include: [
            'tests/unit/**/*.test.ts',
            'src/**/__tests__/**/*.test.ts',
            'src/**/__tests__/**/*.test.tsx',
        ],
        exclude: ['node_modules', 'dist', 'tests/integration', 'tests/e2e', 'packages', 'internal'],
        setupFiles: [resolve(__dirname, 'tests/unit/setup.ts')],
        // Suppress unhandled errors in teardown phase (Vitest jsdom bug workaround)
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
        // Inline @react-three/drei and tunnel-rat so Vite processes them
        // through its transform pipeline instead of externalizing them to
        // Node's native module resolution. This works together with the
        // resolve.alias entries below to ensure ESM resolution.
        server: {
            deps: {
                inline: ['@react-three/drei', 'tunnel-rat'],
            },
        },
    },
    resolve: {
        alias: {
            '@jbcom/strata': resolve(__dirname, 'src'),
            '@jbcom/strata/core': resolve(__dirname, 'src/core'),
            // Force ESM resolution for packages that ship dual CJS/ESM bundles.
            // In Vitest's SSR mode, Vite resolves the "main" (CJS) field by
            // default. The CJS entry of @react-three/drei loads tunnel-rat's CJS
            // entry, which uses require('react') - this fails in the ESM + jsdom
            // test environment. Aliasing to the "module" entry avoids this.
            '@react-three/drei': resolveEsmEntry('@react-three/drei'),
            'tunnel-rat': resolveEsmEntry('tunnel-rat'),
            // Anchor react and react-dom to the versions installed in this
            // package. tunnel-rat does not declare react as a peer dependency,
            // so pnpm does not symlink react into tunnel-rat's node_modules.
            // When Vite inlines tunnel-rat's ESM entry and encounters
            // `import React from 'react'`, it cannot resolve react from
            // tunnel-rat's location in the pnpm virtual store. These aliases
            // ensure react is always resolvable.
            react: resolvePkgDir('react'),
            'react-dom': resolvePkgDir('react-dom'),
        },
    },
});
