/**
 * Core algorithm exports
 */

// Shared utilities
export * from './shared';

// Core modules (pure TypeScript, no React)
export { generateInstanceData, createInstancedMesh } from './instancing';
export type { InstanceData, BiomeData as InstancingBiomeData } from './instancing';

export * from './water';
export * from './raymarching';
export * from './sky';
export * from './volumetrics';

// SDF primitives and operations
export {
    // Primitives
    sdSphere,
    sdBox,
    sdPlane,
    sdCapsule,
    sdTorus,
    sdCone,

    // Boolean operations
    opUnion,
    opSubtraction,
    opIntersection,
    opSmoothUnion,
    opSmoothSubtraction,
    opSmoothIntersection,

    // Noise functions
    noise3D,
    fbm,
    warpedFbm,

    // Terrain
    getBiomeAt,
    getTerrainHeight,
    sdCaves,
    sdTerrain,
    sdRock,

    // Utilities
    calcNormal,
} from './sdf';
export type { BiomeData as SDFBiomeData } from './sdf';

// Marching cubes
export {
    marchingCubes,
    createGeometryFromMarchingCubes,
    generateTerrainChunk,
} from './marching-cubes';
export type { MarchingCubesResult, MarchingCubesOptions, TerrainChunk } from './marching-cubes';
