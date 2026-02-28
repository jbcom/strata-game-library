# @strata-game-library/astro

[![npm version](https://img.shields.io/npm/v/@strata-game-library/astro)](https://www.npmjs.com/package/@strata-game-library/astro)
[![license](https://img.shields.io/npm/l/@strata-game-library/astro)](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
[![build](https://img.shields.io/github/actions/workflow/status/jbcom/strata-game-library/ci.yml?branch=main)](https://github.com/jbcom/strata-game-library/actions)

Astro integration for Strata Game Library -- Vite config, CSS design tokens, and Starlight theme.

Provides everything you need to build documentation sites and showcases for Strata-powered games using [Astro](https://astro.build/) and [Starlight](https://starlight.astro.build/).

## Installation

```bash
pnpm add @strata-game-library/astro
```

Peer dependencies:

```bash
pnpm add astro   # >= 4.0.0
```

## Quick Start

Add the integration to your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import strataAstro from '@strata-game-library/astro';

export default defineConfig({
  integrations: [
    starlight({
      title: 'My Game Docs',
      customCss: [
        '@strata-game-library/astro/css/tokens.css',
        '@strata-game-library/astro/css/components.css',
        '@strata-game-library/astro/css/starlight.css',
      ],
    }),
    strataAstro(),
  ],
});
```

That's it. Your Starlight site now has the Strata theme with correctly configured Vite settings for React Three Fiber and Three.js.

## Configuration

The integration accepts an optional config object:

```ts
strataAstro({
  // Configure Vite SSR and optimizeDeps for R3F / Three.js (default: true)
  viteR3F: true,
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `viteR3F` | `boolean` | `true` | Adds Vite SSR `noExternal` entries for `@react-three/fiber`, `@react-three/drei`, `three`, `@babylonjs/core`, and `reactylon`. Also pre-bundles `three` via `optimizeDeps`. |

## Features

### Vite Configuration

When `viteR3F` is enabled (the default), the integration automatically:

- Marks `@react-three/fiber`, `@react-three/drei`, `three`, `@babylonjs/core`, and `reactylon` as SSR `noExternal` so they bundle correctly during the Astro build.
- Pre-bundles `three` via Vite `optimizeDeps` for faster dev server startup.

This eliminates the manual Vite config typically required when embedding live R3F or Babylon.js demos in Astro pages.

### CSS Design Tokens

Import `@strata-game-library/astro/css/tokens.css` to get the full Strata design system:

- **Color palette** -- Accent (`--sl-color-accent`), background, text, and gray scale variables for both dark and light modes.
- **Typography** -- Space Grotesk for headings, JetBrains Mono for code, loaded via Google Fonts.
- **Strata tokens** -- `--strata-gradient`, `--strata-gradient-subtle`, `--strata-glow`, `--strata-border`, `--strata-radius` for consistent branding.
- **Scrollbar styling** -- Themed scrollbars matching the color palette.
- **Selection color** -- Accent-tinted text selection.

### CSS Components

Import `@strata-game-library/astro/css/components.css` for pre-built UI components:

| Component | Class | Description |
|-----------|-------|-------------|
| Cards | `.card`, `.sl-link-card` | Hover-glow cards with gradient top-border reveal |
| Feature Grid | `.feature-grid`, `.feature-card` | Responsive auto-fit grid for feature showcases |
| Badges | `.badge`, `.badge-teal`, `.badge-amber`, `.badge-green` | Pill badges with color variants |
| Stats | `.stats-grid`, `.stat-item`, `.stat-number` | Gradient-text stat counters |
| Package Cards | `.package-grid`, `.package-card` | Compact cards for listing packages |
| Layer Stack | `.layer-stack`, `.layer`, `.layer-0`..`.layer-4` | Stacked architecture diagram with geological colors |
| Demo Container | `.strata-demo-container`, `.showcase-demo` | Bordered containers for live R3F demos |
| Comparison | `.comparison-grid`, `.comparison-before`, `.comparison-after` | Side-by-side code comparison layout |
| Mission Block | `.mission-block` | Centered blockquote callout |
| Callout | `.callout`, `.callout-highlight` | Bordered highlight box |
| Code Blocks | `.expressive-code` overrides | Styled Expressive Code frames |

All components include:

- Dark and light mode support
- Responsive breakpoints (768px, 480px)
- Entrance animations (respects `prefers-reduced-motion`)
- Hover transitions with glow effects

### Starlight Theme

Import `@strata-game-library/astro/css/starlight.css` for Starlight-specific overrides:

- **Header** -- Frosted glass nav bar with blur and Strata border
- **Hero** -- Animated gradient mesh background, grid overlay, gradient title text, styled CTA buttons
- **Sidebar** -- Accent-colored active page indicator, uppercase group labels
- **Section headings** -- Gradient underline on `h2` elements
- **Pagination** -- Themed prev/next links with hover glow
- **Table of contents** -- Accent-colored current section
- **Asides** -- Rounded Starlight callouts
- **Search modal** -- Frosted glass with rounded corners
- **Footer** -- Strata-bordered top edge

## Sub-path Exports

| Import Path | Contents |
|-------------|----------|
| `@strata-game-library/astro` | Astro integration function |
| `@strata-game-library/astro/css/tokens.css` | Design tokens and CSS custom properties |
| `@strata-game-library/astro/css/components.css` | UI component styles |
| `@strata-game-library/astro/css/starlight.css` | Starlight theme overrides |

You can import the CSS files individually. For example, use only `tokens.css` if you want the design tokens without the component or Starlight styles.

## Usage with React Three Fiber Demos

To embed live R3F demos in your Astro/Starlight pages, install `@astrojs/react` and use `client:load` directives:

```mdx
---
title: Terrain Demo
---

import TerrainDemo from '../../components/TerrainDemo';

<div class="showcase-demo">
  <TerrainDemo client:load />
  <div class="showcase-demo-badge">Interactive</div>
</div>
```

The Vite config from this integration ensures Three.js and R3F bundle correctly for SSR.

## Documentation

Full documentation, guides, and live demos: [https://strata.game](https://strata.game)

## License

[MIT](https://github.com/jbcom/strata-game-library/blob/main/LICENSE)
