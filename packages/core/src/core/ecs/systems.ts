/**
 * ECS System Registration and Execution Utilities
 *
 * High-performance system scheduler and utilities for managing ECS logic. Features
 * priority-based execution, conditional systems, performance timing, and React hooks
 * for integrating with React Three Fiber's render loop.
 *
 * @packageDocumentation
 * @module core/ecs/systems
 * @category Game Systems
 *
 * ## Key Features
 * - 📊 **Priority Scheduling**: Run systems in defined order
 * - ⚡ **Performance**: Cached sorting with dirty flag pattern
 * - 🎯 **Conditional Logic**: Enable/disable systems dynamically
 * - ⏱️ **Timing**: Built-in performance monitoring
 * - ⚛️ **React Integration**: Hooks for R3F render loop
 *
 * @example
 * ```typescript
 * // Create a system scheduler
 * const scheduler = createSystemScheduler<GameEntity>();
 *
 * // Register systems with priorities
 * scheduler.register({
 *   name: 'input',
 *   fn: inputSystem,
 *   priority: 0 // Runs first
 * });
 *
 * scheduler.register({
 *   name: 'physics',
 *   fn: physicsSystem,
 *   priority: 10 // Runs after input
 * });
 *
 * scheduler.register({
 *   name: 'rendering',
 *   fn: renderingSystem,
 *   priority: 20 // Runs last
 * });
 *
 * // Execute all systems each frame
 * useFrame((state, delta) => {
 *   scheduler.run(world, delta);
 * });
 * ```
 */

import type { BaseEntity, StrataWorld, SystemConfig, SystemFn } from './types';

/**
 * System scheduler for managing and executing ECS systems.
 *
 * Manages registration, prioritization, and execution of multiple ECS systems.
 * Uses a dirty flag pattern to cache sorted systems, avoiding expensive sorting
 * on every frame (60fps optimization).
 *
 * @category Game Systems
 *
 * @example
 * ```typescript
 * const scheduler = createSystemScheduler<GameEntity>();
 *
 * // Register systems
 * scheduler.register({ name: 'movement', fn: movementSystem, priority: 10 });
 * scheduler.register({ name: 'collision', fn: collisionSystem, priority: 20 });
 *
 * // Run all systems
 * scheduler.run(world, deltaTime);
 *
 * // Disable a system temporarily
 * scheduler.disable('collision');
 *
 * // Check system status
 * console.log('Systems:', scheduler.getSystemNames());
 * console.log('Movement enabled?', scheduler.isEnabled('movement'));
 * ```
 */
export interface SystemScheduler<T extends BaseEntity> {
  /** Register a new system with the scheduler. */
  register: (config: SystemConfig<T>) => void;
  /** Remove a system by name. */
  unregister: (name: string) => boolean;
  /** Execute all enabled systems in priority order. */
  run: (world: StrataWorld<T>, deltaTime: number) => void;
  /** Enable a system by name. */
  enable: (name: string) => void;
  /** Disable a system by name. */
  disable: (name: string) => void;
  /** Get names of all registered systems. */
  getSystemNames: () => string[];
  /** Check if a specific system is enabled. */
  isEnabled: (name: string) => boolean;
  /** Remove all systems and reset the scheduler. */
  clear: () => void;
}

/**
 * Creates a new system scheduler for managing ECS systems.
 *
 * Factory function for creating a system scheduler. The scheduler manages multiple
 * systems, executes them in priority order, and uses a dirty flag optimization to
 * avoid re-sorting on every frame.
 *
 * @category Game Systems
 * @returns A SystemScheduler instance with registration and execution methods.
 *
 * @example
 * ```typescript
 * interface GameEntity extends BaseEntity {
 *   position?: { x: number; y: number };
 *   velocity?: { x: number; y: number };
 * }
 *
 * const scheduler = createSystemScheduler<GameEntity>();
 *
 * // Movement system
 * scheduler.register({
 *   name: 'movement',
 *   priority: 0,
 *   fn: (world, dt) => {
 *     for (const e of world.query('position', 'velocity')) {
 *       e.position.x += e.velocity.x * dt;
 *       e.position.y += e.velocity.y * dt;
 *     }
 *   }
 * });
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
 *
 * Helper for creating systems that iterate over entities with specific components.
 * Reduces boilerplate for common system patterns.
 *
 * @category Game Systems
 * @param components - Component keys to query for.
 * @param update - Function to call for each matching entity.
 * @returns A SystemFn that can be registered with the scheduler.
 *
 * @example
 * ```typescript
 * // Movement system using createSystem helper
 * const movementSystem = createSystem(
 *   ['position', 'velocity'],
 *   (entity, dt) => {
 *     entity.position.x += entity.velocity.x * dt;
 *     entity.position.y += entity.velocity.y * dt;
 *     entity.position.z += entity.velocity.z * dt;
 *   }
 * );
 *
 * scheduler.register({
 *   name: 'movement',
 *   fn: movementSystem,
 *   priority: 10
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Health decay system
 * const decaySystem = createSystem(['health'], (entity, dt) => {
 *   entity.health -= 1 * dt;
 *   if (entity.health <= 0) {
 *     // Mark for removal
 *     entity.dead = true;
 *   }
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
 *
 * Debugging utility that measures and logs system execution time. Useful for
 * identifying performance bottlenecks in complex system pipelines.
 *
 * @category Game Systems
 * @param name - Name for logging
 * @param system - The system function to wrap
 * @returns A wrapped system that logs execution time
 *
 * @example
 * ```typescript
 * const timedMovement = withTiming('movement', movementSystem);
 *
 * scheduler.register({
 *   name: 'movement',
 *   fn: timedMovement
 * });
 *
 * // Console output each frame:
 * // [System: movement] executed in 1.23ms
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
 *
 * Useful for grouping related systems together. All systems execute in order
 * within the same priority slot.
 *
 * @category Game Systems
 * @param systems - Array of system functions to combine
 * @returns A single system that runs all provided systems
 *
 * @example
 * ```typescript
 * // Combine related physics systems
 * const physicsSystem = combineSystems([
 *   gravitySystem,
 *   collisionSystem,
 *   velocitySystem
 * ]);
 *
 * scheduler.register({
 *   name: 'physics',
 *   fn: physicsSystem,
 *   priority: 10
 * });
 * ```
 */
export function combineSystems<T extends BaseEntity>(systems: SystemFn<T>[]): SystemFn<T> {
  return (world: StrataWorld<T>, deltaTime: number) => {
    for (const system of systems) system(world, deltaTime);
  };
}

/**
 * Creates a conditional system that only runs when a predicate is true.
 *
 * Enables dynamic system control based on game state. More flexible than
 * manual enable/disable as the condition is evaluated every frame.
 *
 * @category Game Systems
 * @param predicate - Function that returns whether to run the system
 * @param system - The system function to conditionally run
 * @returns A system that only executes when predicate returns true
 *
 * @example
 * ```typescript
 * // Only run movement when game is not paused
 * const gameState = { isPaused: false };
 * const pausableMovement = conditionalSystem(
 *   () => !gameState.isPaused,
 *   movementSystem
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Run AI only when there are enemies
 * const aiSystem = conditionalSystem(
 *   () => countEntities(world, 'enemy') > 0,
 *   enemyAI
 * );
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

// React hooks (useSystem, useScheduler) have been moved to @strata-game-library/r3f
