/**
 * Zustand-based Game State Store Factory
 *
 * Production-ready state management with Immer for immutable updates, zundo for
 * undo/redo history, and pluggable persistence adapters for cross-platform storage.
 * Features automatic checksum validation and flexible configuration.
 *
 * @packageDocumentation
 * @module core/state/store
 * @category Game Systems
 *
 * ## Key Features
 * - 🔄 **Immutable Updates**: Powered by Immer for safe state mutations
 * - ↩️ **Time Travel**: Built-in undo/redo with configurable history depth
 * - 💾 **Persistence**: Cross-platform storage adapters (web, native, custom)
 * - 🔒 **Data Integrity**: Automatic checksum validation on load
 * - 📸 **Checkpoints**: Named recovery points for game milestones
 *
 * @example
 * ```typescript
 * // Create a game store
 * interface GameState {
 *   player: { x: number; y: number; health: number };
 *   enemies: Array<{ id: string; health: number }>;
 * }
 *
 * const useGameStore = createGameStore<GameState>({
 *   player: { x: 0, y: 0, health: 100 },
 *   enemies: []
 * }, {
 *   enablePersistence: true,
 *   maxUndoHistory: 50,
 *   storagePrefix: 'mygame'
 * });
 * ```
 *
 * @public
 */

import { type TemporalState, temporal } from 'zundo';
import { create, type StoreApi } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { webPersistenceAdapter } from './adapters/web/persistence';
import type {
  CheckpointData,
  CheckpointOptions,
  PersistenceAdapter,
  SaveData,
  StoreConfig,
} from './types';
import { calculateChecksum, verifyChecksum } from './types';

const DEFAULT_CONFIG = {
  version: 1,
  storagePrefix: 'strata_state',
  maxUndoHistory: 50,
  enablePersistence: true,
  enableUndo: true,
} as const;

/**
 * Internal store state shape.
 * @category Game Systems
 * @internal
 */
export interface GameStoreState<T> {
  /** The current active game state data. */
  data: T;
  /** Snapshot of the initial state for reset operations. */
  _initial: T;
  /** Schema version number for migration support. */
  _version: number;
  /** Timestamp of the last successful save operation. */
  _lastSaved: number | null;
  /** Whether state has changed since last save. */
  _isDirty: boolean;
}

/**
 * Store actions interface.
 *
 * All available operations for manipulating game state, including
 * updates, persistence, undo/redo, and checkpoint management.
 *
 * @category Game Systems
 */
export interface GameStoreActions<T> {
  /** Replace the entire state with a new value or updater function. */
  set: (newState: T | ((prev: T) => T)) => void;
  /** Apply a partial update, merging with current state. */
  patch: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
  /** Revert state to its initial configuration. */
  reset: () => void;
  /** Revert to the previous state in history. */
  undo: () => void;
  /** Reapply a previously undone change. */
  redo: () => void;
  /** Check if undo operation is available. */
  canUndo: () => boolean;
  /** Check if redo operation is available. */
  canRedo: () => boolean;
  /** Clear all undo/redo history. */
  clearHistory: () => void;
  /** Persist current state to storage under a named slot. */
  save: (slot?: string) => Promise<boolean>;
  /** Load state from a storage slot. */
  load: (slot?: string) => Promise<boolean>;
  /** Permanently delete a save slot. */
  deleteSave: (slot: string) => Promise<boolean>;
  /** List all available save slots. */
  listSaves: () => Promise<string[]>;
  /** Create a named checkpoint (recovery point). */
  createCheckpoint: (name: string, options?: CheckpointOptions) => Promise<boolean>;
  /** Restore state from a named checkpoint. */
  restoreCheckpoint: (name: string) => Promise<boolean>;
  /** Delete a specific checkpoint. */
  deleteCheckpoint: (name: string) => Promise<boolean>;
  /** List all active checkpoints with metadata. */
  listCheckpoints: () => CheckpointData<T>[];
  /** Direct access to raw state data (bypasses store wrapper). */
  getData: () => T;
}

/**
 * Complete store type combining state and actions.
 * @category Game Systems
 */
export type GameStore<T> = GameStoreState<T> & GameStoreActions<T>;

/**
 * Store API with temporal state access for undo/redo.
 * @category Game Systems
 */
export interface GameStoreApi<T> {
  /** Call the store as a function to use it as a hook. */
  (): GameStore<T>;
  /** Call with a selector to subscribe to a slice of state. */
  <U>(selector: (state: GameStore<T>) => U): U;
  /** Get current state snapshot without subscribing. */
  getState: () => GameStore<T>;
  /** Update state imperatively (not recommended in React). */
  setState: StoreApi<GameStore<T>>['setState'];
  /** Subscribe to state changes. */
  subscribe: StoreApi<GameStore<T>>['subscribe'];
  /** Access to temporal (undo/redo) state. */
  temporal: StoreApi<TemporalState<GameStore<T>>>;
}

/**
 * Creates a Zustand store with undo/redo and persistence capabilities.
 *
 * The main factory function for creating game state stores. Combines Zustand, Immer,
 * and zundo middleware to provide a complete state management solution with automatic
 * persistence, undo/redo history, and checksum validation.
 *
 * @category Game Systems
 * @public
 * @param initialState - The initial state value (will be deep cloned).
 * @param config - Optional configuration for persistence, undo, and callbacks.
 * @returns A Zustand store with game state management features.
 *
 * @example
 * ```typescript
 * // Basic store
 * interface PlayerState {
 *   health: number;
 *   position: [number, number, number];
 *   inventory: string[];
 * }
 *
 * const usePlayerStore = createGameStore<PlayerState>({
 *   health: 100,
 *   position: [0, 0, 0],
 *   inventory: [],
 * });
 *
 * // In a React component
 * const health = usePlayerStore(state => state.data.health);
 * const { set, undo, redo, save, load } = usePlayerStore();
 *
 * // Update state
 * set({ health: 50, position: [10, 0, 5], inventory: [] });
 *
 * // Undo last change
 * undo();
 *
 * // Save to storage
 * await save('slot1');
 * ```
 *
 * @example
 * ```typescript
 * // Advanced configuration
 * const useGameStore = createGameStore(
 *   { world: {}, player: {} },
 *   {
 *     enablePersistence: true,
 *     maxUndoHistory: 100,
 *     storagePrefix: 'mygame',
 *     persistenceAdapter: customAdapter,
 *     onSave: (success) => {
 *       console.log('Save result:', success);
 *     },
 *     onLoad: (state) => {
 *       console.log('Loaded state:', state);
 *     }
 *   }
 * );
 * ```
 */
export function createGameStore<T extends object>(
  initialState: T,
  config: StoreConfig<T> = {}
): GameStoreApi<T> {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const persistence: PersistenceAdapter = config.persistenceAdapter ?? webPersistenceAdapter;
  const checkpoints = new Map<string, CheckpointData<T>>();

  const clonedInitial = JSON.parse(JSON.stringify(initialState)) as T;

  type State = GameStore<T>;

  const baseStore = create<State>()(
    temporal(
      immer((set, get, api) => ({
        data: JSON.parse(JSON.stringify(initialState)) as T,
        _initial: clonedInitial,
        _version: mergedConfig.version,
        _lastSaved: null,
        _isDirty: false,

        set: (newState: T | ((prev: T) => T)) => {
          set((state) => {
            const currentData = state.data as T;
            const value = typeof newState === 'function' ? newState(currentData) : newState;
            (state as GameStoreState<T>).data = value;
            state._isDirty = true;
          });
        },

        patch: (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
          set((state) => {
            const currentData = state.data as T;
            const value = typeof partial === 'function' ? partial(currentData) : partial;
            Object.assign(state.data as object, value);
            state._isDirty = true;
          });
        },

        reset: () => {
          set((state) => {
            (state as GameStoreState<T>).data = JSON.parse(JSON.stringify(clonedInitial)) as T;
            state._isDirty = false;
          });
        },

        undo: () => {
          const temporalStore = (api as unknown as GameStoreApi<T>).temporal;
          if (temporalStore) {
            temporalStore.getState().undo();
          }
        },

        redo: () => {
          const temporalStore = (api as unknown as GameStoreApi<T>).temporal;
          if (temporalStore) {
            temporalStore.getState().redo();
          }
        },

        canUndo: () => {
          const temporalStore = (api as unknown as GameStoreApi<T>).temporal;
          if (!temporalStore) return false;
          return temporalStore.getState().pastStates.length > 0;
        },

        canRedo: () => {
          const temporalStore = (api as unknown as GameStoreApi<T>).temporal;
          if (!temporalStore) return false;
          return temporalStore.getState().futureStates.length > 0;
        },

        clearHistory: () => {
          const temporalStore = (api as unknown as GameStoreApi<T>).temporal;
          if (temporalStore) {
            temporalStore.getState().clear();
          }
        },

        save: async (slot = 'default') => {
          if (!mergedConfig.enablePersistence) return false;

          const currentState = get();
          const saveData: SaveData<T> = {
            version: currentState._version,
            timestamp: Date.now(),
            state: structuredClone(currentState.data as T),
            checksum: calculateChecksum(currentState.data),
          };

          const key = `${mergedConfig.storagePrefix}_${slot}`;
          const success = await persistence.save(key, saveData);

          if (success) {
            set((state) => {
              state._lastSaved = Date.now();
              state._isDirty = false;
            });
          }

          mergedConfig.onSave?.(success);
          return success;
        },

        load: async (slot = 'default') => {
          if (!mergedConfig.enablePersistence) return false;

          const key = `${mergedConfig.storagePrefix}_${slot}`;
          const saveData = await persistence.load<T>(key);

          if (saveData) {
            // Verify checksum if present
            if (saveData.checksum && !verifyChecksum(saveData.state, saveData.checksum)) {
              console.error(
                `[Security] Checksum mismatch for save slot "${slot}". Data may be corrupted or tampered with.`
              );
              mergedConfig.onLoad?.(null);
              return false;
            }

            set((state) => {
              (state as GameStoreState<T>).data = saveData.state;
              state._version = saveData.version;
              state._lastSaved = saveData.timestamp;
              state._isDirty = false;
            });
            mergedConfig.onLoad?.(saveData.state);
            return true;
          }

          mergedConfig.onLoad?.(null);
          return false;
        },

        deleteSave: async (slot: string) => {
          const key = `${mergedConfig.storagePrefix}_${slot}`;
          return persistence.delete(key);
        },

        listSaves: async () => {
          return persistence.listSaves(mergedConfig.storagePrefix);
        },

        createCheckpoint: async (name: string, options: CheckpointOptions = {}) => {
          const currentState = get();
          const checkpoint: CheckpointData<T> = {
            name,
            description: options.description,
            state: JSON.parse(JSON.stringify(currentState.data)) as T,
            timestamp: Date.now(),
            metadata: options.metadata,
          };

          checkpoints.set(name, checkpoint);

          if (options.persist !== false && mergedConfig.enablePersistence) {
            const key = `${mergedConfig.storagePrefix}_checkpoint_${name}`;
            const saveData: SaveData<T> = {
              version: currentState._version,
              timestamp: checkpoint.timestamp,
              state: checkpoint.state,
            };
            return persistence.save(key, saveData);
          }

          return true;
        },

        restoreCheckpoint: async (name: string) => {
          const checkpoint = checkpoints.get(name);

          if (checkpoint) {
            set((state) => {
              (state as GameStoreState<T>).data = JSON.parse(JSON.stringify(checkpoint.state)) as T;
              state._isDirty = true;
            });
            return true;
          }

          if (mergedConfig.enablePersistence) {
            const key = `${mergedConfig.storagePrefix}_checkpoint_${name}`;
            const saveData = await persistence.load<T>(key);
            if (saveData) {
              set((state) => {
                (state as GameStoreState<T>).data = saveData.state;
                state._isDirty = true;
              });
              return true;
            }
          }

          return false;
        },

        deleteCheckpoint: async (name: string) => {
          checkpoints.delete(name);
          const key = `${mergedConfig.storagePrefix}_checkpoint_${name}`;
          return persistence.delete(key);
        },

        listCheckpoints: () => {
          return Array.from(checkpoints.values());
        },

        getData: () => get().data as T,
      })),
      { limit: mergedConfig.maxUndoHistory }
    )
  );

  const store = baseStore as unknown as GameStoreApi<T>;
  return store;
}

/**
 * Creates a persistence adapter from a custom implementation.
 *
 * @public
 * @param adapter - Custom adapter implementing PersistenceAdapter interface
 * @returns The validated adapter
 *
 * @example
 * ```typescript
 * const customAdapter = createPersistenceAdapter({
 *   save: async (key, data) => { ... },
 *   load: async (key) => { ... },
 *   delete: async (key) => { ... },
 *   listSaves: async (prefix) => { ... },
 *   getSaveInfo: async (key) => { ... },
 * });
 * ```
 */
export function createPersistenceAdapter(adapter: PersistenceAdapter): PersistenceAdapter {
  const requiredMethods = ['save', 'load', 'delete', 'listSaves', 'getSaveInfo'] as const;
  for (const method of requiredMethods) {
    if (typeof adapter[method] !== 'function') {
      throw new Error(`PersistenceAdapter missing required method: ${method}`);
    }
  }
  return adapter;
}
