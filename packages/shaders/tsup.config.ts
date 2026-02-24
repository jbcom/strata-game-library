import { defineConfig } from 'tsup';
import { globSync } from 'glob';
import path from 'path';

/**
 * tsup configuration for @strata-game-library/shaders
 *
 * Ensures proper Node.js ESM support with correct .js extensions
 * Note: This package has minimal external dependencies (just three.js types)
 */
export default defineConfig({
	entry: globSync(['src/*.ts', 'src/materials/index.ts']).reduce<Record<string, string>>((acc, file) => {
		const key = path.relative('src', file).replace(/\\/g, '/').replace('.ts', '');
		acc[key] = file;
		return acc;
	}, {}),
	format: ['esm'],
	dts: true,
	clean: true,
	sourcemap: true,
	splitting: false,
	target: 'ES2022',
	external: ['three'],
	treeshake: true,
	minify: false,
	keepNames: true,
	banner: {
		js: '/* @strata-game-library/shaders - ESM Build */',
	},
});
