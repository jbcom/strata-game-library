/**
 * React hooks for XState animation state machines.
 *
 * Bridges XState with @react-three/drei animation utilities,
 * providing reactive animation state management in React Three Fiber.
 *
 * @module core/animation/state-machine
 */

import { useFrame } from '@react-three/fiber';
import { useMachine } from '@xstate/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { createAnimationMachine } from './factory';
import type {
    AnimationContext,
    AnimationEvent,
    AnimationMachineConfig,
    AnimationMachineReturn,
    AnimationStateName,
    UseAnimationMachineOptions,
} from './types';

/**
 * React hook for managing animation state machines.
 *
 * Integrates XState machines with React Three Fiber's render loop,
 * automatically updating animation context each frame.
 *
 * @param config - Animation machine configuration
 * @param options - Hook options
 * @returns Animation machine state and controls
 *
 * @example
 * ```typescript
 * function Character({ animations }) {
 *   const { currentState, send, transitionTo } = useAnimationMachine({
 *     id: 'character',
 *     initial: 'idle',
 *     states: {
 *       idle: { animation: 'Idle', loop: true },
 *       walk: { animation: 'Walk', loop: true },
 *       run: { animation: 'Run', loop: true }
 *     },
 *     transitions: [
 *       { from: 'idle', to: 'walk', event: 'MOVE' },
 *       { from: 'walk', to: 'run', event: 'SPRINT' }
 *     ]
 *   });
 *
 *   useEffect(() => {
 *     if (isMoving) send({ type: 'MOVE' });
 *     else send({ type: 'STOP' });
 *   }, [isMoving, send]);
 *
 *   return <AnimatedModel animation={currentState} />;
 * }
 * ```
 */
export function useAnimationMachine(
    config: AnimationMachineConfig,
    options: UseAnimationMachineOptions = {}
): AnimationMachineReturn {
    const {
        autoPlay = true,
        initialSpeed = 1.0,
        onStateChange,
        onAnimationComplete: _onAnimationComplete,
    } = options;

    const machine = useMemo(() => createAnimationMachine(config), [config]);
    const [state, send] = useMachine(machine);

    const previousStateRef = useRef<string>(config.initial);

    useFrame((_, delta) => {
        if (!state.context.isPaused) {
            send({ type: 'TICK', delta });
        }
    });

    useEffect(() => {
        const currentStateName = String(state.value);
        if (currentStateName !== previousStateRef.current) {
            previousStateRef.current = currentStateName;
            onStateChange?.(currentStateName as AnimationStateName);
        }
    }, [state.value, onStateChange]);

    useEffect(() => {
        if (autoPlay && initialSpeed !== 1.0) {
            send({ type: 'SET_SPEED', speed: initialSpeed });
        }
    }, [autoPlay, initialSpeed, send]);

    const transitionTo = useCallback(
        (targetState: AnimationStateName, duration?: number) => {
            send({
                type: 'BLEND',
                target: targetState,
                duration: duration ?? config.defaultCrossFadeDuration ?? 0.2,
            });
        },
        [send, config.defaultCrossFadeDuration]
    );

    const isInState = useCallback(
        (stateName: AnimationStateName): boolean => {
            return String(state.value) === stateName;
        },
        [state.value]
    );

    const pause = useCallback(() => {
        send({ type: 'PAUSE' });
    }, [send]);

    const resume = useCallback(() => {
        send({ type: 'RESUME' });
    }, [send]);

    const setSpeed = useCallback(
        (speed: number) => {
            send({ type: 'SET_SPEED', speed });
        },
        [send]
    );

    return {
        currentState: String(state.value) as AnimationStateName,
        context: state.context as AnimationContext,
        send: send as (event: AnimationEvent) => void,
        transitionTo,
        isInState,
        pause,
        resume,
        setSpeed,
    };
}

export { useAnimationBlend, useCrossFade, useSyncAnimationActions } from './blend-hooks';
