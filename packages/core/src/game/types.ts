import type { Vector3 } from 'three';
import type { SoundManager } from '../core/audio/sound-manager';
import type { BaseEntity, StrataWorld, SystemFn } from '../core/ecs/types';
import type { InputManager } from '../core/input';
import type { GameStoreApi } from '../core/state';
import type { BiomeType } from '../utils/texture-loader';
import type { BoundingShape, ConnectionType } from '../world/types';

/** Renderer-agnostic node type — renderers provide their own concrete types. */
type RendererNode = unknown;
/** Renderer-agnostic component type — renderers provide their own concrete types. */
type RendererComponent<P = Record<string, never>> = ((props: P) => RendererNode) | undefined;

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

// === AUDIO DEFINITIONS ===

/** Defines a music track for the game. */
export interface MusicDefinition {
  id: string;
  src: string;
  volume?: number;
  loop?: boolean;
  group?: string;
}

/** Defines an ambient sound. */
export interface AmbientDefinition {
  id: string;
  src: string;
  volume?: number;
  loop?: boolean;
  region?: string;
}

/** Defines a sound effect. */
export interface SFXDefinition {
  id: string;
  src: string;
  volume?: number;
  variants?: string[];
}

/** Defines footstep sounds per surface type. */
export interface FootstepDefinition {
  surfaces: Record<string, { sounds: string[]; volume?: number }>;
}

// === UI DEFINITIONS ===

/** Defines a font for the UI system. */
export interface FontDefinition {
  family: string;
  src: string;
  weight?: string | number;
  style?: string;
}

/** Defines the UI theme. */
export interface UITheme {
  colors?: Record<string, string>;
  fonts?: Record<string, string>;
  spacing?: Record<string, number>;
  borderRadius?: Record<string, number>;
}

// === GRAPHICS DEFINITIONS ===

/** Post-processing effects configuration. */
export interface PostProcessingConfig {
  bloom?: { intensity?: number; threshold?: number; radius?: number };
  toneMappingExposure?: number;
  vignette?: { intensity?: number; offset?: number };
  colorCorrection?: Record<string, number>;
}

/** Sky rendering configuration. */
export interface SkyConfig {
  type?: 'procedural' | 'hdri' | 'gradient';
  turbidity?: number;
  rayleigh?: number;
  sunPosition?: [number, number, number];
  src?: string;
}

/** Weather system configuration. */
export interface WeatherConfig {
  enabled?: boolean;
  type?: string;
  intensity?: number;
  windSpeed?: number;
  windDirection?: [number, number, number];
}

// === CAMERA DEFINITIONS ===

/** Camera configuration for a game mode. */
export interface CameraConfig {
  type?: 'orbit' | 'first-person' | 'third-person' | 'fixed' | 'cinematic';
  fov?: number;
  near?: number;
  far?: number;
  position?: [number, number, number];
  target?: [number, number, number];
  smoothing?: number;
}

// === PHYSICS DEFINITIONS ===

/** Physics configuration for a game mode. */
export interface PhysicsConfig {
  enabled?: boolean;
  gravity?: [number, number, number];
  solver?: string;
  substeps?: number;
}

// === MODE CONTEXT ===

/** Context passed to mode lifecycle callbacks. */
export interface ModeCallbackContext {
  game: Game;
  world: Record<string, unknown>;
  modeManager: ModeManager;
  sceneManager: SceneManager;
  instance: ModeInstance;
}

// === METADATA ===
export interface GameDefinition<TState extends Record<string, unknown> = Record<string, unknown>> {
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
  initialState?: Partial<TState>;

  // === CONTROLS ===
  controls: {
    desktop?: InputMapping;
    mobile?: InputMapping;
    gamepad?: InputMapping;
  };

  // === UI ===
  ui?: {
    hud?: RendererComponent;
    menus?: Record<string, RendererComponent>;
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
    quality?: 'low' | 'medium' | 'high' | 'ultra' | 'auto';
    postProcessing?: PostProcessingConfig;
    sky?: SkyConfig;
    weather?: WeatherConfig;
  };

  // === HOOKS ===
  hooks?: {
    onStart?: () => void;
    onPause?: () => void;
    onResume?: () => void;
    onSave?: (state: TState) => void;
    onLoad?: (state: TState) => void;
  };
}

export type StatePreset = 'rpg' | 'action' | 'puzzle' | 'sandbox' | 'racing' | 'custom';

// === CONTENT DEFINITIONS ===
export interface MaterialDefinition {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

export interface SkeletonDefinition {
  id: string;
  type: string;
  config: Record<string, unknown>;
}

/** Defines the covering/skin regions for a creature. */
export interface CoveringDefinition {
  regions: Record<string, { material: string; [key: string]: unknown }>;
}

export interface CreatureDefinition {
  id: string;
  skeleton: string;
  covering: CoveringDefinition;
  ai: string;
  stats: Record<string, number>;
}

/** A shape component within a prop. */
export interface PropComponent {
  shape: string;
  size?: [number, number, number] | number;
  material?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  [key: string]: unknown;
}

export interface PropDefinition {
  id: string;
  components: PropComponent[];
}

export interface ItemDefinition {
  id: string;
  name: string;
  type: string;
  props: Record<string, unknown>;
}

export interface QuestDefinition {
  id: string;
  name?: string;
  description?: string;
  objectives?: Record<string, unknown>[];
  rewards?: Record<string, unknown>[];
  [key: string]: unknown;
}
export interface DialogueDefinition {
  id: string;
  speaker?: string;
  lines?: Record<string, unknown>[];
  [key: string]: unknown;
}
export interface RecipeDefinition {
  id: string;
  ingredients?: Record<string, unknown>[];
  result?: string;
  [key: string]: unknown;
}
export interface AchievementDefinition {
  id: string;
  name?: string;
  description?: string;
  condition?: Record<string, unknown>;
  [key: string]: unknown;
}

// === SCENES ===
export interface SceneDefinition {
  id: string;
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
  render: () => RendererNode;
  ui?: () => RendererNode;
}

export interface SceneManagerConfig {
  initialScene: string;
  loadingComponent?: RendererComponent<{ progress: number }>;
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
  systems: SystemFn<BaseEntity>[];
  inputMap: InputMapping;
  ui?: RendererComponent<{ instance: ModeInstance }>;
  camera?: CameraConfig;
  physics?: PhysicsConfig;
  setup?: (props?: Record<string, unknown>) => Promise<void>;
  teardown?: (props?: Record<string, unknown>) => Promise<void>;
  onEnter?: (props?: Record<string, unknown>) => void;
  onExit?: (props?: Record<string, unknown>) => void;
  onPause?: (props?: Record<string, unknown>) => void;
  onResume?: (props?: Record<string, unknown>) => void;
}

export interface ModeInstance {
  config: ModeDefinition;
  props: Record<string, unknown>;
  pushedAt: number;
}

export interface ModeManager {
  register(mode: ModeDefinition): void;
  push(modeId: string, props?: Record<string, unknown>): void;
  pop(): void;
  replace(modeId: string, props?: Record<string, unknown>): void;
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
  biome?: BiomeType;
  difficulty?: number;
}

export interface ConnectionDefinition {
  id?: string;
  from: string;
  to: string;
  type: ConnectionType;
  fromPosition?: [number, number, number];
  toPosition?: [number, number, number];
  traversalMode?: string;
  unlockCondition?: UnlockConditionDefinition;
}

/** Simplified unlock condition for use in game definition files. */
export type UnlockConditionDefinition =
  | { type: 'default' }
  | { type: 'key'; itemId: string; consumable?: boolean }
  | { type: 'level'; minLevel: number }
  | { type: 'quest'; questId: string }
  | { type: 'custom'; check: (entity: Record<string, unknown>) => boolean };

export interface Region {
  id: string;
  name: string;
  type: string;
  center: Vector3;
  bounds: BoundingShape;
  biome?: BiomeType;
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
  on(event: string, handler: (...args: unknown[]) => void): void;
  emit(event: string, ...args: unknown[]): void;
}

// === REGISTRY ===
export interface Registry<T> {
  register(item: T): void;
  get(id: string): T | undefined;
  all(): T[];
}

// === GAME ===
export interface Game<TState extends Record<string, unknown> = Record<string, unknown>> {
  definition: GameDefinition<TState>;
  registries: {
    materials: Registry<MaterialDefinition>;
    creatures: Registry<CreatureDefinition>;
    props: Registry<PropDefinition>;
    items: Registry<ItemDefinition>;
  };
  worldGraph: WorldGraph;
  world: StrataWorld<BaseEntity>;
  store: GameStoreApi<TState>;
  sceneManager: SceneManager;
  modeManager: ModeManager;
  inputManager: InputManager;
  audioManager: SoundManager;

  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}
