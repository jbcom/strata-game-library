/**
 * State Presets
 * 
 * Pre-configured state templates for common game types.
 */

import type { AutoSaveConfig } from '../core/state';

export interface RPGPlayerStats {
    level: number;
    experience: number;
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    wisdom: number;
    constitution: number;
    charisma: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    quantity: number;
    type: 'weapon' | 'armor' | 'consumable' | 'key' | 'quest' | 'misc';
    equipped?: boolean;
    metadata?: Record<string, unknown>;
}

export interface Quest {
    id: string;
    name: string;
    description: string;
    status: 'available' | 'active' | 'completed' | 'failed';
    progress: number;
    maxProgress: number;
    rewards?: {
        experience?: number;
        gold?: number;
        items?: string[];
    };
}

export interface RPGState {
    player: RPGPlayerStats;
    inventory: InventoryItem[];
    gold: number;
    quests: Quest[];
    currentLocation: string;
    visitedLocations: string[];
    gameFlags: Record<string, boolean>;
    playTime: number;
}

export const DEFAULT_RPG_STATE: RPGState = {
    player: {
        level: 1,
        experience: 0,
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 10,
        dexterity: 10,
        intelligence: 10,
        wisdom: 10,
        constitution: 10,
        charisma: 10,
    },
    inventory: [],
    gold: 0,
    quests: [],
    currentLocation: 'starting_village',
    visitedLocations: ['starting_village'],
    gameFlags: {},
    playTime: 0,
};

export interface PuzzleGameState {
    currentLevel: number;
    totalLevels: number;
    score: number;
    moves: number;
    movesLimit?: number;
    timeElapsed: number;
    timeLimit?: number;
    stars: number;
    hints: number;
    isPaused: boolean;
    levelData?: unknown;
    unlockedLevels: number[];
    achievements: string[];
}

export const DEFAULT_PUZZLE_STATE: PuzzleGameState = {
    currentLevel: 1,
    totalLevels: 50,
    score: 0,
    moves: 0,
    movesLimit: undefined,
    timeElapsed: 0,
    timeLimit: undefined,
    stars: 0,
    hints: 3,
    isPaused: false,
    levelData: undefined,
    unlockedLevels: [1],
    achievements: [],
};

export interface PlatformerState {
    lives: number;
    maxLives: number;
    coins: number;
    score: number;
    highScore: number;
    currentWorld: number;
    currentLevel: number;
    checkpointX: number;
    checkpointY: number;
    powerUps: string[];
    keys: number;
    unlockedWorlds: number[];
    collectibles: string[];
    timeAttackBest?: number;
}

export const DEFAULT_PLATFORMER_STATE: PlatformerState = {
    lives: 3,
    maxLives: 5,
    coins: 0,
    score: 0,
    highScore: 0,
    currentWorld: 1,
    currentLevel: 1,
    checkpointX: 0,
    checkpointY: 0,
    powerUps: [],
    keys: 0,
    unlockedWorlds: [1],
    collectibles: [],
    timeAttackBest: undefined,
};

export interface Vec3 {
    x: number;
    y: number;
    z: number;
}

export interface SandboxBlock {
    id: string;
    type: string;
    position: Vec3;
    rotation?: Vec3;
    metadata?: Record<string, unknown>;
}

export interface SandboxEntity {
    id: string;
    type: string;
    position: Vec3;
    rotation?: Vec3;
    velocity?: Vec3;
    health?: number;
    behavior?: string;
    metadata?: Record<string, unknown>;
}

export interface SandboxState {
    worldName: string;
    worldSeed: number;
    blocks: SandboxBlock[];
    entities: SandboxEntity[];
    playerPosition: Vec3;
    playerRotation: Vec3;
    playerInventory: InventoryItem[];
    timeOfDay: number;
    weather: 'clear' | 'rain' | 'storm' | 'snow' | 'fog';
    gameMode: 'survival' | 'creative' | 'adventure';
    difficulty: 'peaceful' | 'easy' | 'normal' | 'hard';
    modifiedChunks: string[];
}

export const DEFAULT_SANDBOX_STATE: SandboxState = {
    worldName: 'New World',
    worldSeed: Date.now(),
    blocks: [],
    entities: [],
    playerPosition: { x: 0, y: 64, z: 0 },
    playerRotation: { x: 0, y: 0, z: 0 },
    playerInventory: [],
    timeOfDay: 0,
    weather: 'clear',
    gameMode: 'survival',
    difficulty: 'normal',
    modifiedChunks: [],
};

export interface SimpleCounterState {
    count: number;
    lastUpdated: number;
}

export const DEFAULT_COUNTER_STATE: SimpleCounterState = {
    count: 0,
    lastUpdated: Date.now(),
};

export type StatePresetName = 'rpg' | 'puzzle' | 'platformer' | 'sandbox' | 'counter';

export interface StatePreset<T> {
    name: StatePresetName;
    description: string;
    initialState: T;
    autoSaveConfig: Partial<AutoSaveConfig>;
    maxUndoSize: number;
}

export const RPG_STATE_PRESET: StatePreset<RPGState> = {
    name: 'rpg',
    description: 'Role-playing game state with player stats, inventory, quests, and game flags',
    initialState: DEFAULT_RPG_STATE,
    autoSaveConfig: {
        enabled: true,
        intervalMs: 120000,
        maxSlots: 3,
        saveOnChange: false,
        debounceMs: 5000,
        storageKey: 'rpg_autosave',
    },
    maxUndoSize: 100,
};

export const PUZZLE_STATE_PRESET: StatePreset<PuzzleGameState> = {
    name: 'puzzle',
    description: 'Puzzle game state with levels, score, moves, and achievements',
    initialState: DEFAULT_PUZZLE_STATE,
    autoSaveConfig: {
        enabled: true,
        intervalMs: 60000,
        maxSlots: 1,
        saveOnChange: true,
        debounceMs: 2000,
        storageKey: 'puzzle_autosave',
    },
    maxUndoSize: 200,
};

export const PLATFORMER_STATE_PRESET: StatePreset<PlatformerState> = {
    name: 'platformer',
    description: 'Platformer game state with lives, coins, levels, and power-ups',
    initialState: DEFAULT_PLATFORMER_STATE,
    autoSaveConfig: {
        enabled: true,
        intervalMs: 30000,
        maxSlots: 3,
        saveOnChange: false,
        debounceMs: 3000,
        storageKey: 'platformer_autosave',
    },
    maxUndoSize: 50,
};

export const SANDBOX_STATE_PRESET: StatePreset<SandboxState> = {
    name: 'sandbox',
    description: 'Sandbox/voxel game state with world blocks, entities, and player data',
    initialState: DEFAULT_SANDBOX_STATE,
    autoSaveConfig: {
        enabled: true,
        intervalMs: 300000,
        maxSlots: 5,
        saveOnChange: false,
        debounceMs: 10000,
        storageKey: 'sandbox_autosave',
    },
    maxUndoSize: 30,
};

export const COUNTER_STATE_PRESET: StatePreset<SimpleCounterState> = {
    name: 'counter',
    description: 'Simple counter state for demos and testing',
    initialState: DEFAULT_COUNTER_STATE,
    autoSaveConfig: {
        enabled: true,
        intervalMs: 10000,
        maxSlots: 1,
        saveOnChange: true,
        debounceMs: 1000,
        storageKey: 'counter_autosave',
    },
    maxUndoSize: 100,
};

export const ALL_STATE_PRESETS: StatePreset<unknown>[] = [
    RPG_STATE_PRESET as StatePreset<unknown>,
    PUZZLE_STATE_PRESET as StatePreset<unknown>,
    PLATFORMER_STATE_PRESET as StatePreset<unknown>,
    SANDBOX_STATE_PRESET as StatePreset<unknown>,
    COUNTER_STATE_PRESET as StatePreset<unknown>,
];

export function getStatePreset<T>(name: StatePresetName): StatePreset<T> | undefined {
    return ALL_STATE_PRESETS.find(preset => preset.name === name) as StatePreset<T> | undefined;
}

export const AUTOSAVE_CONFIG_FREQUENT: Partial<AutoSaveConfig> = {
    enabled: true,
    intervalMs: 30000,
    maxSlots: 3,
    saveOnChange: true,
    debounceMs: 1000,
};

export const AUTOSAVE_CONFIG_MODERATE: Partial<AutoSaveConfig> = {
    enabled: true,
    intervalMs: 120000,
    maxSlots: 3,
    saveOnChange: false,
    debounceMs: 5000,
};

export const AUTOSAVE_CONFIG_INFREQUENT: Partial<AutoSaveConfig> = {
    enabled: true,
    intervalMs: 300000,
    maxSlots: 5,
    saveOnChange: false,
    debounceMs: 10000,
};

export const AUTOSAVE_CONFIG_DISABLED: Partial<AutoSaveConfig> = {
    enabled: false,
    intervalMs: 0,
    maxSlots: 0,
    saveOnChange: false,
    debounceMs: 0,
};

export function createRPGState(overrides?: Partial<RPGState>): RPGState {
    return { ...DEFAULT_RPG_STATE, ...overrides };
}

export function createPuzzleState(overrides?: Partial<PuzzleGameState>): PuzzleGameState {
    return { ...DEFAULT_PUZZLE_STATE, ...overrides };
}

export function createPlatformerState(overrides?: Partial<PlatformerState>): PlatformerState {
    return { ...DEFAULT_PLATFORMER_STATE, ...overrides };
}

export function createSandboxState(overrides?: Partial<SandboxState>): SandboxState {
    return { ...DEFAULT_SANDBOX_STATE, ...overrides };
}

export function addExperience(state: RPGState, amount: number): RPGState {
    const newExp = state.player.experience + amount;
    const expToLevel = state.player.level * 100;
    
    if (newExp >= expToLevel) {
        return {
            ...state,
            player: {
                ...state.player,
                level: state.player.level + 1,
                experience: newExp - expToLevel,
                maxHealth: state.player.maxHealth + 10,
                health: state.player.maxHealth + 10,
                maxMana: state.player.maxMana + 5,
                mana: state.player.maxMana + 5,
            },
        };
    }
    
    return {
        ...state,
        player: {
            ...state.player,
            experience: newExp,
        },
    };
}

export function addInventoryItem(state: RPGState, item: InventoryItem): RPGState {
    const existingIndex = state.inventory.findIndex(i => i.id === item.id && i.type !== 'weapon' && i.type !== 'armor');
    
    if (existingIndex >= 0) {
        const inventory = [...state.inventory];
        inventory[existingIndex] = {
            ...inventory[existingIndex],
            quantity: inventory[existingIndex].quantity + item.quantity,
        };
        return { ...state, inventory };
    }
    
    return {
        ...state,
        inventory: [...state.inventory, item],
    };
}

export function completeQuest(state: RPGState, questId: string): RPGState {
    const questIndex = state.quests.findIndex(q => q.id === questId);
    if (questIndex < 0) return state;
    
    const quest = state.quests[questIndex];
    const quests = [...state.quests];
    quests[questIndex] = { ...quest, status: 'completed' };
    
    let newState: RPGState = { ...state, quests };
    
    if (quest.rewards?.experience) {
        newState = addExperience(newState, quest.rewards.experience);
    }
    if (quest.rewards?.gold) {
        newState = { ...newState, gold: newState.gold + quest.rewards.gold };
    }
    
    return newState;
}

export function unlockLevel(state: PuzzleGameState, levelNumber: number): PuzzleGameState {
    if (state.unlockedLevels.includes(levelNumber)) {
        return state;
    }
    return {
        ...state,
        unlockedLevels: [...state.unlockedLevels, levelNumber].sort((a, b) => a - b),
    };
}

export function collectCoin(state: PlatformerState, value: number = 1): PlatformerState {
    const newCoins = state.coins + value;
    const extraLives = Math.floor(newCoins / 100) - Math.floor(state.coins / 100);
    
    return {
        ...state,
        coins: newCoins % 100,
        lives: Math.min(state.maxLives, state.lives + extraLives),
        score: state.score + value * 10,
    };
}

export function loseLife(state: PlatformerState): PlatformerState {
    return {
        ...state,
        lives: Math.max(0, state.lives - 1),
    };
}

export function placeBlock(state: SandboxState, block: SandboxBlock): SandboxState {
    const existingIndex = state.blocks.findIndex(
        b => b.position.x === block.position.x && 
             b.position.y === block.position.y && 
             b.position.z === block.position.z
    );
    
    if (existingIndex >= 0) {
        const blocks = [...state.blocks];
        blocks[existingIndex] = block;
        return { ...state, blocks };
    }
    
    return {
        ...state,
        blocks: [...state.blocks, block],
    };
}

export function removeBlock(state: SandboxState, position: Vec3): SandboxState {
    return {
        ...state,
        blocks: state.blocks.filter(
            b => !(b.position.x === position.x && 
                   b.position.y === position.y && 
                   b.position.z === position.z)
        ),
    };
}
