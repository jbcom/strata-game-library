/**
 * Inverse Kinematics Solvers.
 *
 * Production-ready IK solvers for character animation: FABRIK, CCD, and analytical two-bone.
 * Pure TypeScript with no React dependencies.
 *
 * @packageDocumentation
 * @module core/animation/ik-solver
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
 * @category Entities & Simulation
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
   * @param chain - The bone chain to solve
   * @param target - World position the end effector should reach
   * @param pole - Optional pole target to control mid-joint orientation (e.g., elbow/knee direction)
   * @returns Solver result with positions, rotations, and convergence info
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
   * @param chain - The bone chain to modify
   * @param result - The solver result containing rotations
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
 * @category Entities & Simulation
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
   * @param chain - The bone chain to solve
   * @param target - World position the end effector should reach
   * @returns Solver result with positions, rotations, and convergence info
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
 * - Human/creature arms (shoulder -> elbow -> wrist)
 * - Human/creature legs (hip -> knee -> foot)
 * - Any exactly 2-joint system
 * - When you need guaranteed single-frame solution
 *
 * @category Entities & Simulation
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
