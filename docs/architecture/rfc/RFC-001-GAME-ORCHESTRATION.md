---
title: "RFC-001: Game Orchestration Architecture"
description: "Scenes, modes, triggers, and transitions for the core game orchestration layer"
status: active
implementation: 60
last_updated: 2026-03-01
area: rfc
---

# RFC-001: Game Orchestration Architecture

> **Status**: Proposed
> **Issue**: [#51](https://github.com/jbcom/strata-game-library/issues/51)
> **Epic**: [#50](https://github.com/jbcom/strata-game-library/issues/50)

## Summary

This RFC proposes the core orchestration layer for Strata, enabling games to define and manage scenes, modes, triggers, and transitions.

## Motivation

Strata provides excellent rendering primitives but no way to orchestrate them into a game. Every game needs:

1. **Scene management** - Title screen, gameplay, pause menu
2. **Mode management** - Exploration, combat, dialogue, inventory
3. **Spatial triggers** - Proximity events, collision handlers
4. **Transitions** - Fade, crossfade, wipe between scenes/modes

Currently, developers must implement these from scratch.

## Detailed Design

### SceneManager

Scenes are top-level game states with complete render trees.

```typescript
interface Scene {
  id: string;
  setup: () => Promise<void>;      // Called before scene loads
  teardown: () => Promise<void>;   // Called after scene unloads
  render: () => JSX.Element;       // Scene's 3D content
  ui?: () => JSX.Element;          // Scene's 2D overlay
}

interface SceneManagerConfig {
  initialScene: string;
  loadingComponent?: React.ComponentType<{ progress: number }>;
}

interface SceneManager {
  // Registration
  register(scene: Scene): void;
  
  // Navigation
  load(sceneId: string): Promise<void>;       // Replace current scene
  push(sceneId: string): Promise<void>;       // Stack scene (overlay)
  pop(): Promise<void>;                        // Remove top scene
  
  // State
  current: Scene;
  stack: Scene[];
  isLoading: boolean;
  loadProgress: number;
}

// Factory
function createSceneManager(config: SceneManagerConfig): SceneManager;
```

**Usage Example**:

```typescript
const scenes = createSceneManager({ initialScene: 'title' });

scenes.register({
  id: 'title',
  setup: async () => { /* Load title assets */ },
  teardown: async () => { /* Cleanup */ },
  render: () => <TitleScreen />,
  ui: () => <TitleUI />,
});

scenes.register({
  id: 'gameplay',
  setup: async () => { /* Load game world */ },
  teardown: async () => { /* Save progress */ },
  render: () => <GameWorld />,
  ui: () => <GameHUD />,
});

// In UI
<button onClick={() => scenes.load('gameplay')}>Start Game</button>
```

### ModeManager

Modes are gameplay states within a scene. Unlike scenes, modes share the same 3D world.

```typescript
type GameMode = string;  // 'exploration' | 'combat' | 'racing' | etc.

interface ModeConfig {
  id: GameMode;
  
  // Active systems in this mode
  systems: SystemFn[];
  
  // Mode-specific input mapping
  inputMap: InputMapping;
  
  // Mode-specific UI overlay (receives full instance with runtime props)
  ui?: React.ComponentType<{ instance: ModeInstance }>;
  
  // Lifecycle hooks (all receive runtime props for contextual operations)
  onEnter?: (props?: object) => void;
  onExit?: (props?: object) => void;
  onPause?: (props?: object) => void;   // When another mode is pushed on top
  onResume?: (props?: object) => void;  // When returning from a pushed mode
}

// Runtime instance of a mode, combining static config with dynamic props
interface ModeInstance {
  config: ModeConfig;           // The static mode configuration
  props: object;                // Runtime props passed during push()
  pushedAt: number;             // Timestamp when mode was activated
}

interface ModeManager {
  // Registration
  register(mode: ModeConfig): void;
  
  // Stack operations
  push(modeId: GameMode, props?: object): void;
  pop(): void;
  replace(modeId: GameMode, props?: object): void;
  
  // State (uses ModeInstance to preserve runtime props)
  current: ModeInstance;
  stack: ModeInstance[];
  
  // Access registered configs
  getConfig(modeId: GameMode): ModeConfig | undefined;
  
  // Check mode
  isActive(modeId: GameMode): boolean;
  hasMode(modeId: GameMode): boolean;
}

// Factory
function createModeManager(defaultMode: GameMode): ModeManager;
```

**Usage Example**:

```typescript
const modes = createModeManager('exploration');

modes.register({
  id: 'exploration',
  systems: [movementSystem, cameraSystem, interactionSystem],
  inputMap: explorationInputs,
  ui: ExplorationHUD,
});

modes.register({
  id: 'racing',
  systems: [racingMovementSystem, obstacleSystem, scoreSystem],
  inputMap: racingInputs,
  ui: RacingHUD,  // Receives { instance: ModeInstance } with props.waterway
  onEnter: (props) => initRace(props?.waterway),
  onExit: (props) => cleanupRace(props?.waterway),  // Now has access to props!
});

// Trigger racing mode
modes.push('racing', { waterway: 'marsh_to_forest' });

// Access current mode's runtime props
const currentWaterway = modes.current.props.waterway;
```

**UI Component with Props**:

```typescript
// RacingHUD can access runtime props via the instance
function RacingHUD({ instance }: { instance: ModeInstance }) {
  const { waterway, onComplete } = instance.props as RacingProps;
  
  return (
    <div>
      <h2>Racing: {waterway}</h2>
      <Timer onComplete={() => onComplete?.(false)} />
    </div>
  );
}
```

### TriggerSystem

Triggers are spatial event handlers implemented as ECS components.

```typescript
interface TriggerComponent {
  id: string;
  type: 'proximity' | 'collision' | 'interaction' | 'timed';
  
  // Shape (for spatial triggers)
  shape?: 'sphere' | 'box' | 'cylinder';
  radius?: number;              // For sphere/cylinder
  size?: [number, number, number];  // For box
  
  // Activation
  condition?: (entity: Entity) => boolean;  // Additional check
  action: (entity: Entity, trigger: Entity) => void;
  
  // Behavior
  cooldown?: number;   // Seconds before can trigger again
  once?: boolean;      // Only trigger once ever
  enabled?: boolean;   // Can be toggled
  
  // State
  lastTriggered?: number;
  triggerCount?: number;
}

// System
function createTriggerSystem(): SystemFn {
  return (world, delta) => {
    const triggers = world.query('trigger', 'transform');
    const triggerables = world.query('triggerable', 'transform');
    const now = performance.now() / 1000; // Current time in seconds
    
    for (const trigger of triggers) {
      const t = trigger.trigger;
      
      // Skip disabled triggers
      if (t.enabled === false) continue;
      
      // Skip triggers that have already fired (once behavior)
      if (t.once && (t.triggerCount ?? 0) > 0) continue;
      
      // Skip triggers still on cooldown
      if (t.cooldown !== undefined && t.lastTriggered !== undefined) {
        if (now - t.lastTriggered < t.cooldown) continue;
      }
      
      for (const target of triggerables) {
        if (isInRange(trigger, target) && meetsCondition(trigger, target)) {
          // Update trigger state before executing action
          t.lastTriggered = now;
          t.triggerCount = (t.triggerCount ?? 0) + 1;
          
          executeTrigger(trigger, target);
          
          // Break after first target if once behavior (already triggered)
          if (t.once) break;
        }
      }
    }
  };
}
```

**Usage Example**:

```typescript
// River crossing trigger - props are preserved in ModeInstance
world.add({
  transform: { position: new Vector3(25, 0, 0) },
  trigger: {
    id: 'river_crossing_marsh_forest',
    type: 'proximity',
    shape: 'cylinder',
    radius: 5,
    condition: (player) => {
      const gameState = useGameStore.getState();
      return !gameState.unlockedWaterways.includes('marsh_to_forest');
    },
    action: (player) => {
      // Props are stored in ModeInstance, accessible to UI and lifecycle hooks
      modeManager.push('racing', { 
        waterway: 'marsh_to_forest',
        difficulty: 'normal',
        onComplete: (success: boolean) => {
          if (success) {
            useGameStore.getState().unlockWaterway('marsh_to_forest');
          }
        }
      });
    },
    once: true,  // Only triggers first time
  },
});
```

### TransitionSystem

Transitions provide visual effects between scenes and modes.

```typescript
type TransitionType = 'fade' | 'crossfade' | 'wipe' | 'iris' | 'dissolve' | 'none';

interface TransitionConfig {
  type: TransitionType;
  duration: number;              // Seconds
  easing?: (t: number) => number;
  
  // Type-specific options
  color?: string;                // For fade
  direction?: 'left' | 'right' | 'up' | 'down';  // For wipe
  center?: [number, number];     // For iris
}

interface TransitionManager {
  // Execute transition
  start(config: TransitionConfig): Promise<void>;
  
  // Control
  cancel(): void;
  
  // State
  isTransitioning: boolean;
  progress: number;
}

function createTransitionManager(): TransitionManager;
```

**Integration with SceneManager**:

```typescript
// Scene load with transition
async function loadWithTransition(sceneId: string) {
  await transitions.start({ type: 'fade', duration: 0.5, color: 'black' }); // Fade out
  await scenes.load(sceneId);
  await transitions.start({ type: 'fade', duration: 0.5, color: 'black', reverse: true }); // Fade in
}
```

## Integration

### With Existing ECS

```typescript
// Triggers are components
world.add({
  transform: { ... },
  trigger: { ... },
});

// TriggerSystem runs in frame loop
useFrame((_, delta) => {
  triggerSystem(world, delta);
});
```

### With State Management

```typescript
// Modes affect game state - access config via instance
const modeManager = createModeManager('exploration');
useGameStore.setState({ currentMode: modeManager.current.config.id });

modeManager.on('modeChange', (instance: ModeInstance) => {
  useGameStore.setState({ 
    currentMode: instance.config.id,
    modeProps: instance.props,  // Runtime props now accessible!
  });
});
```

### With Input

```typescript
// Each mode has its own input map
// keyboard: string[] of key identifiers; gamepad: logical control name
const explorationInputs: InputMapping = {
  'move': { keyboard: ['W', 'A', 'S', 'D'], gamepad: 'leftStick' },
  'interact': { keyboard: ['E'], gamepad: 'A' },
};

const racingInputs: InputMapping = {
  'steer': { keyboard: ['A', 'D'], gamepad: 'leftStick', tilt: true },
  'boost': { keyboard: ['Space'], gamepad: 'B' },
};
```

## Alternatives Considered

### 1. React Router Pattern

Treat scenes as routes with URL-based navigation.

**Rejected**: Doesn't handle mode stacking well; games aren't document-based.

### 2. Bevy-like State Machine

Use a formal state machine for all game states.

**Rejected**: Too rigid for overlapping modes; poor React integration.

### 3. External Framework

Use Phaser or similar for orchestration.

**Rejected**: Would require abandoning R3F paradigm; too heavy.

## Open Questions

1. **Scene vs Mode boundary**: When should something be a scene vs. a mode? Current proposal: Scenes have separate 3D worlds; modes share a world.

2. **Async triggers**: Should trigger actions be async? What happens if a trigger starts a mode transition?

3. **Trigger vs System**: Should triggers be a special component type or a generic system pattern?

## Implementation Plan

1. **Week 1**: SceneManager implementation and tests
2. **Week 1**: ModeManager implementation and tests
3. **Week 2**: TriggerSystem implementation and tests
4. **Week 2**: TransitionSystem implementation and tests
5. **Week 3**: Integration tests and examples

---

*Parent: [RFC Index](../README.md)*
