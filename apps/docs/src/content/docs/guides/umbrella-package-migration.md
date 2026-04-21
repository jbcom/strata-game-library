---
title: Umbrella Package Migration
description: Move from scoped Strata packages to the strata-game-library umbrella package
---

# Umbrella Package Migration

`strata-game-library` is the new default package for Strata. It provides one install target with a runtime-light root export and explicit subpaths for adapters, plugins, shaders, presets, and platform integrations.

The first npm publish of `strata-game-library` is still pending. Until it is available on npm, keep using the scoped packages shown in the fallback examples below.

## New Default Install

After the umbrella package is published:

```bash
pnpm add strata-game-library @react-three/fiber @react-three/drei three
```

Fallback while the umbrella package is pending first publish:

```bash
pnpm add @strata-game-library/core @strata-game-library/r3f @react-three/fiber @react-three/drei three
```

## Import Mapping

| Old import | New umbrella import |
|------------|---------------------|
| `@strata-game-library/core` | `strata-game-library/core` or `strata-game-library` for high-level game helpers |
| `@strata-game-library/core/game` | `strata-game-library/game` |
| `@strata-game-library/core/compose` | `strata-game-library/compose` |
| `@strata-game-library/core/world` | `strata-game-library/world` |
| `@strata-game-library/core/utils` | `strata-game-library/utils` |
| `@strata-game-library/shaders` | `strata-game-library/shaders` |
| `@strata-game-library/presets` | `strata-game-library/presets` |
| `@strata-game-library/r3f` | `strata-game-library/r3f` |
| `@strata-game-library/r3f/components` | `strata-game-library/components` |
| `@strata-game-library/r3f/hooks` | `strata-game-library/hooks` |
| `@strata-game-library/audio-synth` | `strata-game-library/audio-synth` |
| `@strata-game-library/model-synth` | `strata-game-library/model-synth` |
| `@strata-game-library/capacitor` | `strata-game-library/capacitor` |
| `@strata-game-library/react-native` | `strata-game-library/react-native` |
| `@strata-game-library/reactylon` | `strata-game-library/reactylon` |
| `@strata-game-library/astro` | `strata-game-library/astro` |

## Example Migration

Before:

```tsx
import { createRPGGame } from '@strata-game-library/core/game';
import { ProceduralSky, StrataGame, Water } from '@strata-game-library/r3f';
```

After:

```tsx
import { createRPGGame } from 'strata-game-library';
import { ProceduralSky, StrataGame, Water } from 'strata-game-library/r3f';
```

The umbrella root is intentionally small. Renderer, mobile, audio, model generation, and Astro integrations stay behind explicit subpaths so optional peer dependencies are only relevant when you import those surfaces.

## Scoped Packages Still Work

The scoped packages are not being removed in this consolidation cycle. They remain supported direct entrypoints for smaller installs and advanced consumers:

- `@strata-game-library/core`
- `@strata-game-library/shaders`
- `@strata-game-library/presets`
- `@strata-game-library/r3f`
- `@strata-game-library/reactylon`
- `@strata-game-library/audio-synth`
- `@strata-game-library/model-synth`
- `@strata-game-library/capacitor`
- `@strata-game-library/react-native`
- `@strata-game-library/astro`

Use the umbrella package for new app documentation and examples. Use direct scoped packages when you intentionally want separate package versioning or minimal dependency surfaces.

## Mobile Package Rename

The old mobile package names are legacy names:

| Legacy name | Replacement |
|-------------|-------------|
| `@strata-game-library/capacitor-plugin` | `@strata-game-library/capacitor` or `strata-game-library/capacitor` |
| `@strata-game-library/react-native-plugin` | `@strata-game-library/react-native` or `strata-game-library/react-native` |

The legacy names should only be deprecated after the renamed packages are published and verified.

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

## Publish Readiness

The source package, subpath exports, local builds, tests, and release-please metadata now exist. The remaining publish-side work is operational:

1. Verify npm trusted publishing for `strata-game-library`.
2. Publish the first umbrella release from a GitHub Release.
3. Confirm `npm view strata-game-library` resolves the published version.
4. Verify renamed mobile package publishes before deprecating legacy `-plugin` names.
