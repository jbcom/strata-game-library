import { defineConfig } from 'tsup';

/**
 * tsup configuration for @strata-game-library/core
 *
 * Pure TypeScript algorithms — NO React dependencies.
 * React Three Fiber components are in @strata-game-library/r3f.
 */
export default defineConfig({
	// Entry points matching package.json exports
	entry: {
		// Main entry
		index: 'src/index.ts',

		// Subpath exports
		'shaders/index': 'src/shaders.ts',
		'utils/index': 'src/utils/index.ts',
		'api/index': 'src/api/index.ts',
		'game/index': 'src/game/index.ts',
		'compose/index': 'src/compose/index.ts',
		'world/index': 'src/world/index.ts',

		// Core submodule exports
		'core/index': 'src/core/index.ts',
		'core/animation/index': 'src/core/animation/index.ts',
		'core/audio/index': 'src/core/audio/index.ts',
		'core/camera': 'src/core/camera.ts',
		'core/clouds': 'src/core/clouds.ts',
		'core/decals': 'src/core/decals.ts',
		'core/ecs/index': 'src/core/ecs/index.ts',
		'core/godRays': 'src/core/godRays.ts',
		'core/input': 'src/core/input.ts',
		'core/instancing': 'src/core/instancing.ts',
		'core/lod': 'src/core/lod.ts',
		'core/marching-cubes': 'src/core/marching-cubes.ts',
		'core/math/index': 'src/core/math/index.ts',
		'core/math/utils': 'src/core/math/utils.ts',
		'core/particles': 'src/core/particles.ts',
		'core/pathfinding/index': 'src/core/pathfinding/index.ts',
		'core/physics': 'src/core/physics.ts',
		'core/postProcessing': 'src/core/postProcessing.ts',
		'core/raymarching': 'src/core/raymarching.ts',
		'core/sdf': 'src/core/sdf.ts',
		'core/shared/index': 'src/core/shared/index.ts',
		'core/sky': 'src/core/sky.ts',
		'core/state/index': 'src/core/state/index.ts',
		'core/ui': 'src/core/ui.ts',
		'core/volumetrics': 'src/core/volumetrics.ts',
		'core/water': 'src/core/water.ts',
		'core/weather': 'src/core/weather.ts',
	},

	// Output format - ESM only (the package is "type": "module")
	format: ['esm'],

	// DTS generation enabled
	dts: true,

	// Clean output directory before each build
	clean: true,

	// Generate source maps for debugging
	sourcemap: true,

	// Don't split chunks - each entry point is independent
	splitting: false,

	// Target ES2022 (matches tsconfig)
	target: 'ES2022',

	// External packages (don't bundle dependencies)
	external: [
		'@strata-game-library/shaders',
		'three',
		'zustand',
		'yuka',
		'xstate',
		'howler',
		'maath',
		'maath/misc',
		'maath/random',
		'miniplex',
		'ngraph.graph',
		'ngraph.path',
		'simplex-noise',
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
