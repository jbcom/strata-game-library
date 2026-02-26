import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);

function resolveEsmEntry(pkg: string): string {
	const pkgJsonPath = require.resolve(`${pkg}/package.json`);
	const pkgDir = dirname(pkgJsonPath);
	const pkgJson = require(pkgJsonPath);
	if (pkgJson.module) {
		return resolve(pkgDir, pkgJson.module);
	}
	return pkgDir;
}

function resolvePkgDir(pkg: string): string {
	return dirname(require.resolve(`${pkg}/package.json`));
}

export default defineConfig({
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.{ts,tsx}'],
		globals: true,
		testTimeout: 15000,
		dangerouslyIgnoreUnhandledErrors: true,
		server: {
			deps: {
				inline: ['@react-three/drei', 'tunnel-rat'],
			},
		},
	},
	resolve: {
		alias: {
			'@strata-game-library/core': resolve(__dirname, '../../packages/core/src'),
			'@react-three/drei': resolveEsmEntry('@react-three/drei'),
			'tunnel-rat': resolveEsmEntry('tunnel-rat'),
			react: resolvePkgDir('react'),
			'react-dom': resolvePkgDir('react-dom'),
		},
	},
});
