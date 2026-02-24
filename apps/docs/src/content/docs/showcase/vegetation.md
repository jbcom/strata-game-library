---
title: Vegetation Demo
description: Interactive GPU-instanced vegetation demo with wind animation
---

# 🌿 Vegetation Demo

GPU-accelerated instancing capable of rendering 10,000+ instances of grass, trees, and rocks at 60fps with procedural wind animation.

## Live Demo

<iframe
  src="https://strata-game-library.github.io/examples/vegetation-showcase/"
  class="showcase-iframe"
  title="Vegetation Demo"
  loading="lazy"
></iframe>

<div class="demo-controls">
  <a href="https://strata-game-library.github.io/examples/vegetation-showcase/" target="_blank" class="demo-btn">
    Open Full Screen ↗
  </a>
  <a href="https://github.com/strata-game-library/examples/tree/main/vegetation-showcase" target="_blank" class="demo-btn">
    View Source ↗
  </a>
</div>

## Features Demonstrated

- **GPU Instancing** - Render thousands of instances efficiently
- **Wind Animation** - Procedural wind affecting all vegetation
- **Height Variation** - Natural size variation
- **Color Variation** - Subtle color differences
- **Terrain Following** - Vegetation placed on terrain surface
- **Level of Detail** - Reduced complexity at distance

## Code Example

```tsx
import { Canvas } from '@react-three/fiber';
import { GrassInstances, TreeInstances, RockInstances, ProceduralSky } from '@strata-game-library/core';
import { OrbitControls } from '@react-three/drei';

function VegetationDemo() {
  return (
    <Canvas camera={{ position: [0, 30, 50], fov: 60 }}>
      <ProceduralSky sunPosition={[100, 50, 100]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1} castShadow />

      <GrassInstances
        count={15000}
        spread={100}
        windSpeed={1.5}
        windStrength={0.3}
      />

      <TreeInstances
        count={500}
        spread={150}
        minHeight={4}
        maxHeight={12}
      />

      <RockInstances
        count={200}
        spread={120}
        moss
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
| Scroll | Zoom in/out |
| UI Sliders | Adjust vegetation parameters |

## Key Parameters

| Parameter | Effect |
|-----------|--------|
| `count` | Number of instances |
| `spread` | Distribution radius |
| `windSpeed` | Wind animation speed |
| `windStrength` | Amount of wind bending |
| `heightVariation` | Range of height differences |
| `colorVariation` | Range of color differences |

## Performance Notes

- Uses InstancedMesh for efficient rendering
- All animation calculated in vertex shader
- No CPU overhead per instance
- Demo maintains 60fps with 15,000+ instances

## Instance Counts by Platform

| Platform | Grass | Trees | Rocks |
|----------|-------|-------|-------|
| Mobile | 5,000 | 200 | 100 |
| Desktop | 15,000 | 500 | 200 |
| High-end | 50,000 | 2,000 | 500 |

## Related

- [Vegetation System Documentation](/core/vegetation/)
- [Vegetation Shaders](/shaders/vegetation/)
- [Vegetation Presets](/presets/vegetation/)
