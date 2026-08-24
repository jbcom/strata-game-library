/**
 * Core Animation and Kinematics System.
 *
 * This module re-exports from the split sub-modules for backward compatibility:
 * - {@link ./ik-solver} - IK solvers (FABRIK, CCD, Two-bone)
 * - {@link ./skeletal-animation} - Look-at controller, bone rotation, curve interpolation
 * - {@link ./procedural-animation} - Spring dynamics, spring chains, procedural gait
 *
 * @packageDocumentation
 * @module core/animation
 * @category Entities & Simulation
 */

export type {
  BoneChain,
  BoneConstraint,
  IKSolverResult,
} from './ik-solver';
export {
  CCDSolver,
  createBoneChain,
  createBoneChainFromLengths,
  FABRIKSolver,
  TwoBoneIKSolver,
} from './ik-solver';
export type {
  GaitConfig,
  GaitState,
  SpringConfig,
  SpringState,
} from './procedural-animation';
export {
  ProceduralGait,
  SpringChain,
  SpringDynamics,
} from './procedural-animation';
export type {
  LookAtConfig,
  LookAtState,
} from './skeletal-animation';
export {
  calculateBoneRotation,
  clampAngle,
  dampedSpring,
  dampedSpringVector3,
  hermiteInterpolate,
  LookAtController,
  sampleCurve,
} from './skeletal-animation';
