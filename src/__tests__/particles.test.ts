import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as THREE from 'three';
import {
    ParticleEmitter,
    createParticleEmitter,
    EmissionShape,
    ParticleBehavior,
    ParticleForces,
    ParticleEmitterConfig,
} from '../core/particles';

describe('ParticleEmitter', () => {
    describe('instantiation', () => {
        it('should create a ParticleEmitter with default config', () => {
            const emitter = new ParticleEmitter({});
            expect(emitter).toBeDefined();
            expect(emitter.mesh).toBeDefined();
        });

        it('should create a ParticleEmitter with custom maxParticles', () => {
            const emitter = new ParticleEmitter({ maxParticles: 500 });
            expect(emitter).toBeDefined();
        });

        it('should create a ParticleEmitter with custom emission rate', () => {
            const emitter = new ParticleEmitter({ emissionRate: 100 });
            expect(emitter).toBeDefined();
        });

        it('should create a ParticleEmitter with custom lifetime', () => {
            const emitter = new ParticleEmitter({ lifetime: 5.0, lifetimeVariance: 0.5 });
            expect(emitter).toBeDefined();
        });

        it('should create a ParticleEmitter with custom colors', () => {
            const emitter = new ParticleEmitter({
                startColor: 0xff0000,
                endColor: 0x0000ff,
            });
            expect(emitter).toBeDefined();
        });

        it('should throw error for non-positive maxParticles', () => {
            expect(() => new ParticleEmitter({ maxParticles: 0 })).toThrow();
            expect(() => new ParticleEmitter({ maxParticles: -1 })).toThrow();
        });

        it('should throw error for non-positive lifetime', () => {
            expect(() => new ParticleEmitter({ lifetime: 0 })).toThrow();
            expect(() => new ParticleEmitter({ lifetime: -1 })).toThrow();
        });

        it('should throw error for negative emissionRate', () => {
            expect(() => new ParticleEmitter({ emissionRate: -1 })).toThrow();
        });
    });

    describe('emission shapes', () => {
        it('should emit from point shape', () => {
            const emitter = new ParticleEmitter({ shape: 'point' });
            expect(emitter).toBeDefined();
        });

        it('should emit from sphere shape', () => {
            const emitter = new ParticleEmitter({
                shape: 'sphere',
                shapeParams: { radius: 2.0 },
            });
            expect(emitter).toBeDefined();
        });

        it('should emit from cone shape', () => {
            const emitter = new ParticleEmitter({
                shape: 'cone',
                shapeParams: { radius: 1.0, angle: Math.PI / 4, height: 2.0 },
            });
            expect(emitter).toBeDefined();
        });

        it('should emit from box shape', () => {
            const emitter = new ParticleEmitter({
                shape: 'box',
                shapeParams: { width: 2.0, height: 1.0, depth: 1.5 },
            });
            expect(emitter).toBeDefined();
        });

        it('should use default shape params when not specified', () => {
            const emitter = new ParticleEmitter({ shape: 'sphere' });
            expect(emitter).toBeDefined();
        });
    });

    describe('particle behaviors', () => {
        it('should apply fade behavior', () => {
            const behavior: ParticleBehavior = {
                fadeIn: 0.2,
                fadeOut: 0.3,
            };
            const emitter = new ParticleEmitter({ behavior });
            expect(emitter).toBeDefined();
        });

        it('should apply shrink behavior', () => {
            const behavior: ParticleBehavior = {
                shrink: true,
                shrinkStart: 0.5,
            };
            const emitter = new ParticleEmitter({ behavior });
            expect(emitter).toBeDefined();
        });

        it('should apply color gradient behavior', () => {
            const behavior: ParticleBehavior = {
                colorGradient: [
                    new THREE.Color(0xffffff),
                    new THREE.Color(0xff0000),
                    new THREE.Color(0x000000),
                ],
                colorGradientStops: [0, 0.5, 1.0],
            };
            const emitter = new ParticleEmitter({ behavior });
            expect(emitter).toBeDefined();
        });

        it('should apply spin behavior', () => {
            const behavior: ParticleBehavior = {
                spin: true,
                spinSpeed: 2.0,
            };
            const emitter = new ParticleEmitter({ behavior });
            expect(emitter).toBeDefined();
        });
    });

    describe('particle forces', () => {
        it('should apply gravity force', () => {
            const forces: ParticleForces = {
                gravity: new THREE.Vector3(0, -9.8, 0),
            };
            const emitter = new ParticleEmitter({ forces });
            expect(emitter).toBeDefined();
        });

        it('should apply wind force', () => {
            const forces: ParticleForces = {
                wind: new THREE.Vector3(1, 0, 0),
            };
            const emitter = new ParticleEmitter({ forces });
            expect(emitter).toBeDefined();
        });

        it('should apply turbulence', () => {
            const forces: ParticleForces = {
                turbulence: 2.0,
                turbulenceScale: 1.5,
                turbulenceSpeed: 1.0,
            };
            const emitter = new ParticleEmitter({ forces });
            expect(emitter).toBeDefined();
        });
    });

    describe('emitter methods', () => {
        it('should update particles', () => {
            const emitter = new ParticleEmitter({ emissionRate: 10 });
            expect(() => emitter.update(0.016)).not.toThrow();
        });

        it('should burst particles', () => {
            const emitter = new ParticleEmitter({});
            expect(() => emitter.burst(50)).not.toThrow();
        });

        it('should emit particles', () => {
            const emitter = new ParticleEmitter({});
            expect(() => emitter.emit(10)).not.toThrow();
        });

        it('should reset particles', () => {
            const emitter = new ParticleEmitter({ emissionRate: 10 });
            emitter.update(1.0);
            emitter.reset();
            expect(emitter.activeParticleCount).toBe(0);
        });

        it('should set position', () => {
            const emitter = new ParticleEmitter({});
            expect(() => emitter.setPosition(new THREE.Vector3(1, 2, 3))).not.toThrow();
        });

        it('should set emission rate', () => {
            const emitter = new ParticleEmitter({ emissionRate: 10 });
            expect(() => emitter.setEmissionRate(50)).not.toThrow();
        });

        it('should dispose resources', () => {
            const emitter = new ParticleEmitter({});
            expect(() => emitter.dispose()).not.toThrow();
        });

        it('should return group containing mesh', () => {
            const emitter = new ParticleEmitter({});
            const group = emitter.group;
            expect(group).toBeInstanceOf(THREE.Group);
        });

        it('should track active particle count', () => {
            const emitter = new ParticleEmitter({ emissionRate: 100 });
            emitter.update(0.1);
            expect(emitter.activeParticleCount).toBeGreaterThanOrEqual(0);
        });
    });
});

describe('createParticleEmitter', () => {
    it('should create emitter with factory function', () => {
        const emitter = createParticleEmitter({
            maxParticles: 100,
            emissionRate: 20,
        });
        expect(emitter).toBeInstanceOf(ParticleEmitter);
    });

    it('should create emitter with position', () => {
        const emitter = createParticleEmitter({
            position: new THREE.Vector3(1, 2, 3),
        });
        expect(emitter).toBeDefined();
    });

    it('should create emitter without arguments', () => {
        const emitter = createParticleEmitter();
        expect(emitter).toBeInstanceOf(ParticleEmitter);
    });
});

describe('EmissionShape types', () => {
    it('should accept point shape', () => {
        const shape: EmissionShape = 'point';
        expect(shape).toBe('point');
    });

    it('should accept sphere shape', () => {
        const shape: EmissionShape = 'sphere';
        expect(shape).toBe('sphere');
    });

    it('should accept cone shape', () => {
        const shape: EmissionShape = 'cone';
        expect(shape).toBe('cone');
    });

    it('should accept box shape', () => {
        const shape: EmissionShape = 'box';
        expect(shape).toBe('box');
    });
});

describe('Particle Presets', () => {
    it('should have fire preset with expected properties', async () => {
        const { firePreset } = await import('../presets/particles');
        expect(firePreset).toBeDefined();
        expect(firePreset.name).toBe('fire');
        expect(firePreset.maxParticles).toBe(500);
    });

    it('should have smoke preset with sphere shape', async () => {
        const { smokePreset } = await import('../presets/particles');
        expect(smokePreset).toBeDefined();
        expect(smokePreset.name).toBe('smoke');
        expect(smokePreset.shape).toBe('sphere');
    });

    it('should have sparks preset with point shape', async () => {
        const { sparksPreset } = await import('../presets/particles');
        expect(sparksPreset).toBeDefined();
        expect(sparksPreset.name).toBe('sparks');
        expect(sparksPreset.shape).toBe('point');
    });

    it('should have magic preset with additive blending', async () => {
        const { magicPreset } = await import('../presets/particles');
        expect(magicPreset).toBeDefined();
        expect(magicPreset.name).toBe('magic');
        expect(magicPreset.blending).toBe(THREE.AdditiveBlending);
    });

    it('should have explosion preset with burst emission', async () => {
        const { explosionPreset } = await import('../presets/particles');
        expect(explosionPreset).toBeDefined();
        expect(explosionPreset.name).toBe('explosion');
        expect(explosionPreset.emissionRate).toBe(0);
    });

    it('should create emitter from preset name', async () => {
        const { createFromPreset } = await import('../presets/particles');
        const emitter = createFromPreset('fire');
        expect(emitter).toBeInstanceOf(ParticleEmitter);
    });

    it('should throw error for unknown preset', async () => {
        const { createFromPreset } = await import('../presets/particles');
        expect(() => createFromPreset('unknown' as any)).toThrow('Unknown particle preset');
    });

    it('should create emitter with preset overrides', async () => {
        const { createFromPreset } = await import('../presets/particles');
        const emitter = createFromPreset('fire', { maxParticles: 100 });
        expect(emitter).toBeDefined();
    });
});
