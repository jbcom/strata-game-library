---
title: "Migration Guide: Toolkit to Framework"
description: "Step-by-step guide for migrating from Strata rendering toolkit to complete game framework"
status: proposed
implementation: 0
last_updated: 2026-03-01
area: guides
---

# Migration Guide: Toolkit to Framework

This guide helps you migrate from using Strata as a rendering toolkit to using it as a complete game framework.

## Overview

| Approach | Lines of Code | Features |
|----------|---------------|----------|
| **Toolkit** (manual) | 5000-20000+ | Full control, maximum flexibility |
| **Framework** (declarative) | 500-2000 | Rapid development, standardized patterns |

## Migration Phases

### Phase 0: Assessment

Before migrating, assess your current codebase:

```bash
# Count lines of code
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l

# Identify patterns
grep -r "useFrame" src/          # Animation loops
grep -r "useState.*position" src/ # Manual state
grep -r "scene.add" src/          # Direct Three.js
```

**Questions to answer:**

1. How many game modes do you have?
2. How many creature/entity types?
3. How many regions/levels?
4. What's your save/load implementation?

---

### Phase 1: Add Strata Alongside Existing Code

Install the latest Strata:

```bash
npm install @jbcom/strata@latest
```

Create a minimal game definition:

```typescript
// src/game.ts
import { createGame } from '@jbcom/strata/game';

export const game = createGame({
  name: 'My Game',
  version: '0.1.0',
  
  content: {
    materials: [],
    creatures: [],
    props: [],
    items: [],
  },
  
  world: {
    regions: {},
    connections: [],
  },
  
  modes: {
    main: {
      id: 'main',
      systems: [],  // Empty for now
      inputMap: {},
    },
  },
  defaultMode: 'main',
  
  statePreset: 'rpg',
  controls: {},
});
```

Wrap your existing app:

```tsx
// src/App.tsx
import { StrataGame } from '@jbcom/strata/game';
import { game } from './game';

function App() {
  return (
    <StrataGame game={game}>
      {/* Your existing components still work */}
      <MyExistingGame />
    </StrataGame>
  );
}
```

---

### Phase 2: Migrate State Management

**Before (manual Zustand):**

```typescript
// src/stores/gameStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  player: { health: number; level: number; };
  inventory: Item[];
  currentRegion: string;
  // ... 50 more fields
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      player: { health: 100, level: 1 },
      inventory: [],
      currentRegion: 'start',
      // ... initialization
    }),
    { name: 'game-save' }
  )
);
```

**After (Strata state preset):**

```typescript
// src/game.ts
import { createGame, createRPGState } from '@jbcom/strata/game';

export const game = createGame({
  // ...
  statePreset: 'rpg',
  initialState: createRPGState({
    player: { health: 100, level: 1 },
    currentRegion: 'start',
  }),
});

// Usage
import { useGameState } from '@jbcom/strata/game';
const { player, inventory } = useGameState();
```

**Savings: ~200 lines → 10 lines**

---

### Phase 3: Migrate Creatures

**Before (manual components):**

```tsx
// src/components/Otter.tsx
export function Otter({ position, variant }: OtterProps) {
  const { scene, animations } = useGLTF('/models/otter.glb');
  const { actions } = useAnimations(animations);
  const [state, setState] = useState('idle');
  
  useFrame((_, delta) => {
    // 50 lines of AI logic
    // 30 lines of animation logic
    // 20 lines of physics
  });
  
  return (
    <group position={position}>
      <primitive object={scene} />
      {/* Shadow, effects, etc. */}
    </group>
  );
}
```

**After (creature definition):**

```typescript
// src/creatures/otter.ts
import { CreatureDefinition } from '@jbcom/strata/compose';

export const riverOtter: CreatureDefinition = {
  id: 'otter_river',
  name: 'River Otter',
  
  skeleton: 'quadruped_medium',
  covering: {
    skeleton: 'quadruped_medium',
    regions: {
      '*': { material: 'fur_otter', color: '#4a3520' },
      'belly': { material: 'fur_otter', color: '#8b7355' },
    },
  },
  
  stats: { health: 50, speed: 6, swimSpeed: 12 },
  ai: 'prey',
  
  animations: {
    idle: 'otter_idle',
    walk: 'otter_walk',
    swim: 'otter_swim',
  },
  
  biomes: ['marsh', 'river'],
  spawnWeight: 0.4,
};
```

**Savings: ~150 lines per creature → 30 lines**

---

### Phase 4: Migrate Props

**Before (manual mesh creation):**

```tsx
// src/components/WoodenCrate.tsx
export function WoodenCrate({ position }: Props) {
  const woodTexture = useTexture('/textures/wood.jpg');
  const metalTexture = useTexture('/textures/metal.jpg');
  
  return (
    <RigidBody type="dynamic">
      <group position={position}>
        {/* 6 box faces */}
        <mesh position={[0, -0.475, 0]}>
          <boxGeometry args={[1, 0.05, 1]} />
          <meshStandardMaterial map={woodTexture} />
        </mesh>
        {/* ... 5 more faces */}
        {/* Metal bands */}
        <mesh position={[0, 0.3, 0.49]}>
          <boxGeometry args={[1.05, 0.03, 0.02]} />
          <meshStandardMaterial map={metalTexture} metalness={0.8} />
        </mesh>
        {/* ... more bands */}
      </group>
    </RigidBody>
  );
}
```

**After (prop definition):**

```typescript
// src/props/containers.ts
export const woodenCrate: PropDefinition = {
  id: 'crate_wooden',
  name: 'Wooden Crate',
  components: [
    { shape: 'box', size: [1, 1, 1], material: 'wood_oak' },
    { shape: 'box', size: [1.05, 0.03, 0.02], position: [0, 0.3, 0.49], material: 'metal_iron' },
  ],
  physics: { type: 'dynamic', mass: 25 },
  interaction: { type: 'container', capacity: 10 },
};
```

**Savings: ~80 lines → 15 lines**

---

### Phase 5: Migrate World Structure

**Before (hardcoded positions):**

```tsx
// src/scenes/GameWorld.tsx
export function GameWorld() {
  const [currentArea, setCurrentArea] = useState('marsh');
  
  return (
    <>
      {currentArea === 'marsh' && <MarshBiome />}
      {currentArea === 'forest' && <ForestBiome />}
      
      {/* Transition triggers */}
      <mesh position={[25, 0, 0]} onClick={() => setCurrentArea('forest')}>
        <boxGeometry args={[2, 5, 2]} />
      </mesh>
    </>
  );
}
```

**After (world graph):**

```typescript
// src/world.ts
export const world = createWorldGraph({
  regions: {
    marsh: { name: 'The Marsh', center: [0, 0, 0], radius: 50, biome: 'marsh' },
    forest: { name: 'Whispering Woods', center: [100, 0, 0], radius: 60, biome: 'forest' },
  },
  connections: [
    {
      from: 'marsh',
      to: 'forest',
      type: 'waterway',
      traversalMode: 'racing',
      unlockCondition: { type: 'first_traverse', mode: 'racing' },
    },
  ],
});
```

**Benefits:**

- Automatic region detection
- Built-in navigation
- Persistence of discovered regions
- Fast travel once unlocked

---

### Phase 6: Migrate Game Modes

**Before (manual mode switching):**

```tsx
// src/App.tsx
function App() {
  const [mode, setMode] = useState<'exploration' | 'racing' | 'combat'>('exploration');
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'exploration') {
        // Exploration controls
      } else if (mode === 'racing') {
        // Racing controls
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode]);
  
  return (
    <>
      {mode === 'exploration' && <ExplorationMode />}
      {mode === 'racing' && <RacingMode />}
      {mode === 'combat' && <CombatMode />}
    </>
  );
}
```

**After (mode definitions):**

```typescript
// src/modes/index.ts
export const modes = {
  exploration: {
    id: 'exploration',
    systems: [movementSystem, cameraSystem, interactionSystem],
    inputMap: { move: 'WASD', interact: 'E' },
    ui: ExplorationHUD,
  },
  racing: {
    id: 'racing',
    systems: [racingSystem, obstacleSystem],
    inputMap: { steer: 'AD', boost: 'Space' },
    ui: RacingHUD,
  },
  combat: {
    id: 'combat',
    systems: [combatSystem, targetingSystem],
    inputMap: { attack: 'mouse1', dodge: 'Space' },
    ui: CombatHUD,
  },
};
```

**Benefits:**

- Automatic input remapping
- Mode stacking (pause menu over gameplay)
- System activation/deactivation
- Mode-specific UI

---

## Checklist

### Before Migration

- [ ] Read all RFC documents
- [ ] Inventory current features
- [ ] Plan migration phases
- [ ] Set up test coverage

### Phase 1: Setup

- [ ] Install latest Strata
- [ ] Create minimal game definition
- [ ] Wrap existing app in StrataGame
- [ ] Verify existing features still work

### Phase 2: State

- [ ] Identify current state shape
- [ ] Map to state preset (RPG, Action, etc.)
- [ ] Migrate to createGameStore
- [ ] Update state access patterns

### Phase 3: Content

- [ ] Define materials
- [ ] Define creature definitions
- [ ] Define prop definitions
- [ ] Register in game content

### Phase 4: World

- [ ] Map current areas to regions
- [ ] Define connections between regions
- [ ] Set up traversal modes
- [ ] Test navigation

### Phase 5: Modes

- [ ] Identify current game modes
- [ ] Create mode definitions
- [ ] Migrate input handling
- [ ] Migrate mode-specific UI

### Phase 6: Cleanup

- [ ] Remove manual implementations
- [ ] Run full test suite
- [ ] Performance benchmark
- [ ] Document custom extensions

---

## Common Issues

### "My custom system doesn't work"

Systems must follow the signature:

```typescript
type SystemFn = (world: World, delta: number) => void;
```

### "My creature looks wrong"

Check material and skeleton compatibility. Shell materials (fur) need appropriate geometry.

### "Mode transitions are jarring"

Use transition configuration:

```typescript
modeManager.push('combat', {}, { transition: { type: 'fade', duration: 0.3 } });
```

### "State isn't persisting"

Ensure you're using the game's store, not a separate Zustand store:

```typescript
const state = game.store.getState();  // ✅
const state = useMyStore();  // ❌ (separate store)
```

---

*Need help? See [Agent Instructions](./AGENTS.md) or file an issue.*
