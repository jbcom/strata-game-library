# Strata

**Procedural 3D graphics library for React Three Fiber**

Strata provides terrain generation, water simulation, vegetation instancing, sky rendering, and volumetric effects, all optimized for performance across web and mobile platforms.

---

## Quick Start

```bash
pnpm install @jbcom/strata @react-three/fiber @react-three/drei three
```

```tsx
import { Canvas } from '@react-three/fiber';
import { Water, ProceduralSky, GrassInstances } from '@jbcom/strata';

function Game() {
  return (
    <Canvas>
      <ProceduralSky />
      <Water size={100} />
      <GrassInstances count={10000} />
    </Canvas>
  );
}
```

---

## What's Included

### 🌊 Water Simulation
Realistic water rendering with reflections, refraction, and foam.

**Components:** `Water`, `AdvancedWater`

```tsx
<Water size={100} depth={20} />
<AdvancedWater size={200} waveHeight={2} />
```

### 🌿 Vegetation Instancing
GPU-instanced vegetation for rendering thousands of instances efficiently.

**Components:** `GrassInstances`, `TreeInstances`, `RockInstances`, `GPUInstancedMesh`

```tsx
<GrassInstances count={10000} spread={100} />
<TreeInstances count={500} spread={200} />
<RockInstances count={200} spread={150} />
```

### 🌅 Sky & Atmosphere
Procedural sky rendering with time-of-day support.

**Components:** `ProceduralSky`
**Functions:** `createTimeOfDay`

```tsx
<ProceduralSky sunPosition={[100, 50, 100]} />
```

### 🌫️ Volumetric Effects
Fog, underwater overlays, and atmospheric effects.

**Components:** `VolumetricEffects`, `VolumetricFogMesh`, `UnderwaterOverlay`, `EnhancedFog`

```tsx
<VolumetricFogMesh density={0.02} />
<UnderwaterOverlay depth={10} />
```

### 🎨 Ray Marching
Ray-marched rendering for procedural geometry and effects.

**Components:** `Raymarching`

```tsx
<Raymarching />
```

### 🔧 Core Algorithms
Pure TypeScript implementations for terrain generation, SDF operations, and marching cubes.

**Functions:**
- **SDF:** `sdSphere`, `sdBox`, `sdPlane`, `sdCapsule`, `sdTorus`, `sdCone`
- **SDF Operations:** `opUnion`, `opSubtraction`, `opIntersection`, `opSmoothUnion`, `opSmoothSubtraction`, `opSmoothIntersection`
- **Noise:** `noise3D`, `fbm`, `warpedFbm`
- **Terrain:** `getBiomeAt`, `getTerrainHeight`, `sdCaves`, `sdTerrain`, `sdRock`, `calcNormal`
- **Marching Cubes:** `marchingCubes`, `createGeometryFromMarchingCubes`, `generateTerrainChunk`
- **Materials:** `createWaterMaterial`, `createAdvancedWaterMaterial`, `createSkyMaterial`, `createRaymarchingMaterial`, `createVolumetricFogMeshMaterial`

---

## Architecture

Strata is organized into three main layers:

### Core Layer (`src/core/`)
Pure TypeScript algorithms with no React dependencies. Includes SDF operations, marching cubes, noise generation, and material creation functions.

### Component Layer (`src/components/`)
React Three Fiber components that wrap core algorithms into reusable UI elements.

### Presets Layer (`src/presets/`)
Pre-configured combinations of components for common use cases (background, midground, foreground layers).

### Example Usage

```tsx
import { Canvas } from '@react-three/fiber';
import {
  ProceduralSky,
  Water,
  GrassInstances,
  TreeInstances,
  VolumetricFogMesh
} from '@jbcom/strata';

function Scene() {
  return (
    <Canvas camera={{ position: [0, 10, 20] }}>
      {/* Sky */}
      <ProceduralSky sunPosition={[100, 50, 100]} />

      {/* Water */}
      <Water size={200} depth={20} />

      {/* Vegetation */}
      <GrassInstances count={10000} spread={100} />
      <TreeInstances count={500} spread={150} />

      {/* Atmosphere */}
      <VolumetricFogMesh density={0.02} />
    </Canvas>
  );
}
```

---

## Module Exports

Import from the main package or specific submodules:

```tsx
// Main package - all exports
import { Water, ProceduralSky } from '@jbcom/strata';

// Core algorithms only
import { marchingCubes, noise3D } from '@jbcom/strata/core';

// Components only
import { GrassInstances } from '@jbcom/strata/components';

// Shaders only
import * as shaders from '@jbcom/strata/shaders';

// Utils only
import * as utils from '@jbcom/strata/utils';

// Presets only
import * as presets from '@jbcom/strata/presets';
```

---

## Roadmap

Strata is under active development. Future additions include:

- **Character Controllers** - First-person and third-person camera controllers
- **Physics Integration** - Rapier physics wrappers for character controllers and ragdolls
- **Animation Systems** - IK chains, procedural animation, state machines
- **Game Systems** - State management with Zustand, save/load, checkpoints
- **Audio** - Spatial audio with Howler.js integration
- **Advanced Rendering** - Toon shaders, dissolve effects, hologram materials
- **Weather Effects** - Rain, snow, particle systems

---

## Performance Tips

1. **Use Instancing:** For vegetation, use `GrassInstances`, `TreeInstances`, and `RockInstances` instead of creating individual meshes.
2. **Level of Detail:** Adjust instance counts and spreads based on camera distance.
3. **Optimize Water:** Use `Water` for most cases; reserve `AdvancedWater` for hero scenes.
4. **Limit Volumetrics:** Volumetric fog can be expensive; adjust density and quality settings.
5. **Profile First:** Use React Three Fiber's built-in performance monitoring to identify bottlenecks.

---

## Contributing

See [STANDARDS.md](./STANDARDS.md) for development guidelines and code standards.
