import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  applyReflectionProbe,
  createBoxProjectedReflection,
  createReflectionProbe,
  ReflectionProbeManager,
} from '../src/reflections';

describe('reflection presets', () => {
  describe('createReflectionProbe', () => {
    it('throws when position is not provided', () => {
      expect(() => createReflectionProbe({ position: null as any })).toThrow(
        'position is required'
      );
    });

    it('throws on non-positive size', () => {
      expect(() =>
        createReflectionProbe({ position: new THREE.Vector3(), size: 0 })
      ).toThrow('size must be positive');
    });

    it('throws on non-positive resolution', () => {
      expect(() =>
        createReflectionProbe({ position: new THREE.Vector3(), resolution: 0 })
      ).toThrow('resolution must be a positive integer');
    });

    it('throws on non-integer resolution', () => {
      expect(() =>
        createReflectionProbe({ position: new THREE.Vector3(), resolution: 1.5 })
      ).toThrow('resolution must be a positive integer');
    });

    it('throws on negative updateRate', () => {
      expect(() =>
        createReflectionProbe({ position: new THREE.Vector3(), updateRate: -1 })
      ).toThrow('updateRate must be non-negative');
    });

    it('creates a probe with correct structure', () => {
      const probe = createReflectionProbe({ position: new THREE.Vector3(0, 5, 0) });
      expect(probe).toHaveProperty('probe');
      expect(probe).toHaveProperty('camera');
      expect(probe).toHaveProperty('update');
      expect(probe).toHaveProperty('dispose');
      expect(probe.camera).toBeInstanceOf(THREE.CubeCamera);
    });

    it('camera is positioned at the given position', () => {
      const pos = new THREE.Vector3(10, 20, 30);
      const probe = createReflectionProbe({ position: pos });
      expect(probe.camera.position.x).toBe(10);
      expect(probe.camera.position.y).toBe(20);
      expect(probe.camera.position.z).toBe(30);
    });

    it('dispose can be called without error', () => {
      const probe = createReflectionProbe({ position: new THREE.Vector3() });
      expect(() => probe.dispose()).not.toThrow();
    });
  });

  describe('applyReflectionProbe', () => {
    it('throws when material is null', () => {
      const cubeTexture = new THREE.CubeTexture();
      expect(() => applyReflectionProbe(null as any, cubeTexture)).toThrow(
        'material is required'
      );
    });

    it('throws when probe is null', () => {
      const material = new THREE.MeshStandardMaterial();
      expect(() => applyReflectionProbe(material, null as any)).toThrow('probe is required');
    });

    it('throws on intensity < 0', () => {
      const material = new THREE.MeshStandardMaterial();
      const cubeTexture = new THREE.CubeTexture();
      expect(() => applyReflectionProbe(material, cubeTexture, -0.5)).toThrow(
        'intensity must be between 0 and 1'
      );
    });

    it('throws on intensity > 1', () => {
      const material = new THREE.MeshStandardMaterial();
      const cubeTexture = new THREE.CubeTexture();
      expect(() => applyReflectionProbe(material, cubeTexture, 1.5)).toThrow(
        'intensity must be between 0 and 1'
      );
    });

    it('applies envMap to MeshStandardMaterial', () => {
      const material = new THREE.MeshStandardMaterial();
      const cubeTexture = new THREE.CubeTexture();
      applyReflectionProbe(material, cubeTexture, 0.8);
      expect(material.envMap).toBe(cubeTexture);
      expect(material.envMapIntensity).toBe(0.8);
    });

    it('applies envMap to MeshPhysicalMaterial', () => {
      const material = new THREE.MeshPhysicalMaterial();
      const cubeTexture = new THREE.CubeTexture();
      applyReflectionProbe(material, cubeTexture, 0.5);
      expect(material.envMap).toBe(cubeTexture);
      expect(material.envMapIntensity).toBe(0.5);
    });

    it('applies uniforms to ShaderMaterial', () => {
      const material = new THREE.ShaderMaterial({ uniforms: {} });
      const cubeTexture = new THREE.CubeTexture();
      applyReflectionProbe(material, cubeTexture, 0.7);
      expect(material.uniforms.envMap.value).toBe(cubeTexture);
      expect(material.uniforms.envMapIntensity.value).toBe(0.7);
    });
  });

  describe('createBoxProjectedReflection', () => {
    it('throws when material is null', () => {
      expect(() =>
        createBoxProjectedReflection(
          null as any,
          new THREE.CubeTexture(),
          new THREE.Vector3(),
          new THREE.Vector3(1, 1, 1)
        )
      ).toThrow('material is required');
    });

    it('throws when probe is null', () => {
      expect(() =>
        createBoxProjectedReflection(
          new THREE.ShaderMaterial(),
          null as any,
          new THREE.Vector3(),
          new THREE.Vector3(1, 1, 1)
        )
      ).toThrow('probe is required');
    });

    it('throws when boxPosition is null', () => {
      expect(() =>
        createBoxProjectedReflection(
          new THREE.ShaderMaterial(),
          new THREE.CubeTexture(),
          null as any,
          new THREE.Vector3(1, 1, 1)
        )
      ).toThrow('boxPosition is required');
    });

    it('throws when boxSize is null', () => {
      expect(() =>
        createBoxProjectedReflection(
          new THREE.ShaderMaterial(),
          new THREE.CubeTexture(),
          new THREE.Vector3(),
          null as any
        )
      ).toThrow('boxSize is required');
    });
  });

  describe('ReflectionProbeManager', () => {
    // We can't create a WebGLRenderer without a canvas/WebGL context in Node,
    // so we test constructor validation only.
    it('throws when renderer is null', () => {
      expect(() => new ReflectionProbeManager(null as any, new THREE.Scene())).toThrow(
        'renderer is required'
      );
    });

    it('throws when scene is null', () => {
      expect(() => new ReflectionProbeManager({} as any, null as any)).toThrow(
        'scene is required'
      );
    });
  });
});
