---
title: Fur System
description: GPU-accelerated shell-based fur rendering
---

# 🐕 Fur System

Strata provides GPU-accelerated fur rendering using the shell technique, capable of rendering realistic fur, grass, and hair on any mesh.

## Quick Start

```tsx
import { createFurSystem } from '@strata-game-library/core';

const fur = createFurSystem({
  density: 1000,
  length: 0.5
});
```

## Usage

### Basic Fur

```tsx
import { FurMesh } from '@strata-game-library/core';

<FurMesh
  geometry={animalGeometry}

  // Fur properties
  density={2000}
  length={0.3}
  thickness={0.01}

  // Color
  color="#8B4513"
  tipColor="#D2691E"

  // Shells
  shellCount={30}
/>
```

### With Wind

```tsx
<FurMesh
  geometry={animalGeometry}
  density={2000}
  length={0.3}

  // Wind animation
  wind
  windSpeed={1}
  windStrength={0.2}
  windDirection={[1, 0, 0.5]}
/>
```

### With Physics

```tsx
<FurMesh
  geometry={animalGeometry}
  density={2000}
  length={0.3}

  // Physics simulation
  physics
  gravity={[0, -1, 0]}
  stiffness={0.5}
  damping={0.1}
/>
```

## Configuration

### Fur Density

```tsx
// Sparse fur (performance friendly)
<FurMesh density={500} />

// Normal density
<FurMesh density={2000} />

// Dense fur (high quality)
<FurMesh density={5000} />
```

### Shell Count

More shells = smoother fur, higher performance cost:

```tsx
// Mobile (low quality)
<FurMesh shellCount={10} />

// Desktop (medium quality)
<FurMesh shellCount={30} />

// High-end (high quality)
<FurMesh shellCount={60} />
```

### Color Gradients

```tsx
<FurMesh
  // Base to tip gradient
  color="#4a3728"        // Root color (darker)
  tipColor="#8b7355"     // Tip color (lighter)
  colorVariation={0.1}   // Random color variation

  // Or use a texture
  colorTexture={furPatternTexture}
/>
```

### Fur Patterns

```tsx
<FurMesh
  // Density texture (where fur grows)
  densityTexture={furDensityMap}

  // Length texture (fur length variation)
  lengthTexture={furLengthMap}

  // Direction texture (fur direction)
  directionTexture={furDirectionMap}
/>
```

## Animation

### Wind Animation

```tsx
<FurMesh
  wind
  windSpeed={1.5}
  windStrength={0.3}
  windDirection={[1, 0, 0]}
  windTurbulence={0.2}
  windNoiseScale={0.5}
/>
```

### Physics-Based Movement

```tsx
<FurMesh
  physics

  // Physical properties
  gravity={[0, -9.8, 0]}
  stiffness={0.8}      // How quickly fur returns to rest
  damping={0.3}        // Movement dampening
  mass={0.01}          // Per-strand mass

  // Velocity influence
  velocityInfluence={0.5}  // How much object movement affects fur
/>
```

### Touch Interaction

```tsx
import { useFurInteraction } from '@strata-game-library/core';

function InteractiveFur() {
  const { onPointerMove, deformation } = useFurInteraction();

  return (
    <FurMesh
      onPointerMove={onPointerMove}
      deformation={deformation}
      deformationDecay={0.95}
    />
  );
}
```

## Presets

### Animal Presets

```tsx
import { FurPresets } from '@strata-game-library/presets';

// Short fur (cat, dog)
<FurMesh {...FurPresets.SHORT_FUR} />

// Long fur (persian cat, lion mane)
<FurMesh {...FurPresets.LONG_FUR} />

// Fluffy (sheep, alpaca)
<FurMesh {...FurPresets.FLUFFY} />

// Spiky (hedgehog, porcupine)
<FurMesh {...FurPresets.SPIKY} />
```

### Material Presets

```tsx
// Realistic animal fur
<FurMesh {...FurPresets.REALISTIC} />

// Stylized cartoon fur
<FurMesh {...FurPresets.STYLIZED} />

// Grass-like
<FurMesh {...FurPresets.GRASS_LIKE} />
```

## Core API

### `createFurSystem`

Low-level fur system creation:

```tsx
import { createFurSystem } from '@strata-game-library/core';

const furSystem = createFurSystem({
  geometry: meshGeometry,

  // Strand generation
  density: 2000,
  length: 0.3,
  thickness: 0.01,

  // Shells
  shellCount: 30,
  shellSpacing: 'linear',  // or 'exponential'

  // Material
  color: new THREE.Color('#8B4513'),
  tipColor: new THREE.Color('#D2691E'),

  // Textures
  densityMap: densityTexture,
  lengthMap: lengthTexture,
  directionMap: directionTexture
});

// Access generated data
const { meshes, material, update } = furSystem;

// Add to scene
meshes.forEach(mesh => scene.add(mesh));

// Update each frame
useFrame((_, delta) => {
  update(delta, { wind: windVector });
});
```

### Shader Access

```tsx
import { furVertexShader, furFragmentShader } from '@strata-game-library/shaders';

const material = new THREE.ShaderMaterial({
  vertexShader: furVertexShader,
  fragmentShader: furFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uShellIndex: { value: 0 },
    uShellCount: { value: 30 },
    uDensity: { value: 2000 },
    uLength: { value: 0.3 },
    uColor: { value: new THREE.Color('#8B4513') },
    uTipColor: { value: new THREE.Color('#D2691E') },
    uWind: { value: new THREE.Vector3(1, 0, 0) }
  },
  transparent: true,
  side: THREE.DoubleSide
});
```

## Performance

### Quality Levels

```tsx
// Mobile (15-20 FPS target)
<FurMesh
  shellCount={8}
  density={500}
  simplified
/>

// Desktop (60 FPS)
<FurMesh
  shellCount={30}
  density={2000}
/>

// High-end
<FurMesh
  shellCount={60}
  density={5000}
  physics
/>
```

### Optimization Tips

1. **Reduce shell count** - Most visible optimization
2. **Lower density** - Fewer strands per shell
3. **Disable physics** - Use wind-only animation
4. **Use LOD** - Fewer shells at distance

```tsx
<FurMesh
  lod
  lodDistances={[10, 30, 100]}
  lodShellCounts={[30, 15, 5]}
/>
```

## Related

- [Vegetation](/core/vegetation/) - Grass instancing
- [Characters](/core/characters/) - Character integration
- [Shaders](/shaders/) - Custom shader access
