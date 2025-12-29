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
 *
 * @packageDocumentation
 * @module strata
 */

// Export compositional system
export * from './compose';
// Export core first - this is the canonical source for utilities and types
export * from './core';

// Export game orchestration
export * from './game';

// Export hooks
export * from './hooks';

// Export shaders
export * from './shaders';

// Export utils
export * from './utils';

// Export world topology
export * from './world';

// Note: Components have overlapping exports with core.
// Import from ./components directly if you need their specific versions.
// The main entry point prioritizes core exports.
