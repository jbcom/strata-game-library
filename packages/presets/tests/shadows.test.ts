import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { createContactShadows, createShadowSystem } from '../src/shadows';

describe('shadow presets', () => {
  describe('createShadowSystem', () => {
    it('throws when light is not provided', () => {
      expect(() =>
        createShadowSystem({ light: null as any, camera: new THREE.PerspectiveCamera() })
      ).toThrow('light is required');
    });

    it('throws when camera is not provided', () => {
      expect(() =>
        createShadowSystem({ light: new THREE.DirectionalLight(), camera: null as any })
      ).toThrow('camera is required');
    });

    it('throws when cascades < 1', () => {
      expect(() =>
        createShadowSystem({
          light: new THREE.DirectionalLight(),
          camera: new THREE.PerspectiveCamera(),
          cascades: 0,
        })
      ).toThrow('cascades must be between 1 and 4');
    });

    it('throws when cascades > 4', () => {
      expect(() =>
        createShadowSystem({
          light: new THREE.DirectionalLight(),
          camera: new THREE.PerspectiveCamera(),
          cascades: 5,
        })
      ).toThrow('cascades must be between 1 and 4');
    });

    it('throws on non-positive shadowMapSize', () => {
      expect(() =>
        createShadowSystem({
          light: new THREE.DirectionalLight(),
          camera: new THREE.PerspectiveCamera(),
          shadowMapSize: 0,
        })
      ).toThrow('shadowMapSize must be a positive integer');
    });

    it('throws on non-integer shadowMapSize', () => {
      expect(() =>
        createShadowSystem({
          light: new THREE.DirectionalLight(),
          camera: new THREE.PerspectiveCamera(),
          shadowMapSize: 1.5,
        })
      ).toThrow('shadowMapSize must be a positive integer');
    });

    it('throws on non-positive maxDistance', () => {
      expect(() =>
        createShadowSystem({
          light: new THREE.DirectionalLight(),
          camera: new THREE.PerspectiveCamera(),
          maxDistance: 0,
        })
      ).toThrow('maxDistance must be positive');
    });

    it('creates a shadow system with correct structure', () => {
      const light = new THREE.DirectionalLight();
      const camera = new THREE.PerspectiveCamera();
      const system = createShadowSystem({ light, camera });

      expect(system).toHaveProperty('light');
      expect(system).toHaveProperty('update');
      expect(system).toHaveProperty('dispose');
      expect(system.light).toBe(light);
    });

    it('enables castShadow on the light', () => {
      const light = new THREE.DirectionalLight();
      const camera = new THREE.PerspectiveCamera();
      createShadowSystem({ light, camera });
      expect(light.castShadow).toBe(true);
    });

    it('sets shadow map size', () => {
      const light = new THREE.DirectionalLight();
      const camera = new THREE.PerspectiveCamera();
      createShadowSystem({ light, camera, shadowMapSize: 4096 });
      expect(light.shadow.mapSize.width).toBe(4096);
      expect(light.shadow.mapSize.height).toBe(4096);
    });

    it('sets shadow bias and normalBias', () => {
      const light = new THREE.DirectionalLight();
      const camera = new THREE.PerspectiveCamera();
      createShadowSystem({ light, camera, shadowBias: -0.001, shadowNormalBias: 0.05 });
      expect(light.shadow.bias).toBe(-0.001);
      expect(light.shadow.normalBias).toBe(0.05);
    });

    it('sets shadow radius when soft shadows enabled', () => {
      const light = new THREE.DirectionalLight();
      const camera = new THREE.PerspectiveCamera();
      createShadowSystem({ light, camera, enableSoftShadows: true, shadowRadius: 8 });
      expect(light.shadow.radius).toBe(8);
    });

    it('sets shadow radius to 0 when soft shadows disabled', () => {
      const light = new THREE.DirectionalLight();
      const camera = new THREE.PerspectiveCamera();
      createShadowSystem({ light, camera, enableSoftShadows: false });
      expect(light.shadow.radius).toBe(0);
    });

    it('dispose disables castShadow', () => {
      const light = new THREE.DirectionalLight();
      const camera = new THREE.PerspectiveCamera();
      const system = createShadowSystem({ light, camera });
      system.dispose();
      expect(light.castShadow).toBe(false);
    });
  });

  describe('createContactShadows', () => {
    it('returns a ShaderMaterial', () => {
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const material = createContactShadows({} as any, {} as any, camera);
      expect(material).toBeInstanceOf(THREE.ShaderMaterial);
    });

    it('has expected uniforms', () => {
      const camera = new THREE.PerspectiveCamera(75, 1, 0.5, 500);
      const material = createContactShadows({} as any, {} as any, camera);
      expect(material.uniforms).toHaveProperty('uDepthTexture');
      expect(material.uniforms).toHaveProperty('uCameraNear');
      expect(material.uniforms).toHaveProperty('uCameraFar');
      expect(material.uniforms).toHaveProperty('uContactShadowDistance');
      expect(material.uniforms).toHaveProperty('uContactShadowBias');
    });

    it('uses camera near/far values', () => {
      const camera = new THREE.PerspectiveCamera(75, 1, 0.5, 500);
      const material = createContactShadows({} as any, {} as any, camera);
      expect(material.uniforms.uCameraNear.value).toBe(0.5);
      expect(material.uniforms.uCameraFar.value).toBe(500);
    });

    it('is transparent with no depth write', () => {
      const camera = new THREE.PerspectiveCamera();
      const material = createContactShadows({} as any, {} as any, camera);
      expect(material.transparent).toBe(true);
      expect(material.depthWrite).toBe(false);
    });
  });
});
