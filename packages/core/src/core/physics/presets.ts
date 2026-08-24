/**
 * Default physics configuration factories.
 *
 * Tuned starting points for each configurable subsystem, plus the humanoid ragdoll
 * skeleton table — a scalable rig of body parts and joint constraints. Every factory
 * returns a fresh object so callers can mutate the result freely.
 *
 * Pure data construction: no three.js, no simulation state.
 *
 * @packageDocumentation
 * @module core/physics/presets
 * @category Entities & Simulation
 */

import type {
  BuoyancyConfig,
  CharacterControllerConfig,
  DestructibleConfig,
  PhysicsConfig,
  RagdollConfig,
  VehicleConfig,
} from './types';

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
