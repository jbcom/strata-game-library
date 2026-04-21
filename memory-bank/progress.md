---
title: Progress Tracker
version: "1.1"
updated: 2026-04-15
---

# Progress Tracker

## Game Framework Layers (Epic #50)

### Layer 1: Game Orchestration -- 90%

| Component | Status | Notes |
|-----------|--------|-------|
| SceneManager | Implemented | Scene registration and loading exist, and snapshots now expose `pendingSceneId` while scene loads are in flight |
| ModeManager | Implemented | Mode stack exists |
| createGame() | Implemented | High-level factory exists in `packages/core/src/api/createGame.ts`, resolves built-in state presets into real initial state, performs structural validation, and now exposes both definition-driven transition defaults and transition-aware scene/mode helpers |
| Scene lifecycle hooks | Partial | Scene and mode lifecycle callbacks now receive runtime context, scene/mode transitions route through `TransitionManager`, and transition defaults can now be declared on the game/scene/mode definitions, but broader orchestration remains thinner than the RFC vision |
| Mode-specific input remapping | Implemented | Active mode `inputMap` definitions now flow into the core `InputManager` action map, pausing preserves the pause binding while clearing the rest, and the input manager exposes reactive snapshots/subscriptions |
| R3F integration | Partial | `StrataGame`, `useGame`, `useScene`, `useMode`, `useInput`, `useActionPressed`, `useControlHints`, `useGameStatus`, and `useTransition` now exist, `StrataGame` binds the core input manager to the canvas, can synthesize built-in shell UI from `ui.shell`, renders pause menus automatically, renders boot/scene loading overlays from shell metadata, renders runtime-backed announcement/title/menu/session cards from `scene.shell`, and reflects transition state with a built-in overlay |
| Event/subscription model | Implemented | Scene/mode managers expose snapshots + subscriptions and `StrataGame` consumes them |

### Layer 2: World Topology -- 70%

| Component | Status | Notes |
|-----------|--------|-------|
| WorldGraph | Implemented | Graph-based regions exist |
| RegionSystem | Implemented | Region management present |
| ConnectionSystem | Implemented | Region connections present |
| SpawnSystem | Implemented | Entity placement exists |
| Spatial queries | Not started | `findNearby`, raycast-style helpers still absent |
| LOD (Level of Detail) | Not started | Still not a realized world-topology feature |
| Region traversal algorithms | Partial | General graph/pathfinding exists, dedicated topology helpers remain thin |

### Layer 3: Compositional Objects -- 65%

| Component | Status | Notes |
|-----------|--------|-------|
| Type definitions | Implemented | Core types and registries exist |
| Material system types | Partial | Structure and presets exist, but richer physics/variation behavior is still thin |
| Skeleton presets | Implemented | Quadruped, biped, avian, and serpentine presets now exist |
| createCreature() | Implemented | Public factory and composition resolver now exist |
| createProp() | Implemented | Public factory and composition resolver now exist |
| Material physics / variation | Not started | Still mostly design-space, not realized API |
| Material swapping | Not started | No supported runtime factory surface |

### Layer 4: Declarative Games -- 75%

| Component | Status | Notes |
|-----------|--------|-------|
| createGame() API | Implemented | Exists, is test-covered, honors built-in state presets at runtime, performs structural validation, and now exposes transition-aware scene/mode helpers plus first-class persistence helpers and save metadata lookup on the returned game runtime |
| StrataGame component | Partial | Exists in `adapters/r3f`, now uses manager subscriptions, binds the core input manager, renders pause menus automatically, renders definition-driven boot and scene loading overlays, renders runtime-backed scene shell cards from active scene metadata, and reflects transition state, but broader declarative ergonomics are still thin |
| State preset factories | Implemented | `createRPGState`, `createActionState`, `createPuzzleState`, `createSandboxState`, and `createRacingState` now exist in core |
| Game preset helpers | Implemented | `createRPGGame`, `createActionGame`, `createPuzzleGame`, `createSandboxGame`, `createRacingGame`, and `createPlatformerGame` now exist, ship genre-specific transition defaults, include built-in mode control maps, provide `ui.shell` metadata for the default HUD/pause/loading scaffold plus announcement-style scene shell metadata for their default starting scenes, can now synthesize opt-in `titleScene` / `menuScene` / `saveScene` / `settingsScene` / `sessionShell` flows with genre-aware copy and action labels, can generate save-profile selector/archive flows with slot-level archive capability metadata, runtime save metadata lookup, state-aware profile entry labels, direct latest-save/start-new profile entry behavior, active-profile-aware continue actions in generated title/menu shells, active-profile archive reopen behavior across generated save actions, selector-level clear actions, default profile-scoped `storageSlot` namespacing, and live per-profile occupancy summaries, and now build those flows on a shared `createSceneShellFlow()` core helper |
| Scene shell preset helpers | Implemented | `createAnnouncementSceneShell`, `createTitleSceneShell`, `createMenuSceneShell`, `createSessionSceneShell`, `createSaveSceneShell`, `createSaveProfilesSceneShell`, ready-to-register scene builders, and scene-shell action builders now exist in core and are exported through the umbrella package, including persistence-backed save/load/delete actions plus `load-latest-profile`, `load-active-profile`, and `open-active-profile-archive`, archive `saveSlots` metadata, selector `saveProfiles` metadata, state-aware profile entry labels, selector-level clear actions, profile-aware `storageSlot` support, and runtime save metadata surfaces for built-in save-shell UIs |
| Declarative content loading | Partial | Registries exist, built-in HUD/pause/loading/scene-card scaffolding now exists in both manual React and declarative metadata forms, scene shells can now execute runtime-backed actions, `createSceneShellFlow()` can synthesize reusable title/menu/settings/session shell flows around arbitrary scenes, and preset helpers build on that layer, but there is still not a full content pipeline or richer game-shell preset layer |

## Infrastructure -- 95%

| Component | Status | Notes |
|-----------|--------|-------|
| Nx monorepo setup | Done | 10 packages + 2 apps plus new umbrella package |
| CI pipeline | Done | Matrix build/lint/test in place |
| CD pipeline | Done | release-please integration in place |
| npm publishing pipeline | Done | OIDC trusted publishing configured |
| Documentation site | Done | Starlight docs site exists |
| Package READMEs | Done | All packages have READMEs |
| Package metadata | Done | Standardized across workspace |
| Umbrella package scaffold | Done | `packages/strata-game-library` created, locally verified, and its build/test scripts now prepare internal workspace dependencies automatically |
| Trusted publisher config | Partial | mobile rename/publish edge cases remain |
| npm publication completeness | Partial | several packages still workspace-only |

## Test Coverage -- Summary

Coverage remains strong at the package level, but there are still two important holes:

1. `apps/docs` prevents a clean full-workspace typecheck.
2. Browser integration tests for core are not currently part of regular CI.

## Critical Path to Framework Completion

1. Publish the umbrella package and finalize package migration strategy.
2. Expand the composition layer from normalized definitions into richer runtime/render integration where needed.
3. Add higher-level declarative hooks/presets on top of the new manager subscription model.
4. Restore docs typecheck and browser integration tests to the standard verification path.

## What's Working Well

- The toolkit/runtime packages are in generally good condition.
- The repo structure is coherent after the monorepo migration.
- The umbrella package now exists as a concrete starting point for single-package distribution.

## What Needs Attention

- Layer 3 and Layer 4 are still only partially realized.
- Package publishing is inconsistent across adapters/plugins.
- Status and planning docs need continued maintenance to stay aligned with the actual code.
