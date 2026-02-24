---
title: Material Effect Shaders
description: GLSL shaders for special material effects - toon, hologram, dissolve, and more
---

# Material Effect Shaders

Special effect shaders for stylized and dynamic materials including toon shading, holograms, dissolve transitions, and more.

## Available Shaders

```typescript
import {
  toonVertexShader,
  toonFragmentShader,
  hologramVertexShader,
  hologramFragmentShader,
  dissolveVertexShader,
  dissolveFragmentShader,
  forcefieldVertexShader,
  forcefieldFragmentShader,
  glitchVertexShader,
  glitchFragmentShader,
} from '@strata-game-library/shaders';
```

## Toon Shader

Cel-shading with customizable color bands:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uColor` | `vec3` | Base color |
| `uLightDirection` | `vec3` | Light direction |
| `uBands` | `int` | Number of shade bands |
| `uOutlineWidth` | `float` | Outline thickness |
| `uOutlineColor` | `vec3` | Outline color |

### Usage

```typescript
import { toonVertexShader, toonFragmentShader } from '@strata-game-library/shaders';

const toonMaterial = new THREE.ShaderMaterial({
  vertexShader: toonVertexShader,
  fragmentShader: toonFragmentShader,
  uniforms: {
    uColor: { value: new THREE.Color(0xff6b6b) },
    uLightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
    uBands: { value: 4 },
    uOutlineWidth: { value: 0.03 },
    uOutlineColor: { value: new THREE.Color(0x000000) },
  },
});
```

## Hologram Shader

Sci-fi holographic effect with scanlines and flicker:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uColor` | `vec3` | Hologram color |
| `uOpacity` | `float` | Base opacity |
| `uScanlineSpeed` | `float` | Scanline movement |
| `uScanlineCount` | `float` | Number of scanlines |
| `uFlickerSpeed` | `float` | Flicker frequency |
| `uRimPower` | `float` | Rim light intensity |

### Usage

```typescript
import { hologramVertexShader, hologramFragmentShader } from '@strata-game-library/shaders';

const hologramMaterial = new THREE.ShaderMaterial({
  vertexShader: hologramVertexShader,
  fragmentShader: hologramFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x00ffff) },
    uOpacity: { value: 0.5 },
    uScanlineSpeed: { value: 2 },
    uScanlineCount: { value: 100 },
    uFlickerSpeed: { value: 10 },
    uRimPower: { value: 2 },
  },
  transparent: true,
  side: THREE.DoubleSide,
});
```

## Dissolve Shader

Noise-based dissolve transition effect:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uProgress` | `float` | Dissolve progress (0-1) |
| `uNoiseTexture` | `sampler2D` | Noise pattern |
| `uEdgeColor` | `vec3` | Dissolve edge color |
| `uEdgeWidth` | `float` | Edge glow width |
| `uBaseTexture` | `sampler2D` | Object texture |

### Usage

```typescript
import { dissolveVertexShader, dissolveFragmentShader } from '@strata-game-library/shaders';

const dissolveMaterial = new THREE.ShaderMaterial({
  vertexShader: dissolveVertexShader,
  fragmentShader: dissolveFragmentShader,
  uniforms: {
    uProgress: { value: 0 },
    uNoiseTexture: { value: noiseTexture },
    uEdgeColor: { value: new THREE.Color(0xff4400) },
    uEdgeWidth: { value: 0.1 },
    uBaseTexture: { value: objectTexture },
  },
  transparent: true,
});

// Animate dissolve
gsap.to(dissolveMaterial.uniforms.uProgress, {
  value: 1,
  duration: 2,
  ease: 'power2.out',
});
```

## Forcefield Shader

Energy shield / forcefield effect:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uColor` | `vec3` | Shield color |
| `uOpacity` | `float` | Base opacity |
| `uFresnelPower` | `float` | Edge glow falloff |
| `uPulseSpeed` | `float` | Pulse animation speed |
| `uHexScale` | `float` | Hexagon pattern scale |
| `uImpactPoint` | `vec3` | Impact location |
| `uImpactStrength` | `float` | Impact ripple strength |
| `uImpactTime` | `float` | Time since impact |

### Usage

```typescript
import { forcefieldVertexShader, forcefieldFragmentShader } from '@strata-game-library/shaders';

const forcefieldMaterial = new THREE.ShaderMaterial({
  vertexShader: forcefieldVertexShader,
  fragmentShader: forcefieldFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0x00aaff) },
    uOpacity: { value: 0.3 },
    uFresnelPower: { value: 3 },
    uPulseSpeed: { value: 2 },
    uHexScale: { value: 10 },
    uImpactPoint: { value: new THREE.Vector3(0, 0, 1) },
    uImpactStrength: { value: 0 },
    uImpactTime: { value: 0 },
  },
  transparent: true,
  side: THREE.DoubleSide,
  depthWrite: false,
});
```

## Glitch Shader

Digital glitch / corruption effect:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uIntensity` | `float` | Glitch intensity |
| `uBlockSize` | `float` | Glitch block size |
| `uColorShift` | `float` | RGB shift amount |
| `uScanlines` | `bool` | Enable scanlines |
| `uBaseTexture` | `sampler2D` | Source texture |

### Usage

```typescript
import { glitchVertexShader, glitchFragmentShader } from '@strata-game-library/shaders';

const glitchMaterial = new THREE.ShaderMaterial({
  vertexShader: glitchVertexShader,
  fragmentShader: glitchFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uIntensity: { value: 0.5 },
    uBlockSize: { value: 30 },
    uColorShift: { value: 0.02 },
    uScanlines: { value: true },
    uBaseTexture: { value: texture },
  },
});
```

## GLSL Code Samples

### Toon Shading

```glsl
float toonShade(vec3 normal, vec3 lightDir, int bands) {
  float NdotL = dot(normal, lightDir);
  float shade = (NdotL * 0.5 + 0.5);
  shade = floor(shade * float(bands)) / float(bands);
  return shade;
}
```

### Hologram Scanlines

```glsl
float scanlines(vec2 uv, float time, float count, float speed) {
  float line = sin((uv.y + time * speed) * count * 3.14159);
  return smoothstep(0.0, 0.5, line);
}
```

### Dissolve Edge

```glsl
float dissolveEdge(float noise, float progress, float edgeWidth) {
  float edge = smoothstep(progress - edgeWidth, progress, noise);
  edge *= smoothstep(progress + edgeWidth, progress, noise);
  return edge;
}
```

### Fresnel Rim

```glsl
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
}
```

## Related

- [Core Features](/core/) - High-level components
- [Vegetation Shaders](/shaders/vegetation/) - Wind animation
