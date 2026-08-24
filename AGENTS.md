---
title: Agent protocols
updated: 2026-08-23
status: current
domain: context
---

# AGENTS.md -- Strata Game Library

> **Primary reference for all AI agents** (Claude, Copilot, Cursor, Jules).

## Project Overview

**@jbcom/strata** is a game framework for React Three Fiber, organized as an Nx + pnpm monorepo with 10 packages and 2 apps. It is evolving from a procedural 3D graphics toolkit (terrain, water, sky, ECS, physics) into a complete declarative game framework with orchestration, world topology, and compositional objects.

## Quick Start

### Toolchain (pinned — do not substitute)

| Tool | Version | Pinned by |
|------|---------|-----------|
| Node | 22 | `.nvmrc`, `engines.node` (`>=22 <24`) |
| pnpm | 9.15.9 | `packageManager`, `engines.pnpm` |

Use `corepack` so the pinned pnpm is the one that actually runs:

```bash
corepack enable
nvm use          # or: fnm use — reads .nvmrc
pnpm install     # resolves to pnpm@9.15.9 via packageManager
```

Both pins are load-bearing, not cosmetic:

- **pnpm must stay on 9.x.** `package.json` carries a `pnpm.overrides` block that
  unifies `react`/`react-dom` on a single copy and floors `minimatch` /
  `@isaacs/brace-expansion` to patched versions. **pnpm 11 no longer reads the
  `pnpm` field of `package.json` and does so silently** — no warning, no error —
  so an unpinned pnpm 11 would drop all four overrides while the repo still
  looked patched. pnpm 11 also rewrites ~2400 lockfile lines and injects
  placeholder `allowBuilds` stubs into `pnpm-workspace.yaml`. If this repo ever
  moves to pnpm ≥11, the overrides **must** migrate to `pnpm-workspace.yaml` in
  the same change, and the resolved tree must be re-verified (see below).
- **Node must stay below 24.** Node ≥24 defines a native `Storage` constructor but
  leaves `localStorage` undefined unless `--localstorage-file` is passed. jsdom
  sees `Storage` present, declines to provision its own, and every
  `localStorage`-backed test fails with `Cannot read properties of undefined
  (reading 'clear')` — 25 failures in `packages/core` alone, with no hint that
  the Node version is the cause.

`engine-strict=true` in the root `.npmrc` makes both pins hard failures rather
than warnings, so a wrong Node or pnpm fails at `pnpm install` instead of
surfacing later as unexplained test failures or silently-dropped overrides.

Verify the overrides actually took effect (config parsing is not proof — check
the lockfile, since a stale `node_modules/.pnpm` can retain orphaned copies):

```bash
grep -A6 '^overrides:' pnpm-lock.yaml         # what pnpm actually applied
grep -E '^  (minimatch|brace-expansion)@' pnpm-lock.yaml
pnpm audit                                    # no minimatch/brace-expansion advisories
```

The security floors are pinned to **exact** patched versions, not `>=` ranges: a
range lets pnpm keep an older copy alongside the new one when some other
constraint is satisfied by it. Note that both the scoped
(`@isaacs/brace-expansion`) and unscoped (`brace-expansion`) names are listed —
the tree resolves the unscoped one, so a scoped-only override silently misses it.

### Commands

```bash
pnpm run build      # Build the library
pnpm run test       # Run all tests
pnpm run lint       # Lint with Biome
pnpm run typecheck  # Type checking
```

### Additional Commands

```bash
# Testing
pnpm run test:unit         # Unit tests only
pnpm run test:integration  # Integration tests only
pnpm run test:e2e          # Playwright E2E tests
pnpm run test:coverage     # Tests with coverage

# Code Quality
pnpm run lint:fix          # Auto-fix lint issues
pnpm run format            # Biome format

# Documentation
pnpm run docs              # Generate TypeDoc
pnpm run demo              # Serve demo files
```

## Architecture

```text
packages/
  core/              # Pure TypeScript (NO React imports!)
  shaders/           # Standalone GLSL shaders
  presets/           # Pre-configured game presets
adapters/
  r3f/               # React Three Fiber adapter
  reactylon/         # Babylon.js adapter (Reactylon)
plugins/
  audio-synth/       # Tone.js audio synthesis
  model-synth/       # AI 3D model generation (Meshy API)
  capacitor/         # Native mobile via Capacitor
  react-native/      # React Native bridge
  astro/             # Astro integration
apps/
  docs/              # Astro Starlight documentation site (strata.game)
  examples/          # Example projects
```

**THE RULE**: `packages/core/` must have NO React imports -- pure TypeScript only. All React Three Fiber components and hooks live in `adapters/r3f/`. This ensures core algorithms are portable and testable.

### Dependency Chain

```text
@strata-game-library/shaders -> core -> r3f -> presets
                                     -> reactylon
```

## Code Standards

- **TypeScript**: Strict mode, no `any` types, JSDoc on all public APIs
- **React**: Functional components only, forwardRef when needed
- **Shaders**: Use `/* glsl */` template literals
- **Testing**: Vitest for unit/integration, Playwright for E2E
- **Linting**: Biome (not ESLint)
- **Build**: tsup for ESM builds
- **Commits**: Conventional commits -- `feat/fix/chore/refactor/test/docs(scope): message`

### Commit Examples

```bash
git commit -m "feat(terrain): add erosion simulation"   # minor release
git commit -m "fix(water): correct reflection angle"    # patch release
git commit -m "docs: update API docs"                   # no release
git commit -m "test: add pathfinding tests"             # no release
```

## Documentation Architecture

See [docs/AGENTS.md](docs/AGENTS.md) for the full documentation system, frontmatter conventions, and domain indexes.

Two tiers: legacy `docs/` (internal planning, RFCs) and Starlight `apps/docs/` (public site at strata.game, 311 pages including 257 auto-generated TypeDoc API pages).

## Agentic Memory

See [memory-bank/AGENTS.md](memory-bank/AGENTS.md) for the 5-layer memory architecture and multi-agent handoff protocol.

**CRITICAL**: Review `memory-bank/activeContext.md` before any significant work session.

## Custom Commands & Agents

See [.claude/README.md](.claude/README.md) for Strata-specific slash commands (`/add-component`, `/add-shader`, `/review-package`) and specialized agents (Game Architect, Shader Specialist, R3F Developer, Docs Reviewer).

## Quality Checklist

Before completing work:

- [ ] All tests pass (`pnpm run test`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Type checking passes (`pnpm run typecheck`)
- [ ] Conventional commit message format
- [ ] JSDoc on all public APIs
- [ ] Documentation updated if needed

## Key References

| Document | Purpose |
|----------|---------|
| [docs/AGENTS.md](docs/AGENTS.md) | Documentation architecture and indexes |
| [memory-bank/AGENTS.md](memory-bank/AGENTS.md) | Agentic memory system |
| [.claude/README.md](.claude/README.md) | Custom commands and agents |
| [PUBLIC_API.md](PUBLIC_API.md) | Stable, versioned API reference |
| [CONTRACT.md](CONTRACT.md) | Stability guarantees and versioning |
| [docs/architecture/](docs/architecture/) | Framework vision, roadmap, RFCs |
