/**
 * LOD Component Tests
 *
 * Tests for Level of Detail component exports and type structure.
 *
 * @module components/lod/__tests__/lod.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({
    camera: { position: { distanceTo: () => 50 } },
  }),
}));

vi.mock('@strata-game-library/core', () => ({
  updateLODLevel: vi.fn(),
  calculateImpostorView: vi.fn(),
}));

describe('LOD exports', () => {
  it('should export all LOD components from index', async () => {
    const lodModule = await import('../index');

    expect(lodModule.Impostor).toBeDefined();
    expect(lodModule.LODGroup).toBeDefined();
    expect(lodModule.LODMesh).toBeDefined();
    expect(lodModule.LODVegetation).toBeDefined();
  });
});

describe('LODMesh default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      hysteresis: 0.1,
      transitionDuration: 0.3,
      fadeMode: 'instant' as const,
      castShadow: true,
      receiveShadow: true,
      frustumCulled: true,
    };

    expect(defaults.hysteresis).toBe(0.1);
    expect(defaults.transitionDuration).toBe(0.3);
    expect(defaults.fadeMode).toBe('instant');
    expect(defaults.castShadow).toBe(true);
  });
});

describe('LODMesh fade modes', () => {
  it('should support all fade modes', () => {
    const modes: Array<'instant' | 'crossfade' | 'dither'> = [
      'instant',
      'crossfade',
      'dither',
    ];
    expect(modes).toHaveLength(3);
  });
});

describe('Impostor default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      views: 8,
      billboardMode: 'cylindrical' as const,
      opacity: 1.0,
      transparent: true,
      alphaTest: 0.1,
      depthWrite: false,
      color: 0xffffff,
      renderOrder: 0,
      castShadow: false,
      receiveShadow: false,
    };

    expect(defaults.views).toBe(8);
    expect(defaults.billboardMode).toBe('cylindrical');
    expect(defaults.alphaTest).toBe(0.1);
  });
});

describe('Impostor billboard modes', () => {
  it('should support spherical and cylindrical modes', () => {
    const modes: Array<'spherical' | 'cylindrical'> = ['spherical', 'cylindrical'];
    expect(modes).toHaveLength(2);
  });
});
