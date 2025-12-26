# Strata Package Decomposition Strategy

## Overview

This document outlines the strategy for decomposing the Strata library into modular, optional companion packages within the `strata` GitHub organization while maintaining a seamless developer experience.

## Goals

1. **Reduced Bundle Size** - Allow consumers to import only what they need
2. **Independent Versioning** - Presets and shaders can be updated independently
3. **Community Extensibility** - Third-party presets without modifying core
4. **Zero-Config for Beginners** - Main package works out of the box
5. **Transparent Folding** - Optional packages integrate seamlessly when installed

## Organization Structure

All packages live under the `strata-game-library` GitHub organization:

| Package | Repository | npm Package |
|---------|------------|-------------|
| Core | `strata-game-library/core` | `@strata/core` |
| Shaders | `strata-game-library/shaders` | `@strata/shaders` |
| Presets | `strata-game-library/presets` | `@strata/presets` |
| Examples | `strata-game-library/examples` | (not published) |

## Package Architecture

### Core Package: `@strata/core`

The main package remains the primary entry point, containing:

```
@strata/core
├── src/core/           # Pure TypeScript utilities (math, SDF, ECS, etc.)
├── src/components/     # React Three Fiber components
├── src/compose/        # Compositional object system
├── src/game/           # Game orchestration layer
├── src/world/          # World topology system
├── src/hooks/          # React hooks
├── src/api/            # High-level API
└── src/utils/          # Utilities
```

**Exports:**
- `@strata/core` - Main entry (core + game + world + compose)
- `@strata/core/components` - React components
- `@strata/core/api` - High-level API
- `@strata/core/game` - Game orchestration

### Optional Package: `@strata/shaders`

**Repository:** `strata-game-library/shaders`

Pure GLSL shader strings with zero dependencies on strata core.

```
@strata/shaders
├── src/
│   ├── clouds.ts       # Cloud shaders
│   ├── fur.ts          # Fur/shell shaders
│   ├── godRays.ts      # God rays shaders
│   ├── sky.ts          # Procedural sky shaders
│   ├── terrain.ts      # Terrain shaders
│   ├── volumetrics.ts  # Volumetric effect shaders
│   ├── water.ts        # Water shaders
│   └── materials/      # Material shaders (toon, hologram, etc.)
└── package.json
```

**Usage:**

```typescript
// Standalone (without strata)
import { waterFragmentShader, waterVertexShader } from '@strata/shaders';

// With strata (auto-detected)
import { waterFragmentShader } from '@strata/core/shaders';
```

### Optional Package: `@strata/presets`

**Repository:** `strata/presets`

Pre-configured settings that depend on `@strata/core` from npm.

```
@strata/presets
├── src/
│   ├── ai/             # AI behavior presets (guard, flock, predator, prey)
│   ├── animation/      # Animation presets
│   ├── audio/          # Audio presets
│   ├── camera/         # Camera presets
│   ├── characters/     # Character presets
│   ├── clouds/         # Cloud presets
│   ├── fur/            # Fur presets
│   ├── lighting/       # Lighting presets
│   ├── particles/      # Particle effect presets
│   ├── physics/        # Physics presets
│   ├── postprocessing/ # Post-processing presets
│   ├── terrain/        # Terrain presets
│   ├── vegetation/     # Vegetation presets
│   ├── water/          # Water presets
│   └── weather/        # Weather presets
└── package.json
```

**Dependencies:**

```json
{
  "peerDependencies": {
    "@strata/core": "^2.0.0"
  }
}
```

## Transparent Folding Mechanism

The core package will detect and re-export optional packages when installed:

### Implementation

```typescript
// src/optional/loader.ts

/**
 * Dynamically loads optional packages if available
 */
export function loadOptionalPackage<T>(packageName: string): T | null {
  try {
    return require(packageName);
  } catch {
    return null;
  }
}

// src/shaders/index.ts
export * from './clouds';
export * from './water';
// ... local shaders

// Also re-export from optional package if installed
const optionalShaders = loadOptionalPackage('@strata/shaders');
if (optionalShaders) {
  Object.assign(module.exports, optionalShaders);
}
```

### For Presets

```typescript
// src/presets/index.ts
export * from './ai';
export * from './animation';
// ... local presets

// Also re-export from optional package if installed
const optionalPresets = loadOptionalPackage('@strata/presets');
if (optionalPresets) {
  Object.assign(module.exports, optionalPresets);
}
```

## Migration Path

### Phase 1: Prepare Core (Current)

1. ✅ Remove type re-exports from presets modules (Issue #85)
2. ✅ Add deprecation notices for direct preset type imports
3. [ ] Add `inlineSources: true` to tsconfig.json ✅
4. [ ] Create package.json exports map

### Phase 2: Create Companion Repositories

1. [ ] Create `strata-game-library/shaders` repository
   - Copy `src/shaders/` contents
   - Create independent package.json with zero dependencies
   - Set up CI/CD for independent releases

2. [ ] Create `strata-game-library/presets` repository
   - Copy `src/presets/` contents
   - Create package.json with `@strata/core` peer dependency
   - Set up CI/CD for independent releases

### Phase 3: Implement Transparent Folding

1. [ ] Add optional package detection to core
2. [ ] Ensure imports work identically with/without optional packages
3. [ ] Add documentation for both usage patterns

### Phase 4: Deprecation & Removal (v2.0)

1. [ ] Deprecate direct shader/preset imports from core in v1.5
2. [ ] Remove bundled shaders/presets from core in v2.0
3. [ ] Update all documentation

## Bundle Size Analysis

| Configuration | Estimated Size |
|--------------|----------------|
| `@strata/core` (current) | ~350KB |
| `@strata/core` (minimal) | ~200KB |
| `@strata/shaders` | ~80KB |
| `@strata/presets` | ~100KB |

## Import Patterns

### Before (v1.x - @jbcom/strata)

```typescript
// Everything from main package
import { 
  Terrain, Water, createFireEffect, 
  waterFragmentShader, vegetationPresets 
} from '@jbcom/strata';
```

### After (v2.0 - @strata/*)

```typescript
// Core functionality
import { Terrain, Water } from '@strata/core';

// Shaders (optional package)
import { waterFragmentShader } from '@strata/shaders';

// Presets (optional package)
import { createFireEffect, vegetationPresets } from '@strata/presets';

// OR if optional packages are installed, still works from core:
import { waterFragmentShader, createFireEffect } from '@strata/core';
```

## TypeScript Configuration

Each package needs proper TypeScript configuration for source maps and declarations:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "inlineSources": true,
    "outDir": "./dist",
    "strict": true
  }
}
```

## Related Issues

- [#85](https://github.com/jbcom/nodejs-strata/issues/85) - Remove type re-exports from presets
- [#86](https://github.com/jbcom/nodejs-strata/issues/86) - Rename conflicting core exports
- [#87](https://github.com/jbcom/nodejs-strata/issues/87) - Create Strata 2.0 Migration Guide
- [#89](https://github.com/jbcom/nodejs-strata/issues/89) - Extract presets and shaders to standalone packages

## Migration from @jbcom/strata to @strata/*

When v2.0 releases, the package will migrate from `@jbcom/strata` to the `@strata` organization:

| v1.x (current) | v2.0 (future) |
|----------------|---------------|
| `@jbcom/strata` | `@strata/core` |
| `@jbcom/strata/shaders` | `@strata/shaders` |
| `@jbcom/strata/presets` | `@strata/presets` |

## Success Criteria

- [ ] Optional packages can be installed independently
- [ ] Core package works without optional packages
- [ ] TypeScript types work correctly in all configurations
- [ ] Bundle size reduced by 40%+ for minimal installations
- [ ] No breaking changes for existing v1.x users
- [ ] Documentation covers all usage patterns
