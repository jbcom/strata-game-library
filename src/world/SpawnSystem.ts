import * as THREE from 'three';
import type { BaseEntity, StrataWorld, SystemFn } from '../core/ecs/types';
import type { Region, SpawnEntry } from './types';
import type { WorldGraph } from './WorldGraph';

export interface SpawnSystemEntity extends BaseEntity {
    regionId?: string;
    isSpawned?: boolean;
}

export interface SpawnSystemConfig {
    maxEntitiesPerRegion?: number;
    spawnInterval?: number; // seconds
}

/**
 * Creates a system that manages entity spawning within regions.
 * Uses region spawn tables to populate the world.
 *
 * @param worldGraph The world graph containing regions and spawn tables
 * @param config Configuration for spawn limits and frequency
 * @returns A system function for the ECS
 */
export function createSpawnSystem<T extends SpawnSystemEntity>(
    worldGraph: WorldGraph,
    config: SpawnSystemConfig = {}
): SystemFn<T> {
    const { maxEntitiesPerRegion = 20, spawnInterval = 5 } = config;

    let timeSinceLastSpawn = 0;

    return (world: StrataWorld<T>, deltaTime: number) => {
        timeSinceLastSpawn += deltaTime;
        if (timeSinceLastSpawn < spawnInterval) return;
        timeSinceLastSpawn = 0;

        // For each region, check if we need to spawn more entities
        for (const region of worldGraph.regions.values()) {
            if (
                !region.spawnTable ||
                (!region.spawnTable.creatures && !region.spawnTable.resources)
            )
                continue;

            // Count entities currently in this region
            // Use query to find entities with regionId and filter by specific region
            const entitiesInRegion = Array.from(world.query('regionId')).filter(
                (e) => e.regionId === region.id
            ).length;

            if (entitiesInRegion < maxEntitiesPerRegion) {
                // Try to spawn creatures or resources
                const spawnCreatures =
                    region.spawnTable.creatures && region.spawnTable.creatures.length > 0;
                const spawnResources =
                    region.spawnTable.resources && (region.spawnTable.resources as any).length > 0;

                let spawnType: 'creatures' | 'resources' | null = null;
                if (spawnCreatures && spawnResources) {
                    spawnType = Math.random() > 0.3 ? 'creatures' : 'resources';
                } else if (spawnCreatures) {
                    spawnType = 'creatures';
                } else if (spawnResources) {
                    spawnType = 'resources';
                }

                if (spawnType) {
                    const entries = region.spawnTable[spawnType] as SpawnEntry[] | undefined;
                    if (entries && entries.length > 0) {
                        const entry = selectRandomEntry(entries);
                        if (entry) {
                            spawnEntityAtRandomPosition(world, region, entry);
                        }
                    }
                }
            }
        }
    };
}

function selectRandomEntry(entries: SpawnEntry[]): SpawnEntry | null {
    const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;

    for (const entry of entries) {
        if (random < entry.weight) return entry;
        random -= entry.weight;
    }

    return entries[0] || null;
}

function spawnEntityAtRandomPosition<T extends SpawnSystemEntity>(
    world: StrataWorld<T>,
    region: Region,
    entry: SpawnEntry
): void {
    // Generate random position within region bounds
    const position = getRandomPositionInRegion(region);

    // Determine pack size
    const packSize = entry.packSize
        ? Math.floor(Math.random() * (entry.packSize[1] - entry.packSize[0] + 1)) +
          entry.packSize[0]
        : 1;

    for (let i = 0; i < packSize; i++) {
        // Offset for pack members
        const offset = new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2);

        // In a real game, we'd look up a factory or preset for the entity ID
        // For now, we just spawn a generic entity with the right tags
        world.spawn({
            regionId: region.id,
            isSpawned: true,
            type: entry.id,
            transform: {
                position: position.clone().add(offset),
                rotation: new THREE.Euler(0, Math.random() * Math.PI * 2, 0),
            },
        } as any);
    }
}

function getRandomPositionInRegion(region: Region): THREE.Vector3 {
    const { center, bounds } = region;
    const pos = center.clone();

    if (bounds.type === 'sphere') {
        const r = Math.random() * bounds.radius;
        const theta = Math.random() * Math.PI * 2;
        const _phi = Math.acos(2 * Math.random() - 1);

        // Simple 2D random for now if it's on terrain
        pos.x += r * Math.sin(theta);
        pos.z += r * Math.cos(theta);
    } else if (bounds.type === 'box') {
        pos.x += (Math.random() - 0.5) * bounds.size.x;
        pos.y += (Math.random() - 0.5) * bounds.size.y;
        pos.z += (Math.random() - 0.5) * bounds.size.z;
    }

    return pos;
}
