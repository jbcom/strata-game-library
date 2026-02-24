/**
 * Procedural Animation Systems.
 *
 * Spring dynamics, spring chains, and procedural locomotion for character animation.
 * Pure TypeScript with no React dependencies.
 *
 * @packageDocumentation
 * @module core/animation/procedural-animation
 * @category Entities & Simulation
 */

import * as THREE from 'three';

/**
 * Configuration for a physical spring system.
 * @category Entities & Simulation
 */
export interface SpringConfig {
  /** Resistance to displacement. Higher = snappier. */
  stiffness: number;
  /** Resistance to movement. Higher = less oscillation. */
  damping: number;
  /** Weight of the object. Higher = more momentum. */
  mass: number;
  /** Neutral length of the spring. */
  restLength?: number;
}

/**
 * Runtime state of a physical spring.
 * @category Entities & Simulation
 */
export interface SpringState {
  /** Current world position. */
  position: THREE.Vector3;
  /** Current velocity vector. */
  velocity: THREE.Vector3;
}

/**
 * Configuration for procedural character gait.
 * @category Entities & Simulation
 */
export interface GaitConfig {
  /** Distance covered by a single full step. */
  stepLength: number;
  /** Vertical lift height of each step. */
  stepHeight: number;
  /** Time in seconds taken for a single step. */
  stepDuration: number;
  /** Vertical body oscillation magnitude. */
  bodyBob: number;
  /** Horizontal body oscillation magnitude. */
  bodySwayAmplitude: number;
  /** Maximum hip rotation angle during walking. */
  hipRotation: number;
  /** Phase difference between left and right legs (0-1). */
  phaseOffset: number;
  /** Distance the foot lands past the target position. */
  footOvershoot: number;
}

/**
 * Current state of a procedural locomotion cycle.
 * @category Entities & Simulation
 */
export interface GaitState {
  /** Current normalized phase of the cycle (0-1). */
  phase: number;
  /** Target world position for the left foot. */
  leftFootTarget: THREE.Vector3;
  /** Target world position for the right foot. */
  rightFootTarget: THREE.Vector3;
  /** Whether the left foot is currently in flight. */
  leftFootLifted: boolean;
  /** Whether the right foot is currently in flight. */
  rightFootLifted: boolean;
  /** Computed body offset from root. */
  bodyOffset: THREE.Vector3;
  /** Computed body rotation. */
  bodyRotation: THREE.Euler;
}

/**
 * Physical Spring Dynamics System.
 *
 * Simulates realistic spring-mass-damper physics for secondary motion like hair, cloth, tails,
 * and dangling objects. Based on Hooke's law with velocity damping.
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Bouncy ponytail
 * const ponytail = new SpringDynamics({
 *   stiffness: 150,  // Medium stiffness
 *   damping: 5,      // Low damping = bouncy
 *   mass: 1          // Medium mass
 * });
 *
 * // In update loop
 * const headPos = character.head.position;
 * const targetPos = headPos.clone().add(new THREE.Vector3(0, -0.5, 0));
 * const hairPos = ponytail.update(targetPos, deltaTime);
 * hairMesh.position.copy(hairPos);
 * ```
 */
export class SpringDynamics {
  private config: SpringConfig;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private restPosition: THREE.Vector3;

  /**
   * Create a new spring dynamics system.
   *
   * @param config - Spring configuration (stiffness, damping, mass)
   * @param initialPosition - Starting position of the spring. Default: origin
   */
  constructor(config: Partial<SpringConfig> = {}, initialPosition?: THREE.Vector3) {
    this.config = {
      stiffness: config.stiffness ?? 100,
      damping: config.damping ?? 10,
      mass: config.mass ?? 1,
      restLength: config.restLength,
    };
    this.position = initialPosition?.clone() ?? new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.restPosition = this.position.clone();
  }

  /**
   * Update spring physics for one time step.
   *
   * @param targetPosition - The position the spring is attached to (moves with parent object)
   * @param deltaTime - Time step in seconds (typically frame delta)
   * @returns New position of the spring
   */
  update(targetPosition: THREE.Vector3, deltaTime: number): THREE.Vector3 {
    const displacement = this.position.clone().sub(targetPosition);

    if (this.config.restLength !== undefined) {
      const direction = displacement.clone().normalize();
      const currentLength = displacement.length();
      displacement.copy(direction.multiplyScalar(currentLength - this.config.restLength));
    }

    const springForce = displacement.clone().multiplyScalar(-this.config.stiffness);
    const dampingForce = this.velocity.clone().multiplyScalar(-this.config.damping);
    const totalForce = springForce.add(dampingForce);
    const acceleration = totalForce.divideScalar(this.config.mass);

    this.velocity.add(acceleration.clone().multiplyScalar(deltaTime));
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

    return this.position.clone();
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  getVelocity(): THREE.Vector3 {
    return this.velocity.clone();
  }

  setPosition(position: THREE.Vector3): void {
    this.position.copy(position);
  }

  setVelocity(velocity: THREE.Vector3): void {
    this.velocity.copy(velocity);
  }

  reset(position?: THREE.Vector3): void {
    this.position.copy(position ?? this.restPosition);
    this.velocity.set(0, 0, 0);
  }
}

/**
 * Multi-Segment Spring Chain System.
 *
 * Simulates a chain of connected springs (like a rope, tail, or hair strand) where each segment
 * follows the one before it with spring physics.
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Dragon tail with 8 segments
 * const tail = new SpringChain(8, { stiffness: 100, damping: 10, mass: 1 }, 0.4);
 *
 * // In update loop
 * const rootPos = dragon.tailRoot.position;
 * const rootQuat = dragon.tailRoot.quaternion;
 * const gravity = new THREE.Vector3(0, -9.8, 0);
 * const positions = tail.update(rootPos, rootQuat, deltaTime, gravity);
 * ```
 */
export class SpringChain {
  private springs: SpringDynamics[];
  private restLengths: number[];

  /**
   * Create a new spring chain.
   *
   * @param nodeCount - Number of segments in the chain
   * @param config - Spring configuration for the chain
   * @param restLength - Length of each segment
   */
  constructor(nodeCount: number, config: Partial<SpringConfig> = {}, restLength: number = 0.5) {
    this.springs = [];
    this.restLengths = [];

    for (let i = 0; i < nodeCount; i++) {
      this.springs.push(
        new SpringDynamics({
          ...config,
          stiffness: (config.stiffness ?? 100) * (1 - (i / nodeCount) * 0.5),
          damping: (config.damping ?? 10) * (1 + (i / nodeCount) * 0.3),
        })
      );
      this.restLengths.push(restLength);
    }
  }

  update(
    rootPosition: THREE.Vector3,
    rootRotation: THREE.Quaternion,
    deltaTime: number,
    gravity: THREE.Vector3 = new THREE.Vector3(0, -9.8, 0)
  ): THREE.Vector3[] {
    const positions: THREE.Vector3[] = [rootPosition.clone()];

    const direction = new THREE.Vector3(0, -1, 0).applyQuaternion(rootRotation);

    for (let i = 0; i < this.springs.length; i++) {
      const parentPos = positions[i];
      const spring = this.springs[i];

      const idealPos = parentPos.clone().add(direction.clone().multiplyScalar(this.restLengths[i]));

      const gravityInfluence = gravity.clone().multiplyScalar(0.01 * (i + 1));
      const target = idealPos.add(gravityInfluence);

      let pos = spring.update(target, deltaTime);

      const toParent = pos.clone().sub(parentPos);
      const distance = toParent.length();
      if (distance > this.restLengths[i] * 1.5) {
        toParent.normalize().multiplyScalar(this.restLengths[i] * 1.5);
        pos = parentPos.clone().add(toParent);
        spring.setPosition(pos);
      } else if (distance < this.restLengths[i] * 0.5) {
        toParent.normalize().multiplyScalar(this.restLengths[i] * 0.5);
        pos = parentPos.clone().add(toParent);
        spring.setPosition(pos);
      }

      positions.push(pos);
    }

    return positions;
  }

  reset(positions: THREE.Vector3[]): void {
    for (let i = 0; i < this.springs.length && i < positions.length - 1; i++) {
      this.springs[i].reset(positions[i + 1]);
    }
  }

  getPositions(): THREE.Vector3[] {
    return this.springs.map((s) => s.getPosition());
  }
}

/**
 * Procedural Locomotion and Gait System.
 *
 * Generates natural walking, running, and movement animations without keyframes.
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * const gait = new ProceduralGait({
 *   stepLength: 0.8,
 *   stepHeight: 0.15,
 *   stepDuration: 0.4,
 *   bodyBob: 0.05,
 *   bodySwayAmplitude: 0.02,
 *   hipRotation: 0.1,
 *   phaseOffset: 0.5,
 *   footOvershoot: 0.1
 * });
 *
 * // In update loop
 * const state = gait.update(bodyPos, forward, velocity, deltaTime);
 * leftFoot.position.copy(state.leftFootTarget);
 * rightFoot.position.copy(state.rightFootTarget);
 * ```
 */
export class ProceduralGait {
  private config: GaitConfig;
  private phase: number = 0;
  private leftFootGrounded: THREE.Vector3;
  private rightFootGrounded: THREE.Vector3;
  private lastBodyPosition: THREE.Vector3;

  /**
   * Create a new procedural gait system.
   *
   * @param config - Gait configuration (step length, height, timing, body motion)
   */
  constructor(config: Partial<GaitConfig> = {}) {
    this.config = {
      stepLength: config.stepLength ?? 0.8,
      stepHeight: config.stepHeight ?? 0.15,
      stepDuration: config.stepDuration ?? 0.4,
      bodyBob: config.bodyBob ?? 0.05,
      bodySwayAmplitude: config.bodySwayAmplitude ?? 0.02,
      hipRotation: config.hipRotation ?? 0.1,
      phaseOffset: config.phaseOffset ?? 0.5,
      footOvershoot: config.footOvershoot ?? 0.1,
    };
    this.leftFootGrounded = new THREE.Vector3();
    this.rightFootGrounded = new THREE.Vector3();
    this.lastBodyPosition = new THREE.Vector3();
  }

  update(
    bodyPosition: THREE.Vector3,
    bodyForward: THREE.Vector3,
    velocity: THREE.Vector3,
    deltaTime: number
  ): GaitState {
    const speed = velocity.length();

    if (speed < 0.01) {
      return {
        phase: this.phase,
        leftFootTarget: this.leftFootGrounded.clone(),
        rightFootTarget: this.rightFootGrounded.clone(),
        leftFootLifted: false,
        rightFootLifted: false,
        bodyOffset: new THREE.Vector3(),
        bodyRotation: new THREE.Euler(),
      };
    }

    const stepSpeed = speed / this.config.stepLength;
    this.phase += stepSpeed * deltaTime;
    this.phase = this.phase % 1;

    const hipOffset = bodyForward
      .clone()
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize()
      .multiplyScalar(0.15);

    const leftPhase = this.phase;
    const rightPhase = (this.phase + this.config.phaseOffset) % 1;

    const leftFootLifted = leftPhase < 0.5;
    const rightFootLifted = rightPhase < 0.5;

    const leftFootTarget = this.calculateFootTarget(
      bodyPosition,
      bodyForward,
      velocity,
      hipOffset.clone().multiplyScalar(-1),
      leftPhase,
      leftFootLifted
    );

    const rightFootTarget = this.calculateFootTarget(
      bodyPosition,
      bodyForward,
      velocity,
      hipOffset,
      rightPhase,
      rightFootLifted
    );

    if (!leftFootLifted) this.leftFootGrounded.copy(leftFootTarget);
    if (!rightFootLifted) this.rightFootGrounded.copy(rightFootTarget);

    const bodyBob = Math.sin(this.phase * Math.PI * 2) * this.config.bodyBob;
    const bodySway = Math.sin(this.phase * Math.PI * 2) * this.config.bodySwayAmplitude;
    const bodyOffset = new THREE.Vector3(bodySway, bodyBob, 0);

    const hipRotationAngle = Math.sin(this.phase * Math.PI * 2) * this.config.hipRotation;
    const bodyRotation = new THREE.Euler(0, hipRotationAngle, 0);

    this.lastBodyPosition.copy(bodyPosition);

    return {
      phase: this.phase,
      leftFootTarget,
      rightFootTarget,
      leftFootLifted,
      rightFootLifted,
      bodyOffset,
      bodyRotation,
    };
  }

  private calculateFootTarget(
    bodyPosition: THREE.Vector3,
    _bodyForward: THREE.Vector3,
    velocity: THREE.Vector3,
    hipOffset: THREE.Vector3,
    phase: number,
    isLifted: boolean
  ): THREE.Vector3 {
    const basePosition = bodyPosition.clone().add(hipOffset);
    basePosition.y = 0;

    if (!isLifted) {
      return basePosition;
    }

    const liftPhase = phase * 2;
    const strideOffset = velocity
      .clone()
      .normalize()
      .multiplyScalar(this.config.stepLength * (1 + this.config.footOvershoot) * (1 - liftPhase));

    const height = Math.sin(liftPhase * Math.PI) * this.config.stepHeight;

    return basePosition.clone().add(strideOffset).setY(height);
  }

  reset(): void {
    this.phase = 0;
    this.leftFootGrounded.set(0, 0, 0);
    this.rightFootGrounded.set(0, 0, 0);
  }

  getPhase(): number {
    return this.phase;
  }

  setPhase(phase: number): void {
    this.phase = phase % 1;
  }
}
