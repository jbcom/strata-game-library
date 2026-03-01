---
title: Project Brief
version: "1.0"
updated: 2026-03-01
---

# Project Brief

## Identity

**@strata-game-library** -- A procedural 3D graphics library evolving into a complete game framework.

- **Repository**: [github.com/jbcom/strata-game-library](https://github.com/jbcom/strata-game-library)
- **npm scope**: `@strata-game-library`
- **Domain**: [strata.game](https://strata.game)

## What It Is

A TypeScript monorepo providing procedural 3D content generation and game framework capabilities. The core is pure TypeScript (no React), with renderer adapters for React Three Fiber and Babylon.js (Reactylon).

### Current Capabilities (Toolkit)

- Terrain generation (SDF, marching cubes, erosion)
- Water effects (waves, caustics, reflections)
- Sky system (day/night cycle, weather, atmospheric scattering)
- Volumetric effects (fog, underwater, clouds)
- Vegetation instancing (with seeded random for reproducibility)
- Particle systems
- Character animation (IK, skeletal, procedural)
- Post-processing effects
- ECS (Entity Component System)
- Physics integration
- AI behaviors (pathfinding, steering, state machines)

### Target Capabilities (Framework -- Epic #50)

- Game orchestration (scenes, modes, triggers)
- World topology (regions, connections, spatial queries)
- Compositional objects (materials, skeletons, creatures, props)
- Declarative game definition (`createGame()` -> `<StrataGame />`)

## Monorepo Structure

10 packages + 2 apps organized in an Nx + pnpm workspace:

| Category | Packages |
|----------|----------|
| Core | `packages/core`, `packages/shaders`, `packages/presets` |
| Adapters | `adapters/r3f`, `adapters/reactylon` |
| Plugins | `plugins/audio-synth`, `plugins/model-synth`, `plugins/capacitor`, `plugins/react-native`, `plugins/astro` |
| Apps | `apps/docs`, `apps/examples` |

## Core Requirements

1. **Pure TypeScript core** -- `packages/core` must never import React
2. **Renderer-agnostic** -- core algorithms work with any 3D renderer
3. **Adapter pattern** -- renderer-specific code in `adapters/`
4. **Plugin architecture** -- optional extensions in `plugins/`
5. **Declarative API** -- end goal is `createGame()` for 10x code reduction
6. **Quality** -- TypeScript strict mode, no `any`, comprehensive tests

## Key References

- [Epic #50](https://github.com/jbcom/strata-game-library/issues/50) -- Game framework evolution
- [Architecture docs](docs/architecture/README.md) -- RFCs and roadmap
- [PUBLIC_API.md](PUBLIC_API.md) -- Stable API surface
- [CONTRACT.md](CONTRACT.md) -- Stability guarantees
