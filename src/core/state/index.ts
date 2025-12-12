/**
 * State Management Module
 *
 * Zustand-based state management with Immer for immutable updates,
 * zundo for undo/redo, and cross-platform persistence adapters.
 *
 * @module core/state
 * @public
 *
 * @example
 * ```typescript
 * import { createGameStore } from '@jbcom/strata/core/state';
 *
 * const useGameStore = createGameStore({
 *   player: { health: 100, score: 0 },
 *   world: { time: 0, weather: 'clear' },
 * });
 *
 * // Use in React components
 * function HealthBar() {
 *   const health = useGameStore(s => s.data.player.health);
 *   const { set, undo, save } = useGameStore();
 *
 *   return <div>Health: {health}</div>;
 * }
 * ```
 */

export { temporal } from 'zundo';
export { create, useStore } from 'zustand';
export { immer } from 'zustand/middleware/immer';
export {
    createWebPersistenceAdapter,
    WebPersistenceAdapter,
    webPersistenceAdapter,
} from './adapters/web/persistence';
export type { GameStore, GameStoreActions, GameStoreApi, GameStoreState } from './store';
export { createGameStore, createPersistenceAdapter } from './store';
export type {
    AutoSaveConfig,
    CheckpointData,
    CheckpointOptions,
    PersistenceAdapter,
    SaveData,
    StateChangeEvent,
    StateChangeType,
    StateListener,
    StoreConfig,
} from './types';
export { calculateChecksum, verifyChecksum } from './types';
