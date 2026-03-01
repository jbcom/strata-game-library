---
title: "RFC Documentation Index"
description: "Agent guide for RFC documents defining the Strata game framework layers"
area: rfc
last_updated: 2026-03-01
---

# RFC Documentation

## Overview

These four RFCs define the technical architecture for Strata's game framework layers. They were created as part of Epic #50 and specify interfaces, factories, and systems that transform Strata from a rendering toolkit into a declarative game framework. All RFCs have status "Proposed" but partial implementations exist in `packages/core/src/`.

## Documents

| File | RFC | Issue | Layer | Implementation | Description |
|------|-----|-------|-------|---------------|-------------|
| [RFC-001-GAME-ORCHESTRATION.md](RFC-001-GAME-ORCHESTRATION.md) | RFC-001 | [#51](https://github.com/jbcom/strata-game-library/issues/51) | Layer 1 | 60% | Scenes, modes, triggers, transitions |
| [RFC-002-COMPOSITIONAL-OBJECTS.md](RFC-002-COMPOSITIONAL-OBJECTS.md) | RFC-002 | [#52](https://github.com/jbcom/strata-game-library/issues/52) | Layer 3 | 40% | Materials, skeletons, coverings, props, creatures |
| [RFC-003-WORLD-TOPOLOGY.md](RFC-003-WORLD-TOPOLOGY.md) | RFC-003 | [#53](https://github.com/jbcom/strata-game-library/issues/53) | Layer 2 | 70% | Regions, connections, world graph, spawning |
| [RFC-004-DECLARATIVE-GAMES.md](RFC-004-DECLARATIVE-GAMES.md) | RFC-004 | [#54](https://github.com/jbcom/strata-game-library/issues/54) | Layer 4 | 30% | createGame() API, StrataGame component, state presets |

## RFC-001: Game Orchestration (Layer 1)

**Source:** `packages/core/src/game/`

| Type | Exists | File | Notes |
|------|--------|------|-------|
| `SceneManager` | Yes | `SceneManager.ts` | Scene registration, load, push/pop stack |
| `ModeManager` | Yes | `ModeManager.ts` | Mode registration, stack operations, ModeInstance |
| `TriggerSystem` | Yes | `TriggerSystem.ts` | Proximity/collision/interaction/timed triggers |
| `TransitionManager` | Yes | `TransitionManager.ts` | Fade, crossfade, wipe effects |
| `Registry` | Yes | `Registry.ts` | Generic content registry |
| `types.ts` | Yes | `types.ts` | Scene, ModeConfig, ModeInstance, TriggerComponent, etc. |

**Missing:** Scene lifecycle hooks integration, mode-specific input remapping, transition-scene integration.

## RFC-002: Compositional Objects (Layer 3)

**Source:** `packages/core/src/compose/`

| Type | Exists | File | Notes |
|------|--------|------|-------|
| `MaterialDefinition` | Yes | `materials/types.ts` | Base interface defined |
| `createFurMaterial` etc. | Partial | `materials/factory.ts` | Factory exists but missing built-in presets (fur_otter, wood_oak, etc.) |
| `SkeletonDefinition` | Yes | `skeletons/types.ts` | Interface defined |
| `createQuadrupedSkeleton` etc. | Partial | `skeletons/presets.ts` | Some presets, missing avian/serpentine/insectoid |
| `CoveringDefinition` | Yes | `coverings.ts` | Region-based material application |
| `CreatureDefinition` | Yes | `creatures/types.ts` | Interface defined |
| `createCreature()` | No | `creatures/index.ts` | No factory function |
| `PropDefinition` | Yes | `props/types.ts` | Interface defined |
| `createProp()` | Partial | `props/presets.ts` | Some presets exist |

**Missing:** Material factory functions with built-in presets (8+ material types), skeleton presets (avian, serpentine, insectoid), createCreature() factory, material physics properties, procedural variation system.

## RFC-003: World Topology (Layer 2)

**Source:** `packages/core/src/world/`

| Type | Exists | File | Notes |
|------|--------|------|-------|
| `WorldGraph` | Yes | `WorldGraph.ts` | Region/connection management, pathfinding |
| `RegionSystem` | Yes | `RegionSystem.ts` | Position-based region detection |
| `ConnectionSystem` | Yes | `ConnectionSystem.ts` | Connection traversal logic |
| `SpawnSystem` | Yes | `SpawnSystem.ts` | Entity spawning from spawn tables |
| `types.ts` | Yes | `types.ts` | Region, Connection, BoundingShape, etc. |

**Missing:** Spatial query optimization (octree/grid), LOD system for regions, procedural world generation, minimap visualization data.

## RFC-004: Declarative Games (Layer 4)

**Source:** `packages/core/src/api/`

| Type | Exists | File | Notes |
|------|--------|------|-------|
| `createGame()` | Yes | `createGame.ts` | Factory function exists |
| `GameDefinition` | Partial | `createGame.ts` | Interface exists but incomplete vs RFC spec |
| `StrataGame` | Yes | `adapters/r3f/src/StrataGame.tsx` | Lives in R3F adapter, not core |
| `StatePresets` | Partial | via `packages/core/src/core/state/` | RPG preset exists, others missing |

**Missing:** Full GameDefinition interface matching RFC-004, state preset factories (createRPGState, createActionState), hot reload support, comprehensive validation in createGame().

## Key Context

- All RFCs share Epic #50 as parent tracking issue
- Implementation priority: Layer 1 > Layer 2 > Layer 3 > Layer 4 (but all have partial implementations)
- Critical path for "10x code reduction" goal: material factories -> skeleton presets -> createCreature() -> createProp() -> createGame() -> StrataGame
- The RFCs define APIs that PUBLIC_API.md references but some don't exist yet
- `packages/core/` is pure TypeScript; StrataGame component is in `adapters/r3f/`

## Related

- [Architecture README](../README.md) - Parent directory index
- [Architecture AGENTS.md](../AGENTS.md) - Architecture area index
- [GAME_FRAMEWORK_VISION.md](../GAME_FRAMEWORK_VISION.md) - High-level vision document
- [ROADMAP.md](../ROADMAP.md) - Phase-by-phase implementation timeline
- [guides/MIGRATION.md](../guides/MIGRATION.md) - Toolkit-to-framework migration
- [guides/MIGRATION_DECLARATIVE.md](../guides/MIGRATION_DECLARATIVE.md) - Manual-to-declarative migration
