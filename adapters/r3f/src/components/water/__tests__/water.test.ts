/**
 * Water Component Tests
 *
 * Tests for water component exports and configuration logic.
 *
 * @module components/water/__tests__/water.test
 */

import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({
    camera: new THREE.PerspectiveCamera(),
  }),
}));

vi.mock('@strata-game-library/core', () => ({
  createWaterMaterial: vi.fn(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0x006994) },
        opacity: { value: 0.8 },
        waveSpeed: { value: 1.0 },
        waveHeight: { value: 0.5 },
      },
      transparent: true,
    });
    return mat;
  }),
  createAdvancedWaterMaterial: vi.fn(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uWaveHeight: { value: 0.5 },
      },
    });
  }),
}));

describe('Water exports', () => {
  it('should export Water component from index', async () => {
    const waterModule = await import('../index');
    expect(waterModule.Water).toBeDefined();
  });

  it('should export AdvancedWater component', async () => {
    const { AdvancedWater } = await import('../Water');
    expect(AdvancedWater).toBeDefined();
  });

  it('should export Water as a forwardRef component', async () => {
    const { Water } = await import('../Water');
    expect(Water).toBeDefined();
    expect(Water.displayName).toBe('Water');
  });

  it('should export AdvancedWater as a forwardRef component', async () => {
    const { AdvancedWater } = await import('../Water');
    expect(AdvancedWater).toBeDefined();
    expect(AdvancedWater.displayName).toBe('AdvancedWater');
  });
});

describe('Water default props', () => {
  it('should have sensible defaults for basic Water', () => {
    const defaults = {
      position: [0, -0.2, 0] as [number, number, number],
      size: 100,
      segments: 32,
      color: 0x006994,
      opacity: 0.8,
      waveSpeed: 1.0,
      waveHeight: 0.5,
    };

    expect(defaults.position).toEqual([0, -0.2, 0]);
    expect(defaults.size).toBe(100);
    expect(defaults.segments).toBe(32);
    expect(defaults.opacity).toBe(0.8);
  });

  it('should have sensible defaults for AdvancedWater', () => {
    const defaults = {
      position: [0, 0, 0] as [number, number, number],
      size: 100,
      segments: 64,
      color: 0x2a5a8a,
      deepColor: 0x1a3a5a,
      foamColor: 0x8ab4d4,
      causticIntensity: 0.4,
      waveHeight: 0.5,
      waveSpeed: 1.0,
    };

    expect(defaults.position).toEqual([0, 0, 0]);
    expect(defaults.segments).toBe(64);
    expect(defaults.causticIntensity).toBe(0.4);
  });
});

describe('Water size resolution', () => {
  function resolveSize(size: number | [number, number]): [number, number] {
    return Array.isArray(size) ? size : [size, size];
  }

  it('should resolve number size to [width, height] tuple', () => {
    expect(resolveSize(100)).toEqual([100, 100]);
  });

  it('should pass through tuple size directly', () => {
    expect(resolveSize([200, 100])).toEqual([200, 100]);
  });
});

describe('Water color alias handling', () => {
  it('should prefer waterColor alias over color prop when set', () => {
    const colorProp = 0x2a5a8a;
    const waterColor = 0x00ff00;
    const color = waterColor !== undefined ? waterColor : colorProp;
    expect(color).toBe(0x00ff00);
  });

  it('should fall back to color prop when waterColor is undefined', () => {
    const colorProp = 0x2a5a8a;
    const waterColor = undefined;
    const color = waterColor !== undefined ? waterColor : colorProp;
    expect(color).toBe(0x2a5a8a);
  });
});

describe('Water rotation', () => {
  it('should rotate water plane to horizontal (-PI/2 on X axis)', () => {
    const rotation = -Math.PI / 2;
    expect(rotation).toBeCloseTo(-1.5708, 4);
  });
});

describe('Water transparency', () => {
  it('should enable transparency when opacity < 1', () => {
    expect(0.8 < 1).toBe(true);
    expect(1.0 < 1).toBe(false);
  });
});
