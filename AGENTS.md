# 🤖 Strata Agentic Instructions

This document provides a unified set of instructions for AI agents (Cursor, Jules, Claude) working within the Strata ecosystem.

## 🌌 Core Philosophy
Strata is a high-performance 3D game framework for React. Efficiency, modularity, and object reuse are paramount.

## 🛠️ Development Standards

### 1. No React in Core
All logic in `src/core/` must be pure TypeScript. No React imports, no hooks. This ensures core algorithms are portable and testable.

### 2. Performance & 3D
- **Object Reuse**: Never create geometries or materials in a render loop. Use `useMemo`.
- **Framerate**: Keep `useFrame` logic minimal.
- **Math**: Use the centralized math utilities in `src/core/math/`.

### 3. Documentation (TypeDoc)
- Every public function/class must have a TSDoc comment.
- Docs are automatically synced to the central [strata-game-library.github.io](https://strata-game-library.github.io) site.

### 4. Git & Commits
- Use Conventional Commits.
- One PR per feature.
- Always include a summary of changes for the next agent session.

## 🤖 Interaction Commands

| Command | Action |
|---------|--------|
| `/cursor review` | Trigger a Cursor AI review of the current PR |
| `/jules [prompt]` | Start a Jules session for high-level tasks |
| `@claude [prompt]` | Interactive help on PRs and Issues |

## 🧠 Memory Bank
Always update `memory-bank/activeContext.md` at the end of your session to ensure a smooth handoff to the next agent.
