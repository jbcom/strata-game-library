import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createVegetationMesh } from '../src/vegetation';

// Note: createGrassInstances, createTreeInstances, createRockInstances all delegate
// to createVegetationMesh which depends on @strata-game-library/core's generateInstanceData
// and createInstancedMesh. We test validation logic here.

describe('vegetation presets', () => {
  const sampleBiomes = [
    {
      type: 'forest' as const,
      center: new THREE.Vector2(0, 0),
      radius: 50,
    },
  ];

  const sampleGeometry = new THREE.BoxGeometry(1, 1, 1);
  const sampleMaterial = new THREE.MeshBasicMaterial();

  describe('createVegetationMesh', () => {
    it('throws on non-positive count', () => {
      expect(() =>
        createVegetationMesh({
          count: 0,
          areaSize: 10,
          biomes: sampleBiomes,
          geometry: sampleGeometry,
          material: sampleMaterial,
        })
      ).toThrow('count must be positive');
    });

    it('throws on negative count', () => {
      expect(() =>
        createVegetationMesh({
          count: -1,
          areaSize: 10,
          biomes: sampleBiomes,
          geometry: sampleGeometry,
          material: sampleMaterial,
        })
      ).toThrow('count must be positive');
    });

    it('throws on non-positive areaSize', () => {
      expect(() =>
        createVegetationMesh({
          count: 10,
          areaSize: 0,
          biomes: sampleBiomes,
          geometry: sampleGeometry,
          material: sampleMaterial,
        })
      ).toThrow('areaSize must be positive');
    });

    it('throws on empty biomes', () => {
      expect(() =>
        createVegetationMesh({
          count: 10,
          areaSize: 10,
          biomes: [],
          geometry: sampleGeometry,
          material: sampleMaterial,
        })
      ).toThrow('biomes array cannot be empty');
    });

    it('throws when geometry is missing', () => {
      expect(() =>
        createVegetationMesh({
          count: 10,
          areaSize: 10,
          biomes: sampleBiomes,
          geometry: null as any,
          material: sampleMaterial,
        })
      ).toThrow('geometry is required');
    });

    it('throws when material is missing', () => {
      expect(() =>
        createVegetationMesh({
          count: 10,
          areaSize: 10,
          biomes: sampleBiomes,
          geometry: sampleGeometry,
          material: null as any,
        })
      ).toThrow('material is required');
    });
  });
});
