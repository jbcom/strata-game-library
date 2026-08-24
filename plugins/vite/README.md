# @strata-game-library/vite

Opinionated Vite, Vitest, and tsup configuration for TypeScript browser games.

Hand-written build configs drift. Across one twelve-package workspace the drift
had reached the published artifacts: one adapter shipped a banner naming a
different package and bundled two of its own peer dependencies, so consumers
got a second copy of a renderer and `instanceof` checks against the host copy
failed. This preset exists to make that class of mistake unrepresentable.

MIT licensed. No dependency on the fleet it was extracted from.

## Install

```sh
pnpm add -D @strata-game-library/vite
```

`vite`, `vitest`, and `tsup` are optional peer dependencies — install whichever
you use.

## Library builds

```ts
// tsup.config.ts
import { libraryBuild } from "@strata-game-library/vite/tsup";

export default libraryBuild({
  name: "@your-scope/renderer",
  external: ["three", "react"],
});
```

The banner is derived from `name`, so it cannot drift from the package it
describes. Defaults: ESM, `es2022`, declarations, sourcemaps, treeshaking,
`keepNames` (so consumer stack traces stay meaningful), and no minification —
applications minify, libraries should not.

**`external` is the setting that matters.** Anything imported but absent from
it gets bundled into `dist`, which duplicates the dependency and breaks
`instanceof` against the host's copy. List your `peerDependencies`.

### JSX

```ts
libraryBuild({ name: "@your-scope/ui", jsx: "automatic" });
```

Routed through esbuild rather than set on tsup directly. tsup's `Options` has
no `jsx` field, so a top-level `jsx` in a hand-written config is silently
discarded — four packages in the original workspace were doing exactly that.

Use `"preserve"` only if your entry points also resolve to `.jsx` files; esbuild
will not put preserved JSX in a `.js` file.

### Escape hatch

`overrides` merges last and wins, for genuinely package-specific needs:

```ts
libraryBuild({
  name: "@your-scope/mobile",
  // Ships into a WebView with an older floor than a browser's.
  overrides: { target: "es2020", splitting: true },
});
```

With `splitting` on, the banner lands in the chunks carrying code rather than
in the re-export shim at `index.js`.

## Vite and Vitest

```ts
import { gameVite } from "@strata-game-library/vite/vite";
import { gameVitest } from "@strata-game-library/vite/vitest";
```

See `src/vite.ts` and `src/vitest.ts` for the options each accepts.

## What is deliberately not here

The Capacitor wiring, CLI, and private-registry release machinery from the
original preset stayed behind. They encode one organisation's publishing
choices rather than anything a stranger could use.

## License

MIT
