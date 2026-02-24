# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **See also:** `AGENTS.md` for comprehensive agent instructions.

## Project Overview

**@jbcom/strata** - Evolving from a procedural 3D graphics library into a **complete game framework** for React Three Fiber.

### Current (Toolkit)

Terrain, water, vegetation, sky, volumetrics, ECS, physics, AI, animation.

### In Development (Framework)

Game orchestration, world topology, compositional objects, declarative game definition.

**See:** [Architecture Docs](docs/architecture/README.md) | [Epic #50](https://github.com/jbcom/strata-game-library/issues/50)

## Quick Start

```bash
pnpm install        # Install dependencies
pnpm run build      # Build the library
pnpm run test       # Run all tests
pnpm run lint       # Lint with Biome
pnpm run typecheck  # Type checking
```

## Development Commands

```bash
# Testing
pnpm run test              # Run all tests
pnpm run test:unit         # Unit tests only
pnpm run test:integration  # Integration tests only
pnpm run test:e2e          # Playwright E2E tests
pnpm run test:coverage     # Tests with coverage

# Code Quality
pnpm run lint              # Biome lint
pnpm run lint:fix          # Auto-fix lint issues
pnpm run format            # Biome format
pnpm run typecheck         # TypeScript type checking

# Documentation
pnpm run docs              # Generate TypeDoc
pnpm run demo              # Serve demo files
```

## Architecture

```text
packages/
├── core/              # Pure TypeScript (NO React imports!)
│   └── src/
│       ├── core/      # AI, animation, audio, camera, ECS, math, state
│       ├── compose/   # Compositional object system
│       ├── game/      # Game orchestration, scenes, modes
│       ├── world/     # World topology, regions
│       ├── api/       # High-level API (createGame, etc.)
│       └── types/     # Shared TypeScript types
├── shaders/           # Standalone GLSL shaders
└── presets/           # Pre-configured game presets
adapters/
└── r3f/               # React Three Fiber adapter (@strata-game-library/r3f)
    └── src/
        ├── components/  # R3F components (Terrain, Water, Sky, etc.)
        ├── hooks/       # React hooks (useECS, useFrame wrappers)
        └── StrataGame.tsx  # Top-level game component
plugins/
├── audio-synth/       # Tone.js audio synthesis
├── model-synth/       # AI 3D model generation (Meshy API)
├── capacitor/         # Native mobile via Capacitor
└── react-native/      # React Native bridge
apps/
├── docs/              # Astro Starlight documentation site
└── examples/          # Example projects
```

**Key Rules**:

- `packages/core/` must have NO React imports -- pure TypeScript only.
- All React Three Fiber components and hooks live in `adapters/r3f/`.

## Code Standards

- **TypeScript**: Strict mode, no `any` types, JSDoc for public APIs
- **React**: Functional components only, forwardRef when needed
- **Shaders**: Use `/* glsl */` template literals
- **Testing**: Vitest for unit/integration, Playwright for E2E

## Commit Messages

```bash
# Conventional commits format
git commit -m "feat(terrain): add erosion simulation"   # → minor release
git commit -m "fix(water): correct reflection angle"    # → patch release
git commit -m "docs: update API docs"                   # → no release
git commit -m "test: add pathfinding tests"             # → no release
```

## Quality Checklist

Before completing work:

- [ ] All tests pass (`pnpm run test`)
- [ ] Linting passes (`pnpm run lint`)
- [ ] Type checking passes (`pnpm run typecheck`)
- [ ] Conventional commit message format
- [ ] Documentation updated if needed

## Project Structure

```text
.
├── packages/            # Core library packages
│   ├── core/            # Pure TS algorithms, ECS, state, game orchestration
│   ├── shaders/         # GLSL shaders
│   └── presets/         # Configuration presets
├── adapters/
│   └── r3f/             # React Three Fiber components & hooks
├── plugins/             # Optional extensions
│   ├── audio-synth/     # Procedural audio (Tone.js)
│   ├── model-synth/     # AI model generation
│   ├── capacitor/       # Mobile (Capacitor)
│   └── react-native/    # React Native bridge
├── apps/
│   ├── docs/            # Documentation site (Astro Starlight)
│   └── examples/        # Example projects
├── .github/
│   ├── workflows/       # CI/CD (SHA-pinned actions)
│   └── agents/          # Agent-specific instructions
├── CLAUDE.md            # This file
└── AGENTS.md            # Agent instructions
```

## Key Documentation

- `PUBLIC_API.md` - Stable, versioned API reference
- `API.md` - Complete API documentation
- `CONTRACT.md` - Stability guarantees and versioning
- `AGENTS.md` - Agent-specific instructions

## Architecture (Game Framework)

**Epic #50** tracks the evolution to a game framework. Key documents:

| Document | Purpose |
|----------|---------|
| [Vision](docs/architecture/GAME_FRAMEWORK_VISION.md) | High-level framework goals |
| [Roadmap](docs/architecture/ROADMAP.md) | Implementation timeline |
| [RFC-001](docs/architecture/rfc/RFC-001-GAME-ORCHESTRATION.md) | Scenes, modes, triggers |
| [RFC-002](docs/architecture/rfc/RFC-002-COMPOSITIONAL-OBJECTS.md) | Materials, skeletons, props |
| [RFC-003](docs/architecture/rfc/RFC-003-WORLD-TOPOLOGY.md) | Regions, connections |
| [RFC-004](docs/architecture/rfc/RFC-004-DECLARATIVE-GAMES.md) | createGame() API |
| [Migration](docs/architecture/guides/MIGRATION.md) | Toolkit → Framework |

## Compositional System (RFC-002)

The framework introduces a compositional object system:

```typescript
// Materials: fur, metal, wood, shell, crystal, flesh
const furOtter = createFurMaterial({ color: '#4a3520', length: 0.03 });

// Skeletons: biped, quadruped, avian, serpentine
const skeleton = createQuadrupedSkeleton({ bodyLength: 0.6 });

// Props: composites of shapes + materials
const crate = createProp({
  components: [
    { shape: 'box', size: [1, 1, 1], material: 'wood_oak' },
    { shape: 'box', size: [1.05, 0.03, 0.02], material: 'metal_iron' },
  ],
});

// Creatures: skeleton + covering + AI + stats
const otter = createCreature({
  skeleton: 'quadruped_medium',
  covering: { regions: { '*': { material: 'fur_otter' } } },
  ai: 'prey',
  stats: { health: 50, speed: 6 },
});
```

## Goal

Enable games to be defined declaratively with **10x code reduction**:

```typescript
const game = createGame({
  content: { creatures, props, materials },
  world: worldGraph,
  modes: { exploration, racing, combat },
  statePreset: 'rpg',
});

<StrataGame game={game} />
```
