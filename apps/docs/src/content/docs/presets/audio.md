---
title: Audio Presets
description: Pre-configured audio settings for ambient and spatial sound
---

# Audio Presets

Ready-to-use audio configurations for immersive soundscapes.

## Quick Start

```typescript
import { createAudioPreset, AudioPresets } from '@strata-game-library/presets/audio';

<AudioSystem {...AudioPresets.FOREST} />
```

## Available Presets

| Preset | Description | Sounds |
|--------|-------------|--------|
| `FOREST` | Woodland ambience | Birds, wind, rustling |
| `OCEAN` | Beach/sea sounds | Waves, gulls, wind |
| `RAIN` | Rainy atmosphere | Rain, thunder, drips |
| `CAVE` | Underground | Drips, echoes |
| `CITY` | Urban environment | Traffic, crowds |
| `SPACE` | Sci-fi ambient | Hums, bleeps |

## Preset Examples

### Forest

```typescript
AudioPresets.FOREST = {
  ambience: {
    tracks: ['forest_ambience', 'wind_light'],
    volume: 0.4,
    crossfade: 2,
  },

  sounds: {
    birds: {
      sounds: ['bird_chirp_1', 'bird_chirp_2', 'bird_call'],
      interval: [3, 10],
      volume: [0.2, 0.4],
      spatial: true,
      radius: 50,
    },
    rustling: {
      sounds: ['leaves_rustle'],
      trigger: 'wind',
      volume: 0.3,
    },
  },

  reverb: {
    type: 'outdoor',
    decay: 1.5,
    wetMix: 0.2,
  },
};
```

### Ocean

```typescript
AudioPresets.OCEAN = {
  ambience: {
    tracks: ['ocean_waves', 'seashore'],
    volume: 0.5,
  },

  sounds: {
    waves: {
      sounds: ['wave_crash_1', 'wave_crash_2'],
      interval: [5, 15],
      volume: [0.3, 0.6],
    },
    seagulls: {
      sounds: ['seagull_call'],
      interval: [10, 30],
      volume: 0.3,
      spatial: true,
    },
  },

  reverb: {
    type: 'outdoor_open',
    decay: 2,
    wetMix: 0.15,
  },
};
```

## Using with Components

```tsx
import { AudioSystem, SpatialSound } from '@strata-game-library/core';
import { AudioPresets } from '@strata-game-library/presets/audio';

<AudioSystem {...AudioPresets.FOREST}>
  <SpatialSound
    src="waterfall.mp3"
    position={[10, 0, 5]}
    volume={0.5}
    refDistance={5}
  />
</AudioSystem>
```

## Related

- [Weather Presets](/presets/weather/) - Weather audio
- [Vegetation](/core/vegetation/) - Wind sounds
