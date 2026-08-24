# Strata Game Library

![A floating game world shown as geological layers: shaders, terrain, water, vegetation, and atmosphere](https://raw.githubusercontent.com/jbcom/strata-game-library/main/.github/assets/strata-hero.webp)

[![CI](https://github.com/jbcom/strata-game-library/actions/workflows/ci.yml/badge.svg)](https://github.com/jbcom/strata-game-library/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/strata-game-library)](https://www.npmjs.com/package/strata-game-library)
[![Node.js](https://img.shields.io/node/v/strata-game-library)](https://www.npmjs.com/package/strata-game-library)
[![License: MIT](https://img.shields.io/badge/license-MIT-2d9d78.svg)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)

Strata is a declarative TypeScript game framework for procedural worlds. Its pure core handles game definitions, state, input, persistence, composition, pathfinding, and procedural algorithms; optional adapters bring those capabilities to React Three Fiber, Babylon/Reactylon, and Pixi.

[Documentation](https://jonbogaty.com/strata-game-library/) · [Quick start](https://jonbogaty.com/strata-game-library/quickstart/) · [Packages](https://jonbogaty.com/strata-game-library/packages/) · [Contributing](https://jonbogaty.com/strata-game-library/contributing/)

## Install

Install the umbrella package and only the peers used by your renderer:

```bash
pnpm add strata-game-library react react-dom three \
  @react-three/fiber @react-three/drei
```

The same package works with npm, Yarn, and Bun. Node.js 22 or newer is supported; consumers are not required to use pnpm or Mise.

Focused packages remain available when a smaller dependency surface is preferable:

```bash
pnpm add @strata-game-library/core
pnpm add @strata-game-library/shaders three
pnpm add @strata-game-library/r3f react react-dom three @react-three/fiber
```

## Quick start

```tsx
import { createRPGGame } from 'strata-game-library';
import { ProceduralSky, StrataGame, Water } from 'strata-game-library/r3f';

const game = createRPGGame({
  name: 'River Crossing',
  version: '1.0.0',
  world: {
    regions: {
      meadow: { name: 'Meadow', center: [0, 0, 0], radius: 80 },
    },
    connections: [],
  },
  scenes: {
    meadow: {
      id: 'meadow',
      render: () => (
        <>
          <ProceduralSky sunPosition={[100, 50, 100]} />
          <Water size={200} depth={20} />
        </>
      ),
    },
  },
  initialScene: 'meadow',
  modes: { exploration: { systems: [] } },
  initialState: { currentRegion: 'meadow', player: { name: 'Scout' } },
});

export function App() {
  return <StrataGame game={game} />;
}
```

The root entry is renderer-independent. Renderer components and integrations use explicit subpaths such as `strata-game-library/r3f`, `/reactylon`, `/pixi`, `/astro`, `/capacitor`, and `/react-native`, so installing Strata does not eagerly load every optional framework.

## Packages

| Package | Purpose |
| --- | --- |
| [`strata-game-library`](https://www.npmjs.com/package/strata-game-library) | Single-install entrypoint with explicit adapter and plugin subpaths |
| [`@strata-game-library/core`](https://www.npmjs.com/package/@strata-game-library/core) | Pure TypeScript orchestration, state, input, persistence, ECS, AI, and procedural algorithms |
| [`@strata-game-library/shaders`](https://www.npmjs.com/package/@strata-game-library/shaders) | Standalone GLSL shader modules |
| [`@strata-game-library/presets`](https://www.npmjs.com/package/@strata-game-library/presets) | Reusable game, environment, character, and object presets |
| [`@strata-game-library/r3f`](https://www.npmjs.com/package/@strata-game-library/r3f) | React Three Fiber components and hooks |
| [`@strata-game-library/reactylon`](https://www.npmjs.com/package/@strata-game-library/reactylon) | Babylon.js integration through Reactylon |
| [`@strata-game-library/pixi`](https://www.npmjs.com/package/@strata-game-library/pixi) | Pixi 8 lifecycle and rendering utilities |
| [`@strata-game-library/audio-synth`](https://www.npmjs.com/package/@strata-game-library/audio-synth) | Procedural audio synthesis |
| [`@strata-game-library/model-synth`](https://www.npmjs.com/package/@strata-game-library/model-synth) | Optional model-generation client |
| [`@strata-game-library/capacitor`](https://www.npmjs.com/package/@strata-game-library/capacitor) | Capacitor mobile integration |
| [`@strata-game-library/react-native`](https://www.npmjs.com/package/@strata-game-library/react-native) | React Native bridge |
| [`@strata-game-library/astro`](https://www.npmjs.com/package/@strata-game-library/astro) | Astro integration and styles |
| [`@strata-game-library/vite`](https://www.npmjs.com/package/@strata-game-library/vite) | Shared Vite, Vitest, tsup, TypeScript, and Biome configuration |

## Architecture

```text
shaders ──▶ core ──▶ r3f ──▶ presets
                  ├─▶ reactylon
                  └─▶ pixi
```

`packages/core` is strict, renderer-independent TypeScript. React imports belong in `adapters/r3f`; Babylon and Pixi concerns remain in their own adapters. This boundary keeps algorithms portable and lets consumers choose their rendering stack.

## Development

Maintainers use [Mise](https://mise.jdx.dev/) locally so a fresh clone selects the latest stable Node.js and pnpm without placing a package-manager pin in a published manifest:

```bash
mise trust
mise install
mise run install
mise run check
```

CI uses the official Node and pnpm setup actions, not Mise. It tests both the declared Node.js support floor and the latest stable Node.js, then runs linting, type checking, tests, builds, documentation checks, and packed-package consumption tests.

See the [contribution guide](https://jonbogaty.com/strata-game-library/contributing/) for repository setup and pull-request expectations. Releases use Conventional Commits and release-please; trusted GitHub Actions publication uses npm provenance.

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE) © Jon Bogaty.
