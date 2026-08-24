import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { type BiomeData, getBiomeAt, getTerrainHeight } from '../biomes';

const biome = (type: BiomeData['type'], x: number, z: number, radius = 50): BiomeData => ({
  type,
  center: new THREE.Vector2(x, z),
  radius,
});

describe('getBiomeAt', () => {
  it('returns the nearest biome by centre distance', () => {
    const biomes = [biome('desert', 0, 0), biome('tundra', 100, 0)];

    expect(getBiomeAt(5, 0, biomes).type).toBe('desert');
    expect(getBiomeAt(95, 0, biomes).type).toBe('tundra');
  });

  it('measures distance on the XZ plane, using Vector2.y as world Z', () => {
    const biomes = [biome('marsh', 0, 0), biome('forest', 0, 100)];

    expect(getBiomeAt(0, 90, biomes).type).toBe('forest');
  });

  it('covers the whole plane regardless of radius', () => {
    // The sample sits far outside the radius, but nearest-centre still wins.
    const biomes = [biome('savanna', 0, 0, 1)];

    expect(getBiomeAt(10_000, 10_000, biomes).type).toBe('savanna');
  });

  it('resolves ties to the first biome listed', () => {
    const biomes = [biome('desert', -10, 0), biome('tundra', 10, 0)];

    expect(getBiomeAt(0, 0, biomes).type).toBe('desert');
  });

  it('throws on an empty biome list', () => {
    expect(() => getBiomeAt(0, 0, [])).toThrow('biomes array cannot be empty');
  });
});

describe('getTerrainHeight', () => {
  it('is deterministic for a given position', () => {
    const biomes = [biome('forest', 0, 0)];

    expect(getTerrainHeight(12, 34, biomes)).toBe(getTerrainHeight(12, 34, biomes));
  });

  it('returns a finite height for every biome type', () => {
    const types: BiomeData['type'][] = [
      'marsh',
      'forest',
      'desert',
      'tundra',
      'savanna',
      'mountain',
      'scrubland',
    ];

    for (const type of types) {
      const height = getTerrainHeight(7, -13, [biome(type, 0, 0)]);
      expect(Number.isFinite(height), `${type} produced ${height}`).toBe(true);
    }
  });

  it('gives mountains a far wider height range than marshland', () => {
    const sample = (type: BiomeData['type']) => {
      const biomes = [biome(type, 0, 0)];
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < 200; i++) {
        const h = getTerrainHeight(i * 3.7, i * 2.3, biomes);
        min = Math.min(min, h);
        max = Math.max(max, h);
      }
      return max - min;
    };

    expect(sample('mountain')).toBeGreaterThan(sample('marsh'));
  });

  it('varies with position rather than returning a constant', () => {
    const biomes = [biome('mountain', 0, 0)];
    const heights = new Set([
      getTerrainHeight(0, 0, biomes),
      getTerrainHeight(40, 15, biomes),
      getTerrainHeight(-25, 60, biomes),
    ]);

    expect(heights.size).toBeGreaterThan(1);
  });

  it('throws on an empty biome list', () => {
    expect(() => getTerrainHeight(0, 0, [])).toThrow('biomes array cannot be empty');
  });
});
