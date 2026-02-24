/**
 * High-Performance Entity Component System (ECS).
 *
 * Powered by Miniplex, this module provides a reactive ECS architecture
 * optimized for managing complex game state and large numbers of entities.
 *
 * For React hooks (useSystem, useScheduler) and React bindings (createReactAPI),
 * use @strata-game-library/r3f.
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
export type { SystemScheduler } from './systems';
export {
  combineSystems,
  conditionalSystem,
  createSystem,
  createSystemScheduler,
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
