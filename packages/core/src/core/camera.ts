/**
 * Core Camera and Perspective Utilities.
 *
 * Pure TypeScript math functions and controller logic that power Strata's camera systems.
 * These utilities handle smooth following, cinematic paths, screen shake, and FOV transitions—
 * all without React dependencies for maximum portability.
 *
 * **Key Features:**
 * - **Smooth Damping:** Unity-style smoothDamp for natural camera motion
 * - **Catmull-Rom Splines:** Cinematic path interpolation with tension control
 * - **Trauma-Based Shake:** Realistic shake system using Perlin-like noise
 * - **FOV Transitions:** Dynamic field-of-view animations with custom easing
 *
 * @packageDocumentation
 * @module core/camera
 * @category Player Experience
 *
 * @example
 * ```typescript
 * // Smooth camera following
 * const velocity = new THREE.Vector3();
 * const smoothPos = smoothDampVector3(
 *   camera.position,
 *   targetPos,
 *   velocity,
 *   0.3,
 *   deltaTime
 * );
 * camera.position.copy(smoothPos);
 *
 * // Trauma-based shake
 * const shake = new CameraShake({ traumaDecay: 1.5 });
 * shake.addTrauma(0.8); // Impact!
 * const { offset, rotation } = shake.update(deltaTime);
 * camera.position.add(offset);
 * camera.rotation.x += rotation.x;
 * ```
 */

import * as THREE from 'three';
import { easeInOutCubic, lerp } from './math/utils';

/**
 * Configuration for trauma-based camera shake.
 *
 * Uses a noise-driven shake system where "trauma" represents the intensity
 * of screen shake caused by impacts, explosions, or environmental stress.
 *
 * @category Player Experience
 */
export interface CameraShakeConfig {
  /** Current trauma level (0-1). Higher values produce more intense shake. */
  trauma: number;
  /** Rate at which trauma decays per second (higher = faster recovery). Default: 1.5 */
  traumaDecay: number;
  /** Maximum rotation angle in radians. Default: 0.1 */
  maxAngle: number;
  /** Maximum positional offset. Default: 0.5 */
  maxOffset: number;
  /** Noise frequency in Hz. Higher values produce faster oscillation. Default: 25 */
  frequency: number;
}

/**
 * Configuration for smooth FOV (field-of-view) transitions.
 *
 * Enables dynamic perspective changes for zoom effects, aiming down sights,
 * or dramatic camera emphasis.
 *
 * @category Player Experience
 */
export interface FOVTransitionConfig {
  /** Starting field of view in degrees. */
  startFOV: number;
  /** Target field of view in degrees. */
  endFOV: number;
  /** Transition duration in seconds. */
  duration: number;
  /** Optional easing function (t: 0..1) -> 0..1. Defaults to easeInOutCubic. */
  easing?: (t: number) => number;
}

/**
 * Configuration for a Catmull-Rom spline camera path.
 *
 * Defines a smooth path through 3D space for cinematic flythroughs and cutscenes.
 *
 * @category Player Experience
 */
export interface CameraPath {
  /** Array of Vector3 waypoints defining the path. */
  points: THREE.Vector3[];
  /** Total duration to traverse the path in seconds. */
  duration: number;
  /** Spline tension (0-1). Lower = looser curves. Default: 0.5 */
  tension?: number;
  /** Whether the path loops back to the start. Default: false */
  closed?: boolean;
}

/**
 * Linear interpolation between two Vector3 positions.
 *
 * @param a - Start position
 * @param b - End position
 * @param t - Interpolation factor (0-1), clamped automatically
 * @param out - Optional output vector (avoids allocation)
 * @returns Interpolated position
 * @category Player Experience
 */
export function lerpVector3(
  a: THREE.Vector3,
  b: THREE.Vector3,
  t: number,
  out?: THREE.Vector3
): THREE.Vector3 {
  const result = out ?? new THREE.Vector3();
  const clampedT = Math.max(0, Math.min(1, t));
  return result.set(
    a.x + (b.x - a.x) * clampedT,
    a.y + (b.y - a.y) * clampedT,
    a.z + (b.z - a.z) * clampedT
  );
}

/**
 * Spherical linear interpolation between two quaternions.
 *
 * Produces smooth rotations without gimbal lock. Useful for camera
 * orientation transitions.
 *
 * @param qa - Start quaternion
 * @param qb - End quaternion
 * @param t - Interpolation factor (0-1), clamped automatically
 * @param out - Optional output quaternion (avoids allocation)
 * @returns Interpolated quaternion
 * @category Player Experience
 */
export function slerp(
  qa: THREE.Quaternion,
  qb: THREE.Quaternion,
  t: number,
  out?: THREE.Quaternion
): THREE.Quaternion {
  const result = out ?? new THREE.Quaternion();
  return result.copy(qa).slerp(qb, Math.max(0, Math.min(1, t)));
}

/**
 * Unity-style smooth damping for scalar values.
 *
 * Produces natural, spring-like motion toward a target without overshooting.
 * Perfect for camera zoom, FOV transitions, or any value that needs organic movement.
 *
 * @param current - Current value
 * @param target - Target value
 * @param velocity - Velocity reference object (mutated)
 * @param smoothTime - Approximate time to reach target (seconds)
 * @param deltaTime - Time elapsed since last frame (seconds)
 * @param maxSpeed - Optional maximum speed limit
 * @returns New smoothed value
 * @category Player Experience
 *
 * @example
 * ```typescript
 * const velocity = { value: 0 };
 * const smoothZoom = smoothDampScalar(currentZoom, targetZoom, velocity, 0.3, deltaTime);
 * ```
 */
export function smoothDampScalar(
  current: number,
  target: number,
  velocity: { value: number },
  smoothTime: number,
  deltaTime: number,
  maxSpeed: number = Infinity
): number {
  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const x = omega * deltaTime;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

  let change = current - target;
  const maxChange = maxSpeed * smoothTime;
  change = Math.max(-maxChange, Math.min(maxChange, change));

  const originalTarget = target;
  target = current - change;

  const temp = (velocity.value + omega * change) * deltaTime;
  velocity.value = (velocity.value - omega * temp) * exp;

  let result = target + (change + temp) * exp;

  if (originalTarget - current > 0 === result > originalTarget) {
    result = originalTarget;
    velocity.value = (result - originalTarget) / deltaTime;
  }

  return result;
}

/**
 * Unity-style smooth damping for Vector3 positions.
 *
 * Provides organic, spring-like camera movement toward a target position.
 * Each axis is independently damped for smooth 3D motion without overshooting.
 *
 * @param current - Current position
 * @param target - Target position
 * @param velocity - Velocity vector (mutated per-axis)
 * @param smoothTime - Approximate time to reach target (seconds)
 * @param deltaTime - Time elapsed since last frame (seconds)
 * @param maxSpeed - Optional maximum speed limit per axis
 * @param out - Optional output vector (avoids allocation)
 * @returns New smoothed position
 * @category Player Experience
 *
 * @example
 * ```typescript
 * const velocity = new THREE.Vector3();
 * const smoothPos = smoothDampVector3(
 *   camera.position,
 *   targetPosition,
 *   velocity,
 *   0.3,
 *   deltaTime
 * );
 * camera.position.copy(smoothPos);
 * ```
 */
export function smoothDampVector3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  velocity: THREE.Vector3,
  smoothTime: number,
  deltaTime: number,
  maxSpeed: number = Infinity,
  out?: THREE.Vector3
): THREE.Vector3 {
  const result = out ?? new THREE.Vector3();

  const velX = { value: velocity.x };
  const velY = { value: velocity.y };
  const velZ = { value: velocity.z };

  result.x = smoothDampScalar(current.x, target.x, velX, smoothTime, deltaTime, maxSpeed);
  result.y = smoothDampScalar(current.y, target.y, velY, smoothTime, deltaTime, maxSpeed);
  result.z = smoothDampScalar(current.z, target.z, velZ, smoothTime, deltaTime, maxSpeed);

  velocity.set(velX.value, velY.value, velZ.value);

  return result;
}

/**
 * Trauma-based camera shake system.
 *
 * Implements robust screen shake using Perlin-like noise patterns. "Trauma" represents
 * shake intensity and decays over time, creating realistic responses to impacts,
 * explosions, or environmental stress.
 *
 * **Advantages over simple oscillation:**
 * - Natural-looking randomness via procedural noise
 * - Automatic decay without manual timers
 * - Scales intensity with trauma squared for impact emphasis
 *
 * @category Player Experience
 *
 * @example
 * ```typescript
 * const shake = new CameraShake({
 *   traumaDecay: 1.5,
 *   maxAngle: 0.15,
 *   frequency: 30
 * });
 *
 * // Trigger shake from explosion
 * shake.addTrauma(0.8);
 *
 * // Each frame
 * const { offset, rotation } = shake.update(deltaTime);
 * camera.position.add(offset);
 * camera.rotation.x += rotation.x;
 * ```
 */
/**
 * Core camera shake class for procedural camera movement.
 * @category Player Experience
 */
export class CameraShakeCore {
  private trauma: number = 0;
  private traumaDecay: number;
  private maxAngle: number;
  private maxOffset: number;
  private frequency: number;
  private seed: number;
  private time: number = 0;

  constructor(config: Partial<CameraShakeConfig> = {}) {
    this.traumaDecay = config.traumaDecay ?? 1.5;
    this.maxAngle = config.maxAngle ?? 0.1;
    this.maxOffset = config.maxOffset ?? 0.5;
    this.frequency = config.frequency ?? 25;
    this.seed = Math.random() * 1000;
  }

  addTrauma(amount: number): void {
    this.trauma = Math.min(1, this.trauma + amount);
  }

  setTrauma(amount: number): void {
    this.trauma = Math.max(0, Math.min(1, amount));
  }

  getTrauma(): number {
    return this.trauma;
  }

  update(deltaTime: number): { offset: THREE.Vector3; rotation: THREE.Euler } {
    this.time += deltaTime;

    const shake = this.trauma * this.trauma;

    const noiseX = this.perlinNoise(this.seed, this.time * this.frequency);
    const noiseY = this.perlinNoise(this.seed + 1, this.time * this.frequency);
    const noiseZ = this.perlinNoise(this.seed + 2, this.time * this.frequency);
    const noiseRoll = this.perlinNoise(this.seed + 3, this.time * this.frequency);
    const noisePitch = this.perlinNoise(this.seed + 4, this.time * this.frequency);
    const noiseYaw = this.perlinNoise(this.seed + 5, this.time * this.frequency);

    const offset = new THREE.Vector3(
      shake * this.maxOffset * noiseX,
      shake * this.maxOffset * noiseY,
      shake * this.maxOffset * noiseZ * 0.5
    );

    const rotation = new THREE.Euler(
      shake * this.maxAngle * noisePitch,
      shake * this.maxAngle * noiseYaw,
      shake * this.maxAngle * noiseRoll
    );

    this.trauma = Math.max(0, this.trauma - this.traumaDecay * deltaTime);

    return { offset, rotation };
  }

  private perlinNoise(seed: number, t: number): number {
    const x = t + seed;
    return Math.sin(x * 1.0) * 0.5 + Math.sin(x * 2.3) * 0.3 + Math.sin(x * 5.7) * 0.2;
  }
}

/**
 * Smooth field-of-view transition controller.
 *
 * Enables dynamic perspective changes for zoom effects, aiming down sights,
 * or dramatic camera emphasis with custom easing curves.
 *
 * @category Player Experience
 *
 * @example
 * ```typescript
 * // Create zoom-in transition
 * const fovTransition = new FOVTransition({
 *   startFOV: 75,
 *   endFOV: 45,
 *   duration: 0.5,
 *   easing: easeOutCubic
 * });
 *
 * // Each frame
 * if (!fovTransition.complete()) {
 *   camera.fov = fovTransition.update(deltaTime);
 *   camera.updateProjectionMatrix();
 * }
 * ```
 */
export class FOVTransition {
  private startFOV: number;
  private endFOV: number;
  private duration: number;
  private elapsed: number = 0;
  private easing: (t: number) => number;
  private isComplete: boolean = false;

  constructor(config: FOVTransitionConfig) {
    this.startFOV = config.startFOV;
    this.endFOV = config.endFOV;
    this.duration = config.duration;
    this.easing = config.easing ?? easeInOutCubic;
  }

  update(deltaTime: number): number {
    if (this.isComplete) {
      return this.endFOV;
    }

    this.elapsed += deltaTime;
    const t = Math.min(1, this.elapsed / this.duration);
    const easedT = this.easing(t);

    if (t >= 1) {
      this.isComplete = true;
      return this.endFOV;
    }

    return lerp(this.startFOV, this.endFOV, easedT);
  }

  reset(): void {
    this.elapsed = 0;
    this.isComplete = false;
  }

  complete(): boolean {
    return this.isComplete;
  }
}

/**
 * Evaluate a Catmull-Rom spline at a given position.
 *
 * Produces smooth curves through waypoints for cinematic camera paths.
 * The spline passes directly through all control points (unlike Bezier).
 *
 * @param points - Array of waypoint positions (minimum 2)
 * @param t - Position along path (0-1)
 * @param tension - Spline tension (0-1). Lower = looser curves. Default: 0.5
 * @param closed - Whether path loops back to start. Default: false
 * @returns Position on the spline
 * @category Player Experience
 *
 * @example
 * ```typescript
 * const waypoints = [
 *   new THREE.Vector3(0, 5, 10),
 *   new THREE.Vector3(5, 8, 5),
 *   new THREE.Vector3(10, 5, 0)
 * ];
 *
 * // Get position at 50% along path
 * const pos = evaluateCatmullRom(waypoints, 0.5, 0.5, false);
 * camera.position.copy(pos);
 * ```
 */
export function evaluateCatmullRom(
  points: THREE.Vector3[],
  t: number,
  tension: number = 0.5,
  closed: boolean = false
): THREE.Vector3 {
  const n = points.length;
  if (n < 2) {
    return points[0]?.clone() ?? new THREE.Vector3();
  }

  const totalSegments = closed ? n : n - 1;
  const segment = Math.floor(t * totalSegments);
  const localT = t * totalSegments - segment;

  const getPoint = (i: number): THREE.Vector3 => {
    if (closed) {
      return points[((i % n) + n) % n];
    }
    return points[Math.max(0, Math.min(n - 1, i))];
  };

  const p0 = getPoint(segment - 1);
  const p1 = getPoint(segment);
  const p2 = getPoint(segment + 1);
  const p3 = getPoint(segment + 2);

  const t2 = localT * localT;
  const t3 = t2 * localT;

  const s = (1 - tension) / 2;

  const result = new THREE.Vector3();

  result.x =
    s *
    (2 * p1.x +
      (-p0.x + p2.x) * localT +
      (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
      (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

  result.y =
    s *
    (2 * p1.y +
      (-p0.y + p2.y) * localT +
      (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
      (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

  result.z =
    s *
    (2 * p1.z +
      (-p0.z + p2.z) * localT +
      (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
      (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3);

  return result;
}

/**
 * Calculate velocity-based look-ahead offset for dynamic cameras.
 *
 * Points the camera slightly ahead of a moving target based on its velocity.
 * Creates a more responsive feel in third-person or follow cameras.
 *
 * @param velocity - Current target velocity (units/sec)
 * @param lookAheadDistance - How far ahead to look in world units
 * @param lookAheadSmoothing - Smoothing time for look-ahead changes
 * @param currentLookAhead - Current look-ahead vector (mutated)
 * @param deltaTime - Time elapsed since last frame (seconds)
 * @returns New look-ahead offset vector
 * @category Player Experience
 *
 * @example
 * ```typescript
 * const lookAhead = calculateLookAhead(
 *   targetVelocity,
 *   3.0,  // Look 3 units ahead
 *   0.4,  // Smooth over 0.4 seconds
 *   currentLookAhead,
 *   deltaTime
 * );
 * camera.lookAt(targetPos.clone().add(lookAhead));
 * ```
 */
export function calculateLookAhead(
  velocity: THREE.Vector3,
  lookAheadDistance: number,
  lookAheadSmoothing: number,
  currentLookAhead: THREE.Vector3,
  deltaTime: number
): THREE.Vector3 {
  const speed = velocity.length();
  if (speed < 0.01) {
    const t = Math.min(1, deltaTime / lookAheadSmoothing);
    return new THREE.Vector3().lerpVectors(currentLookAhead, new THREE.Vector3(), t);
  }

  const targetLookAhead = velocity.clone().normalize().multiplyScalar(lookAheadDistance);
  const t = Math.min(1, deltaTime / lookAheadSmoothing);
  return new THREE.Vector3().lerpVectors(currentLookAhead, targetLookAhead, t);
}

/**
 * Calculate procedural head bob offset for first-person cameras.
 *
 * Generates vertical and horizontal oscillation based on walking speed.
 * Creates a sense of footsteps and physical presence.
 *
 * @param time - Accumulated time (grows each frame)
 * @param speed - Current movement speed (units/sec)
 * @param bobFrequency - Oscillation frequency in Hz. Default: 10
 * @param bobAmplitude - Maximum displacement. Default: 0.05
 * @returns Head bob offset vector
 * @category Player Experience
 *
 * @example
 * ```typescript
 * let bobTime = 0;
 * const movementSpeed = 5.0;
 * const isMoving = true;
 *
 * if (isMoving) {
 *   bobTime += deltaTime * movementSpeed;
 *   const bob = calculateHeadBob(bobTime, movementSpeed, 12, 0.04);
 *   camera.position.add(bob);
 * }
 * ```
 */
export function calculateHeadBob(
  time: number,
  speed: number,
  bobFrequency: number = 10,
  bobAmplitude: number = 0.05
): THREE.Vector3 {
  const normalizedSpeed = Math.min(1, speed / 5);
  const amplitude = bobAmplitude * normalizedSpeed;

  return new THREE.Vector3(
    Math.sin(time * bobFrequency * 0.5) * amplitude * 0.5,
    Math.abs(Math.sin(time * bobFrequency)) * amplitude,
    0
  );
}

/**
 * Screen shake intensity configuration.
 *
 * Defines the magnitude of shake effects across different axes.
 *
 * @category Player Experience
 */
export interface ScreenShakeIntensity {
  /** Trauma level (0-1) representing shake intensity. */
  trauma: number;
  /** Maximum horizontal screen offset in pixels. */
  maxOffsetX: number;
  /** Maximum vertical screen offset in pixels. */
  maxOffsetY: number;
  /** Maximum rotation in radians. */
  maxRotation: number;
}

/**
 * Calculate screen shake intensity based on impact and distance.
 *
 * Automatically scales shake trauma with distance falloff, creating
 * realistic responses where nearby impacts shake harder than distant ones.
 *
 * @param impactForce - Force magnitude (arbitrary units, typically 0-5)
 * @param distance - Distance from impact to camera
 * @param falloffStart - Distance where falloff begins. Default: 5
 * @param falloffEnd - Distance where shake reaches zero. Default: 50
 * @returns Shake intensity configuration
 * @category Player Experience
 *
 * @example
 * ```typescript
 * // Explosion at position
 * const explosionPos = new THREE.Vector3(10, 0, 10);
 * const distance = camera.position.distanceTo(explosionPos);
 *
 * const intensity = calculateScreenShakeIntensity(
 *   2.5,      // Strong explosion
 *   distance,
 *   5,        // Falloff starts at 5 units
 *   40        // No shake beyond 40 units
 * );
 *
 * cameraShake.addTrauma(intensity.trauma);
 * ```
 */
export function calculateScreenShakeIntensity(
  impactForce: number,
  distance: number,
  falloffStart: number = 5,
  falloffEnd: number = 50
): ScreenShakeIntensity {
  let distanceFactor = 1;
  if (distance > falloffStart) {
    distanceFactor = 1 - Math.min(1, (distance - falloffStart) / (falloffEnd - falloffStart));
  }

  const trauma = Math.min(1, impactForce * distanceFactor);

  return {
    trauma,
    maxOffsetX: trauma * 20,
    maxOffsetY: trauma * 20,
    maxRotation: trauma * 0.05,
  };
}

/**
 * @deprecated Use `CameraShakeCore` instead. This alias will be removed in v2.0.
 * @category Player Experience
 */
export { CameraShakeCore as CameraShake };

/**
 * Type alias for backwards compatibility.
 * @deprecated Use `CameraShakeCore` instead.
 */
export type CameraShakeType = CameraShakeCore;
