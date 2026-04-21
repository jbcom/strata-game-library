---
title: "Consolidation Parity Matrix"
description: "Inventory and parity disposition for historical split repositories under ~/src/strata-game-library"
status: active
implementation: 70
last_updated: 2026-04-21
area: architecture
---

# Consolidation Parity Matrix

This matrix records the local inventory of every Git repository found under `~/src/strata-game-library` and its disposition against the consolidated monorepo at `~/src/jbcom/strata-game-library`.

The audit command found ten historical repositories:

```text
.github
audio-synth
capacitor-plugin
control-center
examples
model-synth
presets
react-native-plugin
shaders
strata-game-library.github.io
```

All historical repositories were clean on `main` at audit time. The monorepo remote is `git@github.com:jbcom/strata-game-library.git`.

## Summary

| Historical repo | Historical package | Current monorepo location | Decision | Residual work |
|-----------------|--------------------|---------------------------|----------|---------------|
| `.github` | None | `.github/` | Excluded from npm package scope; repo-level workflows and metadata only | Keep only current repo-owned workflows; do not treat as runtime library code |
| `audio-synth` | `@strata-game-library/audio-synth@1.0.2` | `plugins/audio-synth` | Migrated and superseded by current `@strata-game-library/audio-synth@1.1.0` | Keep tests and docs current through umbrella subpath docs |
| `capacitor-plugin` | `@strata-game-library/capacitor-plugin@1.0.2` | `plugins/capacitor` | Migrated, renamed, and superseded by `@strata-game-library/capacitor@1.2.0` | Publish renamed package, then deprecate legacy `-plugin` name; decide whether to port old example/e2e coverage |
| `control-center` | None | None | Excluded from npm package scope; ecosystem automation/control plane | Do not merge unless a specific workflow is adopted into `.github/` |
| `examples` | Private `@strata/examples@1.0.0` | `apps/examples` | Migrated and expanded | Expand current built-output browser smoke into deeper WebGL-capable runtime assertions |
| `model-synth` | `template@0.1.0` | `plugins/model-synth` | Current monorepo implementation supersedes old template scaffold | Run the gated live Meshy smoke path with real credentials and add production usage guidance |
| `presets` | `@strata-game-library/presets@1.1.1` | `packages/presets` | Migrated and improved by current `@strata-game-library/presets@1.2.2` | Keep browser preset coverage in regular verification |
| `react-native-plugin` | `@strata-game-library/react-native-plugin@1.1.0` | `plugins/react-native` | Migrated, renamed, and superseded by `@strata-game-library/react-native@1.3.0` | Publish renamed package, then deprecate legacy `-plugin` name; validate native example/build coverage |
| `shaders` | `@strata-game-library/shaders@1.0.2` | `packages/shaders` | Migrated and improved by current `@strata-game-library/shaders@1.1.0` | Keep shader package tests and docs aligned |
| `strata-game-library.github.io` | `app@0.0.1` | `apps/docs` | Superseded by Astro Starlight docs site | Continue public migration/adoption doc cleanup |

## Inventory Details

| Historical repo | Origin | Last audited commit | Current branch | Working tree | Source/test signal |
|-----------------|--------|---------------------|----------------|--------------|--------------------|
| `.github` | `git@github.com:strata-game-library/.github.git` | `6933f8ec811e447ca5b529487c6e354e807b270d` | `main` | Clean | 1 TS/JS file, 16 markdown files, repo metadata/workflows |
| `audio-synth` | `git@github.com:strata-game-library/audio-synth.git` | `f0dc05583a63584baa609a2412d68780d3e54db5` | `main` | Clean | 10 TS/JS files, 20 markdown files, 1 test file |
| `capacitor-plugin` | `git@github.com:strata-game-library/capacitor-plugin.git` | `19a8f87d80cf83a0231e9234f2ecc150391ef35b` | `main` | Clean | 18 TS/JS files, 36 markdown files, 8 test/e2e-related files |
| `control-center` | `git@github.com:strata-game-library/control-center.git` | `5382bc56baacbe18e70598d0bdfb147d74b415b8` | `main` | Clean | 1 TS/JS file, 34 markdown files, ecosystem/control-plane docs |
| `examples` | `git@github.com:strata-game-library/examples.git` | `f0b8ef98b676c8b7ee6bfa3f305153b7ea4052fe` | `main` | Clean | 26 TS/JS files, 32 markdown files, private Vite examples workspace |
| `model-synth` | `git@github.com:strata-game-library/model-synth.git` | `ac8f596104aa2a549f0addddda7ec07497ccc113` | `main` | Clean | No historical `src/`; mostly template, agent, and workflow scaffolding |
| `presets` | `git@github.com:strata-game-library/presets.git` | `3edc1191c3a75a5ffb7e9c8275b3a33c7ccae305` | `main` | Clean | 60 TS/JS files, 29 markdown files, 16 test/e2e-related files |
| `react-native-plugin` | `git@github.com:strata-game-library/react-native-plugin.git` | `bec8882583d14b8e4c555da2af88adec2fcac429` | `main` | Clean | 3 TS/JS files, 26 markdown files, 4 test/native packaging files |
| `shaders` | `git@github.com:strata-game-library/shaders.git` | `6bdfb2582aaf48f6f3744bdf896e8c5144c8f6df` | `main` | Clean | 16 TS/JS files, 27 markdown files, 1 test file |
| `strata-game-library.github.io` | `git@github.com:strata-game-library/strata-game-library.github.io.git` | `b94a65cc8c875110663cb7e19df6cae77e5ecec0` | `main` | Clean | Astro docs app with 325 markdown files |

## Current Monorepo Parity Snapshot

| Current location | Current package | Parity conclusion |
|------------------|-----------------|-------------------|
| `plugins/audio-synth` | `@strata-game-library/audio-synth@1.1.0` | Runtime code is migrated. Current package adds tests and release metadata; historical repo is no longer canonical. |
| `packages/shaders` | `@strata-game-library/shaders@1.1.0` | Runtime code is migrated and versioned forward. Current package is canonical. |
| `packages/presets` | `@strata-game-library/presets@1.2.2` | Runtime code is migrated and materially expanded. Current test count is higher than historical repo. |
| `plugins/capacitor` | `@strata-game-library/capacitor@1.2.0` | Runtime code is migrated and renamed. Historical example/e2e assets were not fully adopted into regular verification. |
| `plugins/react-native` | `@strata-game-library/react-native@1.3.0` | Runtime code and test intent are migrated under the renamed package. Native controller detection and input snapshots now exist; native example/build verification remains. |
| `plugins/model-synth` | `@strata-game-library/model-synth@0.2.0` | Current code supersedes the historical template package with real Meshy clients, schemas, high-level preview/refine/rigging/animation orchestration, and a gated live smoke command. |
| `apps/examples` | Private examples app group | Main historical examples are present, new declarative/world-topology examples were added, and the examples workspace now verifies umbrella-package dependencies, legacy package import removal, Vite bundles, and built-output Chromium smoke for the nested examples. Deeper WebGL-capable runtime coverage remains thin. |
| `apps/docs` | Private Starlight app | Historical public docs are superseded by the Starlight site plus generated TypeDoc API pages. |

## Decisions

1. Historical runtime package repos should not be edited directly for library work. Their current monorepo counterparts are canonical.
2. The old mobile package names should be treated as migration aliases only after the renamed packages are published.
3. Historical docs/examples are parity references, not deployment sources.
4. `.github` and `control-center` are not part of the package consolidation, except for explicitly copied workflow policy.
5. Parity closeout is sufficient for runtime code in this PR; remaining gaps are productization, publish, live plugin smoke verification, and broader verification hardening.

## Open Follow-Ups

1. Decide whether to port `capacitor-plugin/e2e/playthrough.spec.ts` and `example/src/integration.test.ts` into `plugins/capacitor/tests` or mark them as obsolete.
2. Expand `apps/examples` verification beyond current package/import/bundle/browser-smoke checks into deeper WebGL-capable runtime assertions.
3. Expand adapter/example browser coverage now that core browser integration is restored in CI.
4. After the first umbrella publish, verify `npm view strata-game-library` and each renamed mobile package.
5. Deprecate `@strata-game-library/capacitor-plugin` and `@strata-game-library/react-native-plugin` only after renamed package install docs are live and validated.
