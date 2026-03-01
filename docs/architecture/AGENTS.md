---
title: "Architecture Documentation Index"
description: "Agent guide for architecture documentation in the Strata game framework"
area: architecture
last_updated: 2026-03-01
---

# Architecture Documentation

## Overview

This directory contains the architectural vision, RFCs, and implementation guides for Strata's evolution from a rendering toolkit into a complete game framework. The framework adds four layers on top of existing rendering/simulation primitives: Game Orchestration, World Topology, Compositional Objects, and Declarative Game Definition.

## Documents

| File | Status | Implementation | Description |
|------|--------|---------------|-------------|
| [README.md](README.md) | Current | N/A | Directory index with links to all docs |
| [GAME_FRAMEWORK_VISION.md](GAME_FRAMEWORK_VISION.md) | Approved | 40% | High-level 4-layer framework vision, tracked by Epic #50 |
| [ROADMAP.md](ROADMAP.md) | Active | Phase 1-2 partial | 8-phase implementation timeline with task checklists |
| [STRATA_GAME_STUDIO_VISION.md](STRATA_GAME_STUDIO_VISION.md) | Proposal | 10% | Unified brand: Engine, Workshop, Learn, Arcade pillars |
| [UNIFIED_ORCHESTRATOR.md](UNIFIED_ORCHESTRATOR.md) | Proposal | Phase 1 partial | Multi-agent dev loop (Ollama + Jules + Cursor) |
| [AI_DESIGN_AUTOMATION.md](AI_DESIGN_AUTOMATION.md) | Research | 20% | AI design pipeline: v0, Magic MCP, screenshot-to-code |
| [PACKAGE_DECOMPOSITION.md](PACKAGE_DECOMPOSITION.md) | Superseded | Complete | Package split strategy (now implemented as monorepo) |
| [ECOSYSTEM_INTEGRATION.md](ECOSYSTEM_INTEGRATION.md) | Reference | Partial | TypeScript game migration analysis (arcade-cabinet org) |
| [ISSUE_TRIAGE.md](ISSUE_TRIAGE.md) | Stale | N/A | Issue triage from Dec 2025 (pre-monorepo) |
| [ARCADE_CABINET_TRIAGE.md](ARCADE_CABINET_TRIAGE.md) | Stale | N/A | Cross-repo ecosystem triage from Dec 2025 |

## Subdirectories

| Directory | Contents | AGENTS.md |
|-----------|----------|-----------|
| [rfc/](rfc/) | 4 RFCs defining the game framework layers | [rfc/AGENTS.md](rfc/AGENTS.md) |
| [guides/](guides/) | Migration guides and agent development instructions | [guides/AGENTS.md](guides/AGENTS.md) |

## 4-Layer Game Framework (Epic #50)

The framework vision adds four layers to Strata's existing rendering primitives:

| Layer | RFC | Package Location | Status | Implementation |
|-------|-----|-----------------|--------|---------------|
| **1: Game Orchestration** | [RFC-001](rfc/RFC-001-GAME-ORCHESTRATION.md) | `packages/core/src/game/` | Partial | 60% - SceneManager, ModeManager, TriggerSystem, TransitionManager exist |
| **2: World Topology** | [RFC-003](rfc/RFC-003-WORLD-TOPOLOGY.md) | `packages/core/src/world/` | Partial | 70% - WorldGraph, RegionSystem, ConnectionSystem, SpawnSystem exist |
| **3: Compositional Objects** | [RFC-002](rfc/RFC-002-COMPOSITIONAL-OBJECTS.md) | `packages/core/src/compose/` | Partial | 40% - Types and skeletons exist, material/creature factories incomplete |
| **4: Declarative Games** | [RFC-004](rfc/RFC-004-DECLARATIVE-GAMES.md) | `packages/core/src/api/` | Partial | 30% - createGame.ts exists, StrataGame in adapters/r3f |

## Key Context

- **Epic #50** is the master tracking issue on GitHub
- The monorepo migration (Feb 2026) restructured packages but the framework layers predate it
- `packages/core/` must remain pure TypeScript with NO React imports
- All React components live in `adapters/r3f/`
- The PACKAGE_DECOMPOSITION.md is superseded by the actual monorepo structure
- ISSUE_TRIAGE.md and ARCADE_CABINET_TRIAGE.md reference the old multi-repo setup

## Related

- [CLAUDE.md](../../CLAUDE.md) - Project-level instructions including framework overview
- [AGENTS.md](../../AGENTS.md) - Root agent instructions
- [PUBLIC_API.md](../../PUBLIC_API.md) - Stable API reference (some listed APIs not yet implemented)
- [CONTRACT.md](../../CONTRACT.md) - Stability guarantees
- [docs/plans/](../plans/) - Implementation plans from Feb 2026
