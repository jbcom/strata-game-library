---
title: "Package Strategy"
description: "Supported package, subpath, migration, and publishing strategy after the umbrella-package consolidation"
status: active
implementation: 80
last_updated: 2026-04-21
area: architecture
---

# Package Strategy

This document is the package contract for the consolidation branch. It replaces the older split-repository package-decomposition plan with the post-consolidation decision: `strata-game-library` becomes the default install target, while the scoped packages remain supported direct entrypoints for consumers who want smaller installs or adapter/plugin-specific dependency control.

## Canonical Repository

The canonical source repository is now:

```text
https://github.com/jbcom/strata-game-library
```

The local checkout used for this audit points at `git@github.com:jbcom/strata-game-library.git`. The historical `strata-game-library/*` repositories under `~/src/strata-game-library` are treated as migration sources and parity references, not active library sources.

## Decision

1. `strata-game-library` is the default product package and the recommended install path after its first npm publish.
2. Scoped packages stay supported direct entrypoints through the current consolidation cycle.
3. Renderer adapters and plugins are exposed both as umbrella subpaths and as direct scoped packages.
4. The old `-plugin` mobile package names are legacy npm names. They should be deprecated after the renamed packages are published and verified.
5. Non-library repositories such as `.github`, `control-center`, and historical deployment/docs repos are outside the npm package contract unless code is explicitly copied into this monorepo.

## Install Contract

Default React Three Fiber consumers should install:

```bash
pnpm add strata-game-library @react-three/fiber @react-three/drei three
```

Until the first umbrella release lands on npm, the published fallback remains:

```bash
pnpm add @strata-game-library/core @strata-game-library/r3f @react-three/fiber @react-three/drei three
```

Small-surface consumers can keep direct installs:

```bash
pnpm add @strata-game-library/core
pnpm add @strata-game-library/shaders
pnpm add @strata-game-library/presets @strata-game-library/core
```

## Package Disposition

| Package | Status | Decision | Primary imports |
|---------|--------|----------|-----------------|
| `strata-game-library` | Pending first npm publish | Default product package | `strata-game-library`, `strata-game-library/r3f` |
| `@strata-game-library/core` | Published | Keep as first-class direct package | `@strata-game-library/core`, `strata-game-library/core` |
| `@strata-game-library/shaders` | Published | Keep as first-class direct package | `@strata-game-library/shaders`, `strata-game-library/shaders` |
| `@strata-game-library/presets` | Published | Keep as first-class direct package | `@strata-game-library/presets`, `strata-game-library/presets` |
| `@strata-game-library/r3f` | Release-tracked, pending npm availability | Publish and keep as first-class R3F adapter | `@strata-game-library/r3f`, `strata-game-library/r3f` |
| `@strata-game-library/reactylon` | Release-tracked, pending npm availability | Publish as a supported thin Babylon/Reactylon adapter | `@strata-game-library/reactylon`, `strata-game-library/reactylon` |
| `@strata-game-library/audio-synth` | Published | Keep as first-class direct plugin | `@strata-game-library/audio-synth`, `strata-game-library/audio-synth` |
| `@strata-game-library/model-synth` | Release-tracked, pending npm availability | Publish, with rigging/animation gaps documented | `@strata-game-library/model-synth`, `strata-game-library/model-synth` |
| `@strata-game-library/capacitor` | Release-tracked renamed package | Publish as replacement for `@strata-game-library/capacitor-plugin` | `@strata-game-library/capacitor`, `strata-game-library/capacitor` |
| `@strata-game-library/react-native` | Release-tracked renamed package | Publish as replacement for `@strata-game-library/react-native-plugin` | `@strata-game-library/react-native`, `strata-game-library/react-native` |
| `@strata-game-library/astro` | Release-tracked, pending npm availability | Publish as docs/demo integration package | `@strata-game-library/astro`, `strata-game-library/astro` |
| `@strata-game-library/capacitor-plugin` | Historical npm name | Deprecate after renamed package is published and adoption docs are live | Use `@strata-game-library/capacitor` |
| `@strata-game-library/react-native-plugin` | Historical npm name | Deprecate after renamed package is published and adoption docs are live | Use `@strata-game-library/react-native` |

## Subpath Contract

The umbrella package root is intentionally runtime-light. It should export stable core, presets, shaders, and high-level declarative game helpers without forcing React, Three.js renderer adapters, mobile integrations, or optional service clients into the default import path.

Adapter and plugin code must stay behind explicit subpaths:

```ts
import { createRPGGame } from 'strata-game-library';
import { StrataGame } from 'strata-game-library/r3f';
import { createSynthManager } from 'strata-game-library/audio-synth';
```

This keeps the one-package story simple while preserving tree-shaking and optional peer dependency boundaries.

## Release Automation

Release-please already tracks all non-private packages, including `packages/strata-game-library`. The npm release workflow must publish every tracked package:

- `packages/core`
- `packages/shaders`
- `packages/presets`
- `adapters/r3f`
- `adapters/reactylon`
- `plugins/audio-synth`
- `plugins/model-synth`
- `plugins/capacitor`
- `plugins/react-native`
- `plugins/astro`
- `packages/strata-game-library`

Publishing remains gated on GitHub Releases and npm trusted publishing. The first umbrella publish also requires verifying that npm trusted publishing is configured for `strata-game-library`.

## Migration Policy

Consumer migration should be additive first:

1. Keep existing scoped imports working.
2. Add umbrella imports for new documentation and examples.
3. Move app code from scoped imports to umbrella subpaths when the umbrella package is published.
4. Deprecate only the old mobile `-plugin` names after renamed packages are published and verified.

Do not deprecate `@strata-game-library/core`, `@strata-game-library/shaders`, `@strata-game-library/presets`, or adapter/plugin direct packages during this cycle. They remain useful for minimal installs and explicit peer dependency control.

## Non-Goals

- Do not collapse all scoped packages into unpublished internals in this cycle.
- Do not require consumers to install renderer/mobile/plugin peer dependencies unless they import those subpaths.
- Do not move `.github`, `control-center`, or old deployment-only artifacts into the npm package.
- Do not claim the package is published until `npm view strata-game-library` confirms the release.

## Acceptance Checklist

- [x] Umbrella package exists with root and subpath exports.
- [x] Release-please tracks the umbrella package.
- [x] Release workflow includes the umbrella package in the npm publish loop.
- [x] README and package README identify the default and fallback install paths.
- [x] Public migration docs exist.
- [x] Historical split-repo parity matrix exists.
- [ ] First `strata-game-library` npm publish succeeds.
- [ ] npm trusted publishing is verified for every release-tracked package.
- [ ] Legacy mobile `-plugin` packages are deprecated after renamed package publication.
