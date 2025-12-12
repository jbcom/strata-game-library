/**
 * ECS type definitions for Strata's Entity Component System.
 * @module core/ecs/types
 * @public
 */

import type { World } from 'miniplex';

/**
 * Base entity type that all game entities extend.
 * @public
 * @example
 * ```typescript
 * interface GameEntity extends BaseEntity { position: { x: number; y: number; z: number }; }
 * ```
 */
export interface BaseEntity {
    id?: string;
}

/**
 * Configuration options for creating a Strata ECS world.
 * @public
 * @example
 * ```typescript
 * const config: WorldConfig<GameEntity> = { enableLogging: true, maxEntities: 10000 };
 * ```
 */
export interface WorldConfig<T extends BaseEntity> {
    enableLogging?: boolean;
    maxEntities?: number;
    initialEntities?: T[];
}

/**
 * Query result with size property for efficient counting.
 * Extends Iterable for iteration support.
 * @public
 */
export interface QueryResult<T> extends Iterable<T> {
    /** Number of entities matching the query (O(1) access) */
    readonly size: number;
}

/**
 * Extended World interface with Strata-specific utilities.
 * @public
 * @example
 * ```typescript
 * const world: StrataWorld<GameEntity> = createWorld();
 * world.spawn({ position: { x: 0, y: 0, z: 0 } });
 * ```
 */
export interface StrataWorld<T extends BaseEntity> {
    world: World<T>;
    spawn: (entity: T) => T;
    despawn: (entity: T) => void;
    query: <K extends keyof T>(...components: K[]) => QueryResult<T>;
    queryWithout: <K extends keyof T>(...components: K[]) => QueryResult<T>;
    /** O(1) entity lookup by ID */
    findById: (id: string) => T | undefined;
    entities: T[];
    size: number;
    clear: () => void;
}

/** Utility type to extract component keys from an entity type. @public */
export type ComponentKeys<T> = keyof T;

/** Utility type to extract required components from an entity type. @public */
export type RequiredComponents<T> = {
    [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/** Utility type to extract optional components from an entity type. @public */
export type OptionalComponents<T> = {
    [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

/**
 * Archetype definition for common entity patterns.
 * @public
 * @example
 * ```typescript
 * const playerArchetype: Archetype<GameEntity> = { name: 'player', components: ['position'] };
 * ```
 */
export interface Archetype<T extends BaseEntity> {
    name: string;
    components: (keyof T)[];
    tags?: string[];
}

/**
 * System function signature for ECS systems.
 * @public
 * @example
 * ```typescript
 * const movementSystem: SystemFn<GameEntity> = (world, delta) => { ... };
 * ```
 */
export type SystemFn<T extends BaseEntity> = (world: StrataWorld<T>, deltaTime: number) => void;

/**
 * System registration configuration.
 * @public
 * @example
 * ```typescript
 * const config: SystemConfig<GameEntity> = { name: 'movement', fn: movementSystem, priority: 10 };
 * ```
 */
export interface SystemConfig<T extends BaseEntity> {
    name: string;
    fn: SystemFn<T>;
    priority?: number;
    enabled?: boolean;
}
