---
title: Sky & Volumetrics Demo
description: Interactive procedural sky, clouds, and atmospheric effects demo
---

# ☀️ Sky & Volumetrics Demo

Physically-based atmospheric scattering with dynamic day/night cycle, stars, volumetric clouds, and god rays.

## Live Demo

<iframe
  src="https://strata-game-library.github.io/examples/sky-volumetrics/"
  class="showcase-iframe"
  title="Sky & Volumetrics Demo"
  loading="lazy"
></iframe>

<div class="demo-controls">
  <a href="https://strata-game-library.github.io/examples/sky-volumetrics/" target="_blank" class="demo-btn">
    Open Full Screen ↗
  </a>
  <a href="https://github.com/strata-game-library/examples/tree/main/sky-volumetrics" target="_blank" class="demo-btn">
    View Source ↗
  </a>
</div>

## Features Demonstrated

- **Atmospheric Scattering** - Rayleigh and Mie scattering
- **Day/Night Cycle** - Sun position affects all lighting
- **Dynamic Stars** - Stars visible at night with twinkle
- **Moon Phases** - Accurate moon phase rendering
- **Volumetric Fog** - Height-based atmospheric fog
- **God Rays** - Volumetric light shafts

## Code Example

```tsx
import { Canvas } from '@react-three/fiber';
import { ProceduralSky, VolumetricFogMesh, createTimeOfDay } from '@strata-game-library/core';
import { OrbitControls } from '@react-three/drei';
import { useState, useEffect } from 'react';

function SkyDemo() {
  const [hour, setHour] = useState(14);

  // Animate time of day
  useEffect(() => {
    const interval = setInterval(() => {
      setHour(h => (h + 0.02) % 24);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <Canvas camera={{ position: [0, 10, 30], fov: 60 }}>
      <ProceduralSky
        timeOfDay={createTimeOfDay(hour, 0)}
        stars
        moon
        moonPhase={0.5}
      />

      <VolumetricFogMesh
        density={0.015}
        color="#8899aa"
      />

      <ambientLight intensity={0.2} />

      <OrbitControls />
    </Canvas>
  );
}
```

## Interactive Controls

| Control | Action |
|---------|--------|
| Left Click + Drag | Rotate camera |
| Time Slider | Change time of day |
| UI Controls | Adjust atmospheric parameters |

## Key Parameters

| Parameter | Effect |
|-----------|--------|
| `timeOfDay` | Sun/moon position |
| `turbidity` | Atmospheric haziness |
| `rayleigh` | Blue scattering intensity |
| `mieCoefficient` | Sun halo size |
| `stars` | Enable starfield |
| `moon` | Enable moon rendering |
| `moonPhase` | Current moon phase |

## Time of Day Presets

| Time | Hour | Visual |
|------|------|--------|
| Dawn | 6:00 | Pink/orange horizon |
| Morning | 9:00 | Clear blue sky |
| Noon | 12:00 | Bright, sun overhead |
| Afternoon | 15:00 | Warm golden light |
| Sunset | 18:00 | Orange/red sky |
| Dusk | 20:00 | Purple twilight |
| Night | 0:00 | Stars and moon |

## Performance Notes

- Sky shader is very efficient
- Stars can be disabled on mobile
- Volumetric fog uses ray marching (more expensive)
- God rays require additional render pass

## Related

- [Sky System Documentation](/core/sky/)
- [Sky Shaders](/shaders/sky/)
- [Volumetrics](/core/volumetrics/)
- [Cloud Shaders](/shaders/clouds/)
