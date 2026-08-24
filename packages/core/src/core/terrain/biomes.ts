/**
 * Biome classification and terrain height sampling.
 *
 * A biome is a labelled region of the XZ plane with a centre and a radius.
 * {@link getBiomeAt} resolves a world position to the nearest biome, and
 * {@link getTerrainHeight} turns that classification into a height, giving each
 * biome type its own noise recipe — ridged peaks for mountains, dunes for
 * desert, near-flat for marsh.
 *
 * @packageDocumentation
 * @module core/terrain/biomes
 * @category World Building
 */

import type * as THREE from 'three';
import { fbm, noise3D, warpedFbm } from '../sdf.js';

/**
 * A labelled region of the world used to vary terrain height and to filter
 * where props and vegetation may be scattered.
 *
 * @category World Building
 */
export interface BiomeData {
  /** Which height recipe and scatter rules apply inside this region. */
  type: 'marsh' | 'forest' | 'desert' | 'tundra' | 'savanna' | 'mountain' | 'scrubland';
  /** Centre of the region on the XZ plane (`y` of the Vector2 is world Z). */
  center: THREE.Vector2;
  /** Region radius in world units. */
  radius: number;
}

/**
 * Resolve the dominant biome at a world position.
 *
 * Selection is nearest-centre; `radius` does not clip the result, so the whole
 * plane is always covered by whichever biome is closest.
 *
 * @category World Building
 * @param x - World X coordinate.
 * @param z - World Z coordinate.
 * @param biomes - Candidate biomes. Must not be empty.
 * @returns The biome whose centre is nearest to (x, z).
 * @throws If `biomes` is empty or missing.
 */
export function getBiomeAt(x: number, z: number, biomes: BiomeData[]): BiomeData {
  if (!biomes || biomes.length === 0) {
    throw new Error('getBiomeAt: biomes array cannot be empty');
  }

  let closest = biomes[0];
  let closestDist = Infinity;

  for (const biome of biomes) {
    const dist = Math.sqrt((x - biome.center.x) ** 2 + (z - biome.center.y) ** 2);
    if (dist < closestDist) {
      closestDist = dist;
      closest = biome;
    }
  }

  return closest;
}

/**
 * Sample terrain height at a world position, using the biome at that position
 * to choose the noise recipe.
 *
 * @category World Building
 * @param x - World X coordinate.
 * @param z - World Z coordinate.
 * @param biomes - Candidate biomes. Must not be empty.
 * @returns Terrain height in world units.
 * @throws If `biomes` is empty or missing.
 */
export function getTerrainHeight(x: number, z: number, biomes: BiomeData[]): number {
  if (!biomes || biomes.length === 0) {
    throw new Error('getTerrainHeight: biomes array cannot be empty');
  }
  const biome = getBiomeAt(x, z, biomes);

  // Base noise
  const baseNoise = fbm(x * 0.02, 0, z * 0.02, 3);

  switch (biome.type) {
    case 'mountain': {
      // Tall peaks with ridges
      const mountainNoise = warpedFbm(x * 0.03, 0, z * 0.03, 5);
      const ridges = Math.abs(noise3D(x * 0.05, 0, z * 0.05) - 0.5) * 2;
      return baseNoise * 2 + mountainNoise * 25 + ridges * 10;
    }
    case 'tundra':
      // Gentle rolling hills
      return baseNoise * 3 + fbm(x * 0.05, 0, z * 0.05, 2) * 2;

    case 'forest':
      // Moderate hills
      return baseNoise * 5 + fbm(x * 0.04, 0, z * 0.04, 3) * 3;

    case 'desert': {
      // Dunes
      const duneNoise = Math.sin(x * 0.1 + noise3D(x * 0.02, 0, z * 0.02) * 5);
      return baseNoise * 2 + duneNoise * 3;
    }
    case 'marsh':
      // Very flat with some bumps
      return baseNoise * 0.5 + noise3D(x * 0.1, 0, z * 0.1) * 0.3;

    case 'savanna': {
      // Mostly flat with occasional kopjes
      const kopje = Math.max(0, 1 - fbm(x * 0.08, 0, z * 0.08, 2) * 3);
      return baseNoise * 1.5 + kopje * kopje * 8;
    }
    default:
      return baseNoise * 2;
  }
}
