/**
 * Terrain generation — biomes, terrain SDFs, and chunked meshing.
 *
 * The full path from a biome layout to a mesh:
 *
 * ```typescript
 * import {
 *   type BiomeData,
 *   generateTerrainChunk,
 *   sdTerrain,
 * } from '@strata-game-library/core/core/terrain';
 *
 * const biomes: BiomeData[] = [
 *   { type: 'mountain', center: new THREE.Vector2(0, 0), radius: 100 },
 * ];
 *
 * const chunk = generateTerrainChunk(
 *   (p) => sdTerrain(p, biomes),
 *   new THREE.Vector3(0, 0, 0),
 *   64,
 *   32
 * );
 * scene.add(new THREE.Mesh(chunk.geometry, terrainMaterial));
 * ```
 *
 * Every export is named explicitly below rather than re-exported with
 * `export *`, so adding a file to this directory does not silently widen the
 * public API.
 *
 * Deliberately NOT part of this module, because neither is terrain-specific:
 * the generic SDF primitives and operators in `core/math/sdf-primitives`, and
 * the isosurface extractor in `core/meshing` — marching cubes turns any
 * signed-distance field into geometry, and terrain is just one caller.
 *
 * Instancing IS part of this module. It was previously described as generic,
 * but it takes `BiomeData` and scatters according to biome, so it cannot be
 * used without terrain.
 *
 * @packageDocumentation
 * @module core/terrain
 * @category World Building
 */

export type { BiomeData } from './biomes.js';
export { getBiomeAt, getTerrainHeight } from './biomes.js';
export type { TerrainChunk } from './chunks.js';

export { generateTerrainChunk } from './chunks.js';
export { sdCaves, sdRock, sdTerrain } from './sdf.js';
export type { InstanceData, InstancingOptions } from './instancing.js';
export { createInstancedMesh, generateInstanceData } from './instancing.js';
