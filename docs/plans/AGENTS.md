---
title: "Plans Documentation Index"
description: "Agent guide for implementation plans in the Strata game framework"
area: plans
last_updated: 2026-03-01
---

# Plans Documentation

## Overview

This directory contains dated implementation plans created during the February 2026 monorepo migration and renderer-agnostic restructure. These plans document the technical decisions and step-by-step instructions that produced the current monorepo structure. They are historical reference documents -- the work they describe has been completed.

## Documents

| File | Date | Status | Description |
|------|------|--------|-------------|
| [2026-02-24-monorepo-migration-design.md](2026-02-24-monorepo-migration-design.md) | 2026-02-24 | Complete | Design doc: consolidate 11 repos into Nx + pnpm monorepo |
| [2026-02-24-monorepo-migration-plan.md](2026-02-24-monorepo-migration-plan.md) | 2026-02-24 | Complete | Step-by-step implementation: 9 phases, 30+ tasks |
| [2026-02-24-renderer-agnostic-restructure-design.md](2026-02-24-renderer-agnostic-restructure-design.md) | 2026-02-24 | Complete | Design doc: extract R3F, create adapters/, plugins/, workflows |
| [2026-02-24-renderer-agnostic-restructure-plan.md](2026-02-24-renderer-agnostic-restructure-plan.md) | 2026-02-24 | Complete | Step-by-step implementation: 5 phases, 15 tasks |

## Plan Details

### Monorepo Migration (Design + Plan)

**Problem:** 11 separate repos with fragmented CI/CD, duplicated configs, three-tier sync cascade.

**Solution:** Single Nx 22.5 + pnpm monorepo with `packages/`, `apps/` structure.

**Key decisions:**

- Nx over Turborepo/Moon/Bazel for task orchestration
- pnpm workspaces with `workspace:*` protocol
- tsup for all package builds (ESM-only)
- Biome for lint/format (replaced ESLint/Prettier)
- Vitest for testing (replaced Jest)
- Shared tsconfig.base.json with strict mode

**9-phase migration order:**

1. Root config (nx.json, tsconfig, biome, pnpm-workspace)
2. Core package (move src/, update imports)
3. Shaders package (standalone repo wins 1:1 comparisons)
4. Presets package (update workspace deps)
5. Audio-synth + model-synth
6. Native plugins (capacitor + react-native)
7. Apps (docs site + examples)
8. CI/CD (unified workflows)
9. Cleanup (archive source repos)

**Produced:** The current monorepo structure at `packages/core`, `packages/shaders`, `packages/presets`, plus plugins and apps.

### Renderer-Agnostic Restructure (Design + Plan)

**Problem:** Core package contained React/R3F components mixed with pure algorithms.

**Solution:** Extract R3F to dedicated adapter, create plugin directories, add release automation.

**Key decisions:**

- `packages/core/` becomes pure TypeScript (NO React imports)
- R3F components extracted to `adapters/r3f/`
- New `adapters/reactylon/` for Babylon.js support
- New `plugins/astro/` integration, dogfooded in docs site
- Plugins moved from `packages/` to `plugins/` directory
- 3-workflow CI/CD: ci.yml (PRs) -> cd.yml (release-please) -> release.yml (npm publish via OIDC)

**5-phase implementation:**

1. Release workflow automation (release.yml, cd.yml refactor, automerge.yml)
2. Directory restructuring (adapters/, plugins/, R3F extraction)
3. Astro plugin creation and dogfooding
4. Reactylon adapter scaffold
5. Configuration updates and verification

**Produced:** The current `adapters/r3f/`, `adapters/reactylon/`, `plugins/astro/`, release workflows.

## Key Context

- These plans are HISTORICAL -- the work is complete
- The actual implementation may differ slightly from the plans (iteration during execution)
- The monorepo migration plan is very detailed (~1000 lines) with exact file changes
- Both plans reference commit messages in conventional format
- The renderer-agnostic plan required ~500 import path updates across R3F components
- Post-migration CI/CD uses release-please (not Nx Release as originally planned)

## Related

- [Architecture docs](../architecture/) - Current architecture documentation
- [ROADMAP.md](../architecture/ROADMAP.md) - Framework implementation timeline (ongoing)
- [CLAUDE.md](../../CLAUDE.md) - Current monorepo structure and commands
