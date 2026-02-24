import { defineConfig } from 'tsup';

export default defineConfig({
	entry: {
		index: 'src/index.ts',
	},
	format: ['esm'],
	dts: true,
	clean: true,
	sourcemap: true,
	target: 'ES2022',
	external: ['astro', 'vite'],
	treeshake: true,
	minify: false,
	keepNames: true,
	banner: {
		js: '/* @strata-game-library/astro - ESM Build */',
	},
});
