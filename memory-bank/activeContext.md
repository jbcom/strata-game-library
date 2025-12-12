# Active Context

## Current Focus

**Session Date**: 2025-12-11

### Just Completed
- ✅ Pushed `feature/replit-expansion` branch to `jbcom/strata` (52 commits ahead of main)
- ✅ Created 4 milestones for v1.1.0 through v1.4.0 (2026 roadmap)
- ✅ Created EPIC issue #35 organizing all 27 feature issues
- ✅ Assigned all issues to appropriate milestones
- ✅ Installed and configured `gh` CLI for GitHub operations

### Branch Status
| Branch | Commit | Status |
|--------|--------|--------|
| `main` | `ffe6b87` | Released as v1.0.0 |
| `feature/replit-expansion` | `c2aa8ce` | 52 commits ahead, pushed to origin |

### Open PRs
- #7 `copilot/fix-pnpm-workspace-errors` - Fix pnpm workspace config (OPEN)

### Milestone Summary
| Milestone | Due | Issues | Focus |
|-----------|-----|--------|-------|
| v1.1.0 | Q1 2026 | 12 | Surface Materials & Biomes |
| v1.2.0 | Q2 2026 | 6 | Creature Archetypes |
| v1.3.0 | Q3 2026 | 7 | Player Experience (Traversal + Audio) |
| v1.4.0 | Q4 2026 | 3 | Temporal Systems & AI Integration |

---

## Project State

### Strata v1.0.0 (Released 2025-12-08)

**Package**: `@jbcom/strata` on npm

**Production-Ready Features**:
- Terrain (SDF, marching cubes, biomes)
- Water (caustics, foam, waves)
- Sky (day/night, weather)
- Vegetation (GPU-instanced)
- Characters (procedural animation, fur)
- Particles, Decals, Billboards
- Volumetrics (fog, underwater, god rays)
- Post-Processing (bloom, SSAO, DOF, etc.)
- Shadows (cascaded, contact)
- Reflections (probes, environment mapping)

### Packages
```
/home/runner/workspace/
├── src/                    # Main library source
├── packages/
│   ├── capacitor-plugin/   # Mobile (Capacitor)
│   ├── react-native/       # React Native bindings
│   ├── docs/               # TypeDoc output
│   └── examples/           # Showcase demos
└── postprocessing/         # Vendored postprocessing lib
```

### Development Commands
```bash
pnpm install          # Install deps
pnpm run build        # Build TypeScript
pnpm run test         # Run Vitest
pnpm run format       # Prettier
pnpm run lint         # ESLint
pnpm run docs:build   # TypeDoc
```

---

## Known Gaps (from GAP-ANALYSIS-SUMMARY.md)

| System | Coverage | Priority |
|--------|----------|----------|
| Graph/Pathfinding | 0% | High |
| Animation (Clip-based) | 0% | High |
| Physics (Ragdoll joints) | 60% | High |
| Audio Buses/Mixer | 70% | Medium |
| Postprocessing | 29% | Medium |

---

## Next Actions

1. **Merge PR #7** - Fix pnpm workspace config
2. **Review `feature/replit-expansion`** - Consider merging to main
3. **Begin v1.1.0 work** - Start with surface material shaders
4. **Fix known gaps** - Ragdoll joints, animation clips

---

*Last updated: 2025-12-11*
## Session: 2025-12-12

### Completed
- Address critical PR #36 feedback
- Remove generated docs from repo and add to .gitignore
- Fix CI security issue with NPM_TOKEN
- Fix hardcoded paths in environments.ts and .replit
- Fix package.json dependency versions (remove carets, fix husky/typescript)
- Fix memory leak in Capacitor web plugin
- Fix race conditions in React hooks
- Fix Android plugin input validation
- Fix iOS plugin deprecated API
- Pushed fixes to feature/replit-expansion
## Session: 2025-12-12

### Completed
- Stabilized environment and dependencies
- Cleaned up generated docs and fixed ignore patterns
- Fixed CI security vulnerabilities
- Addressed React 19 upgrade issues
- Upgraded ESLint to v9 and migrated to flat config (eslint.config.mjs)
- Fixed build errors in Physics, AI, and UI components
- Pushed all fixes to feature/replit-expansion
