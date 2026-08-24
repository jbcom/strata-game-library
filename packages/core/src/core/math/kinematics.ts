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

export type { BoneChain, BoneConstraint, IKSolverResult } from '../animation/ik-solver.js';
export {
  CCDSolver,
  createBoneChain,
  createBoneChainFromLengths,
  FABRIKSolver,
  TwoBoneIKSolver,
} from '../animation/ik-solver.js';
export type {
  GaitConfig,
  GaitState,
  SpringConfig,
  SpringState,
} from '../animation/procedural-animation.js';
export { ProceduralGait, SpringChain, SpringDynamics } from '../animation/procedural-animation.js';
export type { LookAtConfig, LookAtState } from '../animation/skeletal-animation.js';
export {
  calculateBoneRotation,
  clampAngle,
  dampedSpring,
  dampedSpringVector3,
  hermiteInterpolate,
  LookAtController,
  sampleCurve,
} from '../animation/skeletal-animation.js';
