/**
 * Factory functions for creating XState-based animation state machines.
 *
 * Provides utilities to create animation machines with common game states,
 * blend trees, and cross-fade timing using XState v5 patterns.
 *
 * @module core/animation/state-machine
 */

import { assign, createMachine } from 'xstate';
import type {
  AnimationContext,
  AnimationEvent,
  AnimationMachineConfig,
  AnimationStateName,
  BlendTreeConfig,
  BlendWeights,
} from './types';

/**
 * Default animation context values.
 */
const DEFAULT_CONTEXT: AnimationContext = {
  currentAnimation: '',
  previousAnimation: null,
  blendFactor: 0,
  playbackSpeed: 1.0,
  timeInState: 0,
  isPaused: false,
};

/**
 * Creates an XState machine for managing animation states.
 *
 * @param config - Animation machine configuration
 * @returns XState machine configured for animation state management
 *
 * @example
 * ```typescript
 * const machine = createAnimationMachine({
 *   id: 'player',
 *   initial: 'idle',
 *   states: {
 *     idle: { animation: 'Idle', loop: true },
 *     walk: { animation: 'Walk', loop: true },
 *     run: { animation: 'Run', loop: true },
 *     jump: { animation: 'Jump', loop: false }
 *   },
 *   transitions: [
 *     { from: 'idle', to: 'walk', event: 'MOVE' },
 *     { from: 'walk', to: 'idle', event: 'STOP' },
 *     { from: 'walk', to: 'run', event: 'SPRINT' },
 *     { from: '*', to: 'jump', event: 'JUMP' }
 *   ],
 *   defaultCrossFadeDuration: 0.25
 * });
 * ```
 */
export function createAnimationMachine(config: AnimationMachineConfig) {
  const stateNames = Object.keys(config.states) as AnimationStateName[];
  const crossFade = config.defaultCrossFadeDuration ?? 0.2;

  const states: Record<string, object> = {};

  for (const stateName of stateNames) {
    const stateConfig = config.states[stateName];
    const stateTransitions: Record<string, object> = {};

    const relevantTransitions = (config.transitions ?? []).filter(
      (t) => t.from === stateName || t.from === '*'
    );

    for (const transition of relevantTransitions) {
      const targetState = transition.to;
      const duration = transition.crossFadeDuration ?? crossFade;

      stateTransitions[transition.event] = {
        target: targetState,
        guard: transition.condition
          ? ({ context }: { context: AnimationContext }) => transition.condition?.(context)
          : undefined,
        actions: assign({
          previousAnimation: ({ context }: { context: AnimationContext }) =>
            context.currentAnimation,
          currentAnimation: () => config.states[targetState].animation,
          blendFactor: () => 0,
          timeInState: () => 0,
          metadata: ({ context }: { context: AnimationContext }) => ({
            ...context.metadata,
            crossFadeDuration: duration,
          }),
        }),
      };
    }

    stateTransitions.TICK = {
      actions: assign({
        timeInState: ({ context, event }: { context: AnimationContext; event: AnimationEvent }) =>
          context.timeInState + (event.type === 'TICK' ? (event as { delta: number }).delta : 0),
        blendFactor: ({ context, event }: { context: AnimationContext; event: AnimationEvent }) => {
          if (context.blendFactor >= 1) return 1;
          const duration = (context.metadata?.crossFadeDuration as number) ?? crossFade;
          const delta = event.type === 'TICK' ? (event as { delta: number }).delta : 0;
          return Math.min(1, context.blendFactor + delta / duration);
        },
      }),
    };

    stateTransitions.PAUSE = {
      actions: assign({ isPaused: () => true }),
    };

    stateTransitions.RESUME = {
      actions: assign({ isPaused: () => false }),
    };

    stateTransitions.SET_SPEED = {
      actions: assign({
        playbackSpeed: ({ event }: { event: AnimationEvent }) =>
          event.type === 'SET_SPEED' ? (event as { speed: number }).speed : 1,
      }),
    };

    states[stateName] = {
      entry: assign({
        currentAnimation: () => stateConfig.animation,
        timeInState: () => 0,
        blendFactor: () => 0,
      }),
      on: stateTransitions,
    };
  }

  return createMachine({
    id: config.id,
    initial: config.initial,
    context: {
      ...DEFAULT_CONTEXT,
      currentAnimation: config.states[config.initial].animation,
    },
    states,
  });
}

/**
 * Calculates blend weights for a 1D blend tree.
 *
 * @param config - Blend tree configuration
 * @param parameter - Current parameter value
 * @returns Calculated blend weights for each animation
 *
 * @example
 * ```typescript
 * const config: BlendTreeConfig = {
 *   type: '1d',
 *   parameter: 'speed',
 *   nodes: [
 *     { animation: 'idle', threshold: 0 },
 *     { animation: 'walk', threshold: 0.5 },
 *     { animation: 'run', threshold: 1.0 }
 *   ]
 * };
 * const weights = calculateBlendWeights(config, 0.75);
 * // { weights: { idle: 0, walk: 0.5, run: 0.5 }, hasActiveAnimations: true }
 * ```
 */
export function calculateBlendWeights(config: BlendTreeConfig, parameter: number): BlendWeights {
  const weights: Record<string, number> = {};
  const nodes = config.nodes.filter((n) => n.threshold !== undefined);

  if (nodes.length === 0) {
    return { weights: {}, hasActiveAnimations: false };
  }

  nodes.sort((a, b) => (a.threshold ?? 0) - (b.threshold ?? 0));

  for (const node of nodes) {
    weights[node.animation] = 0;
  }

  const clampedParam = Math.max(
    nodes[0].threshold ?? 0,
    Math.min(parameter, nodes[nodes.length - 1].threshold ?? 1)
  );

  for (let i = 0; i < nodes.length - 1; i++) {
    const current = nodes[i];
    const next = nodes[i + 1];
    const currentThreshold = current.threshold ?? 0;
    const nextThreshold = next.threshold ?? 1;

    if (clampedParam >= currentThreshold && clampedParam <= nextThreshold) {
      const range = nextThreshold - currentThreshold;
      const t = range > 0 ? (clampedParam - currentThreshold) / range : 0;
      weights[current.animation] = 1 - t;
      weights[next.animation] = t;
      break;
    }
  }

  if (clampedParam <= (nodes[0].threshold ?? 0)) {
    weights[nodes[0].animation] = 1;
  }
  if (clampedParam >= (nodes[nodes.length - 1].threshold ?? 1)) {
    weights[nodes[nodes.length - 1].animation] = 1;
  }

  return {
    weights,
    hasActiveAnimations: Object.values(weights).some((w) => w > 0),
  };
}

/**
 * Interpolates blend factor using smooth step easing.
 *
 * @param t - Input value (0-1)
 * @returns Eased value
 *
 * @example
 * ```typescript
 * const smooth = smoothStep(0.5); // ~0.5
 * const smooth2 = smoothStep(0.1); // ~0.028
 * ```
 */
export function smoothStep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
}

/**
 * Interpolates blend factor using smoother step easing.
 *
 * @param t - Input value (0-1)
 * @returns Eased value with smoother acceleration/deceleration
 *
 * @example
 * ```typescript
 * const smooth = smootherStep(0.5); // ~0.5
 * ```
 */
export function smootherStep(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
}
