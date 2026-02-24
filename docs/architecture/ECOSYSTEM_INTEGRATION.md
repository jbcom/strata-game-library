# Strata Ecosystem Integration Report

## Overview

This document provides an analysis of TypeScript games in the arcade-cabinet organization that should be using the Strata API, along with integration recommendations.

**Last Updated:** 2025-12-26

---

## TypeScript Games Analysis

### Games Currently Using Strata

| Game | Repository | Strata Version | Status |
|------|------------|----------------|--------|
| Rivermarsh | `arcade-cabinet/rivermarsh` | ^1.4.10 | ✅ Current |
| Protocol: Silent Night | `arcade-cabinet/protocol-silent-night` | ^1.0.0 | ⚠️ Outdated |

### Games NOT Using Strata (Candidates for Migration)

| Game | Repository | Current Stack | Strata Fit |
|------|------------|---------------|------------|
| Otter River Rush | `arcade-cabinet/otter-river-rush` | R3F monorepo | 🎯 High - Racing/endless runner |
| Ebb and Bloom | `arcade-cabinet/ebb-and-bloom` | R3F + Rapier | 🎯 High - World simulation |
| Realm Walker | `arcade-cabinet/realm-walker` | R3F + Yuka | 🎯 High - Adventure game |

### Non-TypeScript Games (Not Applicable)

| Game | Repository | Language | Engine |
|------|------------|----------|--------|
| Cosmic Cults | `arcade-cabinet/cosmic-cults` | Rust | Bevy |
| Rivers of Reckoning | `arcade-cabinet/rivers-of-reckoning` | Python | Pygame-ce |
| Dragons Labyrinth | `arcade-cabinet/dragons-labyrinth` | Python | Unknown |
| Echoes of Beastlight | `arcade-cabinet/echoes-of-beastlight` | Rust | Unknown |

---

## Integration Recommendations

### 1. Protocol: Silent Night - Version Update

**Current:** `@jbcom/strata: ^1.0.0`
**Recommended:** `@jbcom/strata: ^1.4.10`

```bash
# In protocol-silent-night repo
pnpm update @jbcom/strata
```

**Benefits:**
- Access to new compositional object system
- Improved vegetation instancing
- Better water rendering
- Game orchestration primitives

### 2. Otterfall - Full Migration

**Current Stack:**
- `@react-three/drei`
- `@react-three/fiber`
- `@react-three/postprocessing`
- `@react-three/rapier`
- Custom implementations

**Migration Path:**

```typescript
// Before (custom implementations)
import { Environment, Sky, Water } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';

// After (Strata API)
import { 
  ProceduralSky, 
  AdvancedWater, 
  Terrain, 
  GrassInstances 
} from '@jbcom/strata';
import { createGame, StrataGame } from '@jbcom/strata/api';
```

**Estimated Effort:** 20-30 hours

**Key Migrations:**
1. Replace custom terrain with `Terrain` component
2. Replace water with `AdvancedWater`
3. Replace sky with `ProceduralSky`
4. Add vegetation using `GrassInstances`, `TreeInstances`
5. Integrate game orchestration for modes

### 3. Realm Walker - Partial Integration

**Current Stack:**
- `@react-three/drei`
- `@react-three/fiber`
- `better-sqlite3` (persistence)
- Custom AI with `yuka`

**Strata Features to Adopt:**

| Feature | Strata Component | Benefit |
|---------|------------------|---------|
| World structure | `WorldGraph`, `RegionSystem` | Simplified region management |
| AI behaviors | `FlockPreset`, `GuardPreset` | Pre-built AI patterns |
| State management | `GameStateStore` | Undo/redo, persistence |
| Particle effects | `ParticleEmitter` | GPU-accelerated particles |
| Post-processing | `CinematicEffects` | Film-quality visuals |

**Estimated Effort:** 40-50 hours (larger scope)

### 4. Ebb and Bloom - Evaluation Needed

**Current:** TypeScript project (private)

**Action Items:**
1. [ ] Review current implementation
2. [ ] Identify rendering requirements
3. [ ] Assess Strata compatibility
4. [ ] Create migration plan if applicable

---

## Strata API Usage Patterns

### Game Definition (Declarative)

```typescript
// Recommended pattern for new games
import { createGame, StrataGame } from '@jbcom/strata/api';

const game = createGame({
  content: {
    creatures: { otter, fish, bird },
    props: { rock, tree, log },
    materials: { water_clear, fur_otter }
  },
  world: worldGraph,
  modes: {
    exploration: { systems: ['movement', 'camera'] },
    racing: { systems: ['timer', 'checkpoints'] },
    combat: { systems: ['health', 'damage'] }
  },
  initialMode: 'exploration',
  controls: 'mobile-joystick'
});

function App() {
  return <StrataGame game={game} />;
}
```

### Terrain & Environment

```typescript
import { 
  Terrain, 
  AdvancedWater, 
  ProceduralSky,
  GrassInstances,
  TreeInstances 
} from '@jbcom/strata';

function Environment() {
  return (
    <>
      <ProceduralSky timeOfDay={createTimeOfDay(14, 30)} />
      <Terrain 
        size={256} 
        resolution={64} 
        biomes={[riverBiome, forestBiome]} 
      />
      <AdvancedWater size={100} position={[0, 0, 0]} />
      <GrassInstances count={10000} />
      <TreeInstances count={500} />
    </>
  );
}
```

### Creatures & Characters

```typescript
import { 
  CREATURES, 
  createCreature, 
  createFurMaterial 
} from '@jbcom/strata/api/compose';

// Use built-in otter
const riverOtter = CREATURES.otter_river;

// Or customize
const goldenOtter = createCreature({
  skeleton: 'quadruped_medium',
  covering: {
    regions: {
      '*': { material: createFurMaterial('golden', { baseColor: '#ffd700' }) }
    }
  },
  ai: 'prey',
  stats: { health: 50, speed: 8 }
});
```

### AI Behaviors

```typescript
import { 
  FlockPreset, 
  PredatorPreset, 
  PreyPreset,
  GuardPreset 
} from '@jbcom/strata/presets';

// Apply flock behavior to fish
entity.addComponent(FlockPreset.create({
  separationWeight: 1.5,
  alignmentWeight: 1.0,
  cohesionWeight: 1.2,
  maxSpeed: 5
}));

// Apply predator behavior to eagle
entity.addComponent(PredatorPreset.create({
  detectionRange: 50,
  chaseSpeed: 12,
  attackRange: 2
}));
```

---

## Issue Recommendations

### Create Integration Issues

For each game that should migrate to Strata, create a tracking issue:

```markdown
## feat: Migrate [Game Name] to Strata API

### Overview
Migrate from custom R3F implementation to @jbcom/strata for:
- Reduced code complexity
- Access to pre-built systems
- Consistent API across games

### Current Stack
- [list current dependencies]

### Strata Components to Use
- [ ] ProceduralSky
- [ ] AdvancedWater
- [ ] Terrain
- [ ] createGame API
- [ ] GameStateStore

### Estimated Effort
[X] hours

### Related
- jbcom/strata-game-library#101 - EPIC: Strata Game Studio
```

---

## Cross-Repository Coordination

### Shared Configuration

All TypeScript games should use consistent tooling:

```json
{
  "devDependencies": {
    "@biomejs/biome": "^2.3.0",
    "@playwright/test": "^1.57.0",
    "typescript": "^5.9.0",
    "vitest": "^4.0.0"
  }
}
```

### Shared Strata Configuration

```typescript
// strata.config.ts (proposed)
export default {
  version: '1.4.10',
  presets: ['mobile-first', 'capacitor'],
  features: {
    terrain: true,
    water: true,
    vegetation: true,
    particles: true,
    postProcessing: true
  }
};
```

---

## Action Items

### Immediate (This Week)

1. [ ] Update protocol-silent-night to strata ^1.4.10
2. [ ] Create migration issue for nodejs-otterfall
3. [ ] Review ebb-and-bloom for Strata compatibility

### Short-term (This Month)

1. [ ] Begin nodejs-otterfall migration
2. [ ] Create Strata integration guide for arcade-cabinet games
3. [ ] Set up shared CI configuration

### Long-term (This Quarter)

1. [ ] Complete all TypeScript game migrations
2. [ ] Publish Strata showcase with game examples
3. [ ] Create "Add Strata to existing R3F project" tutorial

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Games using Strata | 2 | 5 |
| Strata version consistency | Mixed | All ^1.4.x |
| Shared code patterns | None | Core systems |
| Mobile-first games | 2 | 4 |
