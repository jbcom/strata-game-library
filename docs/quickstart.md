---
title: Quick start
description: Create a renderer-agnostic game definition and attach it to React Three Fiber.
---

# Quick start

Install the umbrella package and the peer dependencies for the renderer you use.

```bash
pnpm add strata-game-library react react-dom three @react-three/fiber @react-three/drei
```

Define the game in pure TypeScript, then render it through the optional React Three Fiber adapter.

```tsx
import { createRPGGame } from "strata-game-library";
import { StrataGame, Water } from "strata-game-library/r3f";

const game = createRPGGame({
  name: "River Crossing",
  version: "1.0.0",
  world: {
    regions: {
      meadow: { name: "Meadow", center: [0, 0, 0], radius: 80 },
    },
    connections: [],
  },
  scenes: {
    meadow: { id: "meadow", render: () => <Water size={200} depth={20} /> },
  },
  initialScene: "meadow",
  modes: { exploration: { systems: [] } },
  initialState: { currentRegion: "meadow", player: { name: "Scout" } },
});

export function App() {
  return <StrataGame game={game} />;
}
```

The root package stays renderer-independent. Import integrations deliberately from `strata-game-library/r3f`, `/reactylon`, `/pixi`, `/astro`, `/capacitor`, or `/react-native`.

Next, read the [architecture](architecture.md) and [package reference](packages.md) before selecting a lower-level package.
