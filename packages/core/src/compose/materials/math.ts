/**
 * Shared scalar helpers for the material system.
 *
 * These are deliberately dependency-free so that trait inference, procedural
 * planning, and CPU bake rasterization can share one definition of clamping
 * and interpolation without importing each other.
 *
 * @module MaterialMath
 * @category Entities & Simulation
 */

/** Clamps a value into the inclusive `[0, 1]` range. */
export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Returns the fractional part of a value, matching GLSL `fract` for negatives. */
export function fract(value: number): number {
  return value - Math.floor(value);
}

/** Linearly interpolates between `a` and `b`. */
export function mix(a: number, b: number, value: number): number {
  return a * (1 - value) + b * value;
}

/** GLSL-compatible `smoothstep` with Hermite interpolation between two edges. */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));

  return t * t * (3 - 2 * t);
}
