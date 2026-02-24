---
title: Cloud Presets
description: Pre-configured cloud settings for different sky conditions
---

# Cloud Presets

Ready-to-use cloud configurations for various atmospheric conditions.

## Quick Start

```typescript
import { createCloudPreset, CloudPresets } from '@strata-game-library/presets/clouds';

<Clouds {...CloudPresets.CUMULUS} />
```

## Available Presets

| Preset | Description | Visual |
|--------|-------------|--------|
| `CLEAR` | No clouds | Blue sky |
| `SCATTERED` | Few clouds | Sparse cumulus |
| `CUMULUS` | Puffy clouds | Classic fair weather |
| `STRATUS` | Layer clouds | Overcast layer |
| `CIRRUS` | Wispy clouds | High altitude |
| `CUMULONIMBUS` | Storm clouds | Towering, dark |
| `SUNSET` | Golden clouds | Warm colors |
| `DRAMATIC` | Dynamic sky | Varied types |

## Preset Examples

### Cumulus

```typescript
CloudPresets.CUMULUS = {
  type: 'volumetric',
  coverage: 0.4,
  density: 0.05,

  altitude: {
    min: 1000,
    max: 3000,
  },

  color: '#ffffff',
  shadowColor: '#aabbcc',

  animation: {
    speed: 0.01,
    direction: [1, 0, 0.2],
  },

  lighting: {
    scattering: 0.6,
    ambient: 0.3,
  },
};
```

### Stormy

```typescript
CloudPresets.CUMULONIMBUS = {
  type: 'volumetric',
  coverage: 0.9,
  density: 0.15,

  altitude: {
    min: 500,
    max: 8000,
  },

  color: '#888888',
  shadowColor: '#334455',

  animation: {
    speed: 0.03,
    turbulence: 0.4,
  },

  lightning: {
    enabled: true,
    frequency: 0.05,
  },
};
```

## Using with Components

```tsx
import { Clouds, ProceduralSky } from '@strata-game-library/core';
import { CloudPresets, SkyPresets } from '@strata-game-library/presets';

<ProceduralSky {...SkyPresets.AFTERNOON} />
<Clouds {...CloudPresets.CUMULUS} />
```

## Related

- [Sky System](/core/sky/) - Full sky documentation
- [Cloud Shaders](/shaders/clouds/) - Shader details
- [Weather Presets](/presets/weather/) - Weather systems
