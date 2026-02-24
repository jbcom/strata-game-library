/**
 * Animation blending hooks for Three.js integration.
 *
 * Provides hooks for syncing XState animation weights with
 * Three.js AnimationAction objects.
 *
 * @module core/animation/state-machine
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnimationAction } from 'three';
import {
  calculateBlendWeights,
  smoothStep,
  type AnimationBlendReturn,
  type BlendTreeConfig,
  type BlendWeights,
  type UseAnimationBlendOptions,
} from '@strata-game-library/core';

/**
 * React hook for animation blending with blend trees.
 *
 * Manages blend weights between multiple animations based on
 * parameters, useful for locomotion and directional movement.
 *
 * @param blendTree - Blend tree configuration
 * @param options - Blend options
 * @returns Blend weights and control functions
 *
 * @example
 * ```typescript
 * function LocomotionCharacter({ speed }) {
 *   const { weights, setParameter, updateWeights } = useAnimationBlend({
 *     type: '1d',
 *     parameter: 'speed',
 *     nodes: [
 *       { animation: 'idle', threshold: 0 },
 *       { animation: 'walk', threshold: 0.5 },
 *       { animation: 'run', threshold: 1.0 }
 *     ]
 *   });
 *
 *   useEffect(() => {
 *     setParameter('speed', speed);
 *     updateWeights();
 *   }, [speed, setParameter, updateWeights]);
 *
 *   return (
 *     <group>
 *       {Object.entries(weights.weights).map(([name, weight]) => (
 *         <Animation key={name} name={name} weight={weight} />
 *       ))}
 *     </group>
 *   );
 * }
 * ```
 */
export function useAnimationBlend(
  blendTree: BlendTreeConfig,
  options: UseAnimationBlendOptions = {}
): AnimationBlendReturn {
  const { defaultDuration = 0.2, easing = smoothStep } = options;

  const [parameters, setParameters] = useState<Record<string, number>>({
    [blendTree.parameter]: 0,
  });
  const [weights, setWeights] = useState<BlendWeights>({
    weights: {},
    hasActiveAnimations: false,
  });
  const [targetAnimation, setTargetAnimation] = useState<string | null>(null);
  const blendProgressRef = useRef(0);
  const blendDurationRef = useRef(0);
  const previousWeightsRef = useRef<Record<string, number>>({});

  const updateWeights = useCallback(() => {
    const paramValue = parameters[blendTree.parameter] ?? 0;
    const newWeights = calculateBlendWeights(blendTree, paramValue);
    setWeights(newWeights);
    previousWeightsRef.current = newWeights.weights;
  }, [blendTree, parameters]);

  useFrame((_, delta) => {
    if (targetAnimation && blendDurationRef.current > 0) {
      blendProgressRef.current += delta / blendDurationRef.current;

      if (blendProgressRef.current >= 1) {
        blendProgressRef.current = 1;
        setTargetAnimation(null);
        blendDurationRef.current = 0;
      }

      const easedProgress = easing(blendProgressRef.current);
      const newWeights: Record<string, number> = {};

      for (const [name, prevWeight] of Object.entries(previousWeightsRef.current)) {
        const targetWeight = name === targetAnimation ? 1 : 0;
        newWeights[name] = prevWeight + (targetWeight - prevWeight) * easedProgress;
      }

      if (!(targetAnimation in newWeights)) {
        newWeights[targetAnimation] = easedProgress;
      }

      setWeights({
        weights: newWeights,
        hasActiveAnimations: Object.values(newWeights).some((w) => w > 0),
      });
    }
  });

  const blendTo = useCallback(
    (animation: string, duration?: number) => {
      previousWeightsRef.current = { ...weights.weights };
      blendProgressRef.current = 0;
      blendDurationRef.current = duration ?? defaultDuration;
      setTargetAnimation(animation);
    },
    [weights.weights, defaultDuration]
  );

  const setParameter = useCallback((name: string, value: number) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getParameter = useCallback(
    (name: string): number => {
      return parameters[name] ?? 0;
    },
    [parameters]
  );

  return {
    weights,
    blendTo,
    setParameter,
    getParameter,
    updateWeights,
  };
}

/**
 * Hook for syncing animation actions with blend weights.
 *
 * Automatically updates Three.js AnimationAction weights based on
 * blend weights from useAnimationBlend.
 *
 * @param actions - Map of animation names to Three.js AnimationActions
 * @param weights - Current blend weights
 *
 * @example
 * ```typescript
 * function BlendedCharacter({ gltf }) {
 *   const { actions } = useAnimations(gltf.animations, gltf.scene);
 *   const { weights, setParameter, updateWeights } = useAnimationBlend(locomotionTree);
 *
 *   useSyncAnimationActions(actions, weights);
 *
 *   return <primitive object={gltf.scene} />;
 * }
 * ```
 */
export function useSyncAnimationActions(
  actions: Record<string, AnimationAction | null>,
  weights: BlendWeights
): void {
  useEffect(() => {
    for (const [name, weight] of Object.entries(weights.weights)) {
      const action = actions[name];
      if (action) {
        if (weight > 0 && !action.isRunning()) {
          action.play();
        }
        action.setEffectiveWeight(weight);
        if (weight === 0 && action.isRunning()) {
          action.stop();
        }
      }
    }
  }, [actions, weights.weights]);
}

/**
 * Hook for cross-fading between two animations.
 *
 * Provides simple API for transitioning between animations with
 * smooth blending over a specified duration.
 *
 * @param fromAction - Starting animation action
 * @param toAction - Target animation action
 * @param duration - Cross-fade duration in seconds
 *
 * @example
 * ```typescript
 * function CrossFadeExample({ actions }) {
 *   const [current, setCurrent] = useState('idle');
 *
 *   useCrossFade(
 *     actions.idle,
 *     actions.walk,
 *     current === 'walk' ? 0.3 : 0
 *   );
 *
 *   return <button onClick={() => setCurrent('walk')}>Walk</button>;
 * }
 * ```
 */
export function useCrossFade(
  fromAction: AnimationAction | null,
  toAction: AnimationAction | null,
  duration: number
): void {
  const progressRef = useRef(0);
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (duration > 0 && fromAction && toAction) {
      isTransitioningRef.current = true;
      progressRef.current = 0;

      if (!toAction.isRunning()) {
        toAction.reset();
        toAction.play();
      }
    }
  }, [fromAction, toAction, duration]);

  useFrame((_, delta) => {
    if (isTransitioningRef.current && fromAction && toAction && duration > 0) {
      progressRef.current += delta / duration;

      if (progressRef.current >= 1) {
        progressRef.current = 1;
        isTransitioningRef.current = false;
        fromAction.stop();
      }

      const eased = smoothStep(progressRef.current);
      fromAction.setEffectiveWeight(1 - eased);
      toAction.setEffectiveWeight(eased);
    }
  });
}
