import type { Vector3 } from 'three';
import type { SoundManager } from '../core/audio/sound-manager';
import type { BaseEntity, StrataWorld, SystemFn } from '../core/ecs/types';
import type { InputManager } from '../core/input';
import type { GameStoreApi, SaveInfo } from '../core/state';
import type { BiomeType } from '../utils/texture-loader';
import type { BoundingShape, ConnectionType } from '../world/types';
import type { TransitionConfig, TransitionManager } from './TransitionManager';

/** Renderer-agnostic node type — renderers provide their own concrete types. */
type RendererNode = unknown;
/** Renderer-agnostic component type — renderers provide their own concrete types. */
type RendererComponent<P = Record<string, never>> = ((props: P) => RendererNode) | undefined;

/**
 * Recursive partial utility used for declarative configuration payloads.
 */
export type DeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? Array<DeepPartial<U>>
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;

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

/** Renderer-agnostic built-in HUD configuration. */
export interface GameHUDDefinition {
  /** Optional heading label shown above the HUD body. */
  title?: string;
  /** Maximum number of control hints to render. Default: 6. */
  hintLimit?: number;
  /** Whether to render the active mode name. Default: true. */
  showMode?: boolean;
  /** Whether to render the currently pressed actions. Default: true. */
  showPressedActions?: boolean;
  /** Whether to render control hints. Default: true. */
  showControls?: boolean;
}

/** Renderer-agnostic built-in pause menu configuration. */
export interface PauseMenuDefinition {
  /** Main title displayed in the pause panel. */
  title?: string;
  /** Secondary descriptive copy displayed under the title. */
  description?: string;
  /** Label for the resume action button. */
  resumeLabel?: string;
  /** Maximum number of control hints to render. Default: 6. */
  hintLimit?: number;
  /** Whether to render the active mode label. Default: true. */
  showMode?: boolean;
  /** Whether to render control hints. Default: true. */
  showControls?: boolean;
}

/** Renderer-agnostic built-in loading overlay configuration. */
export interface GameLoadingOverlayDefinition {
  /** Main title displayed in the loading panel. */
  title?: string;
  /** Shared fallback description displayed when phase-specific copy is not provided. */
  description?: string;
  /** Phase label shown while the game is booting. */
  bootLabel?: string;
  /** Phase label shown while a scene load is in flight. */
  sceneLabel?: string;
  /** Boot-specific descriptive copy. */
  bootDescription?: string;
  /** Scene-load-specific descriptive copy. */
  sceneDescription?: string;
  /** Whether to render the current or pending scene id. Default: true. */
  showScene?: boolean;
  /** Whether to render a progress bar and percentage. Default: true. */
  showProgress?: boolean;
}

/** Renderer-agnostic scene-entry card configuration. */
export type SceneShellVariant =
  | 'announcement'
  | 'title'
  | 'menu'
  | 'session'
  | 'archive'
  | 'profiles';

/** Declarative metadata for a built-in save/archive slot card. */
export interface SceneShellSaveSlotDefinition {
  /** Stable save slot id passed to persistence helpers. */
  slot: string;
  /** Optional persisted storage slot id when the visible slot id should remain local or profile-scoped. */
  storageSlot?: string;
  /** User-facing label shown in the archive card. */
  label?: string;
  /** Supporting copy shown under the slot heading. */
  description?: string;
  /** Whether the built-in archive UI should offer save/overwrite. Default: true. */
  allowSave?: boolean;
  /** Whether the built-in archive UI should offer load/restore. Default: true. */
  allowLoad?: boolean;
  /** Whether the built-in archive UI should offer delete/remove. Default: true. */
  allowDelete?: boolean;
  /** Status label shown when the slot currently has persisted data. Default: 'Saved'. */
  savedLabel?: string;
  /** Status label shown when the slot currently has no persisted data. Default: 'Empty'. */
  emptyLabel?: string;
}

/** Declarative metadata for a built-in save-profile selector card. */
export interface SceneShellSaveProfileDefinition {
  /** Stable profile id used to correlate save-profile scene shells. */
  id: string;
  /** User-facing label shown in the selector card. */
  label?: string;
  /** Supporting copy rendered under the profile heading. */
  description?: string;
  /** Scene id opened when the profile card is activated. */
  sceneId: string;
  /** Entry-action label used when the profile has no persisted saves yet. */
  emptyActionLabel?: string;
  /** Entry-action label used when the profile already has persisted saves. */
  occupiedActionLabel?: string;
  /** Archive slots associated with the profile, used for runtime occupancy summaries. */
  slots?: SceneShellSaveSlotDefinition[];
}

/** Runtime metadata for profile-aware scene-shell actions that continue or route using the active profile. */
export interface SceneShellProfileLoadTargetDefinition {
  /** Scene id opened when the profile has no persisted saves yet. */
  emptySceneId?: string;
  /** Storage slots considered when restoring or managing the active profile. */
  slots: string[];
}

/** Declarative scene-shell action executed by renderer adapters. */
export type SceneShellActionDefinition =
  | {
      /** Stable action id used by renderers for keyed interaction state. */
      id?: string;
      /** User-facing label rendered on the action button. */
      label: string;
      /** Optional supporting copy rendered under the label. */
      description?: string;
      /** Visual emphasis for the action button. Default: 'secondary'. */
      variant?: 'primary' | 'secondary' | 'ghost';
      /** Close the active scene shell after the action succeeds. Default: false. */
      closeOnSuccess?: boolean;
      /** Dismiss the current scene shell without invoking a game runtime operation. */
      type: 'dismiss-shell';
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Load a new scene, replacing the current active scene. */
      type: 'load-scene';
      sceneId: string;
      /** Optional save-profile context remembered after the scene opens. */
      profileId?: string;
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Push a scene onto the scene stack. */
      type: 'push-scene';
      sceneId: string;
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Pop the current scene from the scene stack. */
      type: 'pop-scene';
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Push a new mode onto the mode stack. */
      type: 'push-mode';
      modeId: string;
      props?: Record<string, unknown>;
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Replace the active mode. */
      type: 'replace-mode';
      modeId: string;
      props?: Record<string, unknown>;
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Pop the active mode from the stack. */
      type: 'pop-mode';
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Pause the active game session. */
      type: 'pause';
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Resume a paused game session. */
      type: 'resume';
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Toggle the paused state of the current game session. */
      type: 'toggle-pause';
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Open the active profile archive when one is selected, otherwise fall back to a selector scene. */
      type: 'open-active-profile-archive';
      profileSceneIds: Record<string, string>;
      fallbackSceneId?: string;
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Restore the latest persisted save for the active profile, or fall back to a scene when no active profile is selected. */
      type: 'load-active-profile';
      profiles: Record<string, SceneShellProfileLoadTargetDefinition>;
      fallbackSceneId?: string;
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Persist the current game state to a save slot. */
      type: 'save-game';
      slot?: string;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Restore game state from a save slot. */
      type: 'load-game';
      slot?: string;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Permanently delete a save slot from storage. */
      type: 'delete-save';
      slot: string;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Restore the latest persisted save for a profile, or start a new session when empty. */
      type: 'load-latest-profile';
      profileId: string;
      slots: string[];
      emptySceneId?: string;
      transition?: GameTransitionOptions;
    }
  | {
      id?: string;
      label: string;
      description?: string;
      variant?: 'primary' | 'secondary' | 'ghost';
      closeOnSuccess?: boolean;
      /** Delete all persisted saves associated with a generated or custom profile. */
      type: 'clear-profile';
      profileId: string;
      slots: string[];
    };

export interface SceneShellDefinition {
  /** Presentation style hint for renderer adapters. Default: 'announcement'. */
  variant?: SceneShellVariant;
  /** Primary scene title shown in the card body. */
  title?: string;
  /** Secondary eyebrow text shown above the main title. */
  subtitle?: string;
  /** Supporting copy rendered under the title. */
  description?: string;
  /** Declarative actions rendered within the scene shell. */
  actions?: SceneShellActionDefinition[];
  /** Optional save-slot metadata used by built-in archive shells. */
  saveSlots?: SceneShellSaveSlotDefinition[];
  /** Optional save-profile metadata used by built-in profile selector shells. */
  saveProfiles?: SceneShellSaveProfileDefinition[];
  /** Whether to render the active scene id. Default: false. */
  showSceneId?: boolean;
  /** Auto-hide delay in milliseconds. Default: 3200. Set `<= 0` to keep it visible until scene changes. */
  durationMs?: number;
  /** Preferred screen anchor for the card. Default: 'top-left'. */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  /** Whether to show the card automatically when the scene becomes active. Default: true. */
  showOnEnter?: boolean;
}

/** Declarative built-in game-shell configuration interpreted by renderer adapters. */
export interface GameUIShellDefinition {
  /** Built-in HUD scaffold. Set to `false` to disable it explicitly. */
  hud?: GameHUDDefinition | false;
  /** Built-in pause menu scaffold. Set to `false` to disable it explicitly. */
  pauseMenu?: PauseMenuDefinition | false;
  /** Built-in loading scaffold. Set to `false` to disable it explicitly. */
  loadingOverlay?: GameLoadingOverlayDefinition | false;
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

/** Context passed to scene lifecycle callbacks. */
export interface SceneCallbackContext<TState extends object = object> {
  game: Game<TState>;
  world: StrataWorld<BaseEntity>;
  worldGraph: WorldGraph;
  store: GameStoreApi<TState>;
  inputManager: InputManager;
  audioManager: SoundManager;
  modeManager: ModeManager;
  sceneManager: SceneManager;
  scene: SceneDefinition;
}

/** Context passed to mode lifecycle callbacks. */
export interface ModeCallbackContext<TState extends object = object>
  extends Record<string, unknown> {
  game: Game<TState>;
  world: StrataWorld<BaseEntity>;
  worldGraph: WorldGraph;
  store: GameStoreApi<TState>;
  inputManager: InputManager;
  audioManager: SoundManager;
  modeManager: ModeManager;
  sceneManager: SceneManager;
  instance: ModeInstance;
  props: Record<string, unknown>;
}

export type ModeLifecyclePayload<TState extends object = object> =
  | Record<string, unknown>
  | ModeCallbackContext<TState>;

// === METADATA ===
export interface GameDefinition<TState extends object = object> {
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

  // === TRANSITIONS ===
  transitions?: GameTransitionsDefinition;

  // === STATE ===
  statePreset: StatePreset;
  initialState?: DeepPartial<TState>;

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
    shell?: GameUIShellDefinition;
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
  setup?: (context?: SceneCallbackContext) => Promise<void>;
  teardown?: (context?: SceneCallbackContext) => Promise<void>;
  render: () => RendererNode;
  ui?: () => RendererNode;
  shell?: SceneShellDefinition;
  transition?: GameTransitionOptions;
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
  pendingSceneId?: string;
  getSnapshot(): SceneManagerSnapshot;
  subscribe(listener: (snapshot: SceneManagerSnapshot) => void): () => void;
}

export interface SceneManagerSnapshot {
  current: SceneDefinition | null;
  stack: SceneDefinition[];
  isLoading: boolean;
  loadProgress: number;
  pendingSceneId?: string;
}

// === MODES ===
export interface ModeDefinition {
  id: string;
  systems: SystemFn<BaseEntity>[];
  inputMap: InputMapping;
  render?: RendererComponent<{ instance: ModeInstance }>;
  ui?: RendererComponent<{ instance: ModeInstance }>;
  camera?: CameraConfig;
  physics?: PhysicsConfig;
  transition?: GameTransitionOptions;
  setup?: (context?: ModeLifecyclePayload) => Promise<void>;
  teardown?: (context?: ModeLifecyclePayload) => Promise<void>;
  onEnter?: (context?: ModeLifecyclePayload) => void;
  onExit?: (context?: ModeLifecyclePayload) => void;
  onPause?: (context?: ModeLifecyclePayload) => void;
  onResume?: (context?: ModeLifecyclePayload) => void;
}

export interface ModeInstance {
  config: ModeDefinition;
  props: Record<string, unknown>;
  pushedAt: number;
}

export interface ModeManager {
  register(mode: ModeDefinition): void;
  push(modeId: string, props?: Record<string, unknown>): Promise<void>;
  pop(): Promise<void>;
  replace(modeId: string, props?: Record<string, unknown>): Promise<void>;
  current: ModeInstance | null;
  stack: ModeInstance[];
  getConfig(modeId: string): ModeDefinition | undefined;
  isActive(modeId: string): boolean;
  hasMode(modeId: string): boolean;
  getSnapshot(): ModeManagerSnapshot;
  subscribe(listener: (snapshot: ModeManagerSnapshot) => void): () => void;
}

export interface ModeManagerSnapshot {
  current: ModeInstance | null;
  stack: ModeInstance[];
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

export interface GameTransitionOptions {
  transition?: TransitionConfig;
  transitionOut?: TransitionConfig;
  transitionIn?: TransitionConfig;
}

export interface GameTransitionsDefinition {
  scenes?: {
    load?: GameTransitionOptions;
    push?: GameTransitionOptions;
    pop?: GameTransitionOptions;
  };
  modes?: {
    push?: GameTransitionOptions;
    replace?: GameTransitionOptions;
    pop?: GameTransitionOptions;
  };
}

export interface GameSnapshot {
  isPaused: boolean;
  activeProfileId?: string;
}

// === GAME ===
export interface Game<TState extends object = object> {
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
  transitionManager: TransitionManager;
  inputManager: InputManager;
  audioManager: SoundManager;
  isPaused: boolean;
  activeProfileId?: string;

  start: () => Promise<void>;
  loadScene: (sceneId: string, options?: GameTransitionOptions) => Promise<void>;
  pushScene: (sceneId: string, options?: GameTransitionOptions) => Promise<void>;
  popScene: (options?: GameTransitionOptions) => Promise<void>;
  pushMode: (
    modeId: string,
    props?: Record<string, unknown>,
    options?: GameTransitionOptions
  ) => Promise<void>;
  replaceMode: (
    modeId: string,
    props?: Record<string, unknown>,
    options?: GameTransitionOptions
  ) => Promise<void>;
  popMode: (options?: GameTransitionOptions) => Promise<void>;
  save: (slot?: string) => Promise<boolean>;
  load: (slot?: string) => Promise<boolean>;
  deleteSave: (slot: string) => Promise<boolean>;
  listSaves: () => Promise<string[]>;
  getSaveInfo: (slot: string) => Promise<SaveInfo | null>;
  setActiveProfile: (profileId?: string) => void;
  getSnapshot: () => GameSnapshot;
  subscribe: (listener: (snapshot: GameSnapshot) => void) => () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}
