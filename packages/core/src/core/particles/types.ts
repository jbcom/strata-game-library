/**
 * Particle system configuration types.
 *
 * Pure type declarations for emitter configuration — no runtime behaviour.
 *
 * @packageDocumentation
 * @module core/particles/types
 * @category Effects & Atmosphere
 */

import type * as THREE from 'three';

/** Valid shapes for particle emission volumes. @category Effects & Atmosphere */
export type EmissionShape = 'point' | 'sphere' | 'cone' | 'box';

/**
 * Configuration for physics forces applied to particles.
 * @category Effects & Atmosphere
 */
export interface ParticleForces {
  /** Global gravity vector applied per frame. */
  gravity?: THREE.Vector3;
  /** Wind vector applied per frame. */
  wind?: THREE.Vector3;
  /** Magnitude of random turbulence. */
  turbulence?: number;
  /** Spatial scale of the turbulence noise. */
  turbulenceScale?: number;
  /** Temporal speed of the turbulence animation. */
  turbulenceSpeed?: number;
}

/**
 * Behavioral modifiers for particle lifecycle.
 * @category Effects & Atmosphere
 */
export interface ParticleBehavior {
  /** Time in seconds to fade from 0 to full opacity. */
  fadeIn?: number;
  /** Time in seconds to fade from full to 0 opacity before death. */
  fadeOut?: number;
  /** Whether particles shrink over their lifetime. */
  shrink?: boolean;
  /** Normalized age (0-1) at which shrinking begins. */
  shrinkStart?: number;
  /** Array of colors to interpolate through over lifetime. */
  colorGradient?: THREE.Color[];
  /** Normalized age stops (0-1) for color gradient interpolation. */
  colorGradientStops?: number[];
  /** Whether particles rotate over time. */
  spin?: boolean;
  /** Speed of rotation in radians per second. */
  spinSpeed?: number;
}

/**
 * Dimensions and configuration for emission shapes.
 * @category Effects & Atmosphere
 */
export interface EmitterShapeParams {
  /** Width for 'box' shape. */
  width?: number;
  /** Height for 'box' and 'cone' shapes. */
  height?: number;
  /** Depth for 'box' shape. */
  depth?: number;
  /** Radius for 'sphere' and 'cone' shapes. */
  radius?: number;
  /** Opening angle for 'cone' shape in radians. */
  angle?: number;
  /** Orientation vector for directional shapes. */
  direction?: THREE.Vector3;
}

/**
 * Complete configuration for a particle emitter.
 * @category Effects & Atmosphere
 */
export interface ParticleEmitterConfig {
  /** Maximum number of concurrent particles. */
  maxParticles?: number;
  /** Number of particles to spawn per second. */
  emissionRate?: number;
  /** Base particle lifetime in seconds. */
  lifetime?: number;
  /** Random variance applied to lifetime. */
  lifetimeVariance?: number;
  /** World position of the emitter. */
  position?: THREE.Vector3;
  /** Random variance applied to spawn position. */
  positionVariance?: THREE.Vector3;
  /** Initial velocity vector. */
  velocity?: THREE.Vector3;
  /** Random variance applied to initial velocity. */
  velocityVariance?: THREE.Vector3;
  /** Color at time of spawn. */
  startColor?: THREE.ColorRepresentation;
  /** Color at time of death (if no gradient is used). */
  endColor?: THREE.ColorRepresentation;
  /** Size at time of spawn. */
  startSize?: number;
  /** Size at time of death. */
  endSize?: number;
  /** Random variance applied to initial size. */
  sizeVariance?: number;
  /** Opacity at time of spawn (0-1). */
  startOpacity?: number;
  /** Opacity at time of death (0-1). */
  endOpacity?: number;
  /** Geometric volume for emission. */
  shape?: EmissionShape;
  /** Parameters for the selected emission shape. */
  shapeParams?: EmitterShapeParams;
  /** Physical forces applied to particles. */
  forces?: ParticleForces;
  /** Lifecycle behavioral modifiers. */
  behavior?: ParticleBehavior;
  /** Optional texture for particle sprites. */
  texture?: THREE.Texture;
  /** GPU blending mode. */
  blending?: THREE.Blending;
  /** Whether particles write to the depth buffer. */
  depthWrite?: boolean;
  /** Whether to sort particles by depth. */
  sortParticles?: boolean;
}

/**
 * Internal per-particle simulation state.
 *
 * Not part of the public API surface — exported only so the emitter and the
 * simulation helpers can share one definition.
 *
 * @internal
 */
export interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  age: number;
  lifetime: number;
  startSize: number;
  rotation: number;
  rotationSpeed: number;
  colorIndex: number;
  active: boolean;
}
