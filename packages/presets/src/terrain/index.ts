/**
 * SDF-Based Terrain Generation Presets.
 * @packageDocumentation
 * @module presets/terrain
 */

import {
  createGeometryFromMarchingCubes,
  generateTerrainChunk,
  marchingCubes,
  type TerrainChunk,
} from '@strata-game-library/core/core/marching-cubes';
import {
  getTerrainHeight,
  type BiomeData as SDFBiomeData,
  sdTerrain,
} from '@strata-game-library/core/core/sdf';
import * as THREE from 'three';

export type {
  MarchingCubesOptions,
  TerrainChunk,
} from '@strata-game-library/core/core/marching-cubes';
export type { BiomeData } from '@strata-game-library/core/core/sdf';

export interface TerrainOptions {
  biomes: SDFBiomeData[];
  resolution?: number;
  bounds?: { min: THREE.Vector3; max: THREE.Vector3 };
  material?: THREE.Material;
}

/**
 * Create terrain geometry from SDF
 */
export function createTerrainGeometry(options: TerrainOptions): THREE.BufferGeometry {
  const {
    biomes,
    resolution = 64,
    bounds = {
      min: new THREE.Vector3(-50, -10, -50),
      max: new THREE.Vector3(50, 10, 50),
    },
  } = options;

  if (!biomes || biomes.length === 0) {
    throw new Error('createTerrainGeometry: biomes array cannot be empty');
  }
  if (resolution <= 0 || !Number.isInteger(resolution)) {
    throw new Error('createTerrainGeometry: resolution must be a positive integer');
  }
  if (resolution > 256) {
    throw new Error('createTerrainGeometry: resolution must be <= 256');
  }

  const sdf = (p: THREE.Vector3) => sdTerrain(p, biomes);
  const result = marchingCubes(sdf, { resolution, bounds });
  return createGeometryFromMarchingCubes(result);
}

/**
 * Create terrain mesh with material
 */
export function createTerrainMesh(options: TerrainOptions): THREE.Mesh {
  const {
    material = new THREE.MeshStandardMaterial({
      color: 0x2a5a3a,
      roughness: 0.8,
      metalness: 0.1,
    }),
  } = options;

  const geometry = createTerrainGeometry(options);
  return new THREE.Mesh(geometry, material);
}

/**
 * Create chunked terrain for large worlds
 */
export function createChunkedTerrain(
  biomes: SDFBiomeData[],
  chunkPositions: THREE.Vector3[],
  chunkSize: number,
  resolution: number
): TerrainChunk[] {
  if (!biomes || biomes.length === 0) {
    throw new Error('createChunkedTerrain: biomes array cannot be empty');
  }
  if (!chunkPositions || chunkPositions.length === 0) {
    throw new Error('createChunkedTerrain: chunkPositions array cannot be empty');
  }
  if (chunkSize <= 0) {
    throw new Error('createChunkedTerrain: chunkSize must be positive');
  }
  if (resolution <= 0 || !Number.isInteger(resolution)) {
    throw new Error('createChunkedTerrain: resolution must be a positive integer');
  }

  const sdf = (p: THREE.Vector3) => sdTerrain(p, biomes);

  return chunkPositions.map((position) => {
    return generateTerrainChunk(sdf, position, chunkSize, resolution);
  });
}

/**
 * Get terrain height at a point (for character positioning, etc.)
 */
export function getTerrainHeightAt(x: number, z: number, biomes: SDFBiomeData[]): number {
  return getTerrainHeight(x, z, biomes);
}
