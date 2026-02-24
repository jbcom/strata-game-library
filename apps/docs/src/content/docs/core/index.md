---
title: Core Features
description: Overview of all Strata core features and components
---

# Core Features

The `@strata-game-library/core` package provides a comprehensive set of procedural 3D graphics features for React Three Fiber. This section covers all the core capabilities.

## Feature Overview

| Feature | Description | Components |
|---------|-------------|------------|
| 🏔️ [Terrain](/core/terrain/) | Procedural terrain with biomes | `Terrain`, `TerrainChunk` |
| 🌊 [Water](/core/water/) | Realistic water rendering | `Water`, `AdvancedWater` |
| 🌿 [Vegetation](/core/vegetation/) | GPU-instanced plants | `GrassInstances`, `TreeInstances`, `RockInstances` |
| ☀️ [Sky](/core/sky/) | Procedural atmosphere | `ProceduralSky` |
| 🌫️ [Volumetrics](/core/volumetrics/) | Fog and effects | `VolumetricFogMesh`, `UnderwaterOverlay` |
| 🎮 [Characters](/core/characters/) | Animated characters | `Character`, `IKChain` |
| 🎨 [Ray Marching](/core/raymarching/) | SDF rendering | `Raymarching` |
| 🐕 [Fur System](/core/fur/) | Shell-based fur | `FurMesh`, `createFurSystem` |
| 🔬 [Molecular](/core/molecular/) | Scientific visualization | `MoleculeRenderer` |

## Quick Import

```tsx
import {
  // Terrain
  Terrain,

  // Water
  Water,
  AdvancedWater,

  // Vegetation
  GrassInstances,
  TreeInstances,
  RockInstances,
  GPUInstancedMesh,

  // Sky
  ProceduralSky,
  createTimeOfDay,

  // Volumetrics
  VolumetricEffects,
  VolumetricFogMesh,
  UnderwaterOverlay,
  EnhancedFog,

  // Characters
  Character,
  createWalkCycle,

  // Ray Marching
  Raymarching,

  // Core Functions
  marchingCubes,
  noise3D,
  fbm,
  sdSphere,
  sdBox,
  opUnion,
  opSmoothUnion,

  // Materials
  createWaterMaterial,
  createSkyMaterial,
  createRaymarchingMaterial,
} from '@strata-game-library/core';
```

## Complete Scene Example

Here's how to combine all features into a complete scene:

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import {
  ProceduralSky,
  Water,
  GrassInstances,
  TreeInstances,
  RockInstances,
  VolumetricFogMesh
} from '@strata-game-library/core';

function CompleteScene() {
  return (
    <Canvas camera={{ position: [0, 30, 60], fov: 60 }} shadows>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Background Layer */}
      <ProceduralSky sunPosition={[100, 50, 100]} />

      {/* Midground Layer */}
      <Water size={300} depth={30} position={[0, -2, 0]} />

      {/* Foreground Layer */}
      <GrassInstances count={15000} spread={120} />
      <TreeInstances count={800} spread={180} minHeight={4} maxHeight={12} />
      <RockInstances count={300} spread={150} />

      {/* Atmosphere */}
      <VolumetricFogMesh density={0.01} color="#9ab" />

      {/* Controls */}
      <OrbitControls
        maxPolarAngle={Math.PI / 2.1}
        minDistance={15}
        maxDistance={300}
      />
    </Canvas>
  );
}
```

## Performance Guidelines

### Vegetation Counts

| Quality | Grass | Trees | Rocks | Target FPS |
|---------|-------|-------|-------|------------|
| Mobile | 5,000 | 200 | 100 | 30 |
| Desktop | 15,000 | 800 | 300 | 60 |
| High-end | 50,000 | 2,000 | 500 | 60+ |

### Water Quality

| Quality | Reflections | Caustics | Foam | Performance |
|---------|-------------|----------|------|-------------|
| Low | ❌ | ❌ | ❌ | Fastest |
| Medium | ✅ | ❌ | ✅ | Balanced |
| High | ✅ | ✅ | ✅ | Best visual |

### Volumetric Settings

| Quality | Density | Steps | Performance |
|---------|---------|-------|-------------|
| Low | 0.005 | 16 | Fastest |
| Medium | 0.015 | 32 | Balanced |
| High | 0.03 | 64 | Best visual |

## Core Algorithm APIs

Beyond components, Strata exposes core algorithms for advanced use cases:

### SDF Operations

```tsx
import { sdSphere, sdBox, opSmoothUnion } from '@strata-game-library/core';

function customTerrain(point: [number, number, number]): number {
  const sphere = sdSphere(point, [0, 0, 0], 10);
  const box = sdBox(point, [5, 5, 5], [3, 3, 3]);
  return opSmoothUnion(sphere, box, 0.5);
}
```

### Noise Generation

```tsx
import { noise3D, fbm } from '@strata-game-library/core';

function generateHeight(x: number, z: number): number {
  return fbm(x * 0.02, 0, z * 0.02, {
    octaves: 6,
    persistence: 0.5,
    lacunarity: 2.0
  }) * 50;
}
```

### Marching Cubes

```tsx
import { marchingCubes, createGeometryFromMarchingCubes } from '@strata-game-library/core';

const geometry = createGeometryFromMarchingCubes({
  bounds: { min: [-50, -50, -50], max: [50, 50, 50] },
  resolution: 64,
  sdf: customTerrain
});
```

## Next Steps

Dive deeper into each feature:

- [🏔️ Terrain](/core/terrain/) - Procedural terrain generation
- [🌊 Water](/core/water/) - Water rendering systems
- [🌿 Vegetation](/core/vegetation/) - GPU-instanced vegetation
- [☀️ Sky](/core/sky/) - Procedural sky and atmosphere
- [🌫️ Volumetrics](/core/volumetrics/) - Fog and atmospheric effects
- [🎮 Characters](/core/characters/) - Character animation system
