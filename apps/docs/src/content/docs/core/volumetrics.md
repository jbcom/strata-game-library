---
title: Volumetric Effects
description: Fog, god rays, underwater effects, and atmospheric rendering
---

# 🌫️ Volumetric Effects

Strata provides volumetric rendering for fog, god rays, underwater effects, and atmospheric rendering to create immersive environments.

## Quick Start

```tsx
import { VolumetricFogMesh } from '@strata-game-library/core';

<VolumetricFogMesh density={0.02} color="#8899aa" />
```

## Components

### `<VolumetricFogMesh>`

Height-based volumetric fog:

```tsx
import { VolumetricFogMesh } from '@strata-game-library/core';

<VolumetricFogMesh
  // Fog parameters
  density={0.02}
  color="#8899aa"

  // Height falloff
  heightFalloff={0.1}
  baseHeight={0}
  maxHeight={50}

  // Animation
  animated
  animationSpeed={0.1}
  noiseScale={0.05}

  // Rendering
  steps={32}           // Ray march steps
  maxDistance={200}    // Max fog distance

  // Sun interaction
  sunPosition={[100, 50, 100]}
  sunScattering={0.3}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `density` | `number` | `0.02` | Fog density |
| `color` | `string` | `'#ffffff'` | Fog color |
| `heightFalloff` | `number` | `0.1` | Vertical falloff rate |
| `baseHeight` | `number` | `0` | Fog floor height |
| `maxHeight` | `number` | `100` | Fog ceiling height |
| `steps` | `number` | `32` | Ray march quality |

### `<EnhancedFog>`

Simple distance-based fog (post-processing):

```tsx
import { EnhancedFog } from '@strata-game-library/core';

<EnhancedFog
  color="#aabbcc"
  near={10}
  far={200}
  density={0.01}
/>
```

### `<UnderwaterOverlay>`

Complete underwater effect:

```tsx
import { UnderwaterOverlay } from '@strata-game-library/core';

<UnderwaterOverlay
  // Fog
  fogColor="#003366"
  fogDensity={0.03}

  // Caustics
  caustics
  causticsIntensity={0.4}
  causticsScale={0.5}
  causticsSpeed={0.3}

  // Color absorption
  depthColor="#001122"
  absorptionRate={0.1}

  // Particles
  particles
  particleCount={500}
  particleSize={0.05}
  particleSpeed={0.02}

  // Surface distortion
  surfaceDistortion
  distortionStrength={0.02}
/>
```

### `<GodRays>`

Volumetric light shafts:

```tsx
import { GodRays } from '@strata-game-library/core';

<GodRays
  // Light source
  lightPosition={[50, 80, 50]}
  lightColor="#ffffee"

  // Ray parameters
  intensity={0.5}
  decay={0.95}
  density={0.5}

  // Quality
  samples={60}
  maxLength={1}

  // Occlusion
  occlusionMesh={treesRef}
/>
```

### `<VolumetricEffects>`

All-in-one volumetric controller:

```tsx
import { VolumetricEffects } from '@strata-game-library/core';

<VolumetricEffects
  // Fog
  fog
  fogDensity={0.015}
  fogColor="#9ab"

  // God rays
  godRays
  godRayIntensity={0.4}
  sunPosition={[100, 80, 50]}

  // Height fog
  heightFog
  heightFogDensity={0.03}
  heightFogMax={30}
/>
```

## Fog Types

### Distance Fog

Traditional distance-based fog:

```tsx
<VolumetricFogMesh
  type="distance"
  density={0.01}
  near={10}
  far={300}
/>
```

### Height Fog

Fog that accumulates at lower elevations:

```tsx
<VolumetricFogMesh
  type="height"
  density={0.03}
  baseHeight={0}
  maxHeight={20}
  heightFalloff={0.15}
/>
```

### Volumetric Fog

True 3D fog with noise:

```tsx
<VolumetricFogMesh
  type="volumetric"
  density={0.02}
  noiseScale={0.03}
  noiseOctaves={4}
  animated
  animationSpeed={0.05}
/>
```

## God Rays

### Basic God Rays

```tsx
<GodRays
  lightPosition={[100, 100, 0]}
  intensity={0.5}
  samples={60}
/>
```

### Through Trees

God rays through occluding geometry:

```tsx
const treesRef = useRef();

<group ref={treesRef}>
  <TreeInstances count={100} spread={50} />
</group>

<GodRays
  lightPosition={[50, 80, 0]}
  intensity={0.6}
  occlusionMesh={treesRef}
  occlusionDensity={0.8}
/>
```

### Through Clouds

```tsx
<GodRays
  lightPosition={sunPosition}
  intensity={0.4}
  cloudOcclusion
  cloudTexture={cloudNoiseTexture}
/>
```

## Underwater Effects

### Basic Underwater

```tsx
import { useCamera } from '@react-three/fiber';

function UnderwaterScene() {
  const camera = useCamera();
  const isUnderwater = camera.position.y < waterLevel;

  return (
    <>
      <Water waterLevel={0} />

      {isUnderwater && (
        <UnderwaterOverlay
          fogColor="#002244"
          caustics
        />
      )}
    </>
  );
}
```

### Depth-Based Effects

```tsx
<UnderwaterOverlay
  // Deeper = darker blue
  shallowColor="#0066aa"
  deepColor="#001122"
  depthTransition={30}

  // Deeper = more fog
  fogDensity={0.02}
  fogDensityScale={1.5}  // Multiplier per 10 units depth
/>
```

### Caustics

Light patterns on underwater surfaces:

```tsx
<UnderwaterOverlay
  caustics
  causticsTexture={causticsMap}  // Optional texture
  causticsIntensity={0.5}
  causticsScale={0.3}
  causticsSpeed={0.4}

  // Apply to scene
  affectScene
/>
```

## Atmospheric Scattering

### Basic Atmosphere

```tsx
import { AtmosphericScattering } from '@strata-game-library/core';

<AtmosphericScattering
  sunPosition={[100, 50, 100]}
  rayleighCoefficient={0.0025}
  mieCoefficient={0.001}
  scatteringStrength={1}
/>
```

### Height-Based Density

```tsx
<AtmosphericScattering
  densityFalloff={0.0001}
  baseAltitude={0}
  atmosphereHeight={8000}
/>
```

## Weather Effects

### Rain Fog

```tsx
<VolumetricFogMesh
  density={0.04}
  color="#778899"
  animated
  animationSpeed={0.2}
  noiseScale={0.1}
/>
```

### Snow Visibility

```tsx
<VolumetricFogMesh
  density={0.06}
  color="#eeeeff"
  heightFog
  maxHeight={100}
/>
```

### Sandstorm

```tsx
<VolumetricFogMesh
  density={0.08}
  color="#c4a35a"
  animated
  animationSpeed={0.5}
  noiseScale={0.2}
  windDirection={[1, 0, 0.3]}
/>
```

## Shader Access

Use volumetric shaders directly:

```tsx
import {
  // Fog shader is exported as an object with vertex and fragment properties
  volumetricFogShader,
  // God rays shaders are exported separately
  godRaysVertexShader,
  godRaysFragmentShader,
  // Underwater shader is also an object
  underwaterShader
} from '@strata-game-library/shaders';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

function VolumetricFogCustom() {
  const { camera } = useThree();

  const fogMaterial = new THREE.ShaderMaterial({
    vertexShader: volumetricFogShader.vertex,
    fragmentShader: volumetricFogShader.fragment,
    uniforms: {
      uDensity: { value: 0.02 },
      uColor: { value: new THREE.Color('#8899aa') },
      uCameraPos: { value: camera.position },
      uTime: { value: 0 }
    },
    transparent: true,
    depthWrite: false
  });

  return <mesh material={fogMaterial}>{/* ... */}</mesh>;
}
```

## Performance

### Quality Settings

```tsx
// Mobile - 30 FPS
<VolumetricFogMesh
  steps={16}
  density={0.01}
  animated={false}
/>

// Desktop - 60 FPS
<VolumetricFogMesh
  steps={32}
  density={0.02}
  animated
/>

// High-end
<VolumetricFogMesh
  steps={64}
  density={0.03}
  animated
  noiseOctaves={4}
/>
```

### Optimization Tips

1. **Lower ray march steps** on mobile (16-24)
2. **Reduce density** for distant fog
3. **Disable animation** if not needed
4. **Use simpler fog types** (distance vs volumetric)
5. **Limit god ray samples** (30-60)

## Live Demo

See the [interactive sky & volumetrics demo](/showcase/sky/) running live in your browser.

[View Live Demo](/showcase/sky/) | [View Source](https://github.com/jbcom/strata-game-library/tree/main/examples/sky-volumetrics)

## Related

- [Volumetric Shaders](/shaders/volumetrics/) - Direct shader access
- [Sky](/core/sky/) - Atmospheric sky rendering
- [Water](/core/water/) - Underwater integration
