---
title: Water Shaders
description: GLSL shaders for water rendering with waves, reflections, and caustics
---

# Water Shaders

Shaders for realistic water rendering including wave animation, reflections, refractions, caustics, and foam effects.

## Available Shaders

```typescript
import {
  waterVertexShader,
  waterFragmentShader,
  advancedWaterVertexShader,
  advancedWaterFragmentShader,
  causticsShader,
} from '@strata-game-library/shaders';
```

## Basic Water Shader

Simple animated water with Fresnel reflections:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uWaterColor` | `vec3` | Base water color |
| `uWaveHeight` | `float` | Wave amplitude |
| `uWaveSpeed` | `float` | Wave animation speed |
| `uOpacity` | `float` | Water transparency |

### Usage

```typescript
import { waterVertexShader, waterFragmentShader } from '@strata-game-library/shaders';

const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color(0x0077be) },
    uWaveHeight: { value: 0.5 },
    uWaveSpeed: { value: 1.0 },
    uOpacity: { value: 0.8 },
  },
  transparent: true,
});
```

## Advanced Water Shader

Full-featured water with Gerstner waves, reflections, refractions, and effects:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uWaterColor` | `vec3` | Deep water color |
| `uShallowColor` | `vec3` | Shallow water color |
| `uReflectionTexture` | `sampler2D` | Reflection render target |
| `uRefractionTexture` | `sampler2D` | Refraction render target |
| `uNormalMap` | `sampler2D` | Water normal map |
| `uReflectionStrength` | `float` | Reflection intensity |
| `uRefractionStrength` | `float` | Refraction distortion |
| `uFresnelPower` | `float` | Fresnel falloff |
| `uFoamTexture` | `sampler2D` | Foam pattern texture |
| `uFoamThreshold` | `float` | Wave height for foam |
| `uCausticsTexture` | `sampler2D` | Caustics pattern |
| `uCausticsStrength` | `float` | Caustics intensity |

### Gerstner Wave Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uWaveA` | `vec4` | Wave A: (dirX, dirZ, steepness, wavelength) |
| `uWaveB` | `vec4` | Wave B parameters |
| `uWaveC` | `vec4` | Wave C parameters |

### Usage

```typescript
import { advancedWaterVertexShader, advancedWaterFragmentShader } from '@strata-game-library/shaders';

const advancedWaterMaterial = new THREE.ShaderMaterial({
  vertexShader: advancedWaterVertexShader,
  fragmentShader: advancedWaterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color(0x001e0f) },
    uShallowColor: { value: new THREE.Color(0x0088aa) },

    // Gerstner waves
    uWaveA: { value: new THREE.Vector4(1, 0, 0.5, 30) },
    uWaveB: { value: new THREE.Vector4(0.7, 0.7, 0.3, 15) },
    uWaveC: { value: new THREE.Vector4(0, 1, 0.2, 8) },

    // Reflections
    uReflectionTexture: { value: reflectionRT.texture },
    uReflectionStrength: { value: 0.5 },

    // Refraction
    uRefractionTexture: { value: refractionRT.texture },
    uRefractionStrength: { value: 0.05 },

    // Fresnel
    uFresnelPower: { value: 2.0 },

    // Foam
    uFoamTexture: { value: foamTexture },
    uFoamThreshold: { value: 0.7 },

    // Caustics
    uCausticsTexture: { value: causticsTexture },
    uCausticsStrength: { value: 0.3 },
  },
  transparent: true,
});
```

## Caustics Shader

Animated caustic patterns for underwater surfaces:

```typescript
import { causticsShader } from '@strata-game-library/shaders';

const causticsMaterial = new THREE.ShaderMaterial({
  vertexShader: causticsShader.vertex,
  fragmentShader: causticsShader.fragment,
  uniforms: {
    uTime: { value: 0 },
    uScale: { value: 0.5 },
    uSpeed: { value: 0.3 },
    uIntensity: { value: 0.4 },
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
});
```

## GLSL Code Samples

### Gerstner Wave Function

```glsl
vec3 gerstnerWave(vec4 wave, vec3 p, inout vec3 tangent, inout vec3 binormal) {
  float steepness = wave.z;
  float wavelength = wave.w;
  float k = 2.0 * PI / wavelength;
  float c = sqrt(9.8 / k);
  vec2 d = normalize(wave.xy);
  float f = k * (dot(d, p.xz) - c * uTime);
  float a = steepness / k;

  tangent += vec3(
    -d.x * d.x * steepness * sin(f),
    d.x * steepness * cos(f),
    -d.x * d.y * steepness * sin(f)
  );
  binormal += vec3(
    -d.x * d.y * steepness * sin(f),
    d.y * steepness * cos(f),
    -d.y * d.y * steepness * sin(f)
  );

  return vec3(
    d.x * a * cos(f),
    a * sin(f),
    d.y * a * cos(f)
  );
}
```

### Fresnel Calculation

```glsl
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
}
```

### Caustics Pattern

```glsl
float caustics(vec2 uv, float time) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  float c = 1.0;
  float inten = 0.005;

  for (int n = 0; n < 4; n++) {
    float t = time * (1.0 - (3.5 / float(n + 1)));
    vec2 i = p + vec2(cos(t - p.x) + sin(t + p.y), sin(t - p.y) + cos(t + p.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
  }

  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}
```

## Related

- [Water System](/core/water/) - High-level water components
- [Volumetric Shaders](/shaders/volumetrics/) - Underwater effects
