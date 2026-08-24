---
title: "Package Strategy"
description: "Single-package, subpath, and publishing strategy"
status: active
implementation: 90
last_updated: 2026-08-24
area: architecture
---

# Package Strategy

`strata-game-library` is the only public npm package. The repository remains a
pnpm workspace for development, but its core systems, adapters, and plugins are
private implementation modules bundled behind explicit public subpaths.

## Install and import contract

Install exactly one Strata package, plus the peers needed by the subpaths you
use:

```bash
pnpm add strata-game-library react react-dom three @react-three/fiber @react-three/drei
```

```ts
import { createRPGGame } from 'strata-game-library';
import { StrataGame } from 'strata-game-library/r3f';
```

The root is renderer-independent. Public subpaths such as `/core`, `/shaders`,
`/presets`, `/r3f`, `/reactylon`, `/pixi`, `/audio-synth`, `/model-synth`,
`/capacitor`, `/react-native`, `/astro`, and `/yuka` preserve optional peer boundaries
without creating separately installable npm identities.

`/yuka` is the model for third-party ecosystem adapters: it declares Yuka and
its rendering peers as optional peer dependencies, and is imported only by a
game that has deliberately selected that runtime. Core and ordinary renderer
adapters must not import third-party ecosystem adapters. This leaves room for
future integrations, including ECS runtimes such as Koota, without turning the
default package surface into a dependency bundle.

## Workspace disposition

| Workspace area | Status | Public surface |
| --- | --- | --- |
| `packages/strata-game-library` | Public and release-tracked | `strata-game-library` and its export-map subpaths |
| `packages/`, `adapters/`, `plugins/` implementation modules | Private | Bundled behind the public package; never separately published |

## Release contract

Release-please tracks only `packages/strata-game-library`. CD builds, validates
the exact tarball, and publishes only that package through npm trusted
publishing with provenance. No npm credential is exposed to pull requests.

Historical scoped packages are removed rather than preserved as aliases. They
must not be reintroduced in documentation, release configuration, or new
consumer examples.

## Acceptance checklist

- [x] One public package exists with explicit subpath exports.
- [x] Release-please tracks only that package.
- [x] Workspace implementation modules are private.
- [ ] The public tarball has no scoped runtime or type dependency.
- [ ] `strata-game-library` is published and its trusted publisher is verified.
- [ ] Historical scoped packages and their npm organization are deleted.
