/**
 * @jbcom/strata
 *
 * The complete solution for foreground, midground, and background layer
 * 3D gaming in Node.js. Provides terrain, water, vegetation, characters,
 * fur, shells, molecular rendering, and more.
 *
 * Organized into submodules for easy integration into your game.
 *
 * For granular imports, use submodule paths:
 * - @jbcom/strata/components - React Three Fiber components
 * - @jbcom/strata/shaders - GLSL shaders
 * - @jbcom/strata/presets - Pre-configured presets
 *
 * @packageDocumentation
 * @module strata
 */

// Export core first - this is the canonical source for utilities and types
export * from './core';

// Export hooks
export * from './hooks';

// Export shaders
export * from './shaders';

// Export utils
export * from './utils';

// Note: Components and Presets have overlapping exports with core.
// Import from ./components or ./presets directly if you need their specific versions.
// The main entry point prioritizes core exports.
