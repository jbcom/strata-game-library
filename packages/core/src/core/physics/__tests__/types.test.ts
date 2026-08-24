/**
 * Physics type-contract and public-surface tests.
 *
 * The types module carries no runtime logic, so these tests pin the two things
 * that can still break consumers: that the declared shapes accept and reject the
 * right values at compile time (asserted via satisfies), and that the barrel
 * re-exports the complete public surface from a single import path.
 *
 * @module core/physics/types.test
 */

import { describe, expect, it } from 'vitest';
import * as physics from '../index';
import type {
  BuoyancyConfig,
  CharacterControllerConfig,
  DestructibleConfig,
  PhysicsConfig,
  PhysicsMaterial,
  RagdollBodyPart,
  RagdollConfig,
  RagdollJointConfig,
  VehicleConfig,
  WheelConfig,
} from '../types';

describe('public surface', () => {
  const EXPECTED_VALUE_EXPORTS = [
    'CollisionLayer',
    'applyDrag',
    'calculateBuoyancyForce',
    'calculateExplosionForce',
    'calculateForce',
    'calculateImpulse',
    'calculateJumpImpulse',
    'calculateLandingVelocity',
    'calculateSlopeAngle',
    'calculateSteeringAngle',
    'calculateSuspensionForce',
    'collisionFilters',
    'createDefaultBuoyancyConfig',
    'createDefaultCharacterConfig',
    'createDefaultDestructibleConfig',
    'createDefaultPhysicsConfig',
    'createDefaultVehicleConfig',
    'createHumanoidRagdoll',
    'generateDebrisVelocity',
    'isWalkableSlope',
    'projectVelocityOntoGround',
  ] as const;

  it('re-exports every runtime symbol from the barrel', () => {
    for (const name of EXPECTED_VALUE_EXPORTS) {
      expect(physics).toHaveProperty(name);
    }
  });

  it('exports nothing beyond the documented surface', () => {
    expect(Object.keys(physics).sort()).toEqual([...EXPECTED_VALUE_EXPORTS].sort());
  });

  it('exports each calculation as a callable function', () => {
    const NON_FUNCTION_EXPORTS = new Set(['CollisionLayer', 'collisionFilters']);
    const kinds = Object.entries(physics).map(([name, value]) => [name, typeof value]);
    for (const [name, kind] of kinds) {
      expect([name, kind]).toEqual([name, NON_FUNCTION_EXPORTS.has(name) ? 'object' : 'function']);
    }
    expect(kinds).toHaveLength(EXPECTED_VALUE_EXPORTS.length);
  });
});

describe('type contracts', () => {
  it('accepts a fully specified physics config', () => {
    const config = {
      gravity: [0, -9.81, 0],
      timeStep: 1 / 60,
      maxStabilizationIterations: 1,
      maxVelocityIterations: 4,
      maxVelocityFrictionIterations: 8,
      erp: 0.8,
      allowedLinearError: 0.001,
      predictionDistance: 0.002,
    } satisfies PhysicsConfig;
    expect(config.gravity).toHaveLength(3);
  });

  it('accepts a character config and treats every field as required', () => {
    const config = physics.createDefaultCharacterConfig() satisfies CharacterControllerConfig;
    expect(Object.values(config).every((value) => value !== undefined)).toBe(true);
  });

  it('constrains driveWheels to the documented union', () => {
    const rear = {
      ...physics.createDefaultVehicleConfig(),
      driveWheels: 'all',
    } satisfies VehicleConfig;
    expect(['front', 'rear', 'all']).toContain(rear.driveWheels);
  });

  it('accepts a wheel config with all behaviour flags set', () => {
    const wheel = {
      position: [-0.85, -0.3, 1.4],
      radius: 0.35,
      suspensionRestLength: 0.3,
      suspensionStiffness: 30,
      suspensionDamping: 4.5,
      maxSuspensionForce: 6000,
      frictionSlip: 2,
      isSteering: true,
      isDriving: false,
      isBraking: true,
    } satisfies WheelConfig;
    expect(wheel.isSteering).toBe(true);
  });

  it('allows a physics material to omit its optional combine modes', () => {
    const minimal: PhysicsMaterial = { friction: 0.5, restitution: 0.2 };
    const full = {
      friction: 0.5,
      restitution: 0.2,
      frictionCombine: 'multiply',
      restitutionCombine: 'max',
      density: 1000,
    } satisfies PhysicsMaterial;
    expect(minimal.frictionCombine).toBeUndefined();
    expect(full.density).toBe(1000);
  });

  it('allows a joint to omit axis and limits', () => {
    const fixed: RagdollJointConfig = {
      parent: 'pelvis',
      child: 'torso',
      type: 'fixed',
      anchor1: [0, 0, 0],
      anchor2: [0, 0, 0],
    };
    expect(fixed.axis).toBeUndefined();
    expect(fixed.limits).toBeUndefined();
  });

  it('accepts each collider arity a body part supports', () => {
    const sphere = {
      name: 'head',
      type: 'sphere',
      size: [0.12],
      position: [0, 1.95, 0],
      mass: 5,
    } satisfies RagdollBodyPart;
    const capsule = {
      name: 'upperArmL',
      type: 'capsule',
      size: [0.05, 0.25],
      position: [-0.35, 1.6, 0],
      mass: 3,
    } satisfies RagdollBodyPart;
    const box = {
      name: 'pelvis',
      type: 'box',
      size: [0.25, 0.2, 0.15],
      position: [0, 1, 0],
      mass: 10,
    } satisfies RagdollBodyPart;
    expect([sphere.size.length, capsule.size.length, box.size.length]).toEqual([1, 2, 3]);
  });

  it('accepts a ragdoll assembled from parts and joints', () => {
    const ragdoll = physics.createHumanoidRagdoll() satisfies RagdollConfig;
    expect(ragdoll.bodyParts.length).toBeGreaterThan(0);
    expect(ragdoll.joints.length).toBeGreaterThan(0);
  });

  it('accepts destructible and buoyancy configs from their factories', () => {
    const destructible = physics.createDefaultDestructibleConfig() satisfies DestructibleConfig;
    const buoyancy = physics.createDefaultBuoyancyConfig() satisfies BuoyancyConfig;
    expect(destructible.shardScale).toHaveLength(3);
    expect(typeof buoyancy.dynamicWater).toBe('boolean');
  });
});
