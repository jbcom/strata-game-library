/**
 * Tests for the Strata Vite plugin (strataVitePlugin).
 *
 * Validates the Vite plugin structure, name, and config hook output.
 */
import { describe, expect, it } from 'vitest';
import { strataVitePlugin } from '../src/vite-plugin.js';

describe('strataVitePlugin', () => {
	describe('plugin metadata', () => {
		it('should return a plugin object with name "strata-vite-plugin"', () => {
			const plugin = strataVitePlugin();
			expect(plugin.name).toBe('strata-vite-plugin');
		});

		it('should have a config function', () => {
			const plugin = strataVitePlugin();
			expect(plugin.config).toBeTypeOf('function');
		});
	});

	describe('config hook', () => {
		it('should return an object with optimizeDeps', () => {
			const plugin = strataVitePlugin();
			const config = (plugin.config as Function)();
			expect(config).toBeDefined();
			expect(config.optimizeDeps).toBeDefined();
		});

		it('should include "three" in optimizeDeps.include', () => {
			const plugin = strataVitePlugin();
			const config = (plugin.config as Function)();
			expect(config.optimizeDeps.include).toContain('three');
		});

		it('should have exactly one entry in optimizeDeps.include', () => {
			const plugin = strataVitePlugin();
			const config = (plugin.config as Function)();
			expect(config.optimizeDeps.include).toHaveLength(1);
		});

		it('should return a plain object from config()', () => {
			const plugin = strataVitePlugin();
			const config = (plugin.config as Function)();
			expect(typeof config).toBe('object');
			expect(config).not.toBeNull();
		});
	});

	describe('plugin factory', () => {
		it('should return a new plugin instance on each call', () => {
			const a = strataVitePlugin();
			const b = strataVitePlugin();
			expect(a).not.toBe(b);
		});

		it('should return consistent config across instances', () => {
			const a = strataVitePlugin();
			const b = strataVitePlugin();
			const configA = (a.config as Function)();
			const configB = (b.config as Function)();
			expect(configA).toEqual(configB);
		});
	});

	describe('plugin shape', () => {
		it('should have name and config properties', () => {
			const plugin = strataVitePlugin();
			expect(plugin).toHaveProperty('name');
			expect(plugin).toHaveProperty('config');
		});

		it('should not have unexpected hooks like transform or resolveId', () => {
			const plugin = strataVitePlugin();
			expect(plugin).not.toHaveProperty('transform');
			expect(plugin).not.toHaveProperty('resolveId');
			expect(plugin).not.toHaveProperty('load');
			expect(plugin).not.toHaveProperty('buildStart');
			expect(plugin).not.toHaveProperty('buildEnd');
		});
	});
});
