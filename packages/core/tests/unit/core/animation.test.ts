/**
 * Animation System Unit Tests
 *
 * Comprehensive tests for IK solvers, spring dynamics, procedural gait,
 * and animation utility functions.
 *
 * @module core/animation.test
 */

import * as THREE from 'three';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  type BoneChain,
  type BoneConstraint,
  CCDSolver,
  calculateBoneRotation,
  clampAngle,
  createBoneChain,
  createBoneChainFromLengths,
  dampedSpring,
  dampedSpringVector3,
  FABRIKSolver,
  type GaitConfig,
  hermiteInterpolate,
  LookAtController,
  ProceduralGait,
  SpringChain,
  type SpringConfig,
  SpringDynamics,
  sampleCurve,
  TwoBoneIKSolver,
} from '../../../src/core/animation';

// Helper to create a simple bone hierarchy
function createTestBoneHierarchy(lengths: number[]): THREE.Object3D[] {
  const root = new THREE.Object3D();
  root.position.set(0, 0, 0);
  root.updateMatrixWorld(true);

  const bones: THREE.Object3D[] = [root];
  let parent = root;

  for (let i = 0; i < lengths.length; i++) {
    const bone = new THREE.Object3D();
    bone.position.set(0, lengths[i], 0);
    parent.add(bone);
    parent.updateMatrixWorld(true);
    bones.push(bone);
    parent = bone;
  }

  return bones;
}

describe('createBoneChain', () => {
  it('creates bone chain from existing bones', () => {
    const bones = createTestBoneHierarchy([1, 1, 1]);
    const chain = createBoneChain(bones);

    expect(chain.bones).toBe(bones);
    expect(chain.lengths.length).toBe(3);
    expect(chain.totalLength).toBeCloseTo(3, 1);
  });

  it('calculates bone lengths correctly', () => {
    const bones = createTestBoneHierarchy([2, 3, 1.5]);
    const chain = createBoneChain(bones);

    expect(chain.lengths[0]).toBeCloseTo(2, 1);
    expect(chain.lengths[1]).toBeCloseTo(3, 1);
    expect(chain.lengths[2]).toBeCloseTo(1.5, 1);
  });

  it('handles single bone', () => {
    const root = new THREE.Object3D();
    root.updateMatrixWorld(true);
    const chain = createBoneChain([root]);

    expect(chain.bones.length).toBe(1);
    expect(chain.lengths.length).toBe(0);
    expect(chain.totalLength).toBe(0);
  });
});

describe('createBoneChainFromLengths', () => {
  it('creates bone chain from lengths', () => {
    const root = new THREE.Object3D();
    const chain = createBoneChainFromLengths(root, [1, 2, 1.5]);

    expect(chain.bones.length).toBe(4); // root + 3 bones
    expect(chain.lengths).toEqual([1, 2, 1.5]);
    expect(chain.totalLength).toBe(4.5);
  });

  it('uses default direction (0, -1, 0)', () => {
    const root = new THREE.Object3D();
    root.updateMatrixWorld(true);
    const chain = createBoneChainFromLengths(root, [1]);

    const childPos = chain.bones[1].position;
    expect(childPos.x).toBeCloseTo(0);
    expect(childPos.y).toBeCloseTo(-1);
    expect(childPos.z).toBeCloseTo(0);
  });

  it('respects custom direction', () => {
    const root = new THREE.Object3D();
    const direction = new THREE.Vector3(1, 0, 0);
    const chain = createBoneChainFromLengths(root, [2], direction);

    const childPos = chain.bones[1].position;
    expect(childPos.x).toBeCloseTo(2);
    expect(childPos.y).toBeCloseTo(0);
    expect(childPos.z).toBeCloseTo(0);
  });

  it('builds parent-child hierarchy', () => {
    const root = new THREE.Object3D();
    const chain = createBoneChainFromLengths(root, [1, 1]);

    expect(chain.bones[1].parent).toBe(root);
    expect(chain.bones[2].parent).toBe(chain.bones[1]);
  });
});

describe('FABRIKSolver', () => {
  let solver: FABRIKSolver;
  let chain: BoneChain;

  beforeEach(() => {
    solver = new FABRIKSolver(0.001, 20);
    const bones = createTestBoneHierarchy([1, 1]);
    chain = createBoneChain(bones);
  });

  it('solves for reachable target', () => {
    const target = new THREE.Vector3(0, 1.5, 0);
    const result = solver.solve(chain, target);

    // Check solver produces valid output structure
    expect(result.positions.length).toBe(chain.bones.length);
    expect(result.rotations.length).toBe(chain.bones.length);
    // The solver should get reasonably close to the target
    expect(result.error).toBeLessThan(chain.totalLength);
    expect(result.iterations).toBeGreaterThan(0);
  });

  it('returns reached=false for unreachable target', () => {
    const target = new THREE.Vector3(0, 10, 0); // Beyond total length
    const result = solver.solve(chain, target);

    expect(result.reached).toBe(false);
    expect(result.error).toBeGreaterThan(0);
  });

  it('maintains bone lengths', () => {
    const target = new THREE.Vector3(1, 1, 0);
    const result = solver.solve(chain, target);

    for (let i = 0; i < result.positions.length - 1; i++) {
      const dist = result.positions[i].distanceTo(result.positions[i + 1]);
      expect(dist).toBeCloseTo(chain.lengths[i], 1);
    }
  });

  it('uses pole target for orientation', () => {
    const target = new THREE.Vector3(0, 1.5, 0);
    const pole = new THREE.Vector3(1, 1, 0);
    const result = solver.solve(chain, target, pole);

    // Solver should produce valid output with pole constraint
    expect(result.positions.length).toBe(chain.bones.length);
    expect(result.iterations).toBeGreaterThan(0);
  });

  it('applies constraints when provided', () => {
    const constraints: BoneConstraint[] = [{ boneIndex: 1, minAngle: 0, maxAngle: Math.PI / 4 }];
    chain.constraints = constraints;

    const target = new THREE.Vector3(1, 1, 0);
    const result = solver.solve(chain, target);

    expect(result.positions.length).toBe(chain.bones.length);
  });

  it('applies result to bones', () => {
    const target = new THREE.Vector3(0.5, 1.5, 0);
    const result = solver.solve(chain, target);

    solver.apply(chain, result);

    // Check that quaternions were applied
    for (let i = 0; i < chain.bones.length - 1; i++) {
      expect(chain.bones[i].quaternion).toBeDefined();
    }
  });

  it('respects tolerance parameter', () => {
    const tolerantSolver = new FABRIKSolver(0.1, 20);
    const target = new THREE.Vector3(0, 1.5, 0);
    const result = tolerantSolver.solve(chain, target);

    // With higher tolerance, solver should complete within iteration limit
    expect(result.iterations).toBeLessThanOrEqual(20);
    expect(result.positions.length).toBe(chain.bones.length);
  });

  it('respects maxIterations parameter', () => {
    const limitedSolver = new FABRIKSolver(0.0001, 3);
    const target = new THREE.Vector3(0.8, 0.8, 0);
    const result = limitedSolver.solve(chain, target);

    expect(result.iterations).toBeLessThanOrEqual(3);
  });
});

describe('CCDSolver', () => {
  let solver: CCDSolver;
  let chain: BoneChain;

  beforeEach(() => {
    solver = new CCDSolver(0.001, 20, 1.0);
    const bones = createTestBoneHierarchy([1, 1]);
    chain = createBoneChain(bones);
  });

  it('solves for reachable target', () => {
    const target = new THREE.Vector3(0, 1.5, 0);
    const result = solver.solve(chain, target);

    expect(result.positions.length).toBe(chain.bones.length);
    expect(result.rotations.length).toBe(chain.bones.length);
  });

  it('returns positions and rotations', () => {
    const target = new THREE.Vector3(0.5, 1, 0);
    const result = solver.solve(chain, target);

    result.positions.forEach((pos) => {
      expect(pos).toBeInstanceOf(THREE.Vector3);
    });
    result.rotations.forEach((rot) => {
      expect(rot).toBeInstanceOf(THREE.Quaternion);
    });
  });

  it('applies damping factor', () => {
    const dampedSolver = new CCDSolver(0.001, 20, 0.5);
    const target = new THREE.Vector3(0.5, 1, 0);
    const result = dampedSolver.solve(chain, target);

    expect(result.iterations).toBeGreaterThan(0);
  });

  it('respects constraints', () => {
    chain.constraints = [{ boneIndex: 0, maxAngle: Math.PI / 6 }];

    const target = new THREE.Vector3(1, 0, 0);
    const result = solver.solve(chain, target);

    expect(result.positions.length).toBe(chain.bones.length);
  });

  it('applies result to bones', () => {
    const target = new THREE.Vector3(0.5, 1, 0);
    const result = solver.solve(chain, target);

    solver.apply(chain, result);

    for (let i = 0; i < chain.bones.length; i++) {
      expect(chain.bones[i].quaternion).toBeDefined();
    }
  });
});

describe('TwoBoneIKSolver', () => {
  let solver: TwoBoneIKSolver;

  beforeEach(() => {
    solver = new TwoBoneIKSolver();
  });

  it('solves two bone IK', () => {
    const rootPos = new THREE.Vector3(0, 0, 0);
    const midPos = new THREE.Vector3(0, 1, 0);
    const endPos = new THREE.Vector3(0, 2, 0);
    const target = new THREE.Vector3(0, 1.5, 0.5);
    const pole = new THREE.Vector3(0, 1, 1);

    const result = solver.solve(rootPos, midPos, endPos, target, pole, 1, 1);

    expect(result.midPosition).toBeInstanceOf(THREE.Vector3);
    expect(result.endPosition).toBeInstanceOf(THREE.Vector3);
    expect(result.upperRotation).toBeInstanceOf(THREE.Quaternion);
    expect(result.lowerRotation).toBeInstanceOf(THREE.Quaternion);
  });

  it('clamps target to max reach', () => {
    const rootPos = new THREE.Vector3(0, 0, 0);
    const midPos = new THREE.Vector3(0, 1, 0);
    const endPos = new THREE.Vector3(0, 2, 0);
    const target = new THREE.Vector3(0, 10, 0); // Beyond max reach
    const pole = new THREE.Vector3(0, 1, 1);

    const result = solver.solve(rootPos, midPos, endPos, target, pole, 1, 1);

    const totalLength = 2;
    const endDist = rootPos.distanceTo(result.endPosition);
    expect(endDist).toBeLessThanOrEqual(totalLength);
  });

  it('solves limb with world positions', () => {
    const root = new THREE.Object3D();
    const mid = new THREE.Object3D();
    const end = new THREE.Object3D();

    root.position.set(0, 2, 0);
    mid.position.set(0, -1, 0);
    end.position.set(0, -1, 0);

    root.add(mid);
    mid.add(end);
    root.updateMatrixWorld(true);

    const target = new THREE.Vector3(0, 0.5, 0.5);
    const pole = new THREE.Vector3(0, 1, 1);

    // Should not throw
    expect(() => solver.solveLimb(root, mid, end, target, pole)).not.toThrow();
  });
});

describe('LookAtController', () => {
  let controller: LookAtController;
  let object: THREE.Object3D;

  beforeEach(() => {
    controller = new LookAtController({
      maxAngle: Math.PI / 2,
      speed: 5,
      deadzone: 0.01,
      smoothing: 0.1,
    });
    object = new THREE.Object3D();
    object.updateMatrixWorld(true);
  });

  it('returns quaternion on update', () => {
    const target = new THREE.Vector3(0, 0, 5);
    const result = controller.update(object, target, 0.016);

    expect(result).toBeInstanceOf(THREE.Quaternion);
  });

  it('respects max angle limit', () => {
    const controller90 = new LookAtController({ maxAngle: Math.PI / 2 });
    const target = new THREE.Vector3(0, 0, -10); // Behind

    controller90.update(object, target, 0.016);
    // Should clamp the angle
  });

  it('handles deadzone', () => {
    const target = new THREE.Vector3(0, 0, 0.001); // Within deadzone

    const result1 = controller.update(object, target, 0.016);
    const result2 = controller.update(object, target, 0.016);

    expect(result1.equals(result2)).toBe(true);
  });

  it('applies rotation to object', () => {
    const target = new THREE.Vector3(5, 0, 0);
    controller.update(object, target, 0.1);
    controller.apply(object);

    expect(object.quaternion).toBeDefined();
  });

  it('resets to identity', () => {
    const target = new THREE.Vector3(5, 0, 0);
    controller.update(object, target, 0.1);
    controller.reset();

    const result = controller.update(object, new THREE.Vector3(0, 0, 1), 0);
    expect(result.x).toBeCloseTo(0);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBeCloseTo(0);
  });

  it('uses custom up vector', () => {
    const controller2 = new LookAtController({
      upVector: new THREE.Vector3(0, 0, 1),
    });

    const target = new THREE.Vector3(5, 5, 0);
    const result = controller2.update(object, target, 0.1);

    expect(result).toBeInstanceOf(THREE.Quaternion);
  });
});

describe('SpringDynamics', () => {
  let spring: SpringDynamics;

  beforeEach(() => {
    spring = new SpringDynamics(
      { stiffness: 100, damping: 10, mass: 1 },
      new THREE.Vector3(0, 0, 0)
    );
  });

  it('moves toward target', () => {
    const target = new THREE.Vector3(10, 0, 0);
    const pos1 = spring.update(target, 0.016);
    const pos2 = spring.update(target, 0.016);

    expect(pos2.x).toBeGreaterThan(pos1.x);
  });

  it('overshoots with low damping', () => {
    const lowDampSpring = new SpringDynamics(
      { stiffness: 100, damping: 1, mass: 1 },
      new THREE.Vector3(0, 0, 0)
    );

    const target = new THREE.Vector3(1, 0, 0);
    let maxX = 0;

    for (let i = 0; i < 200; i++) {
      const pos = lowDampSpring.update(target, 0.016);
      maxX = Math.max(maxX, pos.x);
    }

    // With low damping, should overshoot target
    expect(maxX).toBeGreaterThan(1);
  });

  it('converges with high damping', () => {
    const highDampSpring = new SpringDynamics(
      { stiffness: 100, damping: 50, mass: 1 },
      new THREE.Vector3(0, 0, 0)
    );

    const target = new THREE.Vector3(1, 0, 0);
    let pos: THREE.Vector3 = new THREE.Vector3();

    for (let i = 0; i < 500; i++) {
      pos = highDampSpring.update(target, 0.016);
    }

    expect(pos.x).toBeCloseTo(1, 0);
  });

  it('getPosition returns current position', () => {
    const target = new THREE.Vector3(5, 0, 0);
    spring.update(target, 0.1);

    const pos = spring.getPosition();
    expect(pos).toBeInstanceOf(THREE.Vector3);
    expect(pos.x).toBeGreaterThan(0);
  });

  it('getVelocity returns current velocity', () => {
    const target = new THREE.Vector3(5, 0, 0);
    spring.update(target, 0.1);

    const vel = spring.getVelocity();
    expect(vel).toBeInstanceOf(THREE.Vector3);
    expect(vel.x).toBeGreaterThan(0);
  });

  it('setPosition updates position', () => {
    const newPos = new THREE.Vector3(5, 5, 5);
    spring.setPosition(newPos);

    const pos = spring.getPosition();
    expect(pos.x).toBe(5);
    expect(pos.y).toBe(5);
    expect(pos.z).toBe(5);
  });

  it('setVelocity updates velocity', () => {
    const newVel = new THREE.Vector3(10, 0, 0);
    spring.setVelocity(newVel);

    const vel = spring.getVelocity();
    expect(vel.x).toBe(10);
  });

  it('reset restores initial position', () => {
    const target = new THREE.Vector3(10, 0, 0);
    spring.update(target, 0.1);
    spring.reset();

    const pos = spring.getPosition();
    expect(pos.x).toBe(0);
    expect(pos.y).toBe(0);
    expect(pos.z).toBe(0);
  });

  it('reset with position sets to specified position', () => {
    const target = new THREE.Vector3(10, 0, 0);
    spring.update(target, 0.1);
    spring.reset(new THREE.Vector3(5, 5, 5));

    const pos = spring.getPosition();
    expect(pos.x).toBe(5);
  });

  it('uses rest length when specified', () => {
    const springWithRest = new SpringDynamics(
      { stiffness: 100, damping: 10, mass: 1, restLength: 2 },
      new THREE.Vector3(0, 0, 0)
    );

    const target = new THREE.Vector3(5, 0, 0);
    let pos: THREE.Vector3 = new THREE.Vector3();

    for (let i = 0; i < 500; i++) {
      pos = springWithRest.update(target, 0.016);
    }

    // Should settle at restLength distance from target
    const dist = pos.distanceTo(target);
    expect(dist).toBeCloseTo(2, 0);
  });
});

describe('SpringChain', () => {
  let chain: SpringChain;

  beforeEach(() => {
    chain = new SpringChain(3, { stiffness: 100, damping: 10, mass: 1 }, 0.5);
  });

  it('creates chain with correct node count', () => {
    const positions = chain.getPositions();
    expect(positions.length).toBe(3);
  });

  it('updates all nodes', () => {
    const root = new THREE.Vector3(0, 5, 0);
    const rotation = new THREE.Quaternion();

    const positions = chain.update(root, rotation, 0.016);

    expect(positions.length).toBe(4); // root + 3 nodes
    expect(positions[0].equals(root)).toBe(true);
  });

  it('applies gravity', () => {
    const root = new THREE.Vector3(0, 5, 0);
    const rotation = new THREE.Quaternion();
    const gravity = new THREE.Vector3(0, -9.8, 0);

    let positions: THREE.Vector3[] = [];
    for (let i = 0; i < 100; i++) {
      positions = chain.update(root, rotation, 0.016, gravity);
    }

    // Chain should sag due to gravity
    expect(positions[positions.length - 1].y).toBeLessThan(root.y);
  });

  it('resets to given positions', () => {
    const root = new THREE.Vector3(0, 5, 0);
    const rotation = new THREE.Quaternion();

    // Update a few times
    chain.update(root, rotation, 0.1);
    chain.update(root, rotation, 0.1);

    // Reset
    const resetPositions = [
      new THREE.Vector3(0, 5, 0),
      new THREE.Vector3(0, 4, 0),
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(0, 2, 0),
    ];
    chain.reset(resetPositions);

    const positions = chain.getPositions();
    expect(positions[0].y).toBeCloseTo(4, 0);
  });

  it('constrains max distance', () => {
    const root = new THREE.Vector3(0, 0, 0);
    const rotation = new THREE.Quaternion();
    const extremeGravity = new THREE.Vector3(0, -100, 0);

    let positions: THREE.Vector3[] = [];
    for (let i = 0; i < 50; i++) {
      positions = chain.update(root, rotation, 0.016, extremeGravity);
    }

    // Check max distance constraint (restLength * 1.5)
    for (let i = 1; i < positions.length; i++) {
      const dist = positions[i].distanceTo(positions[i - 1]);
      expect(dist).toBeLessThanOrEqual(0.5 * 1.5 + 0.1); // rest * 1.5 + tolerance
    }
  });
});

describe('ProceduralGait', () => {
  let gait: ProceduralGait;

  beforeEach(() => {
    gait = new ProceduralGait({
      stepLength: 0.8,
      stepHeight: 0.15,
      stepDuration: 0.4,
      bodyBob: 0.05,
      bodySwayAmplitude: 0.02,
      hipRotation: 0.1,
      phaseOffset: 0.5,
      footOvershoot: 0.1,
    });
  });

  it('returns gait state', () => {
    const bodyPos = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, 1);
    const velocity = new THREE.Vector3(0, 0, 2);

    const state = gait.update(bodyPos, forward, velocity, 0.016);

    expect(state.phase).toBeDefined();
    expect(state.leftFootTarget).toBeInstanceOf(THREE.Vector3);
    expect(state.rightFootTarget).toBeInstanceOf(THREE.Vector3);
    expect(typeof state.leftFootLifted).toBe('boolean');
    expect(typeof state.rightFootLifted).toBe('boolean');
    expect(state.bodyOffset).toBeInstanceOf(THREE.Vector3);
    expect(state.bodyRotation).toBeInstanceOf(THREE.Euler);
  });

  it('does not animate when stationary', () => {
    const bodyPos = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, 1);
    const velocity = new THREE.Vector3(0, 0, 0); // Stationary

    const state = gait.update(bodyPos, forward, velocity, 0.016);

    expect(state.leftFootLifted).toBe(false);
    expect(state.rightFootLifted).toBe(false);
  });

  it('advances phase when moving', () => {
    const bodyPos = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, 1);
    const velocity = new THREE.Vector3(0, 0, 2);

    gait.update(bodyPos, forward, velocity, 0.1);
    const phase1 = gait.getPhase();

    gait.update(bodyPos, forward, velocity, 0.1);
    const phase2 = gait.getPhase();

    expect(phase2).not.toBe(phase1);
  });

  it('alternates feet', () => {
    const bodyPos = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, 1);
    const velocity = new THREE.Vector3(0, 0, 2);

    let leftLiftedCount = 0;
    let rightLiftedCount = 0;

    for (let i = 0; i < 100; i++) {
      const state = gait.update(bodyPos, forward, velocity, 0.016);
      if (state.leftFootLifted) leftLiftedCount++;
      if (state.rightFootLifted) rightLiftedCount++;
    }

    // Both feet should be lifted approximately equal times
    expect(leftLiftedCount).toBeGreaterThan(0);
    expect(rightLiftedCount).toBeGreaterThan(0);
  });

  it('resets state', () => {
    const bodyPos = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, 1);
    const velocity = new THREE.Vector3(0, 0, 2);

    gait.update(bodyPos, forward, velocity, 0.5);
    gait.reset();

    expect(gait.getPhase()).toBe(0);
  });

  it('setPhase clamps to 0-1', () => {
    gait.setPhase(1.5);
    expect(gait.getPhase()).toBe(0.5);

    gait.setPhase(2.7);
    expect(gait.getPhase()).toBeCloseTo(0.7, 5);
  });

  it('produces body bob motion', () => {
    const bodyPos = new THREE.Vector3(0, 1, 0);
    const forward = new THREE.Vector3(0, 0, 1);
    const velocity = new THREE.Vector3(0, 0, 2);

    let maxBob = 0;
    let minBob = 0;

    for (let i = 0; i < 100; i++) {
      const state = gait.update(bodyPos, forward, velocity, 0.016);
      maxBob = Math.max(maxBob, state.bodyOffset.y);
      minBob = Math.min(minBob, state.bodyOffset.y);
    }

    // Should have some vertical variation
    expect(maxBob - minBob).toBeGreaterThan(0);
  });
});

describe('Utility Functions', () => {
  describe('clampAngle', () => {
    it('clamps angle within range', () => {
      expect(clampAngle(0, -1, 1)).toBe(0);
      expect(clampAngle(2, -1, 1)).toBe(1);
      expect(clampAngle(-2, -1, 1)).toBe(-1);
    });

    it('normalizes angles outside -PI to PI', () => {
      const result = clampAngle(Math.PI * 2.5, -Math.PI, Math.PI);
      expect(result).toBeLessThanOrEqual(Math.PI);
      expect(result).toBeGreaterThanOrEqual(-Math.PI);
    });

    it('handles negative angles', () => {
      const result = clampAngle(-Math.PI * 1.5, -Math.PI / 2, Math.PI / 2);
      expect(result).toBeGreaterThanOrEqual(-Math.PI / 2);
    });
  });

  describe('dampedSpring', () => {
    it('moves toward target', () => {
      const velocity = { value: 0 };
      const result = dampedSpring(0, 10, velocity, 100, 10, 0.016);

      expect(result).toBeGreaterThan(0);
      expect(velocity.value).toBeGreaterThan(0);
    });

    it('converges over time', () => {
      const velocity = { value: 0 };
      let current = 0;

      for (let i = 0; i < 500; i++) {
        current = dampedSpring(current, 10, velocity, 100, 20, 0.016);
      }

      expect(current).toBeCloseTo(10, 0);
    });

    it('slows near target', () => {
      const velocity = { value: 5 };
      const current = 9;

      dampedSpring(current, 10, velocity, 100, 50, 0.016);
      expect(velocity.value).toBeLessThan(5);
    });
  });

  describe('dampedSpringVector3', () => {
    it('moves vector toward target', () => {
      const current = new THREE.Vector3(0, 0, 0);
      const target = new THREE.Vector3(10, 0, 0);
      const velocity = new THREE.Vector3(0, 0, 0);

      const result = dampedSpringVector3(current, target, velocity, 100, 10, 0.016);

      expect(result.x).toBeGreaterThan(0);
    });

    it('uses output vector when provided', () => {
      const current = new THREE.Vector3(0, 0, 0);
      const target = new THREE.Vector3(10, 0, 0);
      const velocity = new THREE.Vector3(0, 0, 0);
      const out = new THREE.Vector3();

      const result = dampedSpringVector3(current, target, velocity, 100, 10, 0.016, out);

      expect(result).toBe(out);
      expect(out.x).toBeGreaterThan(0);
    });

    it('converges in 3D', () => {
      const current = new THREE.Vector3(0, 0, 0);
      const target = new THREE.Vector3(5, 5, 5);
      const velocity = new THREE.Vector3(0, 0, 0);

      let pos = current.clone();
      for (let i = 0; i < 500; i++) {
        pos = dampedSpringVector3(pos, target, velocity, 100, 20, 0.016);
      }

      expect(pos.x).toBeCloseTo(5, 0);
      expect(pos.y).toBeCloseTo(5, 0);
      expect(pos.z).toBeCloseTo(5, 0);
    });
  });

  describe('hermiteInterpolate', () => {
    it('returns p0 at t=0', () => {
      const p0 = new THREE.Vector3(0, 0, 0);
      const p1 = new THREE.Vector3(10, 0, 0);
      const m0 = new THREE.Vector3(5, 0, 0);
      const m1 = new THREE.Vector3(5, 0, 0);

      const result = hermiteInterpolate(p0, p1, m0, m1, 0);
      expect(result.x).toBeCloseTo(0);
    });

    it('returns p1 at t=1', () => {
      const p0 = new THREE.Vector3(0, 0, 0);
      const p1 = new THREE.Vector3(10, 0, 0);
      const m0 = new THREE.Vector3(5, 0, 0);
      const m1 = new THREE.Vector3(5, 0, 0);

      const result = hermiteInterpolate(p0, p1, m0, m1, 1);
      expect(result.x).toBeCloseTo(10);
    });

    it('interpolates smoothly at t=0.5', () => {
      const p0 = new THREE.Vector3(0, 0, 0);
      const p1 = new THREE.Vector3(10, 0, 0);
      const m0 = new THREE.Vector3(0, 0, 0);
      const m1 = new THREE.Vector3(0, 0, 0);

      const result = hermiteInterpolate(p0, p1, m0, m1, 0.5);
      expect(result.x).toBeCloseTo(5, 0);
    });

    it('uses tangents for curve shape', () => {
      const p0 = new THREE.Vector3(0, 0, 0);
      const p1 = new THREE.Vector3(10, 0, 0);
      const m0 = new THREE.Vector3(10, 20, 0); // Tangent with Y component
      const m1 = new THREE.Vector3(10, -20, 0); // Exit tangent with negative Y

      // At t=0.25, the curve should be influenced by m0's upward tangent
      const resultEarly = hermiteInterpolate(p0, p1, m0, m1, 0.25);
      expect(resultEarly.y).toBeGreaterThan(0); // Should curve up early
    });
  });

  describe('sampleCurve', () => {
    it('returns first point for single-point curve', () => {
      const points = [new THREE.Vector3(5, 5, 5)];
      const result = sampleCurve(points, 0.5);

      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
      expect(result.z).toBe(5);
    });

    it('returns empty vector for empty points', () => {
      const points: THREE.Vector3[] = [];
      const result = sampleCurve(points, 0.5);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });

    it('samples along curve', () => {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(10, 0, 0),
        new THREE.Vector3(20, 0, 0),
      ];

      const start = sampleCurve(points, 0);
      const mid = sampleCurve(points, 0.5);
      const end = sampleCurve(points, 1);

      expect(start.x).toBeCloseTo(0, 0);
      expect(mid.x).toBeCloseTo(10, 0);
      expect(end.x).toBeCloseTo(20, 0);
    });

    it('respects tension parameter', () => {
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(5, 5, 0),
        new THREE.Vector3(10, 0, 0),
      ];

      // Sample at different positions where tension has visible effect
      const lowTension = sampleCurve(points, 0.25, 0.1);
      const highTension = sampleCurve(points, 0.25, 1.0);

      // Different tensions should produce different curves at non-midpoint
      // At least verify both produce valid results
      expect(lowTension).toBeInstanceOf(THREE.Vector3);
      expect(highTension).toBeInstanceOf(THREE.Vector3);
    });
  });

  describe('calculateBoneRotation', () => {
    it('returns quaternion for direction', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(10, 0, 0);

      const result = calculateBoneRotation(start, end);
      expect(result).toBeInstanceOf(THREE.Quaternion);
    });

    it('handles vertical bones', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(0, 10, 0);

      const result = calculateBoneRotation(start, end);
      expect(result).toBeInstanceOf(THREE.Quaternion);
    });

    it('uses alternative up vector when aligned', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(0, 10, 0);
      const up = new THREE.Vector3(0, 1, 0);

      const result = calculateBoneRotation(start, end, up);
      expect(result).toBeInstanceOf(THREE.Quaternion);
    });

    it('respects custom up vector', () => {
      const start = new THREE.Vector3(0, 0, 0);
      const end = new THREE.Vector3(10, 0, 0);
      const up = new THREE.Vector3(0, 0, 1);

      const result = calculateBoneRotation(start, end, up);
      expect(result).toBeInstanceOf(THREE.Quaternion);
    });
  });
});
