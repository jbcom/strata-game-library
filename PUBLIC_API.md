---
title: Public API
updated: 2026-08-23
status: current
domain: technical
---

# Strata public API

What each package exports, and what is guaranteed to keep working.

Generated from the workspace manifests. Every subpath listed here is declared
in a package.json `exports` map and backed by a build entry — a previous
version of this document described `@jbcom/strata`, a package that no longer
exists, which is the failure this generation step exists to prevent.

## Packages

Three tiers, and the tier tells you what the package is for.

### The library

| Package | Purpose | Subpaths |
| --- | --- | --- |
| `@strata-game-library/core` | Pure TypeScript algorithms for procedural 3D graphics - terrain, water, vegetation, sky, volumetrics, ECS, pathfinding, physics | 22 |
| `@strata-game-library/presets` | Pre-configured presets for Strata 3D - ready-to-use terrain, weather, physics settings | 30 |
| `@strata-game-library/shaders` | GLSL shader collection for Strata 3D - terrain, water, clouds, volumetric effects | 13 |
| `strata-game-library` | Single-package entrypoint for Strata - declarative game APIs, React Three Fiber components, presets, shaders, and integrations | 17 |

### Renderer adapters

One per renderer. Pick the one matching your stack; you do not need the others.

| Package | Purpose | Subpaths |
| --- | --- | --- |
| `@strata-game-library/pixi` | Pixi 8 Application mount/unmount lifecycle for Strata — StrictMode-safe fresh-canvas handling and filter resolution fixes. | 0 |
| `@strata-game-library/r3f` | React Three Fiber components for Strata - terrain, water, vegetation, sky, volumetrics, physics, animation | 3 |
| `@strata-game-library/reactylon` | Babylon.js components for Strata via Reactylon - water, sky, vegetation, volumetrics | 1 |

### Host toolchain plugins

One per platform or build toolchain.

Two of these are published under a different name than the workspace uses:
`@strata-game-library/capacitor` installs as `@strata-game-library/capacitor-plugin`,
and `@strata-game-library/react-native` as `@strata-game-library/react-native-plugin`.
The rename has not reached npm.

| Package | Purpose | Subpaths |
| --- | --- | --- |
| `@strata-game-library/astro` | Astro integration for Strata Game Library — Vite config, CSS tokens, and Starlight theme | 3 |
| `@strata-game-library/audio-synth` | Procedural audio synthesis for Strata 3D using Tone.js - SFX, music, and ambient sound generation | 3 |
| `@strata-game-library/capacitor` | Cross-platform input, device detection, and haptics for Strata 3D games | 1 |
| `@strata-game-library/model-synth` | Procedural 3D model generation using Meshy API - characters, props, animations for React Three Fiber games | 1 |
| `@strata-game-library/react-native` | React Native plugin for Strata 3D - cross-platform input, device detection, and haptics for mobile games | 0 |
| `@strata-game-library/vite` | Vite toolchain integration for Strata: shared Vite, Vitest and tsup configuration for Strata packages and the games built on them. | 6 |

## Core domains

`@strata-game-library/core` is renderer-free TypeScript. It is organised into
15 domains, each with its own entry point:

- `@strata-game-library/core/core/animation`
- `@strata-game-library/core/core/audio`
- `@strata-game-library/core/core/camera`
- `@strata-game-library/core/core/ecs`
- `@strata-game-library/core/core/input`
- `@strata-game-library/core/core/math`
- `@strata-game-library/core/core/maze`
- `@strata-game-library/core/core/particles`
- `@strata-game-library/core/core/pathfinding`
- `@strata-game-library/core/core/physics`
- `@strata-game-library/core/core/rendering`
- `@strata-game-library/core/core/shared`
- `@strata-game-library/core/core/state`
- `@strata-game-library/core/core/terrain`
- `@strata-game-library/core/core/ui`

Import the domain, not the file:

```ts
import { createTerrain } from "@strata-game-library/core/core/terrain";
```

Deep file paths are not API. Earlier versions published one subpath per file —
28 of them, of which exactly one was ever imported — so the file layout was the
contract and moving a file was a breaking change. Domains are the contract now.

## Stability

- **Subpaths in the tables above** follow semantic versioning.
- **Anything reachable only by a deep file path** is internal, and moves without
  a major version.
- **`dist/` contents** are build output; import through the package name.

## Peer dependencies

Renderers and engines are peer dependencies, never bundled. A bundled copy of
`three` or `pixi.js` would mean two instances in one app, and `instanceof`
checks against the host copy would fail.
