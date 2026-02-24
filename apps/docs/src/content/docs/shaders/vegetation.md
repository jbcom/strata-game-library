---
title: Vegetation Shaders
description: GLSL shaders for wind animation on grass and trees
---

# Vegetation Shaders

Shaders for realistic wind animation on instanced vegetation including grass, trees, and bushes.

## Available Shaders

```typescript
import {
  grassWindVertexShader,
  treeWindVertexShader,
} from '@strata-game-library/shaders';
```

## Grass Wind Shader

Wind animation for grass instances:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uWindSpeed` | `float` | Wind animation speed |
| `uWindStrength` | `float` | Wind bend amount |
| `uWindDirection` | `vec3` | Wind direction |
| `uWindNoiseScale` | `float` | Noise pattern scale |
| `uWindTurbulence` | `float` | Turbulence intensity |

### Usage with InstancedMesh

```typescript
import { grassWindVertexShader } from '@strata-game-library/shaders';

const grassMaterial = new THREE.ShaderMaterial({
  vertexShader: grassWindVertexShader,
  fragmentShader: `
    varying vec3 vColor;
    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `,
  uniforms: {
    uTime: { value: 0 },
    uWindSpeed: { value: 1 },
    uWindStrength: { value: 0.3 },
    uWindDirection: { value: new THREE.Vector3(1, 0, 0.5).normalize() },
    uWindNoiseScale: { value: 0.05 },
    uWindTurbulence: { value: 0.2 },
  },
});

const grassGeometry = createGrassBladeGeometry();
const grassMesh = new THREE.InstancedMesh(grassGeometry, grassMaterial, 10000);
```

## Tree Wind Shader

More complex wind for trees with branch hierarchy:

### Uniforms

| Uniform | Type | Description |
|---------|------|-------------|
| `uTime` | `float` | Animation time |
| `uWindSpeed` | `float` | Wind animation speed |
| `uWindStrength` | `float` | Wind bend amount |
| `uWindDirection` | `vec3` | Wind direction |
| `uTrunkStiffness` | `float` | Trunk resistance to wind |
| `uBranchStiffness` | `float` | Branch resistance |
| `uLeafStiffness` | `float` | Leaf resistance |

### Usage

```typescript
import { treeWindVertexShader } from '@strata-game-library/shaders';

const treeMaterial = new THREE.ShaderMaterial({
  vertexShader: treeWindVertexShader,
  fragmentShader: standardFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uWindSpeed: { value: 0.5 },
    uWindStrength: { value: 0.15 },
    uWindDirection: { value: new THREE.Vector3(1, 0, 0).normalize() },
    uTrunkStiffness: { value: 0.9 },
    uBranchStiffness: { value: 0.5 },
    uLeafStiffness: { value: 0.2 },
  },
});
```

## GLSL Code Samples

### Simple Grass Wind

```glsl
vec3 grassWind(vec3 position, float time, vec3 windDir, float strength) {
  // Height-based influence (more at top)
  float heightFactor = position.y;

  // Wind noise
  float noise = sin(position.x * 0.5 + time) * cos(position.z * 0.5 + time * 0.7);

  // Apply wind
  vec3 offset = windDir * noise * strength * heightFactor;

  return position + offset;
}
```

### Layered Grass Wind

```glsl
vec3 layeredGrassWind(vec3 position, vec3 worldPos, float time) {
  float heightFactor = position.y;

  // Primary wind wave
  float primaryWave = sin(worldPos.x * uWindNoiseScale + time * uWindSpeed);
  primaryWave += sin(worldPos.z * uWindNoiseScale * 0.7 + time * uWindSpeed * 0.8);
  primaryWave *= 0.5;

  // Secondary turbulence
  float turbulence = sin(worldPos.x * uWindNoiseScale * 3.0 + time * uWindSpeed * 2.0);
  turbulence *= uWindTurbulence;

  // Combine
  float totalWind = (primaryWave + turbulence) * uWindStrength * heightFactor;

  vec3 windOffset = uWindDirection * totalWind;

  return position + windOffset;
}
```

### Tree Branch Wind

```glsl
vec3 treeBranchWind(vec3 position, vec3 worldPos, float time, float stiffness) {
  // Distance from trunk (using vertex color or UV)
  float distanceFromTrunk = length(position.xz);

  // Reduce effect near trunk
  float influence = smoothstep(0.0, 1.0, distanceFromTrunk) * (1.0 - stiffness);

  // Multi-frequency wind
  float wind = sin(worldPos.x * 0.1 + time * uWindSpeed) * 0.5;
  wind += sin(worldPos.z * 0.15 + time * uWindSpeed * 0.7) * 0.3;
  wind += sin(time * uWindSpeed * 2.0 + distanceFromTrunk) * 0.2; // Branch flutter

  vec3 offset = uWindDirection * wind * uWindStrength * influence;

  return position + offset;
}
```

### Leaf Flutter

```glsl
vec3 leafFlutter(vec3 position, vec3 normal, float time, float leafStiffness) {
  // Random flutter per vertex
  float flutter = sin(time * 10.0 + position.x * 50.0) *
                  cos(time * 8.0 + position.z * 50.0);
  flutter *= (1.0 - leafStiffness);

  // Flutter along normal
  vec3 offset = normal * flutter * 0.02;

  return position + offset;
}
```

## Integration with Instancing

### Per-Instance Wind Offset

```glsl
// In vertex shader with instanceMatrix
attribute vec3 instanceOffset; // Per-instance world position

void main() {
  // Get instance world position
  vec3 worldPos = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;

  // Apply wind based on world position
  vec3 windedPosition = layeredGrassWind(position, worldPos, uTime);

  // Transform
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(windedPosition, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
```

## Wind Zones

Support for multiple wind sources:

```glsl
uniform vec3 uWindZones[4];      // Position
uniform float uWindZoneStrength[4]; // Strength
uniform float uWindZoneRadius[4];   // Radius

vec3 calculateWindZones(vec3 worldPos) {
  vec3 totalWind = uWindDirection * uWindStrength; // Base wind

  for (int i = 0; i < 4; i++) {
    float dist = length(worldPos - uWindZones[i]);
    float influence = 1.0 - smoothstep(0.0, uWindZoneRadius[i], dist);
    vec3 zoneDir = normalize(worldPos - uWindZones[i]);
    totalWind += zoneDir * uWindZoneStrength[i] * influence;
  }

  return totalWind;
}
```

## Related

- [Vegetation System](/core/vegetation/) - High-level components
- [Terrain Shaders](/shaders/terrain/) - Terrain rendering
