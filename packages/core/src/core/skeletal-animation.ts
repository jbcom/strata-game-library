/**
 * Skeletal Animation Utilities.
 *
 * Look-at controllers, bone rotation helpers, and curve interpolation for skeletal animation.
 * Pure TypeScript with no React dependencies.
 *
 * @packageDocumentation
 * @module core/animation/skeletal-animation
 * @category Entities & Simulation
 */

import * as THREE from 'three';

/**
 * Configuration for a procedural look-at behavior.
 * @category Entities & Simulation
 */
export interface LookAtConfig {
  /** Maximum allowed rotation angle from neutral. */
  maxAngle: number;
  /** Tracking speed multiplier. */
  speed: number;
  /** Radius of center deadzone where no rotation occurs. */
  deadzone: number;
  /** Smoothing factor for movement (0-1). */
  smoothing: number;
  /** Up axis for the tracking object. Default: [0, 1, 0]. */
  upVector?: THREE.Vector3;
  /** Forward axis for the tracking object. Default: [0, 0, 1]. */
  forwardVector?: THREE.Vector3;
}

/**
 * Runtime state of a look-at controller.
 * @category Entities & Simulation
 */
export interface LookAtState {
  /** Current world-space rotation. */
  currentRotation: THREE.Quaternion;
  /** Target world-space rotation. */
  targetRotation: THREE.Quaternion;
  /** Current angular velocity. */
  velocity: THREE.Vector3;
}

/**
 * Look-At Controller with Constraints and Smoothing.
 *
 * Rotates objects to face targets with natural motion, angular limits, dead zones, and smooth damping.
 * Perfect for character heads, eyes, cameras, turrets, or any tracking behavior.
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Character head tracking player
 * const headController = new LookAtController({
 *   maxAngle: Math.PI / 3,  // Can't turn head more than 60 degrees
 *   speed: 5,               // Tracking speed
 *   deadzone: 0.05,         // Ignore tiny movements
 *   smoothing: 0.1          // Smooth interpolation
 * });
 *
 * // In update loop
 * function animate(deltaTime: number) {
 *   const playerPos = player.position;
 *   const headRotation = headController.update(head, playerPos, deltaTime);
 *   head.quaternion.copy(headRotation);
 * }
 * ```
 */
export class LookAtController {
  private config: LookAtConfig;
  private currentQuat: THREE.Quaternion;
  private velocity: THREE.Vector3;

  /**
   * Create a new look-at controller.
   *
   * @param config - Configuration for tracking behavior
   */
  constructor(config: Partial<LookAtConfig> = {}) {
    this.config = {
      maxAngle: config.maxAngle ?? Math.PI / 2,
      speed: config.speed ?? 5,
      deadzone: config.deadzone ?? 0.01,
      smoothing: config.smoothing ?? 0.1,
      upVector: config.upVector ?? new THREE.Vector3(0, 1, 0),
      forwardVector: config.forwardVector ?? new THREE.Vector3(0, 0, 1),
    };
    this.currentQuat = new THREE.Quaternion();
    this.velocity = new THREE.Vector3();
  }

  update(object: THREE.Object3D, target: THREE.Vector3, deltaTime: number): THREE.Quaternion {
    const objectPos = new THREE.Vector3();
    object.getWorldPosition(objectPos);

    const direction = target.clone().sub(objectPos);
    const distance = direction.length();

    if (distance < this.config.deadzone) {
      return this.currentQuat;
    }

    direction.normalize();

    const forward = this.config.forwardVector?.clone() ?? new THREE.Vector3(0, 0, 1);
    const worldQuat = object.parent
      ? object.parent.getWorldQuaternion(new THREE.Quaternion())
      : new THREE.Quaternion();
    forward.applyQuaternion(worldQuat);

    const angle = Math.acos(Math.max(-1, Math.min(1, forward.dot(direction))));
    if (angle > this.config.maxAngle) {
      const axis = new THREE.Vector3().crossVectors(forward, direction);
      // Handle parallel/anti-parallel vectors where cross product is zero
      if (axis.lengthSq() > 0.000001) {
        axis.normalize();
        direction.copy(forward).applyAxisAngle(axis, this.config.maxAngle);
      } else if (angle > Math.PI / 2) {
        // Vectors are anti-parallel, use an arbitrary perpendicular axis
        const perpAxis =
          Math.abs(forward.x) < 0.9
            ? new THREE.Vector3(1, 0, 0).cross(forward).normalize()
            : new THREE.Vector3(0, 1, 0).cross(forward).normalize();
        direction.copy(forward).applyAxisAngle(perpAxis, this.config.maxAngle);
      }
      // If vectors are parallel and within maxAngle, no change needed
    }

    const targetQuat = new THREE.Quaternion();
    const lookMatrix = new THREE.Matrix4();
    lookMatrix.lookAt(
      new THREE.Vector3(),
      direction,
      this.config.upVector ?? new THREE.Vector3(0, 1, 0)
    );
    targetQuat.setFromRotationMatrix(lookMatrix);

    const localTargetQuat = worldQuat.clone().invert().multiply(targetQuat);

    const t = 1 - Math.exp(-this.config.speed * deltaTime);
    this.currentQuat.slerp(localTargetQuat, t);

    return this.currentQuat;
  }

  apply(object: THREE.Object3D): void {
    object.quaternion.copy(this.currentQuat);
  }

  reset(): void {
    this.currentQuat.identity();
    this.velocity.set(0, 0, 0);
  }
}

/**
 * Clamp an angle to a specified range.
 *
 * Normalizes angles to the -pi to pi range before clamping.
 *
 * @category Entities & Simulation
 *
 * @param angle - Input angle in radians
 * @param min - Minimum allowed angle
 * @param max - Maximum allowed angle
 * @returns Clamped angle in radians
 */
export function clampAngle(angle: number, min: number, max: number): number {
  if (angle < -Math.PI) angle += Math.PI * 2;
  if (angle > Math.PI) angle -= Math.PI * 2;
  return Math.max(min, Math.min(max, angle));
}

/**
 * Damped spring interpolation for scalar values.
 *
 * @category Entities & Simulation
 *
 * @param current - Current value
 * @param target - Target value to reach
 * @param velocity - Velocity object (modified in place)
 * @param stiffness - Spring stiffness (higher = faster)
 * @param damping - Damping factor (higher = less oscillation)
 * @param deltaTime - Time step in seconds
 * @returns New interpolated value
 */
export function dampedSpring(
  current: number,
  target: number,
  velocity: { value: number },
  stiffness: number,
  damping: number,
  deltaTime: number
): number {
  const springForce = (target - current) * stiffness;
  const dampingForce = velocity.value * damping;
  const acceleration = springForce - dampingForce;

  velocity.value += acceleration * deltaTime;
  return current + velocity.value * deltaTime;
}

/**
 * Damped spring interpolation for Vector3 values.
 *
 * @category Entities & Simulation
 *
 * @param current - Current position
 * @param target - Target position to reach
 * @param velocity - Velocity vector (modified in place)
 * @param stiffness - Spring stiffness (higher = faster)
 * @param damping - Damping factor (higher = less oscillation)
 * @param deltaTime - Time step in seconds
 * @param out - Optional output vector to avoid allocation
 * @returns New interpolated position
 */
export function dampedSpringVector3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  velocity: THREE.Vector3,
  stiffness: number,
  damping: number,
  deltaTime: number,
  out?: THREE.Vector3
): THREE.Vector3 {
  const result = out ?? new THREE.Vector3();

  const springForce = target.clone().sub(current).multiplyScalar(stiffness);
  const dampingForce = velocity.clone().multiplyScalar(damping);
  const acceleration = springForce.sub(dampingForce);

  velocity.add(acceleration.multiplyScalar(deltaTime));
  result.copy(current).add(velocity.clone().multiplyScalar(deltaTime));

  return result;
}

export function hermiteInterpolate(
  p0: THREE.Vector3,
  p1: THREE.Vector3,
  m0: THREE.Vector3,
  m1: THREE.Vector3,
  t: number
): THREE.Vector3 {
  const t2 = t * t;
  const t3 = t2 * t;

  const h00 = 2 * t3 - 3 * t2 + 1;
  const h10 = t3 - 2 * t2 + t;
  const h01 = -2 * t3 + 3 * t2;
  const h11 = t3 - t2;

  return new THREE.Vector3()
    .addScaledVector(p0, h00)
    .addScaledVector(m0, h10)
    .addScaledVector(p1, h01)
    .addScaledVector(m1, h11);
}

export function sampleCurve(
  points: THREE.Vector3[],
  t: number,
  tension: number = 0.5
): THREE.Vector3 {
  if (points.length < 2) return points[0]?.clone() ?? new THREE.Vector3();

  const segments = points.length - 1;
  const segment = Math.min(Math.floor(t * segments), segments - 1);
  const localT = t * segments - segment;

  const p0 = points[Math.max(0, segment - 1)];
  const p1 = points[segment];
  const p2 = points[segment + 1];
  const p3 = points[Math.min(points.length - 1, segment + 2)];

  const m0 = p2.clone().sub(p0).multiplyScalar(tension);
  const m1 = p3.clone().sub(p1).multiplyScalar(tension);

  return hermiteInterpolate(p1, p2, m0, m1, localT);
}

export function calculateBoneRotation(
  boneStart: THREE.Vector3,
  boneEnd: THREE.Vector3,
  upVector: THREE.Vector3 = new THREE.Vector3(0, 1, 0)
): THREE.Quaternion {
  const direction = boneEnd.clone().sub(boneStart).normalize();

  const quaternion = new THREE.Quaternion();
  const matrix = new THREE.Matrix4();

  if (Math.abs(direction.dot(upVector)) > 0.999) {
    const altUp = new THREE.Vector3(1, 0, 0);
    matrix.lookAt(new THREE.Vector3(), direction, altUp);
  } else {
    matrix.lookAt(new THREE.Vector3(), direction, upVector);
  }

  quaternion.setFromRotationMatrix(matrix);
  return quaternion;
}
