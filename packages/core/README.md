# @strata-game-library/core

[![npm version](https://img.shields.io/npm/v/@strata-game-library/core)](https://www.npmjs.com/package/@strata-game-library/core)
[![license](https://img.shields.io/npm/l/@strata-game-library/core)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

Procedural 3D graphics library for React Three Fiber -- terrain, water, vegetation, sky, volumetrics, and characters.

## Installation

```bash
pnpm add @strata-game-library/core
```

Peer dependencies:

```bash
pnpm add @react-three/fiber @react-three/drei three react react-dom
```

## Quick Start

```tsx
import { Canvas } from '@react-three/fiber';
import { Terrain, Water, ProceduralSky } from '@strata-game-library/core/components';

function Scene() {
  return (
    <Canvas>
      <ProceduralSky />
      <Terrain size={256} resolution={128} />
      <Water position={[0, -2, 0]} size={512} />
    </Canvas>
  );
}
```

## Features

- **Terrain** -- Procedural heightmap generation with erosion, biomes, and LOD
- **Water** -- Realistic water rendering with reflections, refractions, and caustics
- **Vegetation** -- GPU-instanced trees, grass, and foliage with wind animation
- **Sky** -- Physically-based atmospheric scattering and dynamic time-of-day
- **Volumetrics** -- Fog, clouds, and god rays via raymarching
- **Characters** -- Skeletal animation, IK solvers, and procedural motion
- **ECS** -- Entity component system built on Miniplex
- **Physics** -- Rapier integration for rigid body and collision handling
- **AI** -- Pathfinding, steering behaviors, and state machines (Yuka / XState)
- **Animation** -- Tweening, bone animation, and inverse kinematics
- **Audio** -- Spatial audio and sound management via Howler
- **State** -- Game state management with Zustand and undo/redo support
- **Composition** -- Declarative game definition with `createGame()` API

## Exports

| Path | Contents |
|------|----------|
| `@strata-game-library/core` | Full library |
| `@strata-game-library/core/components` | React Three Fiber components |
| `@strata-game-library/core/hooks` | React hooks |
| `@strata-game-library/core/core` | Pure TypeScript logic (no React) |
| `@strata-game-library/core/shaders` | Shader re-exports |
| `@strata-game-library/core/api` | High-level API |
| `@strata-game-library/core/game` | Game orchestration |
| `@strata-game-library/core/compose` | Compositional object system |
| `@strata-game-library/core/world` | World topology and regions |
| `@strata-game-library/core/utils` | Utility functions |

## Documentation

Full documentation, guides, and API reference: [https://strata.game/core/](https://strata.game/core/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
