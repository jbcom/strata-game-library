# @strata-game-library/reactylon

[![npm version](https://img.shields.io/npm/v/@strata-game-library/reactylon)](https://www.npmjs.com/package/@strata-game-library/reactylon)
[![license](https://img.shields.io/npm/l/@strata-game-library/reactylon)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

Babylon.js adapter for the Strata Game Library via [Reactylon](https://reactylon.com). Provides procedural water, sky, and terrain components powered by Strata's core shader algorithms, rendered through Babylon.js.

## Installation

```bash
pnpm add @strata-game-library/reactylon
```

### Peer Dependencies

This package requires Babylon.js, React, and Reactylon as peer dependencies:

```bash
pnpm add @babylonjs/core react reactylon
```

| Peer Dependency | Minimum Version |
|-----------------|-----------------|
| `@babylonjs/core` | `>=8.0.0` |
| `react` | `>=18.0.0` |
| `reactylon` | `>=0.1.0` |

## Quick Start

```tsx
import { StrataSky, StrataTerrain, StrataWater, useStrataScene } from '@strata-game-library/reactylon';
import { useEffect, useRef } from 'react';

function GameScene() {
  const { applyToScene } = useStrataScene({
    fog: { mode: 'exponential', density: 0.01, color: '#c8d8e8' },
    ambientLight: { intensity: 0.6, color: '#ffffff' },
    physics: { gravity: -9.81 },
  });

  return (
    <>
      <StrataSky
        timeOfDay={{ sunAngle: 60, sunIntensity: 0.8 }}
        weather={{ intensity: 0.2 }}
      />
      <StrataTerrain
        size={200}
        segments={128}
        groundColor="#4a6630"
        rockColor="#666666"
        roughness={0.8}
      />
      <StrataWater
        size={100}
        segments={64}
        waterColor="#2a5a8a"
        deepWaterColor="#1a3a5a"
        causticIntensity={0.4}
      />
    </>
  );
}
```

## Features

- **Water** -- Animated water surface with caustics, foam, and configurable wave parameters
- **Sky** -- Procedural sky with day/night cycles, atmospheric scattering, star visibility, and weather effects
- **Terrain** -- Noise-based terrain with slope-dependent rock coloring and configurable roughness
- **Scene Configuration** -- Declarative fog, ambient lighting, and physics setup via `useStrataScene`
- **Material Factories** -- Low-level shader material creators for direct Babylon.js integration without Reactylon JSX

## Components

### `<StrataWater>`

Animated water surface with caustics and foam, driven by Strata's core water shader.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `[number, number, number]` | `[0, -0.2, 0]` | Water plane position |
| `size` | `number` | `100` | Size in world units |
| `segments` | `number` | `64` | Geometry segments for wave detail |
| `waterColor` | `string` | `'#2a5a8a'` | Surface water color (hex) |
| `deepWaterColor` | `string` | `'#1a3a5a'` | Deep water color for depth blending |
| `foamColor` | `string` | `'#8ab4d4'` | Foam color for wave crests |
| `causticIntensity` | `number` | `0.4` | Caustic light intensity (0--1) |
| `waveHeight` | `number` | `0.5` | Wave height multiplier |
| `waveSpeed` | `number` | `1.0` | Wave speed multiplier |
| `visible` | `boolean` | `true` | Toggle visibility |

### `<StrataSky>`

Procedural sky with dynamic day/night cycles and weather effects.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `timeOfDay` | `TimeOfDayState` | `{}` | Sun angle, intensity, star visibility, fog |
| `weather` | `WeatherState` | `{}` | Weather intensity (0 = clear, 1 = stormy) |
| `size` | `[number, number]` | `[200, 100]` | Sky plane dimensions |
| `distance` | `number` | `50` | Distance from camera |
| `visible` | `boolean` | `true` | Toggle visibility |

Use the `createTimeOfDay(hour)` helper to generate `TimeOfDayState` from a decimal hour (0--24):

```ts
import { createTimeOfDay } from '@strata-game-library/reactylon';

const noon = createTimeOfDay(12);    // { sunAngle: 90, sunIntensity: 1, ... }
const dusk = createTimeOfDay(18);    // { sunAngle: 0, sunIntensity: 0, starVisibility: 1, ... }
```

### `<StrataTerrain>`

Noise-based procedural terrain with slope-dependent coloring.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `[number, number, number]` | `[0, 0, 0]` | Terrain position |
| `size` | `number` | `200` | Size in world units |
| `segments` | `number` | `128` | Geometry segments (higher = more detail) |
| `groundColor` | `string` | `'#4a6630'` | Ground/grass color (hex) |
| `rockColor` | `string` | `'#666666'` | Rock/cliff color (hex) |
| `roughness` | `number` | `0.8` | Surface roughness (0--1) |
| `visible` | `boolean` | `true` | Toggle visibility |

## Hooks

### `useStrataScene(config?)`

Declaratively configure fog, ambient lighting, and physics for a Babylon.js scene.

```ts
const { ready, config, applyToScene } = useStrataScene({
  fog: { mode: 'exponential', density: 0.01, color: '#c8d8e8' },
  ambientLight: { intensity: 0.6, color: '#ffffff' },
  physics: { gravity: -9.81, enabled: true },
});

// Apply to a Babylon.js Scene instance
applyToScene(scene);
```

### `useStrataTerrainMaterial(options?)`

Get a terrain material handle for direct Babylon.js integration without using the `<StrataTerrain>` component.

```ts
const handle = useStrataTerrainMaterial({
  groundColor: '#4a6630',
  rockColor: '#666666',
  roughness: 0.8,
});
// Use handle.vertexShader and handle.fragmentShader with BABYLON.ShaderMaterial
```

## Material Factories

For direct Babylon.js integration without Reactylon JSX, use the low-level material factory functions:

| Factory | Returns |
|---------|---------|
| `createBabylonWaterShaderMaterial(options)` | `BabylonWaterMaterialHandle` |
| `createBabylonSkyShaderMaterial(options)` | `BabylonSkyMaterialHandle` |
| `createBabylonTerrainShaderMaterial(options)` | `BabylonTerrainMaterialHandle` |

Each handle provides shader source code, uniform values, and update/dispose methods for use with `BABYLON.ShaderMaterial`.

## Architecture

This package is the Babylon.js counterpart to `@strata-game-library/r3f` (the React Three Fiber adapter). Both adapters share the same core algorithms from `@strata-game-library/core` and shader code from `@strata-game-library/shaders`, adapted for their respective rendering pipelines.

```text
@strata-game-library/core       (pure TypeScript algorithms)
@strata-game-library/shaders    (GLSL shader code)
        |
        +-- @strata-game-library/r3f        (React Three Fiber adapter)
        +-- @strata-game-library/reactylon  (Babylon.js adapter)  <-- this package
```

## Documentation

Full documentation, guides, and API reference: [https://strata.game](https://strata.game)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
