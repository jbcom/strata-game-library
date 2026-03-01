---
title: "Renderer-Agnostic Restructure Implementation Plan"
description: "Task-by-task plan for restructuring into renderer-agnostic architecture with adapters and plugins"
status: implemented
implementation: 100
last_updated: 2026-03-01
area: plans
---

# Renderer-Agnostic Restructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the Strata monorepo into a renderer-agnostic architecture with packages/, adapters/, plugins/ directories, extract R3F components, create Astro plugin, scaffold Reactylon adapter, and implement release automation workflows.

**Architecture:** Core algorithms stay as pure TypeScript in `packages/core`. R3F components extracted to `adapters/r3f`. New `adapters/reactylon` for Babylon.js. Plugins moved to `plugins/`. Three workflows: ci.yml (PRs), cd.yml (push to main -> Nx Release), release.yml (GitHub Release -> npm publish with OIDC).

**Tech Stack:** Nx 22.5, pnpm 9, tsup, Vitest, Biome, Astro/Starlight, React Three Fiber, Reactylon, Babylon.js 8

---

## Phase 1: Release Workflow Automation

### Task 1: Create release.yml workflow

**Files:**

- Create: `.github/workflows/release.yml`

**Step 1: Write the release.yml workflow**

```yaml
# .github/workflows/release.yml
# Publishes packages to npm when a GitHub Release is published.
# OIDC provenance enabled for supply-chain security.
name: Release

on:
  release:
    types: [published]

permissions:
  contents: read
  id-token: write

concurrency:
  group: release
  cancel-in-progress: false

env:
  NODE_VERSION: '22'
  PNPM_VERSION: 9

jobs:
  publish:
    name: Publish to npm
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@fe02b34f77f8bc703788d5817da081398fad5dd2 # v4.0.0
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4.4.0
        with:
          node-version: ${{ env.NODE_VERSION }}
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build all packages
        run: pnpm nx run-many -t build

      - name: Publish to npm with provenance
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        run: pnpm publish -r --access public --no-git-checks --provenance
```

**Step 2: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add release.yml for OIDC npm publishing on GitHub Release"
```

---

### Task 2: Refactor cd.yml to use Nx Release on push to main

**Files:**

- Modify: `.github/workflows/cd.yml`

**Step 1: Rewrite cd.yml**

Replace the entire file. Key changes:

- Remove tag trigger (release.yml handles publish)
- Remove workflow_dispatch (no manual releases needed)
- Keep push-to-main trigger only
- Skip if commit message contains `[skip actions]`
- Run build + test before Nx Release
- Nx Release creates version bumps, changelogs, tags, GitHub Releases
- Version bump commit uses `[skip actions]` not `[skip ci]`
- Keep the docs deployment job unchanged

The release job should:

1. Checkout with full git history
2. Install pnpm + node
3. Install dependencies
4. Build all packages
5. Run all tests
6. Configure git as github-actions[bot]
7. Run `pnpm nx release` which:
   - Determines version bumps from conventional commits
   - Updates CHANGELOGs
   - Commits changes with `[skip actions]`
   - Creates git tags
   - Creates GitHub Releases (which triggers release.yml)

Update the `nx.json` commit message from `[skip ci]` to `[skip actions]`.

**Step 2: Update nx.json commit message**

Change line 69 in `nx.json`:

```json
"commitMessage": "chore(release): {projectName} {version} [skip actions]"
```

**Step 3: Verify the cd.yml skips on release commits**

The `if` condition should be:

```yaml
if: "!contains(github.event.head_commit.message, '[skip actions]')"
```

**Step 4: Commit**

```bash
git add .github/workflows/cd.yml nx.json
git commit -m "ci: refactor cd.yml to Nx Release on push-to-main, use [skip actions]"
```

---

### Task 3: Create automerge.yml workflow

**Files:**

- Create: `.github/workflows/automerge.yml`

**Step 1: Write the automerge workflow**

```yaml
# .github/workflows/automerge.yml
# Auto-merges Dependabot PRs after CI passes.
name: Automerge

on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: write
  pull-requests: write

jobs:
  automerge:
    name: Auto-merge Dependabot
    if: github.actor == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - name: Approve PR
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: gh pr review "${{ github.event.pull_request.number }}" --repo "${{ github.repository }}" --approve

      - name: Enable auto-merge
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: gh pr merge "${{ github.event.pull_request.number }}" --repo "${{ github.repository }}" --auto --squash
```

Note: This workflow approves and enables auto-merge. GitHub's branch protection rules ensure CI must pass before the actual merge happens.

**Step 2: Commit**

```bash
git add .github/workflows/automerge.yml
git commit -m "ci: add automerge workflow for Dependabot PRs"
```

---

### Task 4: Remove CI trigger on push to main

**Files:**

- Modify: `.github/workflows/ci.yml`

**Step 1: Update ci.yml triggers**

Remove `push: branches: [main]` from the `on` section. CI should only run on PRs and the weekly schedule. Push-to-main is handled by cd.yml which runs its own build + test before releasing.

Change:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]
  schedule:
    - cron: '0 6 * * 1'
```

To:

```yaml
on:
  pull_request:
    types: [opened, synchronize, reopened]
  schedule:
    - cron: '0 6 * * 1'
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: remove push-to-main trigger from ci.yml (cd.yml handles it)"
```

---

## Phase 2: Directory Restructuring

### Task 5: Create directory structure and update workspace config

**Files:**

- Create: `adapters/` directory
- Create: `plugins/` directory
- Modify: `pnpm-workspace.yaml`

**Step 1: Create directories**

```bash
mkdir -p adapters plugins
```

**Step 2: Update pnpm-workspace.yaml**

```yaml
packages:
  - packages/*
  - adapters/*
  - plugins/*
  - apps/*
onlyBuiltDependencies:
  - esbuild
```

**Step 3: Commit**

```bash
git add pnpm-workspace.yaml adapters/.gitkeep plugins/.gitkeep
git commit -m "refactor: create adapters/ and plugins/ directories, update workspace"
```

---

### Task 6: Move plugin packages to plugins/ directory

**Files:**

- Move: `packages/audio-synth` -> `plugins/audio-synth`
- Move: `packages/model-synth` -> `plugins/model-synth`
- Move: `packages/capacitor-plugin` -> `plugins/capacitor`
- Move: `packages/react-native-plugin` -> `plugins/react-native`
- Modify: Each moved package's `package.json` (update repository.directory)

**Step 1: Move directories**

```bash
git mv packages/audio-synth plugins/audio-synth
git mv packages/model-synth plugins/model-synth
git mv packages/capacitor-plugin plugins/capacitor
git mv packages/react-native-plugin plugins/react-native
```

**Step 2: Update package.json repository.directory for each**

For each moved package, update the `repository.directory` field:

- `plugins/audio-synth/package.json`: `"directory": "plugins/audio-synth"`
- `plugins/model-synth/package.json`: `"directory": "plugins/model-synth"`
- `plugins/capacitor/package.json`: `"directory": "plugins/capacitor"`, also update `"name"` to `"@strata-game-library/capacitor"`
- `plugins/react-native/package.json`: `"directory": "plugins/react-native"`, also update `"name"` to `"@strata-game-library/react-native"`

**Step 3: Update nx.json release projects**

Replace the old package names in the `release.projects` array:

- `@strata-game-library/capacitor-plugin` -> `@strata-game-library/capacitor`
- `@strata-game-library/react-native-plugin` -> `@strata-game-library/react-native`

**Step 4: Run pnpm install to update lockfile**

```bash
pnpm install
```

**Step 5: Verify build**

```bash
pnpm run build
```

**Step 6: Verify tests**

```bash
pnpm run test
```

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor: move plugin packages to plugins/ directory, rename capacitor/react-native"
```

---

### Task 7: Extract R3F components from core to adapters/r3f

This is the biggest task. It creates the `@strata-game-library/r3f` adapter package.

**Files:**

- Create: `adapters/r3f/package.json`
- Create: `adapters/r3f/tsconfig.json`
- Create: `adapters/r3f/tsup.config.ts`
- Create: `adapters/r3f/vitest.config.ts`
- Move: `packages/core/src/components/` -> `adapters/r3f/src/components/`
- Modify: `packages/core/tsup.config.ts` (remove components entry)
- Modify: `packages/core/package.json` (remove components export, remove R3F peer deps)
- Modify: `packages/core/src/index.ts` (remove component re-exports)

**Step 1: Create adapters/r3f/package.json**

```json
{
  "name": "@strata-game-library/r3f",
  "version": "0.1.0",
  "description": "React Three Fiber components for Strata - terrain, water, vegetation, sky, volumetrics, physics, animation",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "lint": "biome lint src/",
    "lint:fix": "biome lint --write src/",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage",
    "prepublishOnly": "pnpm run build"
  },
  "keywords": ["strata", "react-three-fiber", "r3f", "threejs", "3d", "webgl", "game"],
  "author": "Jon Bogaty <jon@jonbogaty.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jbcom/strata-game-library.git",
    "directory": "adapters/r3f"
  },
  "bugs": { "url": "https://github.com/jbcom/strata-game-library/issues" },
  "homepage": "https://github.com/jbcom/strata-game-library/tree/main/adapters/r3f#readme",
  "publishConfig": { "access": "public" },
  "dependencies": {
    "@strata-game-library/core": "workspace:*",
    "@strata-game-library/shaders": "workspace:*"
  },
  "peerDependencies": {
    "@react-three/drei": ">=9.0.0",
    "@react-three/fiber": ">=8.0.0",
    "@react-three/rapier": ">=1.0.0",
    "postprocessing": ">=6.0.0",
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "three": ">=0.150.0",
    "yuka": ">=0.7.0",
    "zustand": ">=4.0.0"
  },
  "peerDependenciesMeta": {
    "yuka": { "optional": true },
    "@react-three/rapier": { "optional": true },
    "postprocessing": { "optional": true },
    "zustand": { "optional": true }
  },
  "devDependencies": {
    "@react-three/drei": "^10.7.7",
    "@react-three/fiber": "^9.4.2",
    "@react-three/postprocessing": "^3.0.4",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@types/three": "^0.182.0",
    "@types/yuka": "^0.7.4",
    "@vitest/coverage-v8": "^4.0.15",
    "jsdom": "^27.3.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "three": "^0.182.0",
    "tsup": "^8.5.1",
    "typescript": "^5.9.3",
    "vitest": "^4.0.15",
    "yuka": "^0.7.8"
  }
}
```

**Step 2: Create adapters/r3f/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "exclude": ["dist", "node_modules", "tests"]
}
```

**Step 3: Create adapters/r3f/tsup.config.ts**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'ES2022',
  jsx: 'automatic',
  external: [
    '@strata-game-library/core',
    '@strata-game-library/shaders',
    'react', 'react-dom', 'three',
    '@react-three/fiber', '@react-three/drei',
    '@react-three/rapier', '@react-three/postprocessing',
    'postprocessing', 'zustand', 'yuka',
    'xstate', '@xstate/react', 'howler', 'leva',
    'maath', 'miniplex', 'miniplex-react',
    'tunnel-rat', 'zundo', 'immer',
  ],
  treeshake: true,
  minify: false,
  keepNames: true,
  banner: { js: '/* @strata-game-library/r3f - ESM Build */' },
});
```

**Step 4: Move components directory**

```bash
mkdir -p adapters/r3f/src
git mv packages/core/src/components adapters/r3f/src/components
```

**Step 5: Create adapters/r3f/src/index.ts**

This file re-exports everything from the components directory:

```typescript
export * from './components/index.js';
```

**Step 6: Update import paths in moved component files**

All component files that import from `../core/...` need updated paths to import from `@strata-game-library/core` instead. This is a search-and-replace across all files in `adapters/r3f/src/components/`:

- `from '../core/` -> `from '@strata-game-library/core/core/`
- `from '../../core/` -> `from '@strata-game-library/core/core/`
- `from '../hooks/` -> check if renderer-specific or pure
- `from '../shaders` -> `from '@strata-game-library/shaders`
- `from '../api/` -> `from '@strata-game-library/core/api`
- `from '../game/` -> `from '@strata-game-library/core/game`
- `from '../compose/` -> `from '@strata-game-library/core/compose`
- `from '../utils/` -> `from '@strata-game-library/core/utils`

**Step 7: Update packages/core**

Remove the `components` export from:

- `packages/core/package.json` exports map
- `packages/core/tsup.config.ts` entry points
- `packages/core/src/index.ts` (remove component re-exports)

Remove R3F-specific peer dependencies from `packages/core/package.json`:

- `@react-three/drei`
- `@react-three/fiber`
- `@react-three/rapier`
- `postprocessing`
- `react`
- `react-dom`

The core package should have NO React dependencies at all.

**Step 8: Add r3f to nx.json release projects**

Add `"@strata-game-library/r3f"` to `release.projects` array.

**Step 9: Run pnpm install**

```bash
pnpm install
```

**Step 10: Verify core builds without React**

```bash
pnpm -F @strata-game-library/core run build
pnpm -F @strata-game-library/core run typecheck
```

**Step 11: Verify r3f builds**

```bash
pnpm -F @strata-game-library/r3f run build
```

**Step 12: Fix any import path issues found during build**

Iterate on import paths until both packages build cleanly.

**Step 13: Commit**

```bash
git add -A
git commit -m "refactor: extract R3F components from core to adapters/r3f"
```

---

### Task 8: Update presets to depend on r3f (if needed)

**Files:**

- Modify: `packages/presets/package.json` (add r3f dependency if presets import components)

**Step 1: Check if presets imports from core/components**

Search presets source for imports from `@strata-game-library/core/components` or `@strata-game-library/core` component types. If found, add `@strata-game-library/r3f` as a peer dependency.

**Step 2: Update imports if needed**

Replace `@strata-game-library/core/components` -> `@strata-game-library/r3f`

**Step 3: Verify build**

```bash
pnpm -F @strata-game-library/presets run build
pnpm -F @strata-game-library/presets run test
```

**Step 4: Commit (if changes were needed)**

```bash
git add -A
git commit -m "refactor: update presets to import from r3f adapter"
```

---

## Phase 3: Astro Plugin

### Task 9: Create the @strata-game-library/astro plugin package

**Files:**

- Create: `plugins/astro/package.json`
- Create: `plugins/astro/tsconfig.json`
- Create: `plugins/astro/tsup.config.ts`
- Create: `plugins/astro/src/index.ts`
- Create: `plugins/astro/src/vite-plugin.ts`

**Step 1: Create plugins/astro/package.json**

```json
{
  "name": "@strata-game-library/astro",
  "version": "0.1.0",
  "description": "Astro integration for Strata - Vite SSR config, demo components, and CSS design system",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./css/tokens.css": "./src/css/tokens.css",
    "./css/components.css": "./src/css/components.css",
    "./css/starlight.css": "./src/css/starlight.css"
  },
  "files": ["dist", "src/css", "README.md"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "lint": "biome lint src/",
    "test": "vitest run",
    "prepublishOnly": "pnpm run build"
  },
  "keywords": ["strata", "astro", "astro-integration", "starlight", "3d", "react-three-fiber"],
  "author": "Jon Bogaty <jon@jonbogaty.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jbcom/strata-game-library.git",
    "directory": "plugins/astro"
  },
  "publishConfig": { "access": "public" },
  "peerDependencies": {
    "astro": ">=4.0.0"
  },
  "devDependencies": {
    "astro": "^5.0.0",
    "tsup": "^8.5.1",
    "typescript": "^5.9.3",
    "vitest": "^4.0.15"
  }
}
```

**Step 2: Create plugins/astro/src/index.ts**

The Astro integration entry point that hooks into `astro:config:setup`:

```typescript
import type { AstroIntegration } from 'astro';
import { strataVitePlugin } from './vite-plugin.js';

export interface StrataAstroConfig {
  css?: boolean;
  starlight?: boolean;
  viteR3F?: boolean;
}

export default function strataAstro(config: StrataAstroConfig = {}): AstroIntegration {
  const { css = true, starlight = false, viteR3F = true } = config;

  return {
    name: '@strata-game-library/astro',
    hooks: {
      'astro:config:setup': ({ updateConfig, injectRoute }) => {
        if (viteR3F) {
          updateConfig({
            vite: {
              ssr: {
                noExternal: [
                  '@react-three/fiber',
                  '@react-three/drei',
                  'three',
                  '@babylonjs/core',
                  'reactylon',
                ],
              },
              plugins: [strataVitePlugin()],
            },
          });
        }
      },
    },
  };
}
```

**Step 3: Create plugins/astro/src/vite-plugin.ts**

```typescript
import type { Plugin } from 'vite';

export function strataVitePlugin(): Plugin {
  return {
    name: 'strata-vite-plugin',
    config() {
      return {
        optimizeDeps: {
          include: ['three'],
        },
      };
    },
  };
}
```

**Step 4: Extract CSS from apps/docs into plugin**

Split `apps/docs/src/styles/custom.css` (1,079 lines) into three files:

- `plugins/astro/src/css/tokens.css` — CSS custom properties, colors, fonts, gradients
- `plugins/astro/src/css/components.css` — Cards, badges, grids, demo containers, stats
- `plugins/astro/src/css/starlight.css` — Starlight-specific overrides (header, sidebar, hero)

**Step 5: Create tsup.config.ts and tsconfig.json**

Standard tsup config for the integration (similar to other plugins).

**Step 6: Add to nx.json release projects**

Add `"@strata-game-library/astro"` to the release projects array.

**Step 7: Verify build**

```bash
pnpm install
pnpm -F @strata-game-library/astro run build
```

**Step 8: Commit**

```bash
git add -A
git commit -m "feat: create @strata-game-library/astro integration plugin"
```

---

### Task 10: Dogfood the Astro plugin in docs site

**Files:**

- Modify: `apps/docs/package.json` (add @strata-game-library/astro dep)
- Modify: `apps/docs/astro.config.mjs` (use plugin instead of manual config)
- Modify: `apps/docs/src/styles/custom.css` (replace with imports from plugin)

**Step 1: Add plugin dependency**

```json
"@strata-game-library/astro": "workspace:*"
```

**Step 2: Update astro.config.mjs**

Replace manual Vite SSR config with plugin import:

```js
import strata from '@strata-game-library/astro';

export default defineConfig({
  integrations: [
    starlight({ ... }),
    react(),
    strata({ css: true, starlight: true, viteR3F: true }),
  ],
});
```

Remove the manual `vite: { ssr: { noExternal: [...] } }` block.

**Step 3: Update custom.css to import from plugin**

Replace bulk of custom.css with:

```css
@import '@strata-game-library/astro/css/tokens.css';
@import '@strata-game-library/astro/css/components.css';
@import '@strata-game-library/astro/css/starlight.css';

/* Any docs-site-specific overrides below */
```

**Step 4: Verify docs build**

```bash
pnpm -F docs run build
```

**Step 5: Commit**

```bash
git add -A
git commit -m "refactor(docs): dogfood @strata-game-library/astro plugin"
```

---

## Phase 4: Reactylon Adapter (Scaffold)

### Task 11: Create the @strata-game-library/reactylon adapter package

**Files:**

- Create: `adapters/reactylon/package.json`
- Create: `adapters/reactylon/tsconfig.json`
- Create: `adapters/reactylon/tsup.config.ts`
- Create: `adapters/reactylon/src/index.ts`
- Create: `adapters/reactylon/src/components/Water.tsx`
- Create: `adapters/reactylon/src/hooks/useStrataScene.ts`

**Step 1: Create package.json**

```json
{
  "name": "@strata-game-library/reactylon",
  "version": "0.1.0",
  "description": "Babylon.js components for Strata via Reactylon - water, sky, vegetation, volumetrics",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" }
  },
  "files": ["dist", "README.md"],
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "lint": "biome lint src/",
    "test": "vitest run",
    "prepublishOnly": "pnpm run build"
  },
  "keywords": ["strata", "babylonjs", "reactylon", "3d", "game"],
  "author": "Jon Bogaty <jon@jonbogaty.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jbcom/strata-game-library.git",
    "directory": "adapters/reactylon"
  },
  "publishConfig": { "access": "public" },
  "dependencies": {
    "@strata-game-library/core": "workspace:*"
  },
  "peerDependencies": {
    "@babylonjs/core": ">=8.0.0",
    "react": ">=18.0.0",
    "reactylon": ">=0.1.0"
  },
  "devDependencies": {
    "@babylonjs/core": "^8.0.0",
    "@types/react": "^19.2.7",
    "react": "^19.2.3",
    "reactylon": "^0.5.0",
    "tsup": "^8.5.1",
    "typescript": "^5.9.3",
    "vitest": "^4.0.15"
  }
}
```

**Step 2: Create scaffold component (Water.tsx)**

A minimal Water component that demonstrates the pattern of importing core algorithms and wrapping in Reactylon JSX. This is a scaffold — real implementation will follow in a dedicated phase.

**Step 3: Create useStrataScene hook**

A helper hook that configures a Babylon.js scene with Strata defaults.

**Step 4: Create index.ts with exports**

**Step 5: Add to nx.json release projects**

Add `"@strata-game-library/reactylon"` to the release projects array.

**Step 6: Verify build**

```bash
pnpm install
pnpm -F @strata-game-library/reactylon run build
```

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold @strata-game-library/reactylon adapter for Babylon.js"
```

---

## Phase 5: Update Configuration & Documentation

### Task 12: Update nx.json with all 10 release projects

**Files:**

- Modify: `nx.json`

**Step 1: Update release.projects**

```json
"projects": [
  "@strata-game-library/shaders",
  "@strata-game-library/core",
  "@strata-game-library/r3f",
  "@strata-game-library/reactylon",
  "@strata-game-library/presets",
  "@strata-game-library/astro",
  "@strata-game-library/audio-synth",
  "@strata-game-library/model-synth",
  "@strata-game-library/capacitor",
  "@strata-game-library/react-native"
]
```

**Step 2: Commit**

```bash
git add nx.json
git commit -m "chore: update nx.json with all 10 release projects"
```

---

### Task 13: Update CI coverage paths

**Files:**

- Modify: `.github/workflows/ci.yml`

**Step 1: Update coverage upload path**

The `coverage` upload step currently only looks in `packages/*/coverage/`. Update to also check `adapters/*/coverage/` and `plugins/*/coverage/`:

```yaml
path: |
  packages/*/coverage/lcov.info
  adapters/*/coverage/lcov.info
  plugins/*/coverage/lcov.info
```

**Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: update coverage paths for adapters/ and plugins/ directories"
```

---

### Task 14: Update root README.md and CLAUDE.md

**Files:**

- Modify: `README.md`
- Modify: `CLAUDE.md`

**Step 1: Update README.md**

Update the package table, monorepo structure diagram, and architecture section to reflect the new layout with adapters/ and plugins/ directories. Add the new packages (r3f, reactylon, astro).

**Step 2: Update CLAUDE.md**

Update the Architecture section and directory structure to reflect the new layout. Update the "Key Rule" about src/core/ to clarify the adapter pattern.

**Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: update README and CLAUDE.md for new monorepo structure"
```

---

### Task 15: Full verification

**Step 1: Clean and rebuild everything**

```bash
pnpm run build
```

Expected: All 10+ projects build successfully.

**Step 2: Run all tests**

```bash
pnpm run test
```

Expected: All tests pass.

**Step 3: Run typecheck**

```bash
pnpm run typecheck
```

Expected: All packages pass typecheck.

**Step 4: Run lint**

```bash
pnpm run lint
```

Expected: All packages pass lint.

**Step 5: Verify docs build**

```bash
pnpm -F docs run build
```

Expected: 312+ pages built successfully.

**Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: resolve build issues from restructure"
```

---

## Task Dependency Order

```text
Phase 1 (Workflows):     Task 1 -> Task 2 -> Task 3 -> Task 4
Phase 2 (Restructure):   Task 5 -> Task 6 -> Task 7 -> Task 8
Phase 3 (Astro):          Task 9 -> Task 10
Phase 4 (Reactylon):      Task 11
Phase 5 (Config/Docs):    Task 12 -> Task 13 -> Task 14 -> Task 15

Phase 1 and Phase 2 (Tasks 5-6) can run in parallel.
Phase 3 depends on Phase 2 (Task 7 must complete for CSS extraction).
Phase 4 depends on Phase 2 (Task 7 must complete for core being pure TS).
Phase 5 depends on all previous phases.
```
