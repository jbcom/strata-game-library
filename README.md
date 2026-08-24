# Strata Game Library

![A floating game world shown as geological layers: shaders, terrain, water, vegetation, and atmosphere](https://raw.githubusercontent.com/jbcom/strata-game-library/main/.github/assets/strata-hero.webp)

[![CI](https://github.com/jbcom/strata-game-library/actions/workflows/ci.yml/badge.svg)](https://github.com/jbcom/strata-game-library/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/strata-game-library)](https://www.npmjs.com/package/strata-game-library)
[![Node.js](https://img.shields.io/node/v/strata-game-library)](https://www.npmjs.com/package/strata-game-library)
[![License: MIT](https://img.shields.io/badge/license-MIT-2d9d78.svg)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)

Strata is a declarative TypeScript game framework for procedural worlds. Its pure core handles game definitions, state, input, persistence, composition, pathfinding, and procedural algorithms; optional adapters bring those capabilities to React Three Fiber, Babylon/Reactylon, and Pixi.

[Documentation](https://strata.game/) · [Quick start](https://strata.game/quickstart/) · [Packages](https://strata.game/packages/) · [Adapters](https://strata.game/adapters/) · [Contributing](https://strata.game/contributing/)

## Install

Install the umbrella package and only the peers used by your renderer:

```bash
pnpm add strata-game-library react react-dom three \
  @react-three/fiber @react-three/drei
```

The same package works with npm, Yarn, and Bun. Node.js 22 or newer is supported; consumers are not required to use pnpm or Mise.

Use explicit subpath imports from the same install when you need a renderer or
integration. There are no separately installable Strata packages.

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

The root entry is renderer-independent. Renderer components and integrations use explicit subpaths such as `strata-game-library/r3f`, `/reactylon`, `/pixi`, `/astro`, `/capacitor`, `/react-native`, and `/yuka`, so installing Strata does not eagerly load every optional framework. The Yuka subpath is an ecosystem adapter: install Yuka and its R3F peers only when that is the AI runtime your game has chosen.

## Package

[`strata-game-library`](https://www.npmjs.com/package/strata-game-library) is
the only published package. Its public subpaths keep optional renderer and
plugin code tree-shakeable without creating additional npm identities.

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

See the [contribution guide](https://strata.game/contributing/) for repository setup and pull-request expectations. Releases use Conventional Commits and release-please; trusted GitHub Actions publication uses npm provenance.

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE) © Jon Bogaty.
