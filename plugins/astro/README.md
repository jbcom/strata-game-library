---
title: Astro integration
updated: 2026-08-23
status: current
domain: technical
---

# @strata-game-library/astro

Astro integration for Strata.

Wires the Vite configuration a Strata game needs into an Astro site, and ships
the CSS tokens the components expect. Use it when a Strata scene lives inside an
Astro-built page — a docs site, a landing page, or a showcase.

## Install

```sh
pnpm add @strata-game-library/astro
```

## Use

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import strata from "@strata-game-library/astro";

export default defineConfig({
  integrations: [strata()],
});
```

## Entry points

| Import | Contains |
| --- | --- |
| `@strata-game-library/astro` | The integration itself |
| `@strata-game-library/astro/css/tokens.css` | Design tokens — colours, spacing, type scale |
| `@strata-game-library/astro/css/components.css` | Component styles built on those tokens |
| `@strata-game-library/astro/css/starlight.css` | Starlight theme overrides, for docs sites |

Import the CSS you want; none of it is applied implicitly.

## License

MIT
