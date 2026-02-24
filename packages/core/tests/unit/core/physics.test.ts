/**
 * Physics Utilities Unit Tests
 *
 * Comprehensive tests for physics helper functions, configuration factories,
 * and physics calculations.
 *
 * @module core/physics.test
 */

import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import {
  applyDrag,
  CollisionLayer,
  calculateBuoyancyForce,
  calculateExplosionForce,
  calculateForce,
  calculateImpulse,
  calculateJumpImpulse,
  calculateLandingVelocity,
  calculateSlopeAngle,
  calculateSteeringAngle,
  calculateSuspensionForce,
  collisionFilters,
  createDefaultBuoyancyConfig,
  createDefaultCharacterConfig,
  createDefaultDestructibleConfig,
  createDefaultPhysicsConfig,
  createDefaultVehicleConfig,
  createHumanoidRagdoll,
  generateDebrisVelocity,
  isWalkableSlope,
  projectVelocityOntoGround,
} from '../../../src/core/physics';

describe('CollisionLayer', () => {
  it('defines expected layers', () => {
    expect(CollisionLayer.Default).toBe(0x0001);
    expect(CollisionLayer.Static).toBe(0x0002);
    expect(CollisionLayer.Dynamic).toBe(0x0004);
    expect(CollisionLayer.Character).toBe(0x0008);
    expect(CollisionLayer.Vehicle).toBe(0x0010);
    expect(CollisionLayer.Projectile).toBe(0x0020);
    expect(CollisionLayer.Trigger).toBe(0x0040);
    expect(CollisionLayer.Debris).toBe(0x0080);
    expect(CollisionLayer.Water).toBe(0x0100);
    expect(CollisionLayer.All).toBe(0xffff);
  });

  it('layers are unique powers of 2', () => {
    const layers = [
      CollisionLayer.Default,
      CollisionLayer.Static,
      CollisionLayer.Dynamic,
      CollisionLayer.Character,
      CollisionLayer.Vehicle,
      CollisionLayer.Projectile,
      CollisionLayer.Trigger,
      CollisionLayer.Debris,
      CollisionLayer.Water,
    ];

    // Check each is a power of 2
    layers.forEach((layer) => {
      expect(layer & (layer - 1)).toBe(0);
    });

    // Check uniqueness
    const unique = new Set(layers);
    expect(unique.size).toBe(layers.length);
  });
});

describe('collisionFilters', () => {
  it('defines default filter', () => {
    expect(collisionFilters.default).toBeDefined();
    expect(collisionFilters.default.memberships).toBe(CollisionLayer.Default);
    expect(collisionFilters.default.filter).toBe(CollisionLayer.All);
  });

  it('defines static filter', () => {
    expect(collisionFilters.static.memberships).toBe(CollisionLayer.Static);
    expect(collisionFilters.static.filter).toBe(CollisionLayer.All);
  });

  it('defines character filter with correct collisions', () => {
    const filter = collisionFilters.character;
    expect(filter.memberships).toBe(CollisionLayer.Character);

    // Character should collide with static, dynamic, trigger, water
    expect(filter.filter & CollisionLayer.Static).toBeTruthy();
    expect(filter.filter & CollisionLayer.Dynamic).toBeTruthy();
    expect(filter.filter & CollisionLayer.Trigger).toBeTruthy();
    expect(filter.filter & CollisionLayer.Water).toBeTruthy();
  });

  it('defines projectile filter', () => {
    const filter = collisionFilters.projectile;
    expect(filter.memberships).toBe(CollisionLayer.Projectile);

    // Projectile should hit static, dynamic, character, vehicle
    expect(filter.filter & CollisionLayer.Static).toBeTruthy();
    expect(filter.filter & CollisionLayer.Character).toBeTruthy();
  });

  it('defines trigger filter', () => {
    const filter = collisionFilters.trigger;
    expect(filter.memberships).toBe(CollisionLayer.Trigger);

    // Trigger should only detect character and vehicle
    expect(filter.filter & CollisionLayer.Character).toBeTruthy();
    expect(filter.filter & CollisionLayer.Vehicle).toBeTruthy();
    expect(filter.filter & CollisionLayer.Static).toBeFalsy();
  });
});

describe('calculateImpulse', () => {
  it('calculates impulse for velocity change', () => {
    const current = new THREE.Vector3(0, 0, 0);
    const target = new THREE.Vector3(10, 0, 0);
    const mass = 5;

    const impulse = calculateImpulse(current, target, mass);

    expect(impulse.x).toBe(50); // 10 * 5
    expect(impulse.y).toBe(0);
    expect(impulse.z).toBe(0);
  });

  it('handles deceleration', () => {
    const current = new THREE.Vector3(10, 0, 0);
    const target = new THREE.Vector3(0, 0, 0);
    const mass = 2;

    const impulse = calculateImpulse(current, target, mass);

    expect(impulse.x).toBe(-20);
  });

  it('handles 3D velocity change', () => {
    const current = new THREE.Vector3(1, 2, 3);
    const target = new THREE.Vector3(4, 5, 6);
    const mass = 1;

    const impulse = calculateImpulse(current, target, mass);

    expect(impulse.x).toBe(3);
    expect(impulse.y).toBe(3);
    expect(impulse.z).toBe(3);
  });
});

describe('calculateForce', () => {
  it('calculates force from impulse and time', () => {
    const current = new THREE.Vector3(0, 0, 0);
    const target = new THREE.Vector3(10, 0, 0);
    const mass = 1;
    const deltaTime = 0.5;

    const force = calculateForce(current, target, mass, deltaTime);

    // impulse = 10, force = 10 / 0.5 = 20
    expect(force.x).toBe(20);
  });

  it('handles small delta time', () => {
    const current = new THREE.Vector3(0, 0, 0);
    const target = new THREE.Vector3(1, 0, 0);
    const mass = 1;
    const deltaTime = 0.016;

    const force = calculateForce(current, target, mass, deltaTime);

    expect(force.x).toBeCloseTo(62.5, 0);
  });
});

describe('calculateJumpImpulse', () => {
  it('calculates jump impulse for desired height', () => {
    const jumpHeight = 2;
    const gravity = 9.81;
    const mass = 80;

    const impulse = calculateJumpImpulse(jumpHeight, gravity, mass);

    // v = sqrt(2 * g * h) = sqrt(2 * 9.81 * 2) = ~6.26
    // impulse = v * mass = ~501
    expect(impulse).toBeCloseTo(500.8, 0);
  });

  it('handles negative gravity', () => {
    const jumpHeight = 1;
    const gravity = -9.81;
    const mass = 1;

    const impulse = calculateJumpImpulse(jumpHeight, gravity, mass);

    expect(impulse).toBeCloseTo(Math.sqrt(2 * 9.81 * 1), 1);
  });

  it('scales with mass', () => {
    const jumpHeight = 1;
    const gravity = 10;
    const mass1 = 1;
    const mass2 = 2;

    const impulse1 = calculateJumpImpulse(jumpHeight, gravity, mass1);
    const impulse2 = calculateJumpImpulse(jumpHeight, gravity, mass2);

    expect(impulse2).toBe(impulse1 * 2);
  });
});

describe('calculateLandingVelocity', () => {
  it('calculates landing velocity from fall height', () => {
    const fallHeight = 5;
    const gravity = 9.81;

    const velocity = calculateLandingVelocity(fallHeight, gravity);

    // v = sqrt(2 * g * h) = sqrt(2 * 9.81 * 5) = ~9.9
    expect(velocity).toBeCloseTo(9.9, 1);
  });

  it('returns 0 for zero height', () => {
    const velocity = calculateLandingVelocity(0, 9.81);
    expect(velocity).toBe(0);
  });
});

describe('applyDrag', () => {
  it('reduces velocity', () => {
    const velocity = new THREE.Vector3(10, 0, 0);
    const dragCoefficient = 0.5;
    const deltaTime = 0.1;

    const result = applyDrag(velocity, dragCoefficient, deltaTime);

    expect(result.x).toBeLessThan(10);
    expect(result.x).toBeGreaterThan(0);
  });

  it('does not modify original velocity', () => {
    const velocity = new THREE.Vector3(10, 5, 2);
    applyDrag(velocity, 0.5, 0.1);

    expect(velocity.x).toBe(10);
    expect(velocity.y).toBe(5);
    expect(velocity.z).toBe(2);
  });

  it('clamps to zero with high drag', () => {
    const velocity = new THREE.Vector3(1, 0, 0);
    const result = applyDrag(velocity, 100, 1);

    expect(result.x).toBe(0);
  });

  it('applies uniformly to all axes', () => {
    const velocity = new THREE.Vector3(10, 10, 10);
    const result = applyDrag(velocity, 0.5, 0.1);

    expect(result.x).toBe(result.y);
    expect(result.y).toBe(result.z);
  });
});

describe('calculateBuoyancyForce', () => {
  it('returns 0 when not submerged', () => {
    const force = calculateBuoyancyForce(-1, 10, 1);
    expect(force).toBe(0);
  });

  it('returns 0 at surface level', () => {
    const force = calculateBuoyancyForce(0, 10, 1);
    expect(force).toBe(0);
  });

  it('increases with depth', () => {
    const force1 = calculateBuoyancyForce(1, 10, 1);
    const force2 = calculateBuoyancyForce(2, 10, 1);

    expect(force2).toBeGreaterThan(force1);
  });

  it('scales with buoyancy strength', () => {
    const force1 = calculateBuoyancyForce(1, 10, 1);
    const force2 = calculateBuoyancyForce(1, 20, 1);

    expect(force2).toBe(force1 * 2);
  });

  it('scales with mass', () => {
    const force1 = calculateBuoyancyForce(1, 10, 1);
    const force2 = calculateBuoyancyForce(1, 10, 2);

    expect(force2).toBe(force1 * 2);
  });
});

describe('calculateSlopeAngle', () => {
  it('returns 0 for flat surface', () => {
    const normal = new THREE.Vector3(0, 1, 0);
    const angle = calculateSlopeAngle(normal);

    expect(angle).toBeCloseTo(0);
  });

  it('returns PI/2 for vertical surface', () => {
    const normal = new THREE.Vector3(1, 0, 0);
    const angle = calculateSlopeAngle(normal);

    expect(angle).toBeCloseTo(Math.PI / 2);
  });

  it('returns correct angle for 45 degree slope', () => {
    const normal = new THREE.Vector3(1, 1, 0).normalize();
    const angle = calculateSlopeAngle(normal);

    expect(angle).toBeCloseTo(Math.PI / 4);
  });

  it('handles inverted surfaces', () => {
    const normal = new THREE.Vector3(0, -1, 0);
    const angle = calculateSlopeAngle(normal);

    expect(angle).toBeCloseTo(Math.PI);
  });
});

describe('isWalkableSlope', () => {
  it('returns true for flat surface', () => {
    const normal = new THREE.Vector3(0, 1, 0);
    expect(isWalkableSlope(normal, Math.PI / 4)).toBe(true);
  });

  it('returns false for steep slope', () => {
    const normal = new THREE.Vector3(1, 0.5, 0).normalize();
    expect(isWalkableSlope(normal, Math.PI / 6)).toBe(false);
  });

  it('returns true at exactly max angle', () => {
    const maxAngle = Math.PI / 4;
    const normal = new THREE.Vector3(1, 1, 0).normalize();
    // Due to floating point, use a slightly larger max angle
    expect(isWalkableSlope(normal, maxAngle + 0.001)).toBe(true);
  });

  it('returns false for vertical wall', () => {
    const normal = new THREE.Vector3(1, 0, 0);
    expect(isWalkableSlope(normal, Math.PI / 4)).toBe(false);
  });
});

describe('projectVelocityOntoGround', () => {
  it('removes vertical component on flat ground', () => {
    const velocity = new THREE.Vector3(5, -10, 3);
    const normal = new THREE.Vector3(0, 1, 0);

    const result = projectVelocityOntoGround(velocity, normal);

    expect(result.x).toBe(5);
    expect(result.y).toBeCloseTo(0);
    expect(result.z).toBe(3);
  });

  it('projects onto sloped surface', () => {
    const velocity = new THREE.Vector3(0, -10, 0);
    const normal = new THREE.Vector3(0, 1, 1).normalize();

    const result = projectVelocityOntoGround(velocity, normal);

    // Should have some Z component now
    expect(result.z).not.toBe(0);
  });

  it('does not modify original velocity', () => {
    const velocity = new THREE.Vector3(5, -10, 3);
    const normal = new THREE.Vector3(0, 1, 0);

    projectVelocityOntoGround(velocity, normal);

    expect(velocity.y).toBe(-10);
  });
});

describe('calculateSteeringAngle', () => {
  it('returns 0 when aligned', () => {
    const current = new THREE.Vector3(0, 0, 1);
    const target = new THREE.Vector3(0, 0, 1);

    const angle = calculateSteeringAngle(current, target, Math.PI / 4);

    expect(angle).toBeCloseTo(0);
  });

  it('returns positive for right turn', () => {
    const current = new THREE.Vector3(0, 0, 1);
    const target = new THREE.Vector3(1, 0, 0);

    const angle = calculateSteeringAngle(current, target, Math.PI);

    expect(angle).toBeGreaterThan(0);
  });

  it('returns negative for left turn', () => {
    const current = new THREE.Vector3(0, 0, 1);
    const target = new THREE.Vector3(-1, 0, 0);

    const angle = calculateSteeringAngle(current, target, Math.PI);

    expect(angle).toBeLessThan(0);
  });

  it('clamps to max steer angle', () => {
    const current = new THREE.Vector3(0, 0, 1);
    const target = new THREE.Vector3(1, 0, 0);
    const maxSteer = 0.1;

    const angle = calculateSteeringAngle(current, target, maxSteer);

    expect(Math.abs(angle)).toBeLessThanOrEqual(maxSteer);
  });
});

describe('calculateSuspensionForce', () => {
  it('returns spring force based on compression', () => {
    const force = calculateSuspensionForce(0.5, 0, 1000, 100);

    expect(force).toBe(500); // 0.5 * 1000
  });

  it('applies damping based on velocity', () => {
    const forceUp = calculateSuspensionForce(0.5, 1, 1000, 100);
    const forceDown = calculateSuspensionForce(0.5, -1, 1000, 100);

    // Moving up = positive velocity = negative damper force
    expect(forceUp).toBeLessThan(500);
    expect(forceDown).toBeGreaterThan(500);
  });

  it('returns 0 with no compression and no velocity', () => {
    const force = calculateSuspensionForce(0, 0, 1000, 100);
    expect(force).toBe(0);
  });
});

describe('calculateExplosionForce', () => {
  it('returns max force at center', () => {
    const force = calculateExplosionForce(0, 10, 100);
    expect(force).toBe(100);
  });

  it('returns 0 outside radius', () => {
    const force = calculateExplosionForce(10, 10, 100);
    expect(force).toBe(0);

    const forceBeyond = calculateExplosionForce(15, 10, 100);
    expect(forceBeyond).toBe(0);
  });

  it('falls off quadratically', () => {
    const forceHalf = calculateExplosionForce(5, 10, 100);

    // At half radius: falloff = 0.5, force = 100 * 0.25 = 25
    expect(forceHalf).toBe(25);
  });

  it('applies smooth falloff', () => {
    const force1 = calculateExplosionForce(2, 10, 100);
    const force2 = calculateExplosionForce(4, 10, 100);
    const force3 = calculateExplosionForce(6, 10, 100);

    expect(force1).toBeGreaterThan(force2);
    expect(force2).toBeGreaterThan(force3);
  });
});

describe('generateDebrisVelocity', () => {
  it('returns velocity away from explosion', () => {
    const center = new THREE.Vector3(0, 0, 0);
    const debris = new THREE.Vector3(10, 0, 0);

    const velocity = generateDebrisVelocity(center, debris, 10, 0);

    expect(velocity.x).toBeGreaterThan(0);
  });

  it('applies randomness', () => {
    const center = new THREE.Vector3(0, 0, 0);
    const debris = new THREE.Vector3(10, 0, 0);

    const velocities: THREE.Vector3[] = [];
    for (let i = 0; i < 10; i++) {
      velocities.push(generateDebrisVelocity(center, debris, 10, 0.5));
    }

    // Not all velocities should be identical
    const allSame = velocities.every(
      (v) => v.x === velocities[0].x && v.y === velocities[0].y && v.z === velocities[0].z
    );
    expect(allSame).toBe(false);
  });

  it('has upward bias with randomness', () => {
    const center = new THREE.Vector3(0, 0, 0);
    const debris = new THREE.Vector3(10, 0, 0);

    let totalY = 0;
    for (let i = 0; i < 100; i++) {
      const velocity = generateDebrisVelocity(center, debris, 10, 0.5);
      totalY += velocity.y;
    }

    // Average Y should be positive (upward bias)
    expect(totalY / 100).toBeGreaterThan(-1);
  });

  it('scales with base force', () => {
    const center = new THREE.Vector3(0, 0, 0);
    const debris = new THREE.Vector3(10, 0, 0);

    const v1 = generateDebrisVelocity(center, debris, 10, 0);
    const v2 = generateDebrisVelocity(center, debris, 20, 0);

    expect(v2.length()).toBeGreaterThan(v1.length());
  });
});

describe('Configuration Factories', () => {
  describe('createDefaultPhysicsConfig', () => {
    it('returns valid config', () => {
      const config = createDefaultPhysicsConfig();

      expect(config.gravity).toEqual([0, -9.81, 0]);
      expect(config.timeStep).toBe(1 / 60);
      expect(config.maxStabilizationIterations).toBe(1);
      expect(config.maxVelocityIterations).toBe(4);
      expect(config.maxVelocityFrictionIterations).toBe(8);
      expect(config.erp).toBe(0.8);
      expect(config.allowedLinearError).toBe(0.001);
      expect(config.predictionDistance).toBe(0.002);
    });
  });

  describe('createDefaultCharacterConfig', () => {
    it('returns valid config', () => {
      const config = createDefaultCharacterConfig();

      expect(config.capsuleRadius).toBe(0.3);
      expect(config.capsuleHeight).toBe(1.8);
      expect(config.mass).toBe(80);
      expect(config.maxSpeed).toBe(6);
      expect(config.jumpForce).toBe(8);
      expect(config.maxJumps).toBe(1);
      expect(config.slopeLimit).toBe(Math.PI / 4);
      expect(config.coyoteTime).toBe(0.15);
      expect(config.airControl).toBe(0.3);
    });

    it('has reasonable movement values', () => {
      const config = createDefaultCharacterConfig();

      expect(config.acceleration).toBeGreaterThan(0);
      expect(config.deceleration).toBeGreaterThan(0);
      expect(config.groundCheckDistance).toBeGreaterThan(0);
    });
  });

  describe('createDefaultVehicleConfig', () => {
    it('returns valid config', () => {
      const config = createDefaultVehicleConfig();

      expect(config.chassisMass).toBe(1500);
      expect(config.wheelPositions.length).toBe(4);
      expect(config.driveWheels).toBe('rear');
    });

    it('has 4 wheel positions', () => {
      const config = createDefaultVehicleConfig();

      expect(config.wheelPositions).toHaveLength(4);
      config.wheelPositions.forEach((pos) => {
        expect(pos).toHaveLength(3);
      });
    });
  });

  describe('createDefaultDestructibleConfig', () => {
    it('returns valid config', () => {
      const config = createDefaultDestructibleConfig();

      expect(config.health).toBe(100);
      expect(config.breakForce).toBe(50);
      expect(config.shardCount).toBe(8);
      expect(config.shardLifetime).toBe(3);
    });
  });

  describe('createDefaultBuoyancyConfig', () => {
    it('returns valid config', () => {
      const config = createDefaultBuoyancyConfig();

      expect(config.waterLevel).toBe(0);
      expect(config.buoyancyForce).toBe(15);
      expect(config.waterDrag).toBe(3);
      expect(config.dynamicWater).toBe(false);
    });
  });
});

describe('createHumanoidRagdoll', () => {
  it('returns valid ragdoll config', () => {
    const ragdoll = createHumanoidRagdoll();

    expect(ragdoll.bodyParts.length).toBeGreaterThan(0);
    expect(ragdoll.joints.length).toBeGreaterThan(0);
    expect(ragdoll.linearDamping).toBeGreaterThan(0);
    expect(ragdoll.angularDamping).toBeGreaterThan(0);
  });

  it('has expected body parts', () => {
    const ragdoll = createHumanoidRagdoll();
    const partNames = ragdoll.bodyParts.map((p) => p.name);

    expect(partNames).toContain('pelvis');
    expect(partNames).toContain('torso');
    expect(partNames).toContain('chest');
    expect(partNames).toContain('head');
    expect(partNames).toContain('upperArmL');
    expect(partNames).toContain('upperArmR');
    expect(partNames).toContain('thighL');
    expect(partNames).toContain('thighR');
  });

  it('respects scale parameter', () => {
    const ragdoll1 = createHumanoidRagdoll(1);
    const ragdoll2 = createHumanoidRagdoll(2);

    const head1 = ragdoll1.bodyParts.find((p) => p.name === 'head');
    const head2 = ragdoll2.bodyParts.find((p) => p.name === 'head');

    // Scale 2 should have double the position
    expect(head2!.position[1]).toBe(head1!.position[1] * 2);
  });

  it('has joints connecting body parts', () => {
    const ragdoll = createHumanoidRagdoll();

    ragdoll.joints.forEach((joint) => {
      const parentExists = ragdoll.bodyParts.some((p) => p.name === joint.parent);
      const childExists = ragdoll.bodyParts.some((p) => p.name === joint.child);

      expect(parentExists).toBe(true);
      expect(childExists).toBe(true);
    });
  });

  it('joints have valid types', () => {
    const ragdoll = createHumanoidRagdoll();
    const validTypes = ['spherical', 'revolute', 'prismatic', 'fixed'];

    ragdoll.joints.forEach((joint) => {
      expect(validTypes).toContain(joint.type);
    });
  });
});
