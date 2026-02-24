---
title: Full Scene Demo
description: Complete integration of all Strata features in an explorable environment
---

# 🎬 Full Scene Demo

Complete integration of all Strata features—terrain, water, vegetation, sky, and volumetrics—into a cohesive, explorable 3D environment.

## Live Demo

<iframe
  src="https://jbcom/strata-game-library/examples/api-showcase/"
  class="showcase-iframe"
  title="Full Scene Demo"
  loading="lazy"
></iframe>

<div class="demo-controls">
  <a href="https://jbcom/strata-game-library/examples/api-showcase/" target="_blank" class="demo-btn">
    Open Full Screen ↗
  </a>
  <a href="https://github.com/jbcom/strata-game-library/tree/main/api-showcase" target="_blank" class="demo-btn">
    View Source ↗
  </a>
</div>

## Features Integrated

This demo combines all Strata features:

- 🏔️ **Procedural Terrain** with multiple biomes
- 🌊 **Advanced Water** with reflections and caustics
- 🌿 **GPU Vegetation** covering the terrain
- ☀️ **Procedural Sky** with day/night cycle
- 🌫️ **Volumetric Fog** for atmosphere
- 🎮 **Interactive Controls** for exploration

## Complete Code Example

```tsx
import { Canvas } from '@react-three/fiber';
import {
  Terrain,
  AdvancedWater,
  GrassInstances,
  TreeInstances,
  RockInstances,
  ProceduralSky,
  VolumetricFogMesh,
  createTimeOfDay,
} from '@strata-game-library/core';
import { OrbitControls } from '@react-three/drei';

function FullScene() {
  return (
    <Canvas camera={{ position: [0, 50, 100], fov: 60 }} shadows>
      {/* Sky & Atmosphere */}
      <ProceduralSky
        timeOfDay={createTimeOfDay(14, 30)}
        stars
      />
      <VolumetricFogMesh density={0.01} color="#9ab" />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[100, 100, 50]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Terrain */}
      <Terrain
        biomes={['grassland', 'mountain', 'snow']}
        amplitude={100}
        size={500}
        resolution={64}
      />

      {/* Water */}
      <AdvancedWater
        size={500}
        depth={30}
        position={[0, 10, 0]}
        reflections
        caustics
        foam
      />

      {/* Vegetation */}
      <GrassInstances count={15000} spread={200} />
      <TreeInstances count={800} spread={250} />
      <RockInstances count={300} spread={200} moss />

      {/* Controls */}
      <OrbitControls
        maxPolarAngle={Math.PI / 2.1}
        minDistance={20}
        maxDistance={300}
      />
    </Canvas>
  );
}
```

## Scene Architecture

```
Full Scene
├── Background Layer
│   ├── ProceduralSky (day/night cycle)
│   └── VolumetricFogMesh (atmosphere)
├── Midground Layer
│   ├── Terrain (procedural landmass)
│   └── AdvancedWater (ocean/lake)
├── Foreground Layer
│   ├── GrassInstances (ground cover)
│   ├── TreeInstances (forests)
│   └── RockInstances (terrain details)
└── Controls
    └── OrbitControls (camera movement)
```

## Performance Budget

| Feature | Draw Calls | GPU Time |
|---------|------------|----------|
| Sky | 1 | ~0.5ms |
| Terrain | 1-4 | ~2ms |
| Water | 2-3 | ~3ms |
| Vegetation | 3 | ~4ms |
| Fog | 1 | ~1ms |
| **Total** | **~10** | **~10ms** |

## Controls

| Input | Action |
|-------|--------|
| Left Click + Drag | Orbit camera |
| Right Click + Drag | Pan camera |
| Scroll Wheel | Zoom in/out |
| Time Slider | Change time of day |

## Customization

The demo includes UI controls to adjust:

- Time of day
- Weather conditions
- Water parameters
- Vegetation density
- Fog intensity
- Camera settings

## Related

- [Getting Started](/getting-started/quick-start/)
- [Architecture](/getting-started/architecture/)
- [All Core Features](/core/)
