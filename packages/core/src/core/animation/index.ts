/**
 * Animation Module - Kinematics and State Management.
 *
 * This module provides comprehensive animation utilities including:
 * - IK solvers (FABRIK, CCD, Two-bone)
 * - Spring dynamics and physics
 * - Procedural animation (gaits, look-at)
 * - XState-based animation state machines
 *
 * @module core/animation
 * @category Entities & Simulation
 */

export type {
  BoneChain,
  BoneConstraint,
  GaitConfig,
  GaitState,
  IKSolverResult,
  LookAtConfig,
  LookAtState,
  SpringConfig,
  SpringState,
} from '../kinematics';
// Re-export kinematics (IK solvers, springs, gaits, etc.)
export {
  CCDSolver,
  calculateBoneRotation,
  clampAngle,
  createBoneChain,
  createBoneChainFromLengths,
  dampedSpring,
  dampedSpringVector3,
  FABRIKSolver,
  hermiteInterpolate,
  LookAtController,
  ProceduralGait,
  SpringChain,
  SpringDynamics,
  sampleCurve,
  TwoBoneIKSolver,
} from '../kinematics';
export type {
  AnimationBlendReturn,
  AnimationContext,
  AnimationEvent,
  AnimationMachineConfig,
  AnimationMachineReturn,
  AnimationStateConfig,
  AnimationStateName,
  AnimationTransitionConfig,
  BlendTreeConfig,
  BlendTreeNode,
  BlendWeights,
  UseAnimationBlendOptions,
  UseAnimationMachineOptions,
} from './state-machine';
// Re-export state machine utilities
export {
  calculateBlendWeights,
  createAnimationMachine,
  createCombatMachine,
  createLocomotionMachine,
  smootherStep,
  smoothStep,
} from './state-machine';
