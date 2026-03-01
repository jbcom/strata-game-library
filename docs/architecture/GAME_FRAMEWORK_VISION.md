---
title: "Strata Game Framework Vision"
description: "High-level vision for transforming Strata from rendering toolkit to complete game framework"
status: active
implementation: 40
last_updated: 2026-03-01
area: architecture
---

# Strata Game Framework Vision

> **Goal**: Transform Strata from a rendering toolkit into a complete game framework that enables developers to declaratively define entire games in 1/10th the code.

## The Problem: Strata Today

Strata currently provides excellent **primitives**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STRATA TODAY                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐             │
│  │   RENDERING     │  │   SIMULATION    │  │     STATE       │             │
│  │   ───────────   │  │   ───────────   │  │   ───────────   │             │
│  │ • createGameStore │             │
│  │ • Sky           │  │ • Physics       │  │   Store         │             │
│  │ • Terrain       │  │ • AI (Yuka)     │  │ • useSaveLoad   │             │
│  │ • Vegetation    │  │ • Animation     │  │ • useCheckpoint │             │
│  │ • Particles     │  │ • Pathfinding   │  │ • StatePresets  │             │
│  │ • PostProcess   │  │                 │  │                 │             │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘             │
│         │                    │                    │                         │
│         └────────────────────┼────────────────────┘                         │
│                              │                                              │
│                        RAW BUILDING BLOCKS                                  │
│                    (No Orchestration Layer)                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

But developers must manually implement:

- Scene management and transitions
- Game mode states (exploration, combat, racing)
- Spatial triggers and portals
- World topology (regions, connections)
- Compositional object systems

## The Solution: Four New Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STRATA GAME FRAMEWORK                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                 LAYER 4: DECLARATIVE GAME DEFINITION                  │ │
│  │                 ───────────────────────────────────                   │ │
│  │  createGame() → GameDefinition → StrataGame Component                 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                 LAYER 3: COMPOSITIONAL OBJECTS                        │ │
│  │                 ────────────────────────────                          │ │
│  │  Materials │ Skeletons │ Coverings │ Props │ Creatures                │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                 LAYER 2: WORLD TOPOLOGY                               │ │
│  │                 ───────────────────                                   │ │
│  │  WorldGraph │ Regions │ Connections │ Spawning │ Navigation          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                 LAYER 1: GAME ORCHESTRATION                           │ │
│  │                 ───────────────────────────                           │ │
│  │  SceneManager │ ModeManager │ TriggerSystem │ Transitions            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                              │                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                    EXISTING STRATA PRIMITIVES                         │ │
│  │              (Rendering, Simulation, State)                           │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Layer 1: Game Orchestration (`@jbcom/strata/game`)

**Purpose**: Manage the runtime lifecycle of games.

### SceneManager

```typescript
interface SceneManager {
  register(scene: Scene): void;
  load(sceneId: string): Promise<void>;
  push(sceneId: string): Promise<void>;  // Overlay
  pop(): Promise<void>;
  current: Scene;
  stack: Scene[];
}
```

### ModeManager

```typescript
interface ModeManager {
  register(mode: ModeConfig): void;
  push(modeId: string, props?: object): void;
  pop(): void;
  replace(modeId: string, props?: object): void;
  current: ModeConfig;
  stack: ModeConfig[];
}
```

### TriggerSystem

```typescript
// Spatial triggers as ECS components
world.add({
  transform: { position: riverCrossingPoint },
  trigger: {
    type: 'proximity',
    radius: 5,
    condition: (player) => !player.unlockedWaterways.includes('river_a'),
    action: (player) => modeManager.push('racing', { waterway: 'river_a' }),
  }
});
```

## Layer 2: World Topology (`@jbcom/strata/world`)

**Purpose**: Define the spatial structure of game worlds.

### WorldGraph

```typescript
const world = createWorldGraph({
  regions: {
    marsh: { center: [0, 0, 0], radius: 50, biome: 'marsh' },
    forest: { center: [100, 0, 0], radius: 60, biome: 'forest' },
  },
  connections: [
    {
      from: 'marsh',
      to: 'forest',
      type: 'waterway',
      traversalMode: 'racing',
      unlockCondition: { type: 'first_traverse' },
    },
  ],
});
```

## Layer 3: Compositional Objects (`@jbcom/strata/compose`)

**Purpose**: Define game objects through composition.

### The Core Insight
>
> "Wooden boards bound by metal banding form a panel; enough panels in 3D space form an ammo crate."

All game objects decompose into:

1. **Rigid shapes** (box, cylinder, sphere, mesh)
2. **Materials** (wood, metal, fur, stone)
3. **Composition rules** (how parts connect)

### Material Types

| Material Type | Examples | Properties |
|---------------|----------|------------|
| **Solid** | Wood, Stone, Metal | baseColor, roughness, metalness |
| **Shell** | Fur, Feathers, Scales | layers, length, density, pattern |
| **Volumetric** | Crystal, Glass, Water | refraction, transparency |
| **Organic** | Flesh, Leather, Bark | subsurface scattering |

### Skeletons

```typescript
const otterSkeleton = createQuadrupedSkeleton({
  bodyLength: 0.6,
  legRatio: 0.4,
  tailLength: 0.4,
  headSize: 0.15,
});
```

### Coverings

```typescript
const otterCovering = {
  skeleton: 'otter',
  regions: {
    'body*': { material: 'fur_otter', color: '#4a3520' },
    'belly': { material: 'fur_otter', color: '#8b7355' },
    'nose': { material: 'flesh_mammal', color: '#2d2d2d' },
  },
};
```

### Props

```typescript
const woodenCrate = createProp({
  id: 'crate_wooden',
  components: [
    { shape: 'box', size: [1, 1, 1], material: 'wood_oak' },
    { shape: 'box', size: [1.05, 0.05, 0.02], position: [0, 0.3, 0.5], material: 'metal_iron' },
  ],
  physics: { type: 'dynamic', mass: 20 },
  interaction: { type: 'container', capacity: 10 },
});
```

## Layer 4: Declarative Game Definition

**Purpose**: Define entire games as configuration.

```typescript
const rivermarsh = createGame({
  name: 'Rivermarsh',
  
  content: {
    creatures: [riverOtter, fox, rabbit, ...],
    props: [woodenCrate, fishingRod, campfire, ...],
    materials: [furOtter, woodOak, metalIron, ...],
  },
  
  world: rivermarshWorld,
  
  modes: {
    exploration: ExplorationMode,
    racing: RacingMode,
    combat: CombatMode,
  },
  
  initialState: createRPGState({ currentRegion: 'marsh' }),
  
  controls: {
    desktop: desktopControls,
    mobile: mobileControls,
  },
});

// Usage
function App() {
  return <StrataGame game={rivermarsh} />;
}
```

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Lines of code (Rivermarsh) | ~10,000 | <1,000 |
| Time to prototype | Days | Hours |
| API documentation | Partial | 100% |
| Type safety | Partial | Full |

## Related RFCs

- [RFC-001: Game Orchestration](./rfc/RFC-001-GAME-ORCHESTRATION.md)
- [RFC-002: Compositional Objects](./rfc/RFC-002-COMPOSITIONAL-OBJECTS.md)
- [RFC-003: World Topology](./rfc/RFC-003-WORLD-TOPOLOGY.md)
- [RFC-004: Declarative Games](./rfc/RFC-004-DECLARATIVE-GAMES.md)

## Timeline

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | 1 week | RFCs and documentation |
| 2 | 2 weeks | Game orchestration layer |
| 3 | 2 weeks | Compositional system |
| 4 | 1 week | Declarative game definition |
| 5 | 1 week | Rivermarsh validation |

---

*Tracking: [GitHub Epic #50](https://github.com/jbcom/strata-game-library/issues/50)*
