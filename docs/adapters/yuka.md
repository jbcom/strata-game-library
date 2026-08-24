---
title: Yuka adapter
description: Opt into Yuka steering, navigation meshes, and state machines in a React Three Fiber Strata game.
---

# Yuka adapter

[Yuka](https://mugen87.github.io/yuka/) is a JavaScript library for game AI: entities, steering behaviors, navigation meshes, paths, and finite state machines. Strata exposes an opt-in bridge at `strata-game-library/yuka` for games that use Yuka alongside [React Three Fiber](https://r3f.docs.pmnd.rs/).

This is intentionally not part of the root, `/core`, or `/r3f` surface. A game that does not need Yuka pays no dependency or bundle cost for it.

## Install

Install Strata once, then add this adapter's explicit peer dependencies.

```bash
pnpm add strata-game-library yuka three react @react-three/fiber @react-three/drei
```

Use the maintained upstream documentation when you need Yuka's native API: [entities and steering](https://mugen87.github.io/yuka/docs/), [navigation](https://mugen87.github.io/yuka/docs/NavMesh.html), and [state machines](https://mugen87.github.io/yuka/docs/StateMachine.html). Strata documents the React/Three integration boundary; Yuka remains the source of truth for its own algorithms and runtime semantics.

## Run an entity manager

Put one `YukaEntityManager` in the mounted R3F scene. It advances a Yuka `EntityManager` through R3F's frame loop and makes it available to child components.

```tsx
import { Canvas } from "@react-three/fiber";
import { YukaEntityManager } from "strata-game-library/yuka";

export function GameCanvas() {
  return <Canvas><YukaEntityManager>{/* vehicles, paths, and navmeshes */}</YukaEntityManager></Canvas>;
}
```

## Drive a Three object with a Yuka vehicle

`YukaVehicle` owns a Yuka vehicle and synchronizes its transform to its child object. Hooks such as `useSeek`, `useArrive`, `useWander`, and `useFollowPath` create normal Yuka steering behaviors for that vehicle.

```tsx
import { YukaVehicle, useSeek } from "strata-game-library/yuka";

function Scout({ target }: { target: [number, number, number] }) {
  const seek = useSeek(target, { weight: 1 });
  return <YukaVehicle behaviors={[seek]} maxSpeed={4}><mesh><boxGeometry /><meshStandardMaterial color="seagreen" /></mesh></YukaVehicle>;
}
```

The adapter converts Three vectors and Yuka vectors where needed, but it does not hide the underlying runtime. Keep the Yuka `Vehicle` and its behaviors as the authoritative AI state; use Three objects for presentation.

## Navigation and state

- `YukaNavMesh` creates and exposes a Yuka navigation mesh from Three geometry.
- `YukaPath` owns a Yuka path that a vehicle can follow.
- `YukaStateMachine` registers named states and provides imperative transitions through a ref.

These components form an integration layer, not a new AI language. Prefer Yuka's own concepts and documentation when designing behavior. Keep game rules, save data, and portable state in Strata core so a future rendering or AI adapter can be introduced without rewriting the game definition.

## Keep imports intentional

```ts
import { createGame } from "strata-game-library";
import { StrataGame } from "strata-game-library/r3f";
import { YukaEntityManager, YukaVehicle } from "strata-game-library/yuka";
```

Do not import Yuka features from the root or `/r3f` subpath. That separation is the guarantee that lets projects choose different AI runtimes without coupling the rest of the library to them.
