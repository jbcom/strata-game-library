---
title: Ray Marching
description: GPU-accelerated SDF ray marching for procedural geometry and effects
---

# 🎨 Ray Marching

Strata provides GPU-accelerated ray marching for rendering complex procedural geometry defined by Signed Distance Functions (SDFs).

## Quick Start

```tsx
import { Raymarching } from '@strata-game-library/core';

<Raymarching />
```

## Component

### `<Raymarching>`

Full-screen ray marching renderer:

```tsx
import { Raymarching } from '@strata-game-library/core';

<Raymarching
  // SDF scene
  sdf={customSDF}

  // Quality
  maxSteps={100}
  maxDistance={100}
  surfaceDistance={0.001}

  // Lighting
  lightPosition={[10, 20, 10]}
  ambientLight={0.1}

  // Materials
  materialFunction={customMaterial}

  // Effects
  shadows
  softShadows
  ambientOcclusion

  // Post-processing
  fog
  fogColor="#000000"
  fogDensity={0.02}
/>
```

## SDF Primitives

### Basic Shapes

```tsx
import {
  sdSphere,
  sdBox,
  sdPlane,
  sdCapsule,
  sdTorus,
  sdCone,
  sdCylinder
} from '@strata-game-library/core';

// Sphere
const sphere = sdSphere(point, center, radius);

// Box
const box = sdBox(point, center, size);

// Plane
const plane = sdPlane(point, normal, distance);

// Capsule
const capsule = sdCapsule(point, start, end, radius);

// Torus
const torus = sdTorus(point, center, majorRadius, minorRadius);

// Cone
const cone = sdCone(point, tip, height, angle);

// Cylinder
const cylinder = sdCylinder(point, start, end, radius);
```

### SDF Operations

```tsx
import {
  opUnion,
  opSubtraction,
  opIntersection,
  opSmoothUnion,
  opSmoothSubtraction,
  opSmoothIntersection
} from '@strata-game-library/core';

// Boolean operations
const union = opUnion(d1, d2);
const subtraction = opSubtraction(d1, d2);
const intersection = opIntersection(d1, d2);

// Smooth blending
const smoothUnion = opSmoothUnion(d1, d2, smoothness);
const smoothSubtraction = opSmoothSubtraction(d1, d2, smoothness);
const smoothIntersection = opSmoothIntersection(d1, d2, smoothness);
```

### Domain Operations

```tsx
import {
  opRepeat,
  opRepeatLimited,
  opTwist,
  opBend,
  opDisplace
} from '@strata-game-library/core';

// Infinite repetition
const repeated = opRepeat(point, spacing);

// Limited repetition
const limited = opRepeatLimited(point, spacing, count);

// Twist
const twisted = opTwist(point, amount);

// Bend
const bent = opBend(point, amount);

// Displacement
const displaced = opDisplace(point, noiseFunction);
```

## Custom SDF Scenes

### Simple Scene

```tsx
function myScene(point: [number, number, number]): number {
  // Ground plane
  const ground = sdPlane(point, [0, 1, 0], 0);

  // Sphere above ground
  const sphere = sdSphere(point, [0, 1, 0], 1);

  // Combine
  return opUnion(ground, sphere);
}

<Raymarching sdf={myScene} />
```

### Complex Scene with Materials

```tsx
interface SDFResult {
  distance: number;
  materialId: number;
}

function complexScene(point: [number, number, number]): SDFResult {
  // Ground (material 0)
  const ground = { distance: sdPlane(point, [0, 1, 0], 0), materialId: 0 };

  // Metal sphere (material 1)
  const sphere = { distance: sdSphere(point, [0, 1, 0], 1), materialId: 1 };

  // Glass cube (material 2)
  const cube = { distance: sdBox(point, [2, 0.5, 0], [0.5, 0.5, 0.5]), materialId: 2 };

  // Combine with material tracking
  let result = ground;
  if (sphere.distance < result.distance) result = sphere;
  if (cube.distance < result.distance) result = cube;

  return result;
}

function materialFunction(materialId: number, point: [number, number, number], normal: [number, number, number]) {
  switch (materialId) {
    case 0: return { color: [0.2, 0.3, 0.1], roughness: 1 };     // Ground
    case 1: return { color: [0.8, 0.8, 0.9], roughness: 0.1 };   // Metal
    case 2: return { color: [0.9, 0.9, 1.0], roughness: 0, transmission: 0.9 }; // Glass
    default: return { color: [1, 0, 1], roughness: 0.5 };
  }
}

<Raymarching
  sdf={complexScene}
  materialFunction={materialFunction}
/>
```

### Animated Scene

```tsx
import { useFrame } from '@react-three/fiber';

function AnimatedRaymarching() {
  const [time, setTime] = useState(0);

  useFrame((_, delta) => {
    setTime(t => t + delta);
  });

  const animatedScene = useCallback((point: [number, number, number]) => {
    // Animated sphere position
    const spherePos: [number, number, number] = [
      Math.sin(time) * 2,
      1 + Math.sin(time * 2) * 0.5,
      Math.cos(time) * 2
    ];

    const ground = sdPlane(point, [0, 1, 0], 0);
    const sphere = sdSphere(point, spherePos, 0.5);

    return opUnion(ground, sphere);
  }, [time]);

  return <Raymarching sdf={animatedScene} />;
}
```

## Lighting & Shadows

### Basic Lighting

```tsx
<Raymarching
  lightPosition={[10, 20, 10]}
  lightColor="#ffffff"
  lightIntensity={1}
  ambientLight={0.1}
  ambientColor="#334455"
/>
```

### Soft Shadows

```tsx
<Raymarching
  shadows
  softShadows
  shadowSoftness={32}
  shadowBias={0.01}
/>
```

### Ambient Occlusion

```tsx
<Raymarching
  ambientOcclusion
  aoSteps={5}
  aoIntensity={0.5}
  aoRadius={0.5}
/>
```

### Global Illumination (Approximate)

```tsx
<Raymarching
  globalIllumination
  giSamples={4}
  giIntensity={0.3}
/>
```

## Effects

### Fog

```tsx
<Raymarching
  fog
  fogColor="#112233"
  fogDensity={0.02}
  fogType="exponential"  // or "linear"
/>
```

### Glow

```tsx
<Raymarching
  glow
  glowColor="#00ffff"
  glowIntensity={0.5}
  glowRadius={0.1}
/>
```

### Reflections

```tsx
<Raymarching
  reflections
  reflectionBounces={3}
  reflectionFalloff={0.5}
/>
```

## Shader Access

Use ray marching shaders directly:

```tsx
import { createRaymarchingMaterial } from '@strata-game-library/core';

const material = createRaymarchingMaterial({
  sdfFunction: `
    float map(vec3 p) {
      float ground = p.y;
      float sphere = length(p - vec3(0, 1, 0)) - 1.0;
      return min(ground, sphere);
    }
  `,
  maxSteps: 100,
  maxDistance: 100
});
```

## Performance

### Quality Settings

```tsx
// Mobile
<Raymarching
  maxSteps={50}
  surfaceDistance={0.01}
  shadows={false}
  ambientOcclusion={false}
/>

// Desktop
<Raymarching
  maxSteps={100}
  surfaceDistance={0.001}
  shadows
  softShadows
  ambientOcclusion
/>

// High-end
<Raymarching
  maxSteps={200}
  surfaceDistance={0.0001}
  shadows
  softShadows
  ambientOcclusion
  reflections
  reflectionBounces={4}
/>
```

### Optimization Tips

1. **Reduce maxSteps** for complex scenes
2. **Increase surfaceDistance** for faster convergence
3. **Use bounding volumes** to skip empty space
4. **Limit shadow/AO steps** on mobile

## Related

- [Terrain](/core/terrain/) - SDF-based terrain
- [Volumetrics](/core/volumetrics/) - Volumetric effects
- [Shaders](/shaders/) - Custom shader access
