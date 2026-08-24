/**
 * World topology systems for defining and managing game world structure.
 *
 * Provides the WorldGraph for region-based world layout, connection management
 * for traversal between regions, region systems for spatial queries, and spawn
 * systems for populating regions with creatures and props.
 *
 * @module World
 * @category World Building
 */

export type {
  ConnectionSystemEntity,
  ConnectionSystemState,
  ModeManager,
} from './ConnectionSystem';
export { createConnectionSystem } from './ConnectionSystem';
export type { RegionSystemEntity, RegionSystemState } from './RegionSystem';
export { createRegionSystem } from './RegionSystem';
export type { SpawnSystemConfig, SpawnSystemEntity } from './SpawnSystem';
export { createSpawnSystem } from './SpawnSystem';
export type {
  BoundingShape,
  Connection,
  ConnectionDefinition,
  ConnectionType,
  LightingConfig,
  NPCSpawn,
  Region,
  RegionDefinition,
  ResourceEntry,
  SpawnEntry,
  SpawnTable,
  UnlockCondition,
  WorldGraphDefinition,
} from './types';
export { createWorldGraph, isWorldGraph, WorldGraph } from './WorldGraph';
