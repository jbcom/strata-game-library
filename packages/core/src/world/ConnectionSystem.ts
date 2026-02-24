import type * as THREE from 'three';
import type { BaseEntity, StrataWorld, SystemFn } from '../core/ecs/types';
import type { GameStoreApi } from '../core/state/types';
import type { UnlockCondition } from './types';
import type { WorldGraph } from './WorldGraph';

export interface ConnectionSystemEntity extends BaseEntity {
  isPlayer?: boolean;
  transform?: {
    position: THREE.Vector3;
  };
}

export interface ConnectionSystemState {
  currentRegion?: string;
}

export interface ModeManager {
  push(modeId: string, props?: Record<string, unknown>): void;
}

/**
 * Creates a system that handles world graph connections and traversal.
 * Detects when the player is near a connection point and handles unlocking/traversal.
 *
 * @param worldGraph The world graph containing regions and connections
 * @param gameStore The game store to get current region from
 * @param modeManager The mode manager to trigger traversal modes
 * @returns A system function for the ECS
 */
/** Entity with a level field, used for level-gated unlock conditions. */
interface LeveledEntity {
  level?: number;
  inventory?: string[];
  lastTeleportTime?: number;
  [key: string]: unknown;
}

export function createConnectionSystem<T extends ConnectionSystemEntity>(
  worldGraph: WorldGraph,
  gameStore: GameStoreApi<ConnectionSystemState & Record<string, unknown>>,
  modeManager?: ModeManager
): SystemFn<T> {
  const TRIGGER_RADIUS = 5;

  return (world: StrataWorld<T>, _deltaTime: number) => {
    // 1. Find the player entity
    let player: (T & LeveledEntity) | null = null;
    for (const entity of world.query('isPlayer' as keyof T, 'transform' as keyof T)) {
      player = entity as T & LeveledEntity;
      break;
    }
    if (!player || !player.transform) return;

    // 2. Get current region from game state
    const currentRegionId = gameStore.getState().data.currentRegion;
    if (!currentRegionId) return;

    const currentRegion = worldGraph.getRegion(currentRegionId);
    if (!currentRegion) return;

    // 3. Check all connections from the current region
    for (const connection of worldGraph.getConnections(currentRegion.id)) {
      const distance = player.transform.position.distanceTo(connection.fromPosition);

      if (distance < TRIGGER_RADIUS) {
        if (!connection.unlocked) {
          // Check unlock condition
          if (checkUnlockCondition(connection.unlockCondition, player)) {
            if (connection.traversalMode && modeManager) {
              // Trigger traversal mode
              modeManager.push(connection.traversalMode, {
                connection,
                onComplete: (success: boolean) => {
                  if (success) {
                    worldGraph.unlockConnection(connection.id);
                    // Teleport to destination
                    if (player.transform) {
                      player.transform.position.copy(connection.toPosition);
                    }
                  }
                },
              });
            } else if (!connection.traversalMode) {
              // No mode required, just unlock and teleport (or wait for interaction)
              // For now, let's just unlock
              worldGraph.unlockConnection(connection.id);
            }
          }
        } else {
          // Connection is already unlocked
          // In a real game, we might show a travel prompt here
          // For now, if it's a portal, just teleport
          if (connection.type === 'portal') {
            // Add cooldown to prevent infinite teleportation
            const now = Date.now();
            const lastTeleport = player.lastTeleportTime ?? 0;
            if (now - lastTeleport > 1000) {
              // 1 second cooldown
              player.transform.position.copy(connection.toPosition);
              player.lastTeleportTime = now;
            }
          }
        }
      }
    }
  };
}

/**
 * Simple helper to check if an unlock condition is met.
 */
function checkUnlockCondition(
  condition: UnlockCondition | undefined,
  player: LeveledEntity
): boolean {
  if (!condition || condition.type === 'default') return true;

  switch (condition.type) {
    case 'level':
      return (player.level ?? 0) >= condition.minLevel;
    case 'key':
      return player.inventory?.includes(condition.itemId) ?? false;
    case 'custom':
      return condition.check(player);
    default:
      // Other conditions might need more complex checks (quests, faction, etc.)
      return false;
  }
}
