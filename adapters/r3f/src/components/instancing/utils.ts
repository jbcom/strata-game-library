import {
  generateInstanceData as coreGenerateInstanceData,
  type InstanceData,
} from '@strata-game-library/core';
import { type BiomeData, fbm, noise3D, getBiomeAt as sdfGetBiomeAt } from '@strata-game-library/core';

/**
 * Generate instance data (positions, rotations, scales) based on biomes.
 *
 * @category World Building
 * @param count - Number of instances to generate.
 * @param areaSize - Size of the square area to scatter instances.
 * @param heightFunc - Function to determine terrain height at x,z.
 * @param biomes - Array of biome data for distribution.
 * @param allowedBiomes - List of biome types this instance can spawn in.
 * @param seed - Random seed for deterministic placement.
 * @returns Array of InstanceData objects.
 *
 * @example
 * ```typescript
 * const trees = generateInstanceData(
 *   500,
 *   100,
 *   (x, z) => getTerrainHeight(x, z),
 *   biomes,
 *   ['forest']
 * );
 * ```
 */
export function generateBiomeInstanceData(
  count: number,
  areaSize: number,
  heightFunc: (x: number, z: number) => number,
  biomes?: BiomeData[],
  allowedBiomes?: string[],
  seed?: number
): InstanceData[] {
  return coreGenerateInstanceData(
    count,
    areaSize,
    heightFunc,
    biomes,
    allowedBiomes,
    seed,
    sdfGetBiomeAt as any,
    noise3D,
    fbm
  );
}
