/**
 * Terrain-specific signed distance functions.
 *
 * These build a solid, carvable landscape on top of the biome height field:
 * {@link sdTerrain} is the landscape itself (with overhangs and caves carved
 * out), {@link sdCaves} is the subtractive cave field, and {@link sdRock} is a
 * noise-displaced boulder for scattering as terrain detail.
 *
 * Generic SDF primitives and operators (`sdSphere`, `opSmoothUnion`,
 * `calcNormal`, …) are not terrain-specific and remain in `core/sdf`.
 *
 * @packageDocumentation
 * @module core/terrain/sdf
 * @category World Building
 */

import type * as THREE from 'three';
import {
  fbm,
  noise3D,
  opSmoothSubtraction,
  opSmoothUnion,
  warpedFbm,
} from '../math/sdf-primitives.js';
import type { BiomeData } from './biomes.js';
import { getTerrainHeight } from './biomes.js';

/**
 * Cave system SDF — worm-like tunnels and caverns.
 *
 * Returns a large positive constant (1000) where there is no cave, so it can be
 * subtracted from a solid without affecting it outside cave regions. Caves
 * fade out with altitude and do not form near the surface.
 *
 * @category World Building
 * @param x - World X coordinate.
 * @param y - World Y coordinate (height); caves thin out as this rises.
 * @param z - World Z coordinate.
 * @returns Signed distance to the cave field; 1000 where no cave exists.
 */
export function sdCaves(x: number, y: number, z: number): number {
  // Worm-like caves using 3D noise
  const caveNoise1 = noise3D(x * 0.05, y * 0.05, z * 0.05);
  const caveNoise2 = noise3D(x * 0.08 + 100, y * 0.08, z * 0.08);

  // Combine to create cave-like structures
  const cave = caveNoise1 * caveNoise2;

  // Threshold to create actual caves
  const caveThreshold = 0.15;

  // Only create caves below a certain height
  const depthFactor = Math.max(0, 1 - y / 10);

  if (cave < caveThreshold && depthFactor > 0.2) {
    // Inside a cave - return negative distance
    return (cave - caveThreshold) * 10 * depthFactor;
  }

  return 1000; // No cave here
}

/**
 * Complete terrain SDF — biome height field, overhangs, and carved caves.
 *
 * Pass this to `marchingCubes` or `generateTerrainChunk` to extract a mesh.
 *
 * @category World Building
 * @param p - World-space sample position.
 * @param biomes - Biomes driving the height field. Must not be empty.
 * @returns Signed distance to the terrain surface; negative underground.
 * @throws If `biomes` is empty or missing.
 */
export function sdTerrain(p: THREE.Vector3, biomes: BiomeData[]): number {
  if (!biomes || biomes.length === 0) {
    throw new Error('sdTerrain: biomes array cannot be empty');
  }
  const x = p.x;
  const y = p.y;
  const z = p.z;

  // Get terrain height at this XZ position
  const terrainHeight = getTerrainHeight(x, z, biomes);

  // Base terrain distance (simple plane)
  let d = y - terrainHeight;

  // Add overhangs using noise
  const overhangNoise = warpedFbm(x * 0.1, y * 0.1, z * 0.1, 3);
  if (y < terrainHeight && y > terrainHeight - 5) {
    // Create overhangs by pushing surface outward in certain areas
    const overhangStrength = (1 - (terrainHeight - y) / 5) * overhangNoise;
    d -= overhangStrength * 2;
  }

  // Carve out caves
  const caveDist = sdCaves(x, y, z);
  d = opSmoothSubtraction(d, -caveDist, 2);

  return d;
}

/**
 * Rock SDF with an irregular, noise-displaced shape and a flattened base.
 *
 * Optimized to avoid allocations for better performance in tight loops.
 *
 * @category World Building
 * @param p - World-space sample position.
 * @param center - Centre of the rock.
 * @param baseRadius - Radius before noise displacement. Must be positive.
 * @returns Signed distance to the rock surface.
 * @throws If `baseRadius` is not positive.
 */
export function sdRock(p: THREE.Vector3, center: THREE.Vector3, baseRadius: number): number {
  if (baseRadius <= 0) {
    throw new Error('sdRock: baseRadius must be positive');
  }
  const qx = p.x - center.x;
  const qy = p.y - center.y;
  const qz = p.z - center.z;

  // Base sphere
  let d = Math.sqrt(qx * qx + qy * qy + qz * qz) - baseRadius;

  // Add noise displacement for irregular shape
  const displacement =
    fbm(qx * 0.5 + center.x, qy * 0.5 + center.y, qz * 0.5 + center.z, 3) * baseRadius * 0.4;

  d += displacement;

  // Flatten bottom
  d = opSmoothUnion(d, qy + baseRadius * 0.3, 0.3);

  return d;
}
