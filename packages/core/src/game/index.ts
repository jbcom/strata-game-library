/**
 * Game orchestration systems for managing scenes, modes, transitions, and triggers.
 *
 * Provides the core game lifecycle infrastructure: scene management for
 * loading/unloading game levels, mode management for gameplay states
 * (exploration, combat, dialogue), transition effects between scenes/modes,
 * and a trigger system for event-driven game logic.
 *
 * @module Game
 * @category Game Systems
 */

export * from './game-presets';
export * from './ModeManager';
export * from './SceneManager';
export * from './scene-shell-presets';
export * from './shell-flow-presets';
export * from './state-presets';
export * from './TransitionManager';
export * from './TriggerSystem';
export type {
  AchievementDefinition,
  DeepPartial,
  DialogueDefinition,
  Game,
  GameDefinition,
  GameHUDDefinition,
  GameLoadingOverlayDefinition,
  GameMode,
  GameSnapshot,
  GameTransitionOptions,
  GameTransitionsDefinition,
  GameUIShellDefinition,
  InputMapping,
  ItemDefinition,
  ModeDefinition,
  ModeInstance,
  PauseMenuDefinition,
  QuestDefinition,
  RecipeDefinition,
  Registry,
  SceneDefinition,
  SceneManagerConfig,
  SceneShellActionDefinition,
  SceneShellDefinition,
  SceneShellProfileLoadTargetDefinition,
  SceneShellSaveProfileDefinition,
  SceneShellSaveSlotDefinition,
  SceneShellVariant,
  StatePreset,
} from './types';
