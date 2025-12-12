/**
 * Core Physics Utilities
 *
 * Pure TypeScript physics helper functions and type definitions
 * for use with @react-three/rapier.
 * @module core/physics
 */

import * as THREE from 'three';

/**
 * Core physics configuration options
 */
export interface PhysicsConfig {
    gravity: [number, number, number];
    timeStep: number;
    maxStabilizationIterations: number;
    maxVelocityIterations: number;
    maxVelocityFrictionIterations: number;
    erp: number;
    allowedLinearError: number;
    predictionDistance: number;
}

/**
 * Collision layer bitmask definitions
 */
export enum CollisionLayer {
    Default = 0x0001,
    Static = 0x0002,
    Dynamic = 0x0004,
    Character = 0x0008,
    Vehicle = 0x0010,
    Projectile = 0x0020,
    Trigger = 0x0040,
    Debris = 0x0080,
    Water = 0x0100,
    All = 0xffff,
}

/**
 * Collision filter presets
 */
export interface CollisionFilter {
    memberships: number;
    filter: number;
}

export const collisionFilters: Record<string, CollisionFilter> = {
    default: {
        memberships: CollisionLayer.Default,
        filter: CollisionLayer.All,
    },
    static: {
        memberships: CollisionLayer.Static,
        filter: CollisionLayer.All,
    },
    character: {
        memberships: CollisionLayer.Character,
        filter:
            CollisionLayer.Static |
            CollisionLayer.Dynamic |
            CollisionLayer.Trigger |
            CollisionLayer.Water,
    },
    vehicle: {
        memberships: CollisionLayer.Vehicle,
        filter: CollisionLayer.Static | CollisionLayer.Dynamic | CollisionLayer.Character,
    },
    projectile: {
        memberships: CollisionLayer.Projectile,
        filter:
            CollisionLayer.Static |
            CollisionLayer.Dynamic |
            CollisionLayer.Character |
            CollisionLayer.Vehicle,
    },
    debris: {
        memberships: CollisionLayer.Debris,
        filter: CollisionLayer.Static | CollisionLayer.Dynamic,
    },
    trigger: {
        memberships: CollisionLayer.Trigger,
        filter: CollisionLayer.Character | CollisionLayer.Vehicle,
    },
    water: {
        memberships: CollisionLayer.Water,
        filter:
            CollisionLayer.Character |
            CollisionLayer.Dynamic |
            CollisionLayer.Vehicle |
            CollisionLayer.Debris,
    },
};

/**
 * Character controller configuration
 */
export interface CharacterControllerConfig {
    capsuleRadius: number;
    capsuleHeight: number;
    mass: number;
    maxSpeed: number;
    acceleration: number;
    deceleration: number;
    jumpForce: number;
    maxJumps: number;
    groundCheckDistance: number;
    slopeLimit: number;
    stepHeight: number;
    coyoteTime: number;
    jumpBufferTime: number;
    airControl: number;
    gravityScale: number;
    snapToGroundDistance: number;
    skinWidth: number;
    autoStepEnabled: boolean;
    slideEnabled: boolean;
}

/**
 * Vehicle physics configuration
 */
export interface VehicleConfig {
    chassisMass: number;
    chassisSize: [number, number, number];
    wheelRadius: number;
    wheelWidth: number;
    wheelPositions: [number, number, number][];
    suspensionRestLength: number;
    suspensionStiffness: number;
    suspensionDamping: number;
    suspensionTravel: number;
    maxSteerAngle: number;
    driveWheels: 'front' | 'rear' | 'all';
    motorForce: number;
    brakeForce: number;
    frictionSlip: number;
    rollInfluence: number;
    antiRoll: number;
    centerOfMassOffset: [number, number, number];
}

/**
 * Wheel configuration for vehicles
 */
export interface WheelConfig {
    position: [number, number, number];
    radius: number;
    suspensionRestLength: number;
    suspensionStiffness: number;
    suspensionDamping: number;
    maxSuspensionForce: number;
    frictionSlip: number;
    isSteering: boolean;
    isDriving: boolean;
    isBraking: boolean;
}

/**
 * Ragdoll joint configuration
 */
export interface RagdollJointConfig {
    parent: string;
    child: string;
    type: 'spherical' | 'revolute' | 'prismatic' | 'fixed';
    anchor1: [number, number, number];
    anchor2: [number, number, number];
    axis?: [number, number, number];
    limits?: {
        min: number;
        max: number;
    };
    twistLimits?: {
        min: number;
        max: number;
    };
}

/**
 * Ragdoll body part configuration
 */
export interface RagdollBodyPart {
    name: string;
    type: 'capsule' | 'box' | 'sphere';
    size: [number, number, number] | [number, number] | [number];
    position: [number, number, number];
    rotation?: [number, number, number];
    mass: number;
}

/**
 * Complete ragdoll configuration
 */
export interface RagdollConfig {
    bodyParts: RagdollBodyPart[];
    joints: RagdollJointConfig[];
    linearDamping: number;
    angularDamping: number;
    enableSelfCollision: boolean;
    sleepThreshold: number;
}

/**
 * Physics material properties
 */
export interface PhysicsMaterial {
    friction: number;
    restitution: number;
    frictionCombine?: 'average' | 'min' | 'max' | 'multiply';
    restitutionCombine?: 'average' | 'min' | 'max' | 'multiply';
    density?: number;
}

/**
 * Destructible object configuration
 */
export interface DestructibleConfig {
    health: number;
    breakForce: number;
    shardCount: number;
    shardScale: [number, number, number];
    explosionForce: number;
    explosionRadius: number;
    shardLifetime: number;
    shardMass: number;
    shardAngularVelocity: [number, number, number];
}

/**
 * Buoyancy configuration for floating objects
 */
export interface BuoyancyConfig {
    waterLevel: number;
    buoyancyForce: number;
    waterDrag: number;
    waterAngularDrag: number;
    voxelResolution: number;
    samplePointCount: number;
    dynamicWater: boolean;
}

/**
 * Calculate an impulse to apply based on desired velocity change
 * @param currentVelocity - Current velocity vector
 * @param targetVelocity - Target velocity vector
 * @param mass - Object mass
 * @returns Impulse vector to apply
 */
export function calculateImpulse(
    currentVelocity: THREE.Vector3,
    targetVelocity: THREE.Vector3,
    mass: number
): THREE.Vector3 {
    const deltaV = targetVelocity.clone().sub(currentVelocity);
    return deltaV.multiplyScalar(mass);
}

/**
 * Calculate continuous force to achieve target velocity
 * @param currentVelocity - Current velocity
 * @param targetVelocity - Target velocity
 * @param mass - Object mass
 * @param deltaTime - Time step
 * @returns Force vector to apply
 */
export function calculateForce(
    currentVelocity: THREE.Vector3,
    targetVelocity: THREE.Vector3,
    mass: number,
    deltaTime: number
): THREE.Vector3 {
    const impulse = calculateImpulse(currentVelocity, targetVelocity, mass);
    return impulse.divideScalar(deltaTime);
}

/**
 * Calculate jump impulse for character controllers
 * @param jumpHeight - Desired jump height
 * @param gravity - Gravity magnitude
 * @param mass - Character mass
 * @returns Upward impulse magnitude
 */
export function calculateJumpImpulse(jumpHeight: number, gravity: number, mass: number): number {
    return Math.sqrt(2 * Math.abs(gravity) * jumpHeight) * mass;
}

/**
 * Calculate landing velocity from fall height
 * @param fallHeight - Height of the fall
 * @param gravity - Gravity magnitude
 * @returns Landing velocity magnitude
 */
export function calculateLandingVelocity(fallHeight: number, gravity: number): number {
    return Math.sqrt(2 * Math.abs(gravity) * fallHeight);
}

/**
 * Apply drag force to velocity
 * @param velocity - Current velocity
 * @param dragCoefficient - Drag coefficient
 * @param deltaTime - Time step
 * @returns New velocity after drag
 */
export function applyDrag(
    velocity: THREE.Vector3,
    dragCoefficient: number,
    deltaTime: number
): THREE.Vector3 {
    const dragFactor = 1 - dragCoefficient * deltaTime;
    return velocity.clone().multiplyScalar(Math.max(0, dragFactor));
}

/**
 * Calculate buoyancy force for a submerged point
 * @param depth - Depth below water surface (positive = submerged)
 * @param buoyancyStrength - Strength multiplier
 * @param mass - Object mass
 * @returns Upward buoyancy force magnitude
 */
export function calculateBuoyancyForce(
    depth: number,
    buoyancyStrength: number,
    mass: number
): number {
    if (depth <= 0) return 0;
    return depth * buoyancyStrength * mass;
}

/**
 * Calculate slope angle from surface normal
 * @param normal - Surface normal vector
 * @returns Slope angle in radians
 */
export function calculateSlopeAngle(normal: THREE.Vector3): number {
    const up = new THREE.Vector3(0, 1, 0);
    return Math.acos(Math.min(1, Math.max(-1, normal.dot(up))));
}

/**
 * Check if slope is walkable
 * @param normal - Surface normal vector
 * @param maxSlopeAngle - Maximum walkable slope angle in radians
 * @returns Whether the slope can be walked on
 */
export function isWalkableSlope(normal: THREE.Vector3, maxSlopeAngle: number): boolean {
    return calculateSlopeAngle(normal) <= maxSlopeAngle;
}

/**
 * Project velocity onto ground plane
 * @param velocity - Input velocity
 * @param groundNormal - Ground surface normal
 * @returns Velocity projected onto ground plane
 */
export function projectVelocityOntoGround(
    velocity: THREE.Vector3,
    groundNormal: THREE.Vector3
): THREE.Vector3 {
    const dot = velocity.dot(groundNormal);
    return velocity.clone().sub(groundNormal.clone().multiplyScalar(dot));
}

/**
 * Calculate steering force for vehicle physics
 * @param currentDirection - Current forward direction
 * @param targetDirection - Target direction
 * @param maxSteerAngle - Maximum steering angle
 * @returns Steering angle to apply
 */
export function calculateSteeringAngle(
    currentDirection: THREE.Vector3,
    targetDirection: THREE.Vector3,
    maxSteerAngle: number
): number {
    const cross = new THREE.Vector3().crossVectors(currentDirection, targetDirection);
    const angle = Math.atan2(cross.y, currentDirection.dot(targetDirection));
    return Math.max(-maxSteerAngle, Math.min(maxSteerAngle, angle));
}

/**
 * Calculate suspension force using spring-damper model
 * @param compression - Current suspension compression (0-1)
 * @param velocity - Vertical velocity
 * @param stiffness - Spring stiffness
 * @param damping - Damping coefficient
 * @returns Suspension force magnitude
 */
export function calculateSuspensionForce(
    compression: number,
    velocity: number,
    stiffness: number,
    damping: number
): number {
    const springForce = compression * stiffness;
    const damperForce = -velocity * damping;
    return springForce + damperForce;
}

/**
 * Calculate explosion impulse falloff
 * @param distance - Distance from explosion center
 * @param explosionRadius - Explosion radius
 * @param maxForce - Maximum force at center
 * @returns Force at given distance
 */
export function calculateExplosionForce(
    distance: number,
    explosionRadius: number,
    maxForce: number
): number {
    if (distance >= explosionRadius) return 0;
    const falloff = 1 - distance / explosionRadius;
    return maxForce * falloff * falloff;
}

/**
 * Generate random debris velocity for destructible objects
 * @param explosionCenter - Center of explosion
 * @param debrisPosition - Position of debris piece
 * @param baseForce - Base explosion force
 * @param randomness - Randomness factor (0-1)
 * @returns Velocity vector for debris
 */
export function generateDebrisVelocity(
    explosionCenter: THREE.Vector3,
    debrisPosition: THREE.Vector3,
    baseForce: number,
    randomness: number = 0.3
): THREE.Vector3 {
    const direction = debrisPosition.clone().sub(explosionCenter).normalize();
    const force = baseForce * (1 + (Math.random() - 0.5) * randomness);

    direction.x += (Math.random() - 0.5) * randomness;
    direction.y += Math.random() * randomness * 0.5;
    direction.z += (Math.random() - 0.5) * randomness;

    return direction.normalize().multiplyScalar(force);
}

/**
 * Create default physics configuration
 * @returns Default physics config
 */
export function createDefaultPhysicsConfig(): PhysicsConfig {
    return {
        gravity: [0, -9.81, 0],
        timeStep: 1 / 60,
        maxStabilizationIterations: 1,
        maxVelocityIterations: 4,
        maxVelocityFrictionIterations: 8,
        erp: 0.8,
        allowedLinearError: 0.001,
        predictionDistance: 0.002,
    };
}

/**
 * Create default character controller configuration
 * @returns Default character controller config
 */
export function createDefaultCharacterConfig(): CharacterControllerConfig {
    return {
        capsuleRadius: 0.3,
        capsuleHeight: 1.8,
        mass: 80,
        maxSpeed: 6,
        acceleration: 30,
        deceleration: 20,
        jumpForce: 8,
        maxJumps: 1,
        groundCheckDistance: 0.1,
        slopeLimit: Math.PI / 4,
        stepHeight: 0.35,
        coyoteTime: 0.15,
        jumpBufferTime: 0.1,
        airControl: 0.3,
        gravityScale: 2,
        snapToGroundDistance: 0.3,
        skinWidth: 0.02,
        autoStepEnabled: true,
        slideEnabled: true,
    };
}

/**
 * Create default vehicle configuration
 * @returns Default vehicle config
 */
export function createDefaultVehicleConfig(): VehicleConfig {
    return {
        chassisMass: 1500,
        chassisSize: [2, 0.8, 4.5],
        wheelRadius: 0.35,
        wheelWidth: 0.25,
        wheelPositions: [
            [-0.85, -0.3, 1.4],
            [0.85, -0.3, 1.4],
            [-0.85, -0.3, -1.3],
            [0.85, -0.3, -1.3],
        ],
        suspensionRestLength: 0.3,
        suspensionStiffness: 30,
        suspensionDamping: 4.5,
        suspensionTravel: 0.25,
        maxSteerAngle: Math.PI / 6,
        driveWheels: 'rear',
        motorForce: 8000,
        brakeForce: 5000,
        frictionSlip: 2,
        rollInfluence: 0.1,
        antiRoll: 0.5,
        centerOfMassOffset: [0, -0.3, 0],
    };
}

/**
 * Create a humanoid ragdoll configuration
 * @param scale - Scale factor for the ragdoll
 * @returns Ragdoll configuration
 */
export function createHumanoidRagdoll(scale: number = 1): RagdollConfig {
    const s = scale;

    return {
        bodyParts: [
            {
                name: 'pelvis',
                type: 'box',
                size: [0.25 * s, 0.2 * s, 0.15 * s],
                position: [0, 1 * s, 0],
                mass: 10,
            },
            {
                name: 'torso',
                type: 'box',
                size: [0.25 * s, 0.3 * s, 0.12 * s],
                position: [0, 1.35 * s, 0],
                mass: 15,
            },
            {
                name: 'chest',
                type: 'box',
                size: [0.28 * s, 0.25 * s, 0.14 * s],
                position: [0, 1.65 * s, 0],
                mass: 15,
            },
            { name: 'head', type: 'sphere', size: [0.12 * s], position: [0, 1.95 * s, 0], mass: 5 },
            {
                name: 'upperArmL',
                type: 'capsule',
                size: [0.05 * s, 0.25 * s],
                position: [-0.35 * s, 1.6 * s, 0],
                rotation: [0, 0, Math.PI / 2],
                mass: 3,
            },
            {
                name: 'upperArmR',
                type: 'capsule',
                size: [0.05 * s, 0.25 * s],
                position: [0.35 * s, 1.6 * s, 0],
                rotation: [0, 0, -Math.PI / 2],
                mass: 3,
            },
            {
                name: 'forearmL',
                type: 'capsule',
                size: [0.04 * s, 0.23 * s],
                position: [-0.6 * s, 1.6 * s, 0],
                rotation: [0, 0, Math.PI / 2],
                mass: 2,
            },
            {
                name: 'forearmR',
                type: 'capsule',
                size: [0.04 * s, 0.23 * s],
                position: [0.6 * s, 1.6 * s, 0],
                rotation: [0, 0, -Math.PI / 2],
                mass: 2,
            },
            {
                name: 'thighL',
                type: 'capsule',
                size: [0.07 * s, 0.35 * s],
                position: [-0.1 * s, 0.65 * s, 0],
                mass: 6,
            },
            {
                name: 'thighR',
                type: 'capsule',
                size: [0.07 * s, 0.35 * s],
                position: [0.1 * s, 0.65 * s, 0],
                mass: 6,
            },
            {
                name: 'calfL',
                type: 'capsule',
                size: [0.05 * s, 0.35 * s],
                position: [-0.1 * s, 0.25 * s, 0],
                mass: 4,
            },
            {
                name: 'calfR',
                type: 'capsule',
                size: [0.05 * s, 0.35 * s],
                position: [0.1 * s, 0.25 * s, 0],
                mass: 4,
            },
        ],
        joints: [
            {
                parent: 'pelvis',
                child: 'torso',
                type: 'spherical',
                anchor1: [0, 0.1 * s, 0],
                anchor2: [0, -0.15 * s, 0],
                limits: { min: -0.3, max: 0.3 },
            },
            {
                parent: 'torso',
                child: 'chest',
                type: 'spherical',
                anchor1: [0, 0.15 * s, 0],
                anchor2: [0, -0.125 * s, 0],
                limits: { min: -0.3, max: 0.3 },
            },
            {
                parent: 'chest',
                child: 'head',
                type: 'spherical',
                anchor1: [0, 0.125 * s, 0],
                anchor2: [0, -0.1 * s, 0],
                limits: { min: -0.5, max: 0.5 },
            },
            {
                parent: 'chest',
                child: 'upperArmL',
                type: 'spherical',
                anchor1: [-0.18 * s, 0.08 * s, 0],
                anchor2: [0.125 * s, 0, 0],
                limits: { min: -1.5, max: 1.5 },
            },
            {
                parent: 'chest',
                child: 'upperArmR',
                type: 'spherical',
                anchor1: [0.18 * s, 0.08 * s, 0],
                anchor2: [-0.125 * s, 0, 0],
                limits: { min: -1.5, max: 1.5 },
            },
            {
                parent: 'upperArmL',
                child: 'forearmL',
                type: 'revolute',
                anchor1: [-0.125 * s, 0, 0],
                anchor2: [0.115 * s, 0, 0],
                axis: [0, 1, 0],
                limits: { min: 0, max: 2.5 },
            },
            {
                parent: 'upperArmR',
                child: 'forearmR',
                type: 'revolute',
                anchor1: [0.125 * s, 0, 0],
                anchor2: [-0.115 * s, 0, 0],
                axis: [0, 1, 0],
                limits: { min: -2.5, max: 0 },
            },
            {
                parent: 'pelvis',
                child: 'thighL',
                type: 'spherical',
                anchor1: [-0.1 * s, -0.1 * s, 0],
                anchor2: [0, 0.175 * s, 0],
                limits: { min: -1.2, max: 1.2 },
            },
            {
                parent: 'pelvis',
                child: 'thighR',
                type: 'spherical',
                anchor1: [0.1 * s, -0.1 * s, 0],
                anchor2: [0, 0.175 * s, 0],
                limits: { min: -1.2, max: 1.2 },
            },
            {
                parent: 'thighL',
                child: 'calfL',
                type: 'revolute',
                anchor1: [0, -0.175 * s, 0],
                anchor2: [0, 0.175 * s, 0],
                axis: [1, 0, 0],
                limits: { min: -2.5, max: 0 },
            },
            {
                parent: 'thighR',
                child: 'calfR',
                type: 'revolute',
                anchor1: [0, -0.175 * s, 0],
                anchor2: [0, 0.175 * s, 0],
                axis: [1, 0, 0],
                limits: { min: -2.5, max: 0 },
            },
        ],
        linearDamping: 0.4,
        angularDamping: 0.8,
        enableSelfCollision: false,
        sleepThreshold: 0.2,
    };
}

/**
 * Create default destructible configuration
 * @returns Default destructible config
 */
export function createDefaultDestructibleConfig(): DestructibleConfig {
    return {
        health: 100,
        breakForce: 50,
        shardCount: 8,
        shardScale: [0.3, 0.3, 0.3],
        explosionForce: 5,
        explosionRadius: 2,
        shardLifetime: 3,
        shardMass: 0.5,
        shardAngularVelocity: [5, 5, 5],
    };
}

/**
 * Create default buoyancy configuration
 * @returns Default buoyancy config
 */
export function createDefaultBuoyancyConfig(): BuoyancyConfig {
    return {
        waterLevel: 0,
        buoyancyForce: 15,
        waterDrag: 3,
        waterAngularDrag: 2,
        voxelResolution: 0.5,
        samplePointCount: 8,
        dynamicWater: false,
    };
}
