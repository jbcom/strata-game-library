# Arcade Cabinet Ecosystem Triage Plan

**Generated:** 2025-12-26
**Centerpoint:** `@jbcom/strata` - Core 3D Graphics & Game Framework

---

## Executive Summary

The arcade-cabinet organization contains 5 TypeScript games that should integrate with strata. This document provides a comprehensive triage of all open issues and PRs across the ecosystem, prioritized with strata integration as the central focus.

### Ecosystem Overview

| Repository | Language | Strata Status | Open Issues | Open PRs |
|------------|----------|---------------|-------------|----------|
| **nodejs-strata** | TypeScript | Core Library | 6 | 2 |
| **rivermarsh** | TypeScript | ✅ ^1.4.10 | 12 | 6 |
| **protocol-silent-night** | TypeScript | ⚠️ ^1.0.0 | 1 | 4 |
| **otter-river-rush** | TypeScript | ❌ Not using | 4 | 6 |
| **ebb-and-bloom** | TypeScript | ❌ Not using | 2 | 1 |
| **realm-walker** | TypeScript | ❌ Not using | 6 | 8 |

---

## Priority Matrix

### P0: Critical - Strata Core Infrastructure

| Repo | Issue/PR | Title | Reason |
|------|----------|-------|--------|
| nodejs-strata | #101 | EPIC: Strata Game Studio | Master tracking |
| nodejs-strata | #86 | Rename conflicting core exports | Blocking clean API |
| nodejs-strata | #85 | Remove type re-exports from presets | ✅ Addressed in PR #117 |
| nodejs-strata | #89 | Extract presets/shaders to packages | Bundle optimization |
| nodejs-strata | PR #117 | Core library and API audit | Current work |

### P1: High - Game Integration Blockers

| Repo | Issue/PR | Title | Action |
|------|----------|-------|--------|
| protocol-silent-night | #7 | Update strata to ^1.4.10 | Create PR |
| protocol-silent-night | PR #3 | Fix rapier peer dependency | Review & merge |
| otter-river-rush | #49 | Integrate strata | Planning |
| otter-river-rush | #9 | EPIC: Strata Integration | Consolidate with #49 |
| rivermarsh | #29 | Port leveling system | Strata state management |
| rivermarsh | #40 | Boss battle system | Strata AI/triggers |

### P2: Medium - Feature Development

| Repo | Issue/PR | Title | Strata Component |
|------|----------|-------|------------------|
| rivermarsh | #45-51 | Rivers of Reckoning ports | Various systems |
| rivermarsh | #8 | Playable demo | Showcase strata |
| rivermarsh | #5, #6 | GitHub Pages, PWA | Deployment |
| ebb-and-bloom | #20 | Integrate strata | World topology |
| realm-walker | #28 | Integrate strata | World management |

### P3: Low - Maintenance

| Repo | Issue/PR | Title | Action |
|------|----------|-------|--------|
| otter-river-rush | #16 | Tighten Biome rules | Standard maintenance |
| realm-walker | #13-16 | Code quality issues | Address after integration |
| Various | Dependabot PRs | Dependency updates | Batch merge |

---

## Detailed Repository Triage

### 1. nodejs-strata (Core Library)

**Status:** Active development, 1024 tests passing

#### Open Issues

| # | Title | Priority | Action | Blocked By |
|---|-------|----------|--------|------------|
| 101 | EPIC: Strata Game Studio | P0 | Track | - |
| 89 | Extract presets/shaders | P0 | Create repos | #85, #86 |
| 87 | Migration Guide | P1 | Write docs | #85, #86 |
| 86 | Rename conflicting exports | P0 | Implement | - |
| 85 | Remove type re-exports | P0 | ✅ Done | - |
| 62 | JSDoc enhancement | P2 | Ongoing | - |

#### Open PRs

| # | Title | Status | Action |
|---|-------|--------|--------|
| 117 | Core library audit | Draft | Complete & merge |
| 116 | PR management | Draft | Close if obsolete |
| 103 | Remove preset re-exports | Open | Superseded by #117 |

#### Recommended Actions
1. ✅ Complete PR #117 (current work)
2. Implement #86 (rename exports)
3. Create strata-shaders and strata-presets repos (#89)
4. Write migration guide (#87)

---

### 2. arcade-cabinet/rivermarsh

**Status:** Most mature game, using strata ^1.4.10

#### Open Issues - Prioritized

| # | Title | Priority | Strata Relevance |
|---|-------|----------|------------------|
| 40 | Boss Battle System | P1 | TriggerSystem, AI |
| 29 | Leveling/Progression | P1 | GameStateStore |
| 45 | Dynamic Quest System | P2 | TriggerSystem |
| 46 | Procedural Dungeon | P2 | WorldGraph |
| 47 | Particle System | P2 | ParticleEmitter ✅ |
| 48 | Feature Toggle | P2 | ModeManager |
| 49 | Animated Tiles | P2 | Shaders |
| 50 | Spell/Mana System | P2 | State management |
| 51 | Extended Enemy Types | P2 | AI presets |
| 8 | Playable Demo | P1 | Showcase |
| 5 | GitHub Pages | P2 | Deployment |
| 6 | PWA Support | P2 | Mobile |
| 1 | Audit otterfall code | P3 | Legacy cleanup |

#### Open PRs

| # | Title | Action |
|---|-------|--------|
| 75 | CI: checkout v6 | Merge |
| 74 | deps: fast-check | Merge |
| 73 | CI: upload-pages | Merge |
| 72 | CI: pnpm setup | Merge |
| 71 | CI: setup-node v6 | Merge |
| 67 | Game showcase | Review & merge |
| 64 | Boss battle | Review & merge |
| 62 | Leveling system | Review & merge |

#### Recommended Actions
1. Batch merge dependabot PRs (#71-75)
2. Review and merge feature PRs (#62, #64, #67)
3. Prioritize boss battle (#40) with strata TriggerSystem
4. Use strata GameStateStore for leveling (#29)

---

### 3. arcade-cabinet/protocol-silent-night

**Status:** Needs strata update, has runtime issues

#### Open Issues

| # | Title | Priority | Action |
|---|-------|----------|--------|
| 7 | Update strata ^1.4.10 | P1 | Create PR |

#### Open PRs

| # | Title | Status | Action |
|---|-------|--------|--------|
| 5 | Test suite + audio | Open | Review |
| 3 | Fix rapier crash | Open | **Priority merge** |
| 2 | Dependabot config | Open | Merge |

#### Recommended Actions
1. **Merge PR #3** - Fix runtime crash (blocks all development)
2. Create and merge strata update PR
3. Merge dependabot config (#2)
4. Review test suite PR (#5)

---

### 4. arcade-cabinet/otter-river-rush

**Status:** Monorepo, not using strata, has integration EPIC

#### Open Issues

| # | Title | Priority | Action |
|---|-------|----------|--------|
| 49 | Integrate strata | P1 | Active |
| 9 | EPIC: Strata Integration | P1 | Consolidate with #49 |
| 16 | Biome linting | P3 | After integration |
| 3 | Dependency Dashboard | P3 | Maintenance |
| 1 | agentic-crew integration | P2 | After strata |

#### Open PRs (Dependabot)

| # | Title | Action |
|---|-------|--------|
| 51 | three-clouds | Merge |
| 50 | zod | Review (major) |
| 48 | vite-react | Merge |
| 47 | @ai-sdk/openai | Review (major) |
| 46 | ora | Review (major) |

#### Recommended Actions
1. Close #9 as duplicate of #49
2. Merge safe dependabot PRs (#48, #51)
3. Review major version bumps (#46, #47, #50)
4. Begin strata integration (#49):
   - Phase 1: AdvancedWater for river
   - Phase 2: ParticleEmitter for splash
   - Phase 3: ProceduralSky for atmosphere

---

### 5. arcade-cabinet/ebb-and-bloom

**Status:** Complex simulation, strong strata fit

#### Open Issues

| # | Title | Priority | Action |
|---|-------|----------|--------|
| 20 | Integrate strata | P2 | Planning |
| 2 | Dependency Dashboard | P3 | Maintenance |

#### Open PRs

| # | Title | Status | Action |
|---|-------|--------|--------|
| 19 | Claude workflow | Open | Review |

#### Recommended Actions
1. Review Claude workflow PR (#19)
2. Plan strata integration (#20):
   - WorldGraph for region management
   - AI presets for creature behaviors
   - Procedural terrain utilities

---

### 6. arcade-cabinet/realm-walker

**Status:** Adventure game with AI, needs cleanup

#### Open Issues

| # | Title | Priority | Action |
|---|-------|----------|--------|
| 28 | Integrate strata | P2 | Planning |
| 13-16 | Code quality | P2 | Fix with integration |
| 3 | Dependency Dashboard | P3 | Maintenance |

#### Open PRs (Renovate)

| # | Title | Action |
|---|-------|--------|
| 27 | ts-jest | Merge |
| 26 | Node.js v24 | Review |
| 25 | Three.js deps | Merge |
| 24 | Minor deps | Merge |
| 23 | AI SDK | Merge |
| 22 | Memory bank | Close/merge |
| 21 | Test deps major | Review |
| 20 | pnpm v10 | Review |

#### Recommended Actions
1. Batch merge non-major PRs (#23, #24, #25, #27)
2. Review major version PRs (#20, #21, #26)
3. Integrate strata (#28) to resolve code quality issues (#13-16):
   - WorldGraph replaces custom world management
   - AI presets improve yuka usage
   - GameStateStore fixes persistence patterns

---

## Cross-Repository Coordination

### Strata Release Alignment

All games should align on strata version for consistent behavior:

| Repo | Current | Target | Action |
|------|---------|--------|--------|
| rivermarsh | ^1.4.10 | ^1.4.10 | ✅ Current |
| protocol-silent-night | ^1.0.0 | ^1.4.10 | PR needed |
| otter-river-rush | - | ^1.4.10 | Add dependency |
| ebb-and-bloom | - | ^1.4.10 | Add dependency |
| realm-walker | - | ^1.4.10 | Add dependency |

### Shared Component Identification

Components from strata that benefit multiple games:

| Component | rivermarsh | protocol | otter | ebb | realm |
|-----------|------------|----------|-------|-----|-------|
| AdvancedWater | ✅ | - | 🎯 | - | - |
| ProceduralSky | ✅ | 🎯 | 🎯 | 🎯 | 🎯 |
| ParticleEmitter | ✅ | 🎯 | 🎯 | 🎯 | 🎯 |
| WorldGraph | 🎯 | - | - | 🎯 | 🎯 |
| TriggerSystem | 🎯 | 🎯 | 🎯 | 🎯 | 🎯 |
| GameStateStore | 🎯 | 🎯 | - | 🎯 | 🎯 |
| AI Presets | ✅ | 🎯 | 🎯 | 🎯 | 🎯 |

Legend: ✅ Using, 🎯 Should use, - Not applicable

---

## Execution Timeline

### Week 1: Foundation

1. **Merge PR #117** (nodejs-strata) - API audit
2. **Merge PR #3** (protocol-silent-night) - Fix runtime crash
3. **Batch merge** dependabot PRs across all repos
4. **Create** protocol-silent-night strata update PR

### Week 2: Core Refactoring

1. **Implement #86** (strata) - Rename conflicting exports
2. **Merge** rivermarsh feature PRs (#62, #64, #67)
3. **Begin** otter-river-rush water integration

### Week 3: Package Extraction

1. **Create** nodejs-strata-shaders repository
2. **Create** nodejs-strata-presets repository
3. **Implement** transparent folding mechanism
4. **Continue** otter-river-rush integration

### Week 4: Documentation & Polish

1. **Write** migration guide (#87)
2. **Complete** otter-river-rush integration
3. **Begin** ebb-and-bloom world topology integration
4. **Review** realm-walker integration plan

---

## Success Metrics

| Metric | Current | Week 2 | Week 4 |
|--------|---------|--------|--------|
| Games on strata ^1.4.10 | 1/5 | 3/5 | 5/5 |
| Open PRs total | 35+ | <20 | <10 |
| Strata test coverage | 1024 | 1100+ | 1200+ |
| Documentation coverage | 60% | 75% | 90% |

---

## Issue Labels Strategy

Recommend adding consistent labels across all repos:

| Label | Color | Meaning |
|-------|-------|---------|
| `strata-integration` | #0366d6 | Requires strata changes |
| `strata-blocker` | #d73a49 | Blocked by strata issue |
| `strata-showcase` | #28a745 | Good for strata demos |
| `priority: critical` | #b60205 | P0 |
| `priority: high` | #d93f0b | P1 |
| `priority: medium` | #fbca04 | P2 |
| `priority: low` | #0e8a16 | P3 |

---

## Appendix: Full Issue/PR Counts

### nodejs-strata
- Open Issues: 6
- Open PRs: 2 (1 draft, 1 open)
- Closed Issues: 26
- Merged PRs: 100+

### rivermarsh
- Open Issues: 12
- Open PRs: 6 (5 dependabot, 1 feature)
- Closed Issues: 14
- Merged PRs: 15+

### protocol-silent-night
- Open Issues: 1
- Open PRs: 4
- Closed Issues: 0
- Merged PRs: 2

### otter-river-rush
- Open Issues: 4
- Open PRs: 6 (5 dependabot, 1 feature)
- Closed Issues: 10
- Merged PRs: 10+

### ebb-and-bloom
- Open Issues: 2
- Open PRs: 1
- Closed Issues: 3
- Merged PRs: 8

### realm-walker
- Open Issues: 6
- Open PRs: 8 (7 renovate, 1 draft)
- Closed Issues: 1
- Merged PRs: 11
