---
title: Terrain Presets
description: Pre-configured terrain biomes and landscape settings
---

# Terrain Presets

Ready-to-use terrain configurations for common landscape types.

## Quick Start

```typescript
import { createTerrainPreset, TerrainBiomes, TerrainPresets } from '@strata-game-library/presets/terrain';

// Use a preset directly
<Terrain {...TerrainPresets.MOUNTAIN_RANGE} />

// Or create with options
const terrain = createTerrainPreset({
  biomes: [TerrainBiomes.GRASSLAND, TerrainBiomes.MOUNTAIN],
  resolution: 128,
});
```

## Available Biomes

| Biome | Description | Key Features |
|-------|-------------|--------------|
| `GRASSLAND` | Rolling green hills | Grass coverage, gentle slopes |
| `MOUNTAIN` | Rocky peaks | High amplitude, snow caps |
| `DESERT` | Sandy dunes | Tan colors, wind-swept |
| `SNOW` | Frozen tundra | White, ice formations |
| `FOREST` | Wooded terrain | Tree-friendly slopes |
| `SWAMP` | Wetlands | Low elevation, murky |
| `VOLCANIC` | Lava terrain | Black rock, red accents |
| `BEACH` | Coastal sand | Flat near water |
| `CANYON` | Deep valleys | Steep cliffs |
| `PLATEAU` | Flat-topped | Mesa formations |

## Preset Examples

### Mountain Range

```typescript
TerrainPresets.MOUNTAIN_RANGE = {
  biomes: [TerrainBiomes.MOUNTAIN, TerrainBiomes.SNOW],
  amplitude: 120,
  frequency: 0.008,
  octaves: 8,
  snowHeight: 80,
  rockHeight: 40,
  steepness: 0.7,
};
```

### Tropical Island

```typescript
TerrainPresets.TROPICAL_ISLAND = {
  biomes: [TerrainBiomes.BEACH, TerrainBiomes.FOREST],
  amplitude: 40,
  frequency: 0.015,
  shape: 'island',
  waterLevel: 0,
  beachWidth: 20,
  palmTrees: true,
};
```

### Desert Dunes

```typescript
TerrainPresets.DESERT_DUNES = {
  biomes: [TerrainBiomes.DESERT],
  amplitude: 30,
  frequency: 0.02,
  duneDirection: [1, 0, 0.3],
  duneSharpness: 0.8,
  sandRipples: true,
};
```

### Volcanic Landscape

```typescript
TerrainPresets.VOLCANIC = {
  biomes: [TerrainBiomes.VOLCANIC],
  amplitude: 100,
  craterCount: 3,
  lavaFlows: true,
  ashCoverage: 0.3,
  smokeParticles: true,
};
```

## Configuration Options

```typescript
interface TerrainPresetOptions {
  // Biome selection
  biomes: TerrainBiome[];
  biomeScale?: number;
  biomeBlend?: number;

  // Terrain shape
  amplitude?: number;
  frequency?: number;
  octaves?: number;
  persistence?: number;
  lacunarity?: number;

  // Height zones
  waterLevel?: number;
  beachHeight?: number;
  grassHeight?: number;
  rockHeight?: number;
  snowHeight?: number;

  // Special features
  caves?: boolean;
  cavesDensity?: number;
  cliffs?: boolean;
  cliffsAngle?: number;

  // Quality
  resolution?: number;
  chunkSize?: number;
  lodLevels?: number;
}
```

## Using with Components

```tsx
import { Terrain } from '@strata-game-library/core';
import { TerrainPresets } from '@strata-game-library/presets/terrain';

function Scene() {
  return (
    <>
      <Terrain
        {...TerrainPresets.MOUNTAIN_RANGE}
        size={1000}
        position={[0, 0, 0]}
      />
    </>
  );
}
```

## Customizing Presets

```typescript
import { createTerrainPreset, TerrainPresets } from '@strata-game-library/presets/terrain';

// Extend a preset
const tallerMountains = {
  ...TerrainPresets.MOUNTAIN_RANGE,
  amplitude: 200,  // Override
  snowHeight: 120,
};

// Or use the factory
const custom = createTerrainPreset({
  base: 'MOUNTAIN_RANGE',
  overrides: {
    amplitude: 200,
  },
});
```

## Related

- [Terrain System](/core/terrain/) - Full terrain documentation
- [Vegetation Presets](/presets/vegetation/) - Plants for terrain
