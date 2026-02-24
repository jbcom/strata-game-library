---
title: Vegetation System
description: GPU-instanced grass, trees, and rocks with wind animation
---

# 🌿 Vegetation System

Strata's vegetation system uses GPU instancing to render 10,000+ instances of grass, trees, and rocks at 60fps with procedural wind animation and biome-based distribution.

## Quick Start

```tsx
import { GrassInstances, TreeInstances, RockInstances } from '@strata-game-library/core';

<GrassInstances count={10000} spread={100} />
<TreeInstances count={500} spread={200} />
<RockInstances count={200} spread={150} />
```

## Components

### `<GrassInstances>`

GPU-instanced grass with wind animation:

```tsx
import { GrassInstances } from '@strata-game-library/core';

<GrassInstances
  // Instance count
  count={10000}

  // Distribution
  spread={100}
  spreadType="random"  // or "grid", "noise"

  // Appearance
  color="#4a7c23"
  colorVariation={0.2}
  height={0.5}
  heightVariation={0.3}
  width={0.05}

  // Wind
  windSpeed={1}
  windStrength={0.3}
  windDirection={[1, 0, 1]}

  // Position
  position={[0, 0, 0]}

  // Terrain following
  terrain={terrainRef}
  terrainHeight={(x, z) => getHeight(x, z)}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `1000` | Number of grass blades |
| `spread` | `number` | `50` | Distribution radius |
| `spreadType` | `string` | `'random'` | Distribution pattern |
| `color` | `string` | `'#4a7c23'` | Base grass color |
| `colorVariation` | `number` | `0.2` | Color randomness |
| `height` | `number` | `0.5` | Blade height |
| `heightVariation` | `number` | `0.3` | Height randomness |
| `windSpeed` | `number` | `1` | Wind animation speed |
| `windStrength` | `number` | `0.3` | Wind bend amount |

### `<TreeInstances>`

GPU-instanced trees with variety:

```tsx
import { TreeInstances } from '@strata-game-library/core';

<TreeInstances
  // Instance count
  count={500}

  // Distribution
  spread={200}
  minDistance={5}  // Minimum spacing

  // Size variation
  minHeight={4}
  maxHeight={12}
  minRadius={1}
  maxRadius={3}

  // Appearance
  trunkColor="#4a3728"
  foliageColor="#2d5a27"
  foliageVariation={0.3}

  // Tree types
  types={['pine', 'oak', 'birch']}
  typeWeights={[0.5, 0.3, 0.2]}

  // Wind
  windSpeed={0.5}
  windStrength={0.1}

  // LOD
  lodLevels={3}
  lodDistances={[50, 150, 400]}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `100` | Number of trees |
| `spread` | `number` | `100` | Distribution radius |
| `minDistance` | `number` | `5` | Minimum tree spacing |
| `minHeight` | `number` | `3` | Minimum tree height |
| `maxHeight` | `number` | `8` | Maximum tree height |
| `types` | `string[]` | `['default']` | Tree type names |
| `lodLevels` | `number` | `3` | LOD quality levels |

### `<RockInstances>`

GPU-instanced rocks and boulders:

```tsx
import { RockInstances } from '@strata-game-library/core';

<RockInstances
  // Instance count
  count={200}

  // Distribution
  spread={150}
  clusterSize={5}
  clusterSpread={10}

  // Size variation
  minScale={0.5}
  maxScale={3}

  // Appearance
  color="#666666"
  colorVariation={0.15}
  roughness={0.8}

  // Types
  types={['boulder', 'flat', 'jagged']}

  // Moss
  moss
  mossColor="#3a5f0b"
  mossAmount={0.3}
/>
```

### `<GPUInstancedMesh>`

Generic GPU instancing for any mesh:

```tsx
import { GPUInstancedMesh } from '@strata-game-library/core';

<GPUInstancedMesh
  geometry={customGeometry}
  material={customMaterial}
  count={1000}

  // Transform data
  positions={positionsArray}
  rotations={rotationsArray}
  scales={scalesArray}
  colors={colorsArray}

  // Animation
  animated
  animationFn={(instance, time) => ({
    position: [instance.x, Math.sin(time + instance.x) * 0.1, instance.z]
  })}
/>
```

## Distribution Patterns

### Random Distribution

```tsx
<GrassInstances
  spread={100}
  spreadType="random"
  seed={12345}  // Reproducible randomness
/>
```

### Grid Distribution

```tsx
<GrassInstances
  spread={100}
  spreadType="grid"
  gridSpacing={0.5}
  gridJitter={0.2}  // Add randomness to grid
/>
```

### Noise-Based Distribution

```tsx
<GrassInstances
  spread={100}
  spreadType="noise"
  noiseScale={0.05}
  noiseThreshold={0.3}  // Only place above threshold
/>
```

### Biome-Based Distribution

```tsx
<GrassInstances
  spread={100}
  spreadType="biome"
  biomeMap={biomeTexture}
  biomeColors={{
    grassland: '#4a7c23',
    desert: '#c2b280',
    snow: '#e8e8e8'
  }}
/>
```

## Terrain Following

Make vegetation follow terrain height:

```tsx
// Using a height function
<GrassInstances
  count={10000}
  spread={100}
  terrainHeight={(x, z) => {
    return noise2D(x * 0.02, z * 0.02) * 20;
  }}
/>

// Using a terrain reference
const terrainRef = useRef();

<Terrain ref={terrainRef} />
<GrassInstances
  count={10000}
  spread={100}
  terrain={terrainRef}
/>
```

## Wind Animation

### Global Wind

```tsx
<GrassInstances
  windSpeed={1.5}
  windStrength={0.4}
  windDirection={[1, 0, 0.5]}
  windTurbulence={0.2}
/>
```

### Wind Zones

```tsx
import { WindZone } from '@strata-game-library/core';

<WindZone
  position={[50, 0, 50]}
  radius={30}
  strength={2}
  direction={[1, 0, 0]}
/>

<GrassInstances
  count={10000}
  spread={100}
  useWindZones
/>
```

### Custom Wind Function

```tsx
<GrassInstances
  windFunction={(position, time) => {
    // Custom wind calculation
    const wave = Math.sin(position.x * 0.1 + time);
    return new Vector3(wave * 0.3, 0, wave * 0.1);
  }}
/>
```

## Level of Detail (LOD)

### Automatic LOD

```tsx
<TreeInstances
  count={1000}
  spread={300}

  lodLevels={4}
  lodDistances={[30, 100, 250, 500]}
  lodReductions={[1, 0.5, 0.25, 0.1]}  // Polygon reduction
/>
```

### Billboard LOD

Trees become billboards at distance:

```tsx
<TreeInstances
  count={1000}
  spread={300}

  billboardDistance={200}  // Switch to billboard
  billboardTexture={treeBillboard}
/>
```

### Fade Out

```tsx
<GrassInstances
  count={10000}
  spread={100}

  fadeStart={80}
  fadeEnd={100}
/>
```

## Custom Vegetation

### Custom Grass Geometry

```tsx
import { createGrassGeometry } from '@strata-game-library/core';

const customGrass = createGrassGeometry({
  segments: 5,
  curve: 0.3,
  width: 0.05,
  height: 0.6
});

<GPUInstancedMesh
  geometry={customGrass}
  material={grassMaterial}
  count={10000}
/>
```

### Custom Tree Models

```tsx
import { useGLTF } from '@react-three/drei';

function CustomTrees() {
  const { scene } = useGLTF('/models/custom-tree.glb');

  return (
    <TreeInstances
      count={500}
      spread={200}
      customModel={scene}
      modelScale={0.1}
    />
  );
}
```

## Performance

### Recommended Counts

| Platform | Grass | Trees | Rocks |
|----------|-------|-------|-------|
| Mobile | 3,000-5,000 | 100-200 | 50-100 |
| Desktop | 10,000-20,000 | 500-1,000 | 200-400 |
| High-end | 50,000+ | 2,000+ | 500+ |

### Optimization Tips

1. **Use LOD** for distant vegetation
2. **Reduce count** on mobile devices
3. **Use billboards** for very distant trees
4. **Fade out** grass beyond camera view
5. **Cluster rocks** for visual density with fewer instances

```tsx
// Mobile-optimized scene
<GrassInstances count={3000} spread={50} fadeEnd={60} />
<TreeInstances count={100} spread={80} lodLevels={2} />
<RockInstances count={50} spread={60} />

// Desktop scene
<GrassInstances count={15000} spread={120} />
<TreeInstances count={800} spread={200} lodLevels={4} />
<RockInstances count={300} spread={180} />
```

## Live Demo

<iframe
  src="https://strata-game-library.github.io/examples/vegetation-showcase/"
  class="showcase-iframe"
  title="Vegetation Demo"
></iframe>

[View Full Demo](https://strata-game-library.github.io/examples/vegetation-showcase/) | [View Source](https://github.com/strata-game-library/examples/tree/main/vegetation-showcase)

## Related

- [Vegetation Shaders](/shaders/vegetation/) - Wind shaders
- [Vegetation Presets](/presets/vegetation/) - Biome configurations
- [Terrain](/core/terrain/) - Terrain integration
