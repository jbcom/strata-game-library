# Library Gaps & Consolidation Backlog

Snapshot date: `2026-04-21`

Full backlog and acceptance criteria: [docs/plans/2026-04-16-remaining-work-prd.md](docs/plans/2026-04-16-remaining-work-prd.md)

This file tracks the highest-signal gaps left after consolidating the historical split repositories back into this monorepo.

## 1. Package Consolidation

Current state:

- `packages/strata-game-library` now exists as a real workspace package.
- The umbrella package exposes a runtime-light root plus explicit subpaths such as `strata-game-library/r3f`.
- Umbrella-package `build` and `test` now build internal workspace dependencies first, so local verification no longer depends on ambient prebuilt package state.
- Release-please metadata includes the new package.
- The release workflow now includes `packages/strata-game-library` in the npm publish loop.
- The package strategy, public migration guide, and historical split-repo parity matrix are documented.

Remaining work:

1. Publish `strata-game-library` to npm.
2. Verify npm trusted publishing for the umbrella package and release-tracked scoped packages.
3. Execute the documented migration policy:
   - keep scoped packages as supported direct entrypoints during this cycle,
   - publish `r3f`, `reactylon`, `model-synth`, and `astro`,
   - publish renamed `capacitor` and `react-native` packages,
   - deprecate only the legacy `capacitor-plugin` and `react-native-plugin` names after renamed package publication.
4. Resolve package publish drift:
   - publish or intentionally fold `r3f`, `reactylon`, `model-synth`, and `astro`
   - finish the rename transition for `capacitor` and `react-native`
5. Confirm published package metadata with `npm view` after release.

## 2. Framework Implementation Gaps

### Composition Layer

- `packages/core/src/compose/creatures/index.ts`
  - `createCreature()` and `resolveCreatureComposition()` now exist.
  - Resolved creature compositions now include adapter-neutral runtime bones, world transforms, bounds, material slots, animation bindings, IK metadata, spawn metadata, and physics profiles.
  - R3F can now consume the runtime plan through `RuntimeCreature`.
  - Reactylon can now consume the runtime plan through `StrataRuntimeCreature` descriptors.
  - Remaining gap: richer renderer-ready creature rig/mesh generation, asset-backed meshes, and full Babylon mesh instantiation are still incomplete.
- `packages/core/src/compose/props/index.ts`
  - `createProp()` and `resolvePropComposition()` now exist.
  - Resolved prop compositions now include adapter-neutral runtime nodes, bounds, interaction/audio metadata, material slots, and physics profiles.
  - R3F can now consume the runtime plan through `RuntimeProp`.
  - Reactylon can now consume the runtime plan through `StrataRuntimeProp` descriptors.
  - Remaining gap: richer interaction helper semantics, asset-backed mesh renderers, and full Babylon mesh instantiation are still incomplete.
- `packages/core/src/compose/materials/`
  - Factories and presets now carry default physics metadata, and `createMaterialVariant()` / `createMaterialVariants()` provide deterministic variation helpers for swapping and runtime assembly.
  - Remaining gap: richer procedural texture/material traits and adapter material instantiation remain thin.

### Declarative Game Layer

- `packages/core/src/api/createGame.ts`
  - Exists and now resolves built-in state presets into concrete initial store state.
  - Basic validation for empty scene/mode records, missing default keys, and duplicate content ids now exists.
  - Scene and mode lifecycle callbacks now receive runtime context, and mode `setup` / `teardown` now run as part of manager operations.
  - Active mode `inputMap` definitions now drive the live `InputManager` action map.
  - `InputManager` now also exposes snapshots/subscriptions, so adapter layers can react to live action state instead of only listening to raw events.
  - The created `Game` instance now exposes pause snapshots/subscriptions, and pausing reduces the active action map to the mode's pause binding.
  - The created `Game` instance also tracks `activeProfileId`, so generated save-shell flows can stay anchored to the current profile instead of always routing back through the selector.
  - `GameDefinition.transitions` plus scene/mode-level `transition` defaults now make transitions declarative instead of runtime-only.
  - Transition-aware scene/mode helpers now route through `TransitionManager`.
  - Remaining gap: richer declarative orchestration, deeper transition choreography, and fuller game-shell behavior beyond the current pause/status/loading/scene-card helpers are still not fully realized.
- `packages/core/src/game/game-presets.ts`
  - Helper templates now exist for `rpg`, `action`, `puzzle`, `sandbox`, `racing`, and `platformer`.
  - They now include genre-specific mode input maps, built-in `ui.shell` HUD/pause/loading metadata, built-in announcement-style scene shell metadata for the default starting scenes, opt-in `titleScene` / `menuScene` / `saveScene` / `settingsScene` / `sessionShell` synthesis, genre-aware shell copy/action labels, shared `createSceneShellFlow()`-backed flow generation, generated save-profile selector/archive flows, runtime save metadata surfaces, state-aware profile entry labels, direct latest-save/start-new profile entry behavior, active-profile-aware continue actions in generated title/menu shells, active-profile archive reopen behavior across generated save actions, selector-level clear actions, default profile-scoped `storageSlot` namespacing, slot-level archive capability metadata, and merge matching overrides with preset defaults.
  - Remaining gap: they still provide structural defaults, not rich genre-specific systems, content packs, or gameplay logic.
- `packages/core/src/game/scene-shell-presets.ts`
  - Reusable scene-shell builders, scene-definition builders, and shell-action builders now exist for announcement/title/menu/session/archive/profile cards, persistence actions, and other runtime-backed shell actions.
  - Remaining gap: there are still no opinionated end-to-end title/menu/session/archive game-shell packs layered on top of those primitives.
- `adapters/r3f/src/StrataGame.tsx`
  - Scene and mode subscriptions are now wired.
  - `useScene()`, `useMode()`, `useInput()`, `useActionPressed()`, `useControlHints()`, `useGameStatus()`, and `useTransition()` now exist.
  - The core `InputManager` now attaches to the canvas DOM element during the default R3F mount path.
  - A built-in transition overlay now reflects `TransitionManager` state.
  - Built-in `GameHUD`, `PauseMenu`, and `SceneCard` now exist, and `StrataGame` can also synthesize the same HUD/pause/loading scaffold from `ui.shell` metadata while rendering runtime-backed announcement/title/menu/session scene cards from `scene.shell`.
  - Remaining gap: higher-level declarative ergonomics beyond the base component and these first-pass game-shell helpers.
- `adapters/r3f/src/components/compose/`
  - `RuntimeProp`, `RuntimeCreature`, `RuntimeGeometry`, `createRuntimeMaterial()`, and `resolveRuntimeMaterial()` now render core composition runtime plans through R3F primitives.
  - `apps/examples/api-showcase` now includes composition runtime examples that consume those renderers through `strata-game-library/compose` and `strata-game-library/r3f`.
  - Remaining gap: asset-backed mesh loading, richer shell/physics integration, and deeper WebGL runtime assertions beyond bundle/smoke coverage.
- `adapters/reactylon/src/components/compose/`
  - `StrataRuntimeProp`, `StrataRuntimeCreature`, `resolveReactylonRuntimeProp()`, `resolveReactylonRuntimeCreature()`, and `createReactylonRuntimeMaterialDescriptor()` now expose serializable Babylon/Reactylon descriptors for core composition runtime plans.
  - Remaining gap: native Babylon mesh/material instantiation and visual example coverage are still thin.

### Platform / Integration

- `plugins/model-synth/src/index.ts`
  - High-level `character()` orchestration now creates and polls Meshy preview/refine, rigging, and animation tasks, exposes rigged/animated URL maps, validates named animation requests before model generation, and is covered by unit tests. A gated live smoke command now exists; remaining work is running it with real Meshy credentials, rate-limit/licensing guidance, and asset-pipeline integration examples.
- `plugins/react-native/android/src/main/java/com/strata/reactnative/StrataModule.kt`
  - Android controller detection and native `getInputSnapshot()` now exist; remaining work is native-example/build verification and host activity forwarding documentation for button/axis state.
- `plugins/react-native/ios/StrataModule.swift`
  - iOS GameController/MFi detection and native `getInputSnapshot()` now exist; remaining work is native-example/build verification.
- `packages/core/src/core/shared/platform.ts`
  - React Native detection and explicit `reactNative` adapter selection now exist; remaining work is deeper capability bridging beyond static platform/capability detection.

## 3. Verification Gaps

- Full workspace `pnpm run typecheck` is now green, including `apps/docs`.
- Core browser integration coverage is restored in the regular CI path.
- `apps/examples` now verifies umbrella-package dependencies, blocks legacy `@jbcom/strata` references outside generated docs, bundles six nested Vite examples, and runs a Chromium smoke test against the built example output.
- Adapter/example browser runtime coverage still needs deeper WebGL-capable visual/runtime assertions and broader adapter coverage to become as complete as the core package coverage.
- `adapters/reactylon` and `plugins/astro` still carry lint warnings.

## 4. Documentation Gaps

- The main README and umbrella package README now reflect the new root/subpath contract.
- `PUBLIC_API.md`, `IMPLEMENTATION_STATUS.md`, and this file now reflect the current audit.
- [Package Strategy](docs/architecture/PACKAGE_STRATEGY.md), [Consolidation Parity Matrix](docs/architecture/CONSOLIDATION_PARITY_MATRIX.md), and the public umbrella-package migration guide now cover the package/migration closeout path.
- Remaining work is to keep the broader planning/memory docs aligned as implementation moves.

## 5. Recommended Order

1. Publish and verify the umbrella package.
2. Execute the documented package migration/deprecation strategy.
3. Finish the composition layer:
   - wire runtime composition outputs into deeper examples and native Babylon mesh instantiation
   - expand renderer-ready creature/prop assembly beyond primitive R3F example plans
   - add richer procedural material traits and swapping UX
4. Add higher-level declarative game hooks/presets on top of the current manager subscription model.
5. Expand adapter/example browser runtime coverage while keeping core browser integration, examples package/import/bundle/browser-smoke verification, and docs typecheck/build as release gates.
