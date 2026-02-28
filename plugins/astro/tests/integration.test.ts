/**
 * Tests for the Astro integration default export (strataAstro).
 *
 * Validates the AstroIntegration object structure, hook behavior,
 * and configuration options (viteR3F, css, starlight).
 */
import { describe, expect, it, vi } from 'vitest';
import strataAstro, { type StrataAstroConfig } from '../src/index.js';

describe('strataAstro integration', () => {
	describe('integration metadata', () => {
		it('should return an object with the correct name', () => {
			const integration = strataAstro();
			expect(integration.name).toBe('@strata-game-library/astro');
		});

		it('should have an astro:config:setup hook', () => {
			const integration = strataAstro();
			expect(integration.hooks).toBeDefined();
			expect(integration.hooks['astro:config:setup']).toBeTypeOf('function');
		});

		it('should not have unexpected hooks', () => {
			const integration = strataAstro();
			const hookKeys = Object.keys(integration.hooks);
			expect(hookKeys).toEqual(['astro:config:setup']);
		});
	});

	describe('default configuration (no arguments)', () => {
		it('should call updateConfig when viteR3F defaults to true', () => {
			const integration = strataAstro();
			const updateConfig = vi.fn();
			const hookParams = createHookParams({ updateConfig });

			(integration.hooks['astro:config:setup'] as Function)(hookParams);

			expect(updateConfig).toHaveBeenCalledTimes(1);
		});

		it('should configure SSR noExternal with R3F and Babylon dependencies', () => {
			const integration = strataAstro();
			const updateConfig = vi.fn();
			const hookParams = createHookParams({ updateConfig });

			(integration.hooks['astro:config:setup'] as Function)(hookParams);

			const config = updateConfig.mock.calls[0][0];
			expect(config.vite.ssr.noExternal).toEqual([
				'@react-three/fiber',
				'@react-three/drei',
				'three',
				'@babylonjs/core',
				'reactylon',
			]);
		});

		it('should include the strata vite plugin in the configuration', () => {
			const integration = strataAstro();
			const updateConfig = vi.fn();
			const hookParams = createHookParams({ updateConfig });

			(integration.hooks['astro:config:setup'] as Function)(hookParams);

			const config = updateConfig.mock.calls[0][0];
			expect(config.vite.plugins).toBeDefined();
			expect(config.vite.plugins).toHaveLength(1);
			expect(config.vite.plugins[0]).toHaveProperty('name', 'strata-vite-plugin');
		});
	});

	describe('viteR3F option', () => {
		it('should apply vite config when viteR3F is true', () => {
			const integration = strataAstro({ viteR3F: true });
			const updateConfig = vi.fn();
			const hookParams = createHookParams({ updateConfig });

			(integration.hooks['astro:config:setup'] as Function)(hookParams);

			expect(updateConfig).toHaveBeenCalledTimes(1);
			const config = updateConfig.mock.calls[0][0];
			expect(config.vite).toBeDefined();
			expect(config.vite.ssr).toBeDefined();
			expect(config.vite.plugins).toBeDefined();
		});

		it('should NOT call updateConfig when viteR3F is false', () => {
			const integration = strataAstro({ viteR3F: false });
			const updateConfig = vi.fn();
			const hookParams = createHookParams({ updateConfig });

			(integration.hooks['astro:config:setup'] as Function)(hookParams);

			expect(updateConfig).not.toHaveBeenCalled();
		});

		it('should default viteR3F to true when not specified', () => {
			const integration = strataAstro({});
			const updateConfig = vi.fn();
			const hookParams = createHookParams({ updateConfig });

			(integration.hooks['astro:config:setup'] as Function)(hookParams);

			expect(updateConfig).toHaveBeenCalledTimes(1);
		});
	});

	describe('configuration options passthrough', () => {
		it('should accept css option without error', () => {
			const config: StrataAstroConfig = { css: true };
			expect(() => strataAstro(config)).not.toThrow();
		});

		it('should accept starlight option without error', () => {
			const config: StrataAstroConfig = { starlight: true };
			expect(() => strataAstro(config)).not.toThrow();
		});

		it('should accept all options combined', () => {
			const config: StrataAstroConfig = {
				css: true,
				starlight: false,
				viteR3F: true,
			};
			expect(() => strataAstro(config)).not.toThrow();
		});

		it('should accept an empty config object', () => {
			expect(() => strataAstro({})).not.toThrow();
		});

		it('should accept no arguments at all', () => {
			expect(() => strataAstro()).not.toThrow();
		});
	});

	describe('SSR noExternal entries', () => {
		it('should include @react-three/fiber', () => {
			const noExternal = getNoExternalEntries();
			expect(noExternal).toContain('@react-three/fiber');
		});

		it('should include @react-three/drei', () => {
			const noExternal = getNoExternalEntries();
			expect(noExternal).toContain('@react-three/drei');
		});

		it('should include three', () => {
			const noExternal = getNoExternalEntries();
			expect(noExternal).toContain('three');
		});

		it('should include @babylonjs/core', () => {
			const noExternal = getNoExternalEntries();
			expect(noExternal).toContain('@babylonjs/core');
		});

		it('should include reactylon', () => {
			const noExternal = getNoExternalEntries();
			expect(noExternal).toContain('reactylon');
		});

		it('should have exactly 5 noExternal entries', () => {
			const noExternal = getNoExternalEntries();
			expect(noExternal).toHaveLength(5);
		});
	});

	describe('integration return type shape', () => {
		it('should have only name and hooks properties', () => {
			const integration = strataAstro();
			const keys = Object.keys(integration);
			expect(keys).toContain('name');
			expect(keys).toContain('hooks');
			expect(keys).toHaveLength(2);
		});

		it('should return a new instance on each call', () => {
			const a = strataAstro();
			const b = strataAstro();
			expect(a).not.toBe(b);
			expect(a.hooks).not.toBe(b.hooks);
		});
	});
});

// --- Helpers ---

/**
 * Creates a minimal mock of the astro:config:setup hook parameters.
 */
function createHookParams(overrides: { updateConfig: ReturnType<typeof vi.fn> }) {
	return {
		config: {},
		command: 'dev' as const,
		isRestart: false,
		updateConfig: overrides.updateConfig,
		addRenderer: vi.fn(),
		addWatchFile: vi.fn(),
		injectScript: vi.fn(),
		injectRoute: vi.fn(),
		addMiddleware: vi.fn(),
		addClientDirective: vi.fn(),
		addDevToolbarApp: vi.fn(),
		createCodegenDir: vi.fn(),
		logger: {
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
			label: '@strata-game-library/astro',
			fork: vi.fn(),
		},
	};
}

/**
 * Extracts the noExternal entries from the default integration config.
 */
function getNoExternalEntries(): string[] {
	const integration = strataAstro();
	const updateConfig = vi.fn();
	(integration.hooks['astro:config:setup'] as Function)(createHookParams({ updateConfig }));
	return updateConfig.mock.calls[0][0].vite.ssr.noExternal;
}
