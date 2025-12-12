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

export type {
    BaseEntity,
    WorldConfig,
    StrataWorld,
    QueryResult,
    ComponentKeys,
    RequiredComponents,
    OptionalComponents,
    Archetype,
    SystemFn,
    SystemConfig,
} from './types';

export {
    createWorld,
    createFromArchetype,
    generateEntityId,
    resetEntityIdCounter,
    hasComponents,
    addComponent,
    removeComponent,
    findEntityById,
    countEntities,
    ARCHETYPES,
} from './world';

export type { SystemScheduler, UseSystemOptions } from './systems';
export {
    createSystemScheduler,
    createSystem,
    withTiming,
    combineSystems,
    conditionalSystem,
    useSystem,
    useScheduler,
} from './systems';
