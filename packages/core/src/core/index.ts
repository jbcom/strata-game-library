/**
 * Core Mathematical and Procedural Generation Utilities.
 * @packageDocumentation
 * @module core
 */

export * from './animation';
export * from './audio';
export * from './camera/camera.js';
export * from './ecs';
export * from './input/input.js';
export * from './input/joystick-normalize.js';
export * from './input/safe-area-insets.js';
export * from './math';
// Generic SDF primitives, operators, and legacy noise. Terrain-specific SDFs
// (sdTerrain, sdCaves, sdRock) and the biome height field come from './terrain'
// below. BiomeData is excluded here and exported via instancing, as before.
export {
  calcNormal,
  fbm,
  noise3D,
  opIntersection,
  opSmoothIntersection,
  opSmoothSubtraction,
  opSmoothUnion,
  opSubtraction,
  opUnion,
  sdBox,
  sdCapsule,
  sdCone,
  sdPlane,
  sdSphere,
  sdTorus,
  warpedFbm,
} from './math/sdf-primitives.js';
export * from './maze/index.js';
export * from './particles';
export * from './pathfinding';
export * from './physics';
export * from './rendering/clouds.js';
// Debug tools (React-dependent) moved to @strata-game-library/r3f
export * from './rendering/decals.js';
export * from './rendering/godRays.js';
export * from './rendering/lod.js';
export * from './rendering/postProcessing.js';
export * from './rendering/raymarching.js';
export * from './rendering/shaders.js';
export * from './rendering/sky.js';
export * from './rendering/volumetrics.js';
export * from './rendering/water.js';
export * from './rendering/weather.js';
export * from './shared';
export * from './state';
export type { TerrainChunk } from './terrain/index.js';
// Terrain generation. BiomeData is intentionally omitted — it reaches the
// barrel through './instancing' to avoid a duplicate-export conflict.
export {
  generateTerrainChunk,
  getBiomeAt,
  getTerrainHeight,
  sdCaves,
  sdRock,
  sdTerrain,
} from './terrain/index.js';
export * from './terrain/instancing.js';
export * from './terrain/marching-cubes.js';
export * from './ui';
