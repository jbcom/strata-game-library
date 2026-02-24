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

export * from './ik-solver';
export * from './procedural-animation';
export * from './skeletal-animation';
