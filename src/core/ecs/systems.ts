/**
 * System registration and execution utilities for Strata ECS.
 * @module core/ecs/systems
 * @public
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import type { BaseEntity, StrataWorld, SystemConfig, SystemFn } from './types';

/**
 * System scheduler for managing and executing ECS systems.
 * @public
 * @example
 * ```typescript
 * const scheduler = createSystemScheduler<GameEntity>();
 * scheduler.register({ name: 'movement', fn: movementSystem, priority: 10 });
 * scheduler.run(world, deltaTime);
 * ```
 */
export interface SystemScheduler<T extends BaseEntity> {
    register: (config: SystemConfig<T>) => void;
    unregister: (name: string) => boolean;
    run: (world: StrataWorld<T>, deltaTime: number) => void;
    enable: (name: string) => void;
    disable: (name: string) => void;
    getSystemNames: () => string[];
    isEnabled: (name: string) => boolean;
    clear: () => void;
}

/**
 * Creates a new system scheduler for managing ECS systems.
 * Uses a dirty flag pattern to cache sorted systems and avoid
 * re-sorting on every frame (performance optimization for 60fps loops).
 * @returns A SystemScheduler instance
 * @example
 * ```typescript
 * const scheduler = createSystemScheduler<GameEntity>();
 * scheduler.register({ name: 'physics', fn: physicsSystem, priority: 0 });
 * scheduler.run(world, 1/60);
 * ```
 */
export function createSystemScheduler<T extends BaseEntity>(): SystemScheduler<T> {
    const systems = new Map<string, SystemConfig<T>>();
    // Cached sorted list of enabled systems - only rebuilt when dirty
    let sortedEnabledSystems: SystemConfig<T>[] = [];
    let isDirty = true;

    /**
     * Rebuilds the sorted cache if dirty.
     * This avoids sorting on every frame (60fps) which causes GC pressure.
     */
    const resync = (): void => {
        if (!isDirty) return;

        sortedEnabledSystems = [...systems.values()]
            .filter((s) => s.enabled)
            .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

        isDirty = false;
    };

    return {
        register(config: SystemConfig<T>): void {
            if (systems.has(config.name))
                throw new Error(`System '${config.name}' is already registered`);
            systems.set(config.name, {
                ...config,
                priority: config.priority ?? 0,
                enabled: config.enabled ?? true,
            });
            isDirty = true;
        },
        unregister(name: string): boolean {
            const deleted = systems.delete(name);
            if (deleted) isDirty = true;
            return deleted;
        },
        run(world: StrataWorld<T>, deltaTime: number): void {
            resync();
            for (const system of sortedEnabledSystems) {
                system.fn(world, deltaTime);
            }
        },
        enable(name: string): void {
            const s = systems.get(name);
            if (s && !s.enabled) {
                s.enabled = true;
                isDirty = true;
            }
        },
        disable(name: string): void {
            const s = systems.get(name);
            if (s?.enabled) {
                s.enabled = false;
                isDirty = true;
            }
        },
        getSystemNames: () => [...systems.keys()],
        isEnabled: (name: string) => systems.get(name)?.enabled ?? false,
        clear(): void {
            systems.clear();
            sortedEnabledSystems = [];
            isDirty = true;
        },
    };
}

/**
 * Creates a simple system function from a query and update function.
 * @param components - Component keys to query for
 * @param update - Function to call for each matching entity
 * @returns A SystemFn that can be registered with the scheduler
 * @example
 * ```typescript
 * const movementSystem = createSystem<GameEntity>(['position', 'velocity'], (entity, delta) => {
 *   entity.position.x += entity.velocity!.x * delta;
 * });
 * ```
 */
export function createSystem<T extends BaseEntity>(
    components: (keyof T)[],
    update: (entity: T, deltaTime: number) => void
): SystemFn<T> {
    return (world: StrataWorld<T>, deltaTime: number) => {
        for (const entity of world.query(...components)) update(entity, deltaTime);
    };
}

/**
 * Wraps a system function with performance timing.
 * @param name - Name for logging
 * @param system - The system function to wrap
 * @returns A wrapped system that logs execution time
 * @example
 * ```typescript
 * const timedMovement = withTiming('movement', movementSystem);
 * ```
 */
export function withTiming<T extends BaseEntity>(name: string, system: SystemFn<T>): SystemFn<T> {
    return (world: StrataWorld<T>, deltaTime: number) => {
        const start = performance.now();
        system(world, deltaTime);
        console.debug(`[System: ${name}] executed in ${(performance.now() - start).toFixed(2)}ms`);
    };
}

/**
 * Combines multiple systems into a single system function.
 * @param systems - Array of system functions to combine
 * @returns A single system that runs all provided systems
 * @example
 * ```typescript
 * const physicsSystem = combineSystems([gravitySystem, collisionSystem, velocitySystem]);
 * ```
 */
export function combineSystems<T extends BaseEntity>(systems: SystemFn<T>[]): SystemFn<T> {
    return (world: StrataWorld<T>, deltaTime: number) => {
        for (const system of systems) system(world, deltaTime);
    };
}

/**
 * Creates a conditional system that only runs when a predicate is true.
 * @param predicate - Function that returns whether to run the system
 * @param system - The system function to conditionally run
 * @returns A system that only executes when predicate returns true
 * @example
 * ```typescript
 * const pausableMovement = conditionalSystem(() => !isPaused, movementSystem);
 * ```
 */
export function conditionalSystem<T extends BaseEntity>(
    predicate: () => boolean,
    system: SystemFn<T>
): SystemFn<T> {
    return (world: StrataWorld<T>, deltaTime: number) => {
        if (predicate()) system(world, deltaTime);
    };
}

/**
 * Configuration for the useSystem hook.
 * @public
 */
export interface UseSystemOptions {
    enabled?: boolean;
    priority?: number;
}

/**
 * React hook for running an ECS system within React Three Fiber's render loop.
 * Automatically executes the system on each frame using useFrame.
 *
 * @param world - The Strata ECS world to operate on
 * @param system - The system function to execute each frame
 * @param options - Optional configuration (enabled, priority)
 * @returns Object with control methods to enable/disable the system
 *
 * @example
 * ```typescript
 * function MovementSystem() {
 *   const world = useContext(ECSContext);
 *
 *   const movementSystem = createSystem<GameEntity>(
 *     ['position', 'velocity'],
 *     (entity, delta) => {
 *       entity.position.x += entity.velocity!.x * delta;
 *     }
 *   );
 *
 *   const { setEnabled } = useSystem(world, movementSystem, { priority: 0 });
 *
 *   return null;
 * }
 * ```
 */
export function useSystem<T extends BaseEntity>(
    world: StrataWorld<T>,
    system: SystemFn<T>,
    options: UseSystemOptions = {}
): { setEnabled: (enabled: boolean) => void; isEnabled: () => boolean } {
    const { enabled = true, priority = 0 } = options;
    const enabledRef = useRef(enabled);

    // Sync enabled prop changes to the ref for declarative control
    // e.g., useSystem(world, system, { enabled: isPaused }) will now work
    useEffect(() => {
        enabledRef.current = enabled;
    }, [enabled]);

    // Keep stable references to world and system to avoid stale closures
    const worldRef = useRef(world);
    const systemRef = useRef(system);
    useEffect(() => {
        worldRef.current = world;
    }, [world]);
    useEffect(() => {
        systemRef.current = system;
    }, [system]);

    const setEnabled = useCallback((value: boolean) => {
        enabledRef.current = value;
    }, []);

    const isEnabled = useCallback(() => enabledRef.current, []);

    useFrame((_, delta) => {
        if (enabledRef.current) {
            systemRef.current(worldRef.current, delta);
        }
    }, priority);

    return { setEnabled, isEnabled };
}

/**
 * React hook for running a system scheduler within React Three Fiber's render loop.
 * Executes all registered systems in priority order on each frame.
 *
 * @param scheduler - The system scheduler to run
 * @param world - The Strata ECS world to operate on
 * @param priority - Optional useFrame priority (default: 0)
 *
 * @example
 * ```typescript
 * function GameLoop() {
 *   const world = useContext(ECSContext);
 *   const scheduler = useMemo(() => createSystemScheduler<GameEntity>(), []);
 *
 *   useEffect(() => {
 *     scheduler.register({ name: 'movement', fn: movementSystem });
 *     scheduler.register({ name: 'physics', fn: physicsSystem, priority: 10 });
 *     return () => scheduler.clear();
 *   }, [scheduler]);
 *
 *   useScheduler(scheduler, world);
 *
 *   return null;
 * }
 * ```
 */
export function useScheduler<T extends BaseEntity>(
    scheduler: SystemScheduler<T>,
    world: StrataWorld<T>,
    priority: number = 0
): void {
    useFrame((_, delta) => {
        scheduler.run(world, delta);
    }, priority);
}
