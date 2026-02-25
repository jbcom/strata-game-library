/**
 * Instancing Component Tests
 *
 * Tests for instancing component exports, types, and utilities.
 *
 * @module components/instancing/__tests__/instancing.test
 */

import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@strata-game-library/core', () => ({
  generateInstanceData: vi.fn(() => []),
  noise3D: vi.fn(() => 0),
  fbm: vi.fn(() => 0),
  getBiomeAt: vi.fn(() => 'forest'),
}));

describe('Instancing exports', () => {
  it('should export all instancing components from index', async () => {
    const instancingModule = await import('../index');

    expect(instancingModule.GPUInstancedMesh).toBeDefined();
    expect(instancingModule.GrassInstances).toBeDefined();
    expect(instancingModule.RockInstances).toBeDefined();
    expect(instancingModule.TreeInstances).toBeDefined();
  });

  it('should export generateBiomeInstanceData utility', async () => {
    const instancingModule = await import('../index');
    expect(instancingModule.generateBiomeInstanceData).toBeDefined();
    expect(typeof instancingModule.generateBiomeInstanceData).toBe('function');
  });
});

describe('DEFAULT_BIOMES', () => {
  it('should export default biome data', async () => {
    const { DEFAULT_BIOMES } = await import('../types');
    expect(DEFAULT_BIOMES).toBeDefined();
    expect(Array.isArray(DEFAULT_BIOMES)).toBe(true);
    expect(DEFAULT_BIOMES).toHaveLength(3);
  });

  it('should include marsh, forest, and savanna biomes', async () => {
    const { DEFAULT_BIOMES } = await import('../types');
    const types = DEFAULT_BIOMES.map((b) => b.type);
    expect(types).toContain('marsh');
    expect(types).toContain('forest');
    expect(types).toContain('savanna');
  });

  it('should have Vector2 centers for each biome', async () => {
    const { DEFAULT_BIOMES } = await import('../types');
    for (const biome of DEFAULT_BIOMES) {
      expect(biome.center).toBeInstanceOf(THREE.Vector2);
      expect(biome.radius).toBeGreaterThan(0);
    }
  });
});

describe('generateBiomeInstanceData', () => {
  it('should call core generateInstanceData', async () => {
    const { generateBiomeInstanceData } = await import('../utils');
    const result = generateBiomeInstanceData(
      10,
      100,
      () => 0,
      undefined,
      undefined,
      42
    );
    expect(Array.isArray(result)).toBe(true);
  });
});
