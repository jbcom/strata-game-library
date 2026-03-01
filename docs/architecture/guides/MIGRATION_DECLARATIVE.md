---
title: "Migration Guide: Toolkit to Declarative Framework"
description: "Guide for migrating from manual toolkit approach to declarative createGame() API"
status: proposed
implementation: 0
last_updated: 2026-03-01
area: guides
---

# Migration Guide: Toolkit to Declarative Framework

This guide explains how to migrate from the manual "toolkit" approach to the new declarative `createGame()` API.

## 1. Overview

The old approach required manual setup of Canvas, ECS worlds, state stores, and managers. The new approach handles this orchestration for you based on a single game definition.

## 2. Before & After

### Before (Manual)

```tsx
function App() {
  const store = createGameStore();
  const world = createWorld();
  const input = createInputManager();

  return (
    <Canvas>
      <GameStateProvider store={store}>
        <WorldContext.Provider value={world}>
          <Terrain />
          <Player />
          <Systems />
        </WorldContext.Provider>
      </GameStateProvider>
    </Canvas>
  );
}
```

### After (Declarative)

```tsx
const game = createGame({
  name: 'My Game',
  content: { ... },
  world: { ... },
  scenes: {
    main: {
      id: 'main',
      render: () => <><Terrain /><Player /></>
    }
  },
  initialScene: 'main',
  modes: {
    exploration: { id: 'exploration', systems: [movementSystem], inputMap: { ... } }
  },
  defaultMode: 'exploration',
  statePreset: 'rpg',
  controls: { ... }
});

function App() {
  return <StrataGame game={game} />;
}
```

## 3. Key Changes

### Registry System

Move your material, creature, and prop definitions into the `content` section of your game definition. This allows them to be shared across scenes and modes.

### Scene Management

Instead of manually swapping components, define scenes in the `scenes` record. Use `game.sceneManager.load('sceneId')` to switch between them.

### Mode Management

Use modes for gameplay states (exploration, combat, etc.). Modes share the same 3D world but can have different systems, input maps, and UI overlays.

### State Presets

Choose a `statePreset` ('rpg', 'action', etc.) to get a pre-configured game store with appropriate state structure and actions.

## 4. Gradual Migration

You can use `StrataGame` alongside your existing components:

```tsx
<StrataGame game={game}>
  <LegacyComponent />
</StrataGame>
```

As you move logic into scenes and modes, you can remove the legacy components.
