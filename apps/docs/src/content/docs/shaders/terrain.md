---
title: Terrain Shaders
description: GLSL shaders for terrain rendering with triplanar mapping and biome blending
---

# Terrain Shaders

Shaders for procedural terrain rendering with height-based texture blending, triplanar mapping, and biome transitions.

## Available Shaders

```typescript
import {
  terrainVertexShader,
  terrainFragmentShader,
  triplanarVertexShader,
  triplanarFragmentShader,
} from '@strata-game-library/shaders';
```

## Basic Terrain Shader

### Vertex Shader

```glsl
// terrainVertexShader
uniform float uHeightScale;
uniform sampler2D uHeightMap;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  vUv = uv;

  // Sample height from heightmap
  float height = texture2D(uHeightMap, uv).r * uHeightScale;
  vec3 displaced = position + normal * height;

  vWorldPosition = (modelMatrix * vec4(displaced, 1.0)).xyz;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
```

### Fragment Shader

```glsl
// terrainFragmentShader
uniform sampler2D uGrassTexture;
uniform sampler2D uRockTexture;
uniform sampler2D uSandTexture;
uniform sampler2D uSnowTexture;

uniform float uGrassHeight;
uniform float uRockHeight;
uniform float uSnowHeight;
uniform float uBlendSharpness;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
  float height = vWorldPosition.y;
  float slope = 1.0 - dot(vNormal, vec3(0.0, 1.0, 0.0));

  // Height-based weights
  float sandWeight = smoothstep(uGrassHeight, 0.0, height);
  float grassWeight = smoothstep(0.0, uGrassHeight, height) * smoothstep(uRockHeight, uGrassHeight, height);
  float rockWeight = smoothstep(uGrassHeight, uRockHeight, height) * smoothstep(uSnowHeight, uRockHeight, height);
  float snowWeight = smoothstep(uRockHeight, uSnowHeight, height);

  // Slope-based rock blending
  rockWeight = mix(rockWeight, 1.0, smoothstep(0.3, 0.7, slope));

  // Sample textures
  vec4 sand = texture2D(uSandTexture, vUv * 10.0);
  vec4 grass = texture2D(uGrassTexture, vUv * 10.0);
  vec4 rock = texture2D(uRockTexture, vUv * 10.0);
  vec4 snow = texture2D(uSnowTexture, vUv * 10.0);

  // Blend
  vec4 color = sand * sandWeight + grass * grassWeight + rock * rockWeight + snow * snowWeight;

  gl_FragColor = color;
}
```

## Triplanar Mapping

Eliminates texture stretching on steep surfaces:

```glsl
// triplanarFragmentShader
uniform sampler2D uTexture;
uniform float uScale;
uniform float uSharpness;

varying vec3 vWorldPosition;
varying vec3 vNormal;

vec4 triplanarSample(sampler2D tex, vec3 pos, vec3 normal) {
  // Calculate blend weights
  vec3 blend = pow(abs(normal), vec3(uSharpness));
  blend /= dot(blend, vec3(1.0));

  // Sample from 3 projections
  vec4 xProjection = texture2D(tex, pos.yz * uScale);
  vec4 yProjection = texture2D(tex, pos.xz * uScale);
  vec4 zProjection = texture2D(tex, pos.xy * uScale);

  // Blend based on normal
  return xProjection * blend.x + yProjection * blend.y + zProjection * blend.z;
}

void main() {
  gl_FragColor = triplanarSample(uTexture, vWorldPosition, vNormal);
}
```

## Uniforms

### Terrain Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uHeightScale` | `float` | Maximum height displacement |
| `uHeightMap` | `sampler2D` | Heightmap texture |
| `uGrassTexture` | `sampler2D` | Grass/low altitude texture |
| `uRockTexture` | `sampler2D` | Rock/cliff texture |
| `uSandTexture` | `sampler2D` | Sand/beach texture |
| `uSnowTexture` | `sampler2D` | Snow/peak texture |
| `uGrassHeight` | `float` | Height where grass starts |
| `uRockHeight` | `float` | Height where rock starts |
| `uSnowHeight` | `float` | Height where snow starts |
| `uBlendSharpness` | `float` | Texture blend sharpness |

### Triplanar Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTexture` | `sampler2D` | Texture to project |
| `uScale` | `float` | Texture scale (world units) |
| `uSharpness` | `float` | Blend sharpness (higher = sharper) |

## Usage in Three.js

```typescript
import { terrainVertexShader, terrainFragmentShader } from '@strata-game-library/shaders';
import * as THREE from 'three';

const terrainMaterial = new THREE.ShaderMaterial({
  vertexShader: terrainVertexShader,
  fragmentShader: terrainFragmentShader,
  uniforms: {
    uHeightScale: { value: 50 },
    uHeightMap: { value: heightMapTexture },
    uGrassTexture: { value: grassTexture },
    uRockTexture: { value: rockTexture },
    uSandTexture: { value: sandTexture },
    uSnowTexture: { value: snowTexture },
    uGrassHeight: { value: 10 },
    uRockHeight: { value: 30 },
    uSnowHeight: { value: 50 },
    uBlendSharpness: { value: 4 },
  },
});

const terrain = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000, 256, 256),
  terrainMaterial
);
terrain.rotation.x = -Math.PI / 2;
```

## Related

- [Terrain System](/core/terrain/) - High-level terrain components
- [Vegetation Shaders](/shaders/vegetation/) - Wind animation for plants
