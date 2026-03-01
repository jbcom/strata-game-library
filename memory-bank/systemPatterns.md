---
title: System Patterns
version: "1.0"
updated: 2026-03-01
---

# System Patterns

## Core Architecture: Renderer-Agnostic + Adapters

```
packages/core (pure TypeScript)
    |
    ├── adapters/r3f (React Three Fiber)
    └── adapters/reactylon (Babylon.js)
```

**Rule**: `packages/core/` must NEVER import React. All renderer-specific code lives in adapters. This ensures core algorithms are portable, testable, and reusable.

## Entity Component System (ECS)

Location: `packages/core/src/core/ecs/`

The ECS is the backbone of game object management:

- **Entities** -- Unique IDs
- **Components** -- Pure data (position, velocity, health, material)
- **Systems** -- Logic that operates on component queries

Used for creatures, props, particles, and game state tracking.

## Compositional Object System (RFC-002)

Location: `packages/core/src/compose/`

Objects are built from composable parts rather than monolithic classes:

```
Materials (fur, wood, metal, crystal, flesh)
    └── Applied to regions of...
Skeletons (biped, quadruped, avian, serpentine)
    └── Combined into...
Creatures (skeleton + covering + AI + stats)
Props (shapes + materials)
```

**Current status**: Type definitions exist, factory functions NOT yet implemented.

## Game Orchestration (RFC-001)

Location: `packages/core/src/game/`

```
GameManager
├── SceneManager (scene transitions, loading)
├── ModeManager (exploration, combat, racing)
├── StateManager (game state, save/load)
└── TriggerSystem (event-driven transitions)
```

Pattern: State machines for scene and mode transitions, registry pattern for registration.

## World Topology (RFC-003)

Location: `packages/core/src/world/`

```
WorldGraph
├── Regions (areas with properties)
├── Connections (paths between regions)
├── SpawnSystem (entity placement)
└── RegionSystem (activation/deactivation)
```

Graph-based world representation where regions are nodes and connections are edges.

## Plugin Architecture

Plugins extend core capabilities without coupling:

| Plugin | Purpose | Integration |
|--------|---------|-------------|
| audio-synth | Procedural audio via Tone.js | Standalone, used by adapters |
| model-synth | AI 3D model generation (Meshy API) | Standalone API client |
| capacitor | Native mobile capabilities | Wraps Capacitor APIs |
| react-native | React Native bridge | Native module bridge |
| astro | Astro/Starlight integration | Vite plugin + CSS tokens |

Plugins depend on core but core never depends on plugins.

## State Management

### Registry Pattern

Used throughout for registering and looking up named resources:

- Material registry
- Skeleton registry
- Preset registry
- Scene registry

### State Machine

`packages/core/src/core/state/` -- Finite state machines for game modes, AI behaviors, and scene transitions.

## Shader Architecture

- GLSL shaders live in `packages/shaders/` as template literal strings
- Tagged with `/* glsl */` for editor syntax highlighting
- Core imports shaders via `@strata-game-library/shaders` package specifier
- Adapters compose shaders into renderer-specific materials

## Dependency Chain

```
@strata-game-library/shaders
    └── @strata-game-library/core (imports shaders)
        └── @strata-game-library/r3f (imports core)
            └── @strata-game-library/presets (imports r3f for prop types)
```

Inter-package dependencies use `workspace:*` protocol.

## Testing Patterns

- **Unit tests**: Vitest, colocated with source as `*.test.ts`
- **Integration tests**: Vitest, in `__tests__/` directories
- **E2E tests**: Playwright, in `apps/docs/` for visual regression
- **Mocking**: `vi.mock()` for external deps (three.js, React)
- **Coverage**: Vitest coverage with v8 provider

## Code Quality

- **Linting/Formatting**: Biome (replaces ESLint + Prettier)
- **Type checking**: TypeScript strict mode, no `any` policy
- **API docs**: TypeDoc generates docs, Starlight hosts them
- **Commit format**: Conventional commits (feat/fix/chore/refactor/test/docs)
