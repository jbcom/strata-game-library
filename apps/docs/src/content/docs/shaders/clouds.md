---
title: Cloud Shaders
description: GLSL shaders for 2D cloud layers and volumetric 3D clouds
---

# Cloud Shaders

Shaders for cloud rendering including 2D procedural layers and full volumetric 3D clouds with ray marching.

## Available Shaders

```typescript
import {
  cloudLayerVertexShader,
  cloudLayerFragmentShader,
  volumetricCloudVertexShader,
  volumetricCloudFragmentShader,
} from '@strata-game-library/shaders';
```

## 2D Cloud Layer

Efficient billboarded cloud layers:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uCloudColor` | `vec3` | Cloud color |
| `uSkyColor` | `vec3` | Sky color for blending |
| `uCloudScale` | `float` | Noise scale |
| `uCloudSpeed` | `vec2` | Movement direction |
| `uCloudCoverage` | `float` | Cloud coverage (0-1) |
| `uCloudDensity` | `float` | Cloud opacity |

### Usage

```typescript
import { cloudLayerVertexShader, cloudLayerFragmentShader } from '@strata-game-library/shaders';

const cloudMaterial = new THREE.ShaderMaterial({
  vertexShader: cloudLayerVertexShader,
  fragmentShader: cloudLayerFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uCloudColor: { value: new THREE.Color(1, 1, 1) },
    uSkyColor: { value: new THREE.Color(0.5, 0.7, 1) },
    uCloudScale: { value: 0.001 },
    uCloudSpeed: { value: new THREE.Vector2(0.01, 0.005) },
    uCloudCoverage: { value: 0.5 },
    uCloudDensity: { value: 0.8 },
  },
  transparent: true,
  side: THREE.DoubleSide,
});

const clouds = new THREE.Mesh(
  new THREE.PlaneGeometry(10000, 10000),
  cloudMaterial
);
clouds.position.y = 500;
clouds.rotation.x = -Math.PI / 2;
```

## Volumetric Clouds

Full 3D volumetric cloud rendering with ray marching:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uCameraPos` | `vec3` | Camera position |
| `uSunDirection` | `vec3` | Sun direction |
| `uSunColor` | `vec3` | Sun light color |
| `uAmbientColor` | `vec3` | Ambient sky color |
| `uCloudMin` | `float` | Cloud layer bottom |
| `uCloudMax` | `float` | Cloud layer top |
| `uDensity` | `float` | Cloud density |
| `uCoverage` | `float` | Cloud coverage |
| `uSteps` | `int` | Ray march steps |
| `uLightSteps` | `int` | Light scattering steps |

### Usage

```typescript
import { volumetricCloudVertexShader, volumetricCloudFragmentShader } from '@strata-game-library/shaders';

const volumetricCloudMaterial = new THREE.ShaderMaterial({
  vertexShader: volumetricCloudVertexShader,
  fragmentShader: volumetricCloudFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uCameraPos: { value: camera.position },
    uSunDirection: { value: new THREE.Vector3(0.5, 0.8, 0.2).normalize() },
    uSunColor: { value: new THREE.Color(1, 0.95, 0.8) },
    uAmbientColor: { value: new THREE.Color(0.5, 0.6, 0.8) },
    uCloudMin: { value: 1000 },
    uCloudMax: { value: 3000 },
    uDensity: { value: 0.05 },
    uCoverage: { value: 0.5 },
    uSteps: { value: 64 },
    uLightSteps: { value: 8 },
  },
  transparent: true,
});
```

## GLSL Code Samples

### FBM Noise for Clouds

```glsl
float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < octaves; i++) {
    value += amplitude * noise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }

  return value;
}
```

### Cloud Density Function

```glsl
float cloudDensity(vec3 p) {
  // Remap height to 0-1 within cloud layer
  float heightFrac = (p.y - uCloudMin) / (uCloudMax - uCloudMin);

  // Height falloff (thicker at bottom, whispy at top)
  float heightMod = smoothstep(0.0, 0.2, heightFrac) * smoothstep(1.0, 0.8, heightFrac);

  // Base cloud shape
  float baseCloud = fbm(p * 0.0003 + uTime * 0.01, 4);

  // Detail noise
  float detail = fbm(p * 0.003, 3) * 0.3;

  // Combine
  float density = (baseCloud + detail) * heightMod;

  // Apply coverage
  density = smoothstep(1.0 - uCoverage, 1.0, density);

  return density * uDensity;
}
```

### Light Scattering

```glsl
float lightMarch(vec3 position) {
  vec3 lightDir = uSunDirection;
  float stepSize = (uCloudMax - position.y) / float(uLightSteps);

  float totalDensity = 0.0;

  for (int i = 0; i < uLightSteps; i++) {
    position += lightDir * stepSize;
    totalDensity += cloudDensity(position) * stepSize;
  }

  // Beer-Lambert law
  return exp(-totalDensity);
}
```

### Henyey-Greenstein Phase Function

```glsl
float henyeyGreenstein(float cosTheta, float g) {
  float g2 = g * g;
  return (1.0 - g2) / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * cosTheta, 1.5));
}
```

## Cloud Presets

```typescript
// Cumulus (puffy)
uniforms.uCoverage.value = 0.4;
uniforms.uDensity.value = 0.08;

// Stratus (flat layers)
uniforms.uCoverage.value = 0.7;
uniforms.uDensity.value = 0.03;

// Stormy
uniforms.uCoverage.value = 0.9;
uniforms.uDensity.value = 0.15;
uniforms.uAmbientColor.value.set(0.3, 0.3, 0.4);
```

## Related

- [Sky Shaders](/shaders/sky/) - Atmospheric scattering
- [Volumetric Shaders](/shaders/volumetrics/) - Fog effects
- [Sky System](/core/sky/) - High-level components
