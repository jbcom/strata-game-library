/**
 * Pure tuple vector helpers shared by creature bone geometry and IK solving.
 *
 * Deliberately renderer-free: every function operates on plain number tuples so
 * the geometry and IK layers stay usable without a Three.js dependency.
 *
 * @module CreatureVectorMath
 * @category Entities & Simulation
 */

import type { RuntimeVector3Tuple } from '../runtime-types';

export function addVector(a: RuntimeVector3Tuple, b: RuntimeVector3Tuple): RuntimeVector3Tuple {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function scaleVector(vector: RuntimeVector3Tuple, scale: number): RuntimeVector3Tuple {
  return [vector[0] * scale, vector[1] * scale, vector[2] * scale];
}

export function subtractVector(
  a: RuntimeVector3Tuple,
  b: RuntimeVector3Tuple
): RuntimeVector3Tuple {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function vectorLength(vector: RuntimeVector3Tuple): number {
  return Math.hypot(vector[0], vector[1], vector[2]);
}

export function normalizeVector(vector: RuntimeVector3Tuple): RuntimeVector3Tuple {
  const length = vectorLength(vector);

  return length <= 0 ? [0, 0, 0] : scaleVector(vector, 1 / length);
}

export function offsetToward(
  from: RuntimeVector3Tuple,
  to: RuntimeVector3Tuple,
  distance: number
): RuntimeVector3Tuple {
  return addVector(from, scaleVector(normalizeVector(subtractVector(to, from)), distance));
}

export function distance3(a: RuntimeVector3Tuple, b: RuntimeVector3Tuple): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
