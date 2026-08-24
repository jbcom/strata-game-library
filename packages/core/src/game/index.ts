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

export { createActionGame, createPlatformerGame, createPuzzleGame, createRPGGame, createRacingGame, createSandboxGame } from "./game-presets";
export type { ActionGameOptions, ActionState, PlatformerGameOptions, PuzzleGameOptions, PuzzleState, RPGGameOptions, RPGState, RacingGameOptions, RacingState, SandboxGameOptions, SandboxState } from "./game-presets";
export { createModeManager } from "./ModeManager";
export type { ModeManagerSnapshot } from "./ModeManager";
export { createSceneManager } from "./SceneManager";
export type { RendererNode, Scene, SceneManager, SceneManagerSnapshot } from "./SceneManager";
export { createAnnouncementScene, createAnnouncementSceneShell, createClearProfileSceneShellAction, createDeleteSaveSceneShellAction, createDismissSceneShellAction, createLoadActiveProfileSceneShellAction, createLoadGameSceneShellAction, createLoadLatestProfileSceneShellAction, createLoadSceneShellAction, createMenuScene, createMenuSceneShell, createOpenActiveProfileArchiveSceneShellAction, createPauseSceneShellAction, createPopModeSceneShellAction, createPopSceneShellAction, createPushModeSceneShellAction, createPushSceneShellAction, createReplaceModeSceneShellAction, createResumeSceneShellAction, createSaveGameSceneShellAction, createSaveProfilesScene, createSaveProfilesSceneShell, createSaveScene, createSaveSceneShell, createSessionScene, createSessionSceneShell, createTitleScene, createTitleSceneShell, createTogglePauseSceneShellAction } from "./scene-shell-presets";
export { createSceneShellFlow } from "./shell-flow-presets";
export type { CreateSceneShellFlowOptions, SceneShellFlowActionLabels, SceneShellFlowDefaults, SceneShellFlowMenuOptions, SceneShellFlowResult, SceneShellFlowSaveProfile, SceneShellFlowSaveProfileSelectorOptions, SceneShellFlowSaveSlot, SceneShellFlowSavesOptions, SceneShellFlowSessionOptions, SceneShellFlowSettingsOptions, SceneShellFlowTitleOptions, ShellFlowLoadLatestProfileActionInput, ShellFlowPersistenceActionInput, ShellFlowScaffoldInput, ShellFlowSceneLoadActionInput, ShellFlowTogglePauseActionInput } from "./shell-flow-presets";
export { DEFAULT_ACTION_STATE, DEFAULT_PUZZLE_STATE, DEFAULT_RACING_STATE, DEFAULT_RPG_STATE, DEFAULT_SANDBOX_STATE, STATE_PRESETS, createActionState, createPuzzleState, createRPGState, createRacingState, createSandboxState, createStateFromPreset, getStatePresetDefinition, isBuiltInStatePreset, mergeState } from "./state-presets";
export type { BuiltInStatePreset, PresetGameDefinition, RPGInventoryItem, RPGNpcState, RPGQuestProgress, SandboxVector3, StateForPreset, StatePresetDefinition, StatePresetDefinitions, StatePresetMap } from "./state-presets";
export { createTransitionManager } from "./TransitionManager";
export type { TransitionConfig, TransitionManager, TransitionManagerSnapshot, TransitionType } from "./TransitionManager";
export { createTriggerSystem } from "./TriggerSystem";
export type { TriggerComponent, TriggerEntity, TriggerShape, TriggerType, TriggerableEntity } from "./TriggerSystem";
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
