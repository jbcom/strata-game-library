# Agent Instructions for Strata Development

> Comprehensive instructions for AI agents working on the Strata game framework.

## Project Context

**Strata** (`@jbcom/strata`) is evolving from a procedural 3D graphics library into a complete game framework. This document guides agents through the architecture, conventions, and goals.

## Architecture Overview

### Current State (Toolkit)
Strata provides excellent rendering and simulation primitives but lacks game orchestration:

```
Primitives (DONE):
├── Rendering: Water, Sky, Terrain, Vegetation, Particles
├── Simulation: ECS, Physics, AI (Yuka), Animation
└── State: createGameStore, useSaveLoad, StatePresets
```

### Target State (Framework)
We're adding four new layers:

```
Framework (IN PROGRESS):
├── Layer 4: Declarative Game Definition (createGame API)
├── Layer 3: Compositional Objects (Materials, Skeletons, Props)
├── Layer 2: World Topology (Regions, Connections, Portals)
└── Layer 1: Game Orchestration (Scenes, Modes, Triggers)
```

## Key Epics & RFCs

| Issue | Type | Status | Focus |
|-------|------|--------|-------|
| #50 | Epic | Open | Master tracking for game framework |
| #51 | RFC | Open | Game orchestration (scenes, modes, triggers) |
| #52 | RFC | Open | Compositional objects (materials, props) |
| #53 | RFC | Open | World topology (regions, connections) |
| #54 | RFC | Open | Declarative game definition (createGame) |

## Development Principles

### 1. Composability Over Inheritance
```typescript
// ✅ GOOD: Composition
const otter = compose(
  withSkeleton('quadruped'),
  withCovering('fur_otter'),
  withAI('prey'),
  withStats({ health: 50, speed: 8 })
);

// ❌ BAD: Deep inheritance
class Otter extends QuadrupedAnimal extends FurredCreature extends Prey { }
```

### 2. Declarative Over Imperative
```typescript
// ✅ GOOD: Declarative
const world = createWorldGraph({
  regions: { marsh: { ... }, forest: { ... } },
  connections: [{ from: 'marsh', to: 'forest', type: 'waterway' }],
});

// ❌ BAD: Imperative
const world = new WorldGraph();
world.addRegion('marsh', new Region(...));
world.addRegion('forest', new Region(...));
world.connect('marsh', 'forest', new Waterway(...));
```

### 3. Core Stays Pure
The `src/core/` directory must have NO React imports:
```typescript
// src/core/composition.ts
// ✅ Pure TypeScript, framework-agnostic

// src/components/Creature.tsx
// React component that uses core
```

### 4. Everything is Typed
No `any` types. Use generics and discriminated unions:
```typescript
// ✅ GOOD
type Connection = 
  | { type: 'waterway'; difficulty: number; }
  | { type: 'door'; keyRequired?: string; }
  | { type: 'portal'; destination: Vector3; };

// ❌ BAD
interface Connection {
  type: string;
  config: any;
}
```

## File Organization

### New Directories to Create

```
src/
├── game/                    # Layer 1: Orchestration
│   ├── SceneManager.ts
│   ├── ModeManager.ts
│   ├── TriggerSystem.ts
│   └── index.ts
├── world/                   # Layer 2: Topology
│   ├── WorldGraph.ts
│   ├── RegionSystem.ts
│   ├── ConnectionSystem.ts
│   └── index.ts
├── compose/                 # Layer 3: Composition
│   ├── materials/
│   │   ├── fur.ts
│   │   ├── metal.ts
│   │   └── index.ts
│   ├── skeletons/
│   │   ├── quadruped.ts
│   │   ├── biped.ts
│   │   └── index.ts
│   ├── props/
│   │   ├── furniture.ts
│   │   ├── containers.ts
│   │   └── index.ts
│   └── creatures/
│       └── index.ts
└── framework/               # Layer 4: Definition
    ├── createGame.ts
    ├── StrataGame.tsx
    └── index.ts
```

## Implementation Guidelines

### When Adding a New Material Type
1. Define the material interface in `src/compose/materials/types.ts`
2. Implement the material factory in `src/compose/materials/{name}.ts`
3. Add shader code if needed in `src/shaders/materials/{name}.ts`
4. Export from `src/compose/materials/index.ts`
5. Add tests in `src/compose/materials/__tests__/{name}.test.ts`
6. Document in `docs/architecture/rfc/RFC-002-COMPOSITIONAL-OBJECTS.md`

### When Adding a New System
1. Define system interface in `src/core/ecs/types.ts`
2. Implement as a pure function returning `SystemFn`
3. Add to appropriate layer module
4. Register in the system scheduler
5. Test with both unit and integration tests

### When Adding a New Game Mode
1. Define mode interface extending `ModeConfig`
2. Implement mode-specific systems
3. Create mode-specific UI component
4. Register with ModeManager
5. Document input mappings

## Testing Requirements

### Unit Tests
- All core functions must have unit tests
- Use Vitest, aim for 80%+ coverage
- Mock external dependencies

### Integration Tests
- Test system interactions
- Test mode transitions
- Test trigger activations

### E2E Tests (Playwright)
- Test complete game flows
- Test save/load functionality
- Test mobile input

## Commit Convention

```bash
feat(game): add SceneManager for scene lifecycle
fix(compose): correct fur shader normal calculation
docs(rfc): update RFC-002 with skeleton examples
test(world): add RegionSystem integration tests
refactor(core): extract trigger logic from ECS
```

## Validation Target: Rivermarsh

Rivermarsh (jbcom/nodejs-rivermarsh) is our primary validation target. Success means:

1. **Code reduction**: <1000 lines of game-specific code
2. **Full declaration**: Game defined via createGame()
3. **Feature parity**: All current features working
4. **Performance**: 60fps on mobile

## Quick Reference

### Commands
```bash
pnpm install        # Install dependencies
pnpm run build      # Build the library
pnpm run test       # Run all tests
pnpm run lint       # Lint with Biome
pnpm run typecheck  # Type checking
pnpm run docs       # Generate TypeDoc
```

### Key Files
- `CLAUDE.md` - Claude Code instructions
- `AGENTS.md` - General agent instructions
- `docs/architecture/` - Architecture documentation
- `src/index.ts` - Main exports

### GitHub Projects
- **Roadmap** (Project #2) - Timeline and milestones
- **Ecosystem** (Project #1) - Cross-repo coordination

---

*Last updated: December 2024*
*Tracking: [GitHub Epic #50](https://github.com/jbcom/strata-game-library/issues/50)*
