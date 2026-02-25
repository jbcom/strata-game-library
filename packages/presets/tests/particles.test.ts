import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  createParticleSystem,
  explosionPreset,
  firePreset,
  magicPreset,
  particlePresets,
  smokePreset,
  sparklePreset,
  sparksPreset,
} from '../src/particles';

describe('particle presets', () => {
  describe('particlePresets record', () => {
    it('contains all 6 presets', () => {
      expect(Object.keys(particlePresets)).toHaveLength(6);
    });

    it('maps keys correctly', () => {
      expect(particlePresets.fire).toBe(firePreset);
      expect(particlePresets.smoke).toBe(smokePreset);
      expect(particlePresets.sparks).toBe(sparksPreset);
      expect(particlePresets.magic).toBe(magicPreset);
      expect(particlePresets.sparkle).toBe(sparklePreset);
      expect(particlePresets.explosion).toBe(explosionPreset);
    });

    it('sparkle is an alias for magic', () => {
      expect(sparklePreset).toBe(magicPreset);
    });
  });

  describe('preset structure', () => {
    const presetNames = Object.keys(particlePresets);

    it.each(presetNames)('preset "%s" has required fields', (name) => {
      const preset = particlePresets[name as keyof typeof particlePresets];
      expect(preset).toHaveProperty('name');
      expect(preset).toHaveProperty('maxParticles');
      expect(preset).toHaveProperty('emissionRate');
      expect(preset).toHaveProperty('lifetime');
      expect(preset).toHaveProperty('position');
      expect(preset).toHaveProperty('velocity');
      expect(preset).toHaveProperty('startColor');
      expect(preset).toHaveProperty('endColor');
      expect(preset).toHaveProperty('startSize');
      expect(preset).toHaveProperty('endSize');
      expect(preset).toHaveProperty('shape');
    });

    it.each(presetNames)('preset "%s" has Vector3 position and velocity', (name) => {
      const preset = particlePresets[name as keyof typeof particlePresets];
      expect(preset.position).toBeInstanceOf(THREE.Vector3);
      expect(preset.velocity).toBeInstanceOf(THREE.Vector3);
    });

    it.each(presetNames)('preset "%s" has positive maxParticles and lifetime', (name) => {
      const preset = particlePresets[name as keyof typeof particlePresets];
      expect(preset.maxParticles).toBeGreaterThan(0);
      expect(preset.lifetime).toBeGreaterThan(0);
    });
  });

  describe('fire preset specifics', () => {
    it('has additive blending', () => {
      expect(firePreset.blending).toBe(THREE.AdditiveBlending);
    });

    it('has cone emission shape', () => {
      expect(firePreset.shape).toBe('cone');
    });

    it('has color gradient in behavior', () => {
      expect(firePreset.behavior?.colorGradient).toBeDefined();
      expect(firePreset.behavior!.colorGradient!.length).toBeGreaterThan(0);
    });
  });

  describe('smoke preset specifics', () => {
    it('has normal blending', () => {
      expect(smokePreset.blending).toBe(THREE.NormalBlending);
    });

    it('has sphere emission shape', () => {
      expect(smokePreset.shape).toBe('sphere');
    });

    it('grows over time (endSize > startSize)', () => {
      expect(smokePreset.endSize).toBeGreaterThan(smokePreset.startSize);
    });
  });

  describe('createParticleSystem', () => {
    it('creates a particle system with defaults', () => {
      const system = createParticleSystem();
      expect(system).toHaveProperty('group');
      expect(system).toHaveProperty('update');
      expect(system).toHaveProperty('dispose');
      expect(system.group).toBeInstanceOf(THREE.Group);
    });

    it('creates particle system with custom options', () => {
      const system = createParticleSystem({
        maxParticles: 100,
        lifetime: 1,
        rate: 10,
        shape: 'sphere',
      });
      expect(system.group).toBeInstanceOf(THREE.Group);
    });

    it('throws on non-positive maxParticles', () => {
      expect(() => createParticleSystem({ maxParticles: 0 })).toThrow(
        'maxParticles must be positive'
      );
      expect(() => createParticleSystem({ maxParticles: -1 })).toThrow(
        'maxParticles must be positive'
      );
    });

    it('throws on non-positive lifetime', () => {
      expect(() => createParticleSystem({ lifetime: 0 })).toThrow('lifetime must be positive');
    });

    it('throws on non-positive rate', () => {
      expect(() => createParticleSystem({ rate: 0 })).toThrow('rate must be positive');
    });

    it('update method can be called without error', () => {
      const system = createParticleSystem({ maxParticles: 10, rate: 5 });
      expect(() => system.update(0.016)).not.toThrow();
    });

    it('dispose cleans up resources', () => {
      const system = createParticleSystem({ maxParticles: 10 });
      expect(() => system.dispose()).not.toThrow();
    });
  });
});
