import { createGameStore, createInputManager, createSoundManager, createWorld } from '../core';
import { createModeManager } from '../game/ModeManager';
import { createRegistry } from '../game/Registry';
import { createSceneManager } from '../game/SceneManager';
import {
  type BuiltInStatePreset,
  createStateFromPreset,
  getStatePresetDefinition,
  isBuiltInStatePreset,
  type PresetGameDefinition,
  type StateForPreset,
} from '../game/state-presets';
import { createTransitionManager } from '../game/TransitionManager';
import type {
  Game,
  GameDefinition,
  GameSnapshot,
  GameTransitionOptions,
  GameTransitionsDefinition,
  ModeCallbackContext,
  ModeDefinition,
  ModeInstance,
  SceneCallbackContext,
  SceneDefinition,
} from '../game/types';
import { createWorldGraph, isWorldGraph } from '../game/WorldGraph';
import type { WorldGraphDefinition as WorldGraphDef } from '../world/types';

export {
  type ActionState,
  type BuiltInStatePreset,
  createActionState,
  createPuzzleState,
  createRacingState,
  createRPGState,
  createSandboxState,
  createStateFromPreset,
  getStatePresetDefinition,
  isBuiltInStatePreset,
  type PresetGameDefinition,
  type PuzzleState,
  type RacingState,
  type RPGState,
  type SandboxState,
  STATE_PRESETS,
  type StateForPreset,
  type StatePresetDefinition,
} from '../game/state-presets';

function assertRecordHasEntries(kind: 'mode' | 'scene', record: Record<string, unknown>) {
  if (Object.keys(record).length === 0) {
    throw new Error(`Game definition requires at least one ${kind}`);
  }
}

function assertRecordHasKey(kind: 'mode' | 'scene', key: string, record: Record<string, unknown>) {
  if (!(key in record)) {
    throw new Error(`Unknown ${kind} "${key}" in game definition`);
  }
}

function assertUniqueIds<T extends { id: string }>(kind: string, items: T[] = []) {
  const ids = new Set<string>();

  for (const item of items) {
    if (ids.has(item.id)) {
      throw new Error(`Duplicate ${kind} id "${item.id}" in game definition`);
    }

    ids.add(item.id);
  }
}

function validateGameDefinition<TState extends object>(definition: GameDefinition<TState>) {
  assertRecordHasEntries('scene', definition.scenes);
  assertRecordHasEntries('mode', definition.modes);
  assertRecordHasKey('scene', definition.initialScene, definition.scenes);
  assertRecordHasKey('mode', definition.defaultMode, definition.modes);

  assertUniqueIds('material', definition.content.materials);
  assertUniqueIds('creature', definition.content.creatures);
  assertUniqueIds('prop', definition.content.props);
  assertUniqueIds('item', definition.content.items);
  assertUniqueIds('quest', definition.content.quests);
  assertUniqueIds('dialogue', definition.content.dialogues);
  assertUniqueIds('recipe', definition.content.recipes);
  assertUniqueIds('achievement', definition.content.achievements);
}

function normalizeStoragePrefix(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolveInitialState<TState extends object>(definition: GameDefinition<TState>): TState {
  if (!isBuiltInStatePreset(definition.statePreset)) {
    return JSON.parse(JSON.stringify(definition.initialState ?? {})) as TState;
  }

  return createStateFromPreset(
    definition.statePreset,
    definition.initialState as never
  ) as unknown as TState;
}

function resolveStoreConfig<TState extends object>(definition: GameDefinition<TState>) {
  if (!isBuiltInStatePreset(definition.statePreset)) {
    return {
      enablePersistence: true,
      name: definition.name,
      storagePrefix: normalizeStoragePrefix(definition.name),
    };
  }

  const preset = getStatePresetDefinition(definition.statePreset);

  return {
    ...preset.store,
    name: definition.name,
    storagePrefix: `${preset.store.storagePrefix}_${normalizeStoragePrefix(definition.name)}`,
  };
}

function createSceneRuntimeContext<TState extends object>(
  game: Game<TState>,
  scene: SceneDefinition
): SceneCallbackContext<TState> {
  return {
    audioManager: game.audioManager,
    game,
    inputManager: game.inputManager,
    modeManager: game.modeManager,
    scene,
    sceneManager: game.sceneManager,
    store: game.store,
    world: game.world,
    worldGraph: game.worldGraph,
  };
}

function createModeRuntimeContext<TState extends object>(
  game: Game<TState>,
  mode: ModeDefinition,
  props: Record<string, unknown>,
  instanceOverride?: ModeInstance
): ModeCallbackContext<TState> {
  const currentInstance =
    game.modeManager.current?.config.id === mode.id && game.modeManager.current.props === props
      ? game.modeManager.current
      : undefined;
  const instance =
    instanceOverride ??
    currentInstance ??
    ({
      config: mode,
      props,
      pushedAt: Date.now(),
    } satisfies ModeInstance);

  return Object.assign({}, props, {
    audioManager: game.audioManager,
    game,
    inputManager: game.inputManager,
    instance,
    modeManager: game.modeManager,
    props,
    sceneManager: game.sceneManager,
    store: game.store,
    world: game.world,
    worldGraph: game.worldGraph,
  });
}

function activateModeInputMap<TState extends object>(game: Game<TState>, mode: ModeDefinition) {
  game.inputManager.setActionMap(mode.inputMap);
}

function activatePauseInputMap<TState extends object>(
  game: Game<TState>,
  mode: ModeDefinition | null | undefined
) {
  const pauseBinding = mode?.inputMap.pause;
  if (!pauseBinding) {
    game.inputManager.clearActionMap();
    return;
  }

  game.inputManager.setActionMap({
    pause: pauseBinding,
  });
}

function clearModeInputMap<TState extends object>(game: Game<TState>) {
  game.inputManager.clearActionMap();
}

function syncModeInputMap<TState extends object>(
  game: Game<TState>,
  mode: ModeDefinition | null | undefined
) {
  if (!mode) {
    clearModeInputMap(game);
    return;
  }

  if (game.isPaused) {
    activatePauseInputMap(game, mode);
    return;
  }

  activateModeInputMap(game, mode);
}

type TransitionRuntime = Pick<Game<object>, 'transitionManager'>;

function shouldRunTransition(config?: GameTransitionOptions['transition']): boolean {
  return Boolean(config && config.type !== 'none' && config.duration > 0);
}

function resolveTransitionPair(options?: GameTransitionOptions) {
  const transitionOut = options?.transitionOut ?? options?.transition;
  const transitionIn =
    options?.transitionIn ??
    (options?.transition
      ? {
          ...options.transition,
          reverse: !options.transition.reverse,
        }
      : undefined);

  return {
    transitionIn,
    transitionOut,
  };
}

function mergeTransitionOptions(
  ...options: Array<GameTransitionOptions | undefined>
): GameTransitionOptions | undefined {
  let merged: GameTransitionOptions | undefined;

  for (const option of options) {
    if (!option) {
      continue;
    }

    merged = {
      transition: option.transition ?? merged?.transition,
      transitionOut: option.transitionOut ?? merged?.transitionOut,
      transitionIn: option.transitionIn ?? merged?.transitionIn,
    };
  }

  return merged;
}

function resolveSceneTransitionOptions<TState extends object>(
  game: Game<TState>,
  operation: keyof NonNullable<GameTransitionsDefinition['scenes']>,
  scene: SceneDefinition | null | undefined,
  explicit?: GameTransitionOptions
) {
  return mergeTransitionOptions(
    game.definition.transitions?.scenes?.[operation],
    scene?.transition,
    explicit
  );
}

function resolveModeTransitionOptions<TState extends object>(
  game: Game<TState>,
  operation: keyof NonNullable<GameTransitionsDefinition['modes']>,
  mode: ModeDefinition | null | undefined,
  explicit?: GameTransitionOptions
) {
  return mergeTransitionOptions(
    game.definition.transitions?.modes?.[operation],
    mode?.transition,
    explicit
  );
}

async function runTransitionAction<T>(
  game: TransitionRuntime,
  action: () => Promise<T>,
  options?: GameTransitionOptions
): Promise<T> {
  const { transitionIn, transitionOut } = resolveTransitionPair(options);

  if (transitionOut && shouldRunTransition(transitionOut)) {
    await game.transitionManager.start(transitionOut);
  }

  const result = await action();

  if (transitionIn && shouldRunTransition(transitionIn)) {
    await game.transitionManager.start(transitionIn);
  }

  return result;
}

/**
 * Creates a new Strata game instance from a declarative definition.
 *
 * @param definition - The game definition object
 * @returns A complete Game instance
 */
export function createGame<TPreset extends BuiltInStatePreset>(
  definition: PresetGameDefinition<TPreset>
): Game<StateForPreset<TPreset>>;
export function createGame<TState extends object = object>(
  definition: GameDefinition<TState>
): Game<TState> {
  validateGameDefinition(definition);

  const sceneDefinitions = Object.fromEntries(
    Object.entries(definition.scenes).map(([id, scene]) => [
      id,
      {
        ...scene,
        id,
      } satisfies SceneDefinition,
    ])
  ) as Record<string, SceneDefinition>;

  const modeDefinitions = Object.fromEntries(
    Object.entries(definition.modes).map(([id, mode]) => [
      id,
      {
        ...mode,
        id,
      } satisfies ModeDefinition,
    ])
  ) as Record<string, ModeDefinition>;

  // 1. Create content registries
  const registries = {
    materials: createRegistry(definition.content.materials),
    creatures: createRegistry(definition.content.creatures),
    props: createRegistry(definition.content.props),
    items: createRegistry(definition.content.items),
  };

  // 2. Create world graph
  const worldGraph = isWorldGraph(definition.world)
    ? definition.world
    : createWorldGraph(definition.world as WorldGraphDef);

  // 3. Create ECS world
  const world = createWorld();

  // 4. Create state store
  const initialState = resolveInitialState(definition);
  const store = createGameStore<TState>(initialState, resolveStoreConfig(definition));

  // 5. Create managers
  const sceneManager = createSceneManager();

  const modeManager = createModeManager();
  const transitionManager = createTransitionManager();

  const inputManager = createInputManager();
  const audioManager = createSoundManager();
  inputManager.clearActionMap();
  const gameListeners = new Set<(snapshot: GameSnapshot) => void>();
  let gameSnapshot: GameSnapshot = { activeProfileId: undefined, isPaused: false };

  const emitGameSnapshot = () => {
    gameSnapshot = { ...gameSnapshot };

    for (const listener of gameListeners) {
      listener(gameSnapshot);
    }
  };

  // Create the game object early so lifecycle wrappers can capture it.
  const gameInstance = {
    definition,
    registries,
    worldGraph,
    world,
    store,
    sceneManager,
    modeManager,
    transitionManager,
    inputManager,
    audioManager,
    get isPaused() {
      return gameSnapshot.isPaused;
    },
    get activeProfileId() {
      return gameSnapshot.activeProfileId;
    },

    start: async () => {
      definition.hooks?.onStart?.();
      await gameInstance.loadScene(definition.initialScene);
      await gameInstance.pushMode(definition.defaultMode);
    },
    loadScene: async (sceneId, options?: GameTransitionOptions) => {
      await runTransitionAction(
        gameInstance,
        () => sceneManager.load(sceneId),
        resolveSceneTransitionOptions(gameInstance, 'load', sceneDefinitions[sceneId], options)
      );
    },
    pushScene: async (sceneId, options?: GameTransitionOptions) => {
      await runTransitionAction(
        gameInstance,
        () => sceneManager.push(sceneId),
        resolveSceneTransitionOptions(gameInstance, 'push', sceneDefinitions[sceneId], options)
      );
    },
    popScene: async (options?: GameTransitionOptions) => {
      await runTransitionAction(
        gameInstance,
        () => sceneManager.pop(),
        resolveSceneTransitionOptions(gameInstance, 'pop', sceneManager.current, options)
      );
    },
    pushMode: async (modeId, props = {}, options?: GameTransitionOptions) => {
      await runTransitionAction(
        gameInstance,
        () => modeManager.push(modeId, props),
        resolveModeTransitionOptions(gameInstance, 'push', modeDefinitions[modeId], options)
      );
    },
    replaceMode: async (modeId, props = {}, options?: GameTransitionOptions) => {
      await runTransitionAction(
        gameInstance,
        () => modeManager.replace(modeId, props),
        resolveModeTransitionOptions(gameInstance, 'replace', modeDefinitions[modeId], options)
      );
    },
    popMode: async (options?: GameTransitionOptions) => {
      await runTransitionAction(
        gameInstance,
        () => modeManager.pop(),
        resolveModeTransitionOptions(gameInstance, 'pop', modeManager.current?.config, options)
      );
    },
    save: async (slot?: string) => store.getState().save(slot),
    load: async (slot?: string) => store.getState().load(slot),
    deleteSave: async (slot: string) => store.getState().deleteSave(slot),
    listSaves: async () => store.getState().listSaves(),
    getSaveInfo: async (slot: string) => store.getState().getSaveInfo(slot),
    setActiveProfile: (profileId) => {
      if (gameSnapshot.activeProfileId === profileId) {
        return;
      }

      gameSnapshot = {
        ...gameSnapshot,
        activeProfileId: profileId,
      };
      emitGameSnapshot();
    },
    getSnapshot: () => gameSnapshot,
    subscribe: (listener: (snapshot: GameSnapshot) => void) => {
      gameListeners.add(listener);
      return () => {
        gameListeners.delete(listener);
      };
    },
    pause: () => {
      if (gameSnapshot.isPaused) {
        return;
      }

      gameSnapshot = {
        ...gameSnapshot,
        isPaused: true,
      };
      definition.hooks?.onPause?.();
      const current = modeManager.current;
      current?.config.onPause?.(current.props);
      emitGameSnapshot();
    },
    resume: () => {
      if (!gameSnapshot.isPaused) {
        return;
      }

      gameSnapshot = {
        ...gameSnapshot,
        isPaused: false,
      };
      definition.hooks?.onResume?.();
      const current = modeManager.current;
      current?.config.onResume?.(current.props);
      emitGameSnapshot();
    },
    stop: () => {
      transitionManager.cancel();
      gameSnapshot = {
        activeProfileId: undefined,
        isPaused: false,
      };
      inputManager.clearActionMap();
      world.clear();
      emitGameSnapshot();
    },
  } satisfies Game<TState>;

  // 6. Register scenes
  for (const [id, sceneDefinition] of Object.entries(sceneDefinitions)) {
    sceneManager.register({
      ...sceneDefinition,
      id,
      setup: async () => {
        await sceneDefinition.setup?.(
          createSceneRuntimeContext(
            gameInstance,
            sceneDefinition
          ) as unknown as SceneCallbackContext
        );
      },
      teardown: async () => {
        await sceneDefinition.teardown?.(
          createSceneRuntimeContext(
            gameInstance,
            sceneDefinition
          ) as unknown as SceneCallbackContext
        );
      },
    });
  }

  // 7. Register modes
  for (const [id, modeDefinition] of Object.entries(modeDefinitions)) {
    modeManager.register({
      ...modeDefinition,
      id,
      onEnter: (props = {}) => {
        syncModeInputMap(gameInstance, modeDefinition);
        modeDefinition.onEnter?.(createModeRuntimeContext(gameInstance, modeDefinition, props));
      },
      onExit: (props = {}) => {
        clearModeInputMap(gameInstance);
        modeDefinition.onExit?.(createModeRuntimeContext(gameInstance, modeDefinition, props));
      },
      onPause: (props = {}) => {
        activatePauseInputMap(gameInstance, modeDefinition);
        modeDefinition.onPause?.(createModeRuntimeContext(gameInstance, modeDefinition, props));
      },
      onResume: (props = {}) => {
        syncModeInputMap(gameInstance, modeDefinition);
        modeDefinition.onResume?.(createModeRuntimeContext(gameInstance, modeDefinition, props));
      },
      setup: async (props = {}) => {
        await modeDefinition.setup?.(createModeRuntimeContext(gameInstance, modeDefinition, props));
      },
      teardown: async (props = {}) => {
        await modeDefinition.teardown?.(
          createModeRuntimeContext(gameInstance, modeDefinition, props)
        );
      },
    });
  }

  return gameInstance;
}
