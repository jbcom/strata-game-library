---
title: Introduction to Strata
description: Learn what Strata is and how it can transform your 3D game development workflow
---

# Introduction to Strata

**Strata** is a comprehensive procedural 3D graphics library for React Three Fiber. It provides everything you need to build high-quality 3D games and experiences—from terrain generation to character animation—all optimized for performance across mobile, web, and desktop.

## What is Strata?

The name *Strata* comes from geology: layers of rock or soil with internally consistent characteristics that distinguish them from contiguous layers. This perfectly embodies our framework:

- **Geological Metaphor**: Building worlds layer by layer, from terrain foundations to atmospheric effects
- **Framework Architecture**: From core algorithms → React components → Game framework
- **Technical Precision**: Deliberate, structured, scientifically grounded

## Core Features

### 🏔️ Procedural Terrain

SDF-based terrain generation using marching cubes algorithm with triplanar texturing and multi-biome blending.

```tsx
import { Terrain } from '@strata-game-library/core';

<Terrain
  biomes={['grassland', 'mountain', 'desert']}
  resolution={128}
  size={1000}
/>
```

### 🌊 Advanced Water

Realistic water rendering with Gerstner wave simulation, Fresnel-based reflections, procedural foam, and underwater caustics.

```tsx
import { Water, AdvancedWater } from '@strata-game-library/core';

<Water size={200} depth={20} />
<AdvancedWater size={200} waveHeight={2} reflections caustics />
```

### 🌿 GPU Vegetation

GPU-accelerated instancing capable of rendering 10,000+ instances at 60fps with procedural wind animation.

```tsx
import { GrassInstances, TreeInstances, RockInstances } from '@strata-game-library/core';

<GrassInstances count={10000} spread={100} />
<TreeInstances count={500} spread={200} />
<RockInstances count={200} spread={150} />
```

### ☀️ Procedural Sky

Physically-based atmospheric scattering with dynamic day/night cycle, stars, and sun/moon positioning.

```tsx
import { ProceduralSky, createTimeOfDay } from '@strata-game-library/core';

<ProceduralSky timeOfDay={createTimeOfDay(14, 30)} />
```

### 🌫️ Volumetric Effects

God rays, volumetric fog, underwater overlays, and atmospheric effects.

```tsx
import { VolumetricFogMesh, UnderwaterOverlay, EnhancedFog } from '@strata-game-library/core';

<VolumetricFogMesh density={0.02} color="#8899aa" />
<UnderwaterOverlay depth={10} />
```

### 🎮 Character System

Articulated character system with IK chains, procedural walk cycles, and physics integration.

```tsx
import { Character, createWalkCycle } from '@strata-game-library/core';

<Character
  model={characterModel}
  animation={createWalkCycle({ speed: 1.5 })}
/>
```

## Package Ecosystem

Strata is organized into several focused packages:

| Package | Description | NPM |
|---------|-------------|-----|
| `@strata-game-library/core` | Core library with all features | [![npm](https://img.shields.io/npm/v/@strata-game-library/core.svg)](https://www.npmjs.com/package/@strata-game-library/core) |
| `@strata-game-library/shaders` | Standalone GLSL shader collection | [![npm](https://img.shields.io/npm/v/@strata-game-library/shaders.svg)](https://www.npmjs.com/package/@strata-game-library/shaders) |
| `@strata-game-library/presets` | Ready-to-use configurations | [![npm](https://img.shields.io/npm/v/@strata-game-library/presets.svg)](https://www.npmjs.com/package/@strata-game-library/presets) |
| `@strata-game-library/react-native-plugin` | React Native mobile plugin | [![npm](https://img.shields.io/npm/v/@strata-game-library/react-native-plugin.svg)](https://www.npmjs.com/package/@strata-game-library/react-native-plugin) |
| `@strata-game-library/capacitor-plugin` | Capacitor mobile plugin | [![npm](https://img.shields.io/npm/v/@strata-game-library/capacitor-plugin.svg)](https://www.npmjs.com/package/@strata-game-library/capacitor-plugin) |

## Why Strata?

### 10x Code Reduction

| Feature | Without Strata | With Strata |
|---------|----------------|-------------|
| Terrain System | 2000+ lines | ~50 lines |
| Water Rendering | 1500+ lines | ~20 lines |
| Vegetation | 1000+ lines | ~30 lines |
| Full Scene | 5000+ lines | ~200 lines |

### Performance Optimized

- GPU-accelerated instancing for vegetation
- Efficient shader implementations
- Level-of-detail (LOD) support
- Mobile-first performance tuning

### TypeScript First

- Full TypeScript definitions
- Type-safe props and configurations
- Excellent IDE support with autocomplete
- Comprehensive JSDoc annotations

### Battle-Tested

- Used in production games
- Comprehensive test suite
- Active maintenance and updates
- Growing community

## Next Steps

Ready to get started? Check out these guides:

- [Installation](/getting-started/installation/) - Set up Strata in your project
- [Quick Start](/getting-started/quick-start/) - Build your first scene in 5 minutes
- [Architecture](/getting-started/architecture/) - Understand how Strata is organized
- [Live Demos](/showcase/) - See Strata in action
