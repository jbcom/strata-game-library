---
title: "Guides Documentation Index"
description: "Agent guide for migration and development guides in the Strata game framework"
area: guides
last_updated: 2026-03-01
---

# Guides Documentation

## Overview

This directory contains migration guides for transitioning between Strata versions and usage patterns, plus agent development instructions. These guides cover the toolkit-to-framework migration, package renaming, build toolchain changes, and the declarative API adoption path.

## Documents

| File | Status | Audience | Description |
|------|--------|----------|-------------|
| [MIGRATION.md](MIGRATION.md) | Current | Developers | Toolkit to framework migration (6 phases: state, creatures, props, world, modes) |
| [MIGRATION_V2.md](MIGRATION_V2.md) | Future | Developers | `@jbcom/strata` v1.x to `@strata/core` v2.0 (package rename, API changes) |
| [MIGRATION_DECLARATIVE.md](MIGRATION_DECLARATIVE.md) | Current | Developers | Manual Canvas/ECS setup to declarative `createGame()` API |
| [TSUP_MIGRATION.md](TSUP_MIGRATION.md) | Complete | Maintainers | Build toolchain migration from tsc to tsup for ESM support |
| [AGENTS.md](AGENTS.md) | Current | AI Agents | This file - index and strategic development context |

## Guide Details

### MIGRATION.md - Toolkit to Framework

The primary migration guide with 6 phases:

1. **Phase 0**: Assessment (line counting, pattern identification)
2. **Phase 1**: Add Strata alongside existing code (StrataGame wrapper)
3. **Phase 2**: Migrate state management (Zustand -> state presets)
4. **Phase 3**: Migrate creatures (manual components -> CreatureDefinition)
5. **Phase 4**: Migrate props (manual meshes -> PropDefinition)
6. **Phase 5**: Migrate world structure (hardcoded -> WorldGraph)
7. **Phase 6**: Migrate game modes (manual switching -> ModeManager)

Code savings: ~200 lines state, ~150 lines/creature, ~80 lines/prop.

### MIGRATION_V2.md - Package Rename Guide

Covers the planned v2.0 package namespace change:

- `@jbcom/strata` -> `@strata/core`
- `@jbcom/strata-shaders` -> `@strata/shaders`
- `@jbcom/strata-presets` -> `@strata/presets`
- Core class renames: `ParticleEmitter` -> `ParticleEmitterCore`
- Codemod available: `npx @strata/codemod migrate-v2`

**Note:** This migration has NOT happened yet. The current monorepo uses `@strata-game-library/` scope.

### MIGRATION_DECLARATIVE.md - Declarative API

Concise guide for adopting `createGame()`:

- Before/after code comparison
- Registry system, scene management, mode management, state presets
- Gradual migration with `<StrataGame>` wrapper accepting legacy children

### TSUP_MIGRATION.md - Build Toolchain

Documents the completed migration from `tsc` to `tsup`:

- Problem: tsc doesn't add `.js` extensions for Node.js ESM
- Solution: tsup (powered by esbuild) with proper ESM output
- Package-specific configs for audio-synth, presets, shaders
- Validation: `publint` and `attw` checks

## Strategic Development Context

### Architecture Principles

1. **Composability Over Inheritance** - Use `compose()` pattern, not class hierarchies
2. **Declarative Over Imperative** - Data definitions, not procedural construction
3. **Core Stays Pure** - `packages/core/` has NO React imports
4. **Everything is Typed** - No `any`, use discriminated unions

### File Organization (Current)

```
packages/core/src/
  game/       # Layer 1: SceneManager, ModeManager, TriggerSystem
  world/      # Layer 2: WorldGraph, RegionSystem, ConnectionSystem
  compose/    # Layer 3: materials/, skeletons/, props/, creatures/
  api/        # Layer 4: createGame.ts
  core/       # Pure TS algorithms (ai, animation, ecs, math, state)
  types/      # Shared TypeScript types
  utils/      # Utility functions
```

### Implementation Guidelines

**Adding a new material type:**

1. Define interface in `compose/materials/types.ts`
2. Implement factory in `compose/materials/factory.ts`
3. Add shader if needed in `packages/shaders/`
4. Export from `compose/materials/index.ts`
5. Add tests in `compose/materials/__tests__/`

**Adding a new ECS system:**

1. Define system interface in `core/ecs/types.ts`
2. Implement as pure function returning `SystemFn`
3. Add to appropriate layer module
4. Test with unit and integration tests

### Key Epics & RFCs

| Issue | Type | Status | Focus |
|-------|------|--------|-------|
| #50 | Epic | Open | Master tracking for game framework |
| #51 | RFC | Open | Game orchestration (scenes, modes, triggers) |
| #52 | RFC | Open | Compositional objects (materials, props) |
| #53 | RFC | Open | World topology (regions, connections) |
| #54 | RFC | Open | Declarative game definition (createGame) |

### Testing Requirements

- **Unit tests:** Vitest, 80%+ coverage, mock external deps
- **Integration tests:** System interactions, mode transitions, trigger activations
- **E2E tests:** Playwright for complete game flows, save/load, mobile input

### Commit Convention

```bash
feat(game): add SceneManager for scene lifecycle
fix(compose): correct fur shader normal calculation
docs(rfc): update RFC-002 with skeleton examples
test(world): add RegionSystem integration tests
refactor(core): extract trigger logic from ECS
```

### Validation Target: Rivermarsh

Success criteria: <1000 lines game code, defined via createGame(), feature parity, 60fps mobile.

### Development Commands

```bash
pnpm install        # Install dependencies
pnpm run build      # Build the library
pnpm run test       # Run all tests
pnpm run lint       # Lint with Biome
pnpm run typecheck  # Type checking
pnpm run docs       # Generate TypeDoc
```

## Key Context

- MIGRATION_V2.md describes a FUTURE migration that hasn't happened
- The actual monorepo uses `@strata-game-library/` npm scope, not `@strata/`
- TSUP_MIGRATION.md is complete -- all packages already use tsup
- The guides reference APIs from the RFCs that may not be fully implemented yet

## Related

- [Architecture AGENTS.md](../AGENTS.md) - Parent architecture index
- [RFC documents](../rfc/) - Technical specifications the guides reference
- [ROADMAP.md](../ROADMAP.md) - Implementation timeline
- [CLAUDE.md](../../../CLAUDE.md) - Project-level development commands

---

*Tracking: [GitHub Epic #50](https://github.com/jbcom/strata-game-library/issues/50)*
