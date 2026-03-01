---
title: "Strata Issue Triage Summary"
description: "Open issues by priority with dependency analysis and recommended actions"
status: active
implementation: 50
last_updated: 2026-03-01
area: architecture
---

# Strata Issue Triage Summary

Generated: 2025-12-26

## Open Issues by Priority

### Critical Priority

| # | Title | Labels | Status |
|---|-------|--------|--------|
| 101 | EPIC: Strata Game Studio - Unified Game Development Platform | epic | Active |

### High Priority - Refactoring

| # | Title | Status | Notes |
|---|-------|--------|-------|
| 89 | Extract presets and shaders to standalone packages | In Progress | Repos exist, need package renames |
| 86 | Rename conflicting core exports | ✅ Complete | ParticleEmitter→Core, CameraShake→Core, WeatherSystem→Core |
| 85 | Remove type re-exports from presets modules | ✅ Complete | Deprecation notices added |

### Medium Priority - Documentation

| # | Title | Status | Notes |
|---|-------|--------|-------|
| 87 | Create Strata 2.0 Migration Guide | Open | Blocked by #85, #86 |
| 62 | Complete JSDoc enhancement for all components | Open | 50+ components need work |

## Closed Issues (Recent)

| # | Title | Closed Date |
|---|-------|-------------|
| 102 | Configure 21st.dev Magic MCP | 2025-12-24 |
| 100 | Migrate internal/triage to agentic-triage | 2025-12-24 |
| 88 | Clean up internal/triage | 2025-12-25 |
| 84 | EPIC: Strata 2.0 Export Reorganization | 2025-12-24 |
| 72-64 | JSDoc Overhaul Packages 1-9 | 2025-12-23 |
| 54-50 | RFCs and EPIC #50 | Various |

## Issue Dependencies

```
#101 EPIC: Strata Game Studio
├── #89 Extract presets/shaders (in progress)
│   ├── #85 Remove type re-exports ✅ COMPLETE
│   └── #86 Rename conflicting exports ✅ COMPLETE
├── #87 Migration Guide (unblocked)
│   └── Depends on #85 ✅, #86 ✅
└── #62 JSDoc enhancement
```

## Recommended Actions

### 1. Close Issue #85 (Partially Complete)

The type re-exports have been addressed:

- `src/presets/terrain/index.ts` - Removed re-exports, added deprecation
- `src/presets/vegetation/index.ts` - Removed re-exports, added deprecation
- `src/presets/particles/index.ts` - Added deprecation notice

### 2. Issue #86 - Rename Conflicting Exports

**Priority:** High
**Blocked by:** Nothing
**Blocks:** #87, #89

**Action Plan:**

1. Rename `ParticleEmitter` → `ParticleEmitterCore` in core
2. Rename `CameraShake` → `CameraShakeCore` in core
3. Rename `WeatherSystem` → `WeatherSystemCore` in core
4. Update all internal usages
5. Add backwards-compatible aliases with deprecation

### 3. Issue #89 - Extract Packages

**Priority:** High
**Blocked by:** #85 (done), #86
**Blocks:** Nothing

**Action Plan:**

1. Create `strata-game-library/shaders` repository
2. Create `strata-game-library/presets` repository
3. Implement transparent folding mechanism
4. Update documentation

### 4. Issue #87 - Migration Guide

**Priority:** Medium
**Blocked by:** #85, #86
**Blocks:** Nothing

**Action Plan:**

1. Document all breaking changes
2. Create import migration examples
3. Add codemods if feasible
4. Update README and AGENTS.md

### 5. Issue #62 - JSDoc Enhancement

**Priority:** Medium (ongoing)
**Blocked by:** Nothing
**Blocks:** Nothing

**Remaining Components:** 50+
**Estimated Effort:** 20-25 hours

## Cross-Repository Issues (arcade-cabinet)

### arcade-cabinet/rivermarsh

**Status:** ✅ Using Strata ^1.4.10

### arcade-cabinet/protocol-silent-night

| # | Title | Priority |
|---|-------|----------|
| 7 | Update @jbcom/strata to ^1.4.10 | High |

**Status:** ⚠️ Using Strata ^1.0.0 (outdated)

### arcade-cabinet/otter-river-rush

| # | Title | Priority |
|---|-------|----------|
| 49 | Integrate @jbcom/strata for water, terrain, effects | Medium |

**Status:** ❌ Not using Strata

### arcade-cabinet/ebb-and-bloom

| # | Title | Priority |
|---|-------|----------|
| 20 | Integrate @jbcom/strata for world topology and AI | Medium |

**Status:** ❌ Not using Strata

### arcade-cabinet/realm-walker

| # | Title | Priority |
|---|-------|----------|
| 28 | Integrate @jbcom/strata for world management | Medium |
| 16 | (Code quality) | Medium |
| 15 | (Code quality) | High |
| 14 | (Code quality) | High |
| 13 | (Code quality) | High |

**Status:** ❌ Not using Strata

## Strata Organization Structure

The `strata-game-library` GitHub organization hosts all Strata packages:

| Repository | Purpose | npm Package |
|------------|---------|-------------|
| `strata-game-library/core` | Main library | `@strata/core` |
| `strata-game-library/shaders` | GLSL shaders | `@strata/shaders` |
| `strata-game-library/presets` | Pre-configured presets | `@strata/presets` |
| `strata-game-library/examples` | Example projects | (not published) |

**Migration:** `@jbcom/strata` → `@strata/core` (v2.0)

## Summary

| Category | Count |
|----------|-------|
| Open Issues (this repo) | 6 |
| Critical | 1 |
| High Priority | 3 |
| Medium Priority | 2 |
| arcade-cabinet games using Strata | 2/5 |
| arcade-cabinet games needing migration | 3 |

## Integration Issues Created

| Repo | Issue | Title |
|------|-------|-------|
| arcade-cabinet/protocol-silent-night | #7 | Update @jbcom/strata to latest |
| arcade-cabinet/otter-river-rush | #49 | Integrate @jbcom/strata for water, terrain, effects |
| arcade-cabinet/ebb-and-bloom | #20 | Integrate @jbcom/strata for world topology and AI |
| arcade-cabinet/realm-walker | #28 | Integrate @jbcom/strata for world management |
