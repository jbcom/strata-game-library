/**
 * High-Performance Entity Component System (ECS).
 *
 * Powered by Miniplex, this module provides a reactive ECS architecture
 * optimized for managing complex game state and large numbers of entities.
 *
 * @packageDocumentation
 * @module core/ecs
 * @category Game Systems
 *
 * @example
 * ```typescript
 * const world = createWorld<MyEntity>();
 * const player = world.spawn({
 *   position: { x: 0, y: 0, z: 0 },
 *   health: 100
 * });
 * ```
 */

export { World } from 'miniplex';
export { default as createReactAPI } from 'miniplex-react';
export type { SystemScheduler, UseSystemOptions } from './systems';
export {
  combineSystems,
  conditionalSystem,
  createSystem,
  createSystemScheduler,
  useScheduler,
  useSystem,
  withTiming,
} from './systems';
export type {
  Archetype,
  BaseEntity,
  ComponentKeys,
  OptionalComponents,
  QueryResult,
  RequiredComponents,
  StrataWorld,
  SystemConfig,
  SystemFn,
  WorldConfig,
} from './types';
export {
  ARCHETYPES,
  addComponent,
  countEntities,
  createFromArchetype,
  createWorld,
  findEntityById,
  generateEntityId,
  hasComponents,
  removeComponent,
  resetEntityIdCounter,
} from './world';
