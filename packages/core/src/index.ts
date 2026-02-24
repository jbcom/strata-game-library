/**
 * @strata-game-library/core
 *
 * Pure TypeScript algorithms for procedural 3D graphics.
 * Terrain, water, vegetation, ECS, pathfinding, physics, animation, and more.
 *
 * For React Three Fiber components, use @strata-game-library/r3f.
 *
 * @packageDocumentation
 * @module strata/core
 */

// Export compositional system
export * from './compose';
// Export core first - this is the canonical source for utilities and types
export * from './core';

// Export game orchestration
export * from './game';

// Shaders from @strata-game-library/shaders are available via the ./shaders subpath export.
// They are not re-exported here to avoid duplicate export conflicts with ./core/shaders
// (ShaderChunks, noiseSnippet). Import from '@strata-game-library/core/shaders' instead.

// Export utils
export * from './utils';

// Export world topology
export * from './world';

// Note: React hooks and R3F components have been extracted to @strata-game-library/r3f.
// Import from '@strata-game-library/r3f' for React Three Fiber integration.
