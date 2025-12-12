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

// State Management - React components and hooks
export {
    GameStateProvider,
    GameStateContext,
    useGameStateContext,
    useGameState,
    useSaveLoad,
    useUndo,
    useCheckpoint,
    useAutoSave,
    PersistGate,
    StateDebugger,
} from '../components';

export type {
    GameStateContextValue,
    GameStateProviderProps,
    UseSaveLoadOptions,
    UseSaveLoadReturn,
    UseUndoReturn,
    UseCheckpointReturn,
    UseAutoSaveOptions,
    UseAutoSaveReturn,
    PersistGateProps,
    StateDebuggerProps,
    GameStoreApi,
    GameStore,
    CheckpointData,
    AutoSaveConfig,
    StateChangeEvent,
} from '../components';

// State Management - Core utilities
export {
    createGameStore,
    createPersistenceAdapter,
    calculateChecksum,
    verifyChecksum,
    webPersistenceAdapter,
    createWebPersistenceAdapter,
    create,
    useStore,
    temporal,
    immer,
} from '../core';

export type {
    GameStoreState,
    GameStoreActions,
    StoreConfig,
    SaveData,
    CheckpointOptions,
    PersistenceAdapter,
    StateChangeType,
    StateListener,
} from '../core';
