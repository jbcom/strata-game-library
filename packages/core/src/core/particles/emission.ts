/**
 * Emission-volume sampling for particle spawning.
 *
 * Given a shape and its parameters, these functions pick where a new particle
 * appears and which way it sets off. They are free functions rather than
 * emitter methods so each shape branch can be exercised directly, and they
 * take an explicit `random` source so a test can pin the sample instead of
 * asserting on a distribution.
 *
 * @packageDocumentation
 * @module core/particles/emission
 * @category Effects & Atmosphere
 */

import * as THREE from 'three';
import type { EmissionShape, EmitterShapeParams } from './types';

/**
 * Source of uniform random values in `[0, 1)`.
 *
 * Defaults to `Math.random` everywhere it is accepted; pass a deterministic
 * generator to make emission reproducible.
 *
 * @category Effects & Atmosphere
 */
export type RandomSource = () => number;

/** Canonical "up" axis that directional shapes are defined against. */
const UP = new THREE.Vector3(0, 1, 0);

/**
 * Whether a direction differs from the canonical `+Y` axis.
 *
 * When it does not, the orienting quaternion is identity and can be skipped.
 *
 * @param direction - Candidate orientation.
 * @returns `true` when a rotation is required.
 * @internal
 */
function needsReorientation(direction: THREE.Vector3): boolean {
  return direction.y !== 1 || direction.x !== 0 || direction.z !== 0;
}

/**
 * Rotates a `+Y`-relative vector onto an arbitrary direction, in place.
 *
 * A zero-length or non-finite direction cannot define an orientation, so the
 * vector is left untouched rather than being turned into `NaN` by normalizing
 * a degenerate axis.
 *
 * @param vector - Vector to reorient; mutated and returned.
 * @param direction - Target axis. Need not be normalized.
 * @returns The same `vector` instance.
 * @category Effects & Atmosphere
 */
export function orientToDirection(vector: THREE.Vector3, direction: THREE.Vector3): THREE.Vector3 {
  if (!needsReorientation(direction)) return vector;

  const length = direction.length();
  if (!Number.isFinite(length) || length === 0) return vector;

  const quaternion = new THREE.Quaternion().setFromUnitVectors(
    UP,
    direction.clone().divideScalar(length)
  );
  return vector.applyQuaternion(quaternion);
}

/**
 * Samples a point inside an emission volume, in emitter-local space.
 *
 * - `point` yields the origin.
 * - `box` samples uniformly across the width/height/depth extents, centred.
 * - `sphere` samples the surface of the radius, using `acos(2u - 1)` so points
 *   are distributed evenly rather than bunching at the poles.
 * - `cone` samples a point along the cone's axis at height `t * height` with
 *   radius `t * radius`, then reorients it onto `direction`.
 *
 * @param shape - Emission volume kind.
 * @param params - Dimensions for the chosen shape. Missing values default to 1.
 * @param random - Uniform source in `[0, 1)`.
 * @returns A freshly allocated local-space position.
 * @category Effects & Atmosphere
 */
export function sampleShapePosition(
  shape: EmissionShape,
  params: EmitterShapeParams = {},
  random: RandomSource = Math.random
): THREE.Vector3 {
  const position = new THREE.Vector3(0, 0, 0);

  switch (shape) {
    case 'point':
      break;

    case 'box': {
      const w = params.width ?? 1;
      const h = params.height ?? 1;
      const d = params.depth ?? 1;
      position.set((random() - 0.5) * w, (random() - 0.5) * h, (random() - 0.5) * d);
      break;
    }

    case 'sphere': {
      const r = params.radius ?? 1;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      break;
    }

    case 'cone': {
      const r = params.radius ?? 1;
      const height = params.height ?? 1;

      const t = random();
      const coneRadius = r * t;
      const theta = random() * Math.PI * 2;

      position.set(coneRadius * Math.cos(theta), height * t, coneRadius * Math.sin(theta));
      orientToDirection(position, params.direction ?? UP);
      break;
    }
  }

  return position;
}

/**
 * Applies a symmetric per-axis jitter to a position.
 *
 * Each axis is offset by up to +/- the corresponding variance component, so a
 * zero variance leaves the position exactly where it was.
 *
 * @param position - Base position; mutated and returned.
 * @param variance - Half-width of the jitter box per axis.
 * @param random - Uniform source in `[0, 1)`.
 * @returns The same `position` instance.
 * @category Effects & Atmosphere
 */
export function applyVariance(
  position: THREE.Vector3,
  variance: THREE.Vector3,
  random: RandomSource = Math.random
): THREE.Vector3 {
  position.x += (random() - 0.5) * 2 * variance.x;
  position.y += (random() - 0.5) * 2 * variance.y;
  position.z += (random() - 0.5) * 2 * variance.z;
  return position;
}

/**
 * Computes a spawn position in world space.
 *
 * Composes {@link sampleShapePosition} with the emitter origin and the
 * positional jitter.
 *
 * @param options - Shape, emitter origin and jitter.
 * @param random - Uniform source in `[0, 1)`.
 * @returns A freshly allocated world-space position.
 * @category Effects & Atmosphere
 */
export function computeEmitPosition(
  options: {
    shape: EmissionShape;
    shapeParams?: EmitterShapeParams;
    position: THREE.Vector3;
    positionVariance: THREE.Vector3;
  },
  random: RandomSource = Math.random
): THREE.Vector3 {
  const sampled = sampleShapePosition(options.shape, options.shapeParams ?? {}, random);
  sampled.add(options.position);
  return applyVariance(sampled, options.positionVariance, random);
}

/**
 * Computes the initial velocity for a newly spawned particle.
 *
 * For every shape but `cone` this is the base velocity plus a symmetric
 * per-axis jitter. A `cone` instead discards that vector and emits along a
 * direction sampled within the cone's opening `angle`, rescaled to the base
 * velocity's magnitude — so a cone emitter with zero-length base velocity
 * produces stationary particles regardless of its variance.
 *
 * @param options - Base velocity, jitter, shape and shape parameters.
 * @param random - Uniform source in `[0, 1)`.
 * @returns A freshly allocated velocity vector.
 * @category Effects & Atmosphere
 */
export function computeEmitVelocity(
  options: {
    velocity: THREE.Vector3;
    velocityVariance: THREE.Vector3;
    shape: EmissionShape;
    shapeParams?: EmitterShapeParams;
  },
  random: RandomSource = Math.random
): THREE.Vector3 {
  const { velocity, velocityVariance, shape } = options;
  const shapeParams = options.shapeParams ?? {};

  const result = velocity.clone();
  applyVariance(result, velocityVariance, random);

  if (shape === 'cone') {
    const angle = shapeParams.angle ?? Math.PI / 4;

    const theta = random() * Math.PI * 2;
    const phi = random() * angle;

    const coneVelocity = new THREE.Vector3(
      Math.sin(phi) * Math.cos(theta),
      Math.cos(phi),
      Math.sin(phi) * Math.sin(theta)
    );

    orientToDirection(coneVelocity, shapeParams.direction ?? UP);
    return coneVelocity.multiplyScalar(velocity.length());
  }

  return result;
}
