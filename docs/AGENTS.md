---
title: "Documentation Master Index"
description: "Master agent guide for all Strata documentation - two-tier system, frontmatter conventions, and cross-references"
status: active
area: docs
last_updated: 2026-03-01
---

# Documentation Master Index

This is the master index for all Strata documentation. It explains the two-tier documentation system, frontmatter conventions, and how to navigate between legacy docs, the Starlight site, and package source code.

## Two-Tier Documentation System

Strata maintains two documentation tiers that serve different audiences:

### Tier 1: Legacy `docs/` (33 files)

Internal planning and architecture documentation checked into the repository. These are primarily consumed by developers and AI agents working on the framework.

| Subdirectory | Files | Purpose |
|-------------|-------|---------|
| `docs/architecture/` | 10 | Framework vision, roadmap, ecosystem analysis, AI automation |
| `docs/architecture/rfc/` | 4 | RFC specifications for the 4 game framework layers |
| `docs/architecture/guides/` | 4 | Migration guides (toolkit->framework, v2, declarative, tsup) |
| `docs/plans/` | 4 | Historical implementation plans (monorepo migration, Feb 2026) |
| `docs/getting-started/` | 2 | Stale Python templates -- use Starlight instead |
| `docs/` (root) | 9 | Standards, brand guide, design system, contributing, showcase |

**When to use:** Architecture research, understanding design decisions, checking implementation status, reviewing RFCs, planning new framework features.

### Tier 2: Starlight `apps/docs/` (311 files)

The public-facing documentation site deployed at [strata.game](https://strata.game). Built with Astro Starlight, it contains user guides, API reference, tutorials, and live demos.

| Content Area | Approximate Files | Source |
|-------------|-------------------|--------|
| TypeDoc API reference | 257 | Auto-generated from JSDoc in source |
| Getting started / tutorials | ~20 | Hand-written Starlight pages |
| Showcase / demos | ~15 | MDX with React component islands |
| Guides / concepts | ~19 | Hand-written Starlight pages |

**When to use:** User-facing documentation, API reference lookups, verifying public API surface, checking live demo behavior.

### How They Relate

```
docs/architecture/rfc/RFC-001-*.md     (internal spec)
    --> packages/core/src/game/         (implementation)
    --> apps/docs/src/content/docs/     (public docs)
    --> TypeDoc JSDoc                   (API reference)
```

- **RFCs** define what should be built (specs)
- **Source code** is the implementation
- **Starlight** documents the public API for users
- **TypeDoc** auto-generates API docs from JSDoc in source

Legacy docs are upstream of Starlight -- architectural decisions flow from RFCs to implementation to public docs. If an RFC changes, update the implementation, then update Starlight pages.

## Frontmatter Conventions

All legacy docs use YAML frontmatter between `---` delimiters. This enables programmatic discovery of document status and implementation progress.

### Required Fields

```yaml
---
title: "Document Title"
description: "One-line description of the document"
status: draft | active | proposed | implemented | deprecated | complete | stale | superseded
last_updated: 2026-03-01
area: architecture | rfc | guides | plans | getting-started
---
```

### Optional Fields

```yaml
implementation: 0-100     # Percentage complete (for specs/plans)
```

### Status Values

| Status | Meaning |
|--------|---------|
| `draft` | Work in progress, not yet reviewed |
| `active` | Current and maintained |
| `proposed` | Proposed but not yet approved/implemented |
| `implemented` | Spec has been implemented in code |
| `complete` | Plan/task finished, no further work needed |
| `deprecated` | No longer recommended, kept for reference |
| `stale` | Outdated, may contain incorrect information |
| `superseded` | Replaced by a newer document |

## Quick Frontmatter Review Commands

```bash
# Review all frontmatter at a glance
for f in docs/**/*.md; do echo "=== $f ==="; head -10 "$f"; echo; done

# Find docs by status
grep -rl "status: proposed" docs/ --include="*.md"
grep -rl "status: draft" docs/ --include="*.md"
grep -rl "status: stale" docs/ --include="*.md"

# Find docs with low implementation
grep -rl "implementation: 0" docs/ --include="*.md"

# Find recently updated docs
grep -rl "last_updated: 2026-03" docs/ --include="*.md"

# Count docs by status
for s in draft active proposed implemented complete deprecated stale superseded; do
  echo "$s: $(grep -rl "status: $s" docs/ --include="*.md" 2>/dev/null | wc -l | tr -d ' ')"
done
```

## Domain Index

Each documentation subdirectory has its own AGENTS.md with detailed file listings and context.

| Area | AGENTS.md | Files | Description |
|------|-----------|-------|-------------|
| Architecture | [docs/architecture/AGENTS.md](architecture/AGENTS.md) | 10 | Framework vision, roadmap, ecosystem analysis, AI automation |
| RFCs | [docs/architecture/rfc/AGENTS.md](architecture/rfc/AGENTS.md) | 4 | Game framework layer specifications (RFC-001 through RFC-004) |
| Guides | [docs/architecture/guides/AGENTS.md](architecture/guides/AGENTS.md) | 4 | Migration guides and development instructions |
| Plans | [docs/plans/AGENTS.md](plans/AGENTS.md) | 4 | Historical implementation plans (monorepo, renderer-agnostic) |
| Getting Started | [docs/getting-started/AGENTS.md](getting-started/AGENTS.md) | 2 | Stale Python templates (real content in Starlight) |

### Root-Level Docs (No Subdirectory AGENTS.md)

These files live directly in `docs/` and cover cross-cutting concerns:

| File | Status | Description |
|------|--------|-------------|
| `contributing.md` | Active | Contribution guidelines |
| `DESIGN-SYSTEM.md` | Active | UI/visual design system for docs site |
| `DOMAIN-STANDARD.md` | Active | Domain naming and branding standards |
| `ECOSYSTEM.md` | Active | Strata ecosystem overview |
| `GETTING_STARTED.md` | Active | Root getting-started (points to Starlight) |
| `SHOWCASE.md` | Active | Demo showcase descriptions |
| `STANDARDS.md` | Active | Code and documentation standards |
| `STRATA_BRAND_GUIDE.md` | Active | Brand guidelines, colors, typography |

## Package-to-Documentation Cross-Reference

Maps which documentation corresponds to which packages and source directories.

### RFCs to Source

| RFC | Layer | Package Location | Status |
|-----|-------|-----------------|--------|
| [RFC-001: Game Orchestration](architecture/rfc/RFC-001-GAME-ORCHESTRATION.md) | Layer 1 | `packages/core/src/game/` | 60% |
| [RFC-002: Compositional Objects](architecture/rfc/RFC-002-COMPOSITIONAL-OBJECTS.md) | Layer 3 | `packages/core/src/compose/` | 40% |
| [RFC-003: World Topology](architecture/rfc/RFC-003-WORLD-TOPOLOGY.md) | Layer 2 | `packages/core/src/world/` | 70% |
| [RFC-004: Declarative Games](architecture/rfc/RFC-004-DECLARATIVE-GAMES.md) | Layer 4 | `packages/core/src/api/` | 30% |

### Guides to Packages

| Guide | Primary Packages Affected |
|-------|--------------------------|
| [MIGRATION.md](architecture/guides/MIGRATION.md) | core, r3f (toolkit to framework migration) |
| [MIGRATION_V2.md](architecture/guides/MIGRATION_V2.md) | All (future package rename, not yet done) |
| [MIGRATION_DECLARATIVE.md](architecture/guides/MIGRATION_DECLARATIVE.md) | core/api, r3f (createGame adoption) |
| [TSUP_MIGRATION.md](architecture/guides/TSUP_MIGRATION.md) | All (build toolchain, complete) |

### Plans to Packages

| Plan | Packages Produced |
|------|------------------|
| [Monorepo Migration](plans/2026-02-24-monorepo-migration-design.md) | All -- created the monorepo structure |
| [Renderer-Agnostic Restructure](plans/2026-02-24-renderer-agnostic-restructure-design.md) | r3f, reactylon, astro -- extracted adapters/plugins |

### Package Documentation in Starlight

TypeDoc generates API reference pages from JSDoc comments into:

```
apps/docs/src/content/docs/packages/
  core/           # Core package API (ECS, math, state, game, world, compose)
  shaders/        # Shader API
  presets/        # Preset configurations
  audio-synth/    # Audio synthesis API
  ...
```

257 auto-generated pages total. Regenerate with `pnpm run docs`.

## Related Resources

| Resource | Location | Purpose |
|----------|----------|---------|
| Root AGENTS.md | [AGENTS.md](../AGENTS.md) | Project-wide agent instructions |
| CLAUDE.md | [CLAUDE.md](../CLAUDE.md) | Claude Code instructions, commands, architecture overview |
| Memory Bank | [memory-bank/AGENTS.md](../memory-bank/AGENTS.md) | 5-layer agentic memory architecture |
| Claude Config | `.claude/` | Custom commands, agent definitions, project settings |
| Starlight Site | `apps/docs/` | Public documentation source (deployed at strata.game) |
| PUBLIC_API.md | [PUBLIC_API.md](../PUBLIC_API.md) | Stable versioned API reference |
| CONTRACT.md | [CONTRACT.md](../CONTRACT.md) | Stability guarantees and versioning policy |
| API.md | [API.md](../API.md) | Complete API documentation |
