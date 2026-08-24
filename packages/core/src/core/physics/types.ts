/**
 * Physics configuration types.
 *
 * Declarative, renderer-agnostic shapes describing how a physics world, character
 * controller, vehicle, ragdoll, destructible, or buoyant body should be configured.
 * This module is pure data description — it holds no logic and imports nothing,
 * so consumers can depend on the vocabulary without pulling in three.js.
 *
 * @packageDocumentation
 * @module core/physics/types
 * @category Entities & Simulation
 */

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
