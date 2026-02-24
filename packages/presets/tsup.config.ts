import { defineConfig } from 'tsup';
import { globSync } from 'glob';
import path from 'path';

/**
 * tsup configuration for @strata-game-library/presets
 *
 * Ensures proper Node.js ESM support with correct .js extensions
 */
export default defineConfig({
	entry: globSync(['src/**/index.ts', 'src/structures/building.ts']).reduce<Record<string, string>>((acc, file) => {
		const key = path.relative('src', file).replace(/\\/g, '/').replace('.ts', '');
		acc[key] = file;
		return acc;
	}, {}),
	format: ['esm'],

	// DTS generation enabled — core now provides .d.ts files
	dts: {
		compilerOptions: {
			// Follow workspace symlinks to resolve @strata-game-library/core types
			preserveSymlinks: false,
		},
	},

	clean: true,
	sourcemap: true,
	splitting: false,
	target: 'ES2022',
	jsx: 'automatic',
	external: [
		'@strata-game-library/core',
		'@react-three/fiber',
		'react',
		'three',
		'yuka',
	],
	treeshake: true,
	minify: false,
	keepNames: true,
	banner: {
		js: '/* @strata-game-library/presets - ESM Build */',
	},
});
