import type * as THREE from 'three';
import type { BaseEntity, StrataWorld, SystemFn } from '../core/ecs/types';
import type { GameStoreApi } from '../core/state/types';
import type { Region } from './types';
import type { WorldGraph } from './WorldGraph';

export interface RegionSystemEntity extends BaseEntity {
  isPlayer?: boolean;
  transform?: {
    position: THREE.Vector3;
  };
}

export interface RegionSystemState {
  currentRegion?: string;
  currentBiome?: string;
}

/**
 * Creates a system that tracks which region the player is currently in.
 * Updates the current region and biome in the game state.
 *
 * @param worldGraph The world graph containing regions and connections
 * @param gameStore The game store to update with region state
 * @returns A system function for the ECS
 */
export function createRegionSystem<T extends RegionSystemEntity>(
  worldGraph: WorldGraph,
  gameStore: GameStoreApi<RegionSystemState & any>
): SystemFn<T> {
  let currentRegion: Region | null = null;

  return (world: StrataWorld<T>, _deltaTime: number) => {
    // 1. Find the player entity
    let player: any = null;
    for (const entity of world.query('isPlayer' as any, 'transform' as any)) {
      player = entity;
      break;
    }
    if (!player || !player.transform) return;

    // 2. Get the region at player's position
    const newRegion = worldGraph.getRegionAt(player.transform.position);

    // 3. Handle region transitions
    if (newRegion && newRegion.id !== currentRegion?.id) {
      const oldRegion = currentRegion;
      currentRegion = newRegion;

      // Emit change event
      if (oldRegion) {
        worldGraph.emit('regionChange', oldRegion, newRegion);
      }

      // Handle discovery
      if (!newRegion.discovered) {
        worldGraph.discoverRegion(newRegion.id);
      } else {
        newRegion.visitCount++;
      }

      // Update game state
      gameStore.getState().patch({
        currentRegion: newRegion.id,
        currentBiome: newRegion.biome,
      });
    }
  };
}
