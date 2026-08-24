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

export type { BoneChain, BoneConstraint, IKSolverResult } from './ik-solver';
// Re-export kinematics (IK solvers, springs, gaits, etc.)
export {
  CCDSolver,
  createBoneChain,
  createBoneChainFromLengths,
  FABRIKSolver,
  TwoBoneIKSolver,
} from './ik-solver';
export type { GaitConfig, GaitState, SpringConfig, SpringState } from './procedural-animation';
export { ProceduralGait, SpringChain, SpringDynamics } from './procedural-animation';
export type { LookAtConfig, LookAtState } from './skeletal-animation';
export {
  calculateBoneRotation,
  clampAngle,
  dampedSpring,
  dampedSpringVector3,
  hermiteInterpolate,
  LookAtController,
  sampleCurve,
} from './skeletal-animation';
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
export {
  calculateBlendWeights,
  createAnimationMachine,
  createCombatMachine,
  createLocomotionMachine,
  smootherStep,
  smoothStep,
} from './state-machine';
