/**
 * State Management React Components and Hooks
 *
 * Re-exports from src/components/state/ for backward compatibility.
 *
 * @module components/State
 * @public
 */

export {
    GameStateProvider,
    GameStateContext,
    useGameStateContext,
    useGameState,
    useUndo,
    PersistGate,
    StateDebugger,
} from './state/context';

export { useSaveLoad, useCheckpoint, useAutoSave } from './state/hooks';

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
} from './state/types';
