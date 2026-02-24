# Monorepo Migration Design

**Date:** 2026-02-24
**Status:** Approved
**Epic:** Consolidate strata-game-library organization into single monorepo

## Problem

The strata-game-library GitHub organization has 11 repositories with fragmented CI/CD, duplicated configurations, overlapping code (especially shaders), and a three-tier sync cascade (enterprise control-center -> org control-center -> individual repos) that adds complexity without proportional value. Cross-package development requires coordinating changes across multiple repos.

## Solution

Consolidate all repositories into a single Nx + pnpm monorepo with publishable packages and deployable apps.

## Tool Choice: Nx + pnpm Workspaces

**Why Nx:**
- Industry-standard task orchestration for JS/TS monorepos
- Computation caching (local + remote) eliminates redundant builds/tests
- Dependency graph analysis enables affected-only CI
- Project inference from package.json (no nx-specific project.json needed)
- Integrates natively with pnpm workspaces

**Why not alternatives:**
- Turborepo: JS/TS only, less capable dependency graph
- Moon: Immature Swift/Kotlin support
- Bazel: Overkill for this scale (~20K LOC total)
- Pants: Python-first, poor JS/TS ergonomics

## Directory Structure

```
strata/                          # monorepo root
├── nx.json                      # Nx config: caching, task pipelines
├── pnpm-workspace.yaml          # packages: [packages/*, apps/*]
├── package.json                 # root scripts + shared devDependencies
├── tsconfig.base.json           # shared TypeScript config (strict)
├── biome.json                   # shared Biome config (2-space indent)
├── vitest.workspace.ts          # vitest workspace config
├── playwright.config.ts         # E2E config
│
├── packages/                    # publishable npm packages
│   ├── core/                    # @strata-game-library/core
│   │   ├── package.json
│   │   ├── tsconfig.json        # extends ../../tsconfig.base.json
│   │   ├── tsup.config.ts
│   │   └── src/                 # current strata/src/ (minus shaders)
│   │
│   ├── shaders/                 # @strata-game-library/shaders
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/                 # standalone repo (superior implementations)
│   │
│   ├── presets/                 # @strata-game-library/presets
│   │   ├── package.json         # depends on core via workspace:*
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/
│   │
│   ├── audio-synth/             # @strata-game-library/audio-synth
│   │   ├── package.json         # Tone.js based
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/
│   │
│   ├── model-synth/             # @strata-game-library/model-synth
│   │   ├── package.json         # Meshy API client
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── src/                 # from feature branch
│   │
│   ├── capacitor-plugin/        # @strata-game-library/capacitor-plugin
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   ├── ios/                 # native Swift code
│   │   ├── android/             # native Java code
│   │   └── src/
│   │
│   └── react-native-plugin/     # @strata-game-library/react-native-plugin
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts
│       ├── ios/                 # native Swift code
│       ├── android/             # native Kotlin code
│       └── src/
│
├── apps/                        # non-published, deployable
│   ├── docs/                    # Astro + Starlight site
│   │   ├── package.json
│   │   ├── astro.config.mjs
│   │   └── src/
│   │
│   └── examples/                # merged example projects
│       ├── basic-terrain/
│       ├── water-scene/
│       ├── sky-volumetrics/
│       ├── vegetation-showcase/
│       ├── api-showcase/
│       ├── declarative-game/
│       └── world-topology/
│
├── .github/                     # unified CI/CD
│   └── workflows/
│       ├── ci.yml               # lint + typecheck + test (affected only)
│       ├── release.yml          # semantic-release per package
│       └── docs.yml             # deploy docs site
│
├── docs/                        # project docs (architecture, RFCs, plans)
├── tests/                       # root-level cross-package E2E tests
└── memory-bank/                 # AI context files
```

## Package Migration Details

### packages/core (from strata/src/)

- Move `src/` to `packages/core/src/`
- Remove `src/shaders/` (replaced by packages/shaders)
- Core re-exports shaders: `export * from '@strata-game-library/shaders'`
- Update all internal imports
- Keep all 30+ subpath exports
- Preserve existing tests in `packages/core/tests/`

### packages/shaders (from standalone shaders repo)

Standalone wins every 1:1 comparison. Actions:
- Use standalone `src/` as-is
- **Merge from core**: Add `refractionRatio` parameter to CrystalMaterial
- Includes `types.ts` (IUniforms, UniformValue) and `chunks.ts` (NoiseChunks, MathChunks)
- Fixes 5 bugs present in core:
  1. water.ts: `vElevation = pos.z` -> `pos.y`
  2. volumetrics.ts: duplicate variable declaration
  3. volumetrics.ts: 3 missing divide-by-zero safety checks

### packages/presets (from presets repo)

- Move as-is (12,690 LOC, 45 files, 28 exports)
- Update `@strata-game-library/core` dependency to `workspace:*`
- 17 files import from core — all continue working via workspace protocol
- Preserve existing tests (9 test files + E2E)

### packages/audio-synth (from audio-synth repo)

- Move src/ as-is (1,098 LOC, 9 files)
- **Add**: biome.json (extends root), tsup.config.ts, vitest config
- **Migrate**: tsc build -> tsup build
- Complementary to core's Howler.js audio (Tone.js synthesis vs file playback)

### packages/model-synth (from model-synth repo feature branch)

- Use `origin/feature/initial-implementation` branch (~1,334 LOC)
- Main branch is scaffolded only (package name still "template")
- **Add**: biome.json, tsup.config.ts, vitest config
- **Migrate**: eslint -> biome
- Fix package name from "template" to "@strata-game-library/model-synth"

### packages/capacitor-plugin (from capacitor-plugin repo)

- Move as-is (~2,700 LOC total)
- Standalone package, no imports from core
- Preserve native ios/ and android/ directories
- Update build tooling to match monorepo standards

### packages/react-native-plugin (from react-native-plugin repo)

- Move as-is (356 LOC TS + 701 native)
- **Migrate**: jest -> vitest, tsc -> tsup
- Preserve native ios/ and android/ directories

### apps/docs (from strata-game-library.github.io)

- Move Astro + Starlight site (315 markdown files, ~23.6K lines)
- Update package references in code examples to use workspace versions
- Configure for deployment from monorepo

### apps/examples (merged from both repos)

Best version per project:
| Example | Source | Reason |
|---------|--------|--------|
| basic-terrain | standalone | Uses actual fbm API |
| water-scene | standalone | Physics + postprocessing |
| sky-volumetrics | standalone | Postprocessing integration |
| vegetation-showcase | core | Uses newer 5-param fbm API |
| api-showcase | merge both | Standalone has TypeDoc, core has modular exports |
| declarative-game | core only | RFC-004 implementation |
| world-topology | core only | RFC-003 implementation |

### .github/ (from .github + control-center repos)

- Consolidate org-level settings and workflows
- Eliminate three-tier sync cascade
- Single CI workflow with Nx affected-only builds
- Per-package semantic-release

## Unified Toolchain

| Tool | Purpose | Config Location |
|------|---------|----------------|
| pnpm | Package management | pnpm-workspace.yaml |
| Nx | Task orchestration + caching | nx.json |
| tsup | Build (all packages) | Per-package tsup.config.ts |
| Biome | Lint + format (2-space indent) | Root biome.json |
| Vitest | Unit/integration testing | vitest.workspace.ts |
| Playwright | E2E testing | playwright.config.ts |
| TypeScript | Type checking (strict) | tsconfig.base.json + extends |
| semantic-release | Versioning | Per-package config |
| Husky + lint-staged | Git hooks | Root package.json |

## Configuration Strategy

### tsconfig.base.json
- strict: true
- noUnusedLocals: true
- noUnusedParameters: true
- ESNext target, NodeNext module resolution
- Each package extends with `"extends": "../../tsconfig.base.json"`

### biome.json
- 2-space indentation (standardized across all packages)
- Root config, packages inherit automatically
- Replaces eslint in model-synth, ruff references in any Python

### nx.json
- `targetDefaults` for build, test, lint, typecheck
- `namedInputs` for production vs test files
- Task pipeline: test depends on build, lint is independent
- Cache: build, test, lint, typecheck outputs

## Migration Order

1. **Phase 1**: Root config (nx.json, tsconfig.base.json, biome.json, pnpm-workspace.yaml)
2. **Phase 2**: Core package (move src/, update imports)
3. **Phase 3**: Shaders package (standalone + core merge)
4. **Phase 4**: Presets package (update workspace deps)
5. **Phase 5**: Audio-synth + model-synth (smaller packages)
6. **Phase 6**: Native plugins (capacitor + react-native)
7. **Phase 7**: Apps (docs site + examples)
8. **Phase 8**: CI/CD (unified workflows, eliminate control-center)
9. **Phase 9**: Cleanup (remove old configs, update README, archive source repos)

## Git History

- Use `git subtree add` or direct copy (history preserved in source repos)
- Source repos will be archived after migration, not deleted
- Monorepo starts fresh commit history for clarity

## Success Criteria

- All packages build independently (`nx run-many --target=build`)
- All tests pass (`nx run-many --target=test`)
- Workspace protocol resolves correctly (`workspace:*`)
- Nx dependency graph shows correct relationships
- CI runs affected-only on PRs
- Each package publishable to npm independently
- Docs site deploys from monorepo
