---
title: Quick Start
description: Build your first Strata scene in 5 minutes
---

# Quick Start

Let's build a complete 3D scene with terrain, water, vegetation, and atmospheric effects in under 5 minutes.

## Step 1: Set Up Your Canvas

First, create a React Three Fiber canvas:

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 20, 40], fov: 60 }}>
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1} />
      </Canvas>
    </div>
  );
}
```

## Step 2: Add a Procedural Sky

Import and add the `ProceduralSky` component:

```tsx
import { ProceduralSky } from '@strata-game-library/core';

function Scene() {
  return (
    <>
      <ProceduralSky sunPosition={[100, 50, 100]} />
      {/* More components coming... */}
    </>
  );
}
```

The sky automatically includes:

- Physically-based atmospheric scattering
- Sun positioning based on coordinates
- Horizon fog blending

## Step 3: Add Water

Add a water plane with realistic rendering:

```tsx
import { Water } from '@strata-game-library/core';

function Scene() {
  return (
    <>
      <ProceduralSky sunPosition={[100, 50, 100]} />
      <Water
        size={200}
        depth={20}
        position={[0, 0, 0]}
      />
    </>
  );
}
```

The water includes:

- Animated wave simulation
- Fresnel-based reflections
- Depth-based coloring

## Step 4: Add Vegetation

Populate your scene with GPU-instanced vegetation:

```tsx
import { GrassInstances, TreeInstances, RockInstances } from '@strata-game-library/core';

function Scene() {
  return (
    <>
      <ProceduralSky sunPosition={[100, 50, 100]} />
      <Water size={200} depth={20} />

      {/* 10,000 grass blades */}
      <GrassInstances
        count={10000}
        spread={100}
        position={[0, 0.1, 0]}
      />

      {/* 500 trees */}
      <TreeInstances
        count={500}
        spread={150}
        minHeight={3}
        maxHeight={8}
      />

      {/* 200 rocks */}
      <RockInstances
        count={200}
        spread={120}
      />
    </>
  );
}
```

All vegetation includes:

- Wind animation
- Automatic LOD
- Biome-based distribution

## Step 5: Add Volumetric Effects

Enhance the atmosphere with fog and effects:

```tsx
import { VolumetricFogMesh, EnhancedFog } from '@strata-game-library/core';

function Scene() {
  return (
    <>
      <ProceduralSky sunPosition={[100, 50, 100]} />
      <Water size={200} depth={20} />
      <GrassInstances count={10000} spread={100} />
      <TreeInstances count={500} spread={150} />
      <RockInstances count={200} spread={120} />

      {/* Volumetric fog */}
      <VolumetricFogMesh
        density={0.015}
        color="#8899aa"
      />
    </>
  );
}
```

## Complete Example

Here's the full scene in one file:

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

function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1.2} castShadow />

      {/* Sky */}
      <ProceduralSky sunPosition={[100, 50, 100]} />

      {/* Water */}
      <Water size={200} depth={20} />

      {/* Vegetation */}
      <GrassInstances count={10000} spread={100} />
      <TreeInstances count={500} spread={150} minHeight={3} maxHeight={8} />
      <RockInstances count={200} spread={120} />

      {/* Atmosphere */}
      <VolumetricFogMesh density={0.015} color="#8899aa" />

      {/* Controls */}
      <OrbitControls
        maxPolarAngle={Math.PI / 2.1}
        minDistance={10}
        maxDistance={200}
      />
    </>
  );
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 20, 40], fov: 60 }}
        shadows
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
```

## What You Built

In under 50 lines of code, you created:

- ✅ Procedural sky with atmospheric scattering
- ✅ Animated water with reflections
- ✅ 10,000+ grass instances with wind
- ✅ 500 trees with variety
- ✅ 200 rocks for terrain detail
- ✅ Volumetric fog atmosphere

**That's a 10x code reduction** compared to implementing these features from scratch!

## Adding Interactivity

### Day/Night Cycle

```tsx
import { useState, useEffect } from 'react';
import { createTimeOfDay } from '@strata-game-library/core';

function DynamicSky() {
  const [hour, setHour] = useState(14);

  useEffect(() => {
    const interval = setInterval(() => {
      setHour(h => (h + 0.1) % 24);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return <ProceduralSky timeOfDay={createTimeOfDay(hour, 0)} />;
}
```

### Weather Effects

```tsx
import { createWeatherPreset, WeatherPresets } from '@strata-game-library/presets/weather';

const weather = createWeatherPreset(WeatherPresets.RAIN);
```

## Next Steps

- [Architecture](/getting-started/architecture/) - Understand how Strata works
- [Terrain](/core/terrain/) - Add procedural terrain
- [Characters](/core/characters/) - Add animated characters
- [Live Demos](/showcase/) - See more examples
