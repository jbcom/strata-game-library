/**
 * AI Presets for YukaJS Integration
 *
 * Pre-configured AI behavior patterns for common game entities.
 */

import * as YUKA from 'yuka';

// =============================================================================
// TYPES
// =============================================================================

export interface AIPresetConfig {
    maxSpeed?: number;
    maxForce?: number;
    mass?: number;
}

export interface GuardPresetConfig extends AIPresetConfig {
    patrolWaypoints: Array<[number, number, number]>;
    detectionRadius?: number;
    chaseSpeed?: number;
    patrolSpeed?: number;
}

export interface PreyPresetConfig extends AIPresetConfig {
    wanderRadius?: number;
    fleeDistance?: number;
    fleeSpeed?: number;
}

export interface PredatorPresetConfig extends AIPresetConfig {
    patrolWaypoints?: Array<[number, number, number]>;
    pursuitSpeed?: number;
    detectionRadius?: number;
}

export interface FlockMemberPresetConfig extends AIPresetConfig {
    separationWeight?: number;
    alignmentWeight?: number;
    cohesionWeight?: number;
    neighborRadius?: number;
}

export interface FollowerPresetConfig extends AIPresetConfig {
    offset?: [number, number, number];
    followDistance?: number;
}

export interface AIPresetResult {
    vehicle: YUKA.Vehicle;
    behaviors: YUKA.SteeringBehavior[];
    stateMachine?: YUKA.StateMachine<YUKA.Vehicle>;
    update?: (delta: number, context?: Record<string, unknown>) => void;
}

// =============================================================================
// GUARD NPC PRESET
// Patrols waypoints, chases player on sight
// =============================================================================

export function createGuardPreset(config: GuardPresetConfig): AIPresetResult {
    const {
        patrolWaypoints,
        detectionRadius = 15,
        chaseSpeed = 8,
        patrolSpeed = 3,
        maxSpeed = 8,
        maxForce = 10,
        mass = 1,
    } = config;

    // Validate patrol waypoints
    if (!patrolWaypoints || patrolWaypoints.length === 0) {
        throw new Error('GuardPreset requires at least one patrol waypoint');
    }

    const vehicle = new YUKA.Vehicle();
    vehicle.maxSpeed = maxSpeed;
    vehicle.maxForce = maxForce;
    vehicle.mass = mass;

    const path = new YUKA.Path();
    path.loop = true;
    for (const [x, y, z] of patrolWaypoints) {
        path.add(new YUKA.Vector3(x, y, z));
    }

    const followPathBehavior = new YUKA.FollowPathBehavior(path);
    followPathBehavior.active = true;

    const seekBehavior = new YUKA.SeekBehavior();
    seekBehavior.active = false;

    const behaviors: YUKA.SteeringBehavior[] = [followPathBehavior, seekBehavior];
    vehicle.steering.add(followPathBehavior);
    vehicle.steering.add(seekBehavior);

    class PatrolState extends YUKA.State<YUKA.Vehicle> {
        enter(entity: YUKA.Vehicle): void {
            entity.maxSpeed = patrolSpeed;
            followPathBehavior.active = true;
            seekBehavior.active = false;
        }
        execute(): void {}
        exit(): void {}
    }

    class ChaseState extends YUKA.State<YUKA.Vehicle> {
        enter(entity: YUKA.Vehicle): void {
            entity.maxSpeed = chaseSpeed;
            followPathBehavior.active = false;
            seekBehavior.active = true;
        }
        execute(): void {}
        exit(): void {}
    }

    const stateMachine = new YUKA.StateMachine(vehicle);
    const patrolState = new PatrolState();
    const chaseState = new ChaseState();
    stateMachine.currentState = patrolState;

    const update = (_delta: number, context?: { playerPosition?: YUKA.Vector3 }) => {
        if (context?.playerPosition) {
            const distance = vehicle.position.distanceTo(context.playerPosition);

            if (distance < detectionRadius) {
                if (stateMachine.currentState !== chaseState) {
                    stateMachine.changeTo(chaseState);
                }
                seekBehavior.target = context.playerPosition;
            } else {
                if (stateMachine.currentState !== patrolState) {
                    stateMachine.changeTo(patrolState);
                }
            }
        }

        stateMachine.update();
    };

    return {
        vehicle,
        behaviors,
        stateMachine,
        update,
    };
}

// =============================================================================
// PREY ANIMAL PRESET
// Wanders around, flees from threats
// =============================================================================

export function createPreyPreset(config: PreyPresetConfig = {}): AIPresetResult {
    const {
        wanderRadius = 2,
        fleeDistance = 10,
        fleeSpeed = 10,
        maxSpeed = 6,
        maxForce = 8,
        mass = 1,
    } = config;

    const vehicle = new YUKA.Vehicle();
    vehicle.maxSpeed = maxSpeed;
    vehicle.maxForce = maxForce;
    vehicle.mass = mass;

    const wanderBehavior = new YUKA.WanderBehavior();
    wanderBehavior.radius = wanderRadius;
    wanderBehavior.distance = 5;
    wanderBehavior.jitter = 3;
    wanderBehavior.active = true;

    const fleeBehavior = new YUKA.FleeBehavior();
    fleeBehavior.panicDistance = fleeDistance;
    fleeBehavior.active = false;
    fleeBehavior.weight = 2;

    const behaviors: YUKA.SteeringBehavior[] = [wanderBehavior, fleeBehavior];
    vehicle.steering.add(wanderBehavior);
    vehicle.steering.add(fleeBehavior);

    class WanderState extends YUKA.State<YUKA.Vehicle> {
        enter(entity: YUKA.Vehicle): void {
            entity.maxSpeed = maxSpeed;
            wanderBehavior.active = true;
            fleeBehavior.active = false;
        }
        execute(): void {}
        exit(): void {}
    }

    class FleeState extends YUKA.State<YUKA.Vehicle> {
        enter(entity: YUKA.Vehicle): void {
            entity.maxSpeed = fleeSpeed;
            wanderBehavior.active = false;
            fleeBehavior.active = true;
        }
        execute(): void {}
        exit(): void {}
    }

    const stateMachine = new YUKA.StateMachine(vehicle);
    const wanderState = new WanderState();
    const fleeState = new FleeState();
    stateMachine.currentState = wanderState;

    const update = (_delta: number, context?: { threatPosition?: YUKA.Vector3 }) => {
        if (context?.threatPosition) {
            const distance = vehicle.position.distanceTo(context.threatPosition);

            if (distance < fleeDistance) {
                if (stateMachine.currentState !== fleeState) {
                    stateMachine.changeTo(fleeState);
                }
                fleeBehavior.target = context.threatPosition;
            } else {
                if (stateMachine.currentState !== wanderState) {
                    stateMachine.changeTo(wanderState);
                }
            }
        }

        stateMachine.update();
    };

    return {
        vehicle,
        behaviors,
        stateMachine,
        update,
    };
}

// =============================================================================
// PREDATOR PRESET
// Patrols area, pursues prey when spotted
// =============================================================================

export function createPredatorPreset(config: PredatorPresetConfig = {}): AIPresetResult {
    const {
        patrolWaypoints = [],
        pursuitSpeed = 12,
        detectionRadius = 20,
        maxSpeed = 12,
        maxForce = 15,
        mass = 2,
    } = config;

    const vehicle = new YUKA.Vehicle();
    vehicle.maxSpeed = maxSpeed;
    vehicle.maxForce = maxForce;
    vehicle.mass = mass;

    const wanderBehavior = new YUKA.WanderBehavior();
    wanderBehavior.radius = 3;
    wanderBehavior.distance = 8;
    wanderBehavior.jitter = 2;

    let followPathBehavior: YUKA.FollowPathBehavior | null = null;
    if (patrolWaypoints.length > 0) {
        const path = new YUKA.Path();
        path.loop = true;
        for (const [x, y, z] of patrolWaypoints) {
            path.add(new YUKA.Vector3(x, y, z));
        }
        followPathBehavior = new YUKA.FollowPathBehavior(path);
        followPathBehavior.active = true;
        wanderBehavior.active = false;
    } else {
        wanderBehavior.active = true;
    }

    const seekBehavior = new YUKA.SeekBehavior();
    seekBehavior.active = false;
    seekBehavior.weight = 2;

    const behaviors: YUKA.SteeringBehavior[] = [wanderBehavior, seekBehavior];
    vehicle.steering.add(wanderBehavior);
    vehicle.steering.add(seekBehavior);

    if (followPathBehavior) {
        behaviors.push(followPathBehavior);
        vehicle.steering.add(followPathBehavior);
    }

    class PatrolState extends YUKA.State<YUKA.Vehicle> {
        enter(entity: YUKA.Vehicle): void {
            entity.maxSpeed = maxSpeed * 0.5;
            seekBehavior.active = false;
            if (followPathBehavior) {
                followPathBehavior.active = true;
                wanderBehavior.active = false;
            } else {
                wanderBehavior.active = true;
            }
        }
        execute(): void {}
        exit(): void {}
    }

    class PursueState extends YUKA.State<YUKA.Vehicle> {
        enter(entity: YUKA.Vehicle): void {
            entity.maxSpeed = pursuitSpeed;
            wanderBehavior.active = false;
            if (followPathBehavior) {
                followPathBehavior.active = false;
            }
            seekBehavior.active = true;
        }
        execute(): void {}
        exit(): void {}
    }

    const stateMachine = new YUKA.StateMachine(vehicle);
    const patrolState = new PatrolState();
    const pursueState = new PursueState();
    stateMachine.currentState = patrolState;

    const update = (_delta: number, context?: { preyPosition?: YUKA.Vector3 }) => {
        if (context?.preyPosition) {
            const distance = vehicle.position.distanceTo(context.preyPosition);

            if (distance < detectionRadius) {
                if (stateMachine.currentState !== pursueState) {
                    stateMachine.changeTo(pursueState);
                }
                seekBehavior.target = context.preyPosition;
            } else {
                if (stateMachine.currentState !== patrolState) {
                    stateMachine.changeTo(patrolState);
                }
            }
        }

        stateMachine.update();
    };

    return {
        vehicle,
        behaviors,
        stateMachine,
        update,
    };
}

// =============================================================================
// FLOCK MEMBER PRESET
// Uses alignment + cohesion + separation for flocking behavior
// =============================================================================

export function createFlockMemberPreset(config: FlockMemberPresetConfig = {}): AIPresetResult {
    const {
        separationWeight = 1.5,
        alignmentWeight = 1.0,
        cohesionWeight = 1.0,
        neighborRadius = 10,
        maxSpeed = 5,
        maxForce = 8,
        mass = 1,
    } = config;

    const vehicle = new YUKA.Vehicle();
    vehicle.maxSpeed = maxSpeed;
    vehicle.maxForce = maxForce;
    vehicle.mass = mass;
    vehicle.updateNeighborhood = true;
    vehicle.neighborhoodRadius = neighborRadius;

    const separationBehavior = new YUKA.SeparationBehavior();
    separationBehavior.weight = separationWeight;

    const alignmentBehavior = new YUKA.AlignmentBehavior();
    alignmentBehavior.weight = alignmentWeight;

    const cohesionBehavior = new YUKA.CohesionBehavior();
    cohesionBehavior.weight = cohesionWeight;

    const wanderBehavior = new YUKA.WanderBehavior();
    wanderBehavior.weight = 0.5;
    wanderBehavior.radius = 1;
    wanderBehavior.distance = 3;
    wanderBehavior.jitter = 1;

    const behaviors: YUKA.SteeringBehavior[] = [
        separationBehavior,
        alignmentBehavior,
        cohesionBehavior,
        wanderBehavior,
    ];

    vehicle.steering.add(separationBehavior);
    vehicle.steering.add(alignmentBehavior);
    vehicle.steering.add(cohesionBehavior);
    vehicle.steering.add(wanderBehavior);

    return {
        vehicle,
        behaviors,
    };
}

// =============================================================================
// FOLLOWER PRESET
// Follows a leader at a specific offset
// =============================================================================

export function createFollowerPreset(config: FollowerPresetConfig = {}): AIPresetResult {
    const {
        offset = [-3, 0, -3],
        followDistance = 5,
        maxSpeed = 6,
        maxForce = 10,
        mass = 1,
    } = config;

    const vehicle = new YUKA.Vehicle();
    vehicle.maxSpeed = maxSpeed;
    vehicle.maxForce = maxForce;
    vehicle.mass = mass;

    const arriveBehavior = new YUKA.ArriveBehavior();
    // Use followDistance to influence deceleration and tolerance
    arriveBehavior.deceleration = Math.max(1, followDistance / 2);
    arriveBehavior.tolerance = followDistance * 0.1;

    const behaviors: YUKA.SteeringBehavior[] = [arriveBehavior];
    vehicle.steering.add(arriveBehavior);

    const offsetVector = new YUKA.Vector3(offset[0], offset[1], offset[2]);

    const update = (
        _delta: number,
        context?: { leaderPosition?: YUKA.Vector3; leaderRotation?: YUKA.Quaternion }
    ) => {
        if (context?.leaderPosition) {
            const targetPosition = context.leaderPosition.clone();

            if (context.leaderRotation) {
                const rotatedOffset = offsetVector.clone();
                rotatedOffset.applyRotation(context.leaderRotation);
                targetPosition.add(rotatedOffset);
            } else {
                targetPosition.add(offsetVector);
            }

            arriveBehavior.target = targetPosition;
        }
    };

    return {
        vehicle,
        behaviors,
        update,
    };
}

// =============================================================================
// UTILITY: Create flock
// =============================================================================

export interface FlockConfig extends FlockMemberPresetConfig {
    count: number;
    spawnArea?: { min: [number, number, number]; max: [number, number, number] };
}

export function createFlock(config: FlockConfig): AIPresetResult[] {
    const { count, spawnArea = { min: [-10, 0, -10], max: [10, 0, 10] }, ...memberConfig } = config;

    const members: AIPresetResult[] = [];

    for (let i = 0; i < count; i++) {
        const member = createFlockMemberPreset(memberConfig);

        member.vehicle.position.set(
            spawnArea.min[0] + Math.random() * (spawnArea.max[0] - spawnArea.min[0]),
            spawnArea.min[1] + Math.random() * (spawnArea.max[1] - spawnArea.min[1]),
            spawnArea.min[2] + Math.random() * (spawnArea.max[2] - spawnArea.min[2])
        );

        members.push(member);
    }

    return members;
}

// =============================================================================
// TYPES EXPORT
// =============================================================================

export type AIPresetName = 'guard' | 'prey' | 'predator' | 'flockMember' | 'follower';
