---
title: Presets
description: Production-ready configurations for Strata features
---

# Presets

The `@strata-game-library/presets` package provides production-ready configurations for all Strata features. Use presets to quickly set up terrain biomes, weather systems, water types, vegetation patterns, and more.

## Installation

```bash
pnpm add @strata-game-library/presets
```

## Quick Start

```tsx
import { TerrainPresets, WaterPresets } from '@strata-game-library/presets';

<Terrain preset={TerrainPresets.Alpine} />
<Water preset={WaterPresets.CalmOcean} />
```

## Available Presets

### Terrain Biomes

Pre-configured terrain generation for different environments.

- [Terrain Presets](/presets/terrain/) — Alpine, desert, tropical, tundra, volcanic

### Weather Systems

Dynamic weather configuration with wind, rain, snow, and fog.

- [Weather Presets](/presets/weather/) — Clear, overcast, rain, thunderstorm, snow, fog

### Water Types

Water rendering configurations for different bodies of water.

- [Water Presets](/presets/water/) — Calm ocean, rough sea, river, lake, swamp

### Vegetation

Vegetation distribution and appearance for different biomes.

- [Vegetation Presets](/presets/vegetation/) — Forest, grassland, savanna, jungle, tundra

### Clouds

Volumetric cloud configurations for different weather and altitudes.

- [Cloud Presets](/presets/clouds/) — Cumulus, stratus, cirrus, storm clouds

### Camera

Camera behavior presets for different game modes.

- [Camera Presets](/presets/camera/) — Follow, orbit, first-person, cinematic

### Animation

Character and object animation presets.

- [Animation Presets](/presets/animation/) — Walk cycles, idle, combat, swimming

### Physics

Physics simulation presets for different environments.

- [Physics Presets](/presets/physics/) — Earth gravity, low gravity, underwater, zero-G

### Audio

Audio settings for different environments and moods.

- [Audio Presets](/presets/audio/) — Forest ambience, cave echo, underwater, wind

## Combining Presets

Presets can be combined and customized:

```tsx
import { TerrainPresets, WaterPresets, WeatherPresets } from '@strata-game-library/presets';

// Use a preset as a base and override specific values
<Terrain
  preset={TerrainPresets.Alpine}
  resolution={128}       // Override resolution
  erosion={true}         // Enable erosion
/>

// Combine multiple presets for a complete scene
<Weather preset={WeatherPresets.LightRain} />
<Water preset={WaterPresets.RoughSea} />
```

## Full API Reference

See the [detailed TypeDoc documentation](/packages/presets/) for all preset definitions and types.
