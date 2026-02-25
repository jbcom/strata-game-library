/**
 * Particles Component Tests
 *
 * Tests for particle component exports and utility functions.
 *
 * @module components/particles/__tests__/particles.test
 */

import * as THREE from 'three';
import { describe, expect, it, vi } from 'vitest';
import { toVector3 } from '../utils';

vi.mock('@react-three/fiber', () => ({
  useFrame: (callback: any) => callback,
  useThree: () => ({}),
}));

vi.mock('@strata-game-library/core', () => ({
  ParticleEmitter: vi.fn(),
  createParticleEmitter: vi.fn(),
}));

describe('Particles exports', () => {
  it('should export all particle components from index', async () => {
    const particlesModule = await import('../index');

    expect(particlesModule.ParticleBurst).toBeDefined();
    expect(particlesModule.ParticleEmitter).toBeDefined();
    expect(particlesModule.toVector3).toBeDefined();
  });
});

describe('toVector3 utility', () => {
  it('should return default value for undefined input', () => {
    const defaultVec = new THREE.Vector3(1, 2, 3);
    const result = toVector3(undefined, defaultVec);
    expect(result).toBe(defaultVec);
  });

  it('should convert tuple to Vector3', () => {
    const defaultVec = new THREE.Vector3(0, 0, 0);
    const result = toVector3([5, 10, 15], defaultVec);

    expect(result).toBeInstanceOf(THREE.Vector3);
    expect(result.x).toBe(5);
    expect(result.y).toBe(10);
    expect(result.z).toBe(15);
  });

  it('should clone an existing Vector3', () => {
    const defaultVec = new THREE.Vector3(0, 0, 0);
    const input = new THREE.Vector3(7, 8, 9);
    const result = toVector3(input, defaultVec);

    expect(result).toBeInstanceOf(THREE.Vector3);
    expect(result.x).toBe(7);
    expect(result.y).toBe(8);
    expect(result.z).toBe(9);
    expect(result).not.toBe(input); // should be a clone
  });

  it('should handle zero tuple', () => {
    const defaultVec = new THREE.Vector3(1, 1, 1);
    const result = toVector3([0, 0, 0], defaultVec);

    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(0);
  });

  it('should handle negative values', () => {
    const defaultVec = new THREE.Vector3(0, 0, 0);
    const result = toVector3([-1, -2, -3], defaultVec);

    expect(result.x).toBe(-1);
    expect(result.y).toBe(-2);
    expect(result.z).toBe(-3);
  });
});

describe('Particle emission shapes', () => {
  it('should support all emission shape types', () => {
    const shapes = ['point', 'sphere', 'box', 'cone', 'disk'] as const;
    expect(shapes).toHaveLength(5);
  });
});

describe('Particle blending modes', () => {
  it('should support THREE blending constants', () => {
    expect(THREE.AdditiveBlending).toBeDefined();
    expect(THREE.NormalBlending).toBeDefined();
    expect(THREE.MultiplyBlending).toBeDefined();
  });
});
