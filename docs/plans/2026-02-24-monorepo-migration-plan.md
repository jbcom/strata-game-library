---
title: "Monorepo Migration Implementation Plan"
description: "Task-by-task implementation plan for consolidating 11 repos into a single monorepo"
status: implemented
implementation: 100
last_updated: 2026-03-01
area: plans
---

# Monorepo Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate 11 strata-game-library GitHub repositories into a single Nx + pnpm monorepo with publishable packages and deployable apps.

**Architecture:** All repos migrate into a `packages/` (publishable libraries) + `apps/` (deployable sites/examples) structure orchestrated by Nx 20+ on top of pnpm workspaces. Root configs provide shared TypeScript, Biome, and Vitest settings that per-package configs extend.

**Tech Stack:** TypeScript 5.9+, Nx 20+, pnpm 9+, tsup, Biome 2.3+, Vitest 4+, Playwright, React Three Fiber, Three.js

---

## Phase 1: Root Monorepo Configuration

### Task 1: Update pnpm-workspace.yaml

**Files:**

- Modify: `pnpm-workspace.yaml`

**Step 1: Update workspace config**

Replace the current contents of `pnpm-workspace.yaml` with:

```yaml
packages:
  - "packages/*"
  - "apps/*"
onlyBuiltDependencies:
  - esbuild
```

This tells pnpm to discover packages in both directories. The root package is always included automatically.

**Step 2: Verify pnpm recognizes the pattern**

Run: `pnpm ls --depth=0 2>&1 | head -5`
Expected: No errors (there are no packages yet, but pnpm should not complain about the glob patterns)

**Step 3: Commit**

```bash
git add pnpm-workspace.yaml
git commit -m "chore: configure pnpm workspace for packages/* and apps/*"
```

---

### Task 2: Create tsconfig.base.json (shared compiler options)

**Files:**

- Create: `tsconfig.base.json`
- Modify: `tsconfig.json` (will become the root entry for project references later)

**Step 1: Create the shared base config**

Create `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "inlineSources": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "resolveJsonModule": true
  }
}
```

This contains ONLY `compilerOptions` — no `include`, `exclude`, `files`, or `references`. Each package sets its own `rootDir`, `outDir`, `include`, and `exclude`.

**Step 2: Commit**

```bash
git add tsconfig.base.json
git commit -m "chore: add shared tsconfig.base.json for monorepo"
```

---

### Task 3: Update root biome.json for monorepo

**Files:**

- Modify: `biome.json`

**Step 1: Update biome.json**

Update the `files.includes` to cover all packages and apps, and standardize indent to 2-space:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.3.8/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "includes": ["packages/*/src/**", "packages/*/tests/**", "apps/**"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "a11y": {
        "useKeyWithClickEvents": "warn",
        "useButtonType": "warn",
        "noStaticElementInteractions": "warn"
      },
      "complexity": {
        "noStaticOnlyClass": "error",
        "noUselessCatch": "error",
        "noUselessConstructor": "error",
        "noUselessTypeConstraint": "error"
      },
      "correctness": {
        "noUnusedVariables": "warn",
        "noUnusedImports": "warn",
        "noUnusedFunctionParameters": "warn",
        "useExhaustiveDependencies": "warn",
        "noInvalidUseBeforeDeclaration": "warn"
      },
      "style": {
        "noNamespace": "error",
        "noNonNullAssertion": "warn",
        "useAsConstAssertion": "error",
        "useLiteralEnumMembers": "error",
        "useConst": "error"
      },
      "suspicious": {
        "noConfusingVoidType": "off",
        "noExplicitAny": "off",
        "noRedeclare": "error",
        "noArrayIndexKey": "warn",
        "useIterableCallbackReturn": "warn"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5"
    }
  },
  "json": {
    "formatter": {
      "indentStyle": "space",
      "indentWidth": 2
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

Key changes from current: `indentWidth` 4 -> 2, `json.indentWidth` 4 -> 2, `files.includes` expanded for monorepo.

**Step 2: Commit**

```bash
git add biome.json
git commit -m "chore: update biome.json for monorepo (2-space indent, packages/apps scope)"
```

---

### Task 4: Install Nx and create nx.json

**Files:**

- Modify: `package.json` (add nx devDependency)
- Create: `nx.json`

**Step 1: Install Nx**

```bash
pnpm add -D nx @nx/js --save-exact
```

**Step 2: Create nx.json**

Create `nx.json`:

```json
{
  "$schema": "./node_modules/nx/schemas/nx-schema.json",
  "defaultBase": "main",
  "namedInputs": {
    "default": ["{projectRoot}/**/*", "sharedGlobals"],
    "sharedGlobals": [
      "{workspaceRoot}/tsconfig.base.json",
      "{workspaceRoot}/biome.json",
      "{workspaceRoot}/pnpm-lock.yaml"
    ],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/vitest.config.[jt]s",
      "!{projectRoot}/tests/**/*"
    ]
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "outputs": ["{projectRoot}/dist"],
      "cache": true
    },
    "test": {
      "dependsOn": ["build"],
      "inputs": ["default", "^production"],
      "cache": true
    },
    "lint": {
      "inputs": ["default", "{workspaceRoot}/biome.json"],
      "cache": true
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"],
      "cache": true
    }
  },
  "parallel": 3
}
```

**Step 3: Add .nx to .gitignore**

Append to `.gitignore`:

```
# Nx
.nx/cache
.nx/workspace-data
```

**Step 4: Verify Nx sees the root project**

Run: `pnpm nx show projects`
Expected: Lists `@strata-game-library/core` (the root project — will move to packages/core later)

**Step 5: Commit**

```bash
git add nx.json package.json pnpm-lock.yaml .gitignore
git commit -m "chore: add Nx 20 for monorepo task orchestration"
```

---

### Task 5: Update root package.json scripts for Nx

**Files:**

- Modify: `package.json`

**Step 1: Add Nx-based root scripts**

Add/update these scripts in the root `package.json` (keep existing scripts, add new ones):

```json
{
  "scripts": {
    "build:all": "nx run-many -t build",
    "test:all": "nx run-many -t test",
    "lint:all": "nx run-many -t lint",
    "typecheck:all": "nx run-many -t typecheck",
    "affected:build": "nx affected -t build",
    "affected:test": "nx affected -t test",
    "affected:lint": "nx affected -t lint",
    "graph": "nx graph"
  }
}
```

Keep all existing scripts (build, test, lint, etc.) — they still work for the root/core package. The `:all` variants run across all workspace packages.

**Step 2: Verify Nx scripts work**

Run: `pnpm run graph`
Expected: Opens a browser window showing the Nx dependency graph (currently just the root project)

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add Nx-based monorepo scripts to root package.json"
```

---

### Task 6: Create vitest workspace config

**Files:**

- Create: `vitest.workspace.ts`

**Step 1: Create vitest workspace config**

Create `vitest.workspace.ts`:

```typescript
import { defineWorkspace } from 'vitest/config';

export default defineWorkspace(['packages/*']);
```

This tells Vitest to discover test configurations from each package's own `vitest.config.ts`. We use `defineWorkspace` for broad compatibility across Vitest 3.x/4.x.

**Step 2: Commit**

```bash
git add vitest.workspace.ts
git commit -m "chore: add vitest workspace config for multi-package testing"
```

---

## Phase 2: Core Package Migration

### Task 7: Create packages/core directory structure

**Files:**

- Create: `packages/core/` directory
- Move: `src/` -> `packages/core/src/`
- Move: `tests/` -> `packages/core/tests/`

**Step 1: Create the package directory**

```bash
mkdir -p packages/core
```

**Step 2: Move source and test directories**

```bash
git mv src packages/core/src
git mv tests packages/core/tests
```

**Step 3: Verify files moved correctly**

Run: `ls packages/core/src/index.ts && ls packages/core/tests/unit/vitest.config.ts`
Expected: Both files exist

**Step 4: Commit the move**

```bash
git add -A
git commit -m "refactor: move src/ and tests/ into packages/core/"
```

---

### Task 8: Create packages/core/package.json

**Files:**

- Create: `packages/core/package.json`
- Modify: root `package.json`

**Step 1: Create the core package.json**

Create `packages/core/package.json` using the contents of the current root `package.json`, with these changes:

- Keep `name`, `version`, `description`, `type`, `main`, `module`, `types`, `exports`, `files`, `keywords`, `author`, `license`, `publishConfig`
- Keep `peerDependencies`, `peerDependenciesMeta`, `dependencies`
- Move test/build-related `devDependencies` to the package level (vitest, @testing-library/react, jsdom, @vitest/coverage-v8, @playwright/test, @types/*)
- Keep `repository`, `homepage`, `bugs` but update URLs to point to the monorepo
- Update `scripts` to use correct paths (now relative to packages/core/)

The `exports` map stays the same since the source paths are unchanged (src/ is now packages/core/src/ but the package itself is rooted at packages/core/).

Key script changes:

```json
{
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rimraf dist",
    "lint": "biome lint src/",
    "lint:fix": "biome lint --write src/",
    "format": "biome format --write src/ tests/",
    "format:check": "biome format src/ tests/",
    "check": "biome check src/",
    "check:fix": "biome check --write src/",
    "test": "vitest run",
    "test:unit": "vitest run --config tests/unit/vitest.config.ts",
    "test:integration": "vitest run --config tests/integration/vitest.config.ts",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test --project=chromium",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "pnpm run build && pnpm run test:unit"
  }
}
```

**Step 2: Slim down root package.json**

Update the root `package.json` to become the monorepo root:

- Change `name` to `@strata-game-library/monorepo`
- Set `"private": true`
- Remove all `exports`, `main`, `module`, `types`, `files`, `peerDependencies`, `dependencies`
- Keep only monorepo-level scripts (build:all, test:all, etc.) and the Nx/Husky/lint-staged devDependencies
- Keep `prepare` script for husky

```json
{
  "name": "@strata-game-library/monorepo",
  "private": true,
  "description": "Strata Game Library monorepo",
  "scripts": {
    "build": "nx run-many -t build",
    "test": "nx run-many -t test",
    "lint": "nx run-many -t lint",
    "typecheck": "nx run-many -t typecheck",
    "affected:build": "nx affected -t build",
    "affected:test": "nx affected -t test",
    "affected:lint": "nx affected -t lint",
    "graph": "nx graph",
    "prepare": "husky"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["biome check --write --no-errors-on-unmatched"],
    "*.{json,md,yml,yaml}": ["biome format --write --no-errors-on-unmatched"]
  },
  "devDependencies": {
    "@biomejs/biome": "2.3.10",
    "husky": "^9.1.7",
    "lint-staged": "^16.2.7",
    "nx": "<installed-version>",
    "@nx/js": "<installed-version>",
    "rimraf": "^6.1.2",
    "typescript": "^5.9.3"
  }
}
```

**Step 3: Verify the workspace sees both projects**

Run: `pnpm nx show projects`
Expected: Lists `@strata-game-library/monorepo` and `@strata-game-library/core`

**Step 4: Commit**

```bash
git add packages/core/package.json package.json
git commit -m "refactor: split root package.json into monorepo root + packages/core"
```

---

### Task 9: Create packages/core/tsconfig.json

**Files:**

- Create: `packages/core/tsconfig.json`
- Modify: root `tsconfig.json` (becomes project references entry point)

**Step 1: Create the core tsconfig**

Create `packages/core/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "types": ["vitest/globals"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 2: Update root tsconfig.json to reference packages**

Replace root `tsconfig.json`:

```json
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "packages/core" }
  ]
}
```

**Step 3: Verify type checking still works**

Run (from packages/core): `cd packages/core && pnpm tsc --noEmit`
Expected: No type errors (same behavior as before the move)

**Step 4: Commit**

```bash
git add packages/core/tsconfig.json tsconfig.json
git commit -m "refactor: create packages/core/tsconfig.json extending base"
```

---

### Task 10: Move tsup.config.ts to packages/core

**Files:**

- Move: `tsup.config.ts` -> `packages/core/tsup.config.ts`

**Step 1: Move the config**

```bash
git mv tsup.config.ts packages/core/tsup.config.ts
```

The entry paths in tsup.config.ts are relative (`src/index.ts`, etc.) and the source is now at `packages/core/src/`, so the paths still work since tsup.config.ts and src/ are in the same directory.

**Step 2: Verify build works**

Run: `cd packages/core && pnpm tsup`
Expected: Builds successfully, creates `packages/core/dist/`

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move tsup.config.ts to packages/core"
```

---

### Task 11: Move remaining core config files

**Files:**

- Move: `vitest.config.ts` -> `packages/core/vitest.config.ts` (if exists at root)
- Move: `.releaserc.json` -> `packages/core/.releaserc.json`
- Move: `playwright.config.ts` -> `packages/core/playwright.config.ts` (if exists)

**Step 1: Move test and release configs**

```bash
git mv .releaserc.json packages/core/.releaserc.json
```

Move any root-level vitest.config.ts and playwright.config.ts to packages/core/ as well. Check first if they exist at root:

```bash
ls vitest.config.ts playwright.config.ts 2>/dev/null
```

If they exist, move them:

```bash
git mv vitest.config.ts packages/core/vitest.config.ts 2>/dev/null
git mv playwright.config.ts packages/core/playwright.config.ts 2>/dev/null
```

**Step 2: Verify test still works**

Run: `cd packages/core && pnpm vitest run --config tests/unit/vitest.config.ts`
Expected: Tests pass

**Step 3: Commit**

```bash
git add -A
git commit -m "refactor: move release and test configs to packages/core"
```

---

### Task 12: Install core dependencies and verify full build/test cycle

**Files:**

- Modify: `packages/core/package.json` (ensure all deps listed)

**Step 1: Install all workspace dependencies**

```bash
pnpm install
```

**Step 2: Verify the full build cycle**

```bash
cd packages/core && pnpm run build
```

Expected: Build succeeds, `packages/core/dist/` contains all expected outputs

**Step 3: Verify tests pass**

```bash
cd packages/core && pnpm run test:unit
```

Expected: All unit tests pass

**Step 4: Verify Nx can run the targets**

```bash
pnpm nx run @strata-game-library/core:build
pnpm nx run @strata-game-library/core:test
```

Expected: Both succeed. Second run should show "cache hit" for build.

**Step 5: Commit any lockfile changes**

```bash
git add pnpm-lock.yaml
git commit -m "chore: update lockfile after core package migration"
```

---

## Phase 3: Shaders Package

### Task 13: Copy shaders from standalone repo

**Files:**

- Create: `packages/shaders/`
- Create: `packages/shaders/src/` (from `/Users/jbogaty/src/strata-game-library/shaders/src/`)

**Step 1: Create directory and copy source**

```bash
mkdir -p packages/shaders
cp -r /Users/jbogaty/src/strata-game-library/shaders/src packages/shaders/src
```

**Step 2: Verify all 14 files copied**

Run: `ls packages/shaders/src/`
Expected: chunks.ts, clouds.ts, fur.ts, godRays.ts, index.ts, instancing-wind.ts, materials/, raymarching.ts, sky.ts, terrain.ts, types.ts, volumetrics-components.ts, volumetrics.ts, water.ts

**Step 3: Commit**

```bash
git add packages/shaders/src
git commit -m "feat(shaders): add standalone shaders source (superior implementations)"
```

---

### Task 14: Create packages/shaders/package.json

**Files:**

- Create: `packages/shaders/package.json`

**Step 1: Create the package.json**

Copy from the standalone repo and update repository URLs:

```json
{
  "name": "@strata-game-library/shaders",
  "version": "1.0.2",
  "description": "GLSL shader collection for Strata 3D - terrain, water, clouds, volumetric effects",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./types": {
      "types": "./dist/types.d.ts",
      "import": "./dist/types.js"
    },
    "./chunks": {
      "types": "./dist/chunks.d.ts",
      "import": "./dist/chunks.js"
    },
    "./clouds": {
      "types": "./dist/clouds.d.ts",
      "import": "./dist/clouds.js"
    },
    "./fur": {
      "types": "./dist/fur.d.ts",
      "import": "./dist/fur.js"
    },
    "./godRays": {
      "types": "./dist/godRays.d.ts",
      "import": "./dist/godRays.js"
    },
    "./instancing-wind": {
      "types": "./dist/instancing-wind.d.ts",
      "import": "./dist/instancing-wind.js"
    },
    "./materials": {
      "types": "./dist/materials/index.d.ts",
      "import": "./dist/materials/index.js"
    },
    "./raymarching": {
      "types": "./dist/raymarching.d.ts",
      "import": "./dist/raymarching.js"
    },
    "./sky": {
      "types": "./dist/sky.d.ts",
      "import": "./dist/sky.js"
    },
    "./terrain": {
      "types": "./dist/terrain.d.ts",
      "import": "./dist/terrain.js"
    },
    "./volumetrics": {
      "types": "./dist/volumetrics.d.ts",
      "import": "./dist/volumetrics.js"
    },
    "./volumetrics-components": {
      "types": "./dist/volumetrics-components.d.ts",
      "import": "./dist/volumetrics-components.js"
    },
    "./water": {
      "types": "./dist/water.d.ts",
      "import": "./dist/water.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "lint": "biome lint src/",
    "lint:fix": "biome lint --write src/",
    "format": "biome format --write src/",
    "prepublishOnly": "pnpm run build"
  },
  "keywords": ["glsl", "shaders", "three", "threejs", "webgl", "strata"],
  "author": "Jon Bogaty <jon@jbcom.io>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/strata-game-library/core.git",
    "directory": "packages/shaders"
  },
  "publishConfig": {
    "access": "public"
  },
  "devDependencies": {
    "@types/three": "^0.182.0",
    "glob": "^13.0.0",
    "tsup": "^8.5.0",
    "typescript": "^5.9.3"
  },
  "peerDependencies": {
    "three": ">=0.150.0"
  }
}
```

**Step 2: Commit**

```bash
git add packages/shaders/package.json
git commit -m "feat(shaders): add package.json for shaders package"
```

---

### Task 15: Create packages/shaders/tsconfig.json and tsup.config.ts

**Files:**

- Create: `packages/shaders/tsconfig.json`
- Create: `packages/shaders/tsup.config.ts`

**Step 1: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 2: Copy tsup.config.ts from standalone repo**

```bash
cp /Users/jbogaty/src/strata-game-library/shaders/tsup.config.ts packages/shaders/tsup.config.ts
```

**Step 3: Update root tsconfig.json references**

Add shaders to the root tsconfig.json references:

```json
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "packages/core" },
    { "path": "packages/shaders" }
  ]
}
```

**Step 4: Install and build**

```bash
pnpm install
cd packages/shaders && pnpm run build
```

Expected: Build succeeds

**Step 5: Commit**

```bash
git add packages/shaders/tsconfig.json packages/shaders/tsup.config.ts tsconfig.json pnpm-lock.yaml
git commit -m "feat(shaders): add build configuration for shaders package"
```

---

### Task 16: Merge refractionRatio into shaders CrystalMaterial

**Files:**

- Modify: `packages/shaders/src/materials/index.ts`

**Step 1: Read both versions of materials/index.ts**

Read `packages/shaders/src/materials/index.ts` and `packages/core/src/shaders/materials/index.ts` to identify the `refractionRatio` parameter in the core version's `CrystalMaterial`.

**Step 2: Add refractionRatio to the shaders package CrystalMaterial**

Find the CrystalMaterial creation function in `packages/shaders/src/materials/index.ts` and add the `refractionRatio` option that exists in the core version but is missing from standalone.

**Step 3: Verify build**

```bash
cd packages/shaders && pnpm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add packages/shaders/src/materials/index.ts
git commit -m "feat(shaders): merge refractionRatio into CrystalMaterial from core"
```

---

### Task 17: Remove old shaders from core and add dependency

**Files:**

- Delete: `packages/core/src/shaders/` (entire directory)
- Modify: `packages/core/package.json` (add shaders dependency)
- Modify: `packages/core/tsup.config.ts` (remove shader entries)

**Step 1: Remove the old shader source from core**

```bash
rm -rf packages/core/src/shaders
```

**Step 2: Add shaders as a workspace dependency in core's package.json**

Add to `packages/core/package.json` dependencies:

```json
{
  "dependencies": {
    "@strata-game-library/shaders": "workspace:*"
  }
}
```

**Step 3: Create a re-export file in core**

Create `packages/core/src/shaders.ts` (a single file, not a directory):

```typescript
export * from '@strata-game-library/shaders';
```

This maintains backward compatibility for consumers importing from `@strata-game-library/core/shaders`.

**Step 4: Update tsup.config.ts**

Remove all `shaders/*` entries from the entry map in `packages/core/tsup.config.ts`:

Remove these lines:

```typescript
'shaders/index': 'src/shaders/index.ts',
'shaders/water': 'src/shaders/water.ts',
'shaders/clouds': 'src/shaders/clouds.ts',
'shaders/terrain': 'src/shaders/terrain.ts',
'shaders/volumetrics': 'src/shaders/volumetrics.ts',
'shaders/sky': 'src/shaders/sky.ts',
'shaders/fur': 'src/shaders/fur.ts',
'shaders/godRays': 'src/shaders/godRays.ts',
```

Replace with a single re-export entry:

```typescript
'shaders/index': 'src/shaders.ts',
```

Also add `@strata-game-library/shaders` to the `external` array.

**Step 5: Update core's package.json exports**

Remove the individual shader subpath exports (`./shaders/water`, `./shaders/clouds`, etc.) from core's package.json. Keep only `./shaders` which now re-exports from the shaders package.

**Step 6: Install and verify build**

```bash
pnpm install
cd packages/core && pnpm run build
```

Expected: Build succeeds. The `shaders/index.js` output re-exports from the shaders package.

**Step 7: Commit**

```bash
git add -A
git commit -m "refactor(core): replace inline shaders with @strata-game-library/shaders dependency"
```

---

## Phase 4: Presets Package

### Task 18: Copy presets from standalone repo

**Files:**

- Create: `packages/presets/`

**Step 1: Create directory and copy**

```bash
mkdir -p packages/presets
cp -r /Users/jbogaty/src/strata-game-library/presets/src packages/presets/src
cp -r /Users/jbogaty/src/strata-game-library/presets/tests packages/presets/tests 2>/dev/null || true
cp /Users/jbogaty/src/strata-game-library/presets/tsup.config.ts packages/presets/tsup.config.ts
cp /Users/jbogaty/src/strata-game-library/presets/vitest.config.ts packages/presets/vitest.config.ts 2>/dev/null || true
```

**Step 2: Commit**

```bash
git add packages/presets/src packages/presets/tests packages/presets/tsup.config.ts packages/presets/vitest.config.ts
git commit -m "feat(presets): add presets source from standalone repo"
```

---

### Task 19: Create packages/presets/package.json and tsconfig.json

**Files:**

- Create: `packages/presets/package.json`
- Create: `packages/presets/tsconfig.json`

**Step 1: Create package.json**

Copy from the standalone presets repo and update:

- Change `@strata-game-library/core` dependency to `"workspace:*"`
- Update `repository.url` to monorepo URL with `"directory": "packages/presets"`
- Keep all 28+ subpath exports as-is
- Keep all scripts (build, test, lint, typecheck)

**Step 2: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Step 3: Update root tsconfig.json references**

Add presets:

```json
{
  "references": [
    { "path": "packages/core" },
    { "path": "packages/shaders" },
    { "path": "packages/presets" }
  ]
}
```

**Step 4: Install and build**

```bash
pnpm install
cd packages/presets && pnpm run build
```

Expected: Build succeeds (the `workspace:*` reference to core resolves within the monorepo)

**Step 5: Run tests**

```bash
cd packages/presets && pnpm run test
```

Expected: Tests pass

**Step 6: Commit**

```bash
git add packages/presets/package.json packages/presets/tsconfig.json tsconfig.json pnpm-lock.yaml
git commit -m "feat(presets): configure presets package with workspace:* dependency on core"
```

---

## Phase 5: Smaller Packages (audio-synth + model-synth)

### Task 20: Migrate audio-synth

**Files:**

- Create: `packages/audio-synth/`

**Step 1: Copy source**

```bash
mkdir -p packages/audio-synth
cp -r /Users/jbogaty/src/strata-game-library/audio-synth/src packages/audio-synth/src
```

**Step 2: Create package.json**

Create `packages/audio-synth/package.json` based on the standalone version, with these changes:

- Keep `name`: `@strata-game-library/audio-synth`
- Change `build` script from `tsc` to `tsup`
- Add `tsup` to devDependencies
- Update repository URL to monorepo with `"directory": "packages/audio-synth"`

**Step 3: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 4: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'core/index': 'src/core/index.ts',
    'components/index': 'src/components/index.ts',
    'presets/index': 'src/presets/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  target: 'ES2022',
  jsx: 'automatic',
  external: ['tone', 'react', 'react-dom', '@react-three/fiber', 'three'],
  treeshake: true,
  minify: false,
  keepNames: true,
  banner: {
    js: '/* @strata-game-library/audio-synth - ESM Build */',
  },
});
```

Verify the actual entry points by reading `packages/audio-synth/src/index.ts` and adjusting the `entry` map accordingly.

**Step 5: Update root tsconfig.json references**

Add audio-synth to references.

**Step 6: Install and build**

```bash
pnpm install
cd packages/audio-synth && pnpm run build
```

Expected: Build succeeds

**Step 7: Commit**

```bash
git add packages/audio-synth
git commit -m "feat(audio-synth): migrate audio-synth with tsup build"
```

---

### Task 21: Migrate model-synth from feature branch

**Files:**

- Create: `packages/model-synth/`

**Step 1: Copy source from feature branch**

```bash
mkdir -p packages/model-synth
cd /Users/jbogaty/src/strata-game-library/model-synth && git checkout origin/feature/initial-implementation -- src/
cp -r /Users/jbogaty/src/strata-game-library/model-synth/src packages/model-synth/src
cd /Users/jbogaty/src/strata-game-library/model-synth && git checkout main -- . 2>/dev/null || true
```

**Step 2: Create package.json**

Create `packages/model-synth/package.json`:

```json
{
  "name": "@strata-game-library/model-synth",
  "version": "0.1.0",
  "description": "Procedural 3D model generation using Meshy API",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "typecheck": "tsc --noEmit",
    "lint": "biome lint src/",
    "test": "vitest run",
    "prepublishOnly": "pnpm run build"
  },
  "author": "Jon Bogaty <jon@jbcom.io>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/strata-game-library/core.git",
    "directory": "packages/model-synth"
  },
  "publishConfig": {
    "access": "public"
  },
  "dependencies": {
    "node-fetch": "^3.3.2"
  },
  "devDependencies": {
    "@types/node": "^25.0.0",
    "tsup": "^8.5.0",
    "typescript": "^5.9.3",
    "vitest": "^4.0.15"
  }
}
```

**Step 3: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "lib": ["ES2022"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

Note: No DOM lib — this is a pure Node.js API client.

**Step 4: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'ES2022',
  external: ['node-fetch'],
  treeshake: true,
  minify: false,
  keepNames: true,
  banner: {
    js: '/* @strata-game-library/model-synth - ESM Build */',
  },
});
```

**Step 5: Update root tsconfig.json references**

Add model-synth to references.

**Step 6: Install and build**

```bash
pnpm install
cd packages/model-synth && pnpm run build
```

Expected: Build succeeds

**Step 7: Commit**

```bash
git add packages/model-synth
git commit -m "feat(model-synth): migrate model-synth from feature branch with tsup build"
```

---

## Phase 6: Native Plugins

### Task 22: Migrate capacitor-plugin

**Files:**

- Create: `packages/capacitor-plugin/`

**Step 1: Copy source, native code, and configs**

```bash
mkdir -p packages/capacitor-plugin
cp -r /Users/jbogaty/src/strata-game-library/capacitor-plugin/src packages/capacitor-plugin/src
cp -r /Users/jbogaty/src/strata-game-library/capacitor-plugin/ios packages/capacitor-plugin/ios
cp -r /Users/jbogaty/src/strata-game-library/capacitor-plugin/android packages/capacitor-plugin/android
cp /Users/jbogaty/src/strata-game-library/capacitor-plugin/tsup.config.ts packages/capacitor-plugin/tsup.config.ts
cp /Users/jbogaty/src/strata-game-library/capacitor-plugin/vitest.config.ts packages/capacitor-plugin/vitest.config.ts 2>/dev/null || true
```

**Step 2: Create package.json**

Copy from standalone repo, update:

- Repository URL to monorepo with `"directory": "packages/capacitor-plugin"`
- Keep `capacitor` config section as-is

**Step 3: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "ios", "android", "**/*.test.ts"]
}
```

**Step 4: Update root tsconfig.json references**

Add capacitor-plugin.

**Step 5: Install and build**

```bash
pnpm install
cd packages/capacitor-plugin && pnpm run build
```

Expected: Build succeeds

**Step 6: Run tests**

```bash
cd packages/capacitor-plugin && pnpm run test
```

Expected: Tests pass

**Step 7: Commit**

```bash
git add packages/capacitor-plugin
git commit -m "feat(capacitor-plugin): migrate capacitor plugin with native ios/android"
```

---

### Task 23: Migrate react-native-plugin

**Files:**

- Create: `packages/react-native-plugin/`

**Step 1: Copy source and native code**

```bash
mkdir -p packages/react-native-plugin
cp -r /Users/jbogaty/src/strata-game-library/react-native-plugin/src packages/react-native-plugin/src
cp -r /Users/jbogaty/src/strata-game-library/react-native-plugin/ios packages/react-native-plugin/ios
cp -r /Users/jbogaty/src/strata-game-library/react-native-plugin/android packages/react-native-plugin/android
```

**Step 2: Create package.json**

Copy from standalone repo, with changes:

- Change `build` script from `tsc` to `tsup`
- Change `test` script from `jest` to `vitest run`
- Replace jest devDependency with vitest
- Add tsup devDependency
- Change `@strata-game-library/core` peerDependency to `"workspace:*"` or keep `">=1.4.0"` for external consumers
- Update repository URL

**Step 3: Create tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-native"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "ios", "android"]
}
```

Note: `jsx: "react-native"` overrides the base config's `react-jsx` since React Native uses its own JSX transform.

**Step 4: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/index.tsx' },
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'ES2022',
  jsx: 'preserve',
  external: ['react', 'react-native', '@strata-game-library/core'],
  treeshake: true,
  minify: false,
  keepNames: true,
  banner: {
    js: '/* @strata-game-library/react-native-plugin - ESM Build */',
  },
});
```

**Step 5: Update root tsconfig.json references**

Add react-native-plugin.

**Step 6: Install and build**

```bash
pnpm install
cd packages/react-native-plugin && pnpm run build
```

Expected: Build succeeds

**Step 7: Commit**

```bash
git add packages/react-native-plugin
git commit -m "feat(react-native-plugin): migrate with tsup build and vitest"
```

---

## Phase 7: Apps

### Task 24: Migrate docs site

**Files:**

- Create: `apps/docs/`

**Step 1: Copy the Astro docs site**

```bash
mkdir -p apps/docs
cp -r /Users/jbogaty/src/strata-game-library/strata-game-library.github.io/src apps/docs/src
cp -r /Users/jbogaty/src/strata-game-library/strata-game-library.github.io/public apps/docs/public
cp /Users/jbogaty/src/strata-game-library/strata-game-library.github.io/astro.config.mjs apps/docs/astro.config.mjs
cp /Users/jbogaty/src/strata-game-library/strata-game-library.github.io/tsconfig.json apps/docs/tsconfig.astro.json
cp /Users/jbogaty/src/strata-game-library/strata-game-library.github.io/sidebar.config.mjs apps/docs/sidebar.config.mjs 2>/dev/null || true
```

**Step 2: Create apps/docs/package.json**

```json
{
  "name": "@strata-game-library/docs",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  },
  "dependencies": {
    "@astrojs/starlight": "^0.37.1",
    "astro": "^5.6.1",
    "sharp": "^0.34.2"
  }
}
```

**Step 3: Install and verify**

```bash
pnpm install
cd apps/docs && pnpm run build
```

Expected: Astro site builds successfully

**Step 4: Commit**

```bash
git add apps/docs
git commit -m "feat(docs): migrate Astro docs site to apps/docs"
```

---

### Task 25: Merge examples from both repos

**Files:**

- Create: `apps/examples/`

**Step 1: Create directory structure**

```bash
mkdir -p apps/examples
```

**Step 2: Copy best version of each example**

Per the comparison results:

```bash
# Standalone wins: basic-terrain, water-scene, sky-volumetrics
cp -r /Users/jbogaty/src/strata-game-library/examples/basic-terrain apps/examples/basic-terrain
cp -r /Users/jbogaty/src/strata-game-library/examples/water-scene apps/examples/water-scene
cp -r /Users/jbogaty/src/strata-game-library/examples/sky-volumetrics apps/examples/sky-volumetrics

# Core wins: vegetation-showcase
cp -r /Users/jbogaty/src/strata-game-library/strata/examples/vegetation-showcase apps/examples/vegetation-showcase 2>/dev/null || true

# Core only: declarative-game, world-topology
cp -r /Users/jbogaty/src/strata-game-library/strata/examples/declarative-game apps/examples/declarative-game 2>/dev/null || true
cp -r /Users/jbogaty/src/strata-game-library/strata/examples/world-topology apps/examples/world-topology 2>/dev/null || true

# Merge: api-showcase (use standalone as base, incorporate core's modular exports)
cp -r /Users/jbogaty/src/strata-game-library/examples/api-showcase apps/examples/api-showcase
```

Note: Check which examples actually exist in each repo's `examples/` directory before copying. Some may not exist if they were only in planning stages.

**Step 3: Update each example's package.json**

For each example, update the `@strata-game-library/core` (or `@jbcom/strata`) dependency to `workspace:*`:

```json
{
  "dependencies": {
    "@strata-game-library/core": "workspace:*",
    "@strata-game-library/shaders": "workspace:*"
  }
}
```

**Step 4: Create apps/examples root package.json**

```json
{
  "name": "@strata-game-library/examples",
  "private": true,
  "version": "0.0.1",
  "scripts": {
    "dev:terrain": "pnpm --filter strata-example-basic-terrain dev",
    "dev:water": "pnpm --filter strata-example-water-scene dev",
    "dev:sky": "pnpm --filter strata-example-sky-volumetrics dev"
  }
}
```

Or if examples are independent Vite apps, each one has its own package.json and they're all discovered by the workspace glob `apps/*`.

**Step 5: Install and verify at least one example builds**

```bash
pnpm install
cd apps/examples/basic-terrain && pnpm run build
```

Expected: Build succeeds

**Step 6: Commit**

```bash
git add apps/examples
git commit -m "feat(examples): merge best examples from both repos"
```

---

## Phase 8: CI/CD

### Task 26: Create unified CI workflow with Nx

**Files:**

- Modify: `.github/workflows/ci.yml`

**Step 1: Replace the CI workflow**

Create a new `.github/workflows/ci.yml` that uses Nx affected commands:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  main:
    name: Build, Lint, Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - name: Get pnpm store directory
        id: pnpm-cache
        shell: bash
        run: |
          STORE_PATH=$(pnpm store path --silent 2>/dev/null || true)
          STORE_PATH="${STORE_PATH:-${XDG_DATA_HOME:-$HOME/.local/share}/pnpm/store}"
          echo "store=$STORE_PATH" >> $GITHUB_OUTPUT
      - uses: actions/cache@v4
        with:
          path: ${{ steps.pnpm-cache.outputs.store }}
          key: pnpm-store-${{ hashFiles('pnpm-lock.yaml') }}
          restore-keys: pnpm-store-
      - name: Nx cache
        uses: actions/cache@v4
        with:
          path: .nx/cache
          key: nx-${{ github.ref }}-${{ github.sha }}
          restore-keys: |
            nx-${{ github.ref }}-
            nx-refs/heads/main-
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Lint (affected)
        run: pnpm nx affected -t lint --base=origin/main
      - name: Type check (affected)
        run: pnpm nx affected -t typecheck --base=origin/main
      - name: Build (affected)
        run: pnpm nx affected -t build --base=origin/main
      - name: Test (affected)
        run: pnpm nx affected -t test --base=origin/main

  e2e:
    name: E2E Tests
    needs: main
    if: contains(github.event.pull_request.labels.*.name, 'run-e2e')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
      - name: Build all
        run: pnpm nx run-many -t build
      - name: Run E2E tests
        run: pnpm nx affected -t test:e2e --base=origin/main
```

Key improvement: `fetch-depth: 0` enables Nx to diff against origin/main for affected commands. Nx cache stored in GitHub Actions cache.

**Step 2: Remove redundant ecosystem/AI workflows**

Review `.github/workflows/` and remove files that were part of the control-center sync cascade:

- `ecosystem-*.yml` files (10 files)
- Any sync-related workflows

Keep: `ci.yml`, `cd.yml` (will update for per-package release), `security.yml`

**Step 3: Commit**

```bash
git add .github/workflows/
git commit -m "ci: replace single-package CI with Nx affected workflow"
```

---

### Task 27: Create per-package release workflow

**Files:**

- Modify: `.github/workflows/cd.yml`

**Step 1: Create a release workflow that handles multiple packages**

Create/update `.github/workflows/cd.yml`:

```yaml
name: Release

on:
  push:
    branches: [main]

permissions:
  contents: write
  packages: write
  id-token: write

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          registry-url: 'https://registry.npmjs.org'
      - uses: pnpm/action-setup@v4
        with:
          version: 9
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Build all
        run: pnpm nx run-many -t build
      - name: Release affected packages
        run: pnpm nx affected -t release --base=origin/main~1
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This assumes each package that needs publishing has a `release` script in its package.json using semantic-release.

**Step 2: Commit**

```bash
git add .github/workflows/cd.yml
git commit -m "ci: add per-package release workflow with Nx affected"
```

---

## Phase 9: Cleanup and Verification

### Task 28: Remove old root-level files that moved to packages/core

**Files:**

- Delete: any remaining configs at root that belong in packages/core
- Verify: root only has monorepo-level configs

**Step 1: Check for orphaned files**

```bash
ls *.config.* .releaserc* 2>/dev/null
```

Remove any that should have moved to packages/core (tsup.config.ts, vitest.config.ts, playwright.config.ts, .releaserc.json). Keep biome.json (shared), tsconfig.base.json (shared), tsconfig.json (references), nx.json, vitest.workspace.ts.

**Step 2: Remove old examples directory at root if it exists**

```bash
rm -rf examples/ 2>/dev/null
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore: clean up orphaned root configs after migration"
```

---

### Task 29: Full verification

**Step 1: Install all dependencies**

```bash
pnpm install
```

**Step 2: Build all packages**

```bash
pnpm nx run-many -t build
```

Expected: All packages build successfully

**Step 3: Run all tests**

```bash
pnpm nx run-many -t test
```

Expected: All tests pass

**Step 4: Run lint across all packages**

```bash
pnpm nx run-many -t lint
```

Expected: No lint errors

**Step 5: Run type checking**

```bash
pnpm nx run-many -t typecheck
```

Expected: No type errors

**Step 6: View the dependency graph**

```bash
pnpm nx graph
```

Expected: Graph shows:

- `core` depends on `shaders`
- `presets` depends on `core`
- Native plugins are standalone (or depend on core via peer dep)
- Examples depend on core + shaders

**Step 7: Test caching**

```bash
pnpm nx run-many -t build
```

Expected: All targets show "[local cache]" on second run

**Step 8: Commit lockfile if changed**

```bash
git add pnpm-lock.yaml
git commit -m "chore: final lockfile after full monorepo verification"
```

---

### Task 30: Update documentation

**Files:**

- Modify: `CLAUDE.md`
- Modify: `README.md`
- Modify: `AGENTS.md`

**Step 1: Update CLAUDE.md**

Update the project overview, directory structure, and commands sections to reflect the monorepo structure. Key changes:

- Architecture section shows `packages/` and `apps/` structure
- Commands use `pnpm nx run-many -t build` instead of `pnpm run build`
- Per-package commands: `pnpm nx run @strata-game-library/core:build`
- Note about `pnpm nx affected` for CI

**Step 2: Update README.md**

- Add monorepo structure overview
- Package listing with descriptions
- Getting started: `pnpm install && pnpm nx run-many -t build`
- Per-package development instructions

**Step 3: Commit**

```bash
git add CLAUDE.md README.md AGENTS.md
git commit -m "docs: update project docs for monorepo structure"
```

---

## Summary of All Packages After Migration

| Package | Path | Version | Publishes to npm |
|---------|------|---------|-----------------|
| @strata-game-library/core | packages/core | 1.4.11 | Yes |
| @strata-game-library/shaders | packages/shaders | 1.0.2 | Yes |
| @strata-game-library/presets | packages/presets | 1.1.1 | Yes |
| @strata-game-library/audio-synth | packages/audio-synth | 1.0.2 | Yes |
| @strata-game-library/model-synth | packages/model-synth | 0.1.0 | Yes |
| @strata-game-library/capacitor-plugin | packages/capacitor-plugin | 1.0.2 | Yes |
| @strata-game-library/react-native-plugin | packages/react-native-plugin | 1.1.0 | Yes |
| @strata-game-library/docs | apps/docs | 0.0.1 | No (private) |
| @strata-game-library/examples | apps/examples | 0.0.1 | No (private) |
