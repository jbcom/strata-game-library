# @strata-game-library/pixi

Pixi 8 `Application` mount/unmount lifecycle for Strata.

Strata's other adapters cover React Three Fiber and Babylon via Reactylon.
This one covers Pixi, for 2D games that want Strata's conventions without a
3D renderer.

## Install

```sh
pnpm add @strata-game-library/pixi pixi.js
# optional, for the React bindings
pnpm add @pixi/react react react-dom
```

`pixi.js` and `react` are peer dependencies; `@pixi/react` is optional and only
needed for the React entry points.

## What it handles

Pixi 8 initialises asynchronously and holds a WebGL context, which makes three
things easy to get wrong:

- **StrictMode double-invocation.** React 18+ mounts, unmounts, and remounts
  effects in development. Reusing a canvas across that cycle leaves a destroyed
  Pixi context attached to a live element. This mounts a fresh canvas each time
  and removes only canvases it created.
- **Async init races.** An unmount that lands mid-`init()` must not leak an
  Application that finishes initialising into a detached tree.
- **Filter resolution.** Pixi filters default to a resolution that does not
  follow the renderer's, so filtered content renders soft on high-DPI displays.
  `applyFilterResolutionFix` aligns them.

## Usage

```ts
import { mountPixiApplication } from '@strata-game-library/pixi';

const handle = await mountPixiApplication({ parent: hostElement });
// ... later
handle.destroy();
```

See `src/index.ts` for the full export surface.
