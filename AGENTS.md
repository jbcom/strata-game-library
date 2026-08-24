---
title: Agent protocols
updated: 2026-08-23
status: current
domain: context
---

## AGENTS.md -- Strata Game Library

> **Primary reference for all AI agents** (Claude, Copilot, Cursor, Jules).

## Project Overview

**Strata Game Library** is a renderer-agnostic game framework organized as an Nx + pnpm monorepo with 13 publishable packages and 2 apps. Pure TypeScript algorithms live in core; React Three Fiber, Reactylon/Babylon, and Pixi adapters bind them to renderers.

## Quick Start

### Toolchain

Maintainers and CI use the latest stable Node.js and pnpm releases through
`mise.toml`. Published packages support every maintained Node release from 22
forward; the maintainer tool version is intentionally not a consumer constraint.

```bash
mise trust
mise install node@latest pnpm@latest
mise exec -- pnpm install --frozen-lockfile
```

Do not add a root `packageManager` pin, pnpm engine pin, `.nvmrc`, or duplicated
Node/pnpm versions in workflows. Keep the local and CI toolchain DRY through
`mise.toml`. The Node engine floor remains a real compatibility promise and CI
must test both that floor and the latest stable runtime.

Security overrides live in `pnpm-workspace.yaml`, the location current pnpm
versions consume. The test setup provisions browser storage explicitly so
modern Node runtimes do not depend on jsdom's historical global behavior.

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
  docs/              # Sourcey documentation site (jonbogaty.com/strata-game-library/)
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

`docs/` is the production Sourcey site and its source content. `apps/docs/` is legacy Astro/Starlight material retained only while its useful content is migrated; it must not be treated as a production renderer or deployment source.

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
