/**
 * Strata ECS module - Entity Component System powered by Miniplex.
 *
 * @module core/ecs
 * @public
 *
 * @example
 * ```typescript
 * import { createWorld, createSystemScheduler, World, useSystem } from '@jbcom/strata/core/ecs';
 *
 * interface GameEntity extends BaseEntity {
 *   position: { x: number; y: number; z: number };
 *   velocity?: { x: number; y: number; z: number };
 * }
 *
 * const world = createWorld<GameEntity>();
 * const player = world.spawn({ position: { x: 0, y: 0, z: 0 } });
 *
 * // In a React component:
 * function GameSystem() {
 *   const movementSystem = createSystem<GameEntity>(
 *     ['position', 'velocity'],
 *     (entity, delta) => {
 *       entity.position.x += entity.velocity!.x * delta;
 *     }
 *   );
 *   useSystem(world, movementSystem);
 *   return null;
 * }
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
