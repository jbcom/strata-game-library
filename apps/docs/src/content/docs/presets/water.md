---
title: Water Presets
description: Pre-configured water body settings for ocean, lake, river, and more
---

# Water Presets

Ready-to-use water configurations for different water body types.

## Quick Start

```typescript
import { createWaterPreset, WaterTypes, WaterPresets } from '@strata-game-library/presets/water';

// Use a preset directly
<Water {...WaterPresets.TROPICAL_OCEAN} />

// Or create with options
const water = createWaterPreset(WaterTypes.LAKE);
```

## Available Presets

| Preset | Description | Key Features |
|--------|-------------|--------------|
| `OCEAN` | Deep ocean | Large waves, deep blue |
| `TROPICAL_OCEAN` | Caribbean waters | Turquoise, clear |
| `CALM_SEA` | Calm ocean | Small waves, reflective |
| `STORMY_SEA` | Rough ocean | Large waves, dark |
| `LAKE` | Freshwater lake | Calm, green tint |
| `MOUNTAIN_LAKE` | Alpine lake | Crystal clear, cold blue |
| `POND` | Small pond | Still, slight green |
| `RIVER` | Flowing river | Directional flow |
| `STREAM` | Small stream | Fast flow, shallow |
| `POOL` | Swimming pool | Perfectly clear, still |
| `SWAMP` | Murky swamp | Dark, low visibility |

## Preset Examples

### Tropical Ocean

```typescript
WaterPresets.TROPICAL_OCEAN = {
  color: '#00b4d8',
  shallowColor: '#90e0ef',
  depth: 30,
  transparency: 0.85,

  waves: {
    height: 1.5,
    length: 25,
    speed: 1.2,
    directions: [[1, 0], [0.7, 0.7], [0, 1]],
  },

  reflections: true,
  reflectionStrength: 0.6,

  caustics: true,
  causticsIntensity: 0.4,

  foam: true,
  foamThreshold: 0.8,
};
```

### Mountain Lake

```typescript
WaterPresets.MOUNTAIN_LAKE = {
  color: '#1a759f',
  shallowColor: '#34a0a4',
  depth: 20,
  transparency: 0.95,

  waves: {
    height: 0.3,
    length: 10,
    speed: 0.5,
  },

  reflections: true,
  reflectionStrength: 0.8,
  reflectionBlur: 0.05,

  caustics: true,
  causticsIntensity: 0.5,

  temperature: 'cold',
};
```

### River

```typescript
WaterPresets.RIVER = {
  color: '#457b9d',
  depth: 5,
  transparency: 0.7,

  flow: {
    enabled: true,
    speed: 2,
    direction: [1, 0, 0],
    turbulence: 0.3,
  },

  waves: {
    height: 0.2,
    length: 5,
    speed: 2,
  },

  foam: true,
  foamAmount: 0.4,
  foamAtEdges: true,

  rocks: {
    enabled: true,
    splashEffect: true,
  },
};
```

### Swamp

```typescript
WaterPresets.SWAMP = {
  color: '#2d3a1a',
  depth: 3,
  transparency: 0.2,

  waves: {
    height: 0.05,
    speed: 0.1,
  },

  reflections: true,
  reflectionStrength: 0.3,

  particles: {
    enabled: true,
    type: 'debris',
    count: 200,
  },

  fog: {
    enabled: true,
    height: 2,
    density: 0.05,
  },
};
```

## Configuration Options

```typescript
interface WaterPresetOptions {
  // Colors
  color: string;
  shallowColor?: string;
  deepColor?: string;

  // Depth and clarity
  depth: number;
  transparency: number;

  // Waves
  waves?: {
    height: number;
    length: number;
    speed: number;
    directions?: [number, number][];
    type?: 'sine' | 'gerstner' | 'fft';
  };

  // Flow (for rivers)
  flow?: {
    enabled: boolean;
    speed: number;
    direction: [number, number, number];
    turbulence?: number;
  };

  // Effects
  reflections?: boolean;
  reflectionStrength?: number;
  refraction?: boolean;
  caustics?: boolean;
  causticsIntensity?: number;
  foam?: boolean;
  foamThreshold?: number;
}
```

## Using with Components

```tsx
import { Water, AdvancedWater } from '@strata-game-library/core';
import { WaterPresets } from '@strata-game-library/presets/water';

function Scene() {
  return (
    <>
      {/* Simple water */}
      <Water {...WaterPresets.LAKE} size={200} />

      {/* Advanced water with all effects */}
      <AdvancedWater {...WaterPresets.TROPICAL_OCEAN} size={500} />
    </>
  );
}
```

## Related

- [Water System](/core/water/) - Full water documentation
- [Water Shaders](/shaders/water/) - Shader details
