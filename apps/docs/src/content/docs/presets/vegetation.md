---
title: Vegetation Presets
description: Pre-configured vegetation settings for forests, grasslands, and gardens
---

# Vegetation Presets

Ready-to-use vegetation configurations for different environment types.

## Quick Start

```typescript
import { createVegetationPreset, VegetationPresets } from '@strata-game-library/presets/vegetation';

// Use a preset
<VegetationSystem {...VegetationPresets.DENSE_FOREST} />
```

## Available Presets

| Preset | Description | Contents |
|--------|-------------|----------|
| `DENSE_FOREST` | Thick woodland | Many trees, undergrowth |
| `SPARSE_FOREST` | Open woodland | Scattered trees, grass |
| `TROPICAL_FOREST` | Jungle | Palms, ferns, vines |
| `PINE_FOREST` | Coniferous | Pine trees, needles |
| `GRASSLAND` | Open plains | Tall grass, wildflowers |
| `MEADOW` | Flower meadow | Grass, colorful flowers |
| `GARDEN` | Landscaped | Trimmed hedges, flowers |
| `DESERT` | Arid | Cacti, rocks, sparse |
| `TUNDRA` | Arctic | Low shrubs, moss |
| `SWAMP` | Wetland | Reeds, mangroves |

## Preset Examples

### Dense Forest

```typescript
VegetationPresets.DENSE_FOREST = {
  grass: {
    count: 15000,
    spread: 100,
    height: [0.3, 0.6],
    color: '#2d5a27',
    colorVariation: 0.15,
  },

  trees: {
    count: 800,
    spread: 120,
    types: ['oak', 'birch', 'maple'],
    typeWeights: [0.5, 0.3, 0.2],
    height: [8, 15],
    density: 'high',
  },

  undergrowth: {
    enabled: true,
    bushes: 200,
    ferns: 500,
    mushrooms: 100,
  },

  rocks: {
    count: 150,
    spread: 100,
    moss: true,
    mossAmount: 0.4,
  },

  wind: {
    speed: 0.8,
    strength: 0.2,
  },
};
```

### Tropical Forest

```typescript
VegetationPresets.TROPICAL_FOREST = {
  grass: {
    count: 8000,
    spread: 80,
    height: [0.4, 0.8],
    color: '#228b22',
  },

  trees: {
    count: 600,
    spread: 100,
    types: ['palm', 'banana', 'tropical'],
    height: [10, 20],
  },

  undergrowth: {
    ferns: 1000,
    flowers: 300,
    vines: true,
  },

  humidity: 0.9,
  particleEffects: ['fireflies', 'pollen'],
};
```

### Grassland

```typescript
VegetationPresets.GRASSLAND = {
  grass: {
    count: 25000,
    spread: 150,
    height: [0.5, 1.2],
    color: '#90a955',
    colorVariation: 0.2,
    waviness: 0.4,
  },

  trees: {
    count: 50,
    spread: 150,
    types: ['oak'],
    scattered: true,
  },

  flowers: {
    count: 2000,
    types: ['wildflower', 'daisy', 'poppy'],
    colors: ['#ffdd00', '#ff6b6b', '#ffffff'],
  },

  wind: {
    speed: 1.5,
    strength: 0.4,
  },
};
```

## Configuration Options

```typescript
interface VegetationPresetOptions {
  // Grass
  grass?: {
    count: number;
    spread: number;
    height: [number, number];
    color: string;
    colorVariation?: number;
  };

  // Trees
  trees?: {
    count: number;
    spread: number;
    types: string[];
    typeWeights?: number[];
    height: [number, number];
  };

  // Additional
  undergrowth?: {
    bushes?: number;
    ferns?: number;
    mushrooms?: number;
  };

  flowers?: {
    count: number;
    types: string[];
    colors: string[];
  };

  rocks?: {
    count: number;
    spread: number;
    moss?: boolean;
  };

  // Animation
  wind?: {
    speed: number;
    strength: number;
    direction?: [number, number, number];
  };
}
```

## Using with Components

```tsx
import { GrassInstances, TreeInstances, RockInstances } from '@strata-game-library/core';
import { VegetationPresets } from '@strata-game-library/presets/vegetation';

function Forest() {
  const preset = VegetationPresets.DENSE_FOREST;

  return (
    <>
      <GrassInstances {...preset.grass} />
      <TreeInstances {...preset.trees} />
      <RockInstances {...preset.rocks} />
    </>
  );
}
```

## Related

- [Vegetation System](/core/vegetation/) - Full vegetation docs
- [Vegetation Shaders](/shaders/vegetation/) - Wind animation
- [Terrain Presets](/presets/terrain/) - Matching terrain
