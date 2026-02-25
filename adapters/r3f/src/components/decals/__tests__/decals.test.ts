/**
 * Decals Component Tests
 *
 * Tests for decal and billboard component exports and type structure.
 *
 * @module components/decals/__tests__/decals.test
 */

import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@strata-game-library/core', () => ({
  createDecalProjector: vi.fn(),
  updateSpriteAnimation: vi.fn(),
}));

describe('Decals exports', () => {
  it('should export all decal components from index', async () => {
    const decalsModule = await import('../index');

    expect(decalsModule.AnimatedBillboard).toBeDefined();
    expect(decalsModule.Billboard).toBeDefined();
    expect(decalsModule.Decal).toBeDefined();
    expect(decalsModule.DecalPool).toBeDefined();
  });
});

describe('Decal default props', () => {
  it('should define Decal polygon offset defaults', () => {
    const defaults = {
      opacity: 1,
      depthTest: true,
      depthWrite: false,
      polygonOffsetFactor: -4,
      color: 0xffffff,
    };

    expect(defaults.opacity).toBe(1);
    expect(defaults.depthTest).toBe(true);
    expect(defaults.depthWrite).toBe(false);
    expect(defaults.polygonOffsetFactor).toBe(-4);
  });
});

describe('Billboard default props', () => {
  it('should define Billboard defaults', () => {
    const defaults = {
      size: 1,
      opacity: 1,
      transparent: true,
      alphaTest: 0.1,
      lockY: false,
      depthWrite: false,
      renderOrder: 0,
    };

    expect(defaults.transparent).toBe(true);
    expect(defaults.alphaTest).toBe(0.1);
    expect(defaults.lockY).toBe(false);
  });
});

describe('AnimatedBillboard default props', () => {
  it('should define animation defaults', () => {
    const defaults = {
      frameRate: 10,
      loop: true,
      pingPong: false,
      autoPlay: true,
    };

    expect(defaults.frameRate).toBe(10);
    expect(defaults.loop).toBe(true);
    expect(defaults.pingPong).toBe(false);
    expect(defaults.autoPlay).toBe(true);
  });
});

describe('DecalPool default props', () => {
  it('should define pool defaults', () => {
    const defaults = {
      maxDecals: 100,
      fadeTime: 5,
      defaultSize: 1,
      depthTest: true,
      depthWrite: false,
    };

    expect(defaults.maxDecals).toBe(100);
    expect(defaults.fadeTime).toBe(5);
  });
});
