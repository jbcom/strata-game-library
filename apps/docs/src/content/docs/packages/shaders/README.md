---
title: "Shaders Overview"
---

# Shaders Package

`@strata-game-library/shaders` provides standalone GLSL shaders for Three.js applications.

## Shader Categories

| Category | Shaders |
|----------|---------|
| **Terrain** | Heightmap blending, triplanar mapping, erosion |
| **Water** | Gerstner waves, reflections, caustics, foam |
| **Sky** | Atmospheric scattering, day/night, stars |
| **Clouds** | Volumetric clouds, layered cloud planes |
| **Volumetrics** | Fog, god rays, underwater, dust particles |
| **Fur** | Shell-based fur rendering |
| **Raymarching** | SDF raymarching utilities |

## Usage

```tsx
import { waterVertexShader, waterFragmentShader } from '@strata-game-library/shaders';

const material = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color(0x0077be) },
  }
});
```

## Installation

```bash
pnpm add @strata-game-library/shaders
```

See the [full shader reference](/shaders/) for all available exports.
