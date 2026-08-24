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
 * Deliberately NOT part of this module, because none of it is terrain-specific:
 * the generic SDF primitives and operators in `core/sdf`, the isosurface
 * extractor in `core/marching-cubes`, and the scatterer in `core/instancing`
 * (which places instances on any height function, terrain or not).
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
