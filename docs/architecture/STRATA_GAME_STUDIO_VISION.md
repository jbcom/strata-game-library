---
title: "Strata Game Studio: Unified Vision"
description: "Unifying four game development paradigms under the Strata brand"
status: draft
implementation: 10
last_updated: 2026-03-01
area: architecture
---

# Strata Game Studio: Unified Vision

> **Unifying four game development paradigms under one powerful brand**

## The Four Pillars (Current State)

Today, game development tooling is fragmented across multiple repositories with different languages, approaches, and branding:

| Repo | Language | Focus | Target Package |
|------|----------|-------|----------------|
| `nodejs-strata` | TypeScript | 3D rendering engine for R3F | `@strata/core` |
| `nodejs-strata-typescript-tutor` | TypeScript | Interactive education + wizard flows | `@strata/studio` |
| `python-agentic-game-development` | Python | AI-assisted game dev academy | (internal/bindings) |
| `rust-agentic-game-generator` | Rust | AI-powered RPG generation | `strata-ai-core` (crate) |
| `rust-agentic-game-development` | Rust | Core AI client libraries | `strata-ai-core` (crate) |

**Plus validation games:**

- `nodejs-rivermarsh` - Mobile exploration
- `nodejs-otter-river-rush` - Racing
- `nodejs-otterfall` - 3D adventure
- `nodejs-rivers-of-reckoning` - Narrative roguelike

## The Vision: Strata Game Studio

**One brand. Four capabilities. Infinite games.**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         🎮 STRATA GAME STUDIO 🎮                           │
│                                                                             │
│    "From first line of code to finished game — AI-powered, human-guided"  │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   STRATA    │  │   STRATA    │  │   STRATA    │  │   STRATA    │        │
│  │   ENGINE    │  │   WORKSHOP  │  │    LEARN    │  │   ARCADE    │        │
│  │             │  │             │  │             │  │             │        │
│  │  Rendering  │  │  Creation   │  │  Education  │  │  Showcase   │        │
│  │  Framework  │  │  Wizards    │  │  Platform   │  │  Gallery    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │               │
│         └────────────────┴────────────────┴────────────────┘               │
│                                    │                                        │
│                          ┌─────────┴─────────┐                             │
│                          │   STRATA AI       │                             │
│                          │   (Orchestration) │                             │
│                          └───────────────────┘                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Four Pillars (Unified)

### 1. Strata Engine (`strata.game`)

**The core rendering and game framework for React Three Fiber.**

- Terrain, water, vegetation, sky, volumetrics
- ECS, physics, AI, animation, pathfinding
- Game orchestration (scenes, modes, triggers)
- Compositional objects (materials, skeletons, creatures)
- World topology (regions, connections)

**Package:** `@strata/core`
**Domain:** `strata.game` (apex)

---

### 2. Strata Workshop (`workshop.strata.game`)

**AI-powered game creation wizard with Professor Pixel as guide.**

Consolidates:

- Game wizard flows from typescript-tutor (platformer, racing, RPG, dungeon, space, puzzle)
- AI generation capabilities from rust-agentic-game-generator
- Orchestration via agentic-control

**Key Features:**

- Conversational game design with Professor Pixel
- Template-based project scaffolding
- Asset selection and customization
- Code generation targeting Strata Engine
- Export to standalone projects

**Package:** `@strata/workshop` (part of `@strata/studio`)
**Domain:** `workshop.strata.game`

**Agentic Control Integration:**

```yaml
# .agentic-control/workshop.yaml
flows:
  game-wizard:
    entry: platformer | racing | rpg | dungeon | space | puzzle | adventure
    orchestration:
      provider: agentic-control
      primitives: agentic-triage
    ai:
      asset-generation: strata-ai
      code-generation: strata-ai
      dialogue: professor-pixel
```

---

### 3. Strata Learn (`learn.strata.game`)

**Interactive education platform for TypeScript game development.**

Consolidates:

- Curriculum from typescript-tutor
- Teaching methodology from Professor Pixel's Arcade Academy
- Integration with actual Strata APIs

**Curriculum:**

1. **TypeScript Foundations** - Variables, types, functions
2. **React Basics** - Components, hooks, state
3. **3D Concepts** - Three.js, R3F fundamentals
4. **Strata Essentials** - Terrain, water, sky
5. **Game Mechanics** - ECS, physics, AI
6. **Building Games** - Full project walkthroughs

**Package:** `@strata/learn`
**Domain:** `learn.strata.game`

---

### 4. Strata Arcade (`arcade.strata.game`)

**Showcase gallery of games built with Strata.**

- Playable demos (Rivermarsh, Otter River Rush, Otterfall)
- Community submissions
- "Made with Strata" badge program
- Performance benchmarks
- Source code links

**Domain:** `arcade.strata.game`

---

## Strata AI (Cross-Cutting)

**The AI brain powering Workshop, Learn, and Arcade.**

Consolidates:

- `rust-agentic-game-development` - Core AI client (multi-provider LLM)
- `rust-agentic-game-generator` - RPG generation algorithms
- `python-agentic-game-development` - Python bindings + training data

**Capabilities:**

- **Asset Generation** - Sprites, 3D models, audio via external APIs
- **Code Generation** - TypeScript/Strata code from natural language
- **Game Blending** - Combine genres and mechanics
- **Dialogue** - Professor Pixel personality and teaching

**Architecture:**

```
┌──────────────────────────────────────────────────┐
│                   Strata AI                      │
├──────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │   Rust     │  │   Python   │  │   Node.js  │ │
│  │   Core     │──│  Bindings  │──│   Client   │ │
│  │            │  │  (PyO3)    │  │  (WASM)    │ │
│  └────────────┘  └────────────┘  └────────────┘ │
│                       │                          │
│              ┌────────┴────────┐                │
│              │ Multi-Provider  │                │
│              │ LLM Abstraction │                │
│              └─────────────────┘                │
│                       │                          │
│  ┌─────────┬─────────┬─────────┬─────────┐     │
│  │ OpenAI  │ Anthropic│ Ollama  │ Gemini  │     │
│  └─────────┴─────────┴─────────┴─────────┘     │
└──────────────────────────────────────────────────┘
```

---

## Professor Pixel: Education & Workshop Mascot

Professor Pixel is the mascot for **education and game creation** only - NOT a general Strata brand mascot.

### Two Versions

| Version | Context | Personality | Visual Style |
|---------|---------|-------------|--------------|
| **Kindly Professor** | Learn/Education | Patient teacher, encouraging, celebrates small wins | Classic, warm, approachable |
| **Cyberpunk Pixel** | Workshop/Game Creation | Creative collaborator, enthusiastic hacker energy | Neon, edgy, futuristic |

### Scope

| Property | Professor Pixel? |
|----------|-----------------|
| **Strata Learn** | ✅ Kindly Professor version |
| **Strata Workshop** | ✅ Cyberpunk version |
| **Strata Engine docs** | ❌ No mascot - technical documentation |
| **Strata Arcade** | ❌ Games speak for themselves |
| **Sub-package docs** | ❌ No mascot - technical documentation |

### Existing Assets

Assets exist for both versions (scattered across repos) - need consolidation into typescript-tutor.

---

## Domain Structure

```
strata.game/                  # Apex - Engine documentation
├── docs/                     # TypeDoc API reference
├── guides/                   # Getting started, tutorials
└── api/                      # API playground

workshop.strata.game/         # Game creation wizard
├── create/                   # New project wizard
├── templates/                # Genre templates
└── assets/                   # Asset library browser

learn.strata.game/            # Education platform
├── lessons/                  # Interactive curriculum
├── playground/               # Code sandbox
└── progress/                 # User progress tracking

arcade.strata.game/           # Game showcase
├── featured/                 # Curated games
├── community/                # User submissions
└── jams/                     # Game jam events
```

---

## Repository Consolidation

### Phase 1: Immediate

| Current | Action | Target |
|---------|--------|--------|
| `nodejs-strata` | Keep as core | `@jbcom/strata` |
| `nodejs-strata-typescript-tutor` | Rename + extend | `@strata/studio` (monorepo root) |
| `nodejs-strata-shaders` | Extract from main | `@strata/shaders` |
| `nodejs-strata-presets` | Extract from main | `@strata/presets` |
| `nodejs-strata-examples` | Keep | `@strata/examples` |

### Phase 2: Consolidation

| Current | Action | Target |
|---------|--------|--------|
| `python-agentic-game-development` | Merge AI logic | `@strata/ai` (via WASM) |
| `rust-agentic-game-development` | Core library | `strata-ai-core` (Rust crate) |
| `rust-agentic-game-generator` | Merge generation | `strata-ai-core` |

### Phase 3: Studio Structure

```
nodejs-strata-typescript-tutor/    # Stays as-is (correct name)
├── client/
│   ├── public/
│   │   ├── lessons/               # Learn content (Kindly Professor)
│   │   └── *-flow.json            # Workshop flows (Cyberpunk Pixel)
│   └── src/components/            # React UI
├── server/                        # Express backend
├── assets/                        # Game assets, sprites, audio
├── public/dialogue/               # Yarn dialogue files
└── .agentic-control/flows/        # Flow configs (to add)
```

**Deployments via GitHub Pages:**

- `learn.strata.game` → Education platform
- `workshop.strata.game` → Game creation wizard

---

## Agentic Control Integration

The Workshop flows become agentic-control configurations:

```yaml
# nodejs-strata-studio/.agentic-control/config.yaml
name: strata-studio
version: 1.0.0

primitives:
  source: "@jbcom/agentic-triage"
  
flows:
  # Game creation wizards
  - id: platformer-wizard
    entry: flows/platformer.yaml
    triggers:
      - user-intent: "create platformer game"
      - template: "platformer"
    
  - id: racing-wizard
    entry: flows/racing.yaml
    triggers:
      - user-intent: "create racing game"
      - template: "racing"
      
  - id: rpg-wizard
    entry: flows/rpg.yaml
    triggers:
      - user-intent: "create RPG"
      - template: "rpg"

ai:
  providers:
    - anthropic
    - openai
    - ollama
  default: anthropic
  
  personas:
    professor-pixel:
      system: |
        You are Professor Pixel, Strata's friendly mascot.
        You guide users through game creation with enthusiasm.
        Use gaming metaphors and celebrate progress.
```

---

## Success Metrics

### Brand Unification

- [ ] All game-related repos use "Strata" branding
- [ ] Professor Pixel appears across all properties
- [ ] Consistent visual design (colors, typography)
- [ ] Cross-linking between all subdomains

### Technical Integration

- [ ] Workshop generates valid Strata Engine code
- [ ] Learn curriculum teaches actual Strata APIs
- [ ] Arcade showcases run on Strata Engine
- [ ] AI capabilities accessible from all platforms

### User Journey

- [ ] New user: Learn → Workshop → Publish to Arcade
- [ ] Experienced dev: Strata Engine docs → Examples
- [ ] AI-assisted: Workshop wizard → Generated project

---

## Resolved Questions

1. **Monorepo vs Multi-repo?**
   - ✅ **Multi-repo** - typescript-tutor stays as-is with its correct name
   - No transformation needed, it IS already the workshop/learn platform

2. **Professor Pixel Scope**
   - ✅ **Education + Workshop ONLY** - NOT a general Strata mascot
   - Kindly old professor version → Learn/Education content
   - Cyberpunk version → Workshop/Game creation wizard
   - Existing assets scattered, need consolidation

3. **Hosting**
   - ✅ **GitHub Pages** for all properties
   - Domain registration just needs CNAME pointing to GH Pages

## Open Questions

1. **Rust AI Core Distribution**
   - WASM for browser?
   - Native bindings for Node.js?
   - Keep Python bindings for training/tooling?

2. **Community Features** (Future)
   - User accounts across properties?
   - Game jam infrastructure?
   - Asset marketplace?

---

## Control Center Integration

Repository management via `jbcom/control-center`:

### Ecosystem Sync

All Strata repositories are managed through control-center's ecosystem sync:

```json
// control-center/repo-config.json
{
  "ecosystems": {
    "strata": {
      "domain": "strata.game",
      "npm_scope": "@strata",
      "repos": [
        "nodejs-strata",
        "nodejs-strata-shaders",
        "nodejs-strata-presets",
        "nodejs-strata-examples",
        "nodejs-strata-typescript-tutor",
        "nodejs-strata-react-native-plugin",
        "nodejs-strata-capacitor-plugin"
      ]
    }
  }
}
```

### Settings.yml Configuration

Each repository uses standardized settings:

```yaml
# .github/settings.yml
repository:
  homepage: https://[package].strata.game
  topics:
    - strata
    - game-development
    - react-three-fiber

pages:
  enabled: true
  cname: [package].strata.game
```

### Related Control Center Issues

| Issue | Title |
|-------|-------|
| [#417](https://github.com/jbcom/control-center/issues/417) | Domain: Configure strata.game |
| [#416](https://github.com/jbcom/control-center/issues/416) | Domain: Configure agentic.dev |
| [#418](https://github.com/jbcom/control-center/issues/418) | Document multi-repo domain standard |
| [#349](https://github.com/jbcom/control-center/issues/349) | EPIC: Game Development Ecosystem Integration |
| [#351](https://github.com/jbcom/control-center/issues/351) | EPIC: Unify Professor Pixel |

---

## Immediate Next Steps

1. **Create Epic Issue** - "Strata Game Studio Unification" spanning all repos ✅ (#101)
2. **Prototype Studio Monorepo** - Start with typescript-tutor as base
3. **Update Branding** - Apply Strata brand to Professor Pixel properties
4. **Document AI Architecture** - How Rust core serves TypeScript/Python
5. **Workshop Flow Extraction** - Move flows to agentic-control configs

---

*Last Updated: 2025-12-23*
*Status: Proposal*
*Owner: TBD*
