# @strata-game-library/shaders

[![npm version](https://img.shields.io/npm/v/@strata-game-library/shaders)](https://www.npmjs.com/package/@strata-game-library/shaders)
[![license](https://img.shields.io/npm/l/@strata-game-library/shaders)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

GLSL shader collection for Strata 3D -- terrain, water, clouds, and volumetric effects.

## Installation

```bash
pnpm add @strata-game-library/shaders
```

Peer dependency:

```bash
pnpm add three
```

## Quick Start

```ts
import * as THREE from 'three';
import { waterVertexShader, waterFragmentShader } from '@strata-game-library/shaders/water';

const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color('#006994') },
  },
});
```

## Features

- **Terrain shaders** -- Height-based blending, triplanar mapping, erosion effects
- **Water shaders** -- Reflections, refractions, caustics, foam, and wave simulation
- **Sky shaders** -- Physically-based atmospheric scattering
- **Cloud shaders** -- Volumetric cloud rendering with raymarching
- **Volumetric effects** -- Fog, god rays, and light scattering
- **Material effects** -- Fur, shell texturing, and PBR extensions
- **Vegetation wind** -- GPU-driven instanced wind animation
- **Raymarching** -- SDF rendering utilities and distance functions
- **Reusable chunks** -- Shared GLSL code for noise, lighting, and math

## Exports

| Path | Contents |
|------|----------|
| `@strata-game-library/shaders` | All shaders |
| `@strata-game-library/shaders/terrain` | Terrain shaders |
| `@strata-game-library/shaders/water` | Water shaders |
| `@strata-game-library/shaders/sky` | Sky and atmosphere shaders |
| `@strata-game-library/shaders/clouds` | Cloud shaders |
| `@strata-game-library/shaders/volumetrics` | Volumetric effect shaders |
| `@strata-game-library/shaders/materials` | Material shaders |
| `@strata-game-library/shaders/fur` | Fur and shell shaders |
| `@strata-game-library/shaders/raymarching` | SDF and raymarching utilities |
| `@strata-game-library/shaders/godRays` | God ray shaders |
| `@strata-game-library/shaders/chunks` | Shared GLSL chunks |

## Documentation

Full documentation and shader reference: [https://strata.game/shaders/](https://strata.game/shaders/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
