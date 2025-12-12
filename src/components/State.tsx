/**
 * State Management React Components and Hooks
 *
 * Re-exports from src/components/state/ for backward compatibility.
 *
 * @module components/State
 * @public
 */

export {
    GameStateContext,
    GameStateProvider,
    PersistGate,
    StateDebugger,
    useGameState,
    useGameStateContext,
    useUndo,
} from './state/context';

export { useAutoSave, useCheckpoint, useSaveLoad } from './state/hooks';

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
} from './state/types';
