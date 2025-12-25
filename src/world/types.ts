import type * as THREE from 'three';
import type { WeatherStateConfig } from '../core/weather';
import type { BiomeType } from '../utils/texture-loader';
import type { GameMode } from '../game/types';

/**
 * World Topology Type Definitions
 */

export type BoundingShape =
    | { type: 'sphere'; radius: number }
    | { type: 'box'; size: THREE.Vector3 }
    | { type: 'cylinder'; radius: number; height: number }
    | { type: 'polygon'; vertices: THREE.Vector2[]; height: number };

export interface SpawnEntry {
    id: string;
    weight: number;
    packSize?: [number, number];
}

export interface ResourceEntry {
    id: string;
    weight: number;
}

export interface NPCSpawn {
    id: string;
    position: THREE.Vector3;
    rotation?: number;
}

export interface SpawnTable {
    creatures?: SpawnEntry[];
    resources?: ResourceEntry[];
}

export interface LightingConfig {
    ambientColor?: string;
    ambientIntensity?: number;
    sunDirection?: [number, number, number];
    sunColor?: string;
    sunIntensity?: number;
    fogColor?: string;
    fogDensity?: number;
}

export interface Region {
    id: string;
    name: string;
    type: 'biome' | 'dungeon' | 'building' | 'zone' | 'room';

    // Spatial definition
    center: THREE.Vector3;
    bounds: BoundingShape;

    // Gameplay
    biome?: BiomeType;
    difficulty: number;
    level?: number;

    // Content
    spawnTable?: SpawnTable;
    resources?: SpawnTable; // RFC uses ResourceTable, but let's stick to SpawnTable or similar
    npcs?: NPCSpawn[];

    // Atmosphere
    ambientAudio?: string;
    music?: string;
    weather?: WeatherStateConfig;
    lighting?: LightingConfig;

    // State (persisted)
    discovered: boolean;
    visitCount: number;
    completedObjectives?: string[];
}

export type ConnectionType =
    | 'path' // Walking path, always traversable
    | 'door' // Requires interaction, may require key
    | 'portal' // Teleporter, instant travel
    | 'waterway' // River/stream, may require swimming/racing
    | 'ladder' // Vertical traversal
    | 'bridge' // May be destroyable/raisable
    | 'gap' // Requires jumping or flying
    | 'elevator' // Mechanical vertical transport
    | 'custom'; // Custom traversal logic

export type UnlockCondition =
    | { type: 'default' }
    | { type: 'first_traverse'; mode: GameMode }
    | { type: 'key'; itemId: string; consumable?: boolean }
    | { type: 'quest'; questId: string }
    | { type: 'level'; minLevel: number }
    | { type: 'reputation'; faction: string; minRep: number }
    | { type: 'ability'; abilityId: string }
    | { type: 'time'; timeRange: [number, number] }
    | { type: 'custom'; check: (entity: any) => boolean };

export interface Connection {
    id: string;
    from: string; // Region ID
    to: string; // Region ID

    type: ConnectionType;

    // Spatial
    fromPosition: THREE.Vector3; // Entry point in 'from' region
    toPosition: THREE.Vector3; // Exit point in 'to' region
    path?: THREE.Vector3[]; // Optional path visualization

    // Traversal
    bidirectional: boolean;
    traversalMode?: GameMode;
    traversalConfig?: object;

    // Progression
    unlocked: boolean;
    unlockCondition?: UnlockCondition;

    // Visuals
    visualType?: 'none' | 'path' | 'river' | 'door' | 'portal';
    visualConfig?: object;
}

export interface WorldGraphDefinition {
    regions: Record<string, RegionDefinition>;
    connections: ConnectionDefinition[];
    startRegion?: string;
}

export interface RegionDefinition {
    name: string;
    type?: 'biome' | 'dungeon' | 'building' | 'zone' | 'room';
    center: [number, number, number];
    radius?: number; // For sphere bounds
    size?: [number, number, number]; // For box bounds
    biome?: BiomeType;
    difficulty?: number;
    level?: number;
    spawnTable?: SpawnTable;
    ambientAudio?: string;
    music?: string;
}

export interface ConnectionDefinition {
    id?: string;
    from: string;
    to: string;
    type: ConnectionType;
    fromPosition?: [number, number, number];
    toPosition?: [number, number, number];
    traversalMode?: GameMode;
    unlockCondition?: UnlockCondition;
    bidirectional?: boolean;
}
