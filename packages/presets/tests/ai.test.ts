import { describe, expect, it } from 'vitest';
import * as YUKA from 'yuka';
import { createFlockMemberPreset } from '../src/ai/FlockMemberPreset';
import { createFlock } from '../src/ai/FlockPreset';
import { createFollowerPreset } from '../src/ai/FollowerPreset';
import { createGuardPreset } from '../src/ai/GuardPreset';
import { createPredatorPreset } from '../src/ai/PredatorPreset';
import { createPreyPreset } from '../src/ai/PreyPreset';

describe('createGuardPreset', () => {
  const defaultWaypoints: Array<[number, number, number]> = [
    [0, 0, 0],
    [10, 0, 0],
    [10, 0, 10],
  ];

  it('returns vehicle, behaviors, stateMachine, and update', () => {
    const result = createGuardPreset({ patrolWaypoints: defaultWaypoints });

    expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
    expect(Array.isArray(result.behaviors)).toBe(true);
    expect(result.behaviors.length).toBeGreaterThan(0);
    expect(result.stateMachine).toBeDefined();
    expect(typeof result.update).toBe('function');
  });

  it('sets vehicle properties from config', () => {
    const result = createGuardPreset({
      patrolWaypoints: defaultWaypoints,
      maxSpeed: 10,
      maxForce: 15,
      mass: 2,
    });

    expect(result.vehicle.maxSpeed).toBe(10);
    expect(result.vehicle.maxForce).toBe(15);
    expect(result.vehicle.mass).toBe(2);
  });

  it('uses default values for optional params', () => {
    const result = createGuardPreset({ patrolWaypoints: defaultWaypoints });

    expect(result.vehicle.maxSpeed).toBe(8);
    expect(result.vehicle.maxForce).toBe(10);
    expect(result.vehicle.mass).toBe(1);
  });

  it('throws when no waypoints provided', () => {
    expect(() => createGuardPreset({ patrolWaypoints: [] })).toThrow();
  });

  it('has follow path and seek behaviors', () => {
    const result = createGuardPreset({ patrolWaypoints: defaultWaypoints });

    const hasFollowPath = result.behaviors.some((b) => b instanceof YUKA.FollowPathBehavior);
    const hasSeek = result.behaviors.some((b) => b instanceof YUKA.SeekBehavior);

    expect(hasFollowPath).toBe(true);
    expect(hasSeek).toBe(true);
  });

  it('follow path is active, seek is inactive by default', () => {
    const result = createGuardPreset({ patrolWaypoints: defaultWaypoints });

    const followPath = result.behaviors.find(
      (b) => b instanceof YUKA.FollowPathBehavior
    ) as YUKA.FollowPathBehavior;
    const seek = result.behaviors.find(
      (b) => b instanceof YUKA.SeekBehavior
    ) as YUKA.SeekBehavior;

    expect(followPath.active).toBe(true);
    expect(seek.active).toBe(false);
  });

  it('update function can be called with no context', () => {
    const result = createGuardPreset({
      patrolWaypoints: defaultWaypoints,
      detectionRadius: 5,
    });

    // Should not throw when called without context
    expect(() => result.update!(0.016)).not.toThrow();
  });

  it('update function can be called with distant player', () => {
    const result = createGuardPreset({
      patrolWaypoints: defaultWaypoints,
      detectionRadius: 5,
    });

    // Player far away - should stay patrolling (no state change)
    expect(() =>
      result.update!(0.016, { playerPosition: new YUKA.Vector3(100, 0, 100) })
    ).not.toThrow();
  });
});

describe('createFollowerPreset', () => {
  it('returns vehicle, behaviors, and update', () => {
    const result = createFollowerPreset();

    expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
    expect(Array.isArray(result.behaviors)).toBe(true);
    expect(result.behaviors.length).toBeGreaterThan(0);
    expect(typeof result.update).toBe('function');
  });

  it('uses default values', () => {
    const result = createFollowerPreset();

    expect(result.vehicle.maxSpeed).toBe(6);
    expect(result.vehicle.maxForce).toBe(10);
    expect(result.vehicle.mass).toBe(1);
  });

  it('accepts custom config', () => {
    const result = createFollowerPreset({
      maxSpeed: 12,
      followDistance: 3,
      offset: [-5, 0, -5],
    });

    expect(result.vehicle.maxSpeed).toBe(12);
  });

  it('has arrive behavior', () => {
    const result = createFollowerPreset();

    const hasArrive = result.behaviors.some((b) => b instanceof YUKA.ArriveBehavior);
    expect(hasArrive).toBe(true);
  });

  it('update function handles leader position', () => {
    const result = createFollowerPreset();

    result.update!(0.016, {
      leaderPosition: new YUKA.Vector3(10, 0, 10),
    });

    // Should not throw
    result.update!(0.016, {
      leaderPosition: new YUKA.Vector3(10, 0, 10),
      leaderRotation: new YUKA.Quaternion(),
    });
  });
});

describe('createFlockMemberPreset', () => {
  it('returns vehicle and behaviors', () => {
    const result = createFlockMemberPreset();

    expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
    expect(Array.isArray(result.behaviors)).toBe(true);
    expect(result.behaviors.length).toBeGreaterThan(0);
  });

  it('uses default values', () => {
    const result = createFlockMemberPreset();

    expect(result.vehicle.maxSpeed).toBe(5);
    expect(result.vehicle.maxForce).toBe(8);
    expect(result.vehicle.mass).toBe(1);
    expect(result.vehicle.updateNeighborhood).toBe(true);
    expect(result.vehicle.neighborhoodRadius).toBe(10);
  });

  it('accepts custom config', () => {
    const result = createFlockMemberPreset({
      separationWeight: 3,
      alignmentWeight: 2,
      cohesionWeight: 0.5,
      neighborRadius: 20,
      maxSpeed: 8,
    });

    expect(result.vehicle.maxSpeed).toBe(8);
    expect(result.vehicle.neighborhoodRadius).toBe(20);
  });

  it('has separation, alignment, cohesion, and wander behaviors', () => {
    const result = createFlockMemberPreset();

    const hasSeparation = result.behaviors.some((b) => b instanceof YUKA.SeparationBehavior);
    const hasAlignment = result.behaviors.some((b) => b instanceof YUKA.AlignmentBehavior);
    const hasCohesion = result.behaviors.some((b) => b instanceof YUKA.CohesionBehavior);
    const hasWander = result.behaviors.some((b) => b instanceof YUKA.WanderBehavior);

    expect(hasSeparation).toBe(true);
    expect(hasAlignment).toBe(true);
    expect(hasCohesion).toBe(true);
    expect(hasWander).toBe(true);
  });

  it('applies custom weights', () => {
    const result = createFlockMemberPreset({
      separationWeight: 3,
      alignmentWeight: 2,
      cohesionWeight: 0.5,
    });

    const separation = result.behaviors.find(
      (b) => b instanceof YUKA.SeparationBehavior
    ) as YUKA.SeparationBehavior;
    const alignment = result.behaviors.find(
      (b) => b instanceof YUKA.AlignmentBehavior
    ) as YUKA.AlignmentBehavior;
    const cohesion = result.behaviors.find(
      (b) => b instanceof YUKA.CohesionBehavior
    ) as YUKA.CohesionBehavior;

    expect(separation.weight).toBe(3);
    expect(alignment.weight).toBe(2);
    expect(cohesion.weight).toBe(0.5);
  });
});

describe('createFlock', () => {
  it('creates correct number of members', () => {
    const flock = createFlock({ count: 5 });
    expect(flock).toHaveLength(5);
  });

  it('each member is a valid AI preset result', () => {
    const flock = createFlock({ count: 3 });

    for (const member of flock) {
      expect(member.vehicle).toBeInstanceOf(YUKA.Vehicle);
      expect(Array.isArray(member.behaviors)).toBe(true);
    }
  });

  it('members are spawned within spawn area', () => {
    const spawnArea = {
      min: [0, 5, 0] as [number, number, number],
      max: [10, 15, 10] as [number, number, number],
    };
    const flock = createFlock({ count: 20, spawnArea });

    for (const member of flock) {
      const pos = member.vehicle.position;
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThanOrEqual(10);
      expect(pos.y).toBeGreaterThanOrEqual(5);
      expect(pos.y).toBeLessThanOrEqual(15);
      expect(pos.z).toBeGreaterThanOrEqual(0);
      expect(pos.z).toBeLessThanOrEqual(10);
    }
  });

  it('uses default spawn area when not specified', () => {
    const flock = createFlock({ count: 5 });

    for (const member of flock) {
      const pos = member.vehicle.position;
      expect(pos.x).toBeGreaterThanOrEqual(-10);
      expect(pos.x).toBeLessThanOrEqual(10);
      expect(pos.z).toBeGreaterThanOrEqual(-10);
      expect(pos.z).toBeLessThanOrEqual(10);
    }
  });

  it('passes member config to each member', () => {
    const flock = createFlock({
      count: 3,
      maxSpeed: 12,
      separationWeight: 3,
    });

    for (const member of flock) {
      expect(member.vehicle.maxSpeed).toBe(12);
    }
  });

  it('creates zero members when count is 0', () => {
    const flock = createFlock({ count: 0 });
    expect(flock).toHaveLength(0);
  });
});

describe('createPredatorPreset', () => {
  it('returns vehicle, behaviors, stateMachine, and update', () => {
    const result = createPredatorPreset();

    expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
    expect(Array.isArray(result.behaviors)).toBe(true);
    expect(result.stateMachine).toBeDefined();
    expect(typeof result.update).toBe('function');
  });

  it('uses default values', () => {
    const result = createPredatorPreset();

    expect(result.vehicle.maxSpeed).toBe(12);
    expect(result.vehicle.maxForce).toBe(15);
    expect(result.vehicle.mass).toBe(2);
  });

  it('has wander and seek behaviors without patrol', () => {
    const result = createPredatorPreset();

    const hasWander = result.behaviors.some((b) => b instanceof YUKA.WanderBehavior);
    const hasSeek = result.behaviors.some((b) => b instanceof YUKA.SeekBehavior);

    expect(hasWander).toBe(true);
    expect(hasSeek).toBe(true);
  });

  it('has follow path when patrol waypoints provided', () => {
    const result = createPredatorPreset({
      patrolWaypoints: [
        [0, 0, 0],
        [10, 0, 0],
      ],
    });

    const hasFollowPath = result.behaviors.some((b) => b instanceof YUKA.FollowPathBehavior);
    expect(hasFollowPath).toBe(true);
  });

  it('wander is active without patrol waypoints', () => {
    const result = createPredatorPreset();

    const wander = result.behaviors.find(
      (b) => b instanceof YUKA.WanderBehavior
    ) as YUKA.WanderBehavior;
    expect(wander.active).toBe(true);
  });

  it('wander is inactive with patrol waypoints', () => {
    const result = createPredatorPreset({
      patrolWaypoints: [
        [0, 0, 0],
        [10, 0, 0],
      ],
    });

    const wander = result.behaviors.find(
      (b) => b instanceof YUKA.WanderBehavior
    ) as YUKA.WanderBehavior;
    expect(wander.active).toBe(false);
  });

  it('update function can be called with no context', () => {
    const result = createPredatorPreset({ detectionRadius: 5 });

    expect(() => result.update!(0.016)).not.toThrow();
  });

  it('update function can be called with distant prey', () => {
    const result = createPredatorPreset({ detectionRadius: 5 });

    // Prey far away - no state change
    expect(() =>
      result.update!(0.016, { preyPosition: new YUKA.Vector3(100, 0, 100) })
    ).not.toThrow();
  });
});

describe('createPreyPreset', () => {
  it('returns vehicle, behaviors, stateMachine, and update', () => {
    const result = createPreyPreset();

    expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
    expect(Array.isArray(result.behaviors)).toBe(true);
    expect(result.stateMachine).toBeDefined();
    expect(typeof result.update).toBe('function');
  });

  it('uses default values', () => {
    const result = createPreyPreset();

    expect(result.vehicle.maxSpeed).toBe(6);
    expect(result.vehicle.maxForce).toBe(8);
    expect(result.vehicle.mass).toBe(1);
  });

  it('accepts custom config', () => {
    const result = createPreyPreset({
      wanderRadius: 5,
      fleeDistance: 20,
      fleeSpeed: 15,
      maxSpeed: 10,
    });

    expect(result.vehicle.maxSpeed).toBe(10);
  });

  it('has wander and flee behaviors', () => {
    const result = createPreyPreset();

    const hasWander = result.behaviors.some((b) => b instanceof YUKA.WanderBehavior);
    const hasFlee = result.behaviors.some((b) => b instanceof YUKA.FleeBehavior);

    expect(hasWander).toBe(true);
    expect(hasFlee).toBe(true);
  });

  it('wander is active by default', () => {
    const result = createPreyPreset();

    const wander = result.behaviors.find(
      (b) => b instanceof YUKA.WanderBehavior
    ) as YUKA.WanderBehavior;
    expect(wander.active).toBe(true);
  });

  it('flee is inactive by default', () => {
    const result = createPreyPreset();

    const flee = result.behaviors.find(
      (b) => b instanceof YUKA.FleeBehavior
    ) as YUKA.FleeBehavior;
    expect(flee.active).toBe(false);
  });

  it('update function can be called with no context', () => {
    const result = createPreyPreset({ fleeDistance: 5 });

    expect(() => result.update!(0.016)).not.toThrow();
  });

  it('update function can be called with distant threat', () => {
    const result = createPreyPreset({ fleeDistance: 5 });

    // Threat far away - no state change
    expect(() =>
      result.update!(0.016, { threatPosition: new YUKA.Vector3(100, 0, 100) })
    ).not.toThrow();
  });

  it('sets wander radius from config', () => {
    const result = createPreyPreset({ wanderRadius: 5 });

    const wander = result.behaviors.find(
      (b) => b instanceof YUKA.WanderBehavior
    ) as YUKA.WanderBehavior;
    expect(wander.radius).toBe(5);
  });

  it('sets flee panic distance from config', () => {
    const result = createPreyPreset({ fleeDistance: 15 });

    const flee = result.behaviors.find(
      (b) => b instanceof YUKA.FleeBehavior
    ) as YUKA.FleeBehavior;
    expect(flee.panicDistance).toBe(15);
  });
});
