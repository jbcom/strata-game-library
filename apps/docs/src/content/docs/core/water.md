---
title: Water System
description: Realistic water rendering with waves, reflections, caustics, and foam
---

# 🌊 Water System

Strata's water system provides realistic water rendering with Gerstner wave simulation, Fresnel-based reflections, refraction, underwater caustics, and procedural foam effects.

## Quick Start

```tsx
import { Water } from '@strata-game-library/core';

<Water size={200} depth={20} />
```

## Components

### `<Water>`

Standard water component with good performance:

```tsx
import { Water } from '@strata-game-library/core';

<Water
  // Size and position
  size={200}
  depth={20}
  position={[0, 0, 0]}

  // Appearance
  color="#0077be"
  opacity={0.8}

  // Waves
  waveSpeed={1}
  waveHeight={0.5}

  // Reflections
  reflectivity={0.5}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `100` | Water plane size |
| `depth` | `number` | `10` | Visual depth |
| `color` | `string` | `'#0077be'` | Water color |
| `opacity` | `number` | `0.8` | Transparency |
| `waveSpeed` | `number` | `1` | Wave animation speed |
| `waveHeight` | `number` | `0.5` | Wave amplitude |
| `reflectivity` | `number` | `0.5` | Reflection strength |
| `segments` | `number` | `128` | Mesh resolution |

### `<AdvancedWater>`

Full-featured water with all effects:

```tsx
import { AdvancedWater } from '@strata-game-library/core';

<AdvancedWater
  // Size
  size={300}
  depth={30}

  // Waves (Gerstner)
  waveHeight={2}
  waveLength={20}
  waveSpeed={1.5}
  waveDirections={[[1, 0], [0.7, 0.7], [0, 1]]}

  // Reflections
  reflections
  reflectionResolution={512}
  reflectionBlur={0.1}

  // Refraction
  refraction
  refractionStrength={0.05}

  // Caustics
  caustics
  causticsIntensity={0.3}
  causticsScale={0.5}

  // Foam
  foam
  foamColor="#ffffff"
  foamThreshold={0.7}

  // Underwater
  underwaterFog
  underwaterColor="#001a33"
/>
```

#### Advanced Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `waveDirections` | `[number, number][]` | Auto | Wave direction vectors |
| `reflections` | `boolean` | `false` | Enable reflections |
| `reflectionResolution` | `number` | `512` | Reflection texture size |
| `refraction` | `boolean` | `false` | Enable refraction |
| `caustics` | `boolean` | `false` | Enable caustic patterns |
| `causticsIntensity` | `number` | `0.3` | Caustics brightness |
| `foam` | `boolean` | `false` | Enable foam effects |
| `foamThreshold` | `number` | `0.7` | Wave height for foam |
| `underwaterFog` | `boolean` | `false` | Underwater fog effect |

## Wave Types

### Gerstner Waves

Realistic ocean waves that move in circular patterns:

```tsx
<AdvancedWater
  waveType="gerstner"
  gerstnerWaves={[
    { amplitude: 1.5, wavelength: 30, speed: 2, direction: [1, 0], steepness: 0.5 },
    { amplitude: 0.8, wavelength: 15, speed: 1.5, direction: [0.7, 0.7], steepness: 0.3 },
    { amplitude: 0.4, wavelength: 8, speed: 1, direction: [0, 1], steepness: 0.2 }
  ]}
/>
```

### Sine Waves

Simple sine-based waves for calmer water:

```tsx
<AdvancedWater
  waveType="sine"
  sineWaves={[
    { amplitude: 0.3, frequency: 0.5, speed: 1 },
    { amplitude: 0.15, frequency: 1, speed: 0.7 }
  ]}
/>
```

### FFT Ocean

GPU-computed ocean simulation (highest quality):

```tsx
<AdvancedWater
  waveType="fft"
  fftResolution={256}
  windSpeed={10}
  windDirection={[1, 0]}
  choppiness={1.5}
/>
```

## Effects

### Reflections

Screen-space reflections with blur:

```tsx
<AdvancedWater
  reflections
  reflectionResolution={1024}  // Higher = sharper
  reflectionBlur={0.05}        // Slight blur for realism
  reflectionDistortion={0.02}  // Distort with waves
/>
```

### Underwater Caustics

Light patterns on underwater surfaces:

```tsx
<AdvancedWater
  caustics
  causticsIntensity={0.4}
  causticsScale={0.3}
  causticsSpeed={0.5}
/>

{/* Apply caustics to underwater objects */}
<mesh position={[0, -5, 0]} receiveCaustics>
  <boxGeometry args={[10, 10, 10]} />
  <meshStandardMaterial />
</mesh>
```

### Foam

Wave foam with shore foam:

```tsx
<AdvancedWater
  foam
  foamColor="#ffffff"
  foamOpacity={0.8}
  foamThreshold={0.7}      // Wave height trigger
  shorefoam              // Foam at shorelines
  shorefoamWidth={5}
  shorefoamIntensity={0.5}
/>
```

### Underwater Overlay

Full underwater experience:

```tsx
import { UnderwaterOverlay } from '@strata-game-library/core';

function Scene() {
  const [isUnderwater, setIsUnderwater] = useState(false);

  return (
    <>
      <Water size={200} waterLevel={0} />

      {isUnderwater && (
        <UnderwaterOverlay
          depth={10}
          fogColor="#001a33"
          fogDensity={0.02}
          caustics
          particles
          particleCount={1000}
        />
      )}
    </>
  );
}
```

## Material Creation

Use water materials directly with Three.js:

```tsx
import { createWaterMaterial, createAdvancedWaterMaterial } from '@strata-game-library/core';
import * as THREE from 'three';

// Simple water material
const simpleMaterial = createWaterMaterial({
  color: new THREE.Color(0x0077be),
  opacity: 0.8,
  reflectivity: 0.5,
  waveHeight: 0.5,
  waveSpeed: 1
});

// Advanced water material
const advancedMaterial = createAdvancedWaterMaterial({
  color: new THREE.Color(0x0066aa),
  reflectionTexture: reflectionRT.texture,
  refractionTexture: refractionRT.texture,
  normalMap: waterNormalMap,
  causticsTexture: causticsTexture,
  foamTexture: foamTexture
});
```

## Shaders

Use water shaders directly:

```tsx
import {
  waterVertexShader,
  waterFragmentShader,
  advancedWaterVertexShader,
  advancedWaterFragmentShader
} from '@strata-game-library/shaders';

const material = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color(0x0077be) },
    uWaveHeight: { value: 0.5 },
    uWaveSpeed: { value: 1 },
    uOpacity: { value: 0.8 }
  },
  transparent: true
});
```

## Water Bodies

### Ocean

```tsx
import { createWaterPreset, WaterTypes } from '@strata-game-library/presets/water';

const ocean = createWaterPreset(WaterTypes.OCEAN);

<AdvancedWater {...ocean} />
```

### Lake

```tsx
const lake = createWaterPreset(WaterTypes.LAKE);

<Water {...lake} />  // Calmer waves
```

### River

Rivers can be created using the `Water` component with flow configuration:

```tsx
import { Water } from '@strata-game-library/core';
import { createWaterPreset, WaterTypes } from '@strata-game-library/presets/water';

// Get river preset with directional flow
const river = createWaterPreset(WaterTypes.RIVER);

<Water
  {...river}
  // Define river path as a spline
  path={[
    [0, 0, 0],
    [50, 0, 20],
    [100, 0, 10],
    [150, 0, 30]
  ]}
  width={10}
  flowSpeed={2}
  foam
/>
```

### Pool

```tsx
const pool = createWaterPreset(WaterTypes.POOL);

<Water {...pool} />  // Still water with clarity
```

## Performance

### Quality Levels

```tsx
// Mobile - 30 FPS target
<Water
  segments={64}
  reflections={false}
/>

// Desktop - 60 FPS target
<AdvancedWater
  segments={128}
  reflections
  reflectionResolution={512}
  caustics
/>

// High-end - Maximum quality
<AdvancedWater
  segments={256}
  reflections
  reflectionResolution={1024}
  caustics
  foam
  refraction
/>
```

### Optimization Tips

1. **Reduce segments** for distant water
2. **Lower reflection resolution** (256-512 is often sufficient)
3. **Disable caustics** on mobile
4. **Use simple Water** component when advanced features aren't needed

## Live Demo

<iframe
  src="https://jbcom/strata-game-library/examples/water-scene/"
  class="showcase-iframe"
  title="Water Demo"
></iframe>

[View Full Demo](https://jbcom/strata-game-library/examples/water-scene/) | [View Source](https://github.com/jbcom/strata-game-library/tree/main/water-scene)

## Related

- [Water Shaders](/shaders/water/) - Direct shader access
- [Water Presets](/presets/water/) - Ready-to-use configurations
- [Volumetrics](/core/volumetrics/) - Underwater effects
