# RFC-004: Declarative Game Definition

> **Status**: Proposed
> **Issue**: [#54](https://github.com/jbcom/strata-game-library/issues/54)
> **Epic**: [#50](https://github.com/jbcom/strata-game-library/issues/50)

## Summary

This RFC proposes a top-level `createGame()` API that enables developers to define entire games declaratively, achieving the goal of 10x code reduction.

## Vision

A complete game like Rivermarsh should be defined in **<1000 lines of game-specific code**:

```typescript
import { createGame, StrataGame } from '@jbcom/strata/game';

const rivermarsh = createGame({
  name: 'Rivermarsh',
  version: '1.0.0',
  
  content: { creatures, props, materials, items },
  world: rivermarshWorld,
  
  scenes: { title, gameplay, credits },
  initialScene: 'title',
  
  modes: { exploration, racing, combat, dialogue },
  defaultMode: 'exploration',
  
  statePreset: 'rpg',
  initialState: createRPGState({ currentRegion: 'marsh' }),
  controls: { desktop, mobile, gamepad },
});

function App() {
  return <StrataGame game={rivermarsh} />;
}
```

## Goals

### 1. Massive Code Reduction
| Component | Manual Implementation | Declarative |
|-----------|----------------------|-------------|
| ECS Setup | 200+ lines | 0 lines |
| State Management | 300+ lines | 10 lines |
| Input Handling | 200+ lines | 20 lines |
| Scene Management | 400+ lines | 50 lines |
| Mode System | 300+ lines | 30 lines |
| Save/Load | 200+ lines | 0 lines |
| **Total** | **1600+ lines** | **110 lines** |

### 2. Configuration Over Implementation
Everything is data, not code:
- Creatures are JSON-serializable definitions
- Props are compositions of shapes and materials
- Scenes are top-level game states with render trees (see RFC-001)
- Modes are configuration objects with hooks
- World structure is a graph definition

### 3. Hot Reloading
Change a definition, see it update:
- Creature colors update in real-time
- Region boundaries adjust instantly
- Scene and mode transitions work immediately

### 4. Type Safety
Full TypeScript support:
- Autocomplete for all configuration
- Compile-time validation
- Discriminated unions for type narrowing

## Detailed Design

### GameDefinition Interface

```typescript
interface GameDefinition {
  // === METADATA ===
  name: string;
  version: string;
  description?: string;
  
  // === CONTENT REGISTRIES ===
  content: {
    // Compositional objects
    materials: MaterialDefinition[];
    skeletons?: SkeletonDefinition[];
    creatures: CreatureDefinition[];
    props: PropDefinition[];
    
    // Game content
    items: ItemDefinition[];
    quests?: QuestDefinition[];
    dialogues?: DialogueDefinition[];
    recipes?: RecipeDefinition[];
    achievements?: AchievementDefinition[];
  };
  
  // === WORLD ===
  world: WorldGraphDefinition | WorldGraph;
  
  // === SCENES (Layer 1 Orchestration - see RFC-001) ===
  scenes: Record<string, SceneDefinition>;
  initialScene: string;
  
  // === MODES ===
  modes: Record<string, ModeDefinition>;
  defaultMode: string;
  
  // === STATE ===
  statePreset: StatePreset;  // 'rpg' | 'action' | 'puzzle' | 'sandbox'
  initialState?: Partial<GameState>;
  
  // === CONTROLS ===
  controls: {
    desktop?: InputMapping;
    mobile?: InputMapping;
    gamepad?: InputMapping;
  };
  
  // === UI ===
  ui?: {
    hud?: React.ComponentType;
    menus?: Record<string, React.ComponentType>;
    theme?: UITheme;
    fonts?: FontDefinition[];
  };
  
  // === AUDIO ===
  audio?: {
    music?: MusicDefinition[];
    ambient?: AmbientDefinition[];
    sfx?: SFXDefinition[];
    footsteps?: FootstepDefinition;
  };
  
  // === GRAPHICS ===
  graphics?: {
    quality?: QualityPreset;
    postProcessing?: PostProcessingConfig;
    sky?: SkyConfig;
    weather?: WeatherConfig;
  };
  
  // === HOOKS ===
  hooks?: {
    onStart?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onSave?: (state: GameState) => void;
    onLoad?: (state: GameState) => void;
  };
}

// Scene definition for declarative registration (matches RFC-001 Scene interface)
interface SceneDefinition {
  id: string;
  setup?: () => Promise<void>;      // Called before scene loads
  teardown?: () => Promise<void>;   // Called after scene unloads
  render: () => JSX.Element;        // Scene's 3D content
  ui?: () => JSX.Element;           // Scene's 2D overlay
}
```

### State Presets

```typescript
type StatePreset = 'rpg' | 'action' | 'puzzle' | 'sandbox' | 'racing' | 'custom';

// RPG preset includes:
interface RPGState {
  player: {
    name: string;
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    mana?: number;
    maxMana?: number;
    stats: Record<string, number>;
  };
  inventory: InventorySlot[];
  equipment: Record<EquipmentSlot, ItemInstance | null>;
  quests: QuestProgress[];
  achievements: string[];
  discoveredRegions: string[];
  unlockedConnections: string[];
  npcs: Record<string, NPCState>;
  flags: Record<string, boolean | number | string>;
  playtime: number;
}

// Action preset:
interface ActionState {
  player: {
    health: number;
    maxHealth: number;
    lives: number;
    score: number;
  };
  level: number;
  checkpoints: Vector3[];
  collectibles: string[];
}

// Create initial state from preset
function createRPGState(overrides?: Partial<RPGState>): RPGState;
function createActionState(overrides?: Partial<ActionState>): ActionState;
```

### Mode Definition

```typescript
interface ModeDefinition {
  id: string;
  
  // Systems active in this mode
  systems: SystemFn[];
  
  // Input mapping for this mode
  inputMap: InputMapping;
  
  // UI overlay (receives full instance with runtime props)
  ui?: React.ComponentType<{ instance: ModeInstance }>;
  
  // Camera configuration
  camera?: CameraConfig;
  
  // Physics configuration
  physics?: PhysicsConfig;
  
  // Lifecycle (all hooks receive context with props for consistency)
  setup?: (context: ModeContext) => Promise<void>;
  teardown?: (context: ModeContext) => Promise<void>;
  onEnter?: (context: ModeContext) => void;
  onExit?: (context: ModeContext) => void;
  onPause?: (context: ModeContext) => void;
  onResume?: (context: ModeContext) => void;
}

// Runtime instance of a mode, combining static definition with dynamic props
interface ModeInstance {
  config: ModeDefinition;       // The static mode definition
  props: object;                // Runtime props passed during push()
  pushedAt: number;             // Timestamp when mode was activated
}

interface ModeContext {
  game: Game;                   // Full game instance
  world: World;                 // ECS world (shorthand for game.world)
  modeManager: ModeManager;
  sceneManager: SceneManager;
  instance: ModeInstance;       // Full instance with props (always available)
}
```

### Game Interface

```typescript
interface Game {
  // Configuration
  definition: GameDefinition;
  
  // Content registries
  registries: {
    materials: Registry<MaterialDefinition>;
    creatures: Registry<CreatureDefinition>;
    props: Registry<PropDefinition>;
    items: Registry<ItemDefinition>;
  };
  
  // World
  worldGraph: WorldGraph;
  world: World;  // ECS world for entity management (required)
  
  // State
  store: GameStore;
  
  // Managers
  sceneManager: SceneManager;
  modeManager: ModeManager;
  inputManager: InputManager;
  audioManager: AudioManager;
  
  // Lifecycle methods
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}
```

### createGame Function

```typescript
function createGame(definition: GameDefinition): Game {
  // 1. Validate definition
  const errors = validateGameDefinition(definition);
  if (errors.length > 0) {
    throw new GameDefinitionError(errors);
  }
  
  // 2. Create content registries
  const registries = {
    materials: createRegistry(definition.content.materials),
    creatures: createRegistry(definition.content.creatures),
    props: createRegistry(definition.content.props),
    items: createRegistry(definition.content.items),
  };
  
  // 3. Create world graph
  const worldGraph = isWorldGraph(definition.world) 
    ? definition.world 
    : createWorldGraph(definition.world);
  
  // 4. Create ECS world for entity management
  const world = createWorld<GameEntity>();
  
  // 5. Create state store
  const store = createGameStore(definition.statePreset, {
    initialState: definition.initialState,
    persist: true,
  });
  
  // 6. Create managers
  const sceneManager = createSceneManager({ initialScene: definition.initialScene });
  const modeManager = createModeManager(definition.defaultMode);
  const inputManager = createInputManager(definition.controls);
  const audioManager = createAudioManager(definition.audio);
  
  // 7. Register scenes (Layer 1 orchestration - see RFC-001)
  for (const [id, scene] of Object.entries(definition.scenes)) {
    sceneManager.register({ ...scene, id });
  }
  
  // 8. Register modes
  for (const [id, mode] of Object.entries(definition.modes)) {
    modeManager.register({ ...mode, id });
  }
  
  // 9. Create game instance
  // Store in variable first so lifecycle methods can reference it
  const game: Game = {
    definition,
    registries,
    worldGraph,
    world,  // ECS world for entity management
    store,
    sceneManager,
    modeManager,
    inputManager,
    audioManager,
    
    // Lifecycle
    start: async () => {
      definition.hooks?.onStart?.();
      await modeManager.push(definition.defaultMode);
    },
    pause: () => {
      definition.hooks?.onPause?.();
      // Access config via instance, pass props to lifecycle hook
      const current = modeManager.current;
      current?.config.onPause?.({ 
        game, world, modeManager, sceneManager, instance: current 
      });
    },
    resume: () => {
      definition.hooks?.onResume?.();
      // Props are preserved in instance, available on resume
      const current = modeManager.current;
      current?.config.onResume?.({ 
        game, world, modeManager, sceneManager, instance: current 
      });
    },
    stop: () => {
      world.clear();
    },
  };
  
  return game;
}
```

### StrataGame Component

```tsx
interface StrataGameProps {
  game: Game;
  loading?: React.ReactNode;
  error?: React.ComponentType<{ error: Error }>;
  children?: React.ReactNode;
}

function StrataGame({ game, loading, error: ErrorComponent, children }: StrataGameProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [gameError, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    game.start()
      .then(() => setStatus('ready'))
      .catch((e) => { setError(e); setStatus('error'); });
  }, [game]);
  
  if (status === 'loading') return loading ?? <DefaultLoading />;
  if (status === 'error') return ErrorComponent ? <ErrorComponent error={gameError!} /> : null;
  
  return (
    <Canvas>
      <GameProvider game={game}>
        {/* Graphics setup */}
        <GraphicsSetup config={game.definition.graphics} />
        
        {/* World rendering */}
        <WorldRenderer worldGraph={game.worldGraph} />
        
        {/* Entity rendering */}
        <EntityRenderer world={game.world} registries={game.registries} />
        
        {/* Current mode */}
        <ModeRenderer modeManager={game.modeManager} />
        
        {/* Audio */}
        <AudioProvider manager={game.audioManager} />
        
        {/* Game systems */}
        <GameSystems game={game} />
        
        {/* Custom content */}
        {children}
      </GameProvider>
      
      {/* 2D UI overlay */}
      <Html fullscreen>
        <UIProvider theme={game.definition.ui?.theme}>
          {game.definition.ui?.hud && <game.definition.ui.hud />}
          <ModeUI modeManager={game.modeManager} />
        </UIProvider>
      </Html>
    </Canvas>
  );
}
```

## Complete Example: Rivermarsh

```typescript
// rivermarsh/game.ts
import { createGame } from '@jbcom/strata/game';
import { creatures } from './creatures';
import { props } from './props';
import { materials } from './materials';
import { items } from './items';
import { world } from './world';
import { scenes } from './scenes';
import { modes } from './modes';
import { controls } from './controls';

export const rivermarsh = createGame({
  name: 'Rivermarsh',
  version: '1.0.0',
  description: 'An exploration game in a procedural wetland world',
  
  content: {
    materials,
    creatures,
    props,
    items,
  },
  
  world,
  
  // Scenes (Layer 1 orchestration - see RFC-001)
  scenes: {
    title: scenes.title,
    gameplay: scenes.gameplay,
    credits: scenes.credits,
  },
  initialScene: 'title',
  
  modes: {
    exploration: modes.exploration,
    racing: modes.racing,
    combat: modes.combat,
    dialogue: modes.dialogue,
    inventory: modes.inventory,
  },
  defaultMode: 'exploration',
  
  statePreset: 'rpg',
  initialState: {
    player: {
      name: 'River Wanderer',
      level: 1,
      health: 100,
      maxHealth: 100,
    },
    currentRegion: 'marsh',
  },
  
  controls,
  
  ui: {
    hud: RivermarshHUD,
    theme: marshTheme,
  },
  
  audio: {
    music: [
      { id: 'marsh_day', file: 'music/marsh_ambient.ogg', region: 'marsh', time: 'day' },
      { id: 'forest_day', file: 'music/forest_ambient.ogg', region: 'forest', time: 'day' },
    ],
    ambient: [
      { id: 'water_flow', file: 'ambient/water.ogg', regions: ['marsh', 'river'] },
    ],
  },
  
  graphics: {
    quality: 'auto',
    sky: { type: 'procedural', sunPosition: 'dynamic' },
    weather: { enabled: true, types: ['clear', 'rain', 'fog'] },
  },
});

// rivermarsh/App.tsx
function App() {
  return (
    <StrataGame 
      game={rivermarsh}
      loading={<LoadingScreen />}
    />
  );
}
```

### Scene Definitions

```typescript
// rivermarsh/scenes/index.ts
import { SceneDefinition } from '@jbcom/strata/game';

export const title: SceneDefinition = {
  id: 'title',
  setup: async () => {
    // Load title screen assets
    await loadAssets(['title_bg', 'logo']);
  },
  teardown: async () => {
    // Cleanup title assets
  },
  render: () => <TitleBackground />,
  ui: () => <TitleMenu onStart={() => sceneManager.load('gameplay')} />,
};

export const gameplay: SceneDefinition = {
  id: 'gameplay',
  setup: async () => {
    // Load world, creatures, props
    await loadWorld();
  },
  teardown: async () => {
    // Save progress before leaving
    await saveProgress();
  },
  render: () => <GameWorld />,
  ui: () => <GameHUD />,
};

export const credits: SceneDefinition = {
  id: 'credits',
  render: () => <CreditsBackground />,
  ui: () => <CreditsScroll onComplete={() => sceneManager.load('title')} />,
};

export const scenes = { title, gameplay, credits };
```

### Mode Definitions

```typescript
// rivermarsh/modes/exploration.ts
export const exploration: ModeDefinition = {
  id: 'exploration',
  
  systems: [
    movementSystem,
    cameraFollowSystem,
    interactionSystem,
    regionSystem,
    connectionSystem,
    spawnSystem,
    aiSystem,
  ],
  
  inputMap: {
    move: { keyboard: 'WASD', gamepad: 'leftStick', touch: 'leftJoystick' },
    camera: { keyboard: 'mouse', gamepad: 'rightStick', touch: 'rightJoystick' },
    interact: { keyboard: 'E', gamepad: 'A', touch: 'interactButton' },
    inventory: { keyboard: 'I', gamepad: 'Y', touch: 'inventoryButton' },
    pause: { keyboard: 'Escape', gamepad: 'Start' },
  },
  
  camera: {
    type: 'follow',
    distance: 10,
    height: 5,
    smoothing: 0.1,
  },
  
  ui: ExplorationHUD,
};

// Example: UI component accessing runtime props via ModeInstance
interface RacingProps {
  waterway: string;
  difficulty: 'easy' | 'normal' | 'hard';
  onComplete?: (success: boolean) => void;
}

function RacingHUD({ instance }: { instance: ModeInstance }) {
  // Type-safe access to runtime props passed during modeManager.push()
  const { waterway, difficulty } = instance.props as RacingProps;
  
  return (
    <div className="racing-hud">
      <h2>Racing: {waterway}</h2>
      <span className="difficulty">{difficulty}</span>
      <Timer />
      <SpeedMeter />
    </div>
  );
}

// rivermarsh/modes/racing.ts
export const racing: ModeDefinition = {
  id: 'racing',
  
  systems: [
    racingMovementSystem,
    obstacleSystem,
    collectibleSystem,
    scoreSystem,
  ],
  
  inputMap: {
    steer: { keyboard: 'AD', gamepad: 'leftStick', tilt: true },
    boost: { keyboard: 'Space', gamepad: 'B' },
  },
  
  camera: {
    type: 'chase',
    distance: 15,
    height: 8,
  },
  
  ui: RacingHUD,  // Receives { instance: ModeInstance } with props.waterway
  
  onEnter: ({ instance }) => {
    // Runtime props accessible via instance.props
    const { waterway } = instance.props as RacingProps;
    initializeRace(waterway);
  },
  
  onExit: ({ instance, game }) => {
    // Props still available in onExit - fixes the architectural flaw!
    const { onComplete } = instance.props as RacingProps;
    if (onComplete) {
      onComplete(game.store.getState().racing.success);
    }
  },
  
  onResume: ({ instance }) => {
    // Props available when returning from pause menu overlay
    const { waterway } = instance.props as RacingProps;
    resumeRace(waterway);
  },
};
```

## Migration Path

### Phase 1: Opt-in (Current games work)
Existing games can use createGame() alongside manual code:

```tsx
<Canvas>
  <StrataGame game={game}>
    {/* Legacy components still work */}
    <MyLegacyComponent />
  </StrataGame>
</Canvas>
```

### Phase 2: Gradual Adoption
Move features incrementally to declarative:
1. Move creatures to creature registry
2. Move props to prop registry
3. Move mode logic to mode definitions
4. Move world structure to WorldGraph

### Phase 3: Full Declaration
Remove all manual implementation, game is pure configuration.

## Success Metrics

| Metric | Threshold |
|--------|-----------|
| Lines of code (Rivermarsh) | <1000 |
| Time to new game prototype | <1 hour |
| API documentation coverage | 100% |
| TypeScript coverage | 100% |
| Hot reload working | Yes |
| Mobile performance | 60fps |

---

*Parent: [RFC Index](../README.md)*
