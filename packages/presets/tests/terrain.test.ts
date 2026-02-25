import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createChunkedTerrain, createTerrainGeometry, createTerrainMesh } from '../src/terrain';

// Terrain functions depend on @strata-game-library/core SDF functions.
// We test validation logic and basic output types.

describe('terrain presets', () => {
  const sampleBiomes = [
    {
      type: 'forest' as const,
      center: new THREE.Vector2(0, 0),
      radius: 50,
    },
  ];

  describe('createTerrainGeometry', () => {
    it('throws on empty biomes array', () => {
      expect(() => createTerrainGeometry({ biomes: [] })).toThrow(
        'biomes array cannot be empty'
      );
    });

    it('throws on non-positive resolution', () => {
      expect(() => createTerrainGeometry({ biomes: sampleBiomes, resolution: 0 })).toThrow(
        'resolution must be a positive integer'
      );
      expect(() => createTerrainGeometry({ biomes: sampleBiomes, resolution: -1 })).toThrow(
        'resolution must be a positive integer'
      );
    });

    it('throws on non-integer resolution', () => {
      expect(() => createTerrainGeometry({ biomes: sampleBiomes, resolution: 1.5 })).toThrow(
        'resolution must be a positive integer'
      );
    });

    it('throws on resolution > 256', () => {
      expect(() => createTerrainGeometry({ biomes: sampleBiomes, resolution: 300 })).toThrow(
        'resolution must be <= 256'
      );
    });

    it('returns a THREE.BufferGeometry with valid biomes', () => {
      const geometry = createTerrainGeometry({
        biomes: sampleBiomes,
        resolution: 8,
        bounds: {
          min: new THREE.Vector3(-5, -2, -5),
          max: new THREE.Vector3(5, 2, 5),
        },
      });
      expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
    });
  });

  describe('createTerrainMesh', () => {
    it('returns a THREE.Mesh', () => {
      const mesh = createTerrainMesh({
        biomes: sampleBiomes,
        resolution: 8,
        bounds: {
          min: new THREE.Vector3(-5, -2, -5),
          max: new THREE.Vector3(5, 2, 5),
        },
      });
      expect(mesh).toBeInstanceOf(THREE.Mesh);
    });

    it('uses default material when none provided', () => {
      const mesh = createTerrainMesh({
        biomes: sampleBiomes,
        resolution: 8,
        bounds: {
          min: new THREE.Vector3(-5, -2, -5),
          max: new THREE.Vector3(5, 2, 5),
        },
      });
      expect(mesh.material).toBeInstanceOf(THREE.MeshStandardMaterial);
    });

    it('uses custom material when provided', () => {
      const customMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const mesh = createTerrainMesh({
        biomes: sampleBiomes,
        resolution: 8,
        material: customMaterial,
        bounds: {
          min: new THREE.Vector3(-5, -2, -5),
          max: new THREE.Vector3(5, 2, 5),
        },
      });
      expect(mesh.material).toBe(customMaterial);
    });
  });

  describe('createChunkedTerrain', () => {
    it('throws on empty biomes', () => {
      expect(() =>
        createChunkedTerrain([], [new THREE.Vector3(0, 0, 0)], 10, 8)
      ).toThrow('biomes array cannot be empty');
    });

    it('throws on empty chunkPositions', () => {
      expect(() => createChunkedTerrain(sampleBiomes, [], 10, 8)).toThrow(
        'chunkPositions array cannot be empty'
      );
    });

    it('throws on non-positive chunkSize', () => {
      expect(() =>
        createChunkedTerrain(sampleBiomes, [new THREE.Vector3()], 0, 8)
      ).toThrow('chunkSize must be positive');
    });

    it('throws on non-positive resolution', () => {
      expect(() =>
        createChunkedTerrain(sampleBiomes, [new THREE.Vector3()], 10, 0)
      ).toThrow('resolution must be a positive integer');
    });

    it('throws on non-integer resolution', () => {
      expect(() =>
        createChunkedTerrain(sampleBiomes, [new THREE.Vector3()], 10, 2.5)
      ).toThrow('resolution must be a positive integer');
    });

    it('returns array of chunks matching positions count', () => {
      const positions = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(10, 0, 0)];
      const chunks = createChunkedTerrain(sampleBiomes, positions, 10, 4);
      expect(chunks).toHaveLength(2);
    });
  });
});
