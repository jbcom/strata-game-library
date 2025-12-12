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

export type {
    BlinkControllerProps,
    BlinkControllerRef,
    BreathingAnimationProps,
    BreathingAnimationRef,
    BuoyancyProps,
    BuoyancyRef,
    CharacterControllerProps,
    CharacterControllerRef,
    DestructibleProps,
    DestructibleRef,
    HeadTrackerProps,
    HeadTrackerRef,
    IKChainProps,
    IKChainRef,
    IKLimbProps,
    IKLimbRef,
    LookAtProps,
    LookAtRef,
    ProceduralWalkProps,
    ProceduralWalkRef,
    RagdollProps,
    RagdollRef,
    SpringBoneProps,
    SpringBoneRef,
    StateConfig,
    TailPhysicsProps,
    TailPhysicsRef,
    VehicleBodyProps,
    VehicleBodyRef,
    YukaEntityManagerContextValue,
    YukaEntityManagerProps,
    YukaNavMeshProps,
    YukaNavMeshRef,
    YukaPathProps,
    YukaPathRef,
    YukaStateMachineProps,
    YukaStateMachineRef,
    YukaVehicleProps,
    YukaVehicleRef,
} from '../components';
// Character Controller
// Procedural Animation - React components from ../components
// AI & Pathfinding (YukaJS)
export {
    BlinkController,
    BreathingAnimation,
    Buoyancy,
    CharacterController,
    Destructible,
    HeadTracker,
    IKChain,
    IKLimb,
    LookAt,
    ProceduralWalk,
    Ragdoll,
    SpringBone,
    syncYukaToThree,
    TailPhysics,
    threeVector3ToYuka,
    useYukaContext,
    VehicleBody,
    YukaEntityManager,
    YukaNavMesh,
    YukaPath,
    YukaStateMachine,
    YukaVehicle,
    yukaVector3ToThree,
} from '../components';
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
export type {
    UseAlignmentOptions,
    UseArriveOptions,
    UseCohesionOptions,
    UseEvadeOptions,
    UseFleeOptions,
    UseFollowPathOptions,
    UseInterposeOptions,
    UseObstacleAvoidanceOptions,
    UseOffsetPursuitOptions,
    UsePursueOptions,
    UseSeekOptions,
    UseSeparationOptions,
    UseWanderOptions,
} from '../hooks';
// Steering Behaviors (Hooks)
export {
    useAlignment,
    useArrive,
    useCohesion,
    useEvade,
    useFlee,
    useFollowPath,
    useInterpose,
    useObstacleAvoidance,
    useOffsetPursuit,
    usePursue,
    useSeek,
    useSeparation,
    useWander,
} from '../hooks';
