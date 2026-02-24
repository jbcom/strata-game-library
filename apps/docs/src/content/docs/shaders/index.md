---
title: Shaders
description: Standalone GLSL shader collection for Three.js
---

# Shaders

The `@strata-game-library/shaders` package provides a standalone collection of production-ready GLSL shaders. Use them with any Three.js project — no React required.

## Installation

```bash
pnpm add @strata-game-library/shaders
```

## Available Shaders

### Terrain

Shaders for procedural terrain rendering with height-based texture blending and triplanar mapping.

- [Terrain Shaders](/shaders/terrain/) — Triplanar texturing, biome blending, erosion effects

### Water

Realistic water rendering with wave simulation and reflections.

- [Water Shaders](/shaders/water/) — Gerstner waves, Fresnel reflections, caustics

### Sky & Atmosphere

Physically-based atmospheric scattering for realistic skies.

- [Sky Shaders](/shaders/sky/) — Rayleigh/Mie scattering, day/night cycle

### Clouds

Volumetric cloud rendering.

- [Cloud Shaders](/shaders/clouds/) — Ray-marched clouds, weather systems

### Volumetric Effects

Fog, god rays, and underwater overlays.

- [Volumetric Shaders](/shaders/volumetrics/) — Distance fog, volumetric light, underwater

### Material Effects

Advanced material shaders for special effects.

- [Material Shaders](/shaders/materials/) — Fur, hologram, toon, scanline, glitch

### Vegetation

Wind animation for instanced vegetation.

- [Vegetation Shaders](/shaders/vegetation/) — Wind bending, sway, seasonal color

## Usage Without React

All shaders can be used directly with Three.js:

```ts
import { waterFragmentShader, waterVertexShader } from '@strata-game-library/shaders';

const material = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uWaveHeight: { value: 1.0 },
    uWaterColor: { value: new THREE.Color('#006994') },
  },
});
```

## Shader Chunks

Reusable GLSL snippets for building custom shaders:

```ts
import { ShaderChunks, noiseSnippet } from '@strata-game-library/shaders';

// Use noise functions in your own shaders
const customShader = `
  ${noiseSnippet}

  void main() {
    float n = fbm(vPosition.xz * 0.1);
    gl_FragColor = vec4(vec3(n), 1.0);
  }
`;
```

## Full API Reference

See the [detailed TypeDoc documentation](/packages/shaders/) for all exported shaders, uniforms, and types.
