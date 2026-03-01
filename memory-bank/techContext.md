---
title: Tech Context
version: "1.0"
updated: 2026-03-01
---

# Tech Context

## Monorepo Tooling

| Tool | Purpose | Version |
|------|---------|---------|
| Nx | Monorepo orchestration, task running, caching | 22.5 |
| pnpm | Package manager with workspace support | Latest |
| tsup | ESM bundling for all packages | Latest |
| TypeScript | Language, strict mode enforced | 5.x |

### Workspace Configuration

- `pnpm-workspace.yaml` defines package locations
- `nx.json` configures Nx with project graph
- Inter-package deps use `workspace:*` protocol
- Build order: shaders -> core -> r3f -> presets

## Build & Development

| Tool | Purpose |
|------|---------|
| tsup | ESM builds for all packages |
| Vitest | Unit and integration testing |
| Playwright | E2E testing (docs site visual regression) |
| Biome | Linting and formatting (replaces ESLint + Prettier) |
| TypeDoc | API documentation generation |

### Key Commands

```bash
pnpm install          # Install all dependencies
pnpm run build        # Build all packages
pnpm run test         # Run all tests
pnpm run lint         # Biome lint
pnpm run typecheck    # TypeScript checking
pnpm run docs         # Generate TypeDoc
```

## CI/CD Pipeline

Four GitHub Actions workflows (all SHA-pinned):

### ci.yml (PR Checks)

- Matrix build: lint/typecheck/build/test per affected package
- Documentation build verification
- E2E tests on labeled PRs
- Dependency review for security

### cd.yml (Continuous Deployment)

- Triggered on push to main
- Runs release-please to create/update Release PRs
- Deploys documentation (independent step)
- Uses `CI_GITHUB_TOKEN` PAT (required -- `GITHUB_TOKEN` can't trigger downstream workflows)
- Has `workflow_dispatch` for manual trigger

### release.yml (npm Publishing)

- Triggered by GitHub Release creation
- Publishes each package individually via **OIDC trusted publishing**
- No npm tokens stored -- pure keyless auth via `id-token: write`
- Requires npm 11.5.1+ (explicit upgrade step)
- Sigstore provenance attached to published packages
- Has `workflow_dispatch` for manual trigger

### automerge.yml (Auto-Merge)

- Auto-merges Dependabot and release-please PRs after CI passes
- Reduces manual merge burden

### Release Flow

```
push to main
  -> release-please creates Release PR
    -> automerge merges it
      -> release-please creates GitHub Releases + tags + CHANGELOGs
        -> release.yml publishes to npm via OIDC
```

## npm Publishing

- **Scope**: `@strata-game-library`
- **Auth**: OIDC trusted publishing (no stored tokens)
- **Versioning**: release-please (conventional commits drive version bumps)
- **Config**: `release-please-config.json` + `.release-please-manifest.json`
- **2FA**: Security key (Touch ID)

### Published Packages

| Package | npm Name | Status |
|---------|----------|--------|
| core | @strata-game-library/core | Published |
| shaders | @strata-game-library/shaders | Published |
| presets | @strata-game-library/presets | Published |
| audio-synth | @strata-game-library/audio-synth | Published |
| capacitor | @strata-game-library/capacitor-plugin | Published (name mismatch) |
| react-native | @strata-game-library/react-native-plugin | Published (name mismatch) |
| r3f | @strata-game-library/r3f | NOT on npm yet |
| reactylon | @strata-game-library/reactylon | NOT on npm yet |
| model-synth | @strata-game-library/model-synth | NOT on npm yet |
| astro | @strata-game-library/astro | NOT on npm yet |

## Documentation

| Tool | Purpose |
|------|---------|
| Astro Starlight | Documentation site framework (312 pages) |
| TypeDoc | API reference generation |
| `scripts/fix-docs-frontmatter.mjs` | Injects Starlight-compatible frontmatter |
| @astrojs/react | Live R3F demo components via `client:load` |

### Live Demos

5 interactive R3F demos embedded in docs: Terrain, Water, Vegetation, Sky, FullScene.

## Key Dependencies

### Core

- `three` -- 3D math and types (peer dependency)
- No React in core

### R3F Adapter

- `@react-three/fiber` -- React Three Fiber
- `@react-three/drei` -- R3F helpers
- `react`, `react-dom`

### Plugins

- `tone` -- Audio synthesis (audio-synth)
- Meshy API -- AI model generation (model-synth)
- `@capacitor/core` -- Native mobile (capacitor)
- `react-native` -- Native bridge (react-native)
- `astro` -- SSG framework (astro)

## Known Gotchas

- `.gitignore` has `/core` (root-only) to block 53MB Biome core dump. Do NOT use bare `core` pattern -- it would match `packages/core/`.
- Branch protection requires PRs for main (enterprise rulesets, source: jbcom). All changes via PRs with squash merge.
- Without `CI_GITHUB_TOKEN` PAT, merged release PRs don't trigger CD. Use `gh workflow run cd.yml` as workaround.
- Node 22 ships npm 10.x but OIDC publishing requires npm 11.5.1+. The `npm install -g npm@latest` step in release.yml handles this.
