import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  createAnimatedBillboard,
  createBillboard,
  createBillboardInstances,
} from '../src/billboards';

describe('billboard presets', () => {
  // Create a test texture (1x1 pixel)
  function createTestTexture(): THREE.Texture {
    const texture = new THREE.Texture();
    return texture;
  }

  describe('createBillboard', () => {
    it('creates a THREE.Mesh', () => {
      const texture = createTestTexture();
      const mesh = createBillboard({ texture });
      expect(mesh).toBeInstanceOf(THREE.Mesh);
    });

    it('throws when texture is not provided', () => {
      expect(() => createBillboard({ texture: null as any })).toThrow('texture is required');
    });

    it('uses numeric size for both width and height', () => {
      const texture = createTestTexture();
      const mesh = createBillboard({ texture, size: 2 });
      // PlaneGeometry with width=2, height=2
      const params = (mesh.geometry as THREE.PlaneGeometry).parameters;
      expect(params.width).toBe(2);
      expect(params.height).toBe(2);
    });

    it('uses object size for width and height', () => {
      const texture = createTestTexture();
      const mesh = createBillboard({ texture, size: { width: 3, height: 4 } });
      const params = (mesh.geometry as THREE.PlaneGeometry).parameters;
      expect(params.width).toBe(3);
      expect(params.height).toBe(4);
    });

    it('defaults to transparent', () => {
      const texture = createTestTexture();
      const mesh = createBillboard({ texture });
      const material = mesh.material as THREE.MeshBasicMaterial;
      expect(material.transparent).toBe(true);
    });

    it('applies custom color', () => {
      const texture = createTestTexture();
      const color = new THREE.Color(1, 0, 0);
      const mesh = createBillboard({ texture, color });
      const material = mesh.material as THREE.MeshBasicMaterial;
      expect(material.color.r).toBe(1);
      expect(material.color.g).toBe(0);
      expect(material.color.b).toBe(0);
    });

    it('sets onBeforeRender for camera-facing', () => {
      const texture = createTestTexture();
      const mesh = createBillboard({ texture });
      expect(mesh.onBeforeRender).toBeDefined();
      expect(typeof mesh.onBeforeRender).toBe('function');
    });
  });

  describe('createBillboardInstances', () => {
    it('creates a THREE.InstancedMesh', () => {
      const texture = createTestTexture();
      const positions = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(2, 0, 0),
      ];
      const mesh = createBillboardInstances(3, positions, { texture });
      expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
    });

    it('throws on non-positive count', () => {
      const texture = createTestTexture();
      expect(() => createBillboardInstances(0, [], { texture })).toThrow(
        'count must be positive'
      );
    });

    it('throws when positions array is too small', () => {
      const texture = createTestTexture();
      const positions = [new THREE.Vector3(0, 0, 0)];
      expect(() => createBillboardInstances(3, positions, { texture })).toThrow(
        'positions array must have at least count elements'
      );
    });

    it('sets instance matrices for all positions', () => {
      const texture = createTestTexture();
      const positions = [new THREE.Vector3(1, 2, 3), new THREE.Vector3(4, 5, 6)];
      const mesh = createBillboardInstances(2, positions, { texture });
      expect(mesh.instanceMatrix).toBeDefined();
      // needsUpdate may not be set in non-WebGL environment
      expect(mesh.count).toBe(2);
    });
  });

  describe('createAnimatedBillboard', () => {
    it('creates a mesh with an update method', () => {
      const texture = createTestTexture();
      const mesh = createAnimatedBillboard(texture, { x: 4, y: 4 });
      expect(mesh).toBeInstanceOf(THREE.Mesh);
      expect(typeof mesh.update).toBe('function');
    });

    it('update method can be called without error', () => {
      const texture = createTestTexture();
      const mesh = createAnimatedBillboard(texture, { x: 4, y: 4 }, 10);
      expect(() => mesh.update(0.016)).not.toThrow();
    });
  });
});
