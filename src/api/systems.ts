/**
 * @module Systems
 * @category Game Systems
 *
 * Game Systems - State Management, Save/Load, and ECS
 *
 * The infrastructure that powers your game - state management with
 * undo/redo, save/load, checkpoints, and entity component systems.
 *
 * @example
 * ```tsx
 * import { GameStateProvider, useGameState, useSaveLoad } from '@jbcom/strata/api/systems';
 *
 * function Game() {
 *   const { saveGame, loadGame } = useSaveLoad();
 *   const health = useGameState(state => state.player.health);
 *
 *   return <HealthDisplay health={health} onSave={saveGame} />;
 * }
 * ```
 */

export type {
    AutoSaveConfig,
    CheckpointData,
    GameStateContextValue,
    GameStateProviderProps,
    GameStore,
    GameStoreApi,
    PersistGateProps,
    StateChangeEvent,
    StateDebuggerProps,
    UseAutoSaveOptions,
    UseAutoSaveReturn,
    UseCheckpointReturn,
    UseSaveLoadOptions,
    UseSaveLoadReturn,
    UseUndoReturn,
} from '../components';
// State Management - React components and hooks
export {
    GameStateContext,
    GameStateProvider,
    PersistGate,
    StateDebugger,
    useAutoSave,
    useCheckpoint,
    useGameState,
    useGameStateContext,
    useSaveLoad,
    useUndo,
} from '../components';
export type {
    CheckpointOptions,
    GameStoreActions,
    GameStoreState,
    PersistenceAdapter,
    SaveData,
    StateChangeType,
    StateListener,
    StoreConfig,
} from '../core';
// State Management - Core utilities
export {
    calculateChecksum,
    create,
    createGameStore,
    createPersistenceAdapter,
    createWebPersistenceAdapter,
    immer,
    temporal,
    useStore,
    verifyChecksum,
    webPersistenceAdapter,
} from '../core';
