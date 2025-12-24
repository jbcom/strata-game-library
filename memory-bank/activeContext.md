# Active Context

## strata

Procedural 3D graphics library for React Three Fiber.

### Features

- Terrain generation (SDF, marching cubes)
- Water effects (waves, caustics)
- Sky system (day/night cycle, weather)
- Volumetric effects (fog, underwater)
- Vegetation instancing (with seeded random for reproducibility)
- Particle systems
- Character animation
- Post-processing effects

### Package Status

- **Registry**: npm (@jbcom/strata)
- **Repository**: github.com/jbcom/nodejs-strata
- **Framework**: React Three Fiber
- **Dependencies**: three, @react-three/fiber, @react-three/drei

### Development

```bash
pnpm install
pnpm run build
pnpm run test
pnpm run demo          # Serve demo files
pnpm run format        # Biome format
pnpm run format:check  # Biome format check
```

### Architecture

- `src/core/` - Pure TypeScript algorithms (no React)
- `src/components/` - React Three Fiber components
- `src/shaders/` - GLSL shaders
- `src/presets/` - Ready-to-use configurations
- `examples/` - Working example projects

### Recent Changes (2025-12-18)

- **Migration completed**: All references updated from jbdevprimary/strata to jbcom/nodejs-strata
- **17 PRs merged**: Dependency updates and infrastructure sync
- **Documentation system**: Using TypeDoc for API documentation
- **Issues addressed**:
  - #7: Fixed Coveralls coverage configuration (reportsDirectory added)
  - #21: Added `demo` script to serve demo files
  - #22: Created examples directory with basic-terrain example
- **GAPS.md updates**:
  - Seeded random implemented (optional seed parameter)
  - Input validation added to instancing functions
  - GPU wind/LOD props documented with JSDoc
- **CI/CD improvements**:
  - All GitHub Actions pinned to exact SHAs for security
  - Documentation workflow fixed to use TypeDoc instead of Sphinx

### PR Cleanup Session (2025-12-20)

**Session**: cursor/project-cleanup-and-assessment-4c4f

**PRs Merged (7 total)**:

- #35: deps: @types/node 25.0.2 → 25.0.3
- #36: deps: @ai-sdk/mcp beta.39 → beta.40
- #37: deps: ai-sdk-ollama 2.0.1 → 2.1.0
- #39: deps: @biomejs/biome 2.3.9 → 2.3.10
- #40: ⚡ Optimize noise function allocations (APPROVED by Claude)
- #41: 🛡️ Fix missing state integrity check (security fix)
- #44: ⚡ Optimize marching cubes vector allocations

**Remaining Open PRs (4)**:

- #38: deps: ai 5.0.113 → 5.0.115 (merge conflicts with pnpm-lock.yaml)
- #42: 🎨 UI Accessibility (build fails, superseded by #45)
- #43: 🛡️ State integrity check (duplicate of merged #41)
- #45: 🎨 DialogBox accessibility (flaky test in CI, needs merge)

**Actions Taken**:

- Marked draft PRs #40, #41, #43, #44 as ready for review
- Created `PR_MERGE_STRATEGY.md` with complete assessment
- Fixed flaky timing test in `stateMachine.test.ts`
- All 1,033 tests passing
- Code coverage at 73.41%

**AI Feedback Assessment**:

- PR #40: Positive - excellent performance optimization
- PR #41: Positive - important security fix
- PR #42: CHANGES_REQUESTED - valid issues identified
- All AI feedback was substantive, no hallucinations detected

---

### Strata 2.0 Planning Session (2025-12-23)

**Session**: cursor/strata-2-0-project-restructuring-9c1a

**Comprehensive Assessment Completed**:

1. **Main Repository Analysis**:
   - Current version: 1.4.10
   - 1,033 tests at 73.41% coverage
   - Extensive RFCs for Game Framework (Epic #50)
   - v2.0 Export Reorganization planned (Epic #84)

2. **Sub-Package Ecosystem Discovered**:
   - nodejs-strata-shaders (new, pending extraction)
   - nodejs-strata-presets (new, pending extraction)
   - nodejs-strata-examples (needs migration)
   - nodejs-strata-typescript-tutor (Professor Pixel platform)
   - nodejs-strata-react-native-plugin (new)
   - nodejs-strata-capacitor-plugin (new)

3. **Domain Structure Planned**:
   - Apex: strata.game → Main documentation
   - tutor.strata.game → Professor Pixel
   - examples.strata.game → Interactive demos
   - shaders.strata.game → Shader docs
   - presets.strata.game → Preset gallery
   - react-native.strata.game → RN plugin docs
   - capacitor.strata.game → Capacitor docs

4. **Brand Identity Created**:
   - Strata-specific color palette (terrain, water, vegetation, sky)
   - Layer-based visual metaphor
   - Within jbcom guidelines with unique character
   - CSS assets created in docs/_static/strata-brand.css

5. **Key Documents Created**:
   - STRATA_2_0_PLAN.md - Comprehensive restructuring plan
   - docs/STRATA_BRAND_GUIDE.md - Brand identity guidelines
   - docs/_static/strata-brand.css - Brand CSS assets

6. **Critical v2.0 Issues Identified**:
   - #85: Remove type re-exports from presets
   - #86: Rename conflicting core exports
   - #87: Create migration guide
   - #88: Clean up internal/triage
   - #89: Extract presets/shaders to packages

7. **Game Framework (Epic #50) Status**:
   - RFC-001: Game Orchestration (Proposed)
   - RFC-002: Compositional Objects (Proposed)
   - RFC-003: World Topology (Proposed)
   - RFC-004: Declarative Games (Proposed)

8. **Milestones Defined** (issue-scoped, dependency-ordered):
   - M1: Export Cleanup (#85, #86, #87) - starting point
   - M2: Package Extraction (#88, #89) - blocked by M1
   - M3: Infrastructure (domain/DNS) - parallel with M1
   - M4: Documentation Site - blocked by M2, M3
   - M5: Game Orchestration (RFC-001) - blocked by M1
   - M6: Compositional Objects (RFC-002) - blocked by M1
   - M7: World Topology (RFC-003) - blocked by M5, M6
   - M8: Declarative API (RFC-004) - blocked by M7
   - M9: Validation (Rivermarsh port) - blocked by M8

9. **Validation Targets**:
   - nodejs-rivermarsh (Primary)
   - nodejs-otter-river-rush (Racing mode)
   - nodejs-otterfall (AI/terrain)

**Immediate Actions**:

- Maintainer: Review STRATA_2_0_PLAN.md, configure strata.game domain (M3)
- AI Agents: Begin M1 - Issue #85 (remove type re-exports)
- Parallel: Draft M4 landing page content

---

### Strata Game Studio Vision (2025-12-23)

**Session**: cursor/strata-2-0-project-restructuring-9c1a (continued)

**Major Discovery - Four Game Development Paradigms**:

Identified fragmented game development tooling across organization:

| Repo | Language | Focus |
|------|----------|-------|
| nodejs-strata | TypeScript | 3D rendering engine |
| nodejs-strata-typescript-tutor | TypeScript | Professor Pixel education + wizards |
| python-agentic-game-development | Python | AI-powered game academy |
| rust-agentic-game-development | Rust | Core AI libraries |
| rust-agentic-game-generator | Rust | RPG generation |

**Unified Vision Created**: Strata Game Studio

```
STRATA GAME STUDIO
├── Strata Engine (strata.game)        - Core framework
├── Strata Workshop (workshop.strata.game) - AI game wizards
├── Strata Learn (learn.strata.game)   - Education platform
├── Strata Arcade (arcade.strata.game) - Game showcase
└── Strata AI                          - Cross-cutting AI layer
```

**Agentic Architecture Clarified**:

- agentic-triage = Primitives layer
- agentic-control = Orchestration (builds on triage)
- Workshop flows → agentic-control configurations
- internal/triage removed (migrated to agentic-triage)

**Professor Pixel Evolution**:
From "tutor mascot" → Strata's official brand mascot across ALL properties

**Key Documents Created**:

- docs/architecture/STRATA_GAME_STUDIO_VISION.md
- Updated STRATA_2_0_PLAN.md with Part 10: Game Studio Vision

**New Issues Created**:

- ✅ #100: Migrate internal/triage to nodejs-agentic-triage
- #101: EPIC: Strata Game Studio (added to Roadmap project)
- typescript-tutor#25: Convert lessons to TypeScript/Strata curriculum
- typescript-tutor#26: Full Strata sub-package alignment

**Cloned & Reviewed**:

- nodejs-strata-typescript-tutor → /tmp/
- PR #24 analysis: Package renamed but lessons still Python (incomplete!)
- Wizard flows discovered: platformer, racing, rpg, dungeon, space, puzzle, adventure

**Validation Games Identified**:

- nodejs-rivermarsh (mobile exploration)
- nodejs-otter-river-rush (racing)
- nodejs-otterfall (3D adventure)
- nodejs-rivers-of-reckoning (roguelike)

**Decisions Made**:

1. npm scope: **@strata** ✅
2. Repository management: control-center ecosystem sync + settings.yml ✅
3. typescript-tutor: **Stays as-is** (correct repo, correct name) ✅
4. Professor Pixel scope: **Education + Workshop ONLY** ✅
   - Kindly Professor → Learn/Education
   - Cyberpunk version → Workshop/Game creation
   - NOT a general Strata mascot
5. Hosting: **GitHub Pages** for all properties ✅

**Open Decisions for Maintainer**:

1. AI Core distribution (WASM + napi-rs + PyO3?)
2. Community features (user accounts, game jams) - Future

---

### AI Design Automation (2025-12-23)

**21st.dev Setup** (for local Cursor agent):

- GitHub App integration ✅
- Sandboxes ✅
- MCP config issues created for all repos

**Issues Created for Local Agent**:

| Repo | Issue |
|------|-------|
| nodejs-strata | #102 |
| nodejs-strata-typescript-tutor | #28 |
| nodejs-strata-examples | #5 |
| nodejs-strata-shaders | #3 |
| nodejs-strata-presets | #4 |
| nodejs-agentic-control | #16 |
| nodejs-agentic-triage | #33 |

**Research Doc**: `docs/architecture/AI_DESIGN_AUTOMATION.md`

---

### Google Jules Sessions Created (2025-12-23)

**Active Sessions**:

| Session ID | Repo | Issue | State |
|------------|------|-------|-------|
| 6461977688710426187 | nodejs-strata | #85 (type re-exports) | IN_PROGRESS |
| 12458278989436703513 | nodejs-strata | #86 (rename conflicts) | IN_PROGRESS |
| 9336518623683428774 | nodejs-strata | #87 (migration guide) | PLANNING |
| 11669387661492834547 | nodejs-strata | #62 (JSDoc) | PLANNING |
| 6639394045107953411 | typescript-tutor | #25 (lessons) | PLANNING |
| 8513814861901981159 | typescript-tutor | #26 (alignment) | PLANNING |
| 8629052423384508351 | strata-shaders | #1 (setup) | IN_PROGRESS |
| 5205724061551026724 | strata-presets | #1 (setup) | IN_PROGRESS |
| 6147624975303516306 | strata-examples | #4 (migrate) | PLANNING |
| 10632111278932960213 | agentic-triage | #23 (tooling) | AWAITING_PLAN_APPROVAL |
| 3886505127057072428 | agentic-control | #8 (tooling) | PLANNING |

**Monitor**: <https://jules.google.com>

**CLI Options**:

- Local/Interactive: `npx @google/jules` (requires OAuth login)
- Cloud/Programmatic: `node scripts/jules-session.mjs` (uses API key)

**API Key**: Set as JULES_API_KEY environment variable

**Script Created**: `/workspace/scripts/jules-session.mjs` - Simple wrapper for Jules REST API

---

### Control Center Integration (2025-12-23)

**Issues Created in jbcom/control-center**:

| Issue | Title |
|-------|-------|
| [#416](https://github.com/jbcom/control-center/issues/416) | 🌐 Domain: Configure agentic.dev for @agentic ecosystem |
| [#417](https://github.com/jbcom/control-center/issues/417) | 🌐 Domain: Configure strata.game for @strata ecosystem |
| [#418](https://github.com/jbcom/control-center/issues/418) | 📚 docs: Document multi-repo domain standard |

**Multi-Repo Domain Standard Defined**:

Projects qualifying for dedicated domain:

- ≥ 3 active repositories
- Cross-repository dependencies
- ≥ 2 published packages
- Unified documentation need

**Qualified Ecosystems**:

| Ecosystem | Domain | npm Scope |
|-----------|--------|-----------|
| Strata | strata.game | @strata |
| Agentic | agentic.dev | @agentic |

**npm Package Mapping**:

| Current | Target |
|---------|--------|
| @jbcom/strata | @strata/core |
| @jbcom/strata-shaders | @strata/shaders |
| @jbcom/strata-presets | @strata/presets |
| (new) | @strata/studio |

---

### Unified Multi-Agent Orchestrator (2025-12-23)

**EPIC Created**: [control-center#422](https://github.com/jbcom/control-center/issues/422)

**Vision**: Fully self-contained autonomous development loop combining:

| Agent | Use Case | Status |
|-------|----------|--------|
| **Ollama** | Quick fixes, code review, routing | ✅ OLLAMA_API_KEY exists |
| **Google Jules** | Async refactoring, multi-file changes | ✅ GOOGLE_JULES_API_KEY exists |
| **Cursor Cloud** | Long-running background processes | ⏳ CURSOR_API_KEY needed (#423) |
| **AI Reviewers** | PR quality gates | ✅ Available (Gemini, Copilot, Q, CodeRabbit) |

**Task Routing Matrix**:

| Task Type | Agent | Reason |
|-----------|-------|--------|
| Quick fix (<5 lines) | Ollama | Inline, fast |
| Code review | Ollama | Structured JSON |
| Multi-file refactor | Jules | Async, AUTO_CREATE_PR |
| Large feature (>100 lines) | Cursor Cloud | Full IDE context |
| Documentation | Jules | Full file context |
| Complex bug fix | Cursor Cloud | Debugging capability |

**Architecture**:

```
ISSUE → Task Router (Ollama) → [Ollama | Jules | Cursor] → PR → AI Review Swarm → Feedback Processor → Auto-merge
```

**Implementation Phases**:

1. ✅ Jules Integration (#420 + session 7376203189327359068)
2. ⏳ Cursor Cloud Integration (#423)
3. ⏳ Unified Router
4. ⏳ Feedback Loop
5. ⏳ Monitoring Dashboard

**Token Status (CURSOR_GITHUB_TOKEN)**:

- ✅ Org secrets (admin:org)
- ✅ Org projects (project)
- ✅ Repo CRUD (repo)
- ✅ Workflows (workflow)
- ✅ Packages (write:packages)
- ⚠️ Missing: admin:org_hook (optional - for org webhooks)

---

### Ecosystem Monitoring Dashboard (2025-12-24)

**Dogfooding in Progress**: control-center#421 (Jules Integration)

**Active Autonomous Loop**:

```
Jules creates PR → Ollama reviews → GitHub Security scans → Self-resolution fixes → CI validates → (iterate)
```

**PR #421 Status**:

- Author: `google-labs-jules[bot]`
- Commits: 4 (including 3 self-resolution commits!)
- CI: Failing (actionlint issues)
- Fix posted: Comment with specific fixes for untrusted input + backticks

**Ecosystem PR Counts**:

| Repository | Open PRs | Key Items |
|------------|----------|-----------|
| control-center | 1 | Jules integration PR |
| nodejs-strata | 9 | Dependabot + Strata 2.0 |
| nodejs-strata-shaders | 1 | Initial package |
| nodejs-strata-presets | 2 | Initial + Dependabot |
| nodejs-strata-examples | 1 | Initial examples |
| nodejs-strata-typescript-tutor | 18 | Educational overhaul |
| nodejs-agentic-triage | 10 | Dependabot updates |
| nodejs-agentic-control | 1 | Biome/TypeDoc fix |

**Issues Created Today**:

- #422: Unified Multi-Agent Orchestrator EPIC
- #423: CURSOR_API_KEY secret needed
- #424: Add typescript-tutor to ecosystem sync

**Repos in Ecosystem Sync** (nodejs):

- ✅ nodejs-strata
- ✅ nodejs-strata-shaders
- ✅ nodejs-strata-presets
- ✅ nodejs-strata-examples
- ✅ nodejs-strata-capacitor-plugin
- ✅ nodejs-strata-react-native-plugin
- ✅ nodejs-agentic-control
- ✅ nodejs-agentic-triage
- ❌ nodejs-strata-typescript-tutor (missing! #424)

**Next Actions**:

1. Monitor PR #421 for Jules to fix actionlint issues
2. Add CURSOR_API_KEY secret (#423)
3. Add typescript-tutor to ecosystem sync (#424)
4. When #421 merges → Jules workflow syncs to all repos
5. Orchestrator will then manage Strata PRs autonomously

---

### @agentic Package Architecture (2025-12-24)

**EPIC**: [control-center#427](https://github.com/jbcom/control-center/issues/427)

**Problem Identified**: Orchestration logic is 500+ lines of inline YAML instead of proper packages.

**Correct Architecture**:

```
@agentic/triage (PRIMITIVES)
├── schemas/        # Zod schemas
├── tools/          # Vercel AI SDK tools
└── handlers/       # Structured outputs
       ↓
@agentic/control (ORCHESTRATION)
├── orchestrators/  # Multi-agent routing
├── pipelines/      # CI resolution, PR lifecycle
└── actions/        # GitHub Marketplace actions
       ↓
GitHub Marketplace Actions
├── jbcom/agentic-pr-review@v1
├── jbcom/agentic-ci-resolution@v1
└── jbcom/agentic-orchestrator@v1
```

**Current State (Wrong)**:

- triage depends on control ❌

**Target State (Correct)**:

- control depends on triage ✅

**Jules Sessions Created**:

| Session | Repo | Purpose |
|---------|------|---------|
| 867602547104757968 | agentic-triage | @agentic/triage primitives |
| 13162632522779514336 | agentic-control | @agentic/control orchestration |
| 14191893082884266475 | agentic-control | GitHub Marketplace actions |

**Tracking Issues**:

- control-center#427 (Architecture EPIC)
- agentic-triage#34 (Primitives refactor)
- agentic-control#17 (Orchestration refactor)

**End Goal**:

```yaml
# Replace 500 lines of bash with:
- uses: jbcom/agentic-control/actions/orchestrator@v1
  with:
    model: glm-4.6:cloud
```

---

### Bulk Delegation Session (2025-12-24)

**Tracking Issue**: [control-center#428](https://github.com/jbcom/control-center/issues/428)

**Ecosystem Scan Results**:

- 24 active repositories
- 134 open issues
- 139 open PRs

**Jules Sessions Created** (14 total):

| Repo | Session | Purpose |
|------|---------|---------|
| nodejs-strata | 14280291537956787934 | Type re-exports |
| nodejs-strata | 16588734454673787359 | Rename conflicts |
| nodejs-strata | 5426967078338286150 | JSDoc |
| agentic-triage | 867602547104757968 | @agentic/triage |
| agentic-control | 13162632522779514336 | @agentic/control |
| agentic-control | 14191893082884266475 | Marketplace actions |
| rust-agentic-game-generator | 867602547104759625 | Dead code |
| rust-agentic-game-generator | 350304620664870671 | Fix CI |
| rust-cosmic-cults | 2900604501010123486 | Fix CI |
| rust-cosmic-cults | 11637399915675114026 | Upgrade Bevy |
| python-vendor-connectors | 10070996095519650495 | Zoom tools |
| python-vendor-connectors | 4020473597600177522 | Vault tools |
| python-vendor-connectors | 6253585006804834966 | Slack tools |
| python-vendor-connectors | 3034887458758718600 | Google tools |

**Rate Limited (retry later)**:

- nodejs-otter-river-rush #15
- nodejs-rivers-of-reckoning #21
- nodejs-otterfall
- nodejs-rivermarsh #42-44
- python-agentic-crew

---

### Cursor Cloud Agent Infrastructure (2025-12-24)

**Environment Variables for Future Agents**:

- `JULES_API_KEY` ✅ - Google Jules API
- `CURSOR_GITHUB_TOKEN` ✅ - GitHub operations

**Orchestration Pattern**:

```
Cursor Cloud Agent (supervisor)
    ├── Monitors Jules sessions
    ├── Reviews PRs when complete
    ├── Handles AI feedback
    ├── Merges when ready
    └── Spawns sub-agents for complex work
```

**Assets Created** (in control-center repo):

- `scripts/cursor-jules-orchestrator.mjs` - Monitoring script
- `repository-files/always-sync/scripts/cursor-jules-orchestrator.mjs` - Synced to all repos
- `CLAUDE.md` - Agent instructions for Jules API
- [control-center#429](https://github.com/jbcom/control-center/issues/429) - Pattern documentation
- [control-center PR#426](https://github.com/jbcom/control-center/pull/426) - All infrastructure (+958 lines)

---

Last updated: 2025-12-24
