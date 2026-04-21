# Strata Implementation Status

Snapshot date: `2026-04-21`

Full post-session remaining-work scope: [docs/plans/2026-04-16-remaining-work-prd.md](docs/plans/2026-04-16-remaining-work-prd.md)

This document reflects the actual state of the repository after the umbrella-package consolidation audit. It distinguishes between the mature rendering/toolkit surface and the still-partial Layer 3/4 game-framework vision.

## Current State

| Area | Status | Notes |
|------|--------|-------|
| Core rendering/toolkit packages | Strong | Terrain, water, sky, shaders, ECS/state, pathfinding, physics primitives, presets, and most plugin/package test suites are in good shape |
| Monorepo infrastructure | Strong | Nx + pnpm workspace, CI/CD, release-please, package metadata, and READMEs are established |
| Umbrella package `strata-game-library` | In progress | Workspace package now exists and passes local `lint`, `typecheck`, `build`, and `test`; first npm publish has not happened |
| Scoped package publishing | Partial | `core`, `shaders`, `presets`, and `audio-synth` are published; `r3f`, `reactylon`, `model-synth`, and `astro` are still workspace-only |
| Mobile package rename | Partial | npm still uses `@strata-game-library/capacitor-plugin` and `@strata-game-library/react-native-plugin`; workspace has moved to `capacitor` and `react-native` |
| Layer 3 compositional objects | Partial | Material presets, full built-in skeleton presets, and public `createCreature()` / `createProp()` factories now exist, but richer composition/runtime assembly work remains |
| Layer 4 declarative games | Partial | `createGame()`, state preset factories, preset game helpers, definition-driven transition defaults, built-in genre control maps, definition-driven `ui.shell` defaults, scene-level shell cards, pause-aware runtime snapshots, transition-aware scene/mode helpers, reactive input snapshots/hooks, `StrataGame`, built-in HUD/pause-menu/loading/scene-card scaffolding, and `useTransition()` now exist, but richer template content and deeper orchestration are still incomplete |
| Documentation/status tracking | Partial | Umbrella package docs are now aligned, but some planning/status docs still need continued cleanup |
| Full verification | Partial | Root lint/typecheck/build/test plus docs/docs:internal are green, including CI on PR #88; browser integration coverage still has known gaps |

## Mature Areas

- Core packages are structurally solid and extensively tested at the package level.
- The repo move to `jbcom/strata-game-library` is complete and the local checkout points at that GitHub repository.
- The old split repositories have effectively been folded back into the monorepo for all runtime library code.
- A first-pass single-install umbrella package now exists at `packages/strata-game-library`.

## Incomplete Areas

### Composition Layer

- `packages/core/src/compose/creatures/index.ts`
  - `createCreature()` and `resolveCreatureComposition()` now exist, but they currently normalize definitions and resolve registry-backed coverings/materials rather than generating renderer-ready creature rigs or meshes.
- `packages/core/src/compose/props/index.ts`
  - `createProp()` and `resolvePropComposition()` now exist, but they currently resolve definition-time materials rather than building render/runtime instances.
- `packages/core/src/compose/materials/`
  - Presets and factories exist, but material physics, procedural variation, and runtime swapping are still thin.

### Declarative Game Layer

- `packages/core/src/api/createGame.ts`
  - The high-level API now resolves built-in state presets (`rpg`, `action`, `puzzle`, `sandbox`, `racing`) into real initial store state and exports `createRPGState()` / related helpers.
  - It also now performs basic validation for missing scenes/modes and duplicate content ids.
  - Scene and mode lifecycle callbacks now receive runtime context from the created game instance, and `ModeManager` now runs mode `setup` / `teardown` instead of only enter/exit callbacks.
  - Active mode `inputMap` definitions now flow into the core `InputManager`, so mode changes remap live action bindings instead of leaving input metadata inert.
  - The created `Game` instance now exposes reactive pause status via `isPaused`, `getSnapshot()`, and `subscribe()`, and pausing narrows the live action map to the current mode's pause binding.
  - The created `Game` instance now also exposes first-class persistence helpers via `save()`, `load()`, `deleteSave()`, `listSaves()`, and `getSaveInfo()` instead of forcing runtime consumers through `store.getState()`, plus reactive `activeProfileId` tracking for profile-aware save-shell flows.
  - `GameDefinition.transitions` now provides declarative scene/mode transition defaults, and individual scenes/modes can override them with their own `transition` config.
  - Transition-aware `loadScene()`, `pushScene()`, `popScene()`, `pushMode()`, `replaceMode()`, and `popMode()` helpers now route through `TransitionManager`.
  - Remaining gap: richer declarative systems, deeper transition choreography, and fuller scene/mode coordination are still incomplete.
- `packages/core/src/game/game-presets.ts`
  - `createRPGGame()`, `createActionGame()`, `createPuzzleGame()`, `createSandboxGame()`, `createRacingGame()`, and `createPlatformerGame()` now exist and provide default scenes, modes, genre-specific mode `inputMap`s, initial/default key inference, genre-specific transition defaults, built-in `ui.shell` HUD/pause/loading metadata, built-in announcement-style scene shell metadata for their default starting scenes, and opt-in synthesized `titleScene` / `menuScene` / `saveScene` / `settingsScene` / `sessionShell` flows.
  - Generated shell flows now also use genre-aware copy and action labels instead of generic defaults.
  - Shared `createSceneShellFlow()` synthesis now exists in core, and the preset helpers build on that reusable flow layer instead of duplicating title/menu/save/settings/session scene assembly logic.
  - Matching scene/mode overrides now merge with preset defaults instead of forcing all-or-nothing replacement.
  - Remaining gap: these are thin structural templates, not rich genre content packs or complete gameplay presets.
- `packages/core/src/game/scene-shell-presets.ts`
  - Reusable `createAnnouncementSceneShell()`, `createTitleSceneShell()`, `createMenuSceneShell()`, `createSessionSceneShell()`, `createSaveSceneShell()`, scene-definition builders, and scene-shell action helpers now exist in core and are exported through the umbrella package.
  - Scene-shell action helpers now also cover persistence via `createSaveGameSceneShellAction()`, `createLoadGameSceneShellAction()`, `createDeleteSaveSceneShellAction()`, and `createClearProfileSceneShellAction()`, and the R3F adapter executes those against the live `Game` runtime.
  - Archive shells can now also declare `saveSlots` metadata, including slot-level `allowSave` / `allowLoad` / `allowDelete` controls plus custom `savedLabel` / `emptyLabel` copy, the built-in R3F scene card reflects live slot state and save metadata instead of treating save archives like flat action lists only, and `saveScene` can now generate a dedicated `profiles` shell with per-profile archive scenes, live occupancy summaries, latest-save metadata, state-aware start/continue entry labels, direct latest-save/start-new profile entry behavior, active-profile-aware continue actions in generated title/menu shells, active-profile archive reopen behavior across generated save actions, selector-level clear actions, and default profile-scoped `storageSlot` namespacing on top of the same runtime-backed persistence flow.
  - Remaining gap: there are still no richer opinionated title/menu/session/archive shell packs beyond the current composable primitives plus preset-level flow synthesis.
- `adapters/r3f/src/StrataGame.tsx`
  - `StrataGame`, `useGame`, `useScene`, `useMode`, and `useTransition` now use manager subscriptions rather than polling.
  - `StrataGame` now also attaches the core `InputManager` to the R3F canvas DOM element so default game mounts activate the input runtime.
  - The R3F adapter now also exposes `useInput()`, `useActionPressed()`, `useCurrentInputMap()`, `useControlHints()`, `useGameStatus()`, and `usePauseToggle()` on top of runtime/input snapshots, so HUDs and menus can react to live bindings and pause state instead of re-reading static config.
  - A built-in transition overlay now reflects `TransitionManager` state for fade/crossfade/wipe/iris/dissolve transitions.
  - `SceneManager` snapshots now expose `pendingSceneId` while scene loads are in flight, so shell UIs can render the actual destination scene.
  - Built-in `GameHUD`, `PauseMenu`, and `SceneCard` helpers now provide a first-pass declarative game-shell scaffold, and `StrataGame` can synthesize the same HUD/pause/loading shell from `ui.shell` metadata while also rendering interactive announcement/title/menu/session scene cards from `scene.shell`.
  - Remaining gap: richer declarative orchestration beyond the current helpers and base component is still missing.

### Package Consolidation / Publishing

- `strata-game-library` is not yet published to npm.
- The migration strategy for existing `@strata-game-library/*` consumers is not finalized.
- `r3f`, `reactylon`, `model-synth`, and `astro` still need either standalone npm publication or an explicit decision to fold them behind umbrella-only subpaths.

### Platform / Plugin Gaps

- `plugins/model-synth/src/index.ts`
  - TODOs remain for optional rigging and animation handling.
- `plugins/react-native/android/src/main/java/com/strata/reactnative/StrataModule.kt`
  - Gamepad detection is still a TODO.
- `plugins/react-native/ios/StrataModule.swift`
  - MFi controller detection is still a TODO.
- `packages/core/src/core/shared/platform.ts`
  - React Native support is still explicitly marked as not yet implemented in core shared platform helpers.

## Verification Snapshot

Verified during this session:

- `pnpm run lint`: passed
- `pnpm run typecheck`: passed, including `apps/docs`
- `pnpm run build`: passed
- `pnpm run test`: passed
- `pnpm run docs`: passed
- `pnpm run docs:internal`: passed
- `pnpm nx run @strata-game-library/docs:typecheck --skip-nx-cache`: passed after the R3F `bufferAttribute` JSX update
- `pnpm nx run @strata-game-library/docs:build --skip-nx-cache`: passed after the R3F `bufferAttribute` JSX update
- PR #88 CI on GitHub: passed for lint, typecheck, build, test, docs, dependency review, and CodeQL

Known remaining verification gaps:

- `packages/core/tests/integration-playwright/README.md` documents browser integration tests as temporarily disabled in CI.

## Done Means

The library should not be treated as a fully actualized game framework until all of the following are true:

1. `strata-game-library` is published and versioned as the supported umbrella entrypoint.
2. The scoped-package migration plan is explicit: keep, deprecate, or fold each existing package.
3. The composition layer graduates from normalized definitions to fuller runtime/render integration where needed.
4. Declarative game helpers expand beyond the current core factory plus manager subscriptions into fuller lifecycle/preset ergonomics.
5. Documentation and status files agree with the actual package and feature state.
6. Browser integration coverage is back in regular verification.
