/**
 * Astro integration for Strata documentation and demo sites.
 *
 * Configures Vite SSR settings for React Three Fiber, Three.js, Babylon.js,
 * and Reactylon compatibility within Astro projects. Applies the Strata Vite
 * plugin for dependency optimization and optionally injects CSS design tokens
 * and Starlight theme overrides.
 *
 * @module AstroIntegration
 * @category Rendering Pipeline
 */

import type { AstroIntegration } from 'astro';
import { strataVitePlugin } from './vite-plugin.js';

export interface StrataAstroConfig {
	/** Inject Strata CSS tokens and component styles (default: true via CSS imports) */
	css?: boolean;
	/** Include Starlight theme overrides (default: true via CSS imports) */
	starlight?: boolean;
	/** Configure Vite SSR and optimizeDeps for React Three Fiber / Three.js (default: true) */
	viteR3F?: boolean;
}

export default function strataAstro(config: StrataAstroConfig = {}): AstroIntegration {
	const { viteR3F = true } = config;

	return {
		name: '@strata-game-library/astro',
		hooks: {
			'astro:config:setup': ({ updateConfig }) => {
				if (viteR3F) {
					updateConfig({
						vite: {
							ssr: {
								noExternal: [
									'@react-three/fiber',
									'@react-three/drei',
									'three',
									'@babylonjs/core',
									'reactylon',
								],
							},
							plugins: [strataVitePlugin()],
						},
					});
				}
			},
		},
	};
}
