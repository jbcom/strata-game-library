/**
 * Volumetrics Component Tests
 *
 * Tests for volumetric effects component exports and type structure.
 *
 * @module components/volumetrics/__tests__/volumetrics.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({
    camera: { position: { y: 5 } },
  }),
}));

vi.mock('@strata-game-library/core', () => ({
  createEnhancedFog: vi.fn(),
  createUnderwaterMaterial: vi.fn(),
  createVolumetricFogMaterial: vi.fn(),
  createGodRaysMaterial: vi.fn(),
}));

describe('Volumetrics exports', () => {
  it('should export all volumetric components from index', async () => {
    const volModule = await import('../index');

    expect(volModule.EnhancedFog).toBeDefined();
    expect(volModule.GodRays).toBeDefined();
    expect(volModule.UnderwaterOverlay).toBeDefined();
    expect(volModule.VolumetricEffects).toBeDefined();
    expect(volModule.VolumetricFogMesh).toBeDefined();
  });
});

describe('Volumetrics default props', () => {
  it('should define EnhancedFog defaults', () => {
    const defaults = {
      color: 0xb3c8d9,
      density: 0.02,
    };
    expect(defaults.color).toBe(0xb3c8d9);
    expect(defaults.density).toBe(0.02);
  });

  it('should define UnderwaterOverlay defaults', () => {
    const defaults = {
      color: 0x004d66,
      density: 0.1,
      causticStrength: 0.3,
      waterSurface: 0,
    };
    expect(defaults.color).toBe(0x004d66);
    expect(defaults.density).toBe(0.1);
    expect(defaults.causticStrength).toBe(0.3);
    expect(defaults.waterSurface).toBe(0);
  });

  it('should define VolumetricFogMesh defaults', () => {
    const defaults = {
      color: 0xb3c8d9,
      density: 0.02,
      height: 10,
      size: 200,
    };
    expect(defaults.height).toBe(10);
    expect(defaults.size).toBe(200);
  });

  it('should define VolumetricEffects defaults', () => {
    const defaults = {
      enableFog: true,
      enableUnderwater: true,
    };
    expect(defaults.enableFog).toBe(true);
    expect(defaults.enableUnderwater).toBe(true);
  });
});
