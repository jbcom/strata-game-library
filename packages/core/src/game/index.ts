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

export * from './ModeManager';
export * from './SceneManager';
export * from './TransitionManager';
export * from './TriggerSystem';
export type {
  AchievementDefinition,
  DialogueDefinition,
  Game,
  GameDefinition,
  GameMode,
  InputMapping,
  ItemDefinition,
  ModeDefinition,
  ModeInstance,
  QuestDefinition,
  RecipeDefinition,
  Registry,
  SceneDefinition,
  SceneManagerConfig,
  StatePreset,
} from './types';
