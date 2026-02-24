/**
 * Core Animation and Kinematics System.
 *
 * Build life-like character animations without keyframes! This module delivers production-ready
 * inverse kinematics (IK), spring physics, and procedural locomotion for React Three Fiber applications.
 *
 * ## Why This Module?
 *
 * - **Zero Keyframes Needed**: Generate natural motion algorithmically - arms reaching, tails swaying,
 *   legs walking, all computed in real-time
 * - **Battle-Tested Algorithms**: FABRIK and CCD IK solvers used in AAA games, optimized for web
 * - **Physics-Driven**: Spring dynamics for hair, cloth, tails, and secondary motion
 * - **Procedural Locomotion**: Walk/run/sneak gaits that adapt to terrain and velocity
 * - **Pure TypeScript**: Framework-agnostic core logic - use with React, vanilla Three.js, or anything
 *
 * ## Interactive Demos
 *
 * - 🎮 [Live Animation Demo](http://jonbogaty.com/nodejs-strata/demos/animation.html) - See IK, springs, and gaits in action
 * - 📦 [Character Examples](https://github.com/jbcom/strata-game-library/tree/main/examples/characters) - Full character implementations
 * - 📚 [API Reference](http://jonbogaty.com/nodejs-strata/api) - Complete documentation
 *
 * ## Quick Start
 *
 * @example
 * ```typescript
 * import { FABRIKSolver, createBoneChainFromLengths, SpringDynamics, ProceduralGait } from '@jbcom/strata';
 * import * as THREE from 'three';
 *
 * // Create an IK chain for an arm reaching to a target
 * const armRoot = new THREE.Object3D();
 * const armChain = createBoneChainFromLengths(armRoot, [0.3, 0.25]); // upper arm, forearm
 * const solver = new FABRIKSolver(0.001, 20);
 * const targetPos = new THREE.Vector3(1, 2, 0);
 * const result = solver.solve(armChain, targetPos);
 * solver.apply(armChain, result);
 *
 * // Add spring physics to hair or tail
 * const spring = new SpringDynamics({ stiffness: 100, damping: 10, mass: 1 });
 * const hairTarget = new THREE.Vector3(0, 1, 0);
 * const hairPos = spring.update(hairTarget, deltaTime);
 *
 * // Create procedural walking animation
 * const gait = new ProceduralGait({ stepLength: 0.8, stepHeight: 0.15 });
 * const bodyPos = new THREE.Vector3(0, 1, 0);
 * const forward = new THREE.Vector3(0, 0, 1);
 * const velocity = new THREE.Vector3(0, 0, 2);
 * const state = gait.update(bodyPos, forward, velocity, deltaTime);
 * // Use state.leftFootTarget and state.rightFootTarget to position feet
 * ```
 *
 * @packageDocumentation
 * @module core/animation
 * @category Entities & Simulation
 */

import * as THREE from 'three';

/**
 * Data representing a chain of connected bones.
 * @category Entities & Simulation
 */
export interface BoneChain {
  /** Array of Three.js objects acting as bones. */
  bones: THREE.Object3D[];
  /** Pre-calculated distance between each bone and its successor. */
  lengths: number[];
  /** Total combined length of the bone chain. */
  totalLength: number;
  /** Optional angular or linear constraints per bone. */
  constraints?: BoneConstraint[];
}

/**
 * Physical constraint applied to a specific bone in a chain.
 * @category Entities & Simulation
 */
export interface BoneConstraint {
  /** Index of the bone in the BoneChain. */
  boneIndex: number;
  /** Minimum allowed rotation angle in radians. */
  minAngle?: number;
  /** Maximum allowed rotation angle in radians. */
  maxAngle?: number;
  /** Primary axis for hinge or twist constraints. */
  axis?: THREE.Vector3;
  /** Algorithm used for limiting movement. */
  limitType?: 'hinge' | 'ball' | 'twist';
  /** Minimum twist angle. */
  twistMin?: number;
  /** Maximum twist angle. */
  twistMax?: number;
  /** Maximum allowed swing angle for ball joints. */
  swingLimit?: number;
}

/**
 * Result of an IK solver execution.
 * @category Entities & Simulation
 */
export interface IKSolverResult {
  /** Array of computed world positions for each bone. */
  positions: THREE.Vector3[];
  /** Array of computed local rotations for each bone. */
  rotations: THREE.Quaternion[];
  /** Whether the target was successfully reached within tolerance. */
  reached: boolean;
  /** Total iterations performed by the solver. */
  iterations: number;
  /** Final distance from end effector to target. */
  error: number;
}

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
 * Create a bone chain from existing Three.js objects.
 *
 * Analyzes a hierarchy of objects and calculates the distances between them to create
 * an IK-ready bone chain. Useful when working with imported models or manually placed objects.
 *
 * @category Entities & Simulation
 *
 * @param bones - Array of Three.js objects representing bones in parent-child order
 * @returns A bone chain with calculated lengths and total length
 *
 * @example
 * ```typescript
 * // Create chain from existing scene objects
 * const shoulder = scene.getObjectByName('shoulder');
 * const elbow = scene.getObjectByName('elbow');
 * const wrist = scene.getObjectByName('wrist');
 *
 * const armChain = createBoneChain([shoulder, elbow, wrist]);
 * console.log(armChain.totalLength); // Total arm reach
 * console.log(armChain.lengths); // [upperArmLength, forearmLength]
 * ```
 */
export function createBoneChain(bones: THREE.Object3D[]): BoneChain {
  const lengths: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < bones.length - 1; i++) {
    const bonePos = new THREE.Vector3();
    const nextBonePos = new THREE.Vector3();
    bones[i].getWorldPosition(bonePos);
    bones[i + 1].getWorldPosition(nextBonePos);
    const length = bonePos.distanceTo(nextBonePos);
    lengths.push(length);
    totalLength += length;
  }

  return { bones, lengths, totalLength };
}

/**
 * Create a bone chain procedurally from specified lengths.
 *
 * Generates a new hierarchy of Three.js objects positioned according to the provided lengths.
 * Perfect for creating IK chains programmatically or prototyping character rigs.
 *
 * @category Entities & Simulation
 *
 * @param root - The root object to attach the chain to
 * @param boneLengths - Array of bone lengths (each creates one segment)
 * @param direction - Direction to extend the chain (default: downward [0, -1, 0])
 * @returns A bone chain with the generated objects
 *
 * @example
 * ```typescript
 * // Create a 3-segment tentacle
 * const tentacleRoot = new THREE.Object3D();
 * scene.add(tentacleRoot);
 *
 * const tentacle = createBoneChainFromLengths(
 *   tentacleRoot,
 *   [0.5, 0.4, 0.3], // Lengths taper toward the tip
 *   new THREE.Vector3(0, -1, 0) // Hang downward
 * );
 *
 * // Now use with an IK solver
 * const solver = new FABRIKSolver();
 * const target = new THREE.Vector3(1, -1, 0);
 * const result = solver.solve(tentacle, target);
 * solver.apply(tentacle, result);
 * ```
 */
export function createBoneChainFromLengths(
  root: THREE.Object3D,
  boneLengths: number[],
  direction: THREE.Vector3 = new THREE.Vector3(0, -1, 0)
): BoneChain {
  const bones: THREE.Object3D[] = [root];
  const normalizedDir = direction.clone().normalize();
  let totalLength = 0;

  let parent = root;
  for (let i = 0; i < boneLengths.length; i++) {
    const bone = new THREE.Object3D();
    bone.position.copy(normalizedDir.clone().multiplyScalar(boneLengths[i]));
    parent.add(bone);
    bones.push(bone);
    totalLength += boneLengths[i];
    parent = bone;
  }

  return { bones, lengths: boneLengths, totalLength };
}

/**
 * Forward And Backward Reaching Inverse Kinematics (FABRIK) Solver.
 *
 * Industry-standard IK algorithm used in games like The Witcher 3 and Uncharted.
 * Provides fast, stable convergence for multi-bone chains like arms, tentacles, tails, and spines.
 *
 * **When to use FABRIK:**
 * - Multi-segment chains (3+ bones)
 * - Smooth, natural-looking motion
 * - Arms, legs, tentacles, spines
 * - When you need pole targets for elbow/knee direction
 *
 * **Algorithm Overview:**
 * 1. **Backward Pass**: Start at end effector, pull toward target
 * 2. **Forward Pass**: Start at root, restore correct bone lengths
 * 3. **Repeat**: Until target is reached or max iterations exceeded
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Spider leg reaching for ground
 * const legRoot = new THREE.Object3D();
 * const legChain = createBoneChainFromLengths(
 *   legRoot,
 *   [0.2, 0.3, 0.25, 0.15] // 4-segment leg
 * );
 *
 * const solver = new FABRIKSolver(
 *   0.001, // tolerance: stop when within 1mm of target
 *   20     // max iterations per frame
 * );
 *
 * // Solve for foot position on terrain
 * const groundTarget = new THREE.Vector3(1.5, 0, 0.5);
 * const result = solver.solve(legChain, groundTarget);
 *
 * if (result.reached) {
 *   console.log(`Reached target in ${result.iterations} iterations`);
 *   solver.apply(legChain, result); // Apply rotations to bones
 * } else {
 *   console.log(`Target out of reach by ${result.error.toFixed(3)}m`);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Character arm with pole target for elbow direction
 * const armChain = createBoneChainFromLengths(armRoot, [0.3, 0.25]);
 * const solver = new FABRIKSolver();
 *
 * // Target is where the hand should go
 * const handTarget = new THREE.Vector3(0.5, 1.5, 0.3);
 *
 * // Pole target controls where the elbow points
 * const elbowPole = new THREE.Vector3(0, 1.5, 0.5); // Point elbow forward
 *
 * const result = solver.solve(armChain, handTarget, elbowPole);
 * solver.apply(armChain, result);
 * ```
 *
 * @see {@link CCDSolver} - Alternative algorithm for different use cases
 * @see {@link TwoBoneIKSolver} - Optimized solver for exactly 2 bones
 */
export class FABRIKSolver {
  private tolerance: number;
  private maxIterations: number;

  /**
   * Create a new FABRIK solver.
   *
   * @param tolerance - Distance threshold for convergence (meters). Default: 0.001
   * @param maxIterations - Maximum solver iterations per frame. Default: 20
   */
  constructor(tolerance: number = 0.001, maxIterations: number = 20) {
    this.tolerance = tolerance;
    this.maxIterations = maxIterations;
  }

  /**
   * Solve IK for a bone chain to reach a target position.
   *
   * Computes joint angles needed to position the end effector at the target.
   * If the target is out of reach, the chain stretches as far as possible.
   *
   * @param chain - The bone chain to solve
   * @param target - World position the end effector should reach
   * @param pole - Optional pole target to control mid-joint orientation (e.g., elbow/knee direction)
   * @returns Solver result with positions, rotations, and convergence info
   *
   * @example
   * ```typescript
   * const solver = new FABRIKSolver();
   * const result = solver.solve(armChain, targetPos);
   *
   * // Check if solution is valid
   * if (result.reached) {
   *   solver.apply(armChain, result);
   * }
   *
   * // Monitor performance
   * console.log(`Converged in ${result.iterations} iterations`);
   * console.log(`Final error: ${result.error.toFixed(4)}m`);
   * ```
   */
  solve(chain: BoneChain, target: THREE.Vector3, pole?: THREE.Vector3): IKSolverResult {
    const positions = chain.bones.map((bone) => {
      const pos = new THREE.Vector3();
      bone.getWorldPosition(pos);
      return pos;
    });

    const rootPosition = positions[0].clone();
    const targetDistance = rootPosition.distanceTo(target);

    if (targetDistance > chain.totalLength) {
      const direction = target.clone().sub(rootPosition).normalize();
      for (let i = 1; i < positions.length; i++) {
        positions[i].copy(
          positions[i - 1].clone().add(direction.clone().multiplyScalar(chain.lengths[i - 1]))
        );
      }

      const rotations = this.calculateRotations(chain, positions, pole);
      return {
        positions,
        rotations,
        reached: false,
        iterations: 1,
        error: targetDistance - chain.totalLength,
      };
    }

    let error = Infinity;
    let iterations = 0;

    while (error > this.tolerance && iterations < this.maxIterations) {
      this.backward(positions, target, chain.lengths);
      this.forward(positions, rootPosition, chain.lengths);

      error = positions[positions.length - 1].distanceTo(target);
      iterations++;
    }

    if (pole) {
      this.applyPoleConstraint(positions, pole, chain.lengths);
    }

    if (chain.constraints) {
      this.applyConstraints(positions, chain.constraints);
    }

    const rotations = this.calculateRotations(chain, positions, pole);

    return {
      positions,
      rotations,
      reached: error <= this.tolerance,
      iterations,
      error,
    };
  }

  private backward(positions: THREE.Vector3[], target: THREE.Vector3, lengths: number[]): void {
    positions[positions.length - 1].copy(target);

    for (let i = positions.length - 2; i >= 0; i--) {
      const direction = positions[i]
        .clone()
        .sub(positions[i + 1])
        .normalize();
      positions[i].copy(positions[i + 1].clone().add(direction.multiplyScalar(lengths[i])));
    }
  }

  private forward(positions: THREE.Vector3[], root: THREE.Vector3, lengths: number[]): void {
    positions[0].copy(root);

    for (let i = 1; i < positions.length; i++) {
      const direction = positions[i]
        .clone()
        .sub(positions[i - 1])
        .normalize();
      positions[i].copy(positions[i - 1].clone().add(direction.multiplyScalar(lengths[i - 1])));
    }
  }

  private applyPoleConstraint(
    positions: THREE.Vector3[],
    pole: THREE.Vector3,
    lengths: number[]
  ): void {
    if (positions.length < 3) return;

    const rootToEnd = positions[positions.length - 1].clone().sub(positions[0]);
    const chainAxis = rootToEnd.clone().normalize();

    for (let i = 1; i < positions.length - 1; i++) {
      const rootToBone = positions[i].clone().sub(positions[0]);
      const projection = chainAxis.clone().multiplyScalar(rootToBone.dot(chainAxis));
      const projectionPoint = positions[0].clone().add(projection);

      const rootToPole = pole.clone().sub(positions[0]);
      const poleProjection = chainAxis.clone().multiplyScalar(rootToPole.dot(chainAxis));
      const polePlanePoint = pole.clone().sub(poleProjection);

      const currentDirRaw = positions[i].clone().sub(projectionPoint);
      const poleDirRaw = polePlanePoint.sub(positions[0]);

      // Check lengths before normalizing (normalize always returns length 1 for non-zero vectors)
      if (currentDirRaw.lengthSq() > 0.000001 && poleDirRaw.lengthSq() > 0.000001) {
        const currentDir = currentDirRaw.normalize();
        const poleDir = poleDirRaw.normalize();
        const currentAngle = Math.atan2(
          currentDir.dot(new THREE.Vector3().crossVectors(chainAxis, poleDir)),
          currentDir.dot(poleDir)
        );

        const rotationQuat = new THREE.Quaternion().setFromAxisAngle(chainAxis, -currentAngle);
        const distFromProjection = positions[i].distanceTo(projectionPoint);

        positions[i].copy(projectionPoint);
        const rotatedOffset = poleDir.clone().multiplyScalar(distFromProjection);
        rotatedOffset.applyQuaternion(rotationQuat);
        positions[i].add(rotatedOffset);
      }
    }

    for (let i = 1; i < positions.length; i++) {
      const direction = positions[i]
        .clone()
        .sub(positions[i - 1])
        .normalize();
      positions[i].copy(positions[i - 1].clone().add(direction.multiplyScalar(lengths[i - 1])));
    }
  }

  private applyConstraints(positions: THREE.Vector3[], constraints: BoneConstraint[]): void {
    for (const constraint of constraints) {
      const idx = constraint.boneIndex;
      if (idx <= 0 || idx >= positions.length - 1) continue;

      const parent = positions[idx - 1];
      const current = positions[idx];
      const child = positions[idx + 1];

      const parentToChild = child.clone().sub(parent).normalize();
      const parentToCurrent = current.clone().sub(parent).normalize();

      const originalAngle = Math.acos(
        Math.max(-1, Math.min(1, parentToChild.dot(parentToCurrent)))
      );
      let clampedAngle = originalAngle;

      if (constraint.minAngle !== undefined && clampedAngle < constraint.minAngle) {
        clampedAngle = constraint.minAngle;
      }
      if (constraint.maxAngle !== undefined && clampedAngle > constraint.maxAngle) {
        clampedAngle = constraint.maxAngle;
      }

      // Apply the constrained angle if it differs from the original
      if (Math.abs(clampedAngle - originalAngle) > 0.0001) {
        const axis = new THREE.Vector3().crossVectors(parentToChild, parentToCurrent);
        if (axis.lengthSq() > 0.0001) {
          axis.normalize();
          const angleDiff = clampedAngle - originalAngle;
          const rotation = new THREE.Quaternion().setFromAxisAngle(axis, angleDiff);
          const currentOffset = current.clone().sub(parent);
          currentOffset.applyQuaternion(rotation);
          positions[idx].copy(parent).add(currentOffset);
        }
      }
    }
  }

  private calculateRotations(
    chain: BoneChain,
    positions: THREE.Vector3[],
    _pole?: THREE.Vector3
  ): THREE.Quaternion[] {
    const rotations: THREE.Quaternion[] = [];

    for (let i = 0; i < chain.bones.length - 1; i++) {
      const bone = chain.bones[i];
      const currentPos = positions[i];
      const nextPos = positions[i + 1];

      const direction = nextPos.clone().sub(currentPos).normalize();

      const defaultDir = new THREE.Vector3(0, 1, 0);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultDir, direction);

      const worldQuat = bone.parent
        ? bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(quaternion)
        : quaternion;

      rotations.push(worldQuat);
    }

    rotations.push(new THREE.Quaternion());

    return rotations;
  }

  /**
   * Apply solved rotations to the bone chain.
   *
   * Takes the computed rotations from solve() and applies them to the actual Three.js objects.
   * Call this after solving to update your scene.
   *
   * @param chain - The bone chain to modify
   * @param result - The solver result containing rotations
   *
   * @example
   * ```typescript
   * const result = solver.solve(chain, target);
   * solver.apply(chain, result); // Bones now point toward target
   * ```
   */
  apply(chain: BoneChain, result: IKSolverResult): void {
    for (let i = 0; i < chain.bones.length; i++) {
      const bone = chain.bones[i];

      if (i < result.rotations.length) {
        bone.quaternion.copy(result.rotations[i]);
      }
    }
  }
}

/**
 * Cyclic Coordinate Descent (CCD) IK Solver.
 *
 * Alternative IK algorithm that iterates from end to root, rotating each joint to point
 * toward the target. Often faster than FABRIK but can produce less natural-looking results.
 *
 * **When to use CCD:**
 * - Chains with many segments (5+ bones) where speed matters
 * - Mechanical/robotic motion (less organic than FABRIK)
 * - Spines, tails, or tentacles that need quick response
 * - When pole targets aren't needed
 *
 * **Algorithm Overview:**
 * 1. Start at the joint nearest the end effector
 * 2. Rotate that joint to point end effector toward target
 * 3. Move to next joint toward root, repeat
 * 4. Loop until converged or max iterations
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Long mechanical arm with many segments
 * const armChain = createBoneChainFromLengths(
 *   armRoot,
 *   [0.2, 0.2, 0.2, 0.2, 0.2] // 5 equal segments
 * );
 *
 * const solver = new CCDSolver(
 *   0.002,  // tolerance
 *   25,     // max iterations (CCD may need more than FABRIK)
 *   0.8     // damping factor (0.8 = smoother, less snappy)
 * );
 *
 * const result = solver.solve(armChain, targetPos);
 * solver.apply(armChain, result);
 * ```
 *
 * @example
 * ```typescript
 * // Character spine bending toward look target
 * const spineChain = createBoneChainFromLengths(
 *   spineRoot,
 *   [0.1, 0.1, 0.1, 0.1, 0.1] // 5 spine segments
 * );
 *
 * // CCD is great for spines - fast and responsive
 * const solver = new CCDSolver(0.001, 15, 1.0);
 * const result = solver.solve(spineChain, headTarget);
 * solver.apply(spineChain, result);
 * ```
 *
 * @see {@link FABRIKSolver} - Often produces more natural results
 * @see {@link TwoBoneIKSolver} - Optimized for exactly 2 bones
 */
export class CCDSolver {
  private tolerance: number;
  private maxIterations: number;
  private dampingFactor: number;

  /**
   * Create a new CCD solver.
   *
   * @param tolerance - Distance threshold for convergence (meters). Default: 0.001
   * @param maxIterations - Maximum solver iterations per frame. Default: 20
   * @param dampingFactor - Rotation damping (0-1). Lower = smoother but slower. Default: 1.0
   */
  constructor(tolerance: number = 0.001, maxIterations: number = 20, dampingFactor: number = 1.0) {
    this.tolerance = tolerance;
    this.maxIterations = maxIterations;
    this.dampingFactor = dampingFactor;
  }

  /**
   * Solve IK for a bone chain to reach a target position.
   *
   * Uses cyclic coordinate descent to iteratively rotate joints toward the target.
   *
   * @param chain - The bone chain to solve
   * @param target - World position the end effector should reach
   * @returns Solver result with positions, rotations, and convergence info
   *
   * @example
   * ```typescript
   * const solver = new CCDSolver(0.002, 25, 0.8);
   * const result = solver.solve(tentacleChain, foodPosition);
   *
   * if (result.reached) {
   *   solver.apply(tentacleChain, result);
   * }
   * ```
   */
  solve(chain: BoneChain, target: THREE.Vector3): IKSolverResult {
    const positions = chain.bones.map((bone) => {
      const pos = new THREE.Vector3();
      bone.getWorldPosition(pos);
      return pos;
    });

    const rotations = chain.bones.map((bone) => bone.quaternion.clone());

    let error = Infinity;
    let iterations = 0;

    while (error > this.tolerance && iterations < this.maxIterations) {
      for (let i = chain.bones.length - 2; i >= 0; i--) {
        const _bone = chain.bones[i];
        const bonePos = positions[i];
        const endEffector = positions[positions.length - 1];

        const toEndRaw = endEffector.clone().sub(bonePos);
        const toTargetRaw = target.clone().sub(bonePos);

        // Check lengths before normalizing (normalize always returns length 1 for non-zero vectors)
        if (toEndRaw.lengthSq() < 0.000001 || toTargetRaw.lengthSq() < 0.000001) continue;

        const toEnd = toEndRaw.normalize();
        const toTarget = toTargetRaw.normalize();

        const rotationAxis = new THREE.Vector3().crossVectors(toEnd, toTarget);
        if (rotationAxis.length() < 0.001) continue;

        rotationAxis.normalize();
        let angle = Math.acos(Math.max(-1, Math.min(1, toEnd.dot(toTarget))));
        angle *= this.dampingFactor;

        if (chain.constraints) {
          const constraint = chain.constraints.find((c) => c.boneIndex === i);
          if (constraint) {
            if (constraint.maxAngle !== undefined) {
              angle = Math.min(angle, constraint.maxAngle);
            }
          }
        }

        const rotation = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
        rotations[i].premultiply(rotation);

        this.updatePositions(positions, rotations, chain);
      }

      error = positions[positions.length - 1].distanceTo(target);
      iterations++;
    }

    return {
      positions,
      rotations,
      reached: error <= this.tolerance,
      iterations,
      error,
    };
  }

  private updatePositions(
    positions: THREE.Vector3[],
    rotations: THREE.Quaternion[],
    chain: BoneChain
  ): void {
    for (let i = 1; i < positions.length; i++) {
      const direction = new THREE.Vector3(0, 1, 0)
        .applyQuaternion(rotations[i - 1])
        .multiplyScalar(chain.lengths[i - 1]);
      positions[i].copy(positions[i - 1]).add(direction);
    }
  }

  apply(chain: BoneChain, result: IKSolverResult): void {
    for (let i = 0; i < chain.bones.length; i++) {
      chain.bones[i].quaternion.copy(result.rotations[i]);
    }
  }
}

/**
 * Two-Bone IK Solver (Analytical Solution).
 *
 * Specialized, high-performance IK solver for exactly 2-bone chains like arms and legs.
 * Uses analytical geometry instead of iterative solving, making it faster and more predictable
 * than FABRIK or CCD for this specific use case.
 *
 * **When to use TwoBoneIK:**
 * - Human/creature arms (shoulder → elbow → wrist)
 * - Human/creature legs (hip → knee → foot)
 * - Any exactly 2-joint system
 * - When you need guaranteed single-frame solution
 * - When performance is critical
 *
 * **Features:**
 * - Analytical solution (no iterations needed)
 * - Pole target for controlling elbow/knee direction
 * - Handles out-of-reach targets gracefully
 * - Deterministic - same input always gives same output
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Character arm reaching for object
 * const solver = new TwoBoneIKSolver();
 *
 * // Arm bones
 * const shoulder = character.getObjectByName('shoulder');
 * const elbow = character.getObjectByName('elbow');
 * const wrist = character.getObjectByName('wrist');
 *
 * // Where the hand should reach
 * const targetPos = pickedUpObject.position;
 *
 * // Control elbow direction (point forward)
 * const elbowPole = shoulder.position.clone().add(new THREE.Vector3(0, 0, 1));
 *
 * // Solve and apply
 * solver.solveLimb(shoulder, elbow, wrist, targetPos, elbowPole);
 * ```
 *
 * @example
 * ```typescript
 * // Character leg stepping on terrain
 * const solver = new TwoBoneIKSolver();
 *
 * const hip = character.getObjectByName('leftHip');
 * const knee = character.getObjectByName('leftKnee');
 * const foot = character.getObjectByName('leftFoot');
 *
 * // Ground position from raycast
 * const groundPos = raycaster.intersectObject(terrain)[0].point;
 *
 * // Knee points forward
 * const kneePole = hip.position.clone().add(new THREE.Vector3(0, 0, 1));
 *
 * solver.solveLimb(hip, knee, foot, groundPos, kneePole);
 * ```
 *
 * @example
 * ```typescript
 * // Low-level API for custom control
 * const result = solver.solve(
 *   shoulderPos,
 *   elbowPos,  // Current position (ignored, recalculated)
 *   wristPos,  // Current position (ignored, recalculated)
 *   targetPos,
 *   polePos,
 *   0.3,  // Upper arm length
 *   0.25  // Forearm length
 * );
 *
 * // Manually apply result
 * elbow.position.copy(result.midPosition);
 * wrist.position.copy(result.endPosition);
 * shoulder.quaternion.copy(result.upperRotation);
 * elbow.quaternion.copy(result.lowerRotation);
 * ```
 */
export class TwoBoneIKSolver {
  solve(
    rootPos: THREE.Vector3,
    _midPos: THREE.Vector3,
    _endPos: THREE.Vector3,
    target: THREE.Vector3,
    poleTarget: THREE.Vector3,
    upperLength: number,
    lowerLength: number
  ): {
    midPosition: THREE.Vector3;
    endPosition: THREE.Vector3;
    upperRotation: THREE.Quaternion;
    lowerRotation: THREE.Quaternion;
  } {
    const totalLength = upperLength + lowerLength;
    const targetDistance = rootPos.distanceTo(target);

    const clampedDistance = Math.min(targetDistance, totalLength * 0.9999);
    const actualTarget =
      clampedDistance < targetDistance
        ? rootPos
            .clone()
            .add(target.clone().sub(rootPos).normalize().multiplyScalar(clampedDistance))
        : target.clone();

    const a = upperLength;
    const b = lowerLength;
    const c = clampedDistance;

    // Guard against division by zero when bone lengths or distance are zero
    const MIN_LENGTH = 0.0001;
    const safeA = Math.max(a, MIN_LENGTH);
    const safeB = Math.max(b, MIN_LENGTH);
    const safeC = Math.max(c, MIN_LENGTH);

    const cosAngleA = Math.max(
      -1,
      Math.min(1, (safeA * safeA + safeC * safeC - safeB * safeB) / (2 * safeA * safeC))
    );
    const angleA = Math.acos(cosAngleA);

    const cosAngleB = Math.max(
      -1,
      Math.min(1, (safeA * safeA + safeB * safeB - safeC * safeC) / (2 * safeA * safeB))
    );
    const _angleB = Math.acos(cosAngleB);

    const rootToTarget = actualTarget.clone().sub(rootPos).normalize();
    const rootToPole = poleTarget.clone().sub(rootPos);

    const perpendicular = new THREE.Vector3().crossVectors(rootToTarget, rootToPole).normalize();

    const _poleDirection = new THREE.Vector3()
      .crossVectors(perpendicular, rootToTarget)
      .normalize();

    const upperRotation = new THREE.Quaternion();
    const rotationAxis = perpendicular;
    upperRotation.setFromAxisAngle(rotationAxis, angleA);

    const midDirection = rootToTarget.clone().applyQuaternion(upperRotation);
    const midPosition = rootPos.clone().add(midDirection.multiplyScalar(upperLength));

    const midToTarget = actualTarget.clone().sub(midPosition).normalize();
    const lowerRotation = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      midToTarget
    );

    const endPosition = midPosition.clone().add(midToTarget.multiplyScalar(lowerLength));

    return {
      midPosition,
      endPosition,
      upperRotation,
      lowerRotation,
    };
  }

  solveLimb(
    root: THREE.Object3D,
    mid: THREE.Object3D,
    end: THREE.Object3D,
    target: THREE.Vector3,
    poleTarget: THREE.Vector3
  ): void {
    const rootPos = new THREE.Vector3();
    const midPos = new THREE.Vector3();
    const endPos = new THREE.Vector3();

    root.getWorldPosition(rootPos);
    mid.getWorldPosition(midPos);
    end.getWorldPosition(endPos);

    const upperLength = rootPos.distanceTo(midPos);
    const lowerLength = midPos.distanceTo(endPos);

    const result = this.solve(
      rootPos,
      midPos,
      endPos,
      target,
      poleTarget,
      upperLength,
      lowerLength
    );

    const rootWorldQuat = root.parent
      ? root.parent.getWorldQuaternion(new THREE.Quaternion())
      : new THREE.Quaternion();

    const localUpperQuat = rootWorldQuat.clone().invert().multiply(result.upperRotation);
    root.quaternion.copy(localUpperQuat);

    root.updateMatrixWorld(true);

    const midWorldQuat = mid.parent
      ? mid.parent.getWorldQuaternion(new THREE.Quaternion())
      : new THREE.Quaternion();

    const localLowerQuat = midWorldQuat.clone().invert().multiply(result.lowerRotation);
    mid.quaternion.copy(localLowerQuat);
  }
}

/**
 * Look-At Controller with Constraints and Smoothing.
 *
 * Rotates objects to face targets with natural motion, angular limits, dead zones, and smooth damping.
 * Perfect for character heads, eyes, cameras, turrets, or any tracking behavior.
 *
 * **Features:**
 * - Maximum angle constraints (prevent unrealistic rotations)
 * - Dead zone (ignore small movements)
 * - Smooth damping (no instant snapping)
 * - Exponential smoothing for natural feel
 *
 * **Use Cases:**
 * - Character head tracking player
 * - Eyes following cursor
 * - Camera smooth follow
 * - Turret tracking enemies
 * - NPCs watching interesting objects
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Character head tracking player
 * const headController = new LookAtController({
 *   maxAngle: Math.PI / 3,  // Can't turn head more than 60°
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
 *
 * @example
 * ```typescript
 * // Lazy eye tracking (slow, large deadzone)
 * const eyeController = new LookAtController({
 *   maxAngle: Math.PI / 4,  // Limited range
 *   speed: 2,               // Slow tracking
 *   deadzone: 0.2,          // Large deadzone
 *   smoothing: 0.15         // Very smooth
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Snappy turret tracking (fast, no deadzone)
 * const turretController = new LookAtController({
 *   maxAngle: Math.PI,      // Full rotation
 *   speed: 10,              // Fast
 *   deadzone: 0,            // No deadzone
 *   smoothing: 0.05         // Minimal smoothing
 * });
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
 * Physical Spring Dynamics System.
 *
 * Simulates realistic spring-mass-damper physics for secondary motion like hair, cloth, tails,
 * and dangling objects. Based on Hooke's law with velocity damping.
 *
 * **Use Cases:**
 * - Hair strands that bounce and sway
 * - Cape/cloth simulation (combine multiple springs)
 * - Antenna, tails, ears that react to movement
 * - Camera shake with spring return
 * - UI elements with springy feedback
 *
 * **Physics Parameters:**
 * - **Stiffness**: How strongly the spring returns to rest (higher = stiffer, snappier)
 * - **Damping**: How quickly oscillations decay (higher = less bounce, more drag)
 * - **Mass**: Inertia of the object (higher = more momentum, slower response)
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
 *
 * @example
 * ```typescript
 * // Stiff antenna that snaps back quickly
 * const antenna = new SpringDynamics({
 *   stiffness: 500,  // Very stiff
 *   damping: 25,     // High damping = no bounce
 *   mass: 0.3        // Light mass = fast response
 * });
 *
 * // React to head movement
 * const restPos = head.position.clone().add(new THREE.Vector3(0, 0.2, 0));
 * const antennaPos = antenna.update(restPos, deltaTime);
 * ```
 *
 * @example
 * ```typescript
 * // Gravity-affected cape
 * const cape = new SpringDynamics({
 *   stiffness: 80,
 *   damping: 6,
 *   mass: 2  // Heavier = more droop
 * });
 *
 * const gravity = new THREE.Vector3(0, -9.8, 0);
 * const shoulderPos = character.shoulder.position;
 * const targetPos = shoulderPos.clone().add(
 *   gravity.clone().multiplyScalar(0.02) // Add gravity influence
 * );
 * const capePos = cape.update(targetPos, deltaTime);
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
   * Computes spring force, damping force, and updates position based on physics simulation.
   *
   * @param targetPosition - The position the spring is attached to (moves with parent object)
   * @param deltaTime - Time step in seconds (typically frame delta)
   * @returns New position of the spring
   *
   * @example
   * ```typescript
   * const spring = new SpringDynamics({ stiffness: 100, damping: 10, mass: 1 });
   *
   * // In render loop
   * function animate(deltaTime: number) {
   *   const targetPos = parentObject.position;
   *   const springPos = spring.update(targetPos, deltaTime);
   *   childObject.position.copy(springPos);
   * }
   * ```
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
 * follows the one before it with spring physics. Creates realistic swaying, dragging motion.
 *
 * **Use Cases:**
 * - Character tails (dragon, cat, lizard)
 * - Hair strands or ponytails
 * - Ropes, chains, vines
 * - Tentacles with secondary motion
 * - Cloth strips or ribbons
 *
 * **Features:**
 * - Automatic length constraints
 * - Gravity influence
 * - Progressive stiffness (base is stiffer than tip)
 * - Progressive damping (tip has more drag)
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Dragon tail with 8 segments
 * const tail = new SpringChain(
 *   8,                          // Number of segments
 *   {
 *     stiffness: 100,           // Base stiffness
 *     damping: 10,              // Base damping
 *     mass: 1
 *   },
 *   0.4                         // Segment length
 * );
 *
 * // In update loop
 * function animate(deltaTime: number) {
 *   const rootPos = dragon.tailRoot.position;
 *   const rootQuat = dragon.tailRoot.quaternion;
 *   const gravity = new THREE.Vector3(0, -9.8, 0);
 *
 *   const positions = tail.update(rootPos, rootQuat, deltaTime, gravity);
 *
 *   // Position tail segments
 *   positions.forEach((pos, i) => {
 *     if (tailSegments[i]) {
 *       tailSegments[i].position.copy(pos);
 *     }
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Rope hanging from ceiling (stronger gravity)
 * const rope = new SpringChain(10, { stiffness: 80, damping: 8 }, 0.3);
 * const strongGravity = new THREE.Vector3(0, -20, 0);
 * const positions = rope.update(ceilingPos, ceilingQuat, deltaTime, strongGravity);
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
 * Generates natural walking, running, and movement animations without keyframes. Automatically
 * calculates foot placement, step timing, and body motion based on character velocity and direction.
 *
 * **Features:**
 * - Adaptive step length based on movement speed
 * - Natural body bob and sway
 * - Hip rotation for realistic weight transfer
 * - Configurable gait types (walk, run, sneak, limp, etc.)
 * - Foot lifting phases for smooth animation
 *
 * **Use Cases:**
 * - Bipedal character locomotion
 * - Quadruped or multi-legged creatures (use multiple instances)
 * - NPCs that walk procedurally
 * - Adaptive animation for varied terrain
 *
 * @category Entities & Simulation
 *
 * @example
 * ```typescript
 * // Basic walking character
 * const gait = new ProceduralGait({
 *   stepLength: 0.8,      // How far each step reaches
 *   stepHeight: 0.15,     // How high feet lift
 *   stepDuration: 0.4,    // Time per step (seconds)
 *   bodyBob: 0.05,        // Vertical body bounce
 *   bodySwayAmplitude: 0.02, // Side-to-side sway
 *   hipRotation: 0.1,     // Hip twist during walk
 *   phaseOffset: 0.5,     // Left/right foot timing (0.5 = alternating)
 *   footOvershoot: 0.1    // Foot lands slightly ahead
 * });
 *
 * // In update loop
 * function animate(deltaTime: number) {
 *   const bodyPos = character.position;
 *   const forward = character.getWorldDirection(new THREE.Vector3());
 *   const velocity = character.velocity;
 *
 *   const state = gait.update(bodyPos, forward, velocity, deltaTime);
 *
 *   // Position feet
 *   leftFoot.position.copy(state.leftFootTarget);
 *   rightFoot.position.copy(state.rightFootTarget);
 *
 *   // Apply body motion
 *   character.position.add(state.bodyOffset);
 *   character.rotation.setFromEuler(state.bodyRotation);
 *
 *   // Check for footstep events
 *   if (state.leftFootLifted) {
 *     playFootstepSound();
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Running gait - faster, longer strides
 * const runGait = new ProceduralGait({
 *   stepLength: 1.5,      // Long strides
 *   stepHeight: 0.25,     // Higher lift
 *   stepDuration: 0.3,    // Quick steps
 *   bodyBob: 0.08,        // More bounce
 *   bodySwayAmplitude: 0.01, // Less sway
 *   hipRotation: 0.12,
 *   phaseOffset: 0.5,
 *   footOvershoot: 0.15
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Sneaking gait - slow, careful steps
 * const sneakGait = new ProceduralGait({
 *   stepLength: 0.4,      // Short steps
 *   stepHeight: 0.05,     // Barely lift feet
 *   stepDuration: 0.8,    // Slow steps
 *   bodyBob: 0.01,        // Minimal bounce
 *   bodySwayAmplitude: 0.005,
 *   hipRotation: 0.03,
 *   phaseOffset: 0.5,
 *   footOvershoot: 0.02
 * });
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

/**
 * Clamp an angle to a specified range.
 *
 * Normalizes angles to the -π to π range before clamping.
 *
 * @category Entities & Simulation
 *
 * @param angle - Input angle in radians
 * @param min - Minimum allowed angle
 * @param max - Maximum allowed angle
 * @returns Clamped angle in radians
 *
 * @example
 * ```typescript
 * // Limit joint rotation to 90 degrees
 * const maxBend = Math.PI / 2;
 * const clampedAngle = clampAngle(jointAngle, -maxBend, maxBend);
 * ```
 */
export function clampAngle(angle: number, min: number, max: number): number {
  if (angle < -Math.PI) angle += Math.PI * 2;
  if (angle > Math.PI) angle -= Math.PI * 2;
  return Math.max(min, Math.min(max, angle));
}

/**
 * Damped spring interpolation for scalar values.
 *
 * Smoothly interpolates a value toward a target using spring physics.
 * Useful for camera smoothing, UI animations, or any single-value spring behavior.
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
 *
 * @example
 * ```typescript
 * // Smooth camera zoom
 * const velocity = { value: 0 };
 * let currentZoom = 5;
 * const targetZoom = 10;
 *
 * // In update loop
 * currentZoom = dampedSpring(
 *   currentZoom,
 *   targetZoom,
 *   velocity,
 *   10,  // stiffness
 *   5,   // damping
 *   deltaTime
 * );
 * camera.position.z = currentZoom;
 * ```
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
 * Smoothly interpolates a 3D vector toward a target using spring physics.
 * Perfect for position smoothing, camera follow, or object tracking.
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
 *
 * @example
 * ```typescript
 * // Smooth camera follow
 * const velocity = new THREE.Vector3();
 * let cameraPos = new THREE.Vector3(0, 5, 10);
 * const targetPos = player.position.clone();
 *
 * // In update loop
 * cameraPos = dampedSpringVector3(
 *   cameraPos,
 *   targetPos,
 *   velocity,
 *   8,   // stiffness
 *   4,   // damping
 *   deltaTime
 * );
 * camera.position.copy(cameraPos);
 * ```
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
