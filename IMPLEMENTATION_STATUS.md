# Strata Implementation Status

Snapshot date: `2026-04-21`

Full post-session remaining-work scope: [docs/plans/2026-04-16-remaining-work-prd.md](docs/plans/2026-04-16-remaining-work-prd.md)

This document reflects the actual state of the repository after the umbrella-package consolidation audit. It distinguishes between the mature rendering/toolkit surface and the still-partial Layer 3/4 game-framework vision.

## Current State

| Area | Status | Notes |
|------|--------|-------|
| Core rendering/toolkit packages | Strong | Terrain, water, sky, shaders, ECS/state, pathfinding, physics primitives, presets, and most plugin/package test suites are in good shape |
| Monorepo infrastructure | Strong | Nx + pnpm workspace, CI/CD, release-please, package metadata, and READMEs are established |
| Umbrella package `strata-game-library` | In progress | Workspace package now exists, passes local `lint`, `typecheck`, `build`, and `test`, is release-tracked, and is included in the npm publish workflow; first npm publish has not happened |
| Scoped package publishing | Partial | `core`, `shaders`, `presets`, and `audio-synth` are published; `r3f`, `reactylon`, `model-synth`, and `astro` are still workspace-only |
| Mobile package rename | Partial | npm still uses `@strata-game-library/capacitor-plugin` and `@strata-game-library/react-native-plugin`; workspace has moved to `capacitor` and `react-native` |
| Layer 3 compositional objects | Partial | Material presets, procedural material trait metadata, procedural shader/texture layer plans, R3F procedural material shader injection, Reactylon/Babylon PBR procedural material shader injection, full built-in skeleton presets, public `createCreature()` / `createProp()` factories, adapter-neutral runtime assembly plans, material slots, bounds, physics metadata, creature asset bindings, prop interaction action descriptors and execution helpers, first-pass R3F runtime renderers, R3F static GLB prop-node loading, R3F GLB-backed creature loading, R3F/Reactylon prop interaction seams, Reactylon runtime descriptors, native Babylon instantiation helpers, async Babylon asset loading helpers, and API-showcase examples now exist; renderer-ready rig retargeting/control and full asset-pipeline integration remain incomplete |
| Layer 4 declarative games | Partial | `createGame()`, state preset factories, preset game helpers, definition-driven transition defaults, built-in genre control maps, definition-driven `ui.shell` defaults, scene-level shell cards, pause-aware runtime snapshots, transition-aware scene/mode helpers, reactive input snapshots/hooks, `StrataGame`, built-in HUD/pause-menu/loading/scene-card scaffolding, and `useTransition()` now exist, but richer template content and deeper orchestration are still incomplete |
| Documentation/status tracking | Partial | Umbrella package docs, package strategy, split-repo parity matrix, and migration guide are now aligned, but planning/status docs still need continued cleanup as implementation moves |
| Full verification | Partial | Root lint/typecheck/build/test plus docs/docs:internal are green, including CI on PR #88; core browser integration is restored, model-synth package tests cover character rigging/animation orchestration, examples now verify umbrella-package imports/dependencies, nested Vite bundles, built-output browser smoke, API-showcase composition-tab runtime exercise, and WebGL-backed canvas creation when Chromium exposes WebGL, but broader adapter/example visual runtime coverage is still thin |

## Mature Areas

- Core packages are structurally solid and extensively tested at the package level.
- The repo move to `jbcom/strata-game-library` is complete and the local checkout points at that GitHub repository.
- The old split repositories have effectively been folded back into the monorepo for all runtime library code.
- A first-pass single-install umbrella package now exists at `packages/strata-game-library`.
- The package migration policy is documented: the umbrella package is the default install path, scoped packages remain supported direct entrypoints during this cycle, and only legacy mobile `-plugin` names are planned for deprecation after renamed package publication.

## Incomplete Areas

### Composition Layer

- `packages/core/src/compose/creatures/index.ts`
  - `createCreature()` and `resolveCreatureComposition()` now exist, and resolved compositions now include adapter-neutral runtime bones with serializable transforms, bounds, material slots, animation bindings, IK metadata, spawn metadata, and physics profiles.
  - Resolved creature compositions now also preserve optional model, rig, animation-clip, and bone-map asset bindings for adapter-owned creature rendering.
  - Remaining gap: they still do not generate renderer-ready creature rigs, retarget skeletal clips, or provide high-level animation control.
- `packages/core/src/compose/props/index.ts`
  - `createProp()` and `resolvePropComposition()` now exist, and resolved compositions now include runtime nodes, material slots, interaction/audio metadata, bounds, and physics profiles.
  - Runtime prop output now also includes interaction action descriptors with stable ids, adapter labels, enabled state, affected node ids, audio cues, and payload metadata.
  - `executePropInteractionAction()` now converts those descriptors plus optional state into deterministic next-state/effect records for container, seat, door, switch, and collectible behavior.
  - Remaining gap: higher-level interaction UX/physics integration and full asset-pipeline-backed render instances.
- `packages/core/src/compose/materials/`
  - Presets and factories now include default physics metadata, and `createMaterialVariant()` / `createMaterialVariants()` support deterministic runtime variation and swapping metadata.
  - `MaterialDefinition.traits`, `createMaterialTrait()`, and `inferMaterialTraits()` now provide serializable procedural trait metadata for grain, fibers, scratches, wear, patina, veins, mottle, and absorption channels.
  - `createMaterialProceduralPlan()` now turns traits into deterministic adapter-neutral shader/texture layer plans with channels, uniforms, GLSL helper chunks, and per-trait algorithms.
  - Remaining gap: generated texture baking, authoring UX, and shader application beyond the current R3F/Babylon paths are still thin.

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
- `adapters/r3f/src/components/compose/`
  - `RuntimeProp` and `RuntimeCreature` now consume core composition runtime plans and render primitive R3F geometry with orientation-aware capsule geometry, material overrides, custom node/bone render hooks, and material conversion helpers.
  - `RuntimeAssetMesh` now lets mesh-shaped prop nodes with a `mesh` URL render static GLB assets through Drei's GLTF cache while preserving runtime material metadata and a source-material mode.
  - `RuntimeCreatureAsset` now lets asset-bound runtime creatures render GLB models through Drei's GLTF cache and map logical animation names to source clip names, and `RuntimeCreature` can select that path through `assetMode` / `animation`.
  - `RuntimeProp` can now execute core prop interaction actions from node clicks via `onInteraction`, `interactionState`, and `selectInteractionAction`.
  - Runtime material creation now infers or carries core procedural material traits and shader/texture layer plans into Three.js material `userData`, and injects those plans into `MeshStandardMaterial` shader compilation for base-color, scalar, opacity, emissive, and normal-channel effects.
  - `apps/examples/api-showcase` now renders the real tabbed showcase entrypoint, demonstrates `RuntimeProp`, `RuntimeCreature`, `resolvePropComposition()`, `resolveCreatureComposition()`, and runtime material variants through the consolidated package surface, and its browser smoke test exercises the composition tab.
  - Remaining gap: richer creature rig retargeting/skeletal animation control, physics/shell integration, and broader visual runtime assertions are still incomplete.
- `adapters/reactylon/src/components/compose/`
  - `StrataRuntimeProp`, `StrataRuntimeCreature`, `resolveReactylonRuntimeProp()`, and `resolveReactylonRuntimeCreature()` now consume the same core runtime plans and expose serializable Babylon/Reactylon descriptors with material slots, transforms, bounds, physics, prop interaction actions, animation metadata, IK, and spawn metadata.
  - Reactylon creature descriptors now preserve core creature asset bindings so Babylon loaders can consume the same model, rig, clip, and bone-map metadata.
  - Reactylon runtime material descriptors now infer or preserve core procedural material traits and shader/texture layer plans.
  - `createBabylonRuntimeMaterial()` now applies those plans through a Babylon PBR material plugin for procedural albedo, scalar, opacity, and emissive channels.
  - `instantiateBabylonRuntimeProp()`, `instantiateBabylonRuntimePropAsync()`, `instantiateBabylonRuntimeCreature()`, and `instantiateBabylonRuntimeCreatureAsset()` now instantiate those descriptors as native Babylon PBR materials, transform roots, primitive meshes, async asset-backed meshes, runtime metadata, custom mesh-factory seams, logical animation playback helpers, and executable prop interaction helpers.
  - Remaining gap: richer rig retargeting/control beyond loaded clip playback, higher-level interaction UX integration, and visual example coverage are still incomplete.

### Package Consolidation / Publishing

- `strata-game-library` is not yet published to npm.
- npm trusted publishing still needs to be verified for the first umbrella package release.
- `r3f`, `reactylon`, `model-synth`, and `astro` still need standalone npm publication.
- `capacitor` and `react-native` still need renamed-package publication before the old `capacitor-plugin` and `react-native-plugin` names can be deprecated.
- Historical split-repo parity is now documented in `docs/architecture/CONSOLIDATION_PARITY_MATRIX.md`; remaining parity work is limited to old Capacitor example/e2e coverage and broader WebGL-capable adapter/example runtime verification.

### Platform / Plugin Gaps

- `plugins/model-synth/src/index.ts`
  - High-level character generation now performs Meshy preview/refine, rigging, and animation orchestration, returns preview/rigging/animation task metadata and URL maps, and validates named animation requests before generating a model. A gated `pnpm --dir plugins/model-synth test:smoke` command now exists; remaining work is running it with real credentials and adding production guidance for plan/rate-limit/licensing constraints.
- `plugins/react-native/android/src/main/java/com/strata/reactnative/StrataModule.kt`
  - Android controller detection and native `getInputSnapshot()` now exist through `InputDevice` enumeration plus button/axis state holders for host-forwarded events.
- `plugins/react-native/ios/StrataModule.swift`
  - iOS GameController/MFi detection and native `getInputSnapshot()` now exist for connected controller buttons, sticks, and triggers.
- `packages/core/src/core/shared/platform.ts`
  - React Native detection now has an `isReactNative()` alias and `selectAdapter()` accepts an explicit `reactNative` adapter slot in addition to the generic `native` slot.

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
- `pnpm nx run @strata-game-library/core:build --skip-nx-cache`: passed after bundling maath submodules into the core ESM output
- `pnpm nx run @strata-game-library/core:test:e2e -- --project=chromium --reporter=list`: passed, 32 browser integration tests
- `pnpm --dir plugins/react-native typecheck`: passed after native snapshot type updates
- `pnpm --dir plugins/react-native test`: passed, covering controller-aware device profiles and native input snapshot polling
- `pnpm nx run @strata-game-library/react-native:test --skip-nx-cache`: passed for the same React Native coverage through the CI-style Nx target
- `pnpm nx run @strata-game-library/docs:build --skip-nx-cache`: passed after React Native mobile docs updates
- `pnpm nx run @strata-game-library/core:build --skip-nx-cache`: passed after React Native adapter-map changes
- `pnpm --dir packages/core test:unit -- tests/unit/core/platform.test.ts tests/unit/core/platform-ssr.test.ts`: passed, 39 files / 994 tests
- `pnpm --dir plugins/model-synth typecheck`: passed after character rigging/animation orchestration updates
- `pnpm --dir plugins/model-synth test`: passed, 38 tests covering Meshy clients and high-level character preview/refine/rigging/animation orchestration
- `pnpm --dir plugins/model-synth test:smoke`: passed in no-key skip mode; live billable verification requires `MESHY_API_KEY`, `MESHY_SMOKE_CREATE_CHARACTER=1`, and `MESHY_SMOKE_CONFIRM_COSTS=1`
- `pnpm --dir apps/examples verify`: passed, enforcing umbrella-package example dependencies, no legacy `@jbcom/strata` references outside generated docs, and Vite bundles for six nested examples
- `pnpm --dir apps/examples test`: passed, including examples verification plus Chromium smoke coverage for built `api-showcase`, `basic-terrain`, `sky-volumetrics`, `vegetation-showcase`, `water-scene`, and `world-topology` output
- `NX_DAEMON=false pnpm nx run @strata-game-library/examples:test --skip-nx-cache`: passed after `pnpm nx reset`, including examples verification and dependency builds
- PR #88 CI on GitHub: passed for lint, typecheck, build, test, docs, dependency review, and CodeQL
- `pnpm --dir packages/core typecheck`: passed after composition runtime assembly updates
- `pnpm --dir packages/core test:unit -- tests/unit/compose/runtime-composition.test.ts tests/unit/api/exports.test.ts`: passed, including runtime composition assembly coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/core:build --skip-nx-cache`: passed after composition runtime assembly updates
- `pnpm --dir packages/strata-game-library exec tsup`: passed, confirming umbrella package declarations and subpath bundles still emit
- `pnpm --dir adapters/r3f typecheck`: passed after R3F runtime composition renderer updates
- `pnpm --dir adapters/r3f test -- src/components/compose/__tests__/compose.test.ts`: passed, including runtime composition export/material/geometry/asset-node coverage
- `pnpm --dir adapters/r3f exec biome check src/components/compose src/components/index.ts`: passed for the new R3F compose component surface
- `NX_DAEMON=false pnpm nx run @strata-game-library/r3f:build --skip-nx-cache`: passed after R3F runtime composition renderer updates
- `pnpm --dir packages/strata-game-library exec tsup`: passed after the R3F build, confirming umbrella bundles pick up the new runtime composition exports
- `pnpm --dir apps/examples/api-showcase exec tsc --noEmit`: passed after adding explicit R3F JSX type augmentation to the API-showcase app
- `pnpm --dir apps/examples exec vite build api-showcase --config api-showcase/vite.config.ts --logLevel warn`: passed for the composition-enabled API showcase bundle
- `pnpm --dir apps/examples/api-showcase exec typedoc --out docs src/examples/index.ts`: passed with existing showcase JSDoc tag warnings
- `pnpm --dir apps/examples verify`: passed, including all six example bundles after adding composition runtime coverage
- `pnpm --dir adapters/reactylon typecheck`: passed after adding Reactylon runtime composition descriptors and Babylon instantiation helpers
- `pnpm --dir adapters/reactylon test -- tests/compose.test.ts`: passed, including all existing Reactylon tests plus descriptor and Babylon `NullEngine` instantiation coverage
- `pnpm --dir adapters/reactylon exec biome check src/components/compose src/index.ts tests/compose.test.ts`: passed
- `NX_DAEMON=false pnpm nx run @strata-game-library/reactylon:build --skip-nx-cache`: passed after descriptor exports
- `pnpm --dir packages/strata-game-library exec tsup`: passed after Reactylon descriptor exports
- `pnpm --dir packages/core typecheck`: passed after prop interaction execution helpers
- `pnpm --dir packages/core test:unit -- tests/unit/compose/runtime-composition.test.ts`: passed, 40 files / 999 tests including interaction execution coverage
- `pnpm --dir packages/core check`: passed after prop interaction execution helpers
- `NX_DAEMON=false pnpm nx run @strata-game-library/core:build --skip-nx-cache`: passed after prop interaction execution helpers
- `pnpm --dir packages/strata-game-library exec tsup`: passed after prop interaction execution helpers
- `pnpm --dir adapters/r3f typecheck`: passed after `RuntimeProp` interaction wiring
- `pnpm --dir adapters/r3f test -- src/components/compose/__tests__/compose.test.ts`: passed, 30 files / 327 tests including R3F runtime prop interaction action coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/r3f:build --skip-nx-cache`: passed after `RuntimeProp` interaction wiring
- `pnpm --dir adapters/reactylon typecheck`: passed after Babylon prop interaction execution wiring
- `pnpm --dir adapters/reactylon test -- tests/compose.test.ts`: passed, 6 files / 48 tests including Babylon prop interaction execution coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/reactylon:build --skip-nx-cache`: passed after Babylon prop interaction execution wiring
- `pnpm --dir packages/strata-game-library exec tsup`: passed after adapter interaction wiring
- `pnpm --dir packages/core typecheck`: passed after procedural material trait metadata
- `pnpm --dir packages/core test:unit -- tests/unit/compose/runtime-composition.test.ts`: passed, 40 files / 1000 tests including material trait coverage
- `pnpm --dir packages/core check`: passed after procedural material trait metadata
- `NX_DAEMON=false pnpm nx run @strata-game-library/core:build --skip-nx-cache`: passed after procedural material trait metadata
- `pnpm --dir adapters/r3f typecheck`: passed after preserving material traits on Three.js material `userData`
- `pnpm --dir adapters/r3f test -- src/components/compose/__tests__/compose.test.ts`: passed, 30 files / 327 tests including R3F material trait metadata coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/r3f:build --skip-nx-cache`: passed after material trait metadata wiring
- `pnpm --dir adapters/reactylon typecheck`: passed after preserving material traits in Reactylon descriptors
- `pnpm --dir adapters/reactylon test -- tests/compose.test.ts`: passed, 6 files / 48 tests including Reactylon material trait metadata coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/reactylon:build --skip-nx-cache`: passed after material trait metadata wiring
- `pnpm --dir packages/strata-game-library exec tsup`: passed after procedural material trait metadata
- `pnpm --dir packages/core typecheck`: passed after creature asset binding metadata
- `pnpm --dir packages/core test:unit -- tests/unit/compose/runtime-composition.test.ts`: passed, 40 files / 1001 tests including creature asset binding coverage
- `pnpm --dir packages/core check`: passed after creature asset binding metadata
- `NX_DAEMON=false pnpm nx run @strata-game-library/core:build --skip-nx-cache`: passed after creature asset binding metadata
- `pnpm --dir adapters/r3f typecheck`: passed after `RuntimeCreatureAsset` GLB-backed creature rendering support
- `pnpm --dir adapters/r3f test -- src/components/compose/__tests__/compose.test.ts`: passed, 30 files / 328 tests including R3F creature asset binding export/runtime coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/r3f:build --skip-nx-cache`: passed after `RuntimeCreatureAsset` support
- `pnpm --dir adapters/reactylon typecheck`: passed after preserving creature asset bindings in Reactylon descriptors
- `pnpm --dir adapters/reactylon test -- tests/compose.test.ts`: passed, 6 files / 48 tests including Reactylon creature asset descriptor coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/reactylon:build --skip-nx-cache`: passed after Reactylon creature asset descriptor coverage
- `pnpm --dir packages/strata-game-library exec tsup`: passed after creature asset binding and adapter export updates
- `git diff --check`: passed after creature asset binding updates
- `pnpm --dir apps/examples exec biome check --write api-showcase/src/main.tsx tests/e2e/examples.spec.ts`: passed after wiring the API showcase entrypoint to the real app and adding browser runtime assertions
- `pnpm --dir apps/examples/api-showcase exec tsc --noEmit`: passed after wiring the built API showcase entrypoint to the real tabbed app
- `pnpm --dir apps/examples test`: passed, including six nested Vite builds, six Chromium built-output smoke tests, API-showcase composition-tab exercise, and WebGL-backed canvas assertions when Chromium exposes WebGL
- `pnpm --dir packages/core typecheck`: passed after procedural material plan generation
- `pnpm --dir packages/core test:unit -- tests/unit/compose/runtime-composition.test.ts`: passed, 40 files / 1001 tests including procedural material plan coverage
- `pnpm --dir packages/core check`: passed after procedural material plan generation
- `NX_DAEMON=false pnpm nx run @strata-game-library/core:build --skip-nx-cache`: passed after procedural material plan generation
- `pnpm --dir adapters/r3f typecheck`: passed after carrying procedural material plans into Three.js material `userData` and injecting them into shader compilation
- `pnpm --dir adapters/r3f test -- src/components/compose/__tests__/compose.test.ts`: passed, 30 files / 329 tests including R3F procedural plan metadata and shader-injection coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/r3f:build --skip-nx-cache`: passed after R3F procedural material plan metadata and shader injection
- `pnpm --dir adapters/reactylon typecheck`: passed after preserving procedural material plans in descriptors
- `pnpm --dir adapters/reactylon test -- tests/compose.test.ts`: passed, 6 files / 48 tests including Reactylon procedural plan metadata coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/reactylon:build --skip-nx-cache`: passed after Reactylon procedural material plan metadata
- `pnpm --dir packages/strata-game-library exec tsup`: passed after procedural material plan exports and adapter metadata propagation
- `git diff --check`: passed after procedural material plan updates
- `pnpm --dir adapters/reactylon typecheck`: passed after async Babylon asset loading helpers
- `pnpm --dir adapters/reactylon test -- tests/compose.test.ts`: passed, 6 files / 50 tests including async prop-node loading, creature-asset loading, and Babylon animation playback coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/reactylon:build --skip-nx-cache`: passed after async Babylon asset loading helpers
- `pnpm --dir packages/strata-game-library exec tsup`: passed after async Babylon asset loading exports
- `git diff --check`: passed after async Babylon asset loading updates
- `pnpm --dir adapters/reactylon lint`: passed after Babylon PBR procedural material plugin support
- `pnpm --dir adapters/reactylon typecheck`: passed after Babylon PBR procedural material plugin support
- `pnpm --dir adapters/reactylon test -- tests/compose.test.ts`: passed, 6 files / 50 tests including Babylon procedural material plugin, async asset loading, and animation playback coverage
- `NX_DAEMON=false pnpm nx run @strata-game-library/reactylon:build --skip-nx-cache`: passed after Babylon PBR procedural material plugin support
- `pnpm --dir packages/strata-game-library exec tsup`: passed after Babylon PBR procedural material plugin exports
- `git diff --check`: passed after Babylon PBR procedural material plugin updates

Known remaining verification gaps:

- Adapter and example browser runtime coverage is not yet as complete as the restored core browser integration suite; the examples smoke target now asserts WebGL-backed canvas creation when the runner exposes WebGL, but still intentionally skips that assertion in headless environments that cannot provide it.
- Live billable Meshy generation was not run in this repo because it requires real account credentials and explicit cost confirmation.

## Done Means

The library should not be treated as a fully actualized game framework until all of the following are true:

1. `strata-game-library` is published and versioned as the supported umbrella entrypoint.
2. The documented scoped-package migration plan is executed in npm publishing and deprecation metadata.
3. The composition layer graduates from normalized definitions to fuller runtime/render integration where needed.
4. Declarative game helpers expand beyond the current core factory plus manager subscriptions into fuller lifecycle/preset ergonomics.
5. Documentation and status files agree with the actual package and feature state.
6. Browser integration coverage spans core, adapters, and examples in regular verification.
