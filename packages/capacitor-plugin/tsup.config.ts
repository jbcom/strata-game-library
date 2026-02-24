import { defineConfig } from 'tsup';

/**
 * tsup configuration for @strata-game-library/capacitor-plugin
 *
 * Ensures proper Node.js ESM support with correct .js extensions
 */
export default defineConfig({
	entry: {
		index: 'src/index.ts',
		'react/index': 'src/react/index.ts',
	},
	format: ['esm'],
	dts: true,
	clean: true,
	sourcemap: true,
	splitting: true,
	target: 'ES2020',
	jsx: 'automatic',
	external: ['@capacitor/core', 'react'],
	treeshake: true,
	minify: false,
	keepNames: true,
	banner: {
		js: '/* @strata-game-library/capacitor-plugin - ESM Build */',
	},
});
