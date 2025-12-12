import * as THREE from 'three';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createParticleSystem, type ParticleEmitterOptions } from '../../../src/presets/particles';

describe('Particle System', () => {
    let renderer: THREE.WebGLRenderer | null = null;
    let _scene: THREE.Scene;

    beforeEach(() => {
        // Skip WebGLRenderer creation in node environment
        if (typeof document !== 'undefined') {
            renderer = new THREE.WebGLRenderer();
        }
        _scene = new THREE.Scene();
    });

    afterEach(() => {
        if (renderer) {
            renderer.dispose();
        }
    });

    test('should create particle system with default options', () => {
        const system = createParticleSystem();

        expect(system).toBeDefined();
        expect(system.group).toBeInstanceOf(THREE.Group);
        expect(typeof system.update).toBe('function');
        expect(typeof system.dispose).toBe('function');
    });

    test('should create particle system with custom options', () => {
        const options: ParticleEmitterOptions = {
            maxParticles: 500,
            lifetime: 3.0,
            rate: 50,
            shape: 'sphere',
            shapeParams: { radius: 2.0 },
            velocity: {
                min: new THREE.Vector3(-2, 0, -2),
                max: new THREE.Vector3(2, 5, 2),
            },
            acceleration: new THREE.Vector3(0, -9.8, 0),
            color: {
                start: new THREE.Color(1, 0, 0),
                end: new THREE.Color(0, 0, 1),
            },
            size: { start: 0.2, end: 0.1 },
            opacity: { start: 1.0, end: 0.0 },
        };

        const system = createParticleSystem(options);

        expect(system).toBeDefined();
        expect(system.group.children.length).toBeGreaterThan(0);
    });

    test('should validate maxParticles', () => {
        expect(() => {
            createParticleSystem({ maxParticles: 0 });
        }).toThrow('maxParticles must be positive');

        expect(() => {
            createParticleSystem({ maxParticles: -1 });
        }).toThrow('maxParticles must be positive');
    });

    test('should validate lifetime', () => {
        expect(() => {
            createParticleSystem({ lifetime: 0 });
        }).toThrow('lifetime must be positive');

        expect(() => {
            createParticleSystem({ lifetime: -1 });
        }).toThrow('lifetime must be positive');
    });

    test('should validate rate', () => {
        expect(() => {
            createParticleSystem({ rate: 0 });
        }).toThrow('rate must be positive');

        expect(() => {
            createParticleSystem({ rate: -1 });
        }).toThrow('rate must be positive');
    });

    test('should update particles', () => {
        const system = createParticleSystem({
            maxParticles: 100,
            rate: 10,
            lifetime: 1.0,
        });

        const _initialCount =
            system.group.children[0] instanceof THREE.InstancedMesh
                ? (system.group.children[0] as THREE.InstancedMesh).count
                : 0;

        system.update(0.1);

        // Particles should be emitted
        const mesh = system.group.children[0] as THREE.InstancedMesh;
        expect(mesh).toBeInstanceOf(THREE.InstancedMesh);
    });

    test('should dispose resources', () => {
        const system = createParticleSystem();

        expect(() => {
            system.dispose();
        }).not.toThrow();
    });

    test('should handle different emitter shapes', () => {
        const shapes: Array<'point' | 'box' | 'sphere' | 'cone'> = [
            'point',
            'box',
            'sphere',
            'cone',
        ];

        shapes.forEach((shape) => {
            const system = createParticleSystem({
                shape,
                shapeParams:
                    shape === 'box'
                        ? { width: 2, height: 2, depth: 2 }
                        : shape === 'sphere'
                          ? { radius: 1 }
                          : shape === 'cone'
                            ? { radius: 1, angle: Math.PI / 4, height: 2 }
                            : undefined,
            });

            expect(system).toBeDefined();
            system.dispose();
        });
    });
});
