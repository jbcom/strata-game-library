/**
 * XState-based animation state machine module.
 *
 * Provides state machine patterns for managing animation transitions,
 * blend trees, and cross-fading in React Three Fiber applications.
 *
 * @module core/animation/state-machine
 *
 * @example
 * ```typescript
 * import {
 *   createAnimationMachine,
 *   createLocomotionMachine,
 *   useAnimationMachine,
 *   useAnimationBlend
 * } from '@jbcom/strata/core/animation/state-machine';
 *
 * // Create a locomotion machine with common states
 * const locomotion = createLocomotionMachine({
 *   idle: 'Idle',
 *   walk: 'Walk',
 *   run: 'Run',
 *   jump: 'Jump'
 * });
 *
 * // Use in a React component
 * function Character() {
 *   const { currentState, send } = useAnimationMachine(locomotion);
 *   // ...
 * }
 * ```
 */

export { useAnimationBlend, useCrossFade, useSyncAnimationActions } from './blend-hooks';
export { calculateBlendWeights, createAnimationMachine, smootherStep, smoothStep } from './factory';

export { useAnimationMachine } from './hooks';
export { createCombatMachine, createLocomotionMachine } from './presets';

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
} from './types';
