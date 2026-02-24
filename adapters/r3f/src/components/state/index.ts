/**
 * React Integration for Strata State Management.
 *
 * Provides React context providers and hooks for Zustand-based game state management,
 * featuring automatic persistence, undo/redo, and cross-component synchronization.
 *
 * @packageDocumentation
 * @module components/state
 * @category Game Systems
 *
 * @example
 * ```tsx
 * function PlayerHealth() {
 *   const health = useGameState(state => state.player.health);
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
