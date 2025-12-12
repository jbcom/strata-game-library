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

// Character Controller
export { CharacterController, VehicleBody, Destructible, Buoyancy, Ragdoll } from '../components';

export type {
    CharacterControllerProps,
    CharacterControllerRef,
    VehicleBodyProps,
    VehicleBodyRef,
    DestructibleProps,
    DestructibleRef,
    BuoyancyProps,
    BuoyancyRef,
    RagdollProps,
    RagdollRef,
} from '../components';

// Physics Utilities
export {
    CollisionLayer,
    collisionFilters,
    calculateImpulse,
    calculateForce,
    calculateJumpImpulse,
    calculateLandingVelocity,
    applyDrag,
    calculateBuoyancyForce,
    calculateSlopeAngle,
    isWalkableSlope,
    projectVelocityOntoGround,
    calculateSteeringAngle,
    calculateSuspensionForce,
    calculateExplosionForce,
    generateDebrisVelocity,
    createDefaultPhysicsConfig,
    createDefaultCharacterConfig,
    createDefaultVehicleConfig,
    createHumanoidRagdoll,
    createDefaultDestructibleConfig,
    createDefaultBuoyancyConfig,
} from '../core';

export type {
    PhysicsConfig,
    CollisionFilter,
    CharacterControllerConfig,
    VehicleConfig,
    WheelConfig,
    RagdollJointConfig,
    RagdollBodyPart,
    RagdollConfig,
    PhysicsMaterial,
    DestructibleConfig,
    BuoyancyConfig,
} from '../core';

// Procedural Animation - Core utilities from ../core
export {
    FABRIKSolver,
    CCDSolver,
    TwoBoneIKSolver,
    LookAtController,
    SpringDynamics,
    SpringChain,
    ProceduralGait,
    createBoneChain,
    createBoneChainFromLengths,
    clampAngle,
    dampedSpring,
    dampedSpringVector3,
    hermiteInterpolate,
    sampleCurve,
    calculateBoneRotation,
} from '../core';

export type {
    BoneChain,
    BoneConstraint,
    IKSolverResult,
    SpringConfig,
    SpringState,
    GaitConfig,
    GaitState,
    LookAtConfig,
    LookAtState,
} from '../core';

// Procedural Animation - React components from ../components
export {
    IKChain,
    IKLimb,
    LookAt,
    SpringBone,
    ProceduralWalk,
    HeadTracker,
    TailPhysics,
    BreathingAnimation,
    BlinkController,
} from '../components';

export type {
    IKChainProps,
    IKChainRef,
    IKLimbProps,
    IKLimbRef,
    LookAtProps,
    LookAtRef,
    SpringBoneProps,
    SpringBoneRef,
    ProceduralWalkProps,
    ProceduralWalkRef,
    HeadTrackerProps,
    HeadTrackerRef,
    TailPhysicsProps,
    TailPhysicsRef,
    BreathingAnimationProps,
    BreathingAnimationRef,
    BlinkControllerProps,
    BlinkControllerRef,
} from '../components';

// AI & Pathfinding (YukaJS)
export {
    YukaEntityManager,
    YukaVehicle,
    YukaPath,
    YukaStateMachine,
    YukaNavMesh,
    useYukaContext,
    yukaVector3ToThree,
    threeVector3ToYuka,
    syncYukaToThree,
} from '../components';

export type {
    YukaEntityManagerContextValue,
    YukaEntityManagerProps,
    YukaVehicleProps,
    YukaVehicleRef,
    YukaPathProps,
    YukaPathRef,
    StateConfig,
    YukaStateMachineProps,
    YukaStateMachineRef,
    YukaNavMeshProps,
    YukaNavMeshRef,
} from '../components';

// Steering Behaviors (Hooks)
export {
    useSeek,
    useFlee,
    useArrive,
    usePursue,
    useEvade,
    useWander,
    useFollowPath,
    useSeparation,
    useAlignment,
    useCohesion,
    useObstacleAvoidance,
    useOffsetPursuit,
    useInterpose,
} from '../hooks';

export type {
    UseSeekOptions,
    UseFleeOptions,
    UseArriveOptions,
    UsePursueOptions,
    UseEvadeOptions,
    UseWanderOptions,
    UseFollowPathOptions,
    UseSeparationOptions,
    UseAlignmentOptions,
    UseCohesionOptions,
    UseObstacleAvoidanceOptions,
    UseOffsetPursuitOptions,
    UseInterposeOptions,
} from '../hooks';
