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
export * from './lod';
export * from './marching-cubes';
export * from './math';
export * from './particles';
export * from './pathfinding';
export * from './physics';
export * from './postProcessing';
export * from './raymarching';
// Export sdf but exclude BiomeData (exported via instancing)
export {
  calcNormal,
  fbm,
  getBiomeAt,
  getTerrainHeight,
  noise3D,
  opIntersection,
  opSmoothIntersection,
  opSmoothSubtraction,
  opSmoothUnion,
  opSubtraction,
  opUnion,
  sdBox,
  sdCapsule,
  sdCaves,
  sdCone,
  sdPlane,
  sdRock,
  sdSphere,
  sdTerrain,
  sdTorus,
  warpedFbm,
} from './sdf';
export * from './shaders';
export * from './shared';
export * from './sky';
export * from './state';
export * from './ui';
export * from './volumetrics';
export * from './water';
export * from './weather';
