---
title: Terrain Demo
description: Interactive procedural terrain generation demo
---

# 🏔️ Terrain Demo

Procedural terrain generation using Signed Distance Functions (SDFs) and the Marching Cubes algorithm with triplanar texturing and multi-biome blending.

## Live Demo

<iframe
  src="https://jbcom/strata-game-library/examples/basic-terrain/"
  class="showcase-iframe"
  title="Terrain Demo"
  loading="lazy"
></iframe>

<div class="demo-controls">
  <a href="https://jbcom/strata-game-library/examples/basic-terrain/" target="_blank" class="demo-btn">
    Open Full Screen ↗
  </a>
  <a href="https://github.com/jbcom/strata-game-library/tree/main/basic-terrain" target="_blank" class="demo-btn">
    View Source ↗
  </a>
</div>

## Features Demonstrated

- **SDF-Based Terrain** - Mathematically defined terrain allowing caves and overhangs
- **Marching Cubes** - Efficient mesh generation from SDF
- **Biome Blending** - Smooth transitions between terrain types
- **Triplanar Texturing** - No texture stretching on steep surfaces
- **Height-Based Materials** - Different textures at different elevations
- **Dynamic LOD** - Level of detail based on camera distance

## Code Example

```tsx
import { Canvas } from '@react-three/fiber';
import { Terrain } from '@strata-game-library/core';
import { OrbitControls } from '@react-three/drei';

function TerrainDemo() {
  return (
    <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1} castShadow />

      <Terrain
        biomes={['grassland', 'mountain', 'snow']}
        amplitude={80}
        frequency={0.01}
        resolution={64}
        size={500}
      />

      <OrbitControls />
    </Canvas>
  );
}
```

## Interactive Controls

| Control | Action |
|---------|--------|
| Left Click + Drag | Rotate camera |
| Right Click + Drag | Pan camera |
| Scroll | Zoom in/out |
| UI Controls | Adjust terrain parameters |

## Key Parameters

| Parameter | Effect |
|-----------|--------|
| `amplitude` | Height of terrain features |
| `frequency` | Scale of terrain features |
| `octaves` | Level of detail in noise |
| `biomes` | Types of terrain to generate |
| `resolution` | Mesh quality |

## Performance Notes

- The demo uses dynamic LOD to maintain 60fps
- Distant terrain uses lower resolution meshes
- Nearby terrain has full detail
- GPU tessellation is used where available

## Related

- [Terrain System Documentation](/core/terrain/)
- [Terrain Shaders](/shaders/terrain/)
- [Terrain Presets](/presets/terrain/)
