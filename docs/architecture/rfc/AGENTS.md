---
title: "RFC Documentation Index"
description: "Agent guide for RFC documents defining the Strata game framework layers"
area: rfc
last_updated: 2026-04-15
---

# RFC Documentation

## Overview

These four RFCs define the technical architecture for Strata's game framework layers. They were created as part of Epic #50 and specify interfaces, factories, and systems that transform Strata from a rendering toolkit into a declarative game framework. All RFCs have status "Proposed" but partial implementations exist in `packages/core/src/`.

## Documents

| File | RFC | Issue | Layer | Implementation | Description |
|------|-----|-------|-------|---------------|-------------|
| [RFC-001-GAME-ORCHESTRATION.md](RFC-001-GAME-ORCHESTRATION.md) | RFC-001 | [#51](https://github.com/jbcom/strata-game-library/issues/51) | Layer 1 | 75% | Scenes, modes, triggers, transitions |
| [RFC-002-COMPOSITIONAL-OBJECTS.md](RFC-002-COMPOSITIONAL-OBJECTS.md) | RFC-002 | [#52](https://github.com/jbcom/strata-game-library/issues/52) | Layer 3 | 40% | Materials, skeletons, coverings, props, creatures |
| [RFC-003-WORLD-TOPOLOGY.md](RFC-003-WORLD-TOPOLOGY.md) | RFC-003 | [#53](https://github.com/jbcom/strata-game-library/issues/53) | Layer 2 | 70% | Regions, connections, world graph, spawning |
| [RFC-004-DECLARATIVE-GAMES.md](RFC-004-DECLARATIVE-GAMES.md) | RFC-004 | [#54](https://github.com/jbcom/strata-game-library/issues/54) | Layer 4 | 75% | createGame() API, StrataGame component, state presets |

## RFC-001: Game Orchestration (Layer 1)

**Source:** `packages/core/src/game/`

| Type | Exists | File | Notes |
|------|--------|------|-------|
| `SceneManager` | Yes | `SceneManager.ts` | Scene registration, load, push/pop stack |
| `ModeManager` | Yes | `ModeManager.ts` | Mode registration, stack operations, ModeInstance |
| `TriggerSystem` | Yes | `TriggerSystem.ts` | Proximity/collision/interaction/timed triggers |
| `TransitionManager` | Yes | `TransitionManager.ts` | Fade, crossfade, wipe, iris, and dissolve effects with runtime integration in `createGame()` |
| `Registry` | Yes | `Registry.ts` | Generic content registry |
| `types.ts` | Yes | `types.ts` | Scene, ModeConfig, ModeInstance, TriggerComponent, etc. |

**Missing:** Broader orchestration polish, richer transition choreography, and deeper trigger/game coordination.

## RFC-002: Compositional Objects (Layer 3)

**Source:** `packages/core/src/compose/`

| Type | Exists | File | Notes |
|------|--------|------|-------|
| `MaterialDefinition` | Yes | `materials/types.ts` | Base interface defined |
| `createFurMaterial` etc. | Partial | `materials/factory.ts` | Factory exists but missing built-in presets (fur_otter, wood_oak, etc.) |
| `SkeletonDefinition` | Yes | `skeletons/types.ts` | Interface defined |
| `createQuadrupedSkeleton` etc. | Yes | `skeletons/presets.ts` | Quadruped, biped, avian, and serpentine presets now exist |
| `CoveringDefinition` | Yes | `coverings.ts` | Region-based material application |
| `CreatureDefinition` | Yes | `creatures/types.ts` | Interface defined |
| `createCreature()` | Yes | `creatures/index.ts` | Public factory and composition resolver now exist |
| `PropDefinition` | Yes | `props/types.ts` | Interface defined |
| `createProp()` | Yes | `props/index.ts` | Public factory and composition resolver now exist |

**Missing:** Richer material factory coverage, renderer/runtime assembly, material physics properties, and procedural variation systems.

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
| `GameDefinition` | Partial | `createGame.ts` | Interface exists, built-in state presets now resolve into concrete initial state, basic structural validation exists, scene/mode lifecycle callbacks now receive runtime context, active mode input maps now drive the core input manager, pause status is reactive on the created `Game`, `ui.shell` now describes a renderer-agnostic built-in HUD/pause/loading shell, scenes can now declare renderer-agnostic announcement/title/menu/session shell cards with declarative actions, game/scene/mode transition defaults are declarative, and transition-aware scene/mode helpers route through `TransitionManager` |
| `StrataGame` | Yes | `adapters/r3f/src/StrataGame.tsx` | Lives in R3F adapter, not core |
| `useTransition()` | Yes | `adapters/r3f/src/StrataGame.tsx` | R3F hook for transition manager snapshots |
| `useInput()` / `useActionPressed()` / `useControlHints()` | Yes | `adapters/r3f/src/hooks/useInput.ts` | R3F hooks for live input-manager snapshots and current mode control hints |
| `useGameStatus()` / `usePauseToggle()` | Yes | `adapters/r3f/src/hooks/useGameStatus.ts` | Pause-aware runtime status hook plus opt-in action binding helper |
| `GameHUD` / `PauseMenu` / `SceneCard` | Yes | `adapters/r3f/src/components/ui/` | Built-in declarative HUD, pause-menu, and interactive scene-shell scaffold plus factory helpers |

Preset helper layer notes:
- Genre helpers now provide built-in mode input maps instead of empty control shells.
- Genre helpers now also provide `ui.shell` metadata for a built-in HUD, pause menu, and loading overlay.
- Genre helpers now also provide announcement-style scene shell metadata for their default starting scenes and can synthesize opt-in `titleScene` / `menuScene` / `saveScene` / `settingsScene` / `sessionShell` flows with genre-aware shell copy, including generated save-profile selector/archive flows.
- Core now also exposes `createSceneShellFlow()` so non-preset scene records can use the same generated title/menu/settings/session shell pipeline.
- Core now also exposes ready-to-register `createAnnouncementScene()`, `createTitleScene()`, `createMenuScene()`, and `createSessionScene()` helpers on top of the shell/action builders.
- Core shell-action builders now also cover save/load/delete persistence flows, `createGame()` exposes matching runtime persistence helpers plus `activeProfileId` tracking directly on the returned `Game`, archive scene shells can now surface live slot state through `saveSlots` metadata plus slot-level capability/status fields, generated profile selectors can now surface live occupancy plus state-aware start/continue entry labels through `saveProfiles` metadata, can now continue occupied profiles from their latest save or start empty profiles directly through `load-latest-profile`, generated title/menu flows can now continue the current profile through `load-active-profile`, generated save actions across title/menu/settings/session shells can now reopen the active profile archive directly via `open-active-profile-archive`, can now emit selector-level clear actions for occupied profiles, generated per-profile archives now default to profile-scoped `storageSlot` ids while keeping local slot ids stable in the UI, and `createSceneShellFlow()` can now return generated `saveProfileSceneIds` when a flow includes per-profile archives.
- Core now also exposes reusable scene-shell preset helpers and shell-action builders so custom games can assemble title/menu/session shells without hand-authoring raw metadata objects.
- Matching scene/mode overrides merge with preset defaults instead of replacing the whole template record.
- Reactive input hooks now sit on top of `InputManager` snapshots, so preset control maps are directly consumable from HUD/UI components.
- `SceneManager` snapshots now expose `pendingSceneId`, so definition-driven loading UI can render the target scene explicitly.
- `StrataGame` now renders `ui.menus.pause` automatically while paused, can synthesize the built-in HUD/pause/loading shell from `ui.shell`, renders interactive scene-shell cards from `scene.shell`, and keeps the active mode's pause binding live by default.
| `StatePresets` | Yes | `packages/core/src/game/state-presets.ts` | RPG, action, puzzle, sandbox, and racing factories now exist |

**Missing:** Full GameDefinition coverage matching RFC-004, richer game templates/presets beyond the helper layer, hot reload support, and deeper orchestration beyond the current lifecycle and input wiring.

## Key Context

- All RFCs share Epic #50 as parent tracking issue
- Implementation priority: Layer 1 > Layer 2 > Layer 3 > Layer 4 (but all have partial implementations)
- Critical path for "10x code reduction" goal: material factories -> skeleton presets -> createCreature() -> createProp() -> createGame() -> StrataGame
- The RFCs define APIs that PUBLIC_API.md references, but several still remain narrower than the full RFC vision
- `packages/core/` is pure TypeScript; StrataGame component is in `adapters/r3f/`

## Related

- [Architecture README](../README.md) - Parent directory index
- [Architecture AGENTS.md](../AGENTS.md) - Architecture area index
- [GAME_FRAMEWORK_VISION.md](../GAME_FRAMEWORK_VISION.md) - High-level vision document
- [ROADMAP.md](../ROADMAP.md) - Phase-by-phase implementation timeline
- [guides/MIGRATION.md](../guides/MIGRATION.md) - Toolkit-to-framework migration
- [guides/MIGRATION_DECLARATIVE.md](../guides/MIGRATION_DECLARATIVE.md) - Manual-to-declarative migration
