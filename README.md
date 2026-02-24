# Strata Game Library

[![CI](https://github.com/jbcom/strata-game-library/actions/workflows/ci.yml/badge.svg)](https://github.com/jbcom/strata-game-library/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

**Layer by Layer, World by World.** The complete game framework for building procedural 3D worlds in React Three Fiber.

Terrain, water, vegetation, sky, physics, AI, animation, audio -- everything you need to ship immersive games and experiences.

**[Documentation](https://strata.game)** | **[Live Demos](https://strata.game/showcase/)** | **[Getting Started](https://strata.game/getting-started/)**

## Quick Start

```bash
pnpm add @strata-game-library/core @react-three/fiber @react-three/drei three
```

```tsx
import { Canvas } from '@react-three/fiber';
import { ProceduralSky, Water, GrassInstances, VolumetricFogMesh } from '@strata-game-library/core';

function Game() {
  return (
    <Canvas camera={{ position: [0, 10, 20] }}>
      <ProceduralSky sunPosition={[100, 50, 100]} />
      <Water size={200} depth={20} />
      <GrassInstances count={10000} spread={100} />
      <VolumetricFogMesh density={0.02} />
    </Canvas>
  );
}
```

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`@strata-game-library/core`](packages/core) | [![npm](https://img.shields.io/npm/v/@strata-game-library/core)](https://www.npmjs.com/package/@strata-game-library/core) | R3F components, ECS, physics, AI, animation, audio |
| [`@strata-game-library/shaders`](packages/shaders) | [![npm](https://img.shields.io/npm/v/@strata-game-library/shaders)](https://www.npmjs.com/package/@strata-game-library/shaders) | Standalone GLSL shaders for Three.js |
| [`@strata-game-library/presets`](packages/presets) | [![npm](https://img.shields.io/npm/v/@strata-game-library/presets)](https://www.npmjs.com/package/@strata-game-library/presets) | Production-ready configurations (30+ categories) |
| [`@strata-game-library/audio-synth`](plugins/audio-synth) | [![npm](https://img.shields.io/npm/v/@strata-game-library/audio-synth)](https://www.npmjs.com/package/@strata-game-library/audio-synth) | Procedural audio synthesis with Tone.js |
| [`@strata-game-library/model-synth`](plugins/model-synth) | [![npm](https://img.shields.io/npm/v/@strata-game-library/model-synth)](https://www.npmjs.com/package/@strata-game-library/model-synth) | AI-powered 3D model generation |
| [`@strata-game-library/capacitor`](plugins/capacitor) | [![npm](https://img.shields.io/npm/v/@strata-game-library/capacitor)](https://www.npmjs.com/package/@strata-game-library/capacitor) | Native mobile integration via Capacitor |
| [`@strata-game-library/react-native`](plugins/react-native) | [![npm](https://img.shields.io/npm/v/@strata-game-library/react-native)](https://www.npmjs.com/package/@strata-game-library/react-native) | React Native bridge |

## Architecture

Strata is built in layers -- each one building on the last:

```text
Layer 4  Presets & Game Framework     createGame(), scenes, modes, AI behaviors
Layer 3  React Three Fiber Components Terrain, Water, Sky, Vegetation, Characters
Layer 2  Core Algorithms              SDF, Noise, Marching Cubes, Pathfinding, ECS
Layer 1  GLSL Shaders                 Terrain, water, sky, volumetrics, materials
Layer 0  TypeScript Types & Utilities Type-safe foundation for everything above
```

Every layer is independently usable. Import just the shaders, or use the full framework.

## Features

- **Procedural Terrain** -- SDF-based generation with marching cubes, biome blending, erosion, triplanar texturing
- **Advanced Water** -- Gerstner waves, Fresnel reflections, caustics, foam, depth transparency
- **GPU Vegetation** -- 10,000+ instanced grass, trees, rocks at 60fps with wind animation
- **Procedural Sky** -- Atmospheric scattering, day/night cycles, stars, volumetric clouds
- **Volumetric Effects** -- God rays, fog, underwater overlays, particles
- **Entity Component System** -- Miniplex-based ECS for game logic
- **Physics** -- Rapier integration with rigid bodies, constraints, raycasting
- **AI & Pathfinding** -- Graph-based navigation, Yuka behaviors
- **Animation** -- Skeletal, procedural, IK solving, blend trees
- **Audio** -- Spatial audio, sound management, procedural synthesis
- **State Management** -- XState + Zustand with undo/redo

## Development

```bash
pnpm install          # Install dependencies
pnpm run build        # Build all packages
pnpm run test         # Run all tests
pnpm run lint         # Lint with Biome
pnpm run typecheck    # TypeScript type checking
```

## Monorepo Structure

```text
strata/
  packages/
    core/              # Main library (R3F components, systems)
    shaders/           # Standalone GLSL shaders
    presets/            # Configuration presets
  plugins/
    audio-synth/       # Audio synthesis
    model-synth/       # AI model generation
    capacitor/         # Capacitor mobile plugin
    react-native/      # React Native bridge
  adapters/            # Renderer adapters (future)
  apps/
    docs/              # Documentation site (strata.game)
    examples/          # Example projects
```

## Contributing

See the [Contributing Guide](https://strata.game/guides/contributing/) for development setup, PR process, and coding standards.

## License

MIT -- see [LICENSE](LICENSE) for details.

## Part of jbcom

Strata is the Games & Procedural division of the [jbcom enterprise](https://jbcom.github.io), building alongside [Agentic](https://agentic.dev) (AI) and [Extended Data](https://extendeddata.dev) (Infrastructure).
