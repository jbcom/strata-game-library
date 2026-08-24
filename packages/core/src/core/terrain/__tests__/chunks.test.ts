import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { generateTerrainChunk } from '../chunks';

/** A sphere SDF — cheap, and guaranteed to produce a crossing inside the chunk. */
const sphere = (radius: number) => (p: THREE.Vector3) => p.length() - radius;

describe('generateTerrainChunk', () => {
  it('frames the bounding box on the requested chunk position and size', () => {
    const chunk = generateTerrainChunk(sphere(4), new THREE.Vector3(10, 0, -10), 20, 8);

    expect(chunk.boundingBox.min.toArray()).toEqual([0, -10, -20]);
    expect(chunk.boundingBox.max.toArray()).toEqual([20, 10, 0]);
  });

  it('reports the chunk centre it was given', () => {
    const position = new THREE.Vector3(3, 4, 5);
    const chunk = generateTerrainChunk(sphere(2), position, 16, 8);

    expect(chunk.position.toArray()).toEqual([3, 4, 5]);
  });

  it('clones the position so later mutation cannot corrupt the chunk', () => {
    const position = new THREE.Vector3(1, 1, 1);
    const chunk = generateTerrainChunk(sphere(2), position, 16, 8);
    position.set(99, 99, 99);

    expect(chunk.position.toArray()).toEqual([1, 1, 1]);
  });

  it('produces geometry with positions when the surface crosses the chunk', () => {
    const chunk = generateTerrainChunk(sphere(4), new THREE.Vector3(0, 0, 0), 20, 16);
    const position = chunk.geometry.getAttribute('position');

    expect(position).toBeDefined();
    expect(position.count).toBeGreaterThan(0);
  });

  // Pins existing behaviour: an empty extraction is an error, not an empty
  // mesh. createGeometryFromMarchingCubes rejects a zero-length vertex list,
  // so a chunk containing no surface throws rather than returning geometry
  // with a count of 0. Callers streaming a large world must therefore guard
  // chunks that may be entirely inside or outside the volume.
  it('throws when the SDF never crosses zero in the chunk', () => {
    expect(() => generateTerrainChunk(() => 1000, new THREE.Vector3(0, 0, 0), 20, 8)).toThrow(
      'result.vertices must be a non-empty array'
    );
  });

  it('rejects a non-function SDF', () => {
    expect(() =>
      generateTerrainChunk(
        undefined as unknown as (p: THREE.Vector3) => number,
        new THREE.Vector3(),
        10,
        8
      )
    ).toThrow('sdf must be a function');
  });

  it('requires a chunk position', () => {
    expect(() =>
      generateTerrainChunk(sphere(1), undefined as unknown as THREE.Vector3, 10, 8)
    ).toThrow('chunkPosition is required');
  });

  it('rejects a non-positive chunk size', () => {
    expect(() => generateTerrainChunk(sphere(1), new THREE.Vector3(), 0, 8)).toThrow(
      'chunkSize must be positive'
    );
  });

  it('rejects a non-integer or non-positive resolution', () => {
    expect(() => generateTerrainChunk(sphere(1), new THREE.Vector3(), 10, 1.5)).toThrow(
      'resolution must be a positive integer'
    );
    expect(() => generateTerrainChunk(sphere(1), new THREE.Vector3(), 10, 0)).toThrow(
      'resolution must be a positive integer'
    );
  });

  it('caps resolution at 256 to bound the extraction cost', () => {
    expect(() => generateTerrainChunk(sphere(1), new THREE.Vector3(), 10, 257)).toThrow(
      'resolution must be <= 256'
    );
  });
});
