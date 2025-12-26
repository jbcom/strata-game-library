/**
 * High-Performance ECS World Factory and Entity Management
 *
 * Entity Component System implementation powered by Miniplex. Provides blazing-fast
 * entity queries, reactive component tracking, and O(1) entity lookup by ID. Designed
 * for managing thousands of game entities at 60fps.
 *
 * @packageDocumentation
 * @module core/ecs/world
 * @category Game Systems
 *
 * ## Key Features
 * - ⚡ **High Performance**: O(1) entity lookup, reactive queries via Miniplex
 * - 🎯 **Type-Safe**: Full TypeScript support with component validation
 * - 🔍 **Flexible Queries**: Query entities by components they have or lack
 * - 🏗️ **Archetypes**: Pre-defined entity patterns for common game objects
 * - 📊 **Efficient Counting**: O(1) entity counting via Miniplex archetypes
 *
 * @example
 * ```typescript
 * // Define your entity type
 * interface GameEntity extends BaseEntity {
 *   position?: { x: number; y: number; z: number };
 *   velocity?: { x: number; y: number; z: number };
 *   health?: number;
 *   mesh?: THREE.Mesh;
 * }
 *
 * // Create a world
 * const world = createWorld<GameEntity>({
 *   maxEntities: 10000,
 *   enableLogging: true
 * });
 *
 * // Spawn entities
 * const player = world.spawn({
 *   position: { x: 0, y: 0, z: 0 },
 *   velocity: { x: 0, y: 0, z: 0 },
 *   health: 100
 * });
 *
 * // Query entities with specific components
 * for (const entity of world.query('position', 'velocity')) {
 *   entity.position.x += entity.velocity.x;
 * }
 *
 * // O(1) lookup by ID
 * const found = world.findById(player.id!);
 * ```
 */

import { World } from 'miniplex';
import type { Archetype, BaseEntity, QueryResult, StrataWorld, WorldConfig } from './types';

let entityIdCounter = 0;

/**
 * Generates a unique entity ID.
 *
 * Auto-incremented counter-based ID generation. IDs are unique within
 * a single application session. Use `resetEntityIdCounter()` for testing.
 *
 * @category Game Systems
 * @returns A unique string identifier in format "entity_{number}".
 *
 * @example
 * ```typescript
 * const id1 = generateEntityId(); // "entity_1"
 * const id2 = generateEntityId(); // "entity_2"
 * ```
 */
export function generateEntityId(): string {
    return `entity_${++entityIdCounter}`;
}

/**
 * Resets the entity ID counter. Useful for testing.
 *
 * Resets the internal counter to 0, so the next generated ID will be "entity_1".
 * Only use this in test environments to ensure deterministic entity IDs.
 *
 * @category Game Systems
 *
 * @example
 * ```typescript
 * // In test setup
 * beforeEach(() => {
 *   resetEntityIdCounter();
 * });
 * ```
 */
export function resetEntityIdCounter(): void {
    entityIdCounter = 0;
}

/**
 * Creates a new Strata ECS world with enhanced utilities.
 *
 * Factory function for creating a complete ECS world instance. Wraps Miniplex with
 * additional utilities like O(1) entity lookup by ID, entity counting, and lifecycle
 * management. Supports optional configuration for debugging and entity limits.
 *
 * @category Game Systems
 * @param config - Optional configuration for the world.
 * @param config.enableLogging - Enable debug logging for spawn/despawn events.
 * @param config.maxEntities - Maximum number of entities allowed (throws on exceed).
 * @param config.initialEntities - Array of entities to spawn immediately.
 * @returns A StrataWorld instance with entity management utilities.
 * @throws {Error} When maxEntities is exceeded during spawn operations.
 *
 * @example
 * ```typescript
 * // Basic world
 * const world = createWorld<MyEntity>();
 * ```
 *
 * @example
 * ```typescript
 * // World with limits and logging
 * const world = createWorld<GameEntity>({
 *   maxEntities: 1000,
 *   enableLogging: true,
 *   initialEntities: [
 *     { position: { x: 0, y: 0, z: 0 }, health: 100 }
 *   ]
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using the world
 * const player = world.spawn({ health: 100, position: { x: 0, y: 0, z: 0 } });
 * const enemies = world.query('enemy', 'position');
 * const found = world.findById(player.id!);
 * world.despawn(player);
 * console.log('Total entities:', world.size);
 * ```
 */
export function createWorld<T extends BaseEntity>(config: WorldConfig<T> = {}): StrataWorld<T> {
    const miniplexWorld = new World<T>();
    const { enableLogging = false, maxEntities, initialEntities = [] } = config;

    // O(1) entity lookup by ID - updated on spawn/despawn/clear
    const entitiesById = new Map<string, T>();

    const log = (msg: string) => {
        if (enableLogging) console.debug(`[Strata ECS] ${msg}`);
    };

    const spawn = (entity: T): T => {
        if (maxEntities && miniplexWorld.entities.length >= maxEntities) {
            throw new Error(`Maximum entity limit (${maxEntities}) reached`);
        }
        const e: T = { ...entity, id: entity.id ?? generateEntityId() };
        miniplexWorld.add(e);
        if (e.id) {
            entitiesById.set(e.id, e);
        }
        log(`Spawned entity: ${e.id}`);
        return e;
    };

    const despawn = (entity: T): void => {
        miniplexWorld.remove(entity);
        if (entity.id) entitiesById.delete(entity.id);
        log(`Despawned entity: ${entity.id}`);
    };

    const query = <K extends keyof T>(...c: K[]): QueryResult<T> =>
        miniplexWorld.with(...c) as QueryResult<T>;

    const queryWithout = <K extends keyof T>(...c: K[]): QueryResult<T> =>
        miniplexWorld.without(...c) as QueryResult<T>;

    const clear = (): void => {
        for (const e of [...miniplexWorld.entities]) {
            miniplexWorld.remove(e);
        }
        entitiesById.clear();
        log('Cleared all entities');
    };

    /**
     * O(1) entity lookup by ID.
     * @param id - The entity ID to find
     * @returns The entity if found, undefined otherwise
     */
    const findById = (id: string): T | undefined => entitiesById.get(id);

    for (const entity of initialEntities) spawn(entity);

    return {
        world: miniplexWorld,
        spawn,
        despawn,
        query,
        queryWithout,
        findById,
        get entities() {
            return miniplexWorld.entities as T[];
        },
        get size() {
            return miniplexWorld.entities.length;
        },
        clear,
    };
}

/**
 * Creates an entity that matches a specific archetype.
 *
 * Type-safe entity creation using pre-defined archetypes. Validates that all
 * required components are present and generates an ID if not provided.
 *
 * @category Game Systems
 * @param archetype - The archetype definition with required components.
 * @param components - The component values for the entity.
 * @returns A new entity matching the archetype.
 * @throws {Error} If any required archetype components are missing.
 *
 * @example
 * ```typescript
 * // Using built-in archetypes
 * const movable = createFromArchetype(
 *   ARCHETYPES.MOVABLE,
 *   {
 *     position: { x: 0, y: 0, z: 0 },
 *     velocity: { x: 1, y: 0, z: 0 }
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Custom archetype
 * const PLAYER_ARCHETYPE: Archetype<GameEntity> = {
 *   name: 'player',
 *   components: ['position', 'health', 'inventory'],
 *   tags: ['player', 'combat']
 * };
 *
 * const player = createFromArchetype(PLAYER_ARCHETYPE, {
 *   position: { x: 0, y: 0, z: 0 },
 *   health: 100,
 *   inventory: []
 * });
 * ```
 */
export function createFromArchetype<T extends BaseEntity>(
    archetype: Archetype<T>,
    components: Partial<T>
): T {
    for (const key of archetype.components) {
        // Check both presence and non-undefined value for consistency with hasComponents
        if (!(key in components) || components[key] === undefined)
            throw new Error(`Archetype '${archetype.name}' requires component '${String(key)}'`);
    }
    // Use nullish coalescing to ensure components.id=undefined doesn't overwrite the generated ID
    const id = components.id ?? generateEntityId();
    return { ...components, id } as T;
}

/**
 * Common game entity archetypes for quick entity creation.
 *
 * Pre-defined entity patterns for typical game objects. Each archetype specifies
 * required components and optional tags for categorization.
 *
 * @category Game Systems
 *
 * @example
 * ```typescript
 * // Create a movable entity
 * const entity = createFromArchetype(
 *   ARCHETYPES.MOVABLE,
 *   { position: { x: 0, y: 0, z: 0 }, velocity: { x: 1, y: 0, z: 0 } }
 * );
 *
 * // Create a renderable entity
 * const visual = createFromArchetype(
 *   ARCHETYPES.RENDERABLE,
 *   { position: { x: 0, y: 0, z: 0 }, mesh: myMesh }
 * );
 * ```
 */
export const ARCHETYPES = {
    MOVABLE: { name: 'movable', components: ['position', 'velocity'] as const, tags: ['physics'] },
    RENDERABLE: {
        name: 'renderable',
        components: ['position', 'mesh'] as const,
        tags: ['graphics'],
    },
    LIVING: { name: 'living', components: ['health'] as const, tags: ['combat'] },
    INTERACTIVE: {
        name: 'interactive',
        components: ['position', 'collider'] as const,
        tags: ['physics', 'interaction'],
    },
} as const;

/**
 * Checks if an entity has all specified components.
 *
 * Type-safe component validation. Checks both presence and non-undefined value
 * for each component key.
 *
 * @category Game Systems
 * @param entity - The entity to check.
 * @param components - Component keys to check for.
 * @returns True if entity has all components with non-undefined values.
 *
 * @example
 * ```typescript
 * const entity = { position: { x: 0, y: 0, z: 0 }, health: 100 };
 *
 * if (hasComponents(entity, 'position', 'health')) {
 *   // TypeScript knows entity has position and health
 *   console.log(`Health: ${entity.health}`);
 * }
 * ```
 */
export function hasComponents<T extends BaseEntity>(
    entity: T,
    ...components: (keyof T)[]
): boolean {
    return components.every((key) => key in entity && entity[key] !== undefined);
}

/**
 * Adds a component to an existing entity.
 *
 * Dynamically adds a component at runtime. The entity will immediately match
 * any queries that require this component. Uses Miniplex's reactive system.
 *
 * @category Game Systems
 * @param world - The Strata world.
 * @param entity - The entity to modify.
 * @param component - The component key to add.
 * @param value - The component value.
 *
 * @example
 * ```typescript
 * const entity = world.spawn({ position: { x: 0, y: 0, z: 0 } });
 *
 * // Add health component later
 * addComponent(world, entity, 'health', 100);
 *
 * // Now entity matches queries for 'health'
 * for (const e of world.query('health')) {
 *   console.log(e.health); // entity is included
 * }
 * ```
 */
export function addComponent<T extends BaseEntity, K extends keyof T>(
    world: StrataWorld<T>,
    entity: T,
    component: K,
    value: T[K]
): void {
    world.world.addComponent(entity, component, value);
}

/**
 * Removes a component from an existing entity.
 *
 * Dynamically removes a component at runtime. The entity will no longer match
 * queries that require this component. Uses Miniplex's reactive system.
 *
 * @category Game Systems
 * @param world - The Strata world.
 * @param entity - The entity to modify.
 * @param component - The component key to remove.
 *
 * @example
 * ```typescript
 * const entity = world.spawn({
 *   position: { x: 0, y: 0, z: 0 },
 *   health: 100
 * });
 *
 * // Remove health component (entity is now invulnerable)
 * removeComponent(world, entity, 'health');
 *
 * // Entity no longer matches 'health' queries
 * for (const e of world.query('health')) {
 *   // entity is NOT included
 * }
 * ```
 */
export function removeComponent<T extends BaseEntity, K extends keyof T>(
    world: StrataWorld<T>,
    entity: T,
    component: K
): void {
    world.world.removeComponent(entity, component);
}

/**
 * Finds an entity by its ID.
 *
 * O(1) lookup when using StrataWorld's internal Map, falls back to O(n) linear
 * search for backwards compatibility. Always use this over manual iteration.
 *
 * @category Game Systems
 * @param world - The Strata world.
 * @param id - The entity ID to find.
 * @returns The entity if found, undefined otherwise.
 *
 * @example
 * ```typescript
 * const player = world.spawn({ health: 100 });
 * const playerId = player.id!;
 *
 * // Later, find by ID
 * const found = findEntityById(world, playerId);
 * if (found) {
 *   console.log('Player health:', found.health);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Store ID in a component for cross-entity references
 * interface Follower {
 *   targetId: string;
 * }
 *
 * for (const follower of world.query('follower', 'targetId')) {
 *   const target = findEntityById(world, follower.targetId);
 *   if (target) {
 *     // Follow target's position
 *   }
 * }
 * ```
 */
export function findEntityById<T extends BaseEntity>(
    world: StrataWorld<T>,
    id: string
): T | undefined {
    // Use O(1) lookup if available (preferred)
    if (world.findById) {
        return world.findById(id);
    }
    // Fallback to O(n) for backwards compatibility
    return world.entities.find((e) => e.id === id);
}

/**
 * Counts entities matching a specific query.
 *
 * O(1) counting via Miniplex archetype size property when available.
 * Much faster than manually iterating and counting.
 *
 * @category Game Systems
 * @param world - The Strata world.
 * @param components - Component keys to query.
 * @returns Number of matching entities.
 *
 * @example
 * ```typescript
 * // Count all enemies
 * const enemyCount = countEntities(world, 'enemy');
 * console.log(`${enemyCount} enemies remaining`);
 * ```
 *
 * @example
 * ```typescript
 * // Count entities with multiple components
 * const movableCount = countEntities(world, 'position', 'velocity');
 *
 * // vs slower manual counting:
 * // let count = 0;
 * // for (const _ of world.query('position', 'velocity')) count++;
 * ```
 */
export function countEntities<T extends BaseEntity>(
    world: StrataWorld<T>,
    ...components: (keyof T)[]
): number {
    const result = world.query(...components);
    // Use O(1) size property from Miniplex archetype if available
    if ('size' in result && typeof result.size === 'number') {
        return result.size;
    }
    // Fallback to iteration (should not be needed with Miniplex)
    let count = 0;
    for (const _ of result) count++;
    return count;
}
