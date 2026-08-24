/**
 * Value noise used to drive particle turbulence.
 *
 * Pure TypeScript with no renderer dependency — this module deliberately does
 * not import three, so turbulence can be reasoned about and tested in
 * isolation from the GPU-bound emitter.
 *
 * @packageDocumentation
 * @module core/particles/noise
 * @category Effects & Atmosphere
 */

/**
 * Hashes a scalar into the unit interval.
 *
 * The classic `fract(sin(n) * large)` construction. Deterministic for a given
 * input, and cheap enough to call eight times per noise sample.
 *
 * @param n - Value to hash.
 * @returns A pseudo-random value in `[0, 1)`.
 * @internal
 */
function hash(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Samples smoothed 3D value noise.
 *
 * Lattice corners are hashed from the integer part of the coordinate and
 * blended with a smoothstep (`3t^2 - 2t^3`) fade, giving a continuous field
 * with no first-derivative discontinuity at cell boundaries.
 *
 * Note that the lattice index is folded into a single scalar
 * (`x + y * 157 + z * 113`), so distinct cells can collide; this is adequate
 * for turbulence jitter but is not a general-purpose noise primitive. For
 * terrain and other structural uses prefer the simplex noise in
 * `core/math/noise`.
 *
 * @param x - Sample coordinate on X.
 * @param y - Sample coordinate on Y.
 * @param z - Sample coordinate on Z, typically animated by time.
 * @returns A value in `[-1, 1]`.
 * @category Effects & Atmosphere
 */
export function noise3D(x: number, y: number, z: number): number {
  const p = Math.floor(x) + Math.floor(y) * 157 + Math.floor(z) * 113;
  const fx = x - Math.floor(x);
  const fy = y - Math.floor(y);
  const fz = z - Math.floor(z);

  const a = hash(p);
  const b = hash(p + 1);
  const c = hash(p + 157);
  const d = hash(p + 158);
  const e = hash(p + 113);
  const f = hash(p + 114);
  const g = hash(p + 270);
  const h = hash(p + 271);

  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const uz = fz * fz * (3 - 2 * fz);

  return (
    (a +
      (b - a) * ux +
      (c - a) * uy +
      (a - b - c + d) * ux * uy +
      (e - a) * uz +
      (a - b - e + f) * ux * uz +
      (a - c - e + g) * uy * uz +
      (-a + b + c - d + e - f - g + h) * ux * uy * uz) *
      2 -
    1
  );
}
