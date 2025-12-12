/**
 * Tests for animation state machine factory functions.
 *
 * Covers ideal, normal, edge, and error cases for:
 * - Machine creation
 * - State transitions
 * - Animation events
 * - Context updates
 * - Blend weight calculations
 */

import { describe, expect, it } from 'vitest';
import { createActor } from 'xstate';
import {
    calculateBlendWeights,
    createAnimationMachine,
    smootherStep,
    smoothStep,
} from '../factory';
import type { AnimationMachineConfig, BlendTreeConfig } from '../types';

describe('createAnimationMachine', () => {
    describe('ideal case', () => {
        it('creates machine with initial state', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                    walk: { animation: 'Walk', loop: true },
                },
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            expect(actor.getSnapshot().value).toBe('idle');
            expect(actor.getSnapshot().context.currentAnimation).toBe('Idle');
        });

        it('creates machine with configured transitions', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                    walk: { animation: 'Walk', loop: true },
                },
                transitions: [{ from: 'idle', to: 'walk', event: 'MOVE' }],
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            actor.send({ type: 'MOVE' });
            expect(actor.getSnapshot().value).toBe('walk');
        });
    });

    describe('normal usage', () => {
        it('handles TICK events to update timeInState', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                },
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            actor.send({ type: 'TICK', delta: 0.016 });
            expect(actor.getSnapshot().context.timeInState).toBeCloseTo(0.016, 3);

            actor.send({ type: 'TICK', delta: 0.016 });
            expect(actor.getSnapshot().context.timeInState).toBeCloseTo(0.032, 3);
        });

        it('handles PAUSE and RESUME events', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                },
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            expect(actor.getSnapshot().context.isPaused).toBe(false);

            actor.send({ type: 'PAUSE' });
            expect(actor.getSnapshot().context.isPaused).toBe(true);

            actor.send({ type: 'RESUME' });
            expect(actor.getSnapshot().context.isPaused).toBe(false);
        });

        it('handles SET_SPEED event', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                },
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            expect(actor.getSnapshot().context.playbackSpeed).toBe(1.0);

            actor.send({ type: 'SET_SPEED', speed: 2.0 });
            expect(actor.getSnapshot().context.playbackSpeed).toBe(2.0);
        });

        it('updates context on state transition', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                    walk: { animation: 'Walk', loop: true },
                },
                transitions: [{ from: 'idle', to: 'walk', event: 'MOVE' }],
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            actor.send({ type: 'MOVE' });

            const ctx = actor.getSnapshot().context;
            expect(ctx.currentAnimation).toBe('Walk');
            expect(ctx.previousAnimation).toBe('Idle');
            expect(ctx.blendFactor).toBe(0);
            expect(ctx.timeInState).toBe(0);
        });
    });

    describe('edge cases', () => {
        it('handles single state machine', () => {
            const config: AnimationMachineConfig = {
                id: 'single',
                initial: 'only',
                states: {
                    only: { animation: 'Only', loop: true },
                },
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            expect(actor.getSnapshot().value).toBe('only');
        });

        it('handles self-transitions with wildcard', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                },
                transitions: [{ from: '*', to: 'idle', event: 'RESET' }],
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            actor.send({ type: 'TICK', delta: 0.5 });
            actor.send({ type: 'RESET' });

            expect(actor.getSnapshot().value).toBe('idle');
            expect(actor.getSnapshot().context.timeInState).toBe(0);
        });

        it('blendFactor increases with TICK and caps at 1', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                    walk: { animation: 'Walk', loop: true },
                },
                transitions: [{ from: 'idle', to: 'walk', event: 'MOVE' }],
                defaultCrossFadeDuration: 0.1,
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            actor.send({ type: 'MOVE' });

            for (let i = 0; i < 20; i++) {
                actor.send({ type: 'TICK', delta: 0.016 });
            }

            expect(actor.getSnapshot().context.blendFactor).toBe(1);
        });

        it('handles transition with guard condition', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                    run: { animation: 'Run', loop: true },
                },
                transitions: [
                    {
                        from: 'idle',
                        to: 'run',
                        event: 'MOVE',
                        condition: (ctx) => ctx.playbackSpeed > 0.5,
                    },
                ],
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            actor.send({ type: 'SET_SPEED', speed: 0.3 });
            actor.send({ type: 'MOVE' });
            expect(actor.getSnapshot().value).toBe('idle');

            actor.send({ type: 'SET_SPEED', speed: 0.8 });
            actor.send({ type: 'MOVE' });
            expect(actor.getSnapshot().value).toBe('run');
        });
    });

    describe('error cases', () => {
        it('ignores unknown events gracefully', () => {
            const config: AnimationMachineConfig = {
                id: 'test',
                initial: 'idle',
                states: {
                    idle: { animation: 'Idle', loop: true },
                },
            };

            const machine = createAnimationMachine(config);
            const actor = createActor(machine);
            actor.start();

            actor.send({ type: 'UNKNOWN_EVENT' as any });
            expect(actor.getSnapshot().value).toBe('idle');
        });
    });
});

describe('calculateBlendWeights', () => {
    const locomotionTree: BlendTreeConfig = {
        type: '1d',
        parameter: 'speed',
        nodes: [
            { animation: 'idle', threshold: 0 },
            { animation: 'walk', threshold: 0.5 },
            { animation: 'run', threshold: 1.0 },
        ],
    };

    describe('ideal case', () => {
        it('returns full weight for threshold matches', () => {
            const weights = calculateBlendWeights(locomotionTree, 0);
            expect(weights.weights.idle).toBe(1);
            expect(weights.weights.walk).toBe(0);
            expect(weights.weights.run).toBe(0);
        });

        it('blends between adjacent nodes', () => {
            const weights = calculateBlendWeights(locomotionTree, 0.25);
            expect(weights.weights.idle).toBe(0.5);
            expect(weights.weights.walk).toBe(0.5);
            expect(weights.weights.run).toBe(0);
        });
    });

    describe('normal usage', () => {
        it('calculates weights at midpoint', () => {
            const weights = calculateBlendWeights(locomotionTree, 0.75);
            expect(weights.weights.idle).toBe(0);
            expect(weights.weights.walk).toBe(0.5);
            expect(weights.weights.run).toBe(0.5);
        });
    });

    describe('edge cases', () => {
        it('clamps below minimum threshold', () => {
            const weights = calculateBlendWeights(locomotionTree, -0.5);
            expect(weights.weights.idle).toBe(1);
            expect(weights.hasActiveAnimations).toBe(true);
        });

        it('clamps above maximum threshold', () => {
            const weights = calculateBlendWeights(locomotionTree, 1.5);
            expect(weights.weights.run).toBe(1);
        });

        it('handles empty nodes array', () => {
            const emptyTree: BlendTreeConfig = {
                type: '1d',
                parameter: 'speed',
                nodes: [],
            };
            const weights = calculateBlendWeights(emptyTree, 0.5);
            expect(weights.hasActiveAnimations).toBe(false);
        });
    });
});

describe('smoothStep', () => {
    it('returns 0 at input 0', () => {
        expect(smoothStep(0)).toBe(0);
    });

    it('returns 1 at input 1', () => {
        expect(smoothStep(1)).toBe(1);
    });

    it('returns ~0.5 at input 0.5', () => {
        expect(smoothStep(0.5)).toBe(0.5);
    });

    it('clamps input below 0', () => {
        expect(smoothStep(-0.5)).toBe(0);
    });

    it('clamps input above 1', () => {
        expect(smoothStep(1.5)).toBe(1);
    });
});

describe('smootherStep', () => {
    it('returns 0 at input 0', () => {
        expect(smootherStep(0)).toBe(0);
    });

    it('returns 1 at input 1', () => {
        expect(smootherStep(1)).toBe(1);
    });

    it('returns ~0.5 at input 0.5', () => {
        expect(smootherStep(0.5)).toBe(0.5);
    });
});
