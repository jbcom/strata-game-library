---
title: Product Context
version: "1.0"
updated: 2026-03-01
---

# Product Context

## Problem Statement

Building 3D games in the browser requires assembling dozens of low-level libraries, writing boilerplate for scene management, and manually wiring up game systems. There is no "Rails for 3D games" that lets developers define a game declaratively and get a working product.

## Current State: Excellent Graphics Toolkit

Strata currently provides high-quality procedural 3D content generation:

- **Terrain**: Multi-algorithm generation (SDF, marching cubes) with erosion simulation
- **Water**: Realistic waves, caustics, reflections with shader-based rendering
- **Sky**: Full day/night cycle with atmospheric scattering and weather
- **Vegetation**: GPU-instanced plants with wind animation and LOD
- **Volumetrics**: Fog, underwater effects, volumetric clouds
- **Animation**: IK solving, skeletal animation, procedural animation

This toolkit layer is mature with 2500+ tests and comprehensive documentation.

## Target State: Complete Game Framework

The evolution (Epic #50) adds four layers on top of the toolkit:

1. **Game Orchestration** -- Define scenes, game modes, and transitions declaratively
2. **World Topology** -- Graph-based world regions with connections and spatial queries
3. **Compositional Objects** -- Build creatures and props from materials + skeletons
4. **Declarative Games** -- `createGame()` API for 10x code reduction

### End Goal

```typescript
const game = createGame({
  content: { creatures, props, materials },
  world: worldGraph,
  modes: { exploration, racing, combat },
  statePreset: 'rpg',
});

<StrataGame game={game} />
```

## Target Users

### Primary: Game Developers

- Want procedural 3D content without writing shader code
- Use React (Three Fiber) or Babylon.js as their renderer
- Need game framework features (scenes, state, AI) built-in
- Value TypeScript type safety and developer experience

### Secondary: Creative Coders

- Procedural art and generative design
- Interactive 3D experiences (not necessarily games)
- Educational/research visualization

## Key Differentiators

1. **Compositional object system** -- Build creatures from materials + skeletons instead of importing 3D models
2. **Renderer-agnostic core** -- Same algorithms work with R3F and Babylon.js
3. **Declarative game definition** -- Define games as data, not imperative code
4. **Procedural everything** -- Terrain, water, sky, vegetation all generated at runtime
5. **TypeScript-first** -- Full type safety with strict mode, no `any`

## Validation Targets

Games being built with Strata to validate the framework:

| Game | Type | Key Systems |
|------|------|-------------|
| Rivermarsh | Mobile exploration | World topology, creatures, terrain |
| Otter River Rush | Racing | Game modes, physics, terrain |
| Otterfall | 3D adventure | AI, animation, world graph |
| Rivers of Reckoning | Roguelike | ECS, procedural generation |
