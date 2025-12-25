# Strata 2.0 - Comprehensive Project Restructuring Plan

> **Date**: December 23, 2025
> **Status**: Initial Assessment Complete
> **Author**: AI Agent Assessment

---

## Executive Summary

This document outlines the comprehensive plan for Strata 2.0, transforming the project from a modular procedural 3D graphics library into a **complete game framework ecosystem** with:

1. **Core Package** (`@jbcom/strata`) - Focused, clean, well-documented
2. **Sub-Package Ecosystem** - Modular, independent versioning
3. **Dedicated Domain** (`strata.game`) - Professional documentation site
4. **Distinct Brand Identity** - Within jbcom guidelines but with unique character

---

## Part 1: Current State Assessment

### Main Repository: nodejs-strata

| Metric | Current State |
|--------|---------------|
| **Version** | 1.4.10 |
| **Package Name** | `@jbcom/strata` |
| **Test Coverage** | 73.41% (1,033 tests) |
| **Documentation** | TypeDoc-generated |
| **License** | MIT |

#### Capabilities (Current Toolkit)

| Category | Features |
|----------|----------|
| **Rendering** | Terrain, Water, Sky, Vegetation, Particles, Post-processing |
| **Simulation** | Physics (Rapier), AI (Yuka), Animation, Pathfinding |
| **State** | ECS (Miniplex), Zustand store, Save/Load, Checkpoints |
| **Infrastructure** | React Three Fiber, GLSL Shaders |

#### Planned Framework Layers (Epic #50)

| Layer | RFC | Status | Description |
|-------|-----|--------|-------------|
| Layer 1 | RFC-001 | Proposed | Game Orchestration (Scenes, Modes, Triggers) |
| Layer 2 | RFC-003 | Proposed | World Topology (Regions, Connections) |
| Layer 3 | RFC-002 | Proposed | Compositional Objects (Materials, Skeletons) |
| Layer 4 | RFC-004 | Proposed | Declarative Games (`createGame()`) |

### Outstanding Issues (Key)

| Issue | Title | Priority |
|-------|-------|----------|
| #50 | EPIC: Strata Game Framework | Critical |
| #84 | EPIC: Strata 2.0 Export Reorganization | Critical |
| #85 | Remove type re-exports from presets | High |
| #86 | Rename conflicting core exports | High |
| #87 | Create Strata 2.0 Migration Guide | High |
| #88 | Clean up internal/triage | Medium |
| #89 | Extract presets and shaders to packages | Medium |

---

## Part 2: Sub-Package Ecosystem Assessment

### Existing nodejs-strata-* Repositories

| Repository | Description | Status | Proposed Subdomain |
|------------|-------------|--------|-------------------|
| **nodejs-strata-shaders** | GLSL shader collection | New (needs extraction) | `shaders.strata.game` |
| **nodejs-strata-presets** | Preset configurations | New (needs extraction) | `presets.strata.game` |
| **nodejs-strata-examples** | Example applications | Needs migration | `examples.strata.game` |
| **nodejs-strata-typescript-tutor** | Professor Pixel educational platform | Active | `tutor.strata.game` |
| **nodejs-strata-react-native-plugin** | React Native mobile support | New | `react-native.strata.game` |
| **nodejs-strata-capacitor-plugin** | Capacitor mobile support | New | `capacitor.strata.game` |

### Related Game Projects (Validation Targets)

| Repository | Description | Framework Target |
|------------|-------------|------------------|
| nodejs-rivermarsh | Mobile-first 3D exploration game | Primary validation |
| nodejs-otter-river-rush | Fast-paced river racing game | Racing mode validation |
| nodejs-otterfall | 3D adventure with procedural terrain | AI/terrain validation |

### Sub-Package Issues

| Repo | Issue | Status |
|------|-------|--------|
| strata-shaders | #1: Initial setup extraction | Open |
| strata-presets | #1: Initial setup extraction | Open |
| strata-examples | #2: CI/CD for latest strata | Open |
| strata-examples | #3: Deploy to GitHub Pages | Open |
| strata-examples | #4: Migrate examples from main | Open |
| strata-typescript-tutor | #1: Consolidate as Professor Pixel frontend | Open |

---

## Part 3: Domain Structure - strata.game

### Apex Domain: strata.game

**Purpose**: Primary documentation site with JSDoc/TypeDoc-generated API reference

**Content Structure**:

```
strata.game/
├── / (home)                    → Landing page with showcase
├── /docs                       → Getting started guide
├── /api                        → TypeDoc-generated API reference
├── /examples                   → Interactive demos (embedded)
├── /vision                     → Game framework roadmap
├── /rfc                        → RFC documents
└── /changelog                  → Version history
```

### Subdomain Allocation

| Subdomain | Package | Content |
|-----------|---------|---------|
| `tutor.strata.game` | @jbcom/strata-typescript-tutor | Professor Pixel educational platform |
| `examples.strata.game` | @jbcom/strata-examples | Interactive runnable demos |
| `shaders.strata.game` | @jbcom/strata-shaders | Shader documentation & playground |
| `presets.strata.game` | @jbcom/strata-presets | Preset gallery & configuration |
| `react-native.strata.game` | @jbcom/strata-react-native-plugin | React Native plugin docs |
| `capacitor.strata.game` | @jbcom/strata-capacitor-plugin | Capacitor plugin docs |

### GitHub Pages Configuration

Each repository needs:

```yaml
# .github/workflows/docs.yml
name: Deploy Documentation
on:
  push:
    branches: [main]
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # v6.0.1
      - uses: actions/setup-node@395ad3262231945c25e8478fd5baf05154b1d79f # v6.1.0
      - run: pnpm install
      - run: pnpm run docs:build
      - uses: peaceiris/actions-gh-pages@4f23e57388d74ba3d1420791a717b0244ca76483 # v4.0.0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
          cname: '[subdomain].strata.game'
```

---

## Part 4: Strata Brand Identity

### Philosophy: "Layer by Layer, World by World"

Strata (meaning "layers") perfectly embodies the framework's architecture:

- **Geological metaphor**: Building worlds layer by layer
- **Framework layers**: From core algorithms to declarative games
- **Visual layers**: Terrain → Water → Vegetation → Sky

### Visual Identity (Within jbcom Guidelines)

#### Color Extensions for Strata

| Purpose | jbcom Base | Strata Extension |
|---------|------------|------------------|
| Primary | `#06b6d4` (Cyan) | `#0891b2` (Darker cyan for "depth") |
| Accent | `#3b82f6` (Blue) | `#22d3ee` (Lighter cyan for "surface") |
| Earth | - | `#78350f` (Brown - terrain) |
| Water | - | `#0284c7` (Deep blue - water) |
| Vegetation | - | `#15803d` (Green - vegetation) |
| Sky | - | `#7c3aed` (Purple - volumetrics) |

#### Typography (jbcom Standard)

| Element | Font | Notes |
|---------|------|-------|
| Headings | Space Grotesk | Bold, modern, technical |
| Body | Inter | Clean, readable |
| Code | JetBrains Mono | Monospace for code |
| **Logo** | Custom "STRATA" | Layered letterforms |

#### Logo Concept

```
  ╔══════════════════════════╗
  ║   S T R A T A            ║
  ║   ─────────────          ║
  ║   ═══════════════        ║
  ║   ━━━━━━━━━━━━━━━━━      ║
  ╚══════════════════════════╝

  Layered horizontal lines through
  or below the wordmark, suggesting
  geological strata / framework layers
```

#### Iconography

| Icon | Represents | Usage |
|------|------------|-------|
| 🏔️ | Terrain | Terrain features |
| 🌊 | Water | Water systems |
| 🌲 | Vegetation | Vegetation/instancing |
| ☁️ | Sky | Sky/volumetrics |
| 🎮 | Game | Game framework |
| ⚡ | Core | Core utilities |

### Documentation Theming

```css
/* Strata-specific overrides for TypeDoc */
:root {
  /* jbcom base preserved */
  --color-background: #0a0f1a;
  --color-surface: #111827;
  --color-primary: #06b6d4;

  /* Strata extensions */
  --strata-terrain: #78350f;
  --strata-water: #0284c7;
  --strata-vegetation: #15803d;
  --strata-sky: #7c3aed;

  /* Semantic mapping */
  --strata-layer-1: var(--strata-terrain);
  --strata-layer-2: var(--strata-water);
  --strata-layer-3: var(--strata-vegetation);
  --strata-layer-4: var(--strata-sky);
}
```

---

## Part 5: Repository Restructuring Plan

### Core Package (nodejs-strata) Focus

**Keep in Main Repository**:

```
src/
├── core/          # Pure TypeScript algorithms (NO React)
├── components/    # → Renamed to react/ in exports
├── hooks/         # React hooks
├── api/           # High-level API
├── game/          # NEW: Game orchestration (RFC-001)
├── world/         # NEW: World topology (RFC-003)
├── compose/       # NEW: Compositional objects (RFC-002)
└── framework/     # NEW: Declarative games (RFC-004)
```

**Move OUT of Main Repository**:

| Content | Target | Reason |
|---------|--------|--------|
| `src/shaders/` | nodejs-strata-shaders | Zero strata dependency, pure GLSL |
| `src/presets/` | nodejs-strata-presets | Independent versioning |
| `examples/` | nodejs-strata-examples | Keep main package lean |
| `internal/triage/` | nodejs-agentic-triage | Already exists separately |

### Export Structure (2.0)

| Path | Content | Dependencies |
|------|---------|--------------|
| `@strata/core` | Core algorithms | three |
| `@strata/core/react` | React components | react, @react-three/fiber |
| `@strata/core/game` | Game orchestration | core + react |
| `@strata/core/world` | World topology | core |
| `@strata/core/compose` | Compositional objects | core + react |
| `@strata/core/ai` | AI components | yuka (optional) |
| `@strata/core/state` | State management | zustand (optional) |
| `@strata/core/physics` | Physics components | @react-three/rapier (optional) |

### package.json Exports (Target)

```json
{
  "name": "@strata/core",
  "version": "2.0.0",
  "exports": {
    ".": {
      "types": "./dist/core/index.d.ts",
      "import": "./dist/core/index.js"
    },
    "./react": {
      "types": "./dist/react/index.d.ts",
      "import": "./dist/react/index.js"
    },
    "./game": {
      "types": "./dist/game/index.d.ts",
      "import": "./dist/game/index.js"
    },
    "./world": {
      "types": "./dist/world/index.d.ts",
      "import": "./dist/world/index.js"
    },
    "./compose": {
      "types": "./dist/compose/index.d.ts",
      "import": "./dist/compose/index.js"
    },
    "./ai": {
      "types": "./dist/ai/index.d.ts",
      "import": "./dist/ai/index.js"
    },
    "./state": {
      "types": "./dist/state/index.d.ts",
      "import": "./dist/state/index.js"
    },
    "./physics": {
      "types": "./dist/physics/index.d.ts",
      "import": "./dist/physics/index.js"
    }
  }
}
```

> **Migration**: Users will migrate from `@jbcom/strata` → `@strata/core`.
> The `@jbcom/strata` package will be deprecated with a postinstall message pointing to `@strata/core`.

---

## Part 6: Implementation Milestones

Work is organized by **functional domains** with explicit issue dependencies. Milestones are sequenced by blocking relationships, not arbitrary time estimates.

### Milestone Dependency Graph

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  M1: EXPORT CLEANUP ──────────────────┬──────────────────────────────────┐  │
│  [#85, #86, #87]                      │                                  │  │
│         │                             │                                  │  │
│         ▼                             ▼                                  │  │
│  M2: PACKAGE EXTRACTION        M3: INFRASTRUCTURE                        │  │
│  [#88, #89, strata-*#1]        [Domain, GitHub Pages]                    │  │
│         │                             │                                  │  │
│         └──────────────┬──────────────┘                                  │  │
│                        │                                                 │  │
│                        ▼                                                 │  │
│              M4: DOCUMENTATION SITE                                       │  │
│              [strata.game deployment]                                    │  │
│                        │                                                 │  │
│         ┌──────────────┴──────────────┐                                  │  │
│         ▼                             ▼                                  │  │
│  M5: GAME ORCHESTRATION        M6: COMPOSITIONAL                         │  │
│  [RFC-001, Epic #50]           [RFC-002, Epic #50]                       │  │
│         │                             │                                  │  │
│         └──────────────┬──────────────┘                                  │  │
│                        │                                                 │  │
│                        ▼                                                 │  │
│              M7: WORLD TOPOLOGY                                          │  │
│              [RFC-003, Epic #50]                                         │  │
│                        │                                                 │  │
│                        ▼                                                 │  │
│              M8: DECLARATIVE API                                         │  │
│              [RFC-004, Epic #50]                                         │  │
│                        │                                                 │  │
│                        ▼                                                 │  │
│              M9: VALIDATION                                              │  │
│              [Rivermarsh port]                                           │  │
│                                                                          │  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### M1: Export Cleanup

**Epic**: #84 (Strata 2.0 Export Reorganization)
**Blocks**: M2, M4
**Blocked by**: None (starting point)

| Issue | Scope | Deliverable | Acceptance |
|-------|-------|-------------|------------|
| #85 | Remove type re-exports from presets | Clean preset modules | No duplicate exports, build passes |
| #86 | Rename conflicting core exports | `*Core` suffix pattern | All conflicts resolved, tests pass |
| #87 | Create migration guide | `MIGRATION.md` | Document all breaking changes |

**Done when**: All three issues closed, `pnpm run build && pnpm run test` passes.

---

### M2: Package Extraction

**Epic**: #84
**Blocks**: M4
**Blocked by**: M1

| Issue | Scope | Target Repo | Acceptance |
|-------|-------|-------------|------------|
| #89 | Extract shaders | nodejs-strata-shaders | Published to npm, zero strata deps |
| #89 | Extract presets | nodejs-strata-presets | Published to npm, depends on strata |
| #88 | Remove internal/triage | N/A | Directory removed, workspace clean |
| strata-examples#4 | Migrate examples | nodejs-strata-examples | All examples build with latest strata |

**Done when**: Main repo contains no shaders/, presets/, examples/, internal/triage.

---

### M3: Infrastructure

**Blocks**: M4
**Blocked by**: None (parallel with M1)

| Task | Owner | Deliverable | Acceptance |
|------|-------|-------------|------------|
| Register strata.game | Maintainer | Domain active | DNS resolves |
| Configure apex DNS | Maintainer | A/AAAA records | GitHub Pages serves apex |
| Configure subdomain DNS | Maintainer | CNAME records | All subdomains resolve |
| SSL certificates | Automatic | Let's Encrypt | HTTPS works on all domains |

**Done when**: `https://strata.game` and all subdomains serve content.

---

### M4: Documentation Site

**Blocks**: M5, M6 (soft block - framework work can proceed but docs should be ready)
**Blocked by**: M2, M3

| Task | Scope | Deliverable | Acceptance |
|------|-------|-------------|------------|
| Apex landing page | strata.game | Hero + feature overview | Deployed, responsive |
| TypeDoc branding | API reference | Strata-branded docs | Brand colors applied |
| Sub-package docs | All strata-* repos | Individual doc sites | Each subdomain live |
| Interactive demos | examples.strata.game | Runnable examples | 5+ demos working |

**Done when**: All 7 documentation sites deployed and accessible.

---

### M5: Game Orchestration Layer

**Epic**: #50 (Strata Game Framework)
**RFC**: RFC-001
**Blocks**: M7, M8
**Blocked by**: M1 (clean exports required)

| Component | Scope | Export Path | Acceptance |
|-----------|-------|-------------|------------|
| SceneManager | Scene lifecycle, loading, stacking | `@jbcom/strata/game` | Unit tests, demo |
| ModeManager | Mode stack, push/pop/replace | `@jbcom/strata/game` | Unit tests, demo |
| TriggerSystem | Spatial triggers as ECS components | `@jbcom/strata/game` | Unit tests, demo |
| TransitionSystem | Fade, crossfade, wipe effects | `@jbcom/strata/game` | Unit tests, demo |

**Done when**: `@jbcom/strata/game` export works, integration test with multi-scene game.

---

### M6: Compositional Object System

**Epic**: #50
**RFC**: RFC-002
**Blocks**: M7, M8
**Blocked by**: M1

| Component | Scope | Export Path | Acceptance |
|-----------|-------|-------------|------------|
| Material System | Solid, shell, volumetric, organic | `@jbcom/strata/compose` | 10+ material presets |
| Skeleton System | Biped, quadruped, avian, serpentine | `@jbcom/strata/compose` | 5+ skeleton presets |
| Covering System | Region-based material application | `@jbcom/strata/compose` | Otter covering demo |
| Prop System | Compositional props | `@jbcom/strata/compose` | 20+ prop presets |
| Creature System | Skeleton + covering + AI + stats | `@jbcom/strata/compose` | 5+ creature presets |

**Done when**: `@jbcom/strata/compose` export works, creature rendering demo.

---

### M7: World Topology System

**Epic**: #50
**RFC**: RFC-003
**Blocks**: M8
**Blocked by**: M5, M6

| Component | Scope | Export Path | Acceptance |
|-----------|-------|-------------|------------|
| WorldGraph | Region/connection graph structure | `@jbcom/strata/world` | Graph operations work |
| RegionSystem | Position → region detection | `@jbcom/strata/world` | Region change events |
| ConnectionSystem | Traversal logic, unlock state | `@jbcom/strata/world` | Mode triggers on connection |
| SpawnSystem | Region-based entity spawning | `@jbcom/strata/world` | Creatures spawn in regions |

**Done when**: Multi-region world with river connections demo works.

---

### M8: Declarative Game API

**Epic**: #50
**RFC**: RFC-004
**Blocks**: M9
**Blocked by**: M5, M6, M7

| Component | Scope | Export Path | Acceptance |
|-----------|-------|-------------|------------|
| GameDefinition | Type-safe game configuration | `@jbcom/strata/framework` | Full TypeScript coverage |
| createGame() | Factory function | `@jbcom/strata/framework` | Creates Game instance |
| StrataGame | React component wrapper | `@jbcom/strata/framework` | Renders complete game |
| State Presets | RPG, action, puzzle, sandbox | `@jbcom/strata/framework` | 4 presets available |

**Done when**: Simple game defined in <100 lines of config.

---

### M9: Validation

**Blocks**: 2.0 Release
**Blocked by**: M8

| Target | Scope | Metric | Acceptance |
|--------|-------|--------|------------|
| Rivermarsh port | Full game migration | <1000 lines game code | Feature parity with 1.x |
| Otter River Rush | Racing mode validation | Racing works | Leaderboards, obstacles |
| Mobile performance | All validation targets | 60fps | Tested on 3+ devices |

**Done when**: Rivermarsh runs on Strata 2.0 with documented code reduction.

---

### Milestone Status Tracking

| Milestone | Status | Issues | Blocking |
|-----------|--------|--------|----------|
| M1: Export Cleanup | 🔲 Not Started | #85, #86, #87 | M2, M4 |
| M2: Package Extraction | 🔄 In Progress | #88, #89, strata-*#1 | M4 |
| M3: Infrastructure | 🔲 Not Started | (maintainer tasks) | M4 |
| M4: Documentation Site | 🔲 Not Started | (new issues TBD) | M5, M6 (soft) |
| M5: Game Orchestration | 🔲 Not Started | Epic #50 | M7, M8 |
| M6: Compositional Objects | 🔲 Not Started | Epic #50 | M7, M8 |
| M7: World Topology | 🔲 Not Started | Epic #50 | M8 |
| M8: Declarative API | 🔲 Not Started | Epic #50 | M9 |
| M9: Validation | 🔲 Not Started | (new issues TBD) | 2.0 Release |

**Legend**: 🔲 Not Started | 🔄 In Progress | ✅ Complete | ⏸️ Blocked

---

## Part 7: Issue Triage & Project Organization

### Organization Projects

Issues are tracked in jbcom organization projects:

| Project | URL | Purpose |
|---------|-----|---------|
| **Roadmap** | [jbcom/projects/2](https://github.com/orgs/jbcom/projects/2) | EPICs and major milestones |
| **Ecosystem** | [jbcom/projects/1](https://github.com/orgs/jbcom/projects/1) | Cross-repo integration tasks |

### Main Repository: nodejs-strata

| Issue | Title | Milestone | Project |
|-------|-------|-----------|---------|
| [#50](https://github.com/jbcom/nodejs-strata/issues/50) | EPIC: Strata Game Framework | M5-M8 | Roadmap ✅ |
| [#84](https://github.com/jbcom/nodejs-strata/issues/84) | EPIC: Strata 2.0 Export Reorganization | M1-M2 | Roadmap ✅ |
| [#85](https://github.com/jbcom/nodejs-strata/issues/85) | Remove type re-exports from presets | M1 | Ecosystem ✅ |
| [#86](https://github.com/jbcom/nodejs-strata/issues/86) | Rename conflicting core exports | M1 | Ecosystem ✅ |
| [#87](https://github.com/jbcom/nodejs-strata/issues/87) | Create Strata 2.0 Migration Guide | M1 | Ecosystem ✅ |
| [#88](https://github.com/jbcom/nodejs-strata/issues/88) | Clean up internal/triage | M2 | Ecosystem ✅ |
| [#89](https://github.com/jbcom/nodejs-strata/issues/89) | Extract presets and shaders to packages | M2 | Ecosystem ✅ |

### Sub-Package: nodejs-strata-shaders

| Issue | Title | Milestone | Project |
|-------|-------|-----------|---------|
| [#1](https://github.com/jbcom/nodejs-strata-shaders/issues/1) | Initial setup: Extract shaders from nodejs-strata | M2 | Ecosystem ✅ |

### Sub-Package: nodejs-strata-presets

| Issue | Title | Milestone | Project |
|-------|-------|-----------|---------|
| [#1](https://github.com/jbcom/nodejs-strata-presets/issues/1) | Initial setup: Extract presets from nodejs-strata | M2 | Ecosystem ✅ |

### Sub-Package: nodejs-strata-examples

| Issue | Title | Milestone | Project |
|-------|-------|-----------|---------|
| [#2](https://github.com/jbcom/nodejs-strata-examples/issues/2) | CI/CD to verify examples build with latest strata | M4 | Ecosystem ✅ |
| [#3](https://github.com/jbcom/nodejs-strata-examples/issues/3) | Deploy examples to GitHub Pages | M4 | Ecosystem ✅ |
| [#4](https://github.com/jbcom/nodejs-strata-examples/issues/4) | Migrate examples from main strata repo | M2 | Ecosystem ✅ |

### Content Migration Plan

| Source | Target Repo | Issue | Status |
|--------|-------------|-------|--------|
| `src/shaders/` | nodejs-strata-shaders | strata-shaders#1 | 🔲 Pending |
| `src/presets/` | nodejs-strata-presets | strata-presets#1 | 🔲 Pending |
| `examples/` | nodejs-strata-examples | strata-examples#4 | 🔲 Pending |
| `internal/triage/` | (delete, use nodejs-agentic-triage) | strata#88 | ✅ Complete |

### Issue Transfer Plan

No issues currently require transfer between repositories. Future sub-issues for:

- Shader-specific bugs → nodejs-strata-shaders
- Preset-specific bugs → nodejs-strata-presets
- Example-specific bugs → nodejs-strata-examples

### Labels Applied

All v2.0 issues should have:

- `v2.0` - Strata 2.0 release work
- `milestone:M[X]` - Which milestone (to be created)
- `architecture` / `documentation` / `breaking-change` as appropriate

---

## Part 8: Success Criteria

### Technical Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Code reduction (Rivermarsh) | <1000 lines | ~10000 lines |
| API documentation | 100% | ~60% |
| Test coverage | >80% | 73.41% |
| TypeScript coverage | 100% | ~95% |
| Build size (core only) | <100KB | TBD |

### Ecosystem Health

| Metric | Target |
|--------|--------|
| Sub-packages published | 6 |
| Documentation sites live | 7 |
| GitHub Pages working | All repos |
| Subdomain configuration | All active |

### Community Impact

| Metric | Target |
|--------|--------|
| Time to new game prototype | <1 hour |
| Lines of code per game | 10x reduction |
| Examples available | 10+ |
| Interactive demos | 5+ |

---

## Part 9: Open Questions & Decisions Needed

### Domain Registration

- [x] Hosting: **GitHub Pages** (RESOLVED)
- [ ] Register strata.game domain
- [ ] Configure CNAME records pointing to GitHub Pages
- [ ] SSL: Automatic via GitHub Pages

### Package Publishing

- [x] npm org scope: **`@strata`** (DECIDED)
- [ ] Who has npm publish access?
- [ ] Automated release via semantic-release?

> **Decision**: Use `@strata` npm scope. Packages will be:
>
> - `@strata/core` (was `@jbcom/strata`)
> - `@strata/shaders`
> - `@strata/presets`
> - `@strata/studio`
> - etc.

### Branding Approval

- [ ] Logo design: Internal or external designer?
- [ ] Color palette extensions: Approved by jbcom brand?
- [ ] Marketing materials needed?

### Professor Pixel Integration

- [x] typescript-tutor stays as-is (correct repo, correct name) (RESOLVED)
- [x] Professor Pixel scope: **Education + Workshop ONLY** (RESOLVED)
  - Kindly old professor version → Learn/Education
  - Cyberpunk version → Workshop/Game creation
  - NOT a general Strata mascot
- [x] Existing assets available for both versions (scattered, needs consolidation)
- [ ] Consolidate Professor Pixel assets into typescript-tutor repo

---

## Part 10: Strata Game Studio Vision

> **New Epic: [#101](https://github.com/jbcom/nodejs-strata/issues/101) - Strata Game Studio**

### Unified Platform Architecture

The Strata brand unifies **four game development paradigms** into a cohesive platform:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         🎮 STRATA GAME STUDIO 🎮                           │
│    "From first line of code to finished game — AI-powered, human-guided"  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   STRATA    │  │   STRATA    │  │   STRATA    │  │   STRATA    │        │
│  │   ENGINE    │  │   WORKSHOP  │  │    LEARN    │  │   ARCADE    │        │
│  │   (core)    │  │  (wizards)  │  │ (education) │  │ (showcase)  │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         └────────────────┴─────────┬──────┴─────────┬──────┘               │
│                                    │                │                       │
│                          ┌─────────┴────────┐       │                       │
│                          │    STRATA AI     │◄──────┘                       │
│                          │  (orchestration) │                               │
│                          └─────────┬────────┘                               │
│                                    │                                        │
│                          ┌─────────┴────────┐                               │
│                          │  agentic-control │                               │
│                          └─────────┬────────┘                               │
│                                    │                                        │
│                          ┌─────────┴────────┐                               │
│                          │  agentic-triage  │                               │
│                          │   (primitives)   │                               │
│                          └──────────────────┘                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### The Four Pillars

| Pillar | Domain | Purpose | Source |
|--------|--------|---------|--------|
| **Strata Engine** | `strata.game` | Core rendering & game framework | nodejs-strata |
| **Strata Workshop** | `workshop.strata.game` | AI-powered game creation wizard | typescript-tutor flows |
| **Strata Learn** | `learn.strata.game` | Interactive TypeScript education | typescript-tutor lessons |
| **Strata Arcade** | `arcade.strata.game` | Game showcase gallery | rivermarsh, otterfall, etc. |

### AI Layer Consolidation

| Current Repo | Language | Target |
|--------------|----------|--------|
| rust-agentic-game-development | Rust | Strata AI Core (crate) |
| rust-agentic-game-generator | Rust | Merge into AI Core |
| python-agentic-game-development | Python | PyO3 bindings to AI Core |
| typescript-tutor flows | TypeScript | agentic-control configs |

### Professor Pixel: Brand Mascot

Professor Pixel evolves from "tutor mascot" to **Strata's official mascot** across ALL properties:

| Context | Personality |
|---------|-------------|
| **Learn** | Patient teacher, celebrates small wins |
| **Workshop** | Creative collaborator, enthusiastic |
| **Arcade** | Excited host, showcases achievements |
| **Docs** | Helpful guide, provides tips |

### Agentic Control Integration

Workshop flows become agentic-control configurations:

```yaml
# nodejs-strata-studio/.agentic-control/config.yaml
flows:
  - id: platformer-wizard
    entry: flows/platformer.yaml
  - id: racing-wizard
    entry: flows/racing.yaml
  - id: rpg-wizard
    entry: flows/rpg.yaml

ai:
  personas:
    professor-pixel:
      system: "You are Professor Pixel, Strata's friendly mascot..."
```

### Studio Monorepo Structure (Future)

```
nodejs-strata-studio/          # Monorepo (from typescript-tutor)
├── packages/
│   ├── workshop/              # Game wizard flows
│   ├── learn/                 # Education platform
│   ├── arcade/                # Showcase gallery
│   └── ai/                    # AI client (WASM)
├── apps/
│   ├── workshop.strata.game/
│   ├── learn.strata.game/
│   └── arcade.strata.game/
└── .agentic-control/
    └── flows/                 # Workshop flow configs
```

### Related Issues

| Repo | Issue | Title |
|------|-------|-------|
| nodejs-strata | [#101](https://github.com/jbcom/nodejs-strata/issues/101) | EPIC: Strata Game Studio |
| typescript-tutor | [#1](https://github.com/jbcom/nodejs-strata-typescript-tutor/issues/1) | Consolidation as Professor Pixel frontend |
| typescript-tutor | [#25](https://github.com/jbcom/nodejs-strata-typescript-tutor/issues/25) | Convert lessons to TypeScript/Strata |
| typescript-tutor | [#26](https://github.com/jbcom/nodejs-strata-typescript-tutor/issues/26) | Full Strata sub-package alignment |
| python-agentic-game-dev | [#1](https://github.com/jbcom/python-agentic-game-development/issues/1) | Merge into unified platform |
| rust-agentic-game-generator | [#21](https://github.com/jbcom/rust-agentic-game-generator/issues/21) | Split and align with ecosystem |

**Full Vision Document**: [docs/architecture/STRATA_GAME_STUDIO_VISION.md](docs/architecture/STRATA_GAME_STUDIO_VISION.md)

---

## Part 11: Immediate Actions by Actor

### Maintainer Decisions (Blocking)

| Question | Options | Impact |
|----------|---------|--------|
| **Monorepo vs Multi-repo?** | Studio as monorepo OR keep separate repos | Determines typescript-tutor transformation |
| **npm scope** | Stay `@jbcom/` OR create `@strata/` | Package naming for all sub-packages |
| **AI Core distribution** | WASM + native bindings OR server-only | Workshop capabilities |
| **Professor Pixel assets** | Commission professional art OR use existing | Brand consistency |

### Maintainer Tasks (M3: Infrastructure)

| Priority | Action | Deliverable |
|----------|--------|-------------|
| 1 | Review this plan | Feedback/approval |
| 2 | Register strata.game domain | Domain ownership |
| 3 | Configure DNS (apex + subdomains) | All domains resolve |
| 4 | Approve Strata brand extensions | Color palette sign-off |

### AI Agent Tasks (M1: Export Cleanup)

| Priority | Issue | Action |
|----------|-------|--------|
| 1 | #85 | Remove type re-exports from presets |
| 2 | #86 | Rename conflicting core exports with `*Core` suffix |
| 3 | #87 | Draft MIGRATION.md documenting all breaking changes |
| 4 | - | Verify build + tests pass after M1 completion |

### Parallel Work (No Blockers)

| Actor | Milestone | Action |
|-------|-----------|--------|
| AI Agent | M2 | Prepare extraction scripts for shaders/presets |
| AI Agent | M4 | Draft landing page content for strata.game |
| Community | - | Review RFCs (#51-#54) and provide feedback |
| Community | - | Test current 1.x for undocumented issues |

---

## Appendix A: Complete Strata Ecosystem Map

```
jbcom/
│
├─────────────── CORE ────────────────
│
├── nodejs-strata                      # Core framework package
│   ├── src/core/                      # Pure TypeScript
│   ├── src/react/                     # React components
│   ├── src/game/                      # NEW: Game orchestration
│   ├── src/world/                     # NEW: World topology
│   ├── src/compose/                   # NEW: Compositional objects
│   ├── src/framework/                 # NEW: Declarative games
│   └── docs/                          # → strata.game
│
├─────────────── SUB-PACKAGES ─────────
│
├── nodejs-strata-shaders              # GLSL shaders
│   └── docs/                          # → shaders.strata.game
│
├── nodejs-strata-presets              # Preset configurations
│   └── docs/                          # → presets.strata.game
│
├── nodejs-strata-examples             # Interactive examples
│   └── docs/                          # → examples.strata.game
│
├── nodejs-strata-react-native-plugin  # React Native support
│   └── docs/                          # → react-native.strata.game
│
├── nodejs-strata-capacitor-plugin     # Capacitor support
│   └── docs/                          # → capacitor.strata.game
│
├─────────────── STUDIO ──────────────
│
├── nodejs-strata-typescript-tutor     # → nodejs-strata-studio
│   ├── packages/workshop/             # Game wizard flows
│   ├── packages/learn/                # Education platform
│   ├── packages/arcade/               # Showcase gallery
│   ├── .agentic-control/              # Flow orchestration
│   └── apps/                          # Deployed frontends
│       ├── workshop.strata.game/
│       ├── learn.strata.game/
│       └── arcade.strata.game/
│
├─────────────── AI LAYER ────────────
│
├── rust-agentic-game-development      # Core AI libraries (Rust)
├── rust-agentic-game-generator        # RPG generation → merge into above
├── python-agentic-game-development    # Python bindings (PyO3)
│
├── nodejs-agentic-control             # Orchestration layer
│   └── depends on: agentic-triage
│
├── nodejs-agentic-triage              # Primitives layer
│
├─────────────── VALIDATION GAMES ────
│
├── nodejs-rivermarsh                  # Primary validation (mobile exploration)
├── nodejs-otter-river-rush            # Racing mode validation
├── nodejs-otterfall                   # 3D adventure validation
└── nodejs-rivers-of-reckoning         # Roguelike validation
```

---

## Appendix B: Issue Creation Template

For new milestone tasks, create issues with:

```markdown
## Summary
[Brief description of what needs to be done]

## Milestone Context
- **Milestone**: M[X] - [Name]
- **Epic**: #[number] (if applicable)
- **RFC**: RFC-00[X] (if applicable)
- **Blocks**: [milestone(s) this enables]
- **Blocked by**: [issue(s) that must complete first]

## Acceptance Criteria
- [ ] Specific deliverable 1
- [ ] Specific deliverable 2
- [ ] All tests pass (`pnpm run test`)
- [ ] Build passes (`pnpm run build`)
- [ ] Documentation updated (if public API)

## Technical Notes
[Implementation hints if any]

## Labels
- `v2.0`
- `milestone:M[X]`
- `breaking-change` (if applicable)
- `architecture` / `documentation` / `infrastructure`
```

---

*Document Version: 1.0.0*
*Last Updated: December 23, 2025*
