import { describe, expect, it } from 'vitest';
import * as particles from '../index';

/**
 * The exact runtime export surface `src/core/particles.ts` had before it was
 * split into a directory. `src/core/index.ts` re-exports this module with
 * `export *`, and both adapters/r3f and packages/presets import from it, so
 * losing any of these names is a breaking change for published consumers.
 */
const PRE_SPLIT_EXPORTS = ['ParticleEmitter', 'ParticleEmitterCore', 'createParticleEmitter'];

describe('core/particles public API', () => {
  it('still exports every symbol the single-file module exported', () => {
    for (const name of PRE_SPLIT_EXPORTS) {
      expect(particles).toHaveProperty(name);
    }
  });

  it('keeps the deprecated ParticleEmitter alias pointing at the core class', () => {
    expect(particles.ParticleEmitter).toBe(particles.ParticleEmitterCore);
  });

  it('exposes the factory as a callable that builds the core class', () => {
    const emitter = particles.createParticleEmitter({ maxParticles: 4 });
    expect(emitter).toBeInstanceOf(particles.ParticleEmitterCore);
    emitter.dispose();
  });

  it('additionally exposes the extracted helpers', () => {
    for (const name of [
      'noise3D',
      'sampleShapePosition',
      'computeEmitPosition',
      'computeEmitVelocity',
      'applyVariance',
      'orientToDirection',
      'particleVertexShader',
      'particleFragmentShader',
      'MAX_GRADIENT_STOPS',
    ]) {
      expect(particles).toHaveProperty(name);
    }
  });

  it('exports nothing unexpected beyond the documented surface', () => {
    const expected = new Set([
      ...PRE_SPLIT_EXPORTS,
      'noise3D',
      'sampleShapePosition',
      'computeEmitPosition',
      'computeEmitVelocity',
      'applyVariance',
      'orientToDirection',
      'particleVertexShader',
      'particleFragmentShader',
      'MAX_GRADIENT_STOPS',
    ]);
    for (const name of Object.keys(particles)) {
      expect(expected).toContain(name);
    }
  });
});
