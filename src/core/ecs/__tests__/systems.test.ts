/**
 * Tests for Strata ECS system utilities.
 *
 * @module core/ecs/__tests__/systems.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    createSystemScheduler,
    createSystem,
    withTiming,
    combineSystems,
    conditionalSystem,
} from '../systems';
import { createWorld, resetEntityIdCounter } from '../world';
import type { BaseEntity } from '../types';

interface TestEntity extends BaseEntity {
    position: { x: number; y: number; z: number };
    velocity?: { x: number; y: number; z: number };
    health?: number;
}

describe('createSystemScheduler', () => {
    beforeEach(() => {
        resetEntityIdCounter();
    });

    describe('ideal case', () => {
        it('registers and runs systems', () => {
            const world = createWorld<TestEntity>();
            const scheduler = createSystemScheduler<TestEntity>();
            const mockFn = vi.fn();

            scheduler.register({
                name: 'test',
                fn: mockFn,
            });

            scheduler.run(world, 1 / 60);

            expect(mockFn).toHaveBeenCalledWith(world, 1 / 60);
        });
    });

    describe('normal usage', () => {
        it('runs systems in priority order', () => {
            const world = createWorld<TestEntity>();
            const scheduler = createSystemScheduler<TestEntity>();
            const order: string[] = [];

            scheduler.register({
                name: 'last',
                fn: () => order.push('last'),
                priority: 100,
            });

            scheduler.register({
                name: 'first',
                fn: () => order.push('first'),
                priority: 0,
            });

            scheduler.register({
                name: 'middle',
                fn: () => order.push('middle'),
                priority: 50,
            });

            scheduler.run(world, 1 / 60);

            expect(order).toEqual(['first', 'middle', 'last']);
        });

        it('enables and disables systems', () => {
            const world = createWorld<TestEntity>();
            const scheduler = createSystemScheduler<TestEntity>();
            const mockFn = vi.fn();

            scheduler.register({ name: 'test', fn: mockFn });

            scheduler.disable('test');
            scheduler.run(world, 1 / 60);
            expect(mockFn).not.toHaveBeenCalled();

            scheduler.enable('test');
            scheduler.run(world, 1 / 60);
            expect(mockFn).toHaveBeenCalled();
        });

        it('unregisters systems', () => {
            const scheduler = createSystemScheduler<TestEntity>();

            scheduler.register({ name: 'test', fn: vi.fn() });
            expect(scheduler.getSystemNames()).toContain('test');

            scheduler.unregister('test');
            expect(scheduler.getSystemNames()).not.toContain('test');
        });

        it('checks if system is enabled', () => {
            const scheduler = createSystemScheduler<TestEntity>();

            scheduler.register({ name: 'test', fn: vi.fn() });
            expect(scheduler.isEnabled('test')).toBe(true);

            scheduler.disable('test');
            expect(scheduler.isEnabled('test')).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('handles no registered systems', () => {
            const world = createWorld<TestEntity>();
            const scheduler = createSystemScheduler<TestEntity>();

            expect(() => scheduler.run(world, 1 / 60)).not.toThrow();
        });

        it('clears all systems', () => {
            const scheduler = createSystemScheduler<TestEntity>();

            scheduler.register({ name: 'a', fn: vi.fn() });
            scheduler.register({ name: 'b', fn: vi.fn() });

            scheduler.clear();
            expect(scheduler.getSystemNames()).toEqual([]);
        });

        it('handles isEnabled for non-existent system', () => {
            const scheduler = createSystemScheduler<TestEntity>();
            expect(scheduler.isEnabled('nonexistent')).toBe(false);
        });
    });

    describe('error cases', () => {
        it('throws when registering duplicate system name', () => {
            const scheduler = createSystemScheduler<TestEntity>();

            scheduler.register({ name: 'test', fn: vi.fn() });

            expect(() => {
                scheduler.register({ name: 'test', fn: vi.fn() });
            }).toThrow("System 'test' is already registered");
        });
    });
});

describe('createSystem', () => {
    beforeEach(() => {
        resetEntityIdCounter();
    });

    it('creates a system that iterates matching entities', () => {
        const world = createWorld<TestEntity>();

        world.spawn({
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 1, y: 0, z: 0 },
        });

        const movementSystem = createSystem<TestEntity>(
            ['position', 'velocity'],
            (entity, delta) => {
                entity.position.x += entity.velocity!.x * delta;
            }
        );

        movementSystem(world, 1);

        const entities = [...world.query('position')];
        expect(entities[0].position.x).toBe(1);
    });

    it('skips entities without required components', () => {
        const world = createWorld<TestEntity>();

        world.spawn({ position: { x: 0, y: 0, z: 0 } });
        world.spawn({
            position: { x: 10, y: 0, z: 0 },
            velocity: { x: 5, y: 0, z: 0 },
        });

        const velocityUpdate = vi.fn();
        const movementSystem = createSystem<TestEntity>(['position', 'velocity'], velocityUpdate);

        movementSystem(world, 1);

        expect(velocityUpdate).toHaveBeenCalledTimes(1);
    });
});

describe('withTiming', () => {
    it('wraps system with performance logging', () => {
        const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
        const world = createWorld<TestEntity>();
        const mockFn = vi.fn();

        const timedSystem = withTiming<TestEntity>('test', mockFn);
        timedSystem(world, 1 / 60);

        expect(mockFn).toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalled();
        expect(consoleSpy.mock.calls[0][0]).toContain('[System: test]');

        consoleSpy.mockRestore();
    });
});

describe('combineSystems', () => {
    it('combines multiple systems into one', () => {
        const world = createWorld<TestEntity>();
        const calls: string[] = [];

        const combined = combineSystems<TestEntity>([
            () => {
                calls.push('a');
            },
            () => {
                calls.push('b');
            },
            () => {
                calls.push('c');
            },
        ]);

        combined(world, 1 / 60);

        expect(calls).toEqual(['a', 'b', 'c']);
    });

    it('handles empty array of systems', () => {
        const world = createWorld<TestEntity>();
        const combined = combineSystems<TestEntity>([]);

        expect(() => combined(world, 1 / 60)).not.toThrow();
    });
});

describe('conditionalSystem', () => {
    it('only runs when predicate is true', () => {
        const world = createWorld<TestEntity>();
        let isPaused = true;
        const mockFn = vi.fn();

        const pausable = conditionalSystem<TestEntity>(() => !isPaused, mockFn);

        pausable(world, 1 / 60);
        expect(mockFn).not.toHaveBeenCalled();

        isPaused = false;
        pausable(world, 1 / 60);
        expect(mockFn).toHaveBeenCalled();
    });

    it('evaluates predicate on each call', () => {
        const world = createWorld<TestEntity>();
        let callCount = 0;
        const predicate = vi.fn(() => {
            callCount++;
            return callCount % 2 === 1;
        });
        const mockFn = vi.fn();

        const conditional = conditionalSystem<TestEntity>(predicate, mockFn);

        conditional(world, 1 / 60);
        expect(mockFn).toHaveBeenCalledTimes(1);

        conditional(world, 1 / 60);
        expect(mockFn).toHaveBeenCalledTimes(1);

        conditional(world, 1 / 60);
        expect(mockFn).toHaveBeenCalledTimes(2);
    });
});
