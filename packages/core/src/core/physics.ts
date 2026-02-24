/**
 * Core Physics Utilities - Realistic Physical Simulation Foundation.
 *
 * Provides pure TypeScript helper functions, mathematical calculations, and
 * configuration types for character controllers, vehicle physics, ragdolls, buoyancy,
 * and destructible objects. Build believable physical interactions with collision
 * detection, forces, impulses, and joint constraints. Designed for use with `@react-three/rapier`.
 *
 * **Features:**
 * - Character controller with ground detection, slope limits, and jump mechanics
 * - Vehicle dynamics with suspension, steering, and motor forces
 * - Ragdoll articulation with spherical and revolute joints
 * - Buoyancy simulation with multi-point sampling and water drag
 * - Destructible objects with health and debris generation
 * - Collision layer system with bitmask filtering
 * - Physical material properties (friction, restitution, density)
 *
 * **Interactive Demos:**
 * - 🎮 [Physics Playground](http://jonbogaty.com/nodejs-strata/demos/physics.html)
 * - 🚗 [Vehicle Demo](http://jonbogaty.com/nodejs-strata/demos/vehicle.html)
 * - 🏃 [Character Controller](http://jonbogaty.com/nodejs-strata/demos/character.html)
 *
 * **API Documentation:**
 * - [Full API Reference](http://jonbogaty.com/nodejs-strata/api)
 * - [Examples → API Mapping](https://github.com/jbcom/nodejs-strata/blob/main/EXAMPLES_API_MAP.md#physics)
 *
 * @packageDocumentation
 * @module core/physics
 * @category Entities & Simulation
 */

import * as THREE from 'three';

/**
 * Core physics simulation configuration.
 * Controls global physics world parameters for accurate and stable simulation.
 *
 * @category Entities & Simulation
 */
export interface PhysicsConfig {
  /** Global gravity vector [x, y, z] in m/s². Default: [0, -9.81, 0]. */
  gravity: [number, number, number];
  /** Simulation time step in seconds. Smaller values = more accurate but slower. Default: 1/60. */
  timeStep: number;
  /** Iterations for stabilization constraints. Higher = more stable joints. Default: 4. */
  maxStabilizationIterations: number;
  /** Iterations for velocity resolution. Higher = better penetration correction. Default: 1. */
  maxVelocityIterations: number;
  /** Iterations for velocity friction resolution. Higher = more realistic friction. Default: 8. */
  maxVelocityFrictionIterations: number;
  /** Error reduction parameter (0-1). Controls how fast constraint violations are corrected. Default: 0.8. */
  erp: number;
  /** Allowed linear error in meters before correction kicks in. Default: 0.001. */
  allowedLinearError: number;
  /** Distance in meters for speculative contact prediction. Prevents tunneling. Default: 0.002. */
  predictionDistance: number;
}

/**
 * Collision layer bitmask definitions for physics interaction filtering.
 * Allows selective collision between different object types for performance and gameplay.
 *
 * @category Entities & Simulation
 * @example
 * ```ts
 * // Character only collides with static, dynamic, trigger, and water
 * const characterFilter = {
 *   memberships: CollisionLayer.Character,
 *   filter: CollisionLayer.Static | CollisionLayer.Dynamic | CollisionLayer.Trigger | CollisionLayer.Water
 * };
 * ```
 */
export enum CollisionLayer {
  /** Default layer for uncategorized objects. */
  Default = 0x0001,
  /** Static environment geometry (walls, floors). */
  Static = 0x0002,
  /** Dynamic physics objects (crates, props). */
  Dynamic = 0x0004,
  /** Player-controlled character bodies. */
  Character = 0x0008,
  /** Vehicle chassis and wheels. */
  Vehicle = 0x0010,
  /** Fast-moving projectiles (bullets, arrows). */
  Projectile = 0x0020,
  /** Sensor volumes for event triggering. */
  Trigger = 0x0040,
  /** Small destructible fragments. */
  Debris = 0x0080,
  /** Fluid volumes for buoyancy simulation. */
  Water = 0x0100,
  /** All layers combined (collide with everything). */
  All = 0xffff,
}

/**
 * Collision filter configuration for selective physics interactions.
 * Determines which collision layers an object belongs to and which layers it can collide with.
 *
 * @category Entities & Simulation
 * @example
 * ```ts
 * // Projectile that hits characters and vehicles but not other projectiles
 * const projectileFilter: CollisionFilter = {
 *   memberships: CollisionLayer.Projectile,
 *   filter: CollisionLayer.Static | CollisionLayer.Character | CollisionLayer.Vehicle
 * };
 * ```
 */
export interface CollisionFilter {
  /** The collision layer(s) this object belongs to (bitmask). */
  memberships: number;
  /** The collision layer(s) this object should interact with (bitmask). */
  filter: number;
}

/**
 * Predefined collision filter presets for common object types.
 * @category Entities & Simulation
 */
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
 * Advanced character controller configuration for responsive player movement.
 * Fine-tune walking, jumping, ground detection, and slope behavior for FPS, third-person, or platformer games.
 *
 * @category Entities & Simulation
 * @example
 * ```ts
 * const fpsConfig: CharacterControllerConfig = {
 *   capsuleRadius: 0.25,
 *   capsuleHeight: 1.6,
 *   maxSpeed: 7,
 *   jumpForce: 7,
 *   coyoteTime: 0.1,
 *   // ...other properties
 * };
 * ```
 */
export interface CharacterControllerConfig {
  /** Horizontal radius of the capsule collider in meters. Affects width of character. */
  capsuleRadius: number;
  /** Total height of the capsule collider in meters. Affects standing height. */
  capsuleHeight: number;
  /** Mass of the character in kilograms. Affects momentum and impact forces. */
  mass: number;
  /** Maximum walking speed in meters per second. */
  maxSpeed: number;
  /** Rate of acceleration in m/s². Higher = snappier movement. */
  acceleration: number;
  /** Rate of deceleration in m/s². Higher = faster stopping. */
  deceleration: number;
  /** Vertical impulse applied on jump in Newtons. Higher = higher jump. */
  jumpForce: number;
  /** Maximum number of consecutive jumps (multi-jump). 1 = single jump only. */
  maxJumps: number;
  /** Raycast distance in meters for ground detection. Should be slightly larger than skin width. */
  groundCheckDistance: number;
  /** Maximum walkable slope angle in radians. Steeper slopes cause sliding. Default: PI/4 (45°). */
  slopeLimit: number;
  /** Maximum height in meters of a step the character can automatically climb. */
  stepHeight: number;
  /** "Coyote time" in seconds after leaving ground edge that a jump is still allowed. Improves feel. */
  coyoteTime: number;
  /** "Jump buffer time" in seconds to remember a jump input before landing. Improves responsiveness. */
  jumpBufferTime: number;
  /** Multiplier (0-1) for movement control while airborne. 0 = no air control, 1 = full control. */
  airControl: number;
  /** Local gravity multiplier. >1 = faster falling, <1 = floaty, moon-like. */
  gravityScale: number;
  /** Distance in meters to snap character down to ground for stable slope walking. */
  snapToGroundDistance: number;
  /** Collision skin width in meters. Small buffer to prevent clipping into walls. */
  skinWidth: number;
  /** Whether to automatically climb steps up to stepHeight. */
  autoStepEnabled: boolean;
  /** Whether to slide down slopes steeper than slopeLimit. */
  slideEnabled: boolean;
}

/**
 * Vehicle physics configuration for arcade-style or realistic driving.
 * Controls chassis, wheels, suspension, steering, and motor behavior.
 *
 * @category Entities & Simulation
 * @example
 * ```ts
 * const racingCarConfig: VehicleConfig = {
 *   chassisMass: 1200,
 *   wheelRadius: 0.35,
 *   motorForce: 2500,
 *   maxSteerAngle: Math.PI / 6,
 *   driveWheels: 'rear',
 *   // ...other properties
 * };
 * ```
 */
export interface VehicleConfig {
  /** Mass of the vehicle chassis in kilograms. Affects acceleration and handling. */
  chassisMass: number;
  /** Dimensions of the chassis [width, height, length] in meters. */
  chassisSize: [number, number, number];
  /** Radius of the wheels in meters. Affects top speed and acceleration. */
  wheelRadius: number;
  /** Width/thickness of the wheels in meters. Visual only. */
  wheelWidth: number;
  /** Local positions [x, y, z] of each wheel relative to chassis center. */
  wheelPositions: [number, number, number][];
  /** Target resting length of the suspension springs in meters. */
  suspensionRestLength: number;
  /** Stiffness multiplier for suspension springs. Higher = stiffer, bouncier. */
  suspensionStiffness: number;
  /** Damping multiplier for suspension. Higher = less oscillation. */
  suspensionDamping: number;
  /** Maximum compression/extension travel distance for suspension in meters. */
  suspensionTravel: number;
  /** Maximum steering angle in radians for front wheels. Affects turning radius. */
  maxSteerAngle: number;
  /** Which wheels receive motor torque. 'front' = FWD, 'rear' = RWD, 'all' = AWD. */
  driveWheels: 'front' | 'rear' | 'all';
  /** Strength of the motor force in Newtons. Higher = faster acceleration. */
  motorForce: number;
  /** Strength of the braking force in Newtons. Higher = shorter braking distance. */
  brakeForce: number;
  /** Friction coefficient for tire grip (0-1). Higher = better traction. */
  frictionSlip: number;
  /** Impact of lateral forces on chassis roll (0-1). Lower = less body roll. */
  rollInfluence: number;
  /** Stabilizer bar strength to reduce body roll in turns. */
  antiRoll: number;
  /** Vertical offset [x, y, z] for the physical center of mass. Lower = more stable. */
  centerOfMassOffset: [number, number, number];
}

/**
 * Configuration for an individual vehicle wheel.
 * @category Entities & Simulation
 */
export interface WheelConfig {
  /** Local position relative to chassis. */
  position: [number, number, number];
  /** Wheel radius. */
  radius: number;
  /** Spring rest length. */
  suspensionRestLength: number;
  /** Spring stiffness. */
  suspensionStiffness: number;
  /** Spring damping. */
  suspensionDamping: number;
  /** Force limit for the suspension. */
  maxSuspensionForce: number;
  /** Grip friction. */
  frictionSlip: number;
  /** Whether this wheel turns with steering. */
  isSteering: boolean;
  /** Whether this wheel receives motor torque. */
  isDriving: boolean;
  /** Whether this wheel provides braking force. */
  isBraking: boolean;
}

/**
 * Ragdoll joint connection configuration.
 * @category Entities & Simulation
 */
export interface RagdollJointConfig {
  /** Name of the parent body part. */
  parent: string;
  /** Name of the child body part. */
  child: string;
  /** Type of physical constraint. */
  type: 'spherical' | 'revolute' | 'prismatic' | 'fixed';
  /** Pivot point relative to parent. */
  anchor1: [number, number, number];
  /** Pivot point relative to child. */
  anchor2: [number, number, number];
  /** Rotation axis for revolute/prismatic joints. */
  axis?: [number, number, number];
  /** Angular or linear limits. */
  limits?: {
    min: number;
    max: number;
  };
  /** Optional secondary twist limits for spherical joints. */
  twistLimits?: {
    min: number;
    max: number;
  };
}

/**
 * Configuration for a single ragdoll body segment.
 * @category Entities & Simulation
 */
export interface RagdollBodyPart {
  /** Unique part name (e.g., 'head', 'torso'). */
  name: string;
  /** Geometric primitive type. */
  type: 'capsule' | 'box' | 'sphere';
  /** Dimensions based on type. */
  size: [number, number, number] | [number, number] | [number];
  /** Local position relative to ragdoll root. */
  position: [number, number, number];
  /** Local rotation in radians. */
  rotation?: [number, number, number];
  /** Mass of this specific part. */
  mass: number;
}

/**
 * Complete ragdoll system configuration.
 * @category Entities & Simulation
 */
export interface RagdollConfig {
  /** List of body segments. */
  bodyParts: RagdollBodyPart[];
  /** List of joint constraints. */
  joints: RagdollJointConfig[];
  /** Global linear resistance. */
  linearDamping: number;
  /** Global angular resistance. */
  angularDamping: number;
  /** Whether parts can collide with each other. */
  enableSelfCollision: boolean;
  /** Energy threshold for physics sleeping. */
  sleepThreshold: number;
}

/**
 * Physical surface material properties.
 * @category Entities & Simulation
 */
export interface PhysicsMaterial {
  /** Sliding resistance (0-1). */
  friction: number;
  /** Bounciness (0-1). */
  restitution: number;
  /** Algorithm for combining friction with other surfaces. */
  frictionCombine?: 'average' | 'min' | 'max' | 'multiply';
  /** Algorithm for combining restitution with other surfaces. */
  restitutionCombine?: 'average' | 'min' | 'max' | 'multiply';
  /** Mass per unit volume. */
  density?: number;
}

/**
 * Destructible object behavior configuration.
 * @category Entities & Simulation
 */
export interface DestructibleConfig {
  /** Initial health points. */
  health: number;
  /** Threshold force required to trigger break. */
  breakForce: number;
  /** Number of debris shards to spawn. */
  shardCount: number;
  /** Scale multiplier for debris shards. */
  shardScale: [number, number, number];
  /** Impulse force applied to shards on break. */
  explosionForce: number;
  /** Radius of the break impulse effect. */
  explosionRadius: number;
  /** Time in seconds before shards are removed. */
  shardLifetime: number;
  /** Mass of an individual shard. */
  shardMass: number;
  /** Initial spin given to shards. */
  shardAngularVelocity: [number, number, number];
}

/**
 * Buoyancy simulation configuration.
 * @category Entities & Simulation
 */
export interface BuoyancyConfig {
  /** World Y-coordinate of the water surface. */
  waterLevel: number;
  /** Upward force multiplier per submerged unit. */
  buoyancyForce: number;
  /** Linear resistance from water. */
  waterDrag: number;
  /** Angular resistance from water. */
  waterAngularDrag: number;
  /** Resolution for physical volume sampling. */
  voxelResolution: number;
  /** Number of points to sample for force application. */
  samplePointCount: number;
  /** Whether the water level is dynamic. */
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
