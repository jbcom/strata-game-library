import * as THREE from 'three';
import { beforeEach, describe, expect, test } from 'vitest';
import {
    createContactShadows,
    createShadowSystem,
    type ShadowSystemOptions,
} from '../../../src/presets/shadows';

describe('Shadow System', () => {
    let light: THREE.DirectionalLight;
    let camera: THREE.PerspectiveCamera;

    beforeEach(() => {
        light = new THREE.DirectionalLight(0xffffff, 1);
        camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    });

    test('should create shadow system with default options', () => {
        const options: ShadowSystemOptions = {
            light,
            camera,
        };

        const system = createShadowSystem(options);

        expect(system).toBeDefined();
        expect(system.light).toBe(light);
        expect(typeof system.update).toBe('function');
        expect(typeof system.dispose).toBe('function');
        expect(light.castShadow).toBe(true);
    });

    test('should create shadow system with custom options', () => {
        const options: ShadowSystemOptions = {
            light,
            camera,
            cascades: 4,
            shadowMapSize: 4096,
            shadowBias: -0.0002,
            shadowNormalBias: 0.03,
            shadowRadius: 8,
            maxDistance: 200,
            fadeDistance: 20,
            enableSoftShadows: true,
            enableContactShadows: true,
        };

        const system = createShadowSystem(options);

        expect(system).toBeDefined();
        expect(light.shadow.mapSize.width).toBe(4096);
        expect(light.shadow.mapSize.height).toBe(4096);
        expect(light.shadow.bias).toBe(-0.0002);
        expect(light.shadow.normalBias).toBe(0.03);
        expect(light.shadow.radius).toBe(8);
    });

    test('should validate required parameters', () => {
        expect(() => {
            createShadowSystem({ light: null as any, camera });
        }).toThrow('light is required');

        expect(() => {
            createShadowSystem({ light, camera: null as any });
        }).toThrow('camera is required');
    });

    test('should validate cascades', () => {
        expect(() => {
            createShadowSystem({ light, camera, cascades: 0 });
        }).toThrow('cascades must be between 1 and 4');

        expect(() => {
            createShadowSystem({ light, camera, cascades: 5 });
        }).toThrow('cascades must be between 1 and 4');
    });

    test('should validate shadowMapSize', () => {
        expect(() => {
            createShadowSystem({ light, camera, shadowMapSize: 0 });
        }).toThrow('shadowMapSize must be a positive integer');

        expect(() => {
            createShadowSystem({ light, camera, shadowMapSize: -1 });
        }).toThrow('shadowMapSize must be a positive integer');
    });

    test('should validate maxDistance', () => {
        expect(() => {
            createShadowSystem({ light, camera, maxDistance: 0 });
        }).toThrow('maxDistance must be positive');

        expect(() => {
            createShadowSystem({ light, camera, maxDistance: -1 });
        }).toThrow('maxDistance must be positive');
    });

    test('should update shadow system', () => {
        const system = createShadowSystem({ light, camera });
        const scene = new THREE.Scene();
        scene.add(new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshStandardMaterial()));

        expect(() => {
            system.update(camera, scene);
        }).not.toThrow();
    });

    test('should dispose shadow system', () => {
        const system = createShadowSystem({ light, camera });

        expect(() => {
            system.dispose();
        }).not.toThrow();

        expect(light.castShadow).toBe(false);
    });

    test('should configure soft shadows via radius', () => {
        // Note: Shadow type is set on the renderer (renderer.shadowMap.type), not on individual lights.
        // enableSoftShadows controls whether the shadow radius is applied (true) or set to 0 (false).
        const systemSoft = createShadowSystem({
            light,
            camera,
            enableSoftShadows: true,
            shadowRadius: 4,
        });
        // Soft shadows use the radius value
        expect(light.shadow.radius).toBe(4);
        systemSoft.dispose();

        const systemHard = createShadowSystem({
            light,
            camera,
            enableSoftShadows: false,
            shadowRadius: 4,
        });
        // Hard shadows set radius to 0 (renderer.shadowMap.type controls actual shadow type)
        expect(light.shadow.radius).toBe(0);
        systemHard.dispose();
    });

    test('should create contact shadows material', () => {
        if (typeof document === 'undefined') {
            // Skip in node environment
            return;
        }
        const renderer = new THREE.WebGLRenderer();
        const scene = new THREE.Scene();
        const material = createContactShadows(renderer, scene, camera);

        expect(material).toBeInstanceOf(THREE.ShaderMaterial);
        expect(material.uniforms).toBeDefined();
        expect(material.uniforms.uContactShadowDistance).toBeDefined();

        renderer.dispose();
    });
});
