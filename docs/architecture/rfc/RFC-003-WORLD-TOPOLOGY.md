---
title: "RFC-003: World Topology System"
description: "Regions, connections, navigation, and procedural world generation"
status: active
implementation: 70
last_updated: 2026-03-01
area: rfc
---

# RFC-003: World Topology System

> **Status**: Proposed
> **Issue**: [#53](https://github.com/jbcom/strata-game-library/issues/53)
> **Epic**: [#50](https://github.com/jbcom/strata-game-library/issues/50)

## Summary

This RFC proposes a world topology layer that defines regions, connections, and navigation for game worlds.

## Motivation

Games have spatial structure beyond raw coordinates:

- A marsh connects to a forest via a river
- A dungeon has rooms connected by corridors
- A city has districts connected by streets

Currently, developers must implement this topology manually. The World Topology System provides:

1. **Declarative world definition** - Define regions and connections as data
2. **Navigation** - Pathfind across the world graph
3. **Progression** - Unlock connections through gameplay
4. **Procedural support** - Generate world topology algorithmically

## The Rivermarsh Example

```
    ┌─────────┐         ┌─────────┐         ┌──────────┐
    │ FOREST  │←─River─→│  MARSH  │←─River─→│ MOUNTAIN │
    └────┬────┘         └────┬────┘         └────┬─────┘
         │                   │                   │
      River D             River C             River E
         │                   │                   │
         ↓                   ↓                   ↓
    ┌─────────┐         ┌─────────┐         ┌─────────┐
    │ DESERT  │         │ SAVANNA │         │ TUNDRA  │
    └─────────┘         └─────────┘         └─────────┘
```

Rivers are **connections** that:

1. **Can be traversed** - Triggers racing mini-game
2. **Have unlock state** - First crossing unlocks fast travel
3. **Affect gameplay** - River difficulty, weather effects

## Detailed Design

### Region

```typescript
interface Region {
  id: string;
  name: string;
  type: 'biome' | 'dungeon' | 'building' | 'zone' | 'room';
  
  // Spatial definition
  center: Vector3;
  bounds: BoundingShape;
  
  // Gameplay
  biome?: BiomeType;         // For biome regions
  difficulty: number;         // 1-10 scale
  level?: number;             // Minimum player level
  
  // Content
  spawnTable?: SpawnTable;    // What spawns here
  resources?: ResourceTable;  // Harvestable resources
  npcs?: NPCSpawn[];         // Fixed NPC locations
  
  // Atmosphere
  ambientAudio?: string;
  music?: string;
  weather?: WeatherPreset;
  lighting?: LightingPreset;
  
  // State (persisted)
  discovered: boolean;
  visitCount: number;
  completedObjectives?: string[];
}

type BoundingShape = 
  | { type: 'sphere'; radius: number; }
  | { type: 'box'; size: Vector3; }
  | { type: 'cylinder'; radius: number; height: number; }
  | { type: 'polygon'; vertices: Vector2[]; height: number; };
```

### Connection

```typescript
interface Connection {
  id: string;
  from: string;              // Region ID
  to: string;                // Region ID
  
  // Type determines traversal
  type: ConnectionType;
  
  // Spatial
  fromPosition: Vector3;     // Entry point in 'from' region
  toPosition: Vector3;       // Exit point in 'to' region
  path?: Vector3[];          // Optional path visualization
  
  // Traversal
  bidirectional: boolean;
  traversalMode?: GameMode;  // Mode to enter for traversal
  traversalConfig?: object;  // Mode-specific configuration
  
  // Progression
  unlocked: boolean;
  unlockCondition?: UnlockCondition;
  
  // Visuals
  visualType?: 'none' | 'path' | 'river' | 'door' | 'portal';
  visualConfig?: object;
}

type ConnectionType = 
  | 'path'       // Walking path, always traversable
  | 'door'       // Requires interaction, may require key
  | 'portal'     // Teleporter, instant travel
  | 'waterway'   // River/stream, may require swimming/racing
  | 'ladder'     // Vertical traversal
  | 'bridge'     // May be destroyable/raisable
  | 'gap'        // Requires jumping or flying
  | 'elevator'   // Mechanical vertical transport
  | 'custom';    // Custom traversal logic

type UnlockCondition = 
  | { type: 'default'; }                                    // Always unlocked
  | { type: 'first_traverse'; mode: GameMode; }            // Complete mode once
  | { type: 'key'; itemId: string; consumable?: boolean; } // Requires item
  | { type: 'quest'; questId: string; }                    // Requires quest
  | { type: 'level'; minLevel: number; }                   // Requires level
  | { type: 'reputation'; faction: string; minRep: number; }
  | { type: 'ability'; abilityId: string; }                // Requires ability
  | { type: 'time'; timeRange: [number, number]; }         // Time-locked
  | { type: 'custom'; check: () => boolean; };             // Custom function
```

### WorldGraph

```typescript
interface WorldGraph {
  // Data
  regions: Map<string, Region>;
  connections: Connection[];
  
  // Region queries
  getRegion(id: string): Region | undefined;
  getRegionAt(position: Vector3): Region | undefined;
  getAdjacentRegions(regionId: string): Region[];
  
  // Connection queries
  getConnections(regionId: string): Connection[];
  getConnection(fromId: string, toId: string): Connection | undefined;
  getUnlockedConnections(regionId: string): Connection[];
  
  // Navigation
  findPath(from: string, to: string): string[] | null;
  getDistance(from: string, to: string): number;
  isReachable(from: string, to: string): boolean;
  
  // State
  discoverRegion(id: string): void;
  unlockConnection(id: string): void;
  
  // Events
  on(event: 'regionChange', handler: (from: Region, to: Region) => void): void;
  on(event: 'regionDiscovered', handler: (region: Region) => void): void;
  on(event: 'connectionUnlocked', handler: (connection: Connection) => void): void;
}
```

### WorldGraph Factory

```typescript
function createWorldGraph(definition: WorldGraphDefinition): WorldGraph;

interface WorldGraphDefinition {
  regions: Record<string, RegionDefinition>;
  connections: ConnectionDefinition[];
  startRegion?: string;
}

// Shorter definition format
interface RegionDefinition {
  name: string;
  type?: 'biome' | 'dungeon' | 'building' | 'zone';
  center: [number, number, number];
  radius?: number;            // For sphere bounds
  size?: [number, number, number];  // For box bounds
  biome?: BiomeType;
  difficulty?: number;
  // ... other optional fields
}

interface ConnectionDefinition {
  id?: string;                // Auto-generated if not provided
  from: string;
  to: string;
  type: ConnectionType;
  fromPosition?: [number, number, number];
  toPosition?: [number, number, number];
  traversalMode?: GameMode;
  unlockCondition?: UnlockCondition;
}
```

### Usage Example

```typescript
const rivermarshWorld = createWorldGraph({
  regions: {
    marsh: {
      name: 'The Marsh',
      center: [0, 0, 0],
      radius: 50,
      biome: 'marsh',
      difficulty: 1,
    },
    forest: {
      name: 'Whispering Woods',
      center: [100, 10, 0],
      radius: 60,
      biome: 'forest',
      difficulty: 2,
    },
    mountain: {
      name: 'Stormcrest Peaks',
      center: [200, 50, 0],
      radius: 70,
      biome: 'mountain',
      difficulty: 4,
    },
  },
  
  connections: [
    {
      from: 'marsh',
      to: 'forest',
      type: 'waterway',
      fromPosition: [25, 0, 0],
      toPosition: [75, 5, 0],
      traversalMode: 'racing',
      unlockCondition: { type: 'first_traverse', mode: 'racing' },
    },
    {
      from: 'forest',
      to: 'mountain',
      type: 'path',
      fromPosition: [130, 15, 0],
      toPosition: [160, 30, 0],
      unlockCondition: { type: 'level', minLevel: 5 },
    },
  ],
  
  startRegion: 'marsh',
});
```

### RegionSystem

```typescript
function createRegionSystem(worldGraph: WorldGraph): SystemFn {
  let currentRegion: Region | null = null;
  
  return (world, delta) => {
    const player = world.query('isPlayer', 'transform').first;
    if (!player) return;
    
    const newRegion = worldGraph.getRegionAt(player.transform.position);
    
    if (newRegion && newRegion !== currentRegion) {
      const oldRegion = currentRegion;
      currentRegion = newRegion;
      
      // Emit change event
      if (oldRegion) {
        worldGraph.emit('regionChange', oldRegion, newRegion);
      }
      
      // Handle discovery
      if (!newRegion.discovered) {
        newRegion.discovered = true;
        newRegion.visitCount = 1;
        worldGraph.emit('regionDiscovered', newRegion);
      } else {
        newRegion.visitCount++;
      }
      
      // Update game state
      useGameStore.setState({ 
        currentRegion: newRegion.id,
        currentBiome: newRegion.biome,
      });
    }
  };
}
```

### ConnectionSystem

```typescript
function createConnectionSystem(worldGraph: WorldGraph, modeManager: ModeManager): SystemFn {
  const TRIGGER_RADIUS = 5;
  
  return (world, delta) => {
    const player = world.query('isPlayer', 'transform').first;
    if (!player) return;
    
    // Get current region from global store (set by createRegionSystem)
    const currentRegionId = useGameStore.getState().currentRegion;
    if (!currentRegionId) return;
    
    const currentRegion = worldGraph.getRegion(currentRegionId);
    if (!currentRegion) return;
    
    for (const connection of worldGraph.getConnections(currentRegion.id)) {
      const distance = player.transform.position.distanceTo(connection.fromPosition);
      
      if (distance < TRIGGER_RADIUS) {
        if (!connection.unlocked) {
          // Check unlock condition
          if (checkUnlockCondition(connection.unlockCondition, player)) {
            if (connection.traversalMode) {
              // Trigger traversal mode
              modeManager.push(connection.traversalMode, {
                connection,
                onComplete: (success: boolean) => {
                  if (success) {
                    worldGraph.unlockConnection(connection.id);
                    // Teleport to destination
                    player.transform.position.copy(connection.toPosition);
                  }
                },
              });
            }
          }
        } else {
          // Offer fast travel
          showTravelPrompt(connection, player);
        }
      }
    }
  };
}
```

## Procedural World Generation

```typescript
interface ProceduralWorldConfig {
  regionCount: number;
  connectionDensity: number;  // 0-1
  biomeDistribution: Record<BiomeType, number>;
  difficultyProgression: 'linear' | 'radial' | 'random';
  startBiome: BiomeType;
}

function generateWorldGraph(config: ProceduralWorldConfig): WorldGraph {
  // 1. Generate region positions
  const regionPositions = generatePoissonDiskPoints(config.regionCount, MIN_DISTANCE);
  
  // 2. Assign biomes based on distribution
  const regions = assignBiomes(regionPositions, config.biomeDistribution);
  
  // 3. Generate connections using Delaunay triangulation
  const connections = generateConnections(regions, config.connectionDensity);
  
  // 4. Assign difficulty based on distance from start
  assignDifficulty(regions, config.startBiome, config.difficultyProgression);
  
  return createWorldGraph({ regions, connections });
}
```

## Integration

### With Game Orchestration

```typescript
// Region change triggers mode transitions
worldGraph.on('regionChange', (from, to) => {
  if (to.type === 'dungeon') {
    modeManager.push('dungeon', { region: to });
  }
});

// Connection traversal uses mode manager
// Connection system uses modeManager.push()
```

### With State Management

```typescript
// World state persists
const worldState = useSaveLoad({
  worldGraph: {
    discoveredRegions: [...],
    unlockedConnections: [...],
    regionVisits: {...},
  },
});
```

### With Spawning

```typescript
// Regions define spawn tables
const marshSpawnTable: SpawnTable = {
  creatures: [
    { id: 'otter_river', weight: 0.4, packSize: [2, 5] },
    { id: 'frog', weight: 0.3, packSize: [1, 3] },
    { id: 'dragonfly', weight: 0.2, packSize: [3, 10] },
  ],
  resources: [
    { id: 'cattails', weight: 0.5 },
    { id: 'lily_pad', weight: 0.3 },
  ],
};
```

## Open Questions

1. **Overlapping regions**: How to handle regions that overlap?
2. **Dynamic connections**: Can connections be created/destroyed at runtime?
3. **Minimap integration**: How to visualize the world graph on a minimap?

---

*Parent: [RFC Index](../README.md)*
