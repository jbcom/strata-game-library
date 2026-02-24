/**
 * ECS type definitions for Strata's Entity Component System.
 * @packageDocumentation
 * @module core/ecs/types
 * @category Game Systems
 */

import type { World } from 'miniplex';

/**
 * Base entity type that all game entities extend.
 * @category Game Systems
 * @example
 * ```typescript
 * interface GameEntity extends BaseEntity {
 *   position: { x: number; y: number; z: number };
 * }
 * ```
 */
export interface BaseEntity {
  /** Unique identifier for the entity. Automatically generated if not provided. */
  id?: string;
}

/**
 * Configuration options for creating a Strata ECS world.
 * @category Game Systems
 */
export interface WorldConfig<T extends BaseEntity> {
  /** Whether to enable debug logging for entity lifecycle events. */
  enableLogging?: boolean;
  /** Maximum number of entities allowed in the world. */
  maxEntities?: number;
  /** Optional array of entities to spawn immediately on creation. */
  initialEntities?: T[];
}

/**
 * Query result with size property for efficient counting.
 * @category Game Systems
 */
export interface QueryResult<T> extends Iterable<T> {
  /** Number of entities matching the query (O(1) access). */
  readonly size: number;
}

/**
 * Extended World interface with Strata-specific utilities.
 * @category Game Systems
 * @example
 * ```typescript
 * const world: StrataWorld<GameEntity> = createWorld();
 * world.spawn({ position: { x: 0, y: 0, z: 0 } });
 * ```
 */
export interface StrataWorld<T extends BaseEntity> {
  /** The underlying Miniplex world instance. */
  world: World<T>;
  /** Spawn a new entity into the world. */
  spawn: (entity: T) => T;
  /** Remove an entity from the world. */
  despawn: (entity: T) => void;
  /** Query for entities that have ALL of the specified components. */
  query: <K extends keyof T>(...components: K[]) => QueryResult<T>;
  /** Query for entities that DO NOT have ANY of the specified components. */
  queryWithout: <K extends keyof T>(...components: K[]) => QueryResult<T>;
  /** O(1) entity lookup by unique ID. */
  findById: (id: string) => T | undefined;
  /** Flat array of all entities currently in the world. */
  entities: T[];
  /** Total number of entities in the world. */
  size: number;
  /** Remove all entities and reset the world state. */
  clear: () => void;
}

/**
 * Utility type to extract component keys from an entity type.
 * @category Game Systems
 */
export type ComponentKeys<T> = keyof T;

/**
 * Utility type to extract required components from an entity type.
 * @category Game Systems
 */
export type RequiredComponents<T> = {
  [K in keyof T as undefined extends T[K] ? never : K]: T[K];
};

/**
 * Utility type to extract optional components from an entity type.
 * @category Game Systems
 */
export type OptionalComponents<T> = {
  [K in keyof T as undefined extends T[K] ? K : never]?: T[K];
};

/**
 * Archetype definition for common entity patterns.
 * @category Game Systems
 */
export interface Archetype<T extends BaseEntity> {
  /** Unique name for the archetype. */
  name: string;
  /** List of component keys that define this archetype. */
  components: (keyof T)[];
  /** Optional tags for filtering archetypes. */
  tags?: string[];
}

/**
 * System function signature for ECS logic updates.
 * @category Game Systems
 */
export type SystemFn<T extends BaseEntity> = (world: StrataWorld<T>, deltaTime: number) => void;

/**
 * System registration configuration.
 * @category Game Systems
 */
export interface SystemConfig<T extends BaseEntity> {
  /** Unique name for identifying the system. */
  name: string;
  /** The update function to be executed. */
  fn: SystemFn<T>;
  /** Execution priority. Lower values run first. Default: 0. */
  priority?: number;
  /** Whether the system is currently active. Default: true. */
  enabled?: boolean;
}
