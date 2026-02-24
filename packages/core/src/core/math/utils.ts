/**
 * Core Mathematical Utilities and Game Helpers.
 *
 * Provides specialized math functions for game development, including interpolation,
 * range mapping, smoothing, and geometric calculations. Re-exports high-performance
 * utilities from the `maath` library.
 *
 * @packageDocumentation
 * @module core/math/utils
 * @category World Building
 */

import * as maathMisc from 'maath/misc';
import * as maathRandom from 'maath/random';
import type { Range, Vec2Like, Vec3Like } from './types';

/**
 * Re-export maath misc utilities.
 * Includes: clamp, lerp, remap, smoothstep, etc.
 * @category World Building
 */
export { maathMisc as misc };

/**
 * Re-export maath random utilities.
 * Includes: random distributions, vector randomization.
 * @category World Building
 */
export { maathRandom as random };

/**
 * Linear interpolation between two values
 *
 * @param a - Start value
 * @param b - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 *
 * @example
 * ```typescript
 * lerp(0, 100, 0.5); // 50
 * lerp(0, 100, 0.25); // 25
 * ```
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

/**
 * Inverse linear interpolation - returns t for a value between a and b
 *
 * @param a - Start value
 * @param b - End value
 * @param value - Value to find t for
 * @returns The t value (may be outside 0-1 range)
 *
 * @example
 * ```typescript
 * inverseLerp(0, 100, 50); // 0.5
 * inverseLerp(0, 100, 25); // 0.25
 * ```
 */
export function inverseLerp(a: number, b: number, value: number): number {
  if (a === b) return 0;
  return (value - a) / (b - a);
}

/**
 * Clamps a value between min and max
 *
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 *
 * @example
 * ```typescript
 * clamp(150, 0, 100); // 100
 * clamp(-50, 0, 100); // 0
 * clamp(50, 0, 100); // 50
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamps a value to the range [0, 1]
 *
 * @param value - Value to clamp
 * @returns Value clamped to [0, 1]
 */
export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}

/**
 * Remaps a value from one range to another
 *
 * @param value - Input value
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Remapped value
 *
 * @example
 * ```typescript
 * remap(50, 0, 100, 0, 1); // 0.5
 * remap(0.5, 0, 1, -100, 100); // 0
 * ```
 */
export function remap(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const t = inverseLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
}

/**
 * Remaps a value using Range objects
 *
 * @param value - Input value
 * @param from - Input range
 * @param to - Output range
 * @returns Remapped value
 *
 * @example
 * ```typescript
 * remapRange(50, { min: 0, max: 100 }, { min: 0, max: 1 }); // 0.5
 * ```
 */
export function remapRange(value: number, from: Range, to: Range): number {
  return remap(value, from.min, from.max, to.min, to.max);
}

/**
 * Smoothstep interpolation - smoother than linear interpolation
 *
 * @param edge0 - Lower edge
 * @param edge1 - Upper edge
 * @param x - Input value
 * @returns Smoothly interpolated value in [0, 1]
 *
 * @example
 * ```typescript
 * smoothstep(0, 1, 0.5); // ~0.5 but with smooth curve
 * ```
 */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) {
    return x >= edge0 ? 1 : 0;
  }
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Smoother step - even smoother interpolation (Ken Perlin's improved version)
 *
 * @param edge0 - Lower edge
 * @param edge1 - Upper edge
 * @param x - Input value
 * @returns Smoothly interpolated value in [0, 1]
 */
export function smootherstep(edge0: number, edge1: number, x: number): number {
  if (edge0 === edge1) {
    return x >= edge0 ? 1 : 0;
  }
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/**
 * Ping-pong - oscillates value between 0 and length
 *
 * @param t - Input value
 * @param length - Length of oscillation
 * @returns Value oscillating between 0 and length
 *
 * @example
 * ```typescript
 * pingPong(0, 1); // 0
 * pingPong(0.5, 1); // 0.5
 * pingPong(1.5, 1); // 0.5
 * pingPong(2, 1); // 0
 * ```
 */
export function pingPong(t: number, length: number): number {
  const mod = t % (length * 2);
  return length - Math.abs(mod - length);
}

/**
 * Moves a value towards a target at a constant speed
 *
 * @param current - Current value
 * @param target - Target value
 * @param maxDelta - Maximum change per call
 * @returns New value moved towards target
 *
 * @example
 * ```typescript
 * moveTowards(0, 100, 10); // 10
 * moveTowards(95, 100, 10); // 100
 * ```
 */
export function moveTowards(current: number, target: number, maxDelta: number): number {
  if (Math.abs(target - current) <= maxDelta) {
    return target;
  }
  const diff = target - current;
  return current + Math.sign(diff) * maxDelta;
}

/**
 * Smooth damp - spring-like movement with velocity
 *
 * @param current - Current value
 * @param target - Target value
 * @param velocity - Current velocity (modified in place via return)
 * @param smoothTime - Approximate time to reach target
 * @param deltaTime - Time since last call
 * @param maxSpeed - Maximum speed (default: Infinity)
 * @returns Tuple of [new position, new velocity]
 *
 * @example
 * ```typescript
 * let pos = 0;
 * let vel = 0;
 * [pos, vel] = smoothDamp(pos, 100, vel, 0.3, 0.016);
 * ```
 */
export function smoothDamp(
  current: number,
  target: number,
  velocity: number,
  smoothTime: number,
  deltaTime: number,
  maxSpeed: number = Infinity
): [number, number] {
  const omega = 2 / Math.max(0.0001, smoothTime);
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current - target;
  const maxChange = maxSpeed * smoothTime;
  change = clamp(change, -maxChange, maxChange);

  const originalTarget = target;
  const adjustedTarget = current - change;

  const temp = (velocity + omega * change) * deltaTime;
  let newVelocity = (velocity - omega * temp) * exp;
  let newPosition = adjustedTarget + (change + temp) * exp;

  if (originalTarget - current > 0 === newPosition > originalTarget) {
    newPosition = originalTarget;
    newVelocity = (newPosition - originalTarget) / deltaTime;
  }

  return [newPosition, newVelocity];
}

/**
 * Wraps an angle to the range [-PI, PI]
 *
 * @param angle - Angle in radians
 * @returns Wrapped angle in [-PI, PI]
 */
export function wrapAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  const wrapped = ((angle % twoPi) + twoPi) % twoPi;
  return wrapped > Math.PI ? wrapped - twoPi : wrapped;
}

/**
 * Finds the shortest angle difference between two angles
 *
 * @param from - Starting angle in radians
 * @param to - Target angle in radians
 * @returns Shortest angle difference
 */
export function deltaAngle(from: number, to: number): number {
  let delta = wrapAngle(to - from);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
}

/**
 * Linearly interpolates between two angles, taking the shortest path
 *
 * @param a - Start angle in radians
 * @param b - End angle in radians
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated angle
 */
export function lerpAngle(a: number, b: number, t: number): number {
  return a + deltaAngle(a, b) * t;
}

/**
 * Calculates the squared distance between two 2D points
 * Useful for distance comparisons without sqrt overhead
 *
 * @param a - First point
 * @param b - Second point
 * @returns Squared distance
 */
export function distanceSquared2D(a: Vec2Like, b: Vec2Like): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return dx * dx + dy * dy;
}

/**
 * Calculates the squared distance between two 3D points
 *
 * @param a - First point
 * @param b - Second point
 * @returns Squared distance
 */
export function distanceSquared3D(a: Vec3Like, b: Vec3Like): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dz = b.z - a.z;
  return dx * dx + dy * dy + dz * dz;
}

/**
 * Converts degrees to radians
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Converts radians to degrees
 *
 * @param radians - Angle in radians
 * @returns Angle in degrees
 */
export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Checks if a value is approximately equal to another
 *
 * @param a - First value
 * @param b - Second value
 * @param epsilon - Tolerance (default: 0.00001)
 * @returns True if values are approximately equal
 */
export function approximately(a: number, b: number, epsilon: number = 0.00001): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * Cubic ease-out interpolation.
 *
 * @param t - Progress (0-1)
 * @returns Eased value (0-1)
 */
export function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

/**
 * Cubic ease-in interpolation.
 *
 * @param t - Progress (0-1)
 * @returns Eased value (0-1)
 */
export function easeInCubic(t: number): number {
  return t * t * t;
}

/**
 * Cubic ease-in-out interpolation.
 *
 * @param t - Progress (0-1)
 * @returns Eased value (0-1)
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Elastic ease-out interpolation.
 *
 * @param t - Progress (0-1)
 * @returns Eased value (0-1)
 */
export function easeOutElastic(t: number): number {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}
