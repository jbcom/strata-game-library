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
export * from '../kinematics';

// Re-export state machine utilities
export * from './state-machine';
