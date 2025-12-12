/**
 * State Management React Components
 *
 * React integration for Zustand-based game state management.
 *
 * @module components/state
 * @public
 *
 * @example
 * ```tsx
 * import { GameStateProvider, useGameState, useSaveLoad } from './state';
 *
 * function App() {
 *   return (
 *     <GameStateProvider initialState={{ health: 100, score: 0 }}>
 *       <Game />
 *     </GameStateProvider>
 *   );
 * }
 *
 * function Game() {
 *   const health = useGameState(s => s.data.health);
 *   const { save, load } = useSaveLoad();
 *
 *   return <div>Health: {health}</div>;
 * }
 * ```
 */

export {
    GameStateContext,
    GameStateProvider,
    PersistGate,
    StateDebugger,
    useGameState,
    useGameStateContext,
    useUndo,
} from './context';

export { useAutoSave, useCheckpoint, useSaveLoad } from './hooks';

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
} from './types';
