---
title: "Renderer-Agnostic Restructure Design"
description: "Design for restructuring monorepo with renderer-agnostic core, R3F/Reactylon adapters, and release automation"
status: implemented
implementation: 100
last_updated: 2026-03-01
area: plans
---

# Renderer-Agnostic Restructure & Release Automation

**Date:** 2026-02-24
**Status:** Approved
**Author:** Claude Opus 4.6 + jbogaty

## Goals

1. Restructure the monorepo so core algorithms are renderer-agnostic
2. Extract R3F components into a dedicated adapter package
3. Create a Babylon.js/Reactylon adapter for multi-renderer support
4. Create an Astro plugin and dogfood it in the docs site
5. Reorganize plugins into domain directories
6. Implement proper release automation (cd.yml + release.yml + automerge.yml)

## Architecture Decision: Algorithm-First

Strata's core value is its algorithms (noise, SDF, marching cubes, ECS, pathfinding, state machines, physics logic, animation math). These are renderer-agnostic. The React component layer becomes a thin adapter that wraps core algorithms for a specific renderer.

This means:

- `core` = pure TypeScript, zero React imports, zero renderer dependencies
- `r3f` = React Three Fiber adapter (current `core/components/` extracted)
- `reactylon` = Babylon.js adapter via Reactylon (new)
- Future adapters (2D, PlayCanvas, etc.) follow the same pattern

## Directory Structure

```text
strata/
  packages/
    core/                 # Pure TS algorithms ONLY
    shaders/              # GLSL shaders
    presets/              # Config presets

  adapters/
    r3f/                  # React Three Fiber components
    reactylon/            # Babylon.js components via Reactylon

  plugins/
    astro/                # Astro integration plugin
    audio-synth/          # Tone.js audio synthesis
    model-synth/          # Meshy API 3D model generation
    capacitor/            # Capacitor mobile
    react-native/         # React Native mobile

  apps/
    docs/                 # Astro docs site (dogfoods plugins/astro)
    examples/             # Example projects
```

## Package Names

| Directory | npm Package | Status |
|-----------|------------|--------|
| `packages/core` | `@strata-game-library/core` | Existing (scope narrowed) |
| `packages/shaders` | `@strata-game-library/shaders` | Existing (unchanged) |
| `packages/presets` | `@strata-game-library/presets` | Existing (unchanged) |
| `adapters/r3f` | `@strata-game-library/r3f` | New |
| `adapters/reactylon` | `@strata-game-library/reactylon` | New |
| `plugins/astro` | `@strata-game-library/astro` | New |
| `plugins/audio-synth` | `@strata-game-library/audio-synth` | Existing (moved) |
| `plugins/model-synth` | `@strata-game-library/model-synth` | Existing (moved) |
| `plugins/capacitor` | `@strata-game-library/capacitor` | Existing (renamed) |
| `plugins/react-native` | `@strata-game-library/react-native` | Existing (renamed) |

## Dependency Graph

```text
shaders (leaf — no deps)
    |
core (pure TS, depends on shaders)
    |
  +-------+----------+
  |                   |
  r3f              reactylon      (renderer adapters)
  |
  presets (depends on core, optional dep on r3f)

plugins: astro, audio-synth, model-synth, capacitor, react-native
  (each standalone or depends on core)
```

## Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - packages/*
  - adapters/*
  - plugins/*
  - apps/*
```

## Core Extraction

The key migration is splitting `packages/core`:

**Stays in `packages/core/src/`:**

- `core/` — all pure TS algorithms (ai, animation, audio, camera, debug, ecs, math, pathfinding, state, weather, etc.)
- `api/` — createGame, StrataGame, entities, effects, rendering, compose, world, systems, experience
- `game/` — SceneManager, ModeManager, TriggerSystem, TransitionManager
- `compose/` — materials, skeletons, creatures, props
- `world/` — WorldGraph, RegionSystem, ConnectionSystem, SpawnSystem
- `hooks/` — useKeyboardControls, useYuka (non-renderer hooks)
- `types/` — TypeScript type definitions
- `utils/` — utility functions

**Moves to `adapters/r3f/src/`:**

- `components/` — all React Three Fiber components (ai, animation, audio, camera, clouds, decals, input, instancing, lod, parallax, particles, physics, postprocessing, shaders, sky, state, ui, volumetrics, water, weather)
- `hooks/` — renderer-specific hooks (useFrame wrappers, etc.)

## Astro Plugin Design

### Purpose

Drop-in Astro integration that configures Vite for 3D rendering, ships reusable demo infrastructure, and includes the Strata CSS design system.

### Structure

```text
plugins/astro/src/
  index.ts              # Astro integration entry point
  vite-plugin.ts        # Vite SSR config for R3F/Three.js/Babylon
  css/
    tokens.css          # Design tokens (colors, gradients, fonts)
    components.css      # Cards, badges, grids, demo containers
    starlight.css       # Starlight-specific overrides (optional)
  components/
    DemoContainer.tsx   # Wrapper with badge, controls, responsive sizing
    SceneCanvas.tsx     # Pre-configured Canvas with OrbitControls + defaults
  utils/
    head-tags.ts        # OG meta, font preloading helpers
```

### Usage

```js
import strata from '@strata-game-library/astro';

export default defineConfig({
  integrations: [
    strata({
      css: true,
      starlight: true,
      viteR3F: true,
    }),
  ],
});
```

### Dogfooding

The docs site replaces its manual Vite config and custom.css with imports from the plugin. Content-specific demo components (TerrainDemo, WaterDemo) stay in apps/docs but use DemoContainer and SceneCanvas from the plugin.

## Reactylon Adapter Design

### Strategy

Build incrementally. Phase 1 covers the most direct mappings from pure TS core.

### Phase 1 (Launch)

```text
adapters/reactylon/src/
  components/
    Water.tsx           # Babylon.js water using core wave algorithms
    ProceduralSky.tsx   # Babylon.js sky using core sky math
    GrassInstances.tsx  # Babylon.js thin instances using core placement
    VolumetricFog.tsx   # Babylon.js fog using core volumetric math
  hooks/
    useStrataScene.ts   # Scene setup helper
  index.ts
```

### Pattern

Each component imports pure TS from core and wraps in Reactylon JSX:

```tsx
import { createWaterGeometry, calculateGerstnerWave } from '@strata-game-library/core';
// Reactylon JSX creates Babylon.js mesh with computed geometry
```

### Peer Dependencies

`@babylonjs/core`, `reactylon`, `react`

### Phase 2+ (Post-Launch)

Physics (Havok integration), animation, camera, ECS rendering.

## Workflow Architecture

### Pipeline

```text
PR opened/updated
    -> ci.yml (lint, typecheck, build, test)
    -> automerge.yml (if Dependabot + CI green -> auto-merge)

Push to main
    -> cd.yml
        1. Build all packages
        2. Test all packages
        3. nx release (conventional commits -> version bump + changelog + tag)
        4. Creates GitHub Release
        5. Version bump commit includes [skip actions]

GitHub Release published
    -> release.yml
        1. Build all packages
        2. npm publish with OIDC provenance
```

### cd.yml (Push to Main)

```yaml
on:
  push:
    branches: [main]

jobs:
  release:
    if: "!contains(github.event.head_commit.message, '[skip actions]')"
    steps:
      - checkout (fetch-depth: 0)
      - setup pnpm 9 + node 22
      - pnpm install --frozen-lockfile
      - pnpm run build
      - pnpm run test
      - git config (github-actions[bot])
      - nx release (version + changelog + tag + GitHub Release)
```

### release.yml (On GitHub Release)

```yaml
on:
  release:
    types: [published]

permissions:
  contents: read
  id-token: write  # OIDC for npm provenance

jobs:
  publish:
    steps:
      - checkout
      - setup pnpm 9 + node 22 (registry-url: https://registry.npmjs.org)
      - pnpm install --frozen-lockfile
      - pnpm run build
      - pnpm publish -r --access public --provenance
```

### automerge.yml (Dependabot PRs)

```yaml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  automerge:
    if: github.actor == 'dependabot[bot]'
    permissions:
      contents: write
      pull-requests: write
    steps:
      - gh pr review --approve
      - gh pr merge --auto --squash
```

## Nx Release Configuration

- All 10 packages in release project list
- Independent versioning per package
- Conventional commits determine bumps
- Tag pattern: `{projectName}@{version}`
- Commit message: `chore(release): {projectName} {version} [skip actions]`
- `updateDependents: "auto"` (core bump -> r3f/reactylon get patch bumps)

## Migration Summary

| Change | Description |
|--------|-------------|
| Extract `core/components/` | Move to `adapters/r3f/` |
| Create `adapters/reactylon/` | New Babylon.js adapter |
| Create `plugins/astro/` | New Astro integration |
| Move `packages/audio-synth` | To `plugins/audio-synth` |
| Move `packages/model-synth` | To `plugins/model-synth` |
| Rename `packages/capacitor-plugin` | To `plugins/capacitor` |
| Rename `packages/react-native-plugin` | To `plugins/react-native` |
| New `release.yml` | OIDC npm publish on release event |
| Refactor `cd.yml` | Nx Release on push to main |
| New `automerge.yml` | Auto-merge Dependabot PRs |
| Update `pnpm-workspace.yaml` | Add adapters/*, plugins/* |
| Update `nx.json` | 10 release projects, updated config |
