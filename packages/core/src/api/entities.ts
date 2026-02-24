/**
 * @module Entities
 * @category Entities & Simulation
 *
 * Entities & Simulation - Characters, Animation, Physics, and AI
 *
 * These systems handle dynamic objects in your world - characters that move,
 * objects that react to physics, and AI-driven behaviors.
 *
 * @example
 * ```tsx
 * import { CharacterController, Ragdoll, YukaVehicle } from '@jbcom/strata/api/entities';
 *
 * function Player() {
 *   return (
 *     <CharacterController
 *       height={1.8}
 *       radius={0.3}
 *       moveSpeed={5}
 *     >
 *       <PlayerModel />
 *     </CharacterController>
 *   );
 * }
 * ```
 */

// React components moved to @strata-game-library/r3f
export type {
  BoneChain,
  BoneConstraint,
  BuoyancyConfig,
  CharacterControllerConfig,
  CollisionFilter,
  DestructibleConfig,
  GaitConfig,
  GaitState,
  IKSolverResult,
  LookAtConfig,
  LookAtState,
  PhysicsConfig,
  PhysicsMaterial,
  RagdollBodyPart,
  RagdollConfig,
  RagdollJointConfig,
  SpringConfig,
  SpringState,
  VehicleConfig,
  WheelConfig,
} from '../core';
// Physics Utilities
// Procedural Animation - Core utilities from ../core
export {
  applyDrag,
  CCDSolver,
  CollisionLayer,
  calculateBoneRotation,
  calculateBuoyancyForce,
  calculateExplosionForce,
  calculateForce,
  calculateImpulse,
  calculateJumpImpulse,
  calculateLandingVelocity,
  calculateSlopeAngle,
  calculateSteeringAngle,
  calculateSuspensionForce,
  clampAngle,
  collisionFilters,
  createBoneChain,
  createBoneChainFromLengths,
  createDefaultBuoyancyConfig,
  createDefaultCharacterConfig,
  createDefaultDestructibleConfig,
  createDefaultPhysicsConfig,
  createDefaultVehicleConfig,
  createHumanoidRagdoll,
  dampedSpring,
  dampedSpringVector3,
  FABRIKSolver,
  generateDebrisVelocity,
  hermiteInterpolate,
  isWalkableSlope,
  LookAtController,
  ProceduralGait,
  projectVelocityOntoGround,
  SpringChain,
  SpringDynamics,
  sampleCurve,
  TwoBoneIKSolver,
} from '../core';
// React hooks moved to @strata-game-library/r3f
