---
title: Architecture
description: Understand how Strata is organized and how the layers work together
---

# Architecture

Strata is built as a layered architecture, with each layer building on the previous one. This design provides flexibility—you can use the high-level components for rapid development, or drop down to lower levels for fine-grained control.

## The Layer Model

```
┌─────────────────────────────────────────────────────────┐
│          Layer 4: Game Framework & Presets              │
│   Ready-to-use configurations, game state, controllers  │
├─────────────────────────────────────────────────────────┤
│          Layer 3: React Three Fiber Components          │
│   <Water>, <Terrain>, <GrassInstances>, <ProceduralSky> │
├─────────────────────────────────────────────────────────┤
│          Layer 2: Core Algorithms                       │
│   SDF, Marching Cubes, Noise, Materials                 │
├─────────────────────────────────────────────────────────┤
│          Layer 1: GLSL Shaders                          │
│   Water, Terrain, Sky, Volumetrics, Materials           │
├─────────────────────────────────────────────────────────┤
│          Layer 0: TypeScript Types & Utilities          │
│   Type definitions, math utilities, helpers             │
└─────────────────────────────────────────────────────────┘
```

## Layer 0: Types & Utilities

The foundation layer provides TypeScript type definitions and utility functions used throughout the library.

```tsx
import type {
  BiomeConfig,
  WaterConfig,
  SkyConfig,
  TerrainChunk
} from '@strata-game-library/core/types';

import {
  clamp,
  lerp,
  smoothstep,
  vec3
} from '@strata-game-library/core/utils';
```

## Layer 1: GLSL Shaders

The shader layer contains all GLSL vertex and fragment shaders. These can be used independently with any Three.js project.

```tsx
import {
  waterVertexShader,
  waterFragmentShader,
  skyVertexShader,
  skyFragmentShader
} from '@strata-game-library/shaders';

// Use with Three.js ShaderMaterial
const material = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color(0x0077be) },
  }
});
```

Available shader categories:

- **Terrain**: Height-based blending, triplanar mapping
- **Water**: Wave animation, reflections, refractions
- **Sky**: Atmospheric scattering, sun/moon
- **Clouds**: Volumetric and layered clouds
- **Volumetrics**: Fog, god rays, underwater
- **Materials**: Toon, hologram, dissolve, forcefield, glitch
- **Vegetation**: Wind animation for grass and trees

## Layer 2: Core Algorithms

Pure TypeScript implementations of core algorithms with no React dependencies.

### SDF (Signed Distance Functions)

```tsx
import {
  sdSphere,
  sdBox,
  sdCapsule,
  sdTorus,
  opUnion,
  opSubtraction,
  opSmoothUnion
} from '@strata-game-library/core';

// Combine shapes
const scene = opSmoothUnion(
  sdSphere(point, center, radius),
  sdBox(point, boxCenter, boxSize),
  0.5 // smoothness
);
```

### Noise Functions

```tsx
import {
  noise3D,
  fbm,
  warpedFbm
} from '@strata-game-library/core';

// Generate terrain height
const height = fbm(x * 0.01, 0, z * 0.01, {
  octaves: 6,
  persistence: 0.5,
  lacunarity: 2.0
});
```

### Marching Cubes

```tsx
import {
  marchingCubes,
  createGeometryFromMarchingCubes,
  generateTerrainChunk
} from '@strata-game-library/core';

// Generate terrain mesh
const geometry = generateTerrainChunk({
  position: [0, 0, 0],
  size: 32,
  resolution: 64,
  sdfFunction: terrainSDF
});
```

### Material Creation

```tsx
import {
  createWaterMaterial,
  createAdvancedWaterMaterial,
  createSkyMaterial,
  createRaymarchingMaterial
} from '@strata-game-library/core';

const waterMaterial = createWaterMaterial({
  color: new THREE.Color(0x0077be),
  opacity: 0.8,
  reflectivity: 0.5
});
```

## Layer 3: React Components

High-level React Three Fiber components that wrap the core algorithms.

### Water Components

```tsx
import { Water, AdvancedWater } from '@strata-game-library/core';

<Water size={100} depth={20} />
<AdvancedWater
  size={200}
  waveHeight={2}
  reflections
  caustics
/>
```

### Vegetation Components

```tsx
import {
  GrassInstances,
  TreeInstances,
  RockInstances,
  GPUInstancedMesh
} from '@strata-game-library/core';

<GrassInstances count={10000} spread={100} />
<TreeInstances count={500} spread={200} />
```

### Sky Components

```tsx
import { ProceduralSky } from '@strata-game-library/core';

<ProceduralSky
  sunPosition={[100, 50, 100]}
  turbidity={10}
  rayleigh={2}
/>
```

### Volumetric Components

```tsx
import {
  VolumetricEffects,
  VolumetricFogMesh,
  UnderwaterOverlay,
  EnhancedFog
} from '@strata-game-library/core';

<VolumetricFogMesh density={0.02} />
<UnderwaterOverlay depth={10} />
```

## Layer 4: Presets & Game Framework

The highest layer provides ready-to-use configurations and game framework utilities.

### Presets

```tsx
import { createTerrainPreset, TerrainBiomes } from '@strata-game-library/presets/terrain';
import { createWeatherPreset, WeatherPresets } from '@strata-game-library/presets/weather';
import { createWaterPreset, WaterTypes } from '@strata-game-library/presets/water';

const terrain = createTerrainPreset({
  biomes: [TerrainBiomes.GRASSLAND, TerrainBiomes.MOUNTAIN],
  resolution: 128
});

const weather = createWeatherPreset(WeatherPresets.RAIN);
const water = createWaterPreset(WaterTypes.OCEAN);
```

### Game Framework (Coming Soon)

```tsx
import {
  useGameState,
  useCharacterController,
  useInventory
} from '@strata-game-library/core/game';
```

## Package Structure

Strata is organized as multiple packages for flexibility:

### Main Package (`@strata-game-library/core`)

The core library with components, algorithms, and utilities:

```tsx
// Main package - components
import { Water, ProceduralSky, Terrain, GrassInstances } from '@strata-game-library/core';

// Subpath: Core algorithms
import { marchingCubes, noise3D, sdSphere } from '@strata-game-library/core';

// Subpath: Utility functions
import { clamp, lerp, smoothstep } from '@strata-game-library/core/utils';

// Subpath: TypeScript types
import type { BiomeConfig, WaterConfig } from '@strata-game-library/core/types';
```

### Shaders Package (`@strata-game-library/shaders`)

Standalone GLSL shaders (works with any Three.js project):

```tsx
import {
  waterVertexShader,
  waterFragmentShader,
  skyVertexShader,
  skyFragmentShader
} from '@strata-game-library/shaders';
```

### Presets Package (`@strata-game-library/presets`)

Pre-configured settings (requires `@strata-game-library/core`):

```tsx
import { createTerrainPreset, TerrainBiomes } from '@strata-game-library/presets/terrain';
import { createWaterPreset, WaterTypes } from '@strata-game-library/presets/water';
```

### Mobile Plugins

Platform-specific capabilities:

```tsx
// React Native
import { useDevice, useHaptics } from '@strata-game-library/react-native-plugin';

// Capacitor (Web/iOS/Android/Electron)
import { useDevice, useInput } from '@strata-game-library/capacitor-plugin/react';
```

## Directory Structure

```
@strata-game-library/core/
├── src/
│   ├── api/          # Public API contracts
│   ├── components/   # React Three Fiber components
│   ├── compose/      # Component composition utilities
│   ├── core/         # Core algorithms (SDF, noise, marching cubes)
│   ├── game/         # Game framework (coming soon)
│   ├── hooks/        # React hooks
│   ├── presets/      # Pre-configured settings
│   ├── shaders/      # GLSL shaders
│   ├── types/        # TypeScript type definitions
│   ├── utils/        # Utility functions
│   └── world/        # World generation utilities
```

## Design Principles

### 1. Progressive Disclosure

Start with high-level components, drop down to lower layers when needed.

### 2. Zero Configuration

Everything works out of the box with sensible defaults.

### 3. Full Customization

Every parameter is configurable when you need control.

### 4. Performance First

GPU-accelerated by default, mobile-optimized.

### 5. TypeScript Native

Full type safety with excellent IDE support.

## Next Steps

- [Core Features](/core/) - Explore all components
- [Shaders](/shaders/) - Use shaders directly
- [Presets](/presets/) - Ready-to-use configurations
- [API Reference](/api/) - Complete API documentation
