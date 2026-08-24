---
title: Active Context
version: "2.0"
updated: 2026-03-01
---

# Active Context

## Current State (2026-03-01)

### Repository

- **Branch**: `main` (clean)
- **Monorepo**: Nx 22.5 + pnpm, 10 packages + 2 apps
- **npm scope**: `@strata-game-library` (6 published, 4 pending)
- **Domain**: strata.game (live)

### Recent PRs

- **PR #16-19**: CI/CD fixes culminating in pure OIDC npm publishing
- **PR #20**: Package metadata standardization (merged)
- **PR #21**: Comprehensive tests + READMEs -- 3 READMEs, 775 tests across 22 files

### Test Coverage

~110 test files, 2500+ tests across all packages. All 10 packages have READMEs and standardized metadata.

### Open Work Items

- 4 packages not yet on npm (r3f, reactylon, model-synth, astro)
- 2 npm trusted publisher configs need fixing (capacitor-plugin, react-native-plugin)
- Epic #50: Game framework Layers 3-4 not yet implemented
- Package consolidation under consideration (fewer, larger packages)

---

## Historical Context

### Initial Setup (2025-12-18)

- Migration from jbdevprimary/strata to jbcom/strata-game-library completed
- 17 PRs merged for dependency updates and infrastructure sync
- TypeDoc documentation system established
- Issues #7 (Coveralls), #21 (demo script), #22 (examples directory) addressed
- All GitHub Actions pinned to exact SHAs

### PR Cleanup (2025-12-20)

- 7 PRs merged including performance optimizations (#40, #44) and security fix (#41)
- 1,033 tests passing at 73.41% coverage
- AI PR review feedback validated (substantive, no hallucinations)

### Strata 2.0 Planning (2025-12-23)

**Key decisions made**:

- Monorepo restructuring with package extraction (shaders, presets, examples)
- Domain structure planned (strata.game apex + subdomains)
- Brand identity created with layer-based visual metaphor
- 9 milestones defined (M1-M9) with dependency ordering
- Game Framework Epic #50 with 4 RFCs proposed

**Sub-package ecosystem**:

- shaders, presets, examples, typescript-tutor, react-native-plugin, capacitor-plugin

**Validation games identified**: Rivermarsh, Otter River Rush, Otterfall, Rivers of Reckoning

### Strata Game Studio Vision (2025-12-23)

- Unified vision across multiple game development repos
- Structure: Engine + Workshop + Learn + Arcade + AI
- Professor Pixel role scoped to Education + Workshop only
- npm scope decision: `@strata`
- Hosting: GitHub Pages for all properties

### Multi-Agent Infrastructure (2025-12-23-24)

- Google Jules sessions created for bulk task delegation (14 sessions across repos)
- Cursor Cloud agent infrastructure planned
- Orchestration pattern: Jules for async refactoring, Ollama for quick fixes, Cursor for complex work
- 21st.dev Magic MCP configured for UI component generation

### Monorepo Migration (2026-02)

- Complete monorepo structure established with Nx
- R3F extraction: all React components moved from core to adapters/r3f (commit ab0f617)
- Core confirmed pure TypeScript with zero React imports
- CI/CD 4-workflow pipeline operational
- OIDC trusted publishing configured for npm
- Quality audit: all 10 packages at production quality

### World Topology Implementation (2025-12-24)

- WorldGraph, RegionSystem, ConnectionSystem, SpawnSystem implemented
- Unit tests and example added
- RFC-003 partially realized

---

## Session Log

### 2026-08-24 - Repository-goal continuation

**What was done**:
- Audited the live GitHub repository: merge commits and auto-merge enabled; squash/rebase disabled; default Actions permissions are read-only; full-SHA pinning and all-external-fork approval are enabled; dependency alerts, secret scanning, push protection, and private vulnerability reporting are active.
- Added `docs/` to the pnpm workspace so Sourcey is locked and available in CI.
- Built a Sourcey configuration for `https://jonbogaty.com/strata-game-library/`, including slash URLs, branding, repository/edit links, navigation, search, generated context files, and 16 public pages from the current guides and framework RFCs.
- Updated docs commands, link validation, and Pages delivery to build and publish `docs/dist` instead of the Astro output.
- Repaired a Sourcey workspace-name collision and rolled workspace tooling back from TypeScript 7 to TypeScript 5.9.3 because Nx 23 and tsup declaration generation require the supported compiler API; added the missing DOM/Node type environment for model-synth.

**Current state**:
- `pnpm run docs:build` and `pnpm run docs:links` pass (16 pages, generated search, sitemap, `llms.txt`, and `llms-full.txt`).
- `pnpm run lint` passes. The full `pnpm run typecheck` must be rerun to an observed final exit because the local execution window ended while its long parallel build was still reporting successful package checks.
- Astro/Starlight remains in `apps/docs/` as migration input and must be fully retired once all worthwhile public pages/assets are brought into Sourcey.

**Next steps**:
- Complete the full typecheck/test/package validation and address any real failures.
- Finish Sourcey content and asset parity, then remove the legacy Astro renderer and stale documentation references.
- Apply the checked-in main ruleset to live GitHub after validating the required checks, then create/update the goal PR and complete normal merge/release proof.

### 2026-03-01 - Memory Bank Architecture

**What was done**:

- Created 6-file memory bank architecture (AGENTS.md, projectbrief, productContext, systemPatterns, techContext, progress)
- Updated activeContext.md with frontmatter and condensed historical context
- Documented 5-layer memory architecture for multi-agent handoff

**Current state**:

- Memory bank fully structured and documented
- All files have YAML frontmatter
- Historical session logs condensed from 594 lines to key decisions

**Next steps**:

- Agents should follow handoff protocol in memory-bank/AGENTS.md
- Update progress.md as framework layers are implemented
- Add session entries to activeContext.md at end of each session

### 2026-08-24 - Sourcey cutover and validation continuation

**What was done**:
- Repaired the React Native touch identifier contract by converting native numeric identifiers to the framework's string-keyed touch map. Its typecheck and declaration build pass.
- Formatted active workspace code with the declared Biome configuration; `format:check` and lint pass (lint has pre-existing warnings only).
- Retired Astro/Starlight as a renderer: `apps/docs` is now an inert legacy-content workspace, its Astro config and build scripts are removed, and `docs/` Sourcey remains the only documentation build and Pages artifact.
- Removed stale public navigation to the historical Strata-domain vision; rebuilt Sourcey with 15 pages and no generated `strata.game`, Astro, or Starlight references.
- Updated the public README and documentation-agent instructions for the `jonbogaty.com/strata-game-library` Sourcey route.
- Aligned Babylon core peers to v9 to satisfy Reactylon/GUI, added exact security overrides for currently published fixes, and regenerated the lockfile.
- Updated the intentional umbrella Pixi API snapshot and repaired clean-consumer package validation by installing React peers in the consumer smoke environment.

**Validation observed**:
- Passed: `pnpm run format:check`, `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`, `pnpm run api:check`, `pnpm run package:inspect`, `pnpm run docs:build`, `pnpm run docs:links`, and `pnpm peers check`.
- A headed Sourcey inspection loaded the generated introduction at `http://localhost:4400/strata-game-library/`; its title, navigation, content, edit link, and GitHub/npm footer were correct.

**Known blocker**:
- `pnpm audit` now has only two high `image-size` advisories via React Native Metro. The registry reports `2.0.2` as latest, although the advisory names unreleased `2.0.3` as the first patched version. Do not pin the nonexistent version; let the dependency-update lane take the published upstream fix when available.

**Next steps**:
- Migrate the worthwhile legacy Markdown/API material from `apps/docs/src/content/docs` into Sourcey navigation, then remove the legacy-content workspace rather than treating it as a public site.
- Run final package/e2e/CI validation after content migration, apply the main ruleset once PR check names are observed, and create the normal GitHub PR.

### 2026-08-24 - Full Sourcey content migration continuation

**What was done**:
- Added a deterministic Sourcey preparation step that converts all 307 authored legacy Markdown/MDX pages (excluding the superseded root splash page) into Sourcey-consumable Markdown, preserves fenced examples, converts legacy links, and records generated paths for clean rebuilds.
- Expanded Sourcey navigation across getting started material, core systems, shaders, presets, framework RFCs, migration guides, adapters, examples, showcases, and generated TypeDoc Markdown. The Sourcey build now renders 322 content pages.
- Removed every Astro runtime/configuration/component/test/generated-artifact file from `apps/docs`; that workspace now retains only the authored legacy corpus as Sourcey migration input plus an explicit non-renderer README.
- Added a Sourcey migration map, moved Sourcey branding assets into `.github/assets`, replaced the old favicon path, and strengthened the public introduction with the original installation, architecture, scene, and learning-path content.

**Validation observed**:
- Passed after the migration: `pnpm run docs:build` (322 Sourcey pages), `pnpm run docs:links` (323 generated HTML pages), `pnpm run build`, `pnpm run api:check`, `pnpm run package:inspect`, `pnpm peers check`, `pnpm run typecheck`, `pnpm run test`, and `git diff --check`.
- The generated site contains no Astro, Starlight, or `strata.game` references in its public output. Historical planning/archive material remains out of public navigation.

**Current decision**:
- The legacy authored corpus remains only as deterministic migration input; it is not a renderer, workspace build, deployment input, or second production site. Before final merge, decide whether to keep that source-adapter pipeline or make the generated Markdown directly tracked under `docs/` and then delete the duplicate corpus.
