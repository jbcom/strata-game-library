import type { Vector2, Vector3 } from 'three';
import type { SoundManager } from '../core/audio/sound-manager';
import { BaseEntity, type SystemFn } from '../core/ecs/types';
import { type InputManager, InputManagerConfig } from '../core/input';
import type { GameStoreApi } from '../core/state';

/**
 * Unique identifier for a game mode.
 */
export type GameMode = string;

/**
 * Defines input mappings for a specific game mode.
 */
export interface InputMapping {
    [action: string]: {
        /** Keyboard keys that trigger this action. */
        keyboard?: string[];
        /** Gamepad button name or index. */
        gamepad?: string | number;
        /** Whether device tilt/motion is used. */
        tilt?: boolean;
    };
}

// === METADATA ===
export interface GameDefinition {
    name: string;
    version: string;
    description?: string;

    // === CONTENT REGISTRIES ===
    content: {
        materials: MaterialDefinition[];
        skeletons?: SkeletonDefinition[];
        creatures: CreatureDefinition[];
        props: PropDefinition[];
        items: ItemDefinition[];
        quests?: QuestDefinition[];
        dialogues?: DialogueDefinition[];
        recipes?: RecipeDefinition[];
        achievements?: AchievementDefinition[];
    };

    // === WORLD ===
    world: WorldGraphDefinition | WorldGraph;

    // === SCENES ===
    scenes: Record<string, SceneDefinition>;
    initialScene: string;

    // === MODES ===
    modes: Record<string, ModeDefinition>;
    defaultMode: string;

    // === STATE ===
    statePreset: StatePreset;
    initialState?: Partial<any>; // Depends on preset

    // === CONTROLS ===
    controls: {
        desktop?: any; // InputMapping
        mobile?: any;
        gamepad?: any;
    };

    // === UI ===
    ui?: {
        hud?: React.ComponentType;
        menus?: Record<string, React.ComponentType>;
        theme?: any; // UITheme
        fonts?: any[]; // FontDefinition
    };

    // === AUDIO ===
    audio?: {
        music?: any[]; // MusicDefinition
        ambient?: any[]; // AmbientDefinition
        sfx?: any[]; // SFXDefinition
        footsteps?: any; // FootstepDefinition
    };

    // === GRAPHICS ===
    graphics?: {
        quality?: 'low' | 'medium' | 'high' | 'ultra' | 'auto';
        postProcessing?: any;
        sky?: any;
        weather?: any;
    };

    // === HOOKS ===
    hooks?: {
        onStart?: () => void;
        onPause?: () => void;
        onResume?: () => void;
        onSave?: (state: any) => void;
        onLoad?: (state: any) => void;
    };
}

export type StatePreset = 'rpg' | 'action' | 'puzzle' | 'sandbox' | 'racing' | 'custom';

// === CONTENT DEFINITIONS ===
export interface MaterialDefinition {
    id: string;
    type: string;
    props: Record<string, any>;
}

export interface SkeletonDefinition {
    id: string;
    type: string;
    config: Record<string, any>;
}

export interface CreatureDefinition {
    id: string;
    skeleton: string;
    covering: any;
    ai: string;
    stats: Record<string, number>;
}

export interface PropDefinition {
    id: string;
    components: any[];
}

export interface ItemDefinition {
    id: string;
    name: string;
    type: string;
    props: Record<string, any>;
}

export interface QuestDefinition {
    id: string;
    [key: string]: any;
}
export interface DialogueDefinition {
    id: string;
    [key: string]: any;
}
export interface RecipeDefinition {
    id: string;
    [key: string]: any;
}
export interface AchievementDefinition {
    id: string;
    [key: string]: any;
}

// === SCENES ===
export interface SceneDefinition {
    id: string;
    setup?: () => Promise<void>;
    teardown?: () => Promise<void>;
    render: () => React.ReactNode;
    ui?: () => React.ReactNode;
}

export interface SceneManagerConfig {
    initialScene: string;
    loadingComponent?: React.ComponentType<{ progress: number }>;
}

export interface SceneManager {
    register(scene: SceneDefinition): void;
    load(sceneId: string): Promise<void>;
    push(sceneId: string): Promise<void>;
    pop(): Promise<void>;
    current: SceneDefinition | null;
    stack: SceneDefinition[];
    isLoading: boolean;
    loadProgress: number;
}

// === MODES ===
export interface ModeDefinition {
    id: string;
    systems: SystemFn<any>[];
    inputMap: any; // InputMapping
    ui?: React.ComponentType<{ instance: ModeInstance }>;
    camera?: any;
    physics?: any;
    setup?: (props?: any) => Promise<void>;
    teardown?: (props?: any) => Promise<void>;
    onEnter?: (props?: any) => void;
    onExit?: (props?: any) => void;
    onPause?: (props?: any) => void;
    onResume?: (props?: any) => void;
}

export interface ModeInstance {
    config: ModeDefinition;
    props: any;
    pushedAt: number;
}

export interface ModeManager {
    register(mode: ModeDefinition): void;
    push(modeId: string, props?: any): void;
    pop(): void;
    replace(modeId: string, props?: any): void;
    current: ModeInstance | null;
    stack: ModeInstance[];
    getConfig(modeId: string): ModeDefinition | undefined;
    isActive(modeId: string): boolean;
    hasMode(modeId: string): boolean;
}

// === WORLD GRAPH ===
export interface WorldGraphDefinition {
    regions: Record<string, RegionDefinition>;
    connections: ConnectionDefinition[];
    startRegion?: string;
}

export interface RegionDefinition {
    name: string;
    type?: 'biome' | 'dungeon' | 'building' | 'zone' | 'room';
    center: [number, number, number];
    radius?: number;
    size?: [number, number, number];
    biome?: string;
    difficulty?: number;
}

export interface ConnectionDefinition {
    id?: string;
    from: string;
    to: string;
    type: string;
    fromPosition?: [number, number, number];
    toPosition?: [number, number, number];
    traversalMode?: string;
    unlockCondition?: any;
}

export interface Region {
    id: string;
    name: string;
    type: string;
    center: Vector3;
    bounds: any;
    biome?: string;
    difficulty: number;
    discovered: boolean;
    visitCount: number;
}

export interface Connection {
    id: string;
    from: string;
    to: string;
    type: string;
    fromPosition: Vector3;
    toPosition: Vector3;
    unlocked: boolean;
}

export interface WorldGraph {
    regions: Map<string, Region>;
    connections: Connection[];
    getRegion(id: string): Region | undefined;
    getRegionAt(position: Vector3): Region | undefined;
    getConnections(regionId: string): Connection[];
    discoverRegion(id: string): void;
    unlockConnection(id: string): void;
    on(event: string, handler: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
}

// === REGISTRY ===
export interface Registry<T> {
    register(item: T): void;
    get(id: string): T | undefined;
    all(): T[];
}

// === GAME ===
export interface Game {
    definition: GameDefinition;
    registries: {
        materials: Registry<MaterialDefinition>;
        creatures: Registry<CreatureDefinition>;
        props: Registry<PropDefinition>;
        items: Registry<ItemDefinition>;
    };
    worldGraph: WorldGraph;
    world: any; // StrataWorld
    store: GameStoreApi<any>;
    sceneManager: SceneManager;
    modeManager: ModeManager;
    inputManager: InputManager;
    audioManager: SoundManager;

    start: () => Promise<void>;
    pause: () => void;
    resume: () => void;
    stop: () => void;
}
