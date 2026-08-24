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

export type {
  ActionGameOptions,
  ActionState,
  PlatformerGameOptions,
  PuzzleGameOptions,
  PuzzleState,
  RacingGameOptions,
  RacingState,
  RPGGameOptions,
  RPGState,
  SandboxGameOptions,
  SandboxState,
} from './game-presets';
export {
  createActionGame,
  createPlatformerGame,
  createPuzzleGame,
  createRacingGame,
  createRPGGame,
  createSandboxGame,
} from './game-presets';
export type { ModeManagerSnapshot } from './ModeManager';
export { createModeManager } from './ModeManager';
export type {
  RendererNode,
  Scene,
  SceneManager,
  SceneManagerSnapshot,
} from './SceneManager';
export { createSceneManager } from './SceneManager';
export {
  createAnnouncementScene,
  createAnnouncementSceneShell,
  createClearProfileSceneShellAction,
  createDeleteSaveSceneShellAction,
  createDismissSceneShellAction,
  createLoadActiveProfileSceneShellAction,
  createLoadGameSceneShellAction,
  createLoadLatestProfileSceneShellAction,
  createLoadSceneShellAction,
  createMenuScene,
  createMenuSceneShell,
  createOpenActiveProfileArchiveSceneShellAction,
  createPauseSceneShellAction,
  createPopModeSceneShellAction,
  createPopSceneShellAction,
  createPushModeSceneShellAction,
  createPushSceneShellAction,
  createReplaceModeSceneShellAction,
  createResumeSceneShellAction,
  createSaveGameSceneShellAction,
  createSaveProfilesScene,
  createSaveProfilesSceneShell,
  createSaveScene,
  createSaveSceneShell,
  createSessionScene,
  createSessionSceneShell,
  createTitleScene,
  createTitleSceneShell,
  createTogglePauseSceneShellAction,
} from './scene-shell-presets';
export type {
  CreateSceneShellFlowOptions,
  SceneShellFlowActionLabels,
  SceneShellFlowDefaults,
  SceneShellFlowMenuOptions,
  SceneShellFlowResult,
  SceneShellFlowSaveProfile,
  SceneShellFlowSaveProfileSelectorOptions,
  SceneShellFlowSaveSlot,
  SceneShellFlowSavesOptions,
  SceneShellFlowSessionOptions,
  SceneShellFlowSettingsOptions,
  SceneShellFlowTitleOptions,
  ShellFlowLoadLatestProfileActionInput,
  ShellFlowPersistenceActionInput,
  ShellFlowScaffoldInput,
  ShellFlowSceneLoadActionInput,
  ShellFlowTogglePauseActionInput,
} from './shell-flow-presets';
export { createSceneShellFlow } from './shell-flow-presets';
export type {
  BuiltInStatePreset,
  PresetGameDefinition,
  RPGInventoryItem,
  RPGNpcState,
  RPGQuestProgress,
  SandboxVector3,
  StateForPreset,
  StatePresetDefinition,
  StatePresetDefinitions,
  StatePresetMap,
} from './state-presets';
export {
  createActionState,
  createPuzzleState,
  createRacingState,
  createRPGState,
  createSandboxState,
  createStateFromPreset,
  DEFAULT_ACTION_STATE,
  DEFAULT_PUZZLE_STATE,
  DEFAULT_RACING_STATE,
  DEFAULT_RPG_STATE,
  DEFAULT_SANDBOX_STATE,
  getStatePresetDefinition,
  isBuiltInStatePreset,
  mergeState,
  STATE_PRESETS,
} from './state-presets';
export type {
  TransitionConfig,
  TransitionManager,
  TransitionManagerSnapshot,
  TransitionType,
} from './TransitionManager';
export { createTransitionManager } from './TransitionManager';
export type {
  TriggerableEntity,
  TriggerComponent,
  TriggerEntity,
  TriggerShape,
  TriggerType,
} from './TriggerSystem';
export { createTriggerSystem } from './TriggerSystem';
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
