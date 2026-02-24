---
title: Volumetric Effect Shaders
description: GLSL shaders for fog, god rays, and underwater effects
---

# Volumetric Effect Shaders

Shaders for atmospheric and volumetric effects including fog, god rays, and underwater rendering.

## Available Shaders

```typescript
import {
  volumetricFogShader,
  godRaysVertexShader,
  godRaysFragmentShader,
  underwaterShader,
} from '@strata-game-library/shaders';
```

## Volumetric Fog

Height and distance-based fog with optional animation:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uCameraPos` | `vec3` | Camera world position |
| `uFogColor` | `vec3` | Fog color |
| `uDensity` | `float` | Overall fog density |
| `uHeightFalloff` | `float` | Vertical density falloff |
| `uBaseHeight` | `float` | Fog floor height |
| `uMaxHeight` | `float` | Fog ceiling height |
| `uNoiseScale` | `float` | Noise pattern scale |
| `uWindDirection` | `vec3` | Fog movement direction |

### Usage

```typescript
import { volumetricFogShader } from '@strata-game-library/shaders';

const fogMaterial = new THREE.ShaderMaterial({
  vertexShader: volumetricFogShader.vertex,
  fragmentShader: volumetricFogShader.fragment,
  uniforms: {
    uTime: { value: 0 },
    uCameraPos: { value: camera.position },
    uFogColor: { value: new THREE.Color(0x8899aa) },
    uDensity: { value: 0.02 },
    uHeightFalloff: { value: 0.1 },
    uBaseHeight: { value: 0 },
    uMaxHeight: { value: 50 },
    uNoiseScale: { value: 0.05 },
    uWindDirection: { value: new THREE.Vector3(1, 0, 0.5) },
  },
  transparent: true,
  depthWrite: false,
});
```

## God Rays

Volumetric light shafts from sun or other light sources:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uLightPosition` | `vec3` | Light source position |
| `uLightColor` | `vec3` | Light color |
| `uIntensity` | `float` | Ray intensity |
| `uDecay` | `float` | Distance falloff |
| `uDensity` | `float` | Ray density |
| `uWeight` | `float` | Sample weight |
| `uSamples` | `int` | Number of samples |
| `uSceneTexture` | `sampler2D` | Scene render |
| `uOcclusionTexture` | `sampler2D` | Occlusion mask |

### Usage

```typescript
import { godRaysVertexShader, godRaysFragmentShader } from '@strata-game-library/shaders';

const godRaysMaterial = new THREE.ShaderMaterial({
  vertexShader: godRaysVertexShader,
  fragmentShader: godRaysFragmentShader,
  uniforms: {
    uLightPosition: { value: new THREE.Vector3(100, 100, 0) },
    uLightColor: { value: new THREE.Color(1, 0.95, 0.8) },
    uIntensity: { value: 0.5 },
    uDecay: { value: 0.95 },
    uDensity: { value: 0.5 },
    uWeight: { value: 0.4 },
    uSamples: { value: 60 },
    uSceneTexture: { value: sceneRT.texture },
    uOcclusionTexture: { value: occlusionRT.texture },
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
});
```

## Underwater Shader

Complete underwater overlay with fog, caustics, and color absorption:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uFogColor` | `vec3` | Underwater fog color |
| `uFogDensity` | `float` | Fog density |
| `uAbsorptionColor` | `vec3` | Color at depth |
| `uAbsorptionRate` | `float` | Depth color shift rate |
| `uCausticsTexture` | `sampler2D` | Caustics pattern |
| `uCausticsScale` | `float` | Caustics size |
| `uCausticsSpeed` | `float` | Caustics animation |
| `uCausticsIntensity` | `float` | Caustics brightness |
| `uDepth` | `float` | Current depth |

### Usage

```typescript
import { underwaterShader } from '@strata-game-library/shaders';

const underwaterMaterial = new THREE.ShaderMaterial({
  vertexShader: underwaterShader.vertex,
  fragmentShader: underwaterShader.fragment,
  uniforms: {
    uTime: { value: 0 },
    uFogColor: { value: new THREE.Color(0x003366) },
    uFogDensity: { value: 0.03 },
    uAbsorptionColor: { value: new THREE.Color(0x001122) },
    uAbsorptionRate: { value: 0.1 },
    uCausticsTexture: { value: causticsTexture },
    uCausticsScale: { value: 0.5 },
    uCausticsSpeed: { value: 0.3 },
    uCausticsIntensity: { value: 0.4 },
    uDepth: { value: 10 },
  },
  transparent: true,
});
```

## GLSL Code Samples

### Height-Based Fog

```glsl
float heightFog(vec3 worldPos, vec3 cameraPos) {
  float rayLength = length(worldPos - cameraPos);
  vec3 rayDir = normalize(worldPos - cameraPos);

  // Integrate density along ray
  float fogAmount = 0.0;
  float stepSize = rayLength / 32.0;

  for (int i = 0; i < 32; i++) {
    vec3 samplePos = cameraPos + rayDir * stepSize * float(i);
    float height = samplePos.y;

    // Height-based density
    float density = uDensity * exp(-height * uHeightFalloff);
    density *= smoothstep(uMaxHeight, uBaseHeight, height);

    fogAmount += density * stepSize;
  }

  return 1.0 - exp(-fogAmount);
}
```

### God Rays Radial Blur

```glsl
vec3 godRays(vec2 uv, vec2 lightPos) {
  vec2 deltaUV = (uv - lightPos) / float(uSamples) * uDensity;
  vec3 color = vec3(0.0);
  float illuminationDecay = 1.0;

  vec2 sampleUV = uv;

  for (int i = 0; i < uSamples; i++) {
    sampleUV -= deltaUV;
    vec3 sampleColor = texture2D(uOcclusionTexture, sampleUV).rgb;
    sampleColor *= illuminationDecay * uWeight;
    color += sampleColor;
    illuminationDecay *= uDecay;
  }

  return color * uIntensity * uLightColor;
}
```

### Underwater Caustics

```glsl
vec3 caustics(vec2 uv, float time) {
  vec2 uv1 = uv * uCausticsScale + time * uCausticsSpeed * vec2(1.0, 0.5);
  vec2 uv2 = uv * uCausticsScale * 1.3 + time * uCausticsSpeed * vec2(-0.5, 0.8);

  float c1 = texture2D(uCausticsTexture, uv1).r;
  float c2 = texture2D(uCausticsTexture, uv2).r;

  float caustic = min(c1, c2);
  return vec3(caustic) * uCausticsIntensity;
}
```

## Related

- [Volumetrics](/core/volumetrics/) - High-level components
- [Water Shaders](/shaders/water/) - Water rendering
- [Sky Shaders](/shaders/sky/) - Atmospheric effects
