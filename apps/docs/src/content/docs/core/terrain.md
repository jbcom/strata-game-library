---
title: Terrain System
description: Procedural terrain generation with SDF, marching cubes, and biome blending
---

# 🏔️ Terrain System

Strata's terrain system uses Signed Distance Functions (SDF) and the Marching Cubes algorithm to generate infinite, explorable 3D terrain with caves, overhangs, and multi-biome blending.

## Quick Start

```tsx
import { Terrain } from '@strata-game-library/core';

<Terrain
  biomes={['grassland', 'mountain', 'desert']}
  resolution={64}
  size={256}
/>
```

## How It Works

### 1. Signed Distance Functions (SDF)

Terrain is defined as a mathematical function that returns the distance to the surface:

- **Negative values**: Inside solid terrain
- **Positive values**: Outside (air)
- **Zero**: The surface

```tsx
import { sdTerrain, sdCaves, sdRock } from '@strata-game-library/core';

function customTerrainSDF(point: [number, number, number]): number {
  // Base terrain heightmap
  let d = sdTerrain(point, {
    amplitude: 50,
    frequency: 0.02
  });

  // Subtract caves
  d = Math.max(d, -sdCaves(point, {
    density: 0.1,
    size: 5
  }));

  // Add rock formations
  d = Math.min(d, sdRock(point, [20, 0, 20], 8));

  return d;
}
```

### 2. Marching Cubes

The marching cubes algorithm converts the SDF into a triangle mesh:

```tsx
import { generateTerrainChunk } from '@strata-game-library/core';

const geometry = generateTerrainChunk({
  position: [0, 0, 0],
  size: 32,
  resolution: 64,
  sdfFunction: customTerrainSDF
});
```

### 3. Biome Blending

Multiple biomes blend smoothly based on noise:

```tsx
import { getBiomeAt, getTerrainHeight } from '@strata-game-library/core';

const biome = getBiomeAt(x, z, biomeConfig);
const height = getTerrainHeight(x, z, biome);
```

## Components

### `<Terrain>`

The main terrain component with automatic chunking and LOD.

```tsx
import { Terrain } from '@strata-game-library/core';

<Terrain
  // Biome configuration
  biomes={['grassland', 'mountain', 'desert', 'snow']}
  biomeScale={0.001}

  // Terrain shape
  amplitude={80}
  frequency={0.015}
  octaves={6}

  // Mesh quality
  resolution={64}
  size={256}

  // Chunks
  chunkSize={32}
  viewDistance={3}

  // Position
  position={[0, 0, 0]}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `biomes` | `string[]` | `['default']` | Biome types to include |
| `biomeScale` | `number` | `0.001` | Scale of biome noise |
| `amplitude` | `number` | `50` | Maximum terrain height |
| `frequency` | `number` | `0.02` | Base noise frequency |
| `octaves` | `number` | `6` | Noise detail levels |
| `resolution` | `number` | `64` | Mesh resolution |
| `size` | `number` | `256` | Terrain size in units |
| `chunkSize` | `number` | `32` | Size of each chunk |
| `viewDistance` | `number` | `3` | Chunks to render |

### `<TerrainChunk>`

Individual terrain chunk for custom chunking systems:

```tsx
import { TerrainChunk } from '@strata-game-library/core';

<TerrainChunk
  position={[32, 0, 0]}
  size={32}
  resolution={64}
  sdf={customSDF}
/>
```

## Biome Types

### Built-in Biomes

| Biome | Description | Colors |
|-------|-------------|--------|
| `grassland` | Rolling green hills | Green, brown |
| `mountain` | Rocky peaks | Gray, white |
| `desert` | Sandy dunes | Tan, orange |
| `snow` | Frozen tundra | White, blue |
| `forest` | Dense woodland | Dark green |
| `swamp` | Wetlands | Brown, green |
| `volcanic` | Lava terrain | Black, red |
| `beach` | Coastal sand | Tan, white |

### Custom Biomes

```tsx
import { createBiome } from '@strata-game-library/core';

const customBiome = createBiome({
  name: 'alienPlanet',
  colors: {
    low: '#7b2cbf',    // Purple at sea level
    mid: '#9d4edd',    // Lighter purple
    high: '#c77dff',   // Pale purple peaks
    cliff: '#5a189a'   // Dark purple cliffs
  },
  terrainShape: {
    amplitude: 100,
    frequency: 0.01,
    sharpness: 0.8
  },
  vegetation: {
    trees: false,
    grass: true,
    grassColor: '#e0aaff'
  }
});
```

## Core Functions

### SDF Terrain Functions

```tsx
import {
  sdTerrain,
  sdCaves,
  sdRock,
  sdPlateaus,
  calcNormal
} from '@strata-game-library/core';

// Basic terrain heightfield
const d1 = sdTerrain(point, config);

// Cave systems
const d2 = sdCaves(point, { density: 0.1 });

// Rock formations
const d3 = sdRock(point, center, radius);

// Flat plateaus
const d4 = sdPlateaus(point, { height: 30, size: 50 });

// Calculate surface normal
const normal = calcNormal(point, sdfFunction);
```

### Noise Functions

```tsx
import { noise3D, fbm, warpedFbm } from '@strata-game-library/core';

// Simple 3D noise
const n1 = noise3D(x, y, z);

// Fractal Brownian Motion
const n2 = fbm(x, y, z, {
  octaves: 6,
  persistence: 0.5,
  lacunarity: 2.0
});

// Warped noise for more organic shapes
const n3 = warpedFbm(x, y, z, {
  octaves: 4,
  warpStrength: 0.5
});
```

### Geometry Generation

```tsx
import {
  marchingCubes,
  createGeometryFromMarchingCubes,
  generateTerrainChunk
} from '@strata-game-library/core';

// Low-level marching cubes
const { vertices, indices } = marchingCubes(sdf, bounds, resolution);

// Create Three.js geometry
const geometry = createGeometryFromMarchingCubes({
  bounds: { min: [-50, -50, -50], max: [50, 50, 50] },
  resolution: 64,
  sdf: terrainSDF
});

// Complete terrain chunk with materials
const chunk = generateTerrainChunk({
  position: [0, 0, 0],
  size: 32,
  resolution: 64,
  sdfFunction: terrainSDF,
  biomeFunction: getBiomeAt
});
```

## Texturing

### Triplanar Mapping

Strata uses triplanar mapping to avoid texture stretching on steep surfaces:

```tsx
import { createTriplanarMaterial } from '@strata-game-library/core';
import { useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';

// Load textures using R3F's useLoader hook
const grassTexture = useLoader(TextureLoader, '/textures/grass.jpg');
const rockTexture = useLoader(TextureLoader, '/textures/rock.jpg');
const sandTexture = useLoader(TextureLoader, '/textures/sand.jpg');
const snowTexture = useLoader(TextureLoader, '/textures/snow.jpg');

const material = createTriplanarMaterial({
  textures: {
    grass: grassTexture,
    rock: rockTexture,
    sand: sandTexture,
    snow: snowTexture
  },
  blendSharpness: 4,
  textureScale: 0.1
});
```

### Height-Based Blending

```tsx
import { createHeightBlendMaterial } from '@strata-game-library/core';

const material = createHeightBlendMaterial({
  levels: [
    { height: 0, texture: sandTexture },
    { height: 20, texture: grassTexture },
    { height: 50, texture: rockTexture },
    { height: 80, texture: snowTexture }
  ],
  blendRange: 10
});
```

## Performance Tips

### 1. LOD (Level of Detail)

```tsx
<Terrain
  lodLevels={[
    { distance: 0, resolution: 64 },
    { distance: 100, resolution: 32 },
    { distance: 300, resolution: 16 }
  ]}
/>
```

### 2. Chunk Loading

```tsx
<Terrain
  viewDistance={2}           // Fewer chunks
  chunkSize={64}             // Larger chunks
  loadingPriority="distance" // Load nearest first
/>
```

### 3. GPU Instancing for Details

```tsx
<Terrain>
  <TerrainDetails
    rocks={1000}
    pebbles={5000}
    useInstancing
  />
</Terrain>
```

## Examples

### Island Terrain

```tsx
<Terrain
  biomes={['beach', 'grassland', 'mountain']}
  shape="island"
  size={512}
  waterLevel={0}
/>
```

### Cave System

You can create terrain with caves by composing the `Terrain` component with cave SDF functions:

```tsx
import { Terrain } from '@strata-game-library/core';
import { sdTerrain, sdCaves } from '@strata-game-library/core';

// Define a custom SDF that combines terrain with caves
function terrainWithCaves(point: [number, number, number]): number {
  // Base terrain
  let d = sdTerrain(point, { amplitude: 50, frequency: 0.02 });

  // Subtract cave system (negative SDF = hollow space)
  const caves = sdCaves(point, {
    density: 0.15,
    minSize: 3,
    maxSize: 15,
    connectivity: 0.7
  });
  d = Math.max(d, -caves);

  return d;
}

// Use the custom SDF with Terrain component
<Terrain
  sdf={terrainWithCaves}
  size={256}
  resolution={64}
/>
```

### Floating Islands

```tsx
<Terrain
  shape="floatingIslands"
  islandCount={5}
  islandSize={[50, 100]}
  islandHeight={[20, 80]}
/>
```

## Live Demo

<iframe
  src="https://strata-game-library.github.io/examples/basic-terrain/"
  class="showcase-iframe"
  title="Terrain Demo"
></iframe>

[View Full Demo](https://strata-game-library.github.io/examples/basic-terrain/) | [View Source](https://github.com/strata-game-library/examples/tree/main/basic-terrain)

## Related

- [Vegetation](/core/vegetation/) - Add plants to terrain
- [Water](/core/water/) - Add water bodies
- [Terrain Shaders](/shaders/terrain/) - Custom terrain shaders
- [Terrain Presets](/presets/terrain/) - Ready-to-use configurations
