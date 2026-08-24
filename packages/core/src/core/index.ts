/**
 * Core Mathematical and Procedural Generation Utilities.
 * @packageDocumentation
 * @module core
 */

export * from './animation';
export * from './audio';
export * from './camera';
export * from './clouds';
// Debug tools (React-dependent) moved to @strata-game-library/r3f
export * from './decals';
export * from './ecs';
export * from './godRays';
export * from './input';
export * from './instancing';
export * from './joystick-normalize';
export * from './lod';
export * from './marching-cubes';
export * from './math';
export * from './maze/index.js';
export * from './particles';
export * from './pathfinding';
export * from './physics';
export * from './postProcessing';
export * from './raymarching';
export * from './safe-area-insets';
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
} from './sdf';
export * from './shaders';
export * from './shared';
export * from './sky';
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
export * from './ui';
export * from './volumetrics';
export * from './water';
export * from './weather';
