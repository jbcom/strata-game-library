---
title: Introduction
description: A renderer-agnostic TypeScript framework for procedural games.
---

# Strata Game Library

Strata is a declarative TypeScript framework for games with procedural worlds. The pure core manages game definitions, state, input, persistence, composition, pathfinding, and procedural algorithms. Optional adapters connect that core to React Three Fiber, Babylon/Reactylon, and Pixi.

Install the umbrella package for a renderer-independent entrypoint, then import only the integrations your application needs.

```bash
pnpm add strata-game-library react react-dom three \
  @react-three/fiber @react-three/drei
```

## One framework, explicit layers

- **Portable core.** Define games, scenes, modes, input, persistence,
  composition, pathfinding, and procedural behavior without importing React.
- **Renderer adapters.** Use React Three Fiber, Babylon through Reactylon, or
  Pixi through explicit subpaths. Optional frameworks stay optional.
- **Procedural systems.** Compose terrain, water, sky, vegetation, shaders,
  materials, animation, audio, and world topology from tested primitives.
- **Package confidence.** Every release validates exports, types, packed files,
  documentation, and a clean consumer installation before publication.

## Build a scene

```tsx
import { createRPGGame } from "strata-game-library";
import { ProceduralSky, StrataGame, Water } from "strata-game-library/r3f";

const game = createRPGGame({
  name: "River Crossing",
  version: "1.0.0",
  world: {
    regions: { meadow: { name: "Meadow", center: [0, 0, 0], radius: 80 } },
    connections: [],
  },
  scenes: {
    meadow: {
      id: "meadow",
      render: () => (
        <>
          <ProceduralSky sunPosition={[100, 50, 100]} />
          <Water size={200} depth={20} />
        </>
      ),
    },
  },
  initialScene: "meadow",
  modes: { exploration: { systems: [] } },
  initialState: { currentRegion: "meadow", player: { name: "Scout" } },
});

export function App() {
  return <StrataGame game={game} />;
}
```

The root export remains renderer-independent. Renderer components and
integrations use explicit subpaths such as `strata-game-library/r3f`,
`/reactylon`, `/pixi`, `/astro`, `/capacitor`, and `/react-native`.

## Learn by workflow

- [Install and choose packages](https://jonbogaty.com/strata-game-library/getting-started/installation/)
- [Understand the boundaries](https://jonbogaty.com/strata-game-library/getting-started/architecture/)
- [Move from split packages](https://jonbogaty.com/strata-game-library/guides/umbrella-package-migration/)
- [Diagnose a problem](https://jonbogaty.com/strata-game-library/guides/troubleshooting/)

- [Start a game](https://jonbogaty.com/strata-game-library/quickstart/)
- [Understand the renderer boundary](https://jonbogaty.com/strata-game-library/architecture/)
- [Choose packages](https://jonbogaty.com/strata-game-library/packages/)
- [Contribute safely](https://jonbogaty.com/strata-game-library/contributing/)
