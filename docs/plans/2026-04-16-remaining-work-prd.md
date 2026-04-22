---
title: "Remaining Work Product Requirements"
description: "Canonical PRD for the post-session work still required after the April 2026 consolidation push"
status: proposed
implementation: 0
last_updated: 2026-04-16
area: plans
---

# Remaining Work Product Requirements

This PRD defines the work intentionally left unfinished after the April 16, 2026 consolidation session. It is the canonical planning document for the post-merge backlog and should be used to prioritize, scope, and accept the next wave of implementation work.

## Executive Summary

The repository is now in a materially better state:

- the umbrella package exists
- local `lint`, `typecheck`, `build`, `test`, `docs`, and `docs:internal` pass
- Layer 3/4 scaffolding is real instead of aspirational
- shell, profile, save, transition, and input primitives now exist end-to-end

The repository is not yet complete as a fully actualized game library. The remaining work is no longer "make it exist at all." It is now "turn the current structure into a supported, publishable, production-ready product surface."

## Problem Statement

Strata currently has four kinds of unfinished work:

1. Product surface incompleteness.
   The umbrella package exists but is not yet the shipped public contract.
2. Runtime depth gaps.
   Composition and declarative game helpers are structurally useful but still thinner than the framework vision.
3. Platform and plugin parity gaps.
   Mobile/controller support and model-synth orchestration are now materially implemented, but native/example verification and live billable API smoke execution remain partial.
4. Verification and documentation gaps.
   Browser integration coverage, migration guidance, and post-consolidation docs still need hardening.

If these gaps are not closed, the repo will remain locally impressive but externally ambiguous: useful to maintainers, harder to trust for consumers.

## Current Snapshot

### What is already done

- `packages/strata-game-library` is a real workspace package with subpath exports.
- `createGame()`, state presets, game presets, scene-shell builders, transition defaults, save/profile flows, and first-pass shell UI are implemented.
- R3F now has subscription-backed runtime hooks and built-in shell helpers.
- The docs site, TypeDoc output, and root workspace verification are locally green.

### What is still not done

- umbrella npm publish and migration policy execution
- remaining parity closeout items for historical split-package platform coverage and expanded browser/runtime example verification
- richer runtime composition outputs for creatures/props/materials
- deeper declarative game systems, persistence semantics, and game-shell packs
- remaining plugin/platform productization and live-verification gaps
- adapter/example browser coverage beyond the restored core browser integration path
- complete public migration and adoption documentation

## Goals

1. Ship `strata-game-library` as the supported install path with a stable public contract.
2. Finalize the consolidation story so there is no ambiguity about what was intentionally folded in, deprecated, or left separate.
3. Upgrade the current Layer 3/4 primitives into production-grade runtime features.
4. Close the highest-risk verification and platform gaps.
5. Leave the repo with a clear "done means done" standard for actual game-library readiness.

## Non-Goals

- redesigning the monorepo structure again
- replacing Nx, pnpm, tsup, Biome, or Vitest
- building full showcase games as part of core completion
- introducing additional render adapters or plugin families before the current surface is finished
- collapsing all subpath packages unless the migration decision explicitly requires it

## Primary Users

### Package consumers

Developers who want one install path, predictable exports, working examples, and docs that match what ships.

### Framework maintainers

Contributors who need a precise definition of what remains before the library can be treated as fully actualized.

### Example and template authors

Teams building starter projects, docs demos, and validation games that rely on a stable declarative surface.

## Workstream 1: Release, Packaging, and Migration

### Objective

Turn the umbrella package from a local workspace success into the supported external product entrypoint.

### Requirements

1. Publish `strata-game-library` to npm.
2. Define the contract for each existing `@strata-game-library/*` package:
   - keep as supported direct entrypoint
   - deprecate after migration window
   - or fold behind umbrella-only subpaths
3. Resolve naming drift for `capacitor` and `react-native` vs `capacitor-plugin` and `react-native-plugin`.
4. Ensure release automation covers the chosen package strategy cleanly.
5. Add explicit migration messaging for consumers moving from scoped packages to umbrella subpaths.

### Acceptance Criteria

- `npm install strata-game-library` works as the documented default path.
- README, package README, public API docs, and migration guide agree on the contract.
- Release-please and publish automation reflect the final package strategy.
- Every existing package has an explicit disposition recorded: supported, deprecated, renamed, or folded.

### Progress Update: 2026-04-21

- Package strategy is now documented in `docs/architecture/PACKAGE_STRATEGY.md`.
- Historical split-repo parity is now documented in `docs/architecture/CONSOLIDATION_PARITY_MATRIX.md`.
- Public umbrella-package migration guidance is now documented in `apps/docs/src/content/docs/guides/umbrella-package-migration.md`.
- The release workflow now includes `packages/strata-game-library` in the npm publish loop.
- Remaining work is operational publish verification and legacy mobile-name deprecation after renamed package publication.

## Workstream 2: Consolidation Parity Closeout

### Objective

Prove that the historical split-repo functionality is either migrated, intentionally superseded, or intentionally excluded.

### Requirements

1. Re-run a repo-by-repo parity audit against the historical split repositories.
2. Record explicit keep/drop/superseded decisions for any leftover code paths, examples, scripts, or package surfaces.
3. Verify that higher-quality implementations from prior repos were not accidentally replaced by thinner stopgaps during consolidation.
4. Keep non-library repos like `.github` and `control-center` explicitly out of the package-consolidation scope unless their contents are deliberately adopted.

### Acceptance Criteria

- There is a written parity matrix for each historical repository.
- No remaining migration ambiguity exists for runtime library code.
- Any intentionally excluded artifacts are documented as non-goals, not silent omissions.

## Workstream 3: Composition Runtime Completion

### Objective

Move Layer 3 from normalized definitions and resolver plumbing to richer runtime composition.

### Requirements

1. Upgrade `createCreature()` and related composition APIs so they can produce richer runtime-ready structures instead of only normalized definitions plus resolved bindings.
2. Upgrade `createProp()` and prop composition to support richer interactions, variation, and runtime assembly.
3. Expand material composition to support procedural variation, swapping, physics metadata flow, and richer material traits.
4. Define how composition outputs are consumed by adapters and shell/runtime layers.

### Acceptance Criteria

- Creature and prop factories return outputs that meaningfully reduce adapter/runtime assembly burden.
- Material composition supports more than static preset lookup.
- The composition layer has explicit tests covering runtime-oriented outputs, not only type normalization.

### Progress Update: 2026-04-21

- `resolveCreatureComposition()` now returns a `runtime` assembly plan with serializable runtime bones, resolved world transforms, bounds, material slots, animation bindings, IK metadata, spawn metadata, and physics profiles.
- Creature composition now preserves optional model, rig, animation-clip, and bone-map asset bindings on `runtime.asset` for adapter-owned creature rendering.
- `resolvePropComposition()` now returns a `runtime` assembly plan with runtime nodes, bounds, material slots, interaction/audio metadata, and physics profiles.
- Prop runtime output now includes interaction action descriptors with stable ids, labels, enabled state, affected node ids, audio cues, and payload metadata for adapter/UI consumption.
- `executePropInteractionAction()` now executes those prop action descriptors into deterministic next-state/effect records for container, seat, door, switch, and collectible behavior.
- `createPropInteractionController()` now wraps those executor results in a stateful controller for adapter-owned interaction UI/gameplay flows.
- Prop interaction effects now include renderer-neutral physics requests for kinematic door motion and collectible collider disablement, so adapters do not need prop-type-specific physics branching.
- Material factories now include default physics metadata, and `createMaterialVariant()` / `createMaterialVariants()` provide deterministic material variation helpers for swapping and runtime assembly.
- `MaterialDefinition.traits`, `createMaterialTrait()`, and `inferMaterialTraits()` now provide serializable procedural trait metadata for grain, fibers, scratches, wear, patina, veins, mottle, and absorption channels.
- `createMaterialProceduralPlan()` now converts procedural traits into deterministic adapter-neutral shader/texture layer plans with channel routing, uniforms, GLSL helper chunks, and per-trait algorithms.
- `createMaterialProceduralBakePlan()` now converts those procedural layers into deterministic bake targets and manifest metadata for diffuse, roughness, metalness, normal, opacity, and emissive texture maps.
- `rasterizeMaterialProceduralBakePlan()` now turns procedural bake targets into deterministic pure RGBA byte buffers for adapter or worker-side texture encoding.
- `encodeMaterialProceduralBakeImagePng()` and `encodeMaterialProceduralBakeRasterPng()` now provide dependency-free PNG byte export for those procedural bake rasters.
- Focused unit coverage now verifies runtime composition outputs for material variants, props, and creatures.
- R3F now consumes composition runtime plans through `RuntimeProp` and `RuntimeCreature`, backed by orientation-aware primitive geometry rendering, material conversion helpers, material overrides, and custom node/bone renderer hooks.
- R3F now also renders mesh-shaped prop nodes with static GLB sources through `RuntimeAssetMesh`, using Drei's GLTF cache while preserving runtime material metadata and source-material opt-out.
- R3F now renders asset-bound runtime creatures through `RuntimeCreatureAsset`, using Drei's GLTF cache and logical-to-source animation clip mappings from `runtime.asset.animationClips`.
- R3F asset-bound runtime creatures now also collect loaded Three.js bone names and expose rig binding coverage via `createRuntimeCreatureAssetRigBinding()` and `RuntimeCreature` / `RuntimeCreatureAsset` `onRigBinding`.
- R3F now exposes `createRuntimeCreatureAnimationTrackNameMap()` and `retargetRuntimeCreatureAnimationClip()` for opt-in Three.js clip-track retargeting between runtime logical bones and loaded source rig bones.
- `RuntimeProp` now routes node clicks through core prop interaction execution via `onInteraction`, `interactionState`, and `selectInteractionAction`.
- R3F now applies prop physics interaction effects through `applyRuntimePropInteractionPhysicsEffects()`, preserving per-object runtime physics state and exposing optional callbacks for concrete physics adapters.
- R3F and Reactylon material conversion now infer or preserve procedural material trait metadata and shader/texture layer plans for renderer-specific pipelines.
- R3F and Reactylon/Babylon descriptors now also preserve procedural bake-plan manifests so later offline/worker pipelines can rasterize the same plans into textures.
- R3F runtime material conversion now injects procedural plans into `MeshStandardMaterial` shader compilation for base-color, scalar, opacity, emissive, and normal-channel effects.
- Reactylon/Babylon runtime material conversion now injects procedural plans through a Babylon PBR material plugin for albedo, scalar, opacity, and emissive effects.
- `apps/examples/api-showcase` now renders the real tabbed showcase entrypoint and demonstrates `RuntimeProp`, `RuntimeCreature`, `resolvePropComposition()`, `resolveCreatureComposition()`, and material variants through the consolidated package surface.
- Reactylon now consumes composition runtime plans through `StrataRuntimeProp`, `StrataRuntimeCreature`, and serializable Babylon/Reactylon descriptors.
- Reactylon creature descriptors now preserve core creature asset bindings so Babylon-owned loaders can consume the same model, rig, clip, and bone-map metadata.
- Reactylon now also instantiates those descriptors into native Babylon PBR materials, transform roots, primitive meshes, runtime metadata, custom mesh-factory seams, async mesh-shaped prop loading, asset-bound creature loading, and logical animation playback via `createBabylonRuntimeMaterial()`, `instantiateBabylonRuntimeProp()`, `instantiateBabylonRuntimePropAsync()`, `instantiateBabylonRuntimeCreature()`, and `instantiateBabylonRuntimeCreatureAsset()`.
- Babylon prop instances now carry interaction metadata and expose stateful `interactionState`, `resetInteractionState()`, and `executeInteraction()` helpers backed by the core prop interaction controller.
- Babylon prop instances now apply renderer-neutral prop physics effects to mesh collision/pickability flags, runtime physics metadata, and available Babylon v2/v1 physics-body seams.
- Core now exposes `createCreatureRigBindingPlan()` so logical creature bones, asset `boneMap` entries, and loaded source rig bone names produce deterministic matched/missing/unverified binding coverage.
- Reactylon/Babylon creature descriptors and asset-backed instances now carry rig binding plans, loaded skeleton references, and metadata that lets adapter-owned animation systems inspect coverage before retargeting.
- Remaining work is pose retargeting and richer skeletal animation control beyond the new R3F clip-track retargeting plus loaded R3F/Babylon clip playback, higher-level interaction UX and physics-engine authoring around the new effect application seams, WebP/KTX2 texture export plus authoring workflows beyond the new PNG bake export, and shader application beyond the current R3F/Babylon material paths.

## Workstream 4: Declarative Game Runtime Completion

### Objective

Move Layer 4 from useful structural helpers to a production-grade declarative game surface.

### Requirements

1. Deepen `createGame()` orchestration:
   - fuller scene/mode coordination
   - deeper transition choreography
   - cleaner declarative lifecycle semantics
2. Expand preset games beyond structure:
   - richer genre defaults
   - genre-specific systems/content expectations
   - stronger defaults for controls, shell flow, and state
3. Finish persistence semantics:
   - explicit save/load/rehydration guarantees
   - last-used profile persistence
   - quick-load and continue flows
   - new-profile, manage-profile, and archive semantics
4. Finish game-shell productization:
   - opinionated title/menu/session/settings/archive/profile packs
   - clearer customization seams for copy, actions, and UI presentation
5. Ensure adapter layers can consume all of the above without bespoke app-side glue.

### Acceptance Criteria

- A consumer can create a non-trivial game shell with title, menu, session, save, load, settings, and pause flows primarily through declarative configuration.
- Save/profile flows are coherent across fresh start, continue, quick load, archive management, and resume-after-restart cases.
- Transition behavior is definition-driven, test-covered, and predictable.

## Workstream 5: R3F and Adapter Productization

### Objective

Turn the current R3F runtime helpers into a stable high-level adapter surface.

### Requirements

1. Keep `StrataGame` as the primary mount path and continue tightening its ownership model.
2. Expand adapter ergonomics around:
   - shell rendering
   - control hints
   - transitions
   - pause/loading/session status
3. Define which shell behaviors are built in vs consumer-supplied.
4. Ensure R3F examples demonstrate the intended umbrella-package contract and declarative flow.
5. Decide whether `reactylon` remains a thin parity adapter or becomes a fuller declarative peer.

### Acceptance Criteria

- The adapter surface is documented as a product, not just an implementation detail.
- Example apps show the preferred high-level path.
- Consumers do not need to bypass the adapter to assemble common shell/runtime behavior.

### Progress Update: 2026-04-21

- The R3F component layer now includes `RuntimeProp`, `RuntimeCreature`, and `RuntimeCreatureAsset` for rendering core composition runtime plans.
- Runtime composition renderers support orientation-aware primitive geometry, material overrides, and custom node/bone render hooks so consumers can replace primitive geometry with asset-backed meshes without bypassing the composition plan.
- Mesh-shaped prop nodes can now use `RuntimeAssetMesh` for built-in static GLB loading through the R3F adapter.
- Asset-bound creatures can now use `RuntimeCreatureAsset` for built-in GLB loading, logical animation clip selection, and rig binding coverage through the R3F adapter.
- The API showcase now includes composition runtime examples, renders them through the real built entrypoint, and TypeDoc generation verifies the new example coverage.
- The Reactylon adapter now exposes serializable composition descriptors via `StrataRuntimeProp`, `StrataRuntimeCreature`, `resolveReactylonRuntimeProp()`, and `resolveReactylonRuntimeCreature()`.
- The Reactylon adapter now includes direct native Babylon instantiation helpers for runtime materials, props, creatures, async mesh-shaped prop nodes, asset-bound creature models, and loaded animation-group playback.
- Asset-backed Reactylon/Babylon creatures now expose loaded skeletons plus core rig binding coverage for validating logical-to-source bone maps before implementing full retargeting.

## Workstream 6: Platform and Plugin Parity

### Objective

Close the highest-value plugin and platform TODOs that still block the "actual game library" claim.

### Requirements

1. `model-synth`
   - complete high-level rigging/animation orchestration
   - add live Meshy smoke verification guidance and production constraints
2. `react-native`
   - Android gamepad detection and native input snapshots
   - iOS GameController/MFi detection and native input snapshots
3. shared platform helpers
   - remove or narrow "React Native not implemented" gaps
4. verify that platform-specific packages still fit the final package strategy from Workstream 1

### Acceptance Criteria

- Plugin TODOs that affect real consumer expectations are either implemented or explicitly documented as unsupported.
- Mobile/controller behavior has concrete testable expectations.

### Progress Update: 2026-04-21

- The active React Native Android module now reports `hasGamepad` / `inputMode` from Android `InputDevice` enumeration and exposes `getInputSnapshot()` with connected controller ids, button state, sticks, and triggers.
- The active React Native iOS module now reports `hasGamepad` / `inputMode` from `GameController` and exposes `getInputSnapshot()` for MFi/GameController buttons, sticks, triggers, and connected controllers.
- Core shared platform helpers now expose `isReactNative()` and `selectAdapter()` accepts an explicit `reactNative` adapter slot instead of describing React Native as unimplemented.
- The TypeScript React Native hook tests now cover controller-aware `useDevice()` profiles and native `useInput()` snapshot polling.
- `model-synth.character()` now creates and polls Meshy preview/refine tasks before rigging when `rigged` or `animations` are requested, maps named/default/numeric animation actions to Meshy animation tasks, returns preview/rigging/animation task metadata and GLB URL maps, and validates unknown named animations before starting model generation.
- `plugins/model-synth` now includes a gated `test:smoke` command that verifies auth/listing by default and only runs the billable character workflow when explicit cost-confirmation environment variables are set.
- Remaining platform work in this stream is now focused on running the live billable Meshy smoke path with real credentials, deeper core/native capability bridging, and native-example/build verification.

## Workstream 7: Verification and CI Hardening

### Objective

Make the current green local state durable and repeatable in normal verification paths.

### Requirements

1. Keep root `lint`, `typecheck`, `build`, and `test` green without race-prone caveats.
2. Keep restored core browser integration coverage in the regular CI path.
3. Add stable browser/example verification where missing.
4. Reduce misleading warning noise where practical:
   - tree-shaking chatter
   - oversized docs chunks where actionable
   - other warning-only output that obscures real failures
5. Preserve TypeDoc and docs-site build health as first-class gates.

### Acceptance Criteria

- Core browser integration tests are no longer documented as "disabled in CI."
- Adapter/example browser coverage gaps are tracked separately from core coverage.
- Example apps have meaningful verification targets where needed.
- Root verification does not depend on undocumented command ordering.

### Progress Update: 2026-04-21

- `apps/examples` now has a regular `verify` target wired through `build`, `lint`, `test`, and `typecheck`.
- Historical example packages and source/docs imports now use the `strata-game-library` umbrella package contract instead of the old `@jbcom/strata` package name.
- The examples verifier fails on legacy package references outside generated docs and on example packages that omit a `strata-game-library` dependency.
- The examples verifier now bundles the six nested Vite examples from the parent examples package, which caught and drove a real `strata-game-library/presets` vegetation export fix.
- The examples `test` target now runs a Chromium Playwright smoke suite against the built `dist` output for the six nested Vite examples. This caught and drove fixes for non-portable absolute asset paths in `api-showcase` / `vegetation-showcase` and an invalid empty-biome runtime scene in `api-showcase`.
- The examples smoke suite now also exercises the built API-showcase composition tab and asserts WebGL-backed canvas creation when Chromium exposes WebGL, while still tolerating no-WebGL headless runners.
- Remaining verification work is broader visual/runtime assertions and adapter coverage, not basic package/import/bundle drift detection.

## Workstream 8: Documentation and Adoption Readiness

### Objective

Make the public story match the shipped product and migration path.

### Requirements

1. Keep `README.md`, `PUBLIC_API.md`, `IMPLEMENTATION_STATUS.md`, and `GAPS.md` aligned with reality.
2. Publish a real migration guide for umbrella-package adoption.
3. Document the final package strategy with examples.
4. Ensure shell, persistence, and declarative-game docs reflect actual supported flows.
5. Keep planning and memory docs aligned with the implementation reality after each major tranche.

### Acceptance Criteria

- A new consumer can determine what to install, which APIs are stable, and how to migrate.
- The repo no longer contains contradictory package-install guidance.
- Status docs distinguish "implemented," "partial," and "planned" without optimism bias.

## Priority Order

### Phase 1: Ship the Product Contract

- publish umbrella package
- execute migration/deprecation policy
- keep consumer migration path current

### Phase 2: Close Runtime Depth Gaps

- composition runtime completion
- declarative orchestration and persistence semantics
- opinionated shell packs

### Phase 3: Platform and Verification Hardening

- adapter/example browser verification
- example verification
- live plugin/API smoke verification and mobile native-example parity work

### Phase 4: Documentation Maturity

- public docs cleanup
- adoption guidance
- status/planning alignment

## Success Metrics

1. `strata-game-library` is published and documented as the primary install path.
2. A consumer can build a representative title/menu/session/save/settings flow from documented APIs.
3. Historical split-repo parity decisions are documented and closed.
4. Root verification and docs generation remain green.
5. Browser integration coverage is back in the regular CI path.
6. Status docs no longer rely on aspirational language.

## Risks

### Packaging ambiguity risk

If umbrella vs scoped-package strategy remains undecided, adoption docs and release automation will drift again.

### Structural-vs-runtime risk

If work stops at additional scaffolding, Layer 3/4 will look broader without becoming meaningfully more useful.

### Verification drift risk

If CI and local workflows do not exercise the same surfaces, post-merge regressions will hide behind "works locally."

### Scope creep risk

If validation games or content packs become mandatory before the core product contract is shipped, publish/migration work will stall.

## Open Questions

1. Which scoped packages remain first-class after umbrella publish?
2. Is `reactylon` meant to reach parity with R3F or remain thinner?
3. What persistence backend guarantees are part of core vs adapter/application code?
4. How much genre logic belongs in preset helpers vs separate content/system packages?
5. Which verification steps become required CI gates vs optional extended coverage?

## Definition of Done

This remaining-work program is complete when:

- the umbrella package is published and adopted as the default contract
- package migration policy is explicit and implemented
- composition and declarative game layers cover real runtime use cases rather than only structure
- save/profile/shell flows are coherent and documented
- platform TODOs that materially affect consumers are closed or explicitly unsupported
- CI includes core browser integration coverage and expands toward adapter/example coverage
- documentation matches reality across public API, install guidance, and status tracking
