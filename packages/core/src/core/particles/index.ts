/**
 * High-Performance GPU-Based Particle System.
 *
 * Provides specialized classes and types for rendering thousands of particles
 * using GPU instancing. Features customizable emission shapes, physics forces,
 * and time-based behavioral modifiers.
 *
 * The system is split by responsibility:
 * - `./types` — configuration interfaces, no runtime behaviour.
 * - `./noise` — value noise driving turbulence. Renderer-free.
 * - `./emission` — emission-volume sampling. Vector math only.
 * - `./shaders` — GLSL program source.
 * - `./emitter` — the instanced mesh, buffers and per-frame update loop.
 *
 * @packageDocumentation
 * @module core/particles
 * @category Effects & Atmosphere
 */

export {
  applyVariance,
  computeEmitPosition,
  computeEmitVelocity,
  orientToDirection,
  type RandomSource,
  sampleShapePosition,
} from './emission';
export { createParticleEmitter, ParticleEmitterCore } from './emitter';
export { noise3D } from './noise';
export {
  MAX_GRADIENT_STOPS,
  particleFragmentShader,
  particleVertexShader,
} from './shaders';
export type {
  EmissionShape,
  EmitterShapeParams,
  ParticleBehavior,
  ParticleEmitterConfig,
  ParticleForces,
} from './types';

import { ParticleEmitterCore } from './emitter';

/**
 * @deprecated Use `ParticleEmitterCore` instead. This alias will be removed in v2.0.
 * @category Effects & Atmosphere
 */
export { ParticleEmitterCore as ParticleEmitter };

/**
 * Type alias for backwards compatibility.
 * @deprecated Use `ParticleEmitterCore` instead.
 */
export type ParticleEmitterType = ParticleEmitterCore;
