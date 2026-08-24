---
title: Adapters
description: Choose the rendering, platform, and ecosystem integrations your game needs.
---

# Adapters

Strata has one public npm package: `strata-game-library`. Its subpath exports are deliberate boundaries. Install the peers for the subpaths your application uses; the root and `strata-game-library/core` stay independent of rendering, React, and third-party AI engines.

| Goal | Import | Add the matching peer ecosystem |
| --- | --- | --- |
| Define a portable game | `strata-game-library` or `/core` | None for the core API. |
| Render a Three.js game with React | `/r3f` | [React](https://react.dev/), [Three.js](https://threejs.org/), and [React Three Fiber](https://r3f.docs.pmnd.rs/). |
| Render with Babylon | `/reactylon` | [Babylon.js](https://www.babylonjs.com/) and [Reactylon](https://www.reactylon.com/). |
| Render a 2D game | `/pixi` | [PixiJS](https://pixijs.com/) and [@pixi/react](https://github.com/pixijs/pixi-react). |
| Add steering and navmesh behavior to an R3F scene | `/yuka` | [Yuka](https://mugen87.github.io/yuka/), Three.js, React, and R3F. |
| Add generated sound | `/audio-synth` | [Tone.js](https://tonejs.github.io/). |
| Target native or installable web apps | `/capacitor` or `/react-native` | [Capacitor](https://capacitorjs.com/) or [React Native](https://reactnative.dev/). |
| Use Strata from an Astro site | `/astro` | [Astro](https://astro.build/). |

## Installation rule

Always install `strata-game-library` once, then install the peers named by the subpath guide. Do not install or import `@strata-game-library/*`: those names are private workspace implementation modules, never public packages.

```bash
pnpm add strata-game-library react react-dom three @react-three/fiber
```

## Choosing an AI runtime

Core provides portable game definitions, input, persistence, state, graph pathfinding, and procedural algorithms. It intentionally does not choose an entity-component system, steering engine, behavior-tree runtime, or renderer.

Use an ecosystem adapter when your game has made that choice. The first such integration is the [Yuka adapter](https://strata.game/adapters/yuka/), which binds Yuka's entity and steering model to React Three Fiber without making Yuka a dependency for every Strata game. Future adapters—for example, an ECS integration—follow the same contract: their runtime is an explicit peer and their exports live on a clear `strata-game-library/<adapter>` subpath.
