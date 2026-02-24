/**
 * Instancing Core API Tests
 */

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { type BiomeData, generateInstanceData } from '../../../src/core/instancing';

describe('generateInstanceData', () => {
  it('generates requested number of instances', () => {
    const instances = generateInstanceData(
      10,
      100,
      () => 0, // Flat terrain
      undefined,
      undefined,
      12345 // Fixed seed for deterministic generation
    );

    // With rejection sampling (density noise), we may get fewer than requested
    // but should get at least some instances
    expect(instances.length).toBeGreaterThan(0);
    expect(instances.length).toBeLessThanOrEqual(10);
  });

  it('respects biome filtering', () => {
    const biomes: BiomeData[] = [
      { type: 'forest', center: new THREE.Vector2(0, 0), radius: 50 },
      { type: 'desert', center: new THREE.Vector2(100, 100), radius: 50 },
    ];

    const instances = generateInstanceData(20, 200, () => 0, biomes, ['forest']);

    // All instances should be in forest biome (closest biome semantics)
    // The default getBiomeAt returns the closest biome by center distance,
    // not by whether the point is within the radius
    instances.forEach((instance) => {
      const distToForest = Math.sqrt(instance.position.x ** 2 + instance.position.z ** 2);
      const distToDesert = Math.sqrt(
        (instance.position.x - 100) ** 2 + (instance.position.z - 100) ** 2
      );
      // Each instance should be closer to forest center than desert center
      expect(distToForest).toBeLessThan(distToDesert);
    });
  });

  it('respects height function', () => {
    const heightFunc = (x: number, _z: number) => Math.sin(x * 0.1) * 2;

    const instances = generateInstanceData(10, 50, heightFunc);

    instances.forEach((instance) => {
      const expectedY = heightFunc(instance.position.x, instance.position.z);
      expect(instance.position.y).toBeCloseTo(expectedY, 1);
    });
  });

  it('skips underwater positions', () => {
    const instances = generateInstanceData(
      20,
      50,
      () => -1, // All underwater
      undefined,
      undefined
    );

    // Should have fewer instances due to underwater filtering
    expect(instances.length).toBeLessThan(20);
  });

  it('generates valid instance data structure', () => {
    const instances = generateInstanceData(5, 10, () => 0);

    instances.forEach((instance) => {
      expect(instance.position).toBeInstanceOf(THREE.Vector3);
      expect(instance.rotation).toBeInstanceOf(THREE.Euler);
      expect(instance.scale).toBeInstanceOf(THREE.Vector3);
      expect(instance.scale.x).toBeGreaterThan(0);
    });
  });

  it('generates deterministic results with same seed', () => {
    const seed = 42;
    const areaSize = 100;
    const instances1 = generateInstanceData(10, areaSize, () => 0, undefined, undefined, seed);
    const instances2 = generateInstanceData(10, areaSize, () => 0, undefined, undefined, seed);

    expect(instances1.length).toBe(instances2.length);
    instances1.forEach((instance, i) => {
      // Verify positions match between runs with same seed
      expect(instance.position.x).toBeCloseTo(instances2[i].position.x, 10);
      expect(instance.position.z).toBeCloseTo(instances2[i].position.z, 10);

      // Verify positions are within bounds (areaSize / 2 in each direction)
      const halfSize = areaSize / 2;
      expect(instance.position.x).toBeGreaterThanOrEqual(-halfSize);
      expect(instance.position.x).toBeLessThanOrEqual(halfSize);
      expect(instance.position.z).toBeGreaterThanOrEqual(-halfSize);
      expect(instance.position.z).toBeLessThanOrEqual(halfSize);
    });
  });

  it('generates different results with different seeds', () => {
    const instances1 = generateInstanceData(10, 100, () => 0, undefined, undefined, 42);
    const instances2 = generateInstanceData(10, 100, () => 0, undefined, undefined, 123);

    // At least one position should differ
    const hasDifference = instances1.some(
      (instance, i) =>
        i < instances2.length &&
        (Math.abs(instance.position.x - instances2[i].position.x) > 0.001 ||
          Math.abs(instance.position.z - instances2[i].position.z) > 0.001)
    );
    expect(hasDifference).toBe(true);
  });

  it('throws on invalid count', () => {
    expect(() => generateInstanceData(-1, 100, () => 0)).toThrow('count must be positive');
    expect(() => generateInstanceData(0, 100, () => 0)).toThrow('count must be positive');
  });

  it('throws on invalid areaSize', () => {
    expect(() => generateInstanceData(10, -1, () => 0)).toThrow('areaSize must be positive');
    expect(() => generateInstanceData(10, 0, () => 0)).toThrow('areaSize must be positive');
  });
});
