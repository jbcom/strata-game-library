/**
 * Shaders Component Tests
 *
 * Tests for shader component exports and type structure.
 *
 * @module components/shaders/__tests__/shaders.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@strata-game-library/shaders/materials', () => ({
  createToonMaterial: vi.fn(),
  createHologramMaterial: vi.fn(),
  createDissolveMaterial: vi.fn(),
  createForcefieldMaterial: vi.fn(),
  createOutlineMaterial: vi.fn(),
  createGradientMaterial: vi.fn(),
  createGlitchMaterial: vi.fn(),
  createCrystalMaterial: vi.fn(),
}));

describe('Shaders exports', () => {
  it('should export all shader components from index', async () => {
    const shadersModule = await import('../index');

    expect(shadersModule.CrystalMesh).toBeDefined();
    expect(shadersModule.DissolveMesh).toBeDefined();
    expect(shadersModule.Forcefield).toBeDefined();
    expect(shadersModule.GlitchMesh).toBeDefined();
    expect(shadersModule.GradientMesh).toBeDefined();
    expect(shadersModule.HologramMesh).toBeDefined();
    expect(shadersModule.Outline).toBeDefined();
    expect(shadersModule.Raymarching).toBeDefined();
    expect(shadersModule.ToonMesh).toBeDefined();
  });
});

describe('Shader component types', () => {
  it('should define ShaderMeshProps shape', () => {
    const defaultProps = {
      position: [0, 0, 0] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      scale: 1,
    };

    expect(defaultProps.position).toEqual([0, 0, 0]);
    expect(defaultProps.rotation).toEqual([0, 0, 0]);
    expect(defaultProps.scale).toBe(1);
  });

  it('should support scale as a number or tuple', () => {
    const scaleNum: number | [number, number, number] = 2;
    const scaleTuple: number | [number, number, number] = [1, 2, 3];

    expect(scaleNum).toBe(2);
    expect(scaleTuple).toEqual([1, 2, 3]);
  });
});
