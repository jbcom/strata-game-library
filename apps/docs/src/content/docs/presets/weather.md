---
title: Weather Presets
description: Pre-configured weather effects including rain, snow, fog, and storms
---

# Weather Presets

Ready-to-use weather configurations for atmospheric effects.

## Quick Start

```typescript
import { createWeatherPreset, WeatherPresets } from '@strata-game-library/presets/weather';

// Use a preset directly
const rain = createWeatherPreset(WeatherPresets.RAIN);

// Apply to scene
<WeatherSystem {...rain} />
```

## Available Presets

| Preset | Description | Effects |
|--------|-------------|---------|
| `CLEAR` | Clear sky | No precipitation |
| `LIGHT_RAIN` | Gentle drizzle | Light particles, subtle fog |
| `RAIN` | Steady rain | Rain particles, puddles |
| `HEAVY_RAIN` | Downpour | Dense rain, reduced visibility |
| `THUNDERSTORM` | Storm | Lightning, thunder, heavy rain |
| `LIGHT_SNOW` | Light flurries | Sparse snowflakes |
| `SNOW` | Snowfall | Snow particles, accumulation |
| `BLIZZARD` | Heavy snow | Dense snow, wind, low visibility |
| `FOG` | Dense fog | Volumetric fog |
| `MIST` | Light mist | Subtle atmospheric haze |
| `OVERCAST` | Cloudy | Grey sky, no precipitation |
| `SANDSTORM` | Desert storm | Sand particles, wind |

## Preset Examples

### Rain

```typescript
WeatherPresets.RAIN = {
  precipitation: {
    type: 'rain',
    intensity: 0.6,
    particleCount: 5000,
    speed: 15,
    splash: true,
  },
  fog: {
    enabled: true,
    density: 0.01,
    color: '#8899aa',
  },
  clouds: {
    coverage: 0.8,
    type: 'stratus',
  },
  lighting: {
    ambient: 0.3,
    directional: 0.4,
  },
  audio: {
    rain: true,
    thunder: false,
  },
};
```

### Thunderstorm

```typescript
WeatherPresets.THUNDERSTORM = {
  precipitation: {
    type: 'rain',
    intensity: 1.0,
    particleCount: 10000,
    speed: 25,
    wind: [5, 0, 2],
    splash: true,
  },
  fog: {
    enabled: true,
    density: 0.03,
    color: '#445566',
  },
  clouds: {
    coverage: 1.0,
    type: 'cumulonimbus',
    darkness: 0.8,
  },
  lightning: {
    enabled: true,
    frequency: 0.1,
    intensity: 1.0,
    forkChance: 0.3,
  },
  wind: {
    speed: 8,
    gusts: true,
    gustIntensity: 0.5,
  },
  audio: {
    rain: true,
    thunder: true,
    wind: true,
  },
};
```

### Snow

```typescript
WeatherPresets.SNOW = {
  precipitation: {
    type: 'snow',
    intensity: 0.5,
    particleCount: 3000,
    speed: 2,
    flutter: 0.3,
    size: [0.02, 0.05],
  },
  fog: {
    enabled: true,
    density: 0.008,
    color: '#ddeeff',
  },
  clouds: {
    coverage: 0.9,
    type: 'stratus',
    color: '#cccccc',
  },
  accumulation: {
    enabled: true,
    rate: 0.01,
    maxDepth: 0.3,
  },
  temperature: -5,
};
```

## Weather Transitions

```typescript
import { transitionWeather } from '@strata-game-library/presets/weather';

// Smoothly transition between weather states
transitionWeather({
  from: WeatherPresets.CLEAR,
  to: WeatherPresets.RAIN,
  duration: 60, // seconds
  onProgress: (progress) => {
    console.log(`Transition: ${progress * 100}%`);
  },
});
```

## Configuration Options

```typescript
interface WeatherPresetOptions {
  // Precipitation
  precipitation?: {
    type: 'rain' | 'snow' | 'hail' | 'sleet';
    intensity: number;
    particleCount: number;
    speed: number;
    wind?: [number, number, number];
  };

  // Fog
  fog?: {
    enabled: boolean;
    density: number;
    color: string;
    heightFalloff?: number;
  };

  // Clouds
  clouds?: {
    coverage: number;
    type: 'cumulus' | 'stratus' | 'cirrus' | 'cumulonimbus';
    altitude?: number;
  };

  // Lightning
  lightning?: {
    enabled: boolean;
    frequency: number;
    intensity: number;
  };

  // Wind
  wind?: {
    speed: number;
    direction: [number, number, number];
    gusts?: boolean;
  };

  // Audio
  audio?: {
    rain?: boolean;
    thunder?: boolean;
    wind?: boolean;
  };
}
```

## Using with Components

```tsx
import { WeatherSystem } from '@strata-game-library/core';
import { WeatherPresets } from '@strata-game-library/presets/weather';

function Scene() {
  const [weather, setWeather] = useState(WeatherPresets.CLEAR);

  return (
    <>
      <WeatherSystem {...weather} />
      <button onClick={() => setWeather(WeatherPresets.RAIN)}>
        Start Rain
      </button>
    </>
  );
}
```

## Related

- [Volumetrics](/core/volumetrics/) - Fog effects
- [Sky System](/core/sky/) - Sky and clouds
- [Cloud Presets](/presets/clouds/) - Cloud configurations
