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

// Re-export kinematics (IK solvers, springs, gaits, etc.)
export { CCDSolver, FABRIKSolver, TwoBoneIKSolver, createBoneChain, createBoneChainFromLengths } from "./ik-solver";
export type { BoneChain, BoneConstraint, IKSolverResult } from "./ik-solver";
export { ProceduralGait, SpringChain, SpringDynamics } from "./procedural-animation";
export type { GaitConfig, GaitState, SpringConfig, SpringState } from "./procedural-animation";
export { LookAtController, calculateBoneRotation, clampAngle, dampedSpring, dampedSpringVector3, hermiteInterpolate, sampleCurve } from "./skeletal-animation";
export type { LookAtConfig, LookAtState } from "./skeletal-animation";
export { calculateBlendWeights, createAnimationMachine, createCombatMachine, createLocomotionMachine, smoothStep, smootherStep } from "./state-machine";
export type { AnimationBlendReturn, AnimationContext, AnimationEvent, AnimationMachineConfig, AnimationMachineReturn, AnimationStateConfig, AnimationStateName, AnimationTransitionConfig, BlendTreeConfig, BlendTreeNode, BlendWeights, UseAnimationBlendOptions, UseAnimationMachineOptions } from "./state-machine";
