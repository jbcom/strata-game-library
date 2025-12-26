# Strata 2.0 Migration Guide

This guide covers migrating from `@jbcom/strata` v1.x to `@strata/core` v2.0.

## Package Changes

### npm Package Names

| v1.x | v2.0 |
|------|------|
| `@jbcom/strata` | `@strata/core` |
| `@jbcom/strata-shaders` | `@strata/shaders` |
| `@jbcom/strata-presets` | `@strata/presets` |

### Installation

```bash
# v1.x
pnpm add @jbcom/strata

# v2.0
pnpm add @strata/core

# Optional packages
pnpm add @strata/shaders @strata/presets
```

## Import Changes

### Basic Imports

```typescript
// v1.x
import { Terrain, Water, ProceduralSky } from '@jbcom/strata';

// v2.0
import { Terrain, Water, ProceduralSky } from '@strata/core';
```

### Subpath Imports

```typescript
// v1.x
import { FlockPreset } from '@jbcom/strata/presets';
import { waterFragmentShader } from '@jbcom/strata/shaders';

// v2.0
import { FlockPreset } from '@strata/presets';
import { waterFragmentShader } from '@strata/shaders';
```

## API Changes

### Core Class Renames

Several core classes have been renamed to avoid conflicts with React components:

| v1.x | v2.0 | Notes |
|------|------|-------|
| `ParticleEmitter` | `ParticleEmitterCore` | Use factory `createParticleEmitter()` |
| `CameraShake` | `CameraShakeCore` | Direct instantiation |
| `WeatherSystem` | `WeatherSystemCore` | Use factory `createWeatherSystem()` |

The old names are still available as deprecated aliases in v1.4.x but will be removed in v2.0.

```typescript
// v1.x (deprecated)
import { ParticleEmitter, CameraShake, WeatherSystem } from '@jbcom/strata';

// v2.0 (recommended)
import { ParticleEmitterCore, CameraShakeCore, WeatherSystemCore } from '@strata/core';

// Or use factories (works in both versions)
import { createParticleEmitter, createWeatherSystem } from '@strata/core';
```

### Type Imports

Types should now be imported from the main package, not from presets:

```typescript
// v1.x (deprecated)
import { MarchingCubesOptions } from '@jbcom/strata/presets/terrain';
import { InstanceData } from '@jbcom/strata/presets/vegetation';

// v2.0 (recommended)
import type { MarchingCubesOptions, InstanceData } from '@strata/core';
```

## Optional Package Detection

v2.0 introduces transparent folding - optional packages are automatically detected and re-exported:

```typescript
import { getOptionalPackagesStatus } from '@strata/core';

// Check what's installed
const status = await getOptionalPackagesStatus();
console.log(status);
// [
//   { name: '@strata/shaders', available: true, version: '1.0.0' },
//   { name: '@strata/presets', available: false }
// ]
```

## New Features in v2.0

### Game Orchestration

```typescript
import { SceneManager, ModeManager, TriggerSystem } from '@strata/core';

const sceneManager = new SceneManager();
sceneManager.register('forest', ForestScene);
sceneManager.register('village', VillageScene);
sceneManager.transition('forest');
```

### World Topology

```typescript
import { WorldGraph, createRegion } from '@strata/core';

const world = new WorldGraph();
world.addRegion(createRegion('forest', { biome: 'temperate' }));
world.addRegion(createRegion('village', { biome: 'settlement' }));
world.connect('forest', 'village', { traversable: true });
```

### Compositional Objects

```typescript
import { createCreature, createFurMaterial } from '@strata/core';

const otter = createCreature({
  skeleton: 'quadruped_medium',
  covering: {
    regions: {
      '*': { material: createFurMaterial('brown', { length: 0.03 }) }
    }
  },
  ai: 'prey',
  stats: { health: 50, speed: 8 }
});
```

## Breaking Changes Summary

1. **Package name**: `@jbcom/strata` → `@strata/core`
2. **Core class names**: `*` → `*Core` suffix
3. **Type imports**: Must use main package, not presets
4. **Minimum Three.js**: Upgraded to 0.182.0
5. **Minimum React**: Upgraded to 19.0.0

## Automated Migration

A codemod is available to automate most changes:

```bash
npx @strata/codemod migrate-v2 ./src
```

This will:
- Update import paths
- Rename deprecated classes
- Update type imports

## Support

- [Migration Issues](https://github.com/strata-game-library/core/issues?q=label:migration)
- [Discord Community](https://discord.gg/strata)
- [GitHub Discussions](https://github.com/strata-game-library/core/discussions)
