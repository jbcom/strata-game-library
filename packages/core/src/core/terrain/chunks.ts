/**
 * Chunk-based terrain meshing.
 *
 * Splits a large landscape into cube-shaped chunks so a world can be meshed
 * and streamed a piece at a time rather than in one pass. The isosurface
 * extraction itself is the generic {@link marchingCubes} algorithm from
 * `core/marching-cubes`; this module only owns the chunk framing around it.
 *
 * @packageDocumentation
 * @module core/terrain/chunks
 * @category World Building
 */

import * as THREE from 'three';
import { createGeometryFromMarchingCubes, marchingCubes } from './marching-cubes.js';

/**
 * A single meshed piece of a chunked terrain.
 *
 * @category World Building
 */
export interface TerrainChunk {
  /** The extracted geometry for the chunk. */
  geometry: THREE.BufferGeometry;
  /** World-space bounding box of the chunk. */
  boundingBox: THREE.Box3;
  /** Central world position of the chunk. */
  position: THREE.Vector3;
}

/**
 * Generate a single terrain chunk using marching cubes.
 *
 * @category World Building
 * @param sdf - The Signed Distance Function representing the terrain.
 * @param chunkPosition - Center position of the chunk.
 * @param chunkSize - Physical size of the chunk side. Must be positive.
 * @param resolution - Grid resolution for extraction. A positive integer <= 256.
 * @returns A populated TerrainChunk object.
 * @throws If `sdf` is not a function, `chunkPosition` is missing, `chunkSize`
 *   is not positive, or `resolution` is not a positive integer <= 256.
 */
export function generateTerrainChunk(
  sdf: (p: THREE.Vector3) => number,
  chunkPosition: THREE.Vector3,
  chunkSize: number,
  resolution: number
): TerrainChunk {
  if (!sdf || typeof sdf !== 'function') {
    throw new Error('generateTerrainChunk: sdf must be a function');
  }
  if (!chunkPosition) {
    throw new Error('generateTerrainChunk: chunkPosition is required');
  }
  if (chunkSize <= 0) {
    throw new Error('generateTerrainChunk: chunkSize must be positive');
  }
  if (resolution <= 0 || !Number.isInteger(resolution)) {
    throw new Error('generateTerrainChunk: resolution must be a positive integer');
  }
  if (resolution > 256) {
    throw new Error('generateTerrainChunk: resolution must be <= 256');
  }

  const halfSize = chunkSize / 2;
  const bounds = {
    min: new THREE.Vector3(
      chunkPosition.x - halfSize,
      chunkPosition.y - halfSize,
      chunkPosition.z - halfSize
    ),
    max: new THREE.Vector3(
      chunkPosition.x + halfSize,
      chunkPosition.y + halfSize,
      chunkPosition.z + halfSize
    ),
  };

  const result = marchingCubes(sdf, { resolution, bounds });
  const geometry = createGeometryFromMarchingCubes(result);

  return {
    geometry,
    boundingBox: new THREE.Box3(bounds.min, bounds.max),
    position: chunkPosition.clone(),
  };
}
