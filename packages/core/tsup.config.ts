import { defineConfig } from 'tsup';

/**
 * tsup configuration for @strata-game-library/core
 *
 * This configuration ensures the package works correctly in:
 * - Node.js ESM (with proper .js extensions)
 * - Bundlers (Vite, Webpack, esbuild)
 * - TypeScript projects with any moduleResolution setting
 *
 * @see https://github.com/strata-game-library/core/issues/128
 */
export default defineConfig({
	// Entry points matching package.json exports
	entry: {
		// Main entry
		index: 'src/index.ts',

		// Subpath exports
		'components/index': 'src/components/index.ts',
		'shaders/index': 'src/shaders.ts',
		'utils/index': 'src/utils/index.ts',
		'api/index': 'src/api/index.ts',
		'game/index': 'src/game/index.ts',
		'compose/index': 'src/compose/index.ts',
		'world/index': 'src/world/index.ts',
		'hooks/index': 'src/hooks/index.ts',

		// Core submodule exports
		'core/index': 'src/core/index.ts',
		'core/marching-cubes': 'src/core/marching-cubes.ts',
		'core/sdf': 'src/core/sdf.ts',
		'core/instancing': 'src/core/instancing.ts',
		'core/ui': 'src/core/ui.ts',
		'core/state/index': 'src/core/state/index.ts',
		'core/weather': 'src/core/weather.ts',
		'core/ecs/index': 'src/core/ecs/index.ts',
		'core/math/index': 'src/core/math/index.ts',
		'core/audio/index': 'src/core/audio/index.ts',
		'core/animation/index': 'src/core/animation/index.ts',
		'core/debug/index': 'src/core/debug/index.ts',
		'core/pathfinding/index': 'src/core/pathfinding/index.ts',
		'core/shared/index': 'src/core/shared/index.ts',
	},

	// Output format - ESM only (the package is "type": "module")
	format: ['esm'],

	// DTS generation disabled temporarily — pre-existing R3F v9.5 JSX type augmentation issue
	// TODO: Fix R3F types and re-enable (see three-types.d.ts not exported from main entry)
	dts: false,

	// Clean output directory before each build
	clean: true,

	// Generate source maps for debugging
	sourcemap: true,

	// Don't split chunks - each entry point is independent
	splitting: false,

	// Target ES2022 (matches tsconfig)
	target: 'ES2022',

	// Preserve JSX for React Three Fiber
	jsx: 'automatic',

	// External packages (don't bundle dependencies)
	external: [
		'@strata-game-library/shaders',
		'react',
		'react-dom',
		'three',
		'@react-three/fiber',
		'@react-three/drei',
		'@react-three/rapier',
		'@react-three/postprocessing',
		'postprocessing',
		'zustand',
		'yuka',
		'xstate',
		'@xstate/react',
		'howler',
		'leva',
		'maath',
		'miniplex',
		'miniplex-react',
		'ngraph.graph',
		'ngraph.path',
		'simplex-noise',
		'tunnel-rat',
		'zundo',
		'immer',
	],

	// Ensure proper ESM output
	treeshake: true,

	// Add banner for module compatibility
	banner: {
		js: '/* @strata-game-library/core - ESM Build */',
	},

	// Minification disabled for library (consumers can minify)
	minify: false,

	// Keep names for better debugging
	keepNames: true,
});
