import type { AutoSaveConfig, StoreConfig } from '../core/state';
import type { DeepPartial, GameDefinition, StatePreset } from './types';

export type BuiltInStatePreset = Exclude<StatePreset, 'custom'>;

export interface RPGInventoryItem {
  id: string;
  quantity: number;
  equipped?: boolean;
  metadata?: Record<string, unknown>;
}

export interface RPGQuestProgress {
  id: string;
  status: 'available' | 'active' | 'completed' | 'failed';
  progress: number;
  completedObjectives: string[];
}

export interface RPGNpcState {
  disposition?: number;
  dialogueState?: string;
  flags?: Record<string, boolean | number | string>;
}

export interface RPGState {
  player: {
    name: string;
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    stats: Record<string, number>;
  };
  inventory: RPGInventoryItem[];
  equipment: Record<string, string | null>;
  quests: RPGQuestProgress[];
  achievements: string[];
  currentRegion: string;
  discoveredRegions: string[];
  unlockedConnections: string[];
  npcs: Record<string, RPGNpcState>;
  flags: Record<string, boolean | number | string>;
  playtime: number;
}

export interface ActionState {
  player: {
    health: number;
    maxHealth: number;
    lives: number;
    score: number;
  };
  level: number;
  checkpoints: string[];
  collectibles: string[];
  flags: Record<string, boolean | number | string>;
  playtime: number;
}

export interface PuzzleState {
  currentLevel: number;
  completedLevels: number[];
  moves: number;
  hints: number;
  stars: number;
  solvedPuzzles: string[];
  flags: Record<string, boolean | number | string>;
  playtime: number;
}

export interface SandboxVector3 {
  x: number;
  y: number;
  z: number;
}

export interface SandboxState {
  worldName: string;
  worldSeed: number;
  playerPosition: SandboxVector3;
  playerRotation: SandboxVector3;
  inventory: RPGInventoryItem[];
  structures: Array<Record<string, unknown>>;
  entities: Array<Record<string, unknown>>;
  discoveredRegions: string[];
  flags: Record<string, boolean | number | string>;
  timeOfDay: number;
  weather: 'clear' | 'rain' | 'storm' | 'snow' | 'fog';
  playtime: number;
}

export interface RacingState {
  racer: {
    health: number;
    maxHealth: number;
    boost: number;
    maxBoost: number;
  };
  currentTrack: string;
  lap: number;
  totalLaps: number;
  checkpointIndex: number;
  position: number;
  raceTime: number;
  bestLapTime: number | null;
  unlockedTracks: string[];
  flags: Record<string, boolean | number | string>;
}

export interface StatePresetMap {
  rpg: RPGState;
  action: ActionState;
  puzzle: PuzzleState;
  sandbox: SandboxState;
  racing: RacingState;
  custom: Record<string, unknown>;
}

export type StateForPreset<TPreset extends StatePreset> = StatePresetMap[TPreset];

export interface StatePresetDefinition<
  TState extends object,
  TPreset extends BuiltInStatePreset = BuiltInStatePreset,
> {
  name: TPreset;
  description: string;
  create: (overrides?: DeepPartial<TState>) => TState;
  store: Pick<StoreConfig<TState>, 'enablePersistence' | 'maxUndoHistory' | 'storagePrefix'>;
  autoSave: Partial<AutoSaveConfig>;
}

export type StatePresetDefinitions = {
  [K in BuiltInStatePreset]: StatePresetDefinition<StatePresetMap[K], K>;
};

export type PresetGameDefinition<TPreset extends BuiltInStatePreset> = Omit<
  GameDefinition<StateForPreset<TPreset>>,
  'statePreset' | 'initialState'
> & {
  statePreset: TPreset;
  initialState?: DeepPartial<StateForPreset<TPreset>>;
};

function cloneValue<T>(value: T): T {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mergeValue(base: unknown, override: unknown): unknown {
  if (override === undefined) {
    return cloneValue(base);
  }

  if (Array.isArray(override)) {
    return cloneValue(override);
  }

  if (isPlainObject(base) && isPlainObject(override)) {
    const merged: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(base), ...Object.keys(override)]);

    for (const key of keys) {
      merged[key] = mergeValue(base[key], override[key]);
    }

    return merged;
  }

  return cloneValue(override);
}

export function mergeState<T extends object>(base: T, overrides?: DeepPartial<T>): T {
  return mergeValue(base, overrides) as T;
}

export const DEFAULT_RPG_STATE: RPGState = {
  player: {
    name: 'Player',
    level: 1,
    experience: 0,
    health: 100,
    maxHealth: 100,
    mana: 50,
    maxMana: 50,
    stats: {
      strength: 10,
      dexterity: 10,
      intelligence: 10,
      wisdom: 10,
      constitution: 10,
      charisma: 10,
    },
  },
  inventory: [],
  equipment: {
    head: null,
    body: null,
    hands: null,
    feet: null,
    weapon: null,
    offhand: null,
  },
  quests: [],
  achievements: [],
  currentRegion: 'start',
  discoveredRegions: ['start'],
  unlockedConnections: [],
  npcs: {},
  flags: {},
  playtime: 0,
};

export const DEFAULT_ACTION_STATE: ActionState = {
  player: {
    health: 100,
    maxHealth: 100,
    lives: 3,
    score: 0,
  },
  level: 1,
  checkpoints: [],
  collectibles: [],
  flags: {},
  playtime: 0,
};

export const DEFAULT_PUZZLE_STATE: PuzzleState = {
  currentLevel: 1,
  completedLevels: [],
  moves: 0,
  hints: 3,
  stars: 0,
  solvedPuzzles: [],
  flags: {},
  playtime: 0,
};

export const DEFAULT_SANDBOX_STATE: SandboxState = {
  worldName: 'New World',
  worldSeed: 0,
  playerPosition: { x: 0, y: 1, z: 0 },
  playerRotation: { x: 0, y: 0, z: 0 },
  inventory: [],
  structures: [],
  entities: [],
  discoveredRegions: [],
  flags: {},
  timeOfDay: 0.25,
  weather: 'clear',
  playtime: 0,
};

export const DEFAULT_RACING_STATE: RacingState = {
  racer: {
    health: 100,
    maxHealth: 100,
    boost: 100,
    maxBoost: 100,
  },
  currentTrack: 'track_1',
  lap: 1,
  totalLaps: 3,
  checkpointIndex: 0,
  position: 1,
  raceTime: 0,
  bestLapTime: null,
  unlockedTracks: ['track_1'],
  flags: {},
};

export function createRPGState(overrides?: DeepPartial<RPGState>): RPGState {
  return mergeState<RPGState>(DEFAULT_RPG_STATE, overrides);
}

export function createActionState(overrides?: DeepPartial<ActionState>): ActionState {
  return mergeState<ActionState>(DEFAULT_ACTION_STATE, overrides);
}

export function createPuzzleState(overrides?: DeepPartial<PuzzleState>): PuzzleState {
  return mergeState<PuzzleState>(DEFAULT_PUZZLE_STATE, overrides);
}

export function createSandboxState(overrides?: DeepPartial<SandboxState>): SandboxState {
  const worldSeed =
    overrides?.worldSeed === undefined ? Date.now() : (overrides.worldSeed as number);

  return mergeState<SandboxState>(DEFAULT_SANDBOX_STATE, {
    worldSeed,
    ...overrides,
  });
}

export function createRacingState(overrides?: DeepPartial<RacingState>): RacingState {
  return mergeState<RacingState>(DEFAULT_RACING_STATE, overrides);
}

export const STATE_PRESETS: StatePresetDefinitions = {
  action: {
    name: 'action',
    description: 'Fast-paced action state with health, lives, score, and checkpoints.',
    create: createActionState,
    store: {
      enablePersistence: true,
      maxUndoHistory: 50,
      storagePrefix: 'strata_action',
    },
    autoSave: {
      enabled: true,
      intervalMs: 60000,
      maxSlots: 3,
      saveOnChange: false,
      debounceMs: 3000,
      storageKey: 'strata_action_autosave',
    },
  },
  puzzle: {
    name: 'puzzle',
    description: 'Puzzle progression state with level, moves, hints, and completion tracking.',
    create: createPuzzleState,
    store: {
      enablePersistence: true,
      maxUndoHistory: 200,
      storagePrefix: 'strata_puzzle',
    },
    autoSave: {
      enabled: true,
      intervalMs: 15000,
      maxSlots: 1,
      saveOnChange: true,
      debounceMs: 1000,
      storageKey: 'strata_puzzle_autosave',
    },
  },
  racing: {
    name: 'racing',
    description: 'Racing state with lap tracking, checkpoint progress, and boost resources.',
    create: createRacingState,
    store: {
      enablePersistence: true,
      maxUndoHistory: 25,
      storagePrefix: 'strata_racing',
    },
    autoSave: {
      enabled: true,
      intervalMs: 10000,
      maxSlots: 3,
      saveOnChange: true,
      debounceMs: 500,
      storageKey: 'strata_racing_autosave',
    },
  },
  rpg: {
    name: 'rpg',
    description:
      'Role-playing game state with player stats, inventory, quests, region discovery, and flags.',
    create: createRPGState,
    store: {
      enablePersistence: true,
      maxUndoHistory: 100,
      storagePrefix: 'strata_rpg',
    },
    autoSave: {
      enabled: true,
      intervalMs: 120000,
      maxSlots: 3,
      saveOnChange: false,
      debounceMs: 5000,
      storageKey: 'strata_rpg_autosave',
    },
  },
  sandbox: {
    name: 'sandbox',
    description:
      'Open-ended sandbox state with world seed, player transform, constructed content, and weather.',
    create: createSandboxState,
    store: {
      enablePersistence: true,
      maxUndoHistory: 30,
      storagePrefix: 'strata_sandbox',
    },
    autoSave: {
      enabled: true,
      intervalMs: 300000,
      maxSlots: 5,
      saveOnChange: false,
      debounceMs: 10000,
      storageKey: 'strata_sandbox_autosave',
    },
  },
};

export function isBuiltInStatePreset(statePreset: StatePreset): statePreset is BuiltInStatePreset {
  return statePreset !== 'custom';
}

export function getStatePresetDefinition<TPreset extends BuiltInStatePreset>(
  statePreset: TPreset
): StatePresetDefinition<StateForPreset<TPreset>, TPreset> {
  return STATE_PRESETS[statePreset];
}

export function createStateFromPreset<TPreset extends BuiltInStatePreset>(
  statePreset: TPreset,
  overrides?: DeepPartial<StateForPreset<TPreset>>
): StateForPreset<TPreset> {
  return getStatePresetDefinition(statePreset).create(overrides);
}
