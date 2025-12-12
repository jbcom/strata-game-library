import * as THREE from 'three';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import {
    applyReflectionProbe,
    createEnvironmentMap,
    createReflectionProbe,
    ReflectionProbeManager,
    type ReflectionProbeOptions,
} from '../../../src/presets/reflections';

describe('Reflection Probes', () => {
    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene;
    let _camera: THREE.PerspectiveCamera;

    beforeEach(() => {
        // Skip WebGLRenderer creation in node environment
        if (typeof document !== 'undefined') {
            renderer = new THREE.WebGLRenderer();
        }
        scene = new THREE.Scene();
        _camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    });

    afterEach(() => {
        if (renderer) {
            renderer.dispose();
        }
    });

    test('should create reflection probe with default options', () => {
        if (!renderer) {
            return;
        }
        const options: ReflectionProbeOptions = {
            position: new THREE.Vector3(0, 0, 0),
        };

        const probe = createReflectionProbe(options);

        expect(probe).toBeDefined();
        expect(probe.probe).toBeDefined();
        expect(probe.camera).toBeInstanceOf(THREE.CubeCamera);
        expect(typeof probe.update).toBe('function');
        expect(typeof probe.dispose).toBe('function');
    });

    test('should create reflection probe with custom options', () => {
        const options: ReflectionProbeOptions = {
            position: new THREE.Vector3(5, 10, 5),
            size: 20,
            resolution: 512,
            updateRate: 30,
            boxProjection: true,
            boxSize: new THREE.Vector3(20, 20, 20),
        };

        const probe = createReflectionProbe(options);

        expect(probe).toBeDefined();
        expect(probe.camera.position).toEqual(options.position);
    });

    test('should validate required parameters', () => {
        expect(() => {
            createReflectionProbe({ position: null as any });
        }).toThrow('position is required');
    });

    test('should validate size', () => {
        expect(() => {
            createReflectionProbe({ position: new THREE.Vector3(), size: 0 });
        }).toThrow('size must be positive');

        expect(() => {
            createReflectionProbe({ position: new THREE.Vector3(), size: -1 });
        }).toThrow('size must be positive');
    });

    test('should validate resolution', () => {
        expect(() => {
            createReflectionProbe({ position: new THREE.Vector3(), resolution: 0 });
        }).toThrow('resolution must be a positive integer');

        expect(() => {
            createReflectionProbe({ position: new THREE.Vector3(), resolution: -1 });
        }).toThrow('resolution must be a positive integer');
    });

    test('should validate updateRate', () => {
        expect(() => {
            createReflectionProbe({ position: new THREE.Vector3(), updateRate: -1 });
        }).toThrow('updateRate must be non-negative');
    });

    test('should update reflection probe', () => {
        if (!renderer) {
            return;
        }
        const probe = createReflectionProbe({
            position: new THREE.Vector3(),
            updateRate: 0, // Update every frame
        });

        expect(() => {
            probe.update(renderer!, scene);
        }).not.toThrow();
    });

    test('should dispose reflection probe', () => {
        const probe = createReflectionProbe({ position: new THREE.Vector3() });

        expect(() => {
            probe.dispose();
        }).not.toThrow();
    });

    test('should create environment map', () => {
        if (!renderer) {
            return;
        }
        const position = new THREE.Vector3(0, 0, 0);

        const envMap = createEnvironmentMap(renderer, scene, position, 256);

        expect(envMap).toBeDefined();
        expect(envMap).toBeInstanceOf(THREE.CubeTexture);
    });

    test('should validate environment map parameters', () => {
        if (!renderer) {
            return;
        }
        expect(() => {
            createEnvironmentMap(null as any, scene, new THREE.Vector3());
        }).toThrow('renderer is required');

        expect(() => {
            createEnvironmentMap(renderer, null as any, new THREE.Vector3());
        }).toThrow('scene is required');

        expect(() => {
            createEnvironmentMap(renderer, scene, null as any);
        }).toThrow('position is required');

        expect(() => {
            createEnvironmentMap(renderer, scene, new THREE.Vector3(), 0);
        }).toThrow('resolution must be a positive integer');
    });

    test('should apply reflection probe to material', () => {
        const material = new THREE.MeshStandardMaterial();
        const probe = createReflectionProbe({ position: new THREE.Vector3() }).probe;

        applyReflectionProbe(material, probe, 0.8);

        expect(material.envMap).toBe(probe);
        expect(material.envMapIntensity).toBe(0.8);
    });

    test('should validate applyReflectionProbe parameters', () => {
        const probe = createReflectionProbe({ position: new THREE.Vector3() }).probe;

        expect(() => {
            applyReflectionProbe(null as any, probe);
        }).toThrow('material is required');

        expect(() => {
            applyReflectionProbe(new THREE.MeshStandardMaterial(), null as any);
        }).toThrow('probe is required');

        expect(() => {
            applyReflectionProbe(new THREE.MeshStandardMaterial(), probe, -1);
        }).toThrow('intensity must be between 0 and 1');

        expect(() => {
            applyReflectionProbe(new THREE.MeshStandardMaterial(), probe, 2);
        }).toThrow('intensity must be between 0 and 1');
    });

    test('should create reflection probe manager', () => {
        if (!renderer) {
            return;
        }
        const manager = new ReflectionProbeManager(renderer, scene);

        expect(manager).toBeDefined();
    });

    test('should validate reflection probe manager parameters', () => {
        if (!renderer) {
            return;
        }
        expect(() => {
            new ReflectionProbeManager(null as any, scene);
        }).toThrow('renderer is required');

        expect(() => {
            new ReflectionProbeManager(renderer, null as any);
        }).toThrow('scene is required');
    });

    test('should add and get reflection probe', () => {
        if (!renderer) {
            return;
        }
        const manager = new ReflectionProbeManager(renderer, scene);

        const probe = manager.addProbe('test', {
            position: new THREE.Vector3(),
        });

        expect(probe).toBeDefined();
        expect(manager.getProbe('test')).toBe(probe);
    });

    test('should not allow duplicate probe names', () => {
        if (!renderer) {
            return;
        }
        const manager = new ReflectionProbeManager(renderer, scene);

        manager.addProbe('test', { position: new THREE.Vector3() });

        expect(() => {
            manager.addProbe('test', { position: new THREE.Vector3() });
        }).toThrow('probe "test" already exists');
    });

    test('should remove reflection probe', () => {
        if (!renderer) {
            return;
        }
        const manager = new ReflectionProbeManager(renderer, scene);

        manager.addProbe('test', { position: new THREE.Vector3() });
        manager.removeProbe('test');

        expect(manager.getProbe('test')).toBeUndefined();
    });

    test('should update all probes', () => {
        if (!renderer) {
            return;
        }
        const manager = new ReflectionProbeManager(renderer, scene);

        manager.addProbe('probe1', { position: new THREE.Vector3(0, 0, 0) });
        manager.addProbe('probe2', { position: new THREE.Vector3(10, 0, 10) });

        expect(() => {
            manager.update();
        }).not.toThrow();
    });

    test('should dispose all probes', () => {
        if (!renderer) {
            return;
        }
        const manager = new ReflectionProbeManager(renderer, scene);

        manager.addProbe('probe1', { position: new THREE.Vector3() });
        manager.addProbe('probe2', { position: new THREE.Vector3() });

        expect(() => {
            manager.dispose();
        }).not.toThrow();

        expect(manager.getProbe('probe1')).toBeUndefined();
        expect(manager.getProbe('probe2')).toBeUndefined();
    });
});
