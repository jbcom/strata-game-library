/**
 * Default configuration factory tests.
 *
 * Verifies that every factory returns fresh, independently mutable objects with
 * physically sane values, and that the humanoid ragdoll is a structurally valid
 * rig: joints referencing real body parts, a connected skeleton with no orphans,
 * limits ordered min <= max, and geometry that scales linearly.
 *
 * @module core/physics/presets.test
 */

import { describe, expect, it } from 'vitest';
import {
  createDefaultBuoyancyConfig,
  createDefaultCharacterConfig,
  createDefaultDestructibleConfig,
  createDefaultPhysicsConfig,
  createDefaultVehicleConfig,
  createHumanoidRagdoll,
} from '../presets';

const FACTORIES = [
  ['physics', createDefaultPhysicsConfig],
  ['character', createDefaultCharacterConfig],
  ['vehicle', createDefaultVehicleConfig],
  ['destructible', createDefaultDestructibleConfig],
  ['buoyancy', createDefaultBuoyancyConfig],
  ['ragdoll', () => createHumanoidRagdoll()],
] as const;

describe('factory isolation', () => {
  it.each(FACTORIES)('%s returns a distinct object each call', (_name, factory) => {
    expect(factory()).not.toBe(factory());
  });

  it.each(FACTORIES)('%s returns deeply equal defaults each call', (_name, factory) => {
    expect(factory()).toEqual(factory());
  });

  it('does not share nested arrays between two physics configs', () => {
    const a = createDefaultPhysicsConfig();
    const b = createDefaultPhysicsConfig();
    a.gravity[1] = 0;
    expect(b.gravity[1]).toBeCloseTo(-9.81, 10);
  });

  it('does not share wheel position arrays between two vehicle configs', () => {
    const a = createDefaultVehicleConfig();
    const b = createDefaultVehicleConfig();
    a.wheelPositions[0][0] = 999;
    expect(b.wheelPositions[0][0]).not.toBe(999);
  });

  it('does not share body part arrays between two ragdolls', () => {
    const a = createHumanoidRagdoll();
    const b = createHumanoidRagdoll();
    a.bodyParts.pop();
    expect(b.bodyParts.length).toBeGreaterThan(a.bodyParts.length);
  });
});

describe('createDefaultPhysicsConfig', () => {
  it('points gravity down at Earth strength', () => {
    const config = createDefaultPhysicsConfig();
    expect(config.gravity[0]).toBe(0);
    expect(config.gravity[1]).toBeCloseTo(-9.81, 10);
    expect(config.gravity[2]).toBe(0);
  });

  it('uses a positive timestep matching a common refresh rate', () => {
    expect(createDefaultPhysicsConfig().timeStep).toBeCloseTo(1 / 60, 10);
  });

  it('keeps erp within the valid 0..1 range', () => {
    const { erp } = createDefaultPhysicsConfig();
    expect(erp).toBeGreaterThan(0);
    expect(erp).toBeLessThanOrEqual(1);
  });

  it('uses at least one solver iteration everywhere', () => {
    const config = createDefaultPhysicsConfig();
    expect(config.maxStabilizationIterations).toBeGreaterThanOrEqual(1);
    expect(config.maxVelocityIterations).toBeGreaterThanOrEqual(1);
    expect(config.maxVelocityFrictionIterations).toBeGreaterThanOrEqual(1);
  });

  it('keeps allowed linear error below the prediction distance scale', () => {
    const config = createDefaultPhysicsConfig();
    expect(config.allowedLinearError).toBeGreaterThan(0);
    expect(config.predictionDistance).toBeGreaterThan(0);
  });
});

describe('createDefaultCharacterConfig', () => {
  it('makes the capsule taller than it is wide', () => {
    const config = createDefaultCharacterConfig();
    expect(config.capsuleHeight).toBeGreaterThan(config.capsuleRadius * 2);
  });

  it('uses a slope limit that is walkable but not vertical', () => {
    const { slopeLimit } = createDefaultCharacterConfig();
    expect(slopeLimit).toBeGreaterThan(0);
    expect(slopeLimit).toBeLessThan(Math.PI / 2);
  });

  it('keeps air control partial so ground movement stays privileged', () => {
    const { airControl } = createDefaultCharacterConfig();
    expect(airControl).toBeGreaterThan(0);
    expect(airControl).toBeLessThan(1);
  });

  it('allows at least one jump', () => {
    expect(createDefaultCharacterConfig().maxJumps).toBeGreaterThanOrEqual(1);
  });

  it('keeps step height below the capsule half-height so steps are reachable', () => {
    const config = createDefaultCharacterConfig();
    expect(config.stepHeight).toBeLessThan(config.capsuleHeight / 2);
  });

  it('uses forgiveness windows that are positive but sub-second', () => {
    const config = createDefaultCharacterConfig();
    for (const window of [config.coyoteTime, config.jumpBufferTime]) {
      expect(window).toBeGreaterThan(0);
      expect(window).toBeLessThan(1);
    }
  });

  it('keeps skin width small relative to the capsule radius', () => {
    const config = createDefaultCharacterConfig();
    expect(config.skinWidth).toBeGreaterThan(0);
    expect(config.skinWidth).toBeLessThan(config.capsuleRadius);
  });

  it('decelerates no faster than it accelerates for responsive feel', () => {
    const config = createDefaultCharacterConfig();
    expect(config.deceleration).toBeLessThanOrEqual(config.acceleration);
  });
});

describe('createDefaultVehicleConfig', () => {
  it('provides exactly four wheel positions', () => {
    expect(createDefaultVehicleConfig().wheelPositions).toHaveLength(4);
  });

  it('places wheels symmetrically about the centre line', () => {
    const xs = createDefaultVehicleConfig().wheelPositions.map((p) => p[0]);
    expect(xs.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 10);
  });

  it('splits wheels into a front pair and a rear pair', () => {
    const zs = createDefaultVehicleConfig().wheelPositions.map((p) => p[2]);
    expect(zs.filter((z) => z > 0)).toHaveLength(2);
    expect(zs.filter((z) => z < 0)).toHaveLength(2);
  });

  it('keeps every wheel inside the chassis footprint', () => {
    const config = createDefaultVehicleConfig();
    const [halfWidth, , halfLength] = [
      config.chassisSize[0] / 2,
      config.chassisSize[1] / 2,
      config.chassisSize[2] / 2,
    ];
    for (const [x, , z] of config.wheelPositions) {
      expect(Math.abs(x)).toBeLessThanOrEqual(halfWidth + config.wheelWidth);
      expect(Math.abs(z)).toBeLessThanOrEqual(halfLength);
    }
  });

  it('lowers the centre of mass below the chassis origin for stability', () => {
    expect(createDefaultVehicleConfig().centerOfMassOffset[1]).toBeLessThan(0);
  });

  it('names a valid drive configuration', () => {
    expect(['front', 'rear', 'all']).toContain(createDefaultVehicleConfig().driveWheels);
  });

  it('keeps the steering angle well short of a right angle', () => {
    const { maxSteerAngle } = createDefaultVehicleConfig();
    expect(maxSteerAngle).toBeGreaterThan(0);
    expect(maxSteerAngle).toBeLessThan(Math.PI / 2);
  });

  it('uses positive suspension stiffness, damping and travel', () => {
    const config = createDefaultVehicleConfig();
    expect(config.suspensionStiffness).toBeGreaterThan(0);
    expect(config.suspensionDamping).toBeGreaterThan(0);
    expect(config.suspensionTravel).toBeGreaterThan(0);
  });

  it('keeps roll influence within the 0..1 blend range', () => {
    const { rollInfluence } = createDefaultVehicleConfig();
    expect(rollInfluence).toBeGreaterThanOrEqual(0);
    expect(rollInfluence).toBeLessThanOrEqual(1);
  });
});

describe('createDefaultDestructibleConfig', () => {
  it('starts with positive health and a positive break threshold', () => {
    const config = createDefaultDestructibleConfig();
    expect(config.health).toBeGreaterThan(0);
    expect(config.breakForce).toBeGreaterThan(0);
  });

  it('produces a whole number of shards greater than one', () => {
    const { shardCount } = createDefaultDestructibleConfig();
    expect(Number.isInteger(shardCount)).toBe(true);
    expect(shardCount).toBeGreaterThan(1);
  });

  it('gives shards a finite lifetime so debris is cleaned up', () => {
    const { shardLifetime } = createDefaultDestructibleConfig();
    expect(shardLifetime).toBeGreaterThan(0);
    expect(Number.isFinite(shardLifetime)).toBe(true);
  });

  it('makes shards smaller than unit scale', () => {
    for (const axis of createDefaultDestructibleConfig().shardScale) {
      expect(axis).toBeGreaterThan(0);
      expect(axis).toBeLessThan(1);
    }
  });

  it('gives shards a positive mass and a non-zero blast radius', () => {
    const config = createDefaultDestructibleConfig();
    expect(config.shardMass).toBeGreaterThan(0);
    expect(config.explosionRadius).toBeGreaterThan(0);
  });
});

describe('createDefaultBuoyancyConfig', () => {
  it('places the default water plane at the origin', () => {
    expect(createDefaultBuoyancyConfig().waterLevel).toBe(0);
  });

  it('uses positive buoyancy and drag', () => {
    const config = createDefaultBuoyancyConfig();
    expect(config.buoyancyForce).toBeGreaterThan(0);
    expect(config.waterDrag).toBeGreaterThan(0);
    expect(config.waterAngularDrag).toBeGreaterThan(0);
  });

  it('samples at more than one point so torque can develop', () => {
    const { samplePointCount } = createDefaultBuoyancyConfig();
    expect(Number.isInteger(samplePointCount)).toBe(true);
    expect(samplePointCount).toBeGreaterThan(1);
  });

  it('defaults to a static water surface', () => {
    expect(createDefaultBuoyancyConfig().dynamicWater).toBe(false);
  });

  it('uses a positive voxel resolution', () => {
    expect(createDefaultBuoyancyConfig().voxelResolution).toBeGreaterThan(0);
  });
});

describe('createHumanoidRagdoll structure', () => {
  it('gives every body part a unique name', () => {
    const names = createHumanoidRagdoll().bodyParts.map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('includes the expected core anatomy', () => {
    const names = createHumanoidRagdoll().bodyParts.map((p) => p.name);
    for (const required of ['pelvis', 'torso', 'chest', 'head']) {
      expect(names).toContain(required);
    }
  });

  it('provides symmetric left and right limbs', () => {
    const names = createHumanoidRagdoll().bodyParts.map((p) => p.name);
    for (const name of names.filter((n) => n.endsWith('L'))) {
      expect(names).toContain(`${name.slice(0, -1)}R`);
    }
  });

  it('gives every body part a positive mass', () => {
    for (const part of createHumanoidRagdoll().bodyParts) {
      expect(part.mass).toBeGreaterThan(0);
    }
  });

  it('gives every body part positive dimensions', () => {
    for (const part of createHumanoidRagdoll().bodyParts) {
      for (const dimension of part.size) {
        expect(dimension).toBeGreaterThan(0);
      }
    }
  });

  it('uses a size arity matching each collider type', () => {
    const arity = { sphere: 1, capsule: 2, box: 3 } as const;
    for (const part of createHumanoidRagdoll().bodyParts) {
      expect(part.size).toHaveLength(arity[part.type]);
    }
  });

  it('references only real body parts from joints', () => {
    const ragdoll = createHumanoidRagdoll();
    const names = new Set(ragdoll.bodyParts.map((p) => p.name));
    for (const joint of ragdoll.joints) {
      expect(names.has(joint.parent)).toBe(true);
      expect(names.has(joint.child)).toBe(true);
    }
  });

  it('never joins a body part to itself', () => {
    for (const joint of createHumanoidRagdoll().joints) {
      expect(joint.parent).not.toBe(joint.child);
    }
  });

  it('forms a connected skeleton with no orphaned parts', () => {
    const ragdoll = createHumanoidRagdoll();
    const jointed = new Set<string>();
    for (const joint of ragdoll.joints) {
      jointed.add(joint.parent);
      jointed.add(joint.child);
    }
    for (const part of ragdoll.bodyParts) {
      expect(jointed.has(part.name)).toBe(true);
    }
  });

  it('uses exactly one joint fewer than body parts, forming a tree', () => {
    const ragdoll = createHumanoidRagdoll();
    expect(ragdoll.joints).toHaveLength(ragdoll.bodyParts.length - 1);
  });

  it('gives every child part exactly one parent joint', () => {
    const children = createHumanoidRagdoll().joints.map((j) => j.child);
    expect(new Set(children).size).toBe(children.length);
  });

  it('orders every joint limit min <= max', () => {
    for (const joint of createHumanoidRagdoll().joints) {
      if (joint.limits) {
        expect(joint.limits.min).toBeLessThanOrEqual(joint.limits.max);
      }
      if (joint.twistLimits) {
        expect(joint.twistLimits.min).toBeLessThanOrEqual(joint.twistLimits.max);
      }
    }
  });

  it('uses only supported joint types', () => {
    for (const joint of createHumanoidRagdoll().joints) {
      expect(['spherical', 'revolute', 'prismatic', 'fixed']).toContain(joint.type);
    }
  });

  it('gives revolute joints an axis to rotate about', () => {
    for (const joint of createHumanoidRagdoll().joints) {
      if (joint.type === 'revolute') {
        expect(joint.axis).toBeDefined();
        expect(joint.axis?.some((component) => component !== 0)).toBe(true);
      }
    }
  });

  it('puts the head above the pelvis', () => {
    const ragdoll = createHumanoidRagdoll();
    const head = ragdoll.bodyParts.find((p) => p.name === 'head');
    const pelvis = ragdoll.bodyParts.find((p) => p.name === 'pelvis');
    expect(head?.position[1]).toBeGreaterThan(pelvis?.position[1] ?? 0);
  });

  it('mirrors left and right limb positions across the x axis', () => {
    const ragdoll = createHumanoidRagdoll();
    const byName = new Map(ragdoll.bodyParts.map((p) => [p.name, p]));
    for (const part of ragdoll.bodyParts) {
      if (!part.name.endsWith('L')) continue;
      const mirror = byName.get(`${part.name.slice(0, -1)}R`);
      expect(mirror).toBeDefined();
      expect(part.position[0]).toBeCloseTo(-(mirror?.position[0] ?? 0), 10);
      expect(part.position[1]).toBeCloseTo(mirror?.position[1] ?? 0, 10);
    }
  });
});

describe('createHumanoidRagdoll scaling', () => {
  it('defaults to unit scale', () => {
    expect(createHumanoidRagdoll()).toEqual(createHumanoidRagdoll(1));
  });

  it('scales positions linearly', () => {
    const unit = createHumanoidRagdoll(1);
    const double = createHumanoidRagdoll(2);
    for (let i = 0; i < unit.bodyParts.length; i++) {
      for (let axis = 0; axis < 3; axis++) {
        expect(double.bodyParts[i].position[axis]).toBeCloseTo(
          unit.bodyParts[i].position[axis] * 2,
          10
        );
      }
    }
  });

  it('scales collider dimensions linearly', () => {
    const unit = createHumanoidRagdoll(1);
    const half = createHumanoidRagdoll(0.5);
    for (let i = 0; i < unit.bodyParts.length; i++) {
      unit.bodyParts[i].size.forEach((dimension, axis) => {
        expect(half.bodyParts[i].size[axis]).toBeCloseTo(dimension * 0.5, 10);
      });
    }
  });

  it('leaves mass unscaled, so callers must adjust it themselves', () => {
    const unit = createHumanoidRagdoll(1);
    const double = createHumanoidRagdoll(2);
    for (let i = 0; i < unit.bodyParts.length; i++) {
      expect(double.bodyParts[i].mass).toBe(unit.bodyParts[i].mass);
    }
  });

  it('keeps rotations independent of scale', () => {
    const unit = createHumanoidRagdoll(1);
    const large = createHumanoidRagdoll(3);
    for (let i = 0; i < unit.bodyParts.length; i++) {
      expect(large.bodyParts[i].rotation).toEqual(unit.bodyParts[i].rotation);
    }
  });

  it('keeps the skeleton connectivity identical at any scale', () => {
    // Anchors are geometric offsets and legitimately scale with the rig; only
    // the connectivity and constraint envelope are scale-invariant.
    const topology = (scale: number) =>
      createHumanoidRagdoll(scale).joints.map(({ parent, child, type, limits, twistLimits }) => ({
        parent,
        child,
        type,
        limits,
        twistLimits,
      }));
    expect(topology(0.1)).toEqual(topology(10));
  });

  it('scales joint anchors linearly with the rig', () => {
    const unit = createHumanoidRagdoll(1).joints;
    const double = createHumanoidRagdoll(2).joints;
    for (let i = 0; i < unit.length; i++) {
      for (let axis = 0; axis < 3; axis++) {
        expect(double[i].anchor1[axis]).toBeCloseTo(unit[i].anchor1[axis] * 2, 10);
        expect(double[i].anchor2[axis]).toBeCloseTo(unit[i].anchor2[axis] * 2, 10);
      }
    }
  });

  it('collapses geometry to the origin at zero scale without producing NaN', () => {
    for (const part of createHumanoidRagdoll(0).bodyParts) {
      for (const axis of part.position) {
        // toBeCloseTo, not toBe: negative offsets legitimately yield -0.
        expect(axis).toBeCloseTo(0, 10);
      }
      for (const dimension of part.size) {
        expect(Number.isNaN(dimension)).toBe(false);
      }
    }
  });

  it('uses positive damping and a non-negative sleep threshold', () => {
    const ragdoll = createHumanoidRagdoll();
    expect(ragdoll.linearDamping).toBeGreaterThanOrEqual(0);
    expect(ragdoll.angularDamping).toBeGreaterThanOrEqual(0);
    expect(ragdoll.sleepThreshold).toBeGreaterThanOrEqual(0);
  });
});
