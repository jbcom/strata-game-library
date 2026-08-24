---
title: React Three Fiber adapter
updated: 2026-08-23
status: current
domain: technical
---

# @strata-game-library/r3f

React Three Fiber components for Strata.

This is the renderer adapter for R3F. It turns the renderer-free algorithms in
`@strata-game-library/core` into React components you can put in a scene. Pick
the adapter matching your renderer — `pixi` and `reactylon` are the others, and
you do not need them if you are on R3F.

## Install

```sh
pnpm add @strata-game-library/r3f @strata-game-library/core
```

React, `three`, and the `@react-three/*` packages are peer dependencies, so
your app controls their versions. They are never bundled: two copies of `three`
in one app means `instanceof` checks against the host's copy fail.

## Use

```tsx
import { Canvas } from "@react-three/fiber";
import { FollowCamera, VirtualJoystick } from "@strata-game-library/r3f";

export function Scene() {
  return (
    <>
      <Canvas>
        <FollowCamera target={playerRef} />
      </Canvas>
      <VirtualJoystick onMove={handleMove} />
    </>
  );
}
```

## Entry points

| Import | Contains |
| --- | --- |
| `@strata-game-library/r3f` | Everything below, re-exported |
| `@strata-game-library/r3f/components` | Scene and UI components — cameras, AI agents, animation controllers, parallax backgrounds, virtual joystick, screen effects |
| `@strata-game-library/r3f/hooks` | Hooks for driving those components from React state |
| `@strata-game-library/r3f/mount` | Canvas and scene mount primitives, StrictMode-safe |

Import from these paths, not from files inside `dist/`. Deep file paths are
internal and move without a major version.

## Where the logic lives

Components here are thin. The terrain generation, pathfinding, physics stepping
and animation solving all live in `@strata-game-library/core`, which has no
renderer dependency and is tested without one. If you are looking for an
algorithm rather than a component, look there first.

## License

MIT
