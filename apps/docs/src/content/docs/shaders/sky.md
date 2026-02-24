---
title: Sky & Atmosphere Shaders
description: GLSL shaders for procedural sky with atmospheric scattering
---

# Sky & Atmosphere Shaders

Physically-based atmospheric scattering shaders for procedural sky rendering with Rayleigh and Mie scattering.

## Available Shaders

```typescript
import {
  skyVertexShader,
  skyFragmentShader,
  atmosphereVertexShader,
  atmosphereFragmentShader,
} from '@strata-game-library/shaders';
```

## Sky Shader

Complete procedural sky with sun and atmospheric effects:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `sunPosition` | `vec3` | Sun position in world space |
| `turbidity` | `float` | Atmospheric haziness (2-20) |
| `rayleigh` | `float` | Blue scattering coefficient |
| `mieCoefficient` | `float` | Sun halo coefficient |
| `mieDirectionalG` | `float` | Halo directionality (0-1) |
| `sunIntensity` | `float` | Sun brightness |

### Usage

```typescript
import { skyVertexShader, skyFragmentShader } from '@strata-game-library/shaders';

const skyMaterial = new THREE.ShaderMaterial({
  vertexShader: skyVertexShader,
  fragmentShader: skyFragmentShader,
  uniforms: {
    sunPosition: { value: new THREE.Vector3(100, 50, 100) },
    turbidity: { value: 10 },
    rayleigh: { value: 2 },
    mieCoefficient: { value: 0.005 },
    mieDirectionalG: { value: 0.8 },
    sunIntensity: { value: 1.0 },
  },
  side: THREE.BackSide,
});

const sky = new THREE.Mesh(
  new THREE.SphereGeometry(5000, 32, 32),
  skyMaterial
);
```

## Atmosphere Shader

Standalone atmospheric scattering for planet rendering:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uSunDirection` | `vec3` | Normalized sun direction |
| `uAtmosphereRadius` | `float` | Outer atmosphere radius |
| `uPlanetRadius` | `float` | Planet surface radius |
| `uRayleighScattering` | `vec3` | RGB scattering coefficients |
| `uMieScattering` | `float` | Mie scattering coefficient |
| `uRayleighScaleHeight` | `float` | Rayleigh density falloff |
| `uMieScaleHeight` | `float` | Mie density falloff |

### Usage

```typescript
import { atmosphereVertexShader, atmosphereFragmentShader } from '@strata-game-library/shaders';

const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  uniforms: {
    uSunDirection: { value: new THREE.Vector3(0, 1, 0).normalize() },
    uAtmosphereRadius: { value: 6420000 },
    uPlanetRadius: { value: 6360000 },
    uRayleighScattering: { value: new THREE.Vector3(5.5e-6, 13.0e-6, 22.4e-6) },
    uMieScattering: { value: 21e-6 },
    uRayleighScaleHeight: { value: 8000 },
    uMieScaleHeight: { value: 1200 },
  },
  side: THREE.BackSide,
  transparent: true,
});
```

## GLSL Code Samples

### Rayleigh Scattering

```glsl
vec3 rayleighScattering(float cosTheta, vec3 lambda) {
  // Rayleigh scattering coefficient
  vec3 beta = (8.0 * pow(PI, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0)) /
              (3.0 * N * pow(lambda, vec3(4.0)));

  // Phase function
  float phase = (3.0 / 16.0 * PI) * (1.0 + cosTheta * cosTheta);

  return beta * phase;
}
```

### Mie Scattering

```glsl
float miePhase(float cosTheta, float g) {
  float g2 = g * g;
  return (3.0 / (8.0 * PI)) *
         ((1.0 - g2) * (1.0 + cosTheta * cosTheta)) /
         (pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5) * (2.0 + g2));
}
```

### Atmospheric Density

```glsl
float atmosphericDensity(float altitude, float scaleHeight) {
  return exp(-altitude / scaleHeight);
}
```

### Ray-Sphere Intersection

```glsl
vec2 raySphereIntersect(vec3 rayOrigin, vec3 rayDir, float sphereRadius) {
  float a = dot(rayDir, rayDir);
  float b = 2.0 * dot(rayOrigin, rayDir);
  float c = dot(rayOrigin, rayOrigin) - sphereRadius * sphereRadius;
  float d = b * b - 4.0 * a * c;

  if (d < 0.0) return vec2(-1.0);

  return vec2(
    (-b - sqrt(d)) / (2.0 * a),
    (-b + sqrt(d)) / (2.0 * a)
  );
}
```

## Time of Day Presets

```typescript
// Dawn
uniforms.sunPosition.value.set(100, 5, 0);
uniforms.turbidity.value = 4;
uniforms.rayleigh.value = 2;

// Noon
uniforms.sunPosition.value.set(0, 100, 0);
uniforms.turbidity.value = 10;
uniforms.rayleigh.value = 1;

// Sunset
uniforms.sunPosition.value.set(-100, 5, 0);
uniforms.turbidity.value = 5;
uniforms.rayleigh.value = 3;

// Night
uniforms.sunPosition.value.set(0, -100, 0);
uniforms.turbidity.value = 2;
uniforms.rayleigh.value = 0.1;
```

## Related

- [Sky System](/core/sky/) - High-level sky components
- [Cloud Shaders](/shaders/clouds/) - Volumetric clouds
- [Volumetric Shaders](/shaders/volumetrics/) - Fog and god rays
