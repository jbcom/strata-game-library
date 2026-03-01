/**
 * Vite plugin for optimizing Three.js and related 3D library dependencies.
 *
 * Pre-bundles Three.js during development to avoid slow on-demand
 * optimization of its large module graph, improving dev server startup
 * and hot module replacement performance.
 *
 * @module StrataVitePlugin
 * @category Rendering Pipeline
 */

import type { Plugin } from 'vite';

export function strataVitePlugin(): Plugin {
	return {
		name: 'strata-vite-plugin',
		config() {
			return {
				optimizeDeps: {
					include: ['three'],
				},
			};
		},
	};
}
