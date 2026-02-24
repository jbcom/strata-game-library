---
title: API Reference
description: Complete API documentation for Strata packages
---

# API Reference

This section provides complete API documentation for all Strata packages.

## Package Overview

| Package | Description | Docs |
|---------|-------------|------|
| `@strata-game-library/core` | Core library with components and algorithms | This page |
| `@strata-game-library/shaders` | Standalone GLSL shader collection | [Shaders](/shaders/) |
| `@strata-game-library/presets` | Pre-configured settings | [Presets](/presets/) |
| `@strata-game-library/react-native-plugin` | React Native mobile plugin | [React Native](/mobile/react-native/) |
| `@strata-game-library/capacitor-plugin` | Capacitor mobile plugin | [Capacitor](/mobile/capacitor/) |

## Core Package Exports

### Components

```typescript
import {
  // Terrain
  Terrain,
  TerrainChunk,

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

  // Volumetrics
  VolumetricEffects,
  VolumetricFogMesh,
  UnderwaterOverlay,
  EnhancedFog,
  GodRays,

  // Characters
  Character,
  IKChain,
  Ragdoll,
  CharacterController,

  // Ray Marching
  Raymarching,

  // Fur
  FurMesh,

  // Molecular
  MoleculeRenderer,
  AtomicParticles,
} from '@strata-game-library/core';
```

### Hooks

```typescript
import {
  useAnimationBlend,
  useFurInteraction,
} from '@strata-game-library/core';
```

### Core Functions

```typescript
import {
  // SDF Primitives
  sdSphere,
  sdBox,
  sdPlane,
  sdCapsule,
  sdTorus,
  sdCone,
  sdCylinder,

  // SDF Operations
  opUnion,
  opSubtraction,
  opIntersection,
  opSmoothUnion,
  opSmoothSubtraction,
  opSmoothIntersection,
  opRepeat,
  opTwist,
  opBend,

  // Noise
  noise3D,
  fbm,
  warpedFbm,

  // Terrain
  getBiomeAt,
  getTerrainHeight,
  sdTerrain,
  sdCaves,
  sdRock,
  calcNormal,

  // Marching Cubes
  marchingCubes,
  createGeometryFromMarchingCubes,
  generateTerrainChunk,

  // Materials
  createWaterMaterial,
  createAdvancedWaterMaterial,
  createSkyMaterial,
  createRaymarchingMaterial,
  createTriplanarMaterial,
  createHeightBlendMaterial,

  // Animation
  createWalkCycle,
  createRunCycle,
  createAnimationStateMachine,

  // Time
  createTimeOfDay,
  calculateSunPosition,

  // Fur
  createFurSystem,
  createGrassGeometry,
} from '@strata-game-library/core';
```

### Types

```typescript
import type {
  // Terrain
  BiomeConfig,
  TerrainChunk,
  TerrainConfig,

  // Water
  WaterConfig,
  WaveConfig,
  GerstnerWave,

  // Sky
  SkyConfig,
  TimeOfDay,

  // Vegetation
  VegetationConfig,
  WindConfig,

  // Animation
  AnimationConfig,
  IKConfig,
  GaitConfig,

  // General
  Vector3,
  Color,
} from '@strata-game-library/core/types';
```

## API Sections

- [Components](/api/components/) - React Three Fiber components
- [Hooks](/api/hooks/) - React hooks
- [Core Functions](/api/functions/) - Pure TypeScript utilities
- [Types](/api/types/) - TypeScript type definitions

## TypeDoc

For auto-generated API documentation with full type information, see the [TypeDoc output](https://strata.game/typedoc/).

## Related

- [Getting Started](/getting-started/) - Quick start guide
- [Architecture](/getting-started/architecture/) - Library structure
- [Examples](/showcase/) - Live demos
