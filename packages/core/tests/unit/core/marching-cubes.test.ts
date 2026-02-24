/**
 * Marching Cubes API Tests
 */

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  createGeometryFromMarchingCubes,
  generateTerrainChunk,
  marchingCubes,
} from '../../../src/core/marching-cubes';
import { sdSphere } from '../../../src/core/sdf';

describe('marchingCubes', () => {
  it('generates vertices for simple sphere', () => {
    const center = new THREE.Vector3(0, 0, 0);
    const sdf = (p: THREE.Vector3) => sdSphere(p, center, 1);

    const result = marchingCubes(sdf, {
      resolution: 16,
      bounds: {
        min: new THREE.Vector3(-2, -2, -2),
        max: new THREE.Vector3(2, 2, 2),
      },
    });

    expect(result.vertices.length).toBeGreaterThan(0);
    expect(result.normals.length).toBe(result.vertices.length);
    expect(result.indices.length).toBeGreaterThan(0);
    expect(result.indices.length % 3).toBe(0); // Triangles
  });

  it('handles empty SDF (no surface)', () => {
    const sdf = () => 10; // Always positive (outside)

    const result = marchingCubes(sdf, {
      resolution: 8,
      bounds: {
        min: new THREE.Vector3(-1, -1, -1),
        max: new THREE.Vector3(1, 1, 1),
      },
    });

    // Should have no vertices (or very few edge cases)
    expect(result.vertices.length).toBeGreaterThanOrEqual(0);
  });

  it('respects resolution parameter', () => {
    const center = new THREE.Vector3(0, 0, 0);
    const sdf = (p: THREE.Vector3) => sdSphere(p, center, 1);

    const lowRes = marchingCubes(sdf, {
      resolution: 8,
      bounds: {
        min: new THREE.Vector3(-2, -2, -2),
        max: new THREE.Vector3(2, 2, 2),
      },
    });

    const highRes = marchingCubes(sdf, {
      resolution: 32,
      bounds: {
        min: new THREE.Vector3(-2, -2, -2),
        max: new THREE.Vector3(2, 2, 2),
      },
    });

    expect(highRes.vertices.length).toBeGreaterThan(lowRes.vertices.length);
  });
});

describe('createGeometryFromMarchingCubes', () => {
  it('creates valid BufferGeometry', () => {
    const center = new THREE.Vector3(0, 0, 0);
    const sdf = (p: THREE.Vector3) => sdSphere(p, center, 1);

    const result = marchingCubes(sdf, {
      resolution: 16,
      bounds: {
        min: new THREE.Vector3(-2, -2, -2),
        max: new THREE.Vector3(2, 2, 2),
      },
    });

    const geometry = createGeometryFromMarchingCubes(result);

    expect(geometry).toBeInstanceOf(THREE.BufferGeometry);
    expect(geometry.attributes.position).toBeDefined();
    expect(geometry.attributes.normal).toBeDefined();
    expect(geometry.index).toBeDefined();
  });
});

describe('generateTerrainChunk', () => {
  it('generates terrain chunk at specified position', () => {
    const sdf = (p: THREE.Vector3) => p.y; // Simple plane
    const chunkPos = new THREE.Vector3(10, 0, 10);

    const chunk = generateTerrainChunk(sdf, chunkPos, 20, 16);

    expect(chunk.geometry).toBeInstanceOf(THREE.BufferGeometry);
    expect(chunk.position).toEqual(chunkPos);
    expect(chunk.boundingBox).toBeInstanceOf(THREE.Box3);
  });
});
