import { describe, it, expect, vi } from 'vitest';
import * as YUKA from 'yuka';
import {
    createGuardPreset,
    createPreyPreset,
    createPredatorPreset,
    createFlockMemberPreset,
    createFollowerPreset,
    createFlock,
    AIPresetConfig,
    GuardPresetConfig,
    PreyPresetConfig,
    PredatorPresetConfig,
    FlockMemberPresetConfig,
    FollowerPresetConfig,
    FlockConfig,
    AIPresetResult,
    AIPresetName,
} from '../presets/ai';

describe('createGuardPreset', () => {
    it('should create guard preset with patrol waypoints', () => {
        const config: GuardPresetConfig = {
            patrolWaypoints: [
                [0, 0, 0],
                [10, 0, 0],
                [10, 0, 10],
                [0, 0, 10],
            ],
        };
        const result = createGuardPreset(config);
        expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
        expect(result.behaviors.length).toBeGreaterThan(0);
        expect(result.stateMachine).toBeDefined();
        expect(result.update).toBeDefined();
    });

    it('should create guard with custom detection radius', () => {
        const result = createGuardPreset({
            patrolWaypoints: [
                [0, 0, 0],
                [5, 0, 0],
            ],
            detectionRadius: 20,
        });
        expect(result.vehicle).toBeDefined();
    });

    it('should create guard with custom chase speed', () => {
        const result = createGuardPreset({
            patrolWaypoints: [
                [0, 0, 0],
                [5, 0, 0],
            ],
            chaseSpeed: 12,
        });
        expect(result.vehicle.maxSpeed).toBeLessThanOrEqual(12);
    });

    it('should create guard with custom patrol speed', () => {
        const result = createGuardPreset({
            patrolWaypoints: [
                [0, 0, 0],
                [5, 0, 0],
            ],
            patrolSpeed: 2,
        });
        expect(result.vehicle).toBeDefined();
    });

    it('should have follow path and seek behaviors', () => {
        const result = createGuardPreset({
            patrolWaypoints: [
                [0, 0, 0],
                [5, 0, 0],
            ],
        });
        expect(result.behaviors.length).toBe(2);
    });

    it('should have update function', () => {
        const result = createGuardPreset({
            patrolWaypoints: [
                [0, 0, 0],
                [5, 0, 0],
            ],
        });
        expect(typeof result.update).toBe('function');
    });

    it('should have state machine', () => {
        const result = createGuardPreset({
            patrolWaypoints: [
                [0, 0, 0],
                [50, 0, 0],
            ],
            detectionRadius: 15,
        });
        expect(result.stateMachine).toBeDefined();
        expect(result.stateMachine?.currentState).toBeDefined();
    });
});

describe('createPreyPreset', () => {
    it('should create prey preset with defaults', () => {
        const result = createPreyPreset();
        expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
        expect(result.behaviors.length).toBeGreaterThan(0);
        expect(result.stateMachine).toBeDefined();
    });

    it('should create prey with custom wander radius', () => {
        const result = createPreyPreset({ wanderRadius: 5 });
        expect(result.vehicle).toBeDefined();
    });

    it('should create prey with custom flee distance', () => {
        const result = createPreyPreset({ fleeDistance: 20 });
        expect(result.vehicle).toBeDefined();
    });

    it('should create prey with custom flee speed', () => {
        const result = createPreyPreset({ fleeSpeed: 15 });
        expect(result.vehicle).toBeDefined();
    });

    it('should have wander and flee behaviors', () => {
        const result = createPreyPreset();
        expect(result.behaviors.length).toBe(2);
    });

    it('should have update function', () => {
        const result = createPreyPreset();
        expect(typeof result.update).toBe('function');
    });

    it('should have state machine', () => {
        const result = createPreyPreset({ fleeDistance: 10 });
        expect(result.stateMachine).toBeDefined();
        expect(result.stateMachine?.currentState).toBeDefined();
    });
});

describe('createPredatorPreset', () => {
    it('should create predator preset with defaults', () => {
        const result = createPredatorPreset();
        expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
        expect(result.behaviors.length).toBeGreaterThan(0);
        expect(result.stateMachine).toBeDefined();
    });

    it('should create predator with patrol waypoints', () => {
        const result = createPredatorPreset({
            patrolWaypoints: [
                [0, 0, 0],
                [20, 0, 0],
            ],
        });
        expect(result.behaviors.length).toBe(3);
    });

    it('should create predator with custom pursuit speed', () => {
        const result = createPredatorPreset({ pursuitSpeed: 15 });
        expect(result.vehicle).toBeDefined();
    });

    it('should create predator with custom detection radius', () => {
        const result = createPredatorPreset({ detectionRadius: 30 });
        expect(result.vehicle).toBeDefined();
    });

    it('should have update function', () => {
        const result = createPredatorPreset();
        expect(typeof result.update).toBe('function');
    });

    it('should have state machine', () => {
        const result = createPredatorPreset({ detectionRadius: 20 });
        expect(result.stateMachine).toBeDefined();
        expect(result.stateMachine?.currentState).toBeDefined();
    });
});

describe('createFlockMemberPreset', () => {
    it('should create flock member with defaults', () => {
        const result = createFlockMemberPreset();
        expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
        expect(result.behaviors.length).toBe(4);
    });

    it('should create flock member with custom separation weight', () => {
        const result = createFlockMemberPreset({ separationWeight: 2.0 });
        expect(result.vehicle).toBeDefined();
    });

    it('should create flock member with custom alignment weight', () => {
        const result = createFlockMemberPreset({ alignmentWeight: 1.5 });
        expect(result.vehicle).toBeDefined();
    });

    it('should create flock member with custom cohesion weight', () => {
        const result = createFlockMemberPreset({ cohesionWeight: 0.8 });
        expect(result.vehicle).toBeDefined();
    });

    it('should create flock member with custom neighbor radius', () => {
        const result = createFlockMemberPreset({ neighborRadius: 15 });
        expect(result.vehicle.neighborhoodRadius).toBe(15);
    });

    it('should enable neighborhood updates', () => {
        const result = createFlockMemberPreset();
        expect(result.vehicle.updateNeighborhood).toBe(true);
    });

    it('should have separation, alignment, cohesion, wander behaviors', () => {
        const result = createFlockMemberPreset();
        expect(result.behaviors.length).toBe(4);
    });
});

describe('createFollowerPreset', () => {
    it('should create follower preset with defaults', () => {
        const result = createFollowerPreset();
        expect(result.vehicle).toBeInstanceOf(YUKA.Vehicle);
        expect(result.behaviors.length).toBe(1);
        expect(result.update).toBeDefined();
    });

    it('should create follower with custom offset', () => {
        const result = createFollowerPreset({ offset: [-5, 0, -5] });
        expect(result.vehicle).toBeDefined();
    });

    it('should create follower with custom follow distance', () => {
        const result = createFollowerPreset({ followDistance: 8 });
        expect(result.vehicle).toBeDefined();
    });

    it('should have arrive behavior', () => {
        const result = createFollowerPreset();
        expect(result.behaviors.length).toBe(1);
    });

    it('should update based on leader position', () => {
        const result = createFollowerPreset();
        expect(() =>
            result.update!(0.016, {
                leaderPosition: new YUKA.Vector3(10, 0, 0),
            })
        ).not.toThrow();
    });

    it('should update with leader rotation', () => {
        const result = createFollowerPreset();
        expect(() =>
            result.update!(0.016, {
                leaderPosition: new YUKA.Vector3(10, 0, 0),
                leaderRotation: new YUKA.Quaternion(),
            })
        ).not.toThrow();
    });
});

describe('createFlock', () => {
    it('should create multiple flock members', () => {
        const config: FlockConfig = {
            count: 5,
        };
        const flock = createFlock(config);
        expect(flock.length).toBe(5);
    });

    it('should spawn members in specified area', () => {
        const config: FlockConfig = {
            count: 3,
            spawnArea: {
                min: [0, 0, 0],
                max: [10, 0, 10],
            },
        };
        const flock = createFlock(config);
        for (const member of flock) {
            expect(member.vehicle.position.x).toBeGreaterThanOrEqual(0);
            expect(member.vehicle.position.x).toBeLessThanOrEqual(10);
            expect(member.vehicle.position.z).toBeGreaterThanOrEqual(0);
            expect(member.vehicle.position.z).toBeLessThanOrEqual(10);
        }
    });

    it('should pass member config to each member', () => {
        const config: FlockConfig = {
            count: 2,
            separationWeight: 2.5,
        };
        const flock = createFlock(config);
        expect(flock.length).toBe(2);
    });

    it('should create empty flock with count 0', () => {
        const flock = createFlock({ count: 0 });
        expect(flock.length).toBe(0);
    });
});

describe('AIPresetResult interface', () => {
    it('should have required properties', () => {
        const result = createPreyPreset();
        expect(result.vehicle).toBeDefined();
        expect(result.behaviors).toBeDefined();
    });

    it('should have optional stateMachine', () => {
        const guardResult = createGuardPreset({
            patrolWaypoints: [[0, 0, 0]],
        });
        expect(guardResult.stateMachine).toBeDefined();

        const flockResult = createFlockMemberPreset();
        expect(flockResult.stateMachine).toBeUndefined();
    });

    it('should have optional update function', () => {
        const guardResult = createGuardPreset({
            patrolWaypoints: [[0, 0, 0]],
        });
        expect(typeof guardResult.update).toBe('function');

        const flockResult = createFlockMemberPreset();
        expect(flockResult.update).toBeUndefined();
    });
});

describe('AIPresetConfig interface', () => {
    it('should create config with maxSpeed', () => {
        const config: AIPresetConfig = { maxSpeed: 10 };
        expect(config.maxSpeed).toBe(10);
    });

    it('should create config with maxForce', () => {
        const config: AIPresetConfig = { maxForce: 15 };
        expect(config.maxForce).toBe(15);
    });

    it('should create config with mass', () => {
        const config: AIPresetConfig = { mass: 2 };
        expect(config.mass).toBe(2);
    });
});

describe('AIPresetName type', () => {
    it('should accept guard', () => {
        const name: AIPresetName = 'guard';
        expect(name).toBe('guard');
    });

    it('should accept prey', () => {
        const name: AIPresetName = 'prey';
        expect(name).toBe('prey');
    });

    it('should accept predator', () => {
        const name: AIPresetName = 'predator';
        expect(name).toBe('predator');
    });

    it('should accept flockMember', () => {
        const name: AIPresetName = 'flockMember';
        expect(name).toBe('flockMember');
    });

    it('should accept follower', () => {
        const name: AIPresetName = 'follower';
        expect(name).toBe('follower');
    });
});
