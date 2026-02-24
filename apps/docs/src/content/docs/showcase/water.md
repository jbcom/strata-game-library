---
title: Water Demo
description: Interactive water rendering demo with waves, reflections, and caustics
---

# 🌊 Water Demo

Realistic water rendering featuring Gerstner wave simulation, Fresnel-based reflections, procedural foam, and underwater caustics.

## Live Demo

<iframe
  src="https://jbcom/strata-game-library/examples/water-scene/"
  class="showcase-iframe"
  title="Water Demo"
  loading="lazy"
></iframe>

<div class="demo-controls">
  <a href="https://jbcom/strata-game-library/examples/water-scene/" target="_blank" class="demo-btn">
    Open Full Screen ↗
  </a>
  <a href="https://github.com/jbcom/strata-game-library/tree/main/water-scene" target="_blank" class="demo-btn">
    View Source ↗
  </a>
</div>

## Features Demonstrated

- **Gerstner Waves** - Realistic wave motion with circular particle paths
- **Fresnel Reflections** - Angle-dependent reflectivity
- **Screen-Space Reflections** - Real-time scene reflections
- **Underwater Caustics** - Light patterns on submerged surfaces
- **Procedural Foam** - Foam at wave peaks and shorelines
- **Depth-Based Coloring** - Darker color in deeper areas

## Code Example

```tsx
import { Canvas } from '@react-three/fiber';
import { AdvancedWater, ProceduralSky } from '@strata-game-library/core';
import { OrbitControls } from '@react-three/drei';

function WaterDemo() {
  return (
    <Canvas camera={{ position: [0, 20, 50], fov: 60 }}>
      <ProceduralSky sunPosition={[100, 50, 100]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1} />

      <AdvancedWater
        size={500}
        depth={30}
        waveHeight={2}
        reflections
        caustics
        foam
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
| UI Sliders | Adjust water parameters |

## Key Parameters

| Parameter | Effect |
|-----------|--------|
| `waveHeight` | Height of waves |
| `waveSpeed` | Speed of wave animation |
| `reflections` | Enable/disable reflections |
| `caustics` | Enable/disable caustic patterns |
| `foam` | Enable/disable wave foam |
| `foamThreshold` | Wave height for foam to appear |

## Performance Notes

- Reflections use a lower resolution render target
- Caustics are calculated efficiently in the shader
- Disable reflections on mobile for better performance
- The demo adapts quality based on device capability

## Related

- [Water System Documentation](/core/water/)
- [Water Shaders](/shaders/water/)
- [Water Presets](/presets/water/)
