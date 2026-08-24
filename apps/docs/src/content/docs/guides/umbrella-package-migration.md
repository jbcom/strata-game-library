---
title: Umbrella Package Migration
description: Move from scoped Strata packages to the strata-game-library umbrella package
---

# Umbrella Package Migration

`strata-game-library` is Strata's only public npm package. Starting with 0.3.0, the former `@strata-game-library/*` packages are private implementation packages and are no longer supported as direct npm dependencies.

## New Default Install

```bash
pnpm add strata-game-library @react-three/fiber @react-three/drei three
```

## Import Mapping

| Old import | New umbrella import |
|------------|---------------------|
| `@strata-game-library/core` | `strata-game-library/core` or `strata-game-library` for high-level game helpers |
| `@strata-game-library/game` | `strata-game-library/game` |
| `@strata-game-library/compose` | `strata-game-library/compose` |
| `@strata-game-library/world` | `strata-game-library/world` |
| `@strata-game-library/utils` | `strata-game-library/utils` |
| `@strata-game-library/shaders` | `strata-game-library/shaders` |
| `@strata-game-library/presets` | `strata-game-library/presets` |
| `@strata-game-library/r3f` | `strata-game-library/r3f` |
| `@strata-game-library/components` | `strata-game-library/components` |
| `@strata-game-library/hooks` | `strata-game-library/hooks` |
| `@strata-game-library/audio-synth` | `strata-game-library/audio-synth` |
| `@strata-game-library/model-synth` | `strata-game-library/model-synth` |
| `@strata-game-library/capacitor` | `strata-game-library/capacitor` |
| `@strata-game-library/react-native` | `strata-game-library/react-native` |
| `@strata-game-library/reactylon` | `strata-game-library/reactylon` |
| `@strata-game-library/astro` | `strata-game-library/astro` |

## Example Migration

Before:

```tsx
import { createRPGGame } from '@strata-game-library/game';
import { ProceduralSky, StrataGame, Water } from '@strata-game-library/r3f';
```

After:

```tsx
import { createRPGGame } from 'strata-game-library';
import { ProceduralSky, StrataGame, Water } from 'strata-game-library/r3f';
```

The umbrella root is intentionally small. Renderer, mobile, audio, model generation, and Astro integrations stay behind explicit subpaths so optional peer dependencies are only relevant when you import those surfaces.

## Mobile Package Rename

The old mobile package names are legacy names:

| Legacy name | Replacement |
|-------------|-------------|
| `@strata-game-library/capacitor-plugin` | `strata-game-library/capacitor` |
| `@strata-game-library/react-native-plugin` | `strata-game-library/react-native` |

The legacy package names are not published by this release.

## Peer Dependencies

Install the peer dependencies for the subpaths you use:

```bash
pnpm add strata-game-library three
pnpm add @react-three/fiber @react-three/drei
```

Add optional peers as needed:

```bash
pnpm add tone                         # audio-synth
pnpm add @babylonjs/core reactylon    # reactylon
pnpm add react-native                 # react-native
pnpm add astro                        # astro integration
```

## Release Model

GitHub Releases publish only `strata-game-library` through npm trusted publishing. Verify the released version with `npm view strata-game-library` after the release completes.
