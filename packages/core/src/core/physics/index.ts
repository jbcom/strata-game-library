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
 * - [Examples → API Mapping](https://github.com/jbcom/strata-game-library/blob/main/EXAMPLES_API_MAP.md#physics)
 *
 * @packageDocumentation
 * @module core/physics
 * @category Entities & Simulation
 */

export type { CollisionFilter } from './collision';
export {
  CollisionLayer,
  collisionFilters,
} from './collision';
export {
  applyDrag,
  calculateBuoyancyForce,
  calculateExplosionForce,
  calculateForce,
  calculateImpulse,
  calculateJumpImpulse,
  calculateLandingVelocity,
  calculateSlopeAngle,
  calculateSteeringAngle,
  calculateSuspensionForce,
  generateDebrisVelocity,
  isWalkableSlope,
  projectVelocityOntoGround,
} from './forces';
export {
  createDefaultBuoyancyConfig,
  createDefaultCharacterConfig,
  createDefaultDestructibleConfig,
  createDefaultPhysicsConfig,
  createDefaultVehicleConfig,
  createHumanoidRagdoll,
} from './presets';
export type {
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
} from './types';
