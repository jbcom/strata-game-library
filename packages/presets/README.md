# @strata-game-library/presets

[![npm version](https://img.shields.io/npm/v/@strata-game-library/presets)](https://www.npmjs.com/package/@strata-game-library/presets)
[![license](https://img.shields.io/npm/l/@strata-game-library/presets)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

Pre-configured presets for Strata 3D -- ready-to-use terrain, weather, physics, and gameplay settings.

## Installation

```bash
pnpm add @strata-game-library/presets
```

Peer dependencies:

```bash
pnpm add @react-three/fiber @strata-game-library/core react three
```

## Quick Start

```tsx
import { Canvas } from '@react-three/fiber';
import { Terrain, Water } from '@strata-game-library/core/components';
import { TerrainPresets } from '@strata-game-library/presets/terrain';
import { WaterPresets } from '@strata-game-library/presets/water';

function Scene() {
  return (
    <Canvas>
      <Terrain preset={TerrainPresets.ALPINE} />
      <Water preset={WaterPresets.OCEAN} />
    </Canvas>
  );
}
```

## Features

30+ preset categories covering every aspect of a 3D scene:

- **Terrain** -- Alpine, desert, volcanic, island, and more biome presets
- **Weather** -- Rain, snow, fog, storms, and clear sky configurations
- **Water** -- Ocean, river, lake, swamp, and waterfall presets
- **Vegetation** -- Forest, grassland, jungle, and tundra flora
- **Clouds** -- Cumulus, stratus, storm clouds, and fog layers
- **Camera** -- Third-person, first-person, orbit, and cinematic rigs
- **Animation** -- Walk cycles, idle, combat, and transition presets
- **Physics** -- Material friction, gravity, and collision profiles
- **Audio** -- Ambient soundscapes, music layers, and SFX profiles
- **Creatures** -- Animal behavior, movement, and stat templates
- **Particles** -- Fire, smoke, dust, magic, and weather effects
- **Post-processing** -- Bloom, depth-of-field, color grading, and vignette
- **Lighting** -- Time-of-day, indoor, and dramatic lighting setups
- **UI** -- HUD layouts, menus, and dialog presets
- **Structures** -- Buildings, bridges, and architectural templates
- **Vehicles** -- Cars, boats, and aircraft handling presets

## Exports

| Path | Contents |
|------|----------|
| `@strata-game-library/presets` | All presets |
| `@strata-game-library/presets/terrain` | Terrain biome presets |
| `@strata-game-library/presets/weather` | Weather presets |
| `@strata-game-library/presets/water` | Water body presets |
| `@strata-game-library/presets/vegetation` | Flora and vegetation presets |
| `@strata-game-library/presets/clouds` | Cloud type presets |
| `@strata-game-library/presets/camera` | Camera rig presets |
| `@strata-game-library/presets/physics` | Physics material presets |
| `@strata-game-library/presets/creatures` | Creature and AI presets |
| `@strata-game-library/presets/particles` | Particle effect presets |

## Documentation

Full preset catalog and customization guide: [https://strata.game/presets/](https://strata.game/presets/)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
