# Strata Architecture Documentation

This directory contains architectural documentation for Strata's evolution from a rendering toolkit to a complete game framework.

## Documents

### Vision & Strategy
- [Game Framework Vision](./GAME_FRAMEWORK_VISION.md) - The high-level vision for Strata as a game framework
- [Strata Game Studio Vision](./STRATA_GAME_STUDIO_VISION.md) - Unified game development platform
- [Roadmap](./ROADMAP.md) - Implementation timeline and phases

### Automation & Tooling
- [Unified Multi-Agent Orchestrator](./UNIFIED_ORCHESTRATOR.md) - Autonomous development loop (Ollama + Jules + Cursor)
- [AI Design Automation](./AI_DESIGN_AUTOMATION.md) - End-to-end UI/UX generation pipeline

### RFC Documents
- [RFC-001: Game Orchestration](./rfc/RFC-001-GAME-ORCHESTRATION.md) - Scenes, modes, triggers
- [RFC-002: Compositional Objects](./rfc/RFC-002-COMPOSITIONAL-OBJECTS.md) - Materials, skeletons, props
- [RFC-003: World Topology](./rfc/RFC-003-WORLD-TOPOLOGY.md) - Regions, connections, portals
- [RFC-004: Declarative Games](./rfc/RFC-004-DECLARATIVE-GAMES.md) - createGame() API

### Implementation Guides
- [Migration Guide](./guides/MIGRATION.md) - Migrating from toolkit to framework usage
- [v2.0 Migration Guide](./guides/MIGRATION_V2.md) - Migrating from @jbcom/strata to @strata/core
- [Agent Instructions](./guides/AGENTS.md) - Instructions for AI agents working on Strata

### Package Architecture
- [Package Decomposition](./PACKAGE_DECOMPOSITION.md) - Strategy for optional @jbcom/strata-* packages
- [Ecosystem Integration](./ECOSYSTEM_INTEGRATION.md) - TypeScript games using Strata API
- [Issue Triage](./ISSUE_TRIAGE.md) - Current issue status and priorities

## Quick Links

- [GitHub Epic #50](https://github.com/jbcom/nodejs-strata/issues/50) - Master tracking issue
- [API Documentation](../api/) - Generated TypeDoc
- [Examples](../../examples/) - Working code examples
