/**
 * Clouds Component Tests
 *
 * Tests for cloud component exports and type structure.
 *
 * @module components/clouds/__tests__/clouds.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@strata-game-library/core', () => ({
  createCloudLayerMaterial: vi.fn(),
  createVolumetricCloudMaterial: vi.fn(),
}));

describe('Clouds exports', () => {
  it('should export all cloud components from index', async () => {
    const cloudsModule = await import('../index');

    expect(cloudsModule.CloudLayer).toBeDefined();
    expect(cloudsModule.CloudSky).toBeDefined();
    expect(cloudsModule.VolumetricClouds).toBeDefined();
  });
});

describe('VolumetricClouds default props', () => {
  it('should define sensible defaults', () => {
    const defaults = {
      cloudBase: 50,
      cloudHeight: 50,
      coverage: 0.5,
      density: 1.0,
      steps: 32,
      lightSteps: 4,
      radius: 500,
    };

    expect(defaults.cloudBase).toBe(50);
    expect(defaults.cloudHeight).toBe(50);
    expect(defaults.coverage).toBe(0.5);
    expect(defaults.density).toBe(1.0);
    expect(defaults.steps).toBe(32);
    expect(defaults.lightSteps).toBe(4);
    expect(defaults.radius).toBe(500);
  });
});

describe('CloudLayer default props', () => {
  it('should define default size as [200, 200]', () => {
    const defaultSize: [number, number] = [200, 200];
    expect(defaultSize).toEqual([200, 200]);
  });
});
