/**
 * XState-based animation state machine module.
 *
 * Provides state machine patterns for managing animation transitions.
 * React hooks (useAnimationMachine, useAnimationBlend, etc.) are in @strata-game-library/r3f.
 *
 * @module core/animation/state-machine
 */

export { calculateBlendWeights, createAnimationMachine, smootherStep, smoothStep } from './factory';
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
