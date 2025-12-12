/**
 * Zustand-based Game State Store Factory
 *
 * Creates a Zustand store with Immer for immutable updates, zundo for undo/redo,
 * and configurable persistence adapter for cross-platform storage.
 *
 * @module core/state/store
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
import { calculateChecksum } from './types';

const DEFAULT_CONFIG = {
    version: 1,
    storagePrefix: 'strata_state',
    maxUndoHistory: 50,
    enablePersistence: true,
    enableUndo: true,
} as const;

/**
 * Internal store state shape
 */
export interface GameStoreState<T> {
    data: T;
    _initial: T;
    _version: number;
    _lastSaved: number | null;
    _isDirty: boolean;
}

/**
 * Store actions interface
 */
export interface GameStoreActions<T> {
    set: (newState: T | ((prev: T) => T)) => void;
    patch: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
    reset: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;
    clearHistory: () => void;
    save: (slot?: string) => Promise<boolean>;
    load: (slot?: string) => Promise<boolean>;
    deleteSave: (slot: string) => Promise<boolean>;
    listSaves: () => Promise<string[]>;
    createCheckpoint: (name: string, options?: CheckpointOptions) => Promise<boolean>;
    restoreCheckpoint: (name: string) => Promise<boolean>;
    deleteCheckpoint: (name: string) => Promise<boolean>;
    listCheckpoints: () => CheckpointData<T>[];
    getData: () => T;
}

/**
 * Complete store type
 */
export type GameStore<T> = GameStoreState<T> & GameStoreActions<T>;

/**
 * Store API with temporal state access
 */
export interface GameStoreApi<T> {
    (): GameStore<T>;
    <U>(selector: (state: GameStore<T>) => U): U;
    getState: () => GameStore<T>;
    setState: StoreApi<GameStore<T>>['setState'];
    subscribe: StoreApi<GameStore<T>>['subscribe'];
    temporal: StoreApi<TemporalState<GameStore<T>>>;
}

/**
 * Creates a Zustand store with undo/redo and persistence capabilities.
 *
 * @public
 * @param initialState - The initial state value
 * @param config - Optional configuration
 * @returns A Zustand store with game state management features
 *
 * @example
 * ```typescript
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
 * set({ health: 50 });
 *
 * // Undo last change
 * undo();
 *
 * // Save to storage
 * await save('slot1');
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
                        const value =
                            typeof newState === 'function' ? newState(currentData) : newState;
                        (state as GameStoreState<T>).data = value;
                        state._isDirty = true;
                    });
                },

                patch: (partial: Partial<T> | ((prev: T) => Partial<T>)) => {
                    set((state) => {
                        const currentData = state.data as T;
                        const value =
                            typeof partial === 'function' ? partial(currentData) : partial;
                        Object.assign(state.data as object, value);
                        state._isDirty = true;
                    });
                },

                reset: () => {
                    set((state) => {
                        (state as GameStoreState<T>).data = JSON.parse(
                            JSON.stringify(clonedInitial)
                        ) as T;
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
                            (state as GameStoreState<T>).data = JSON.parse(
                                JSON.stringify(checkpoint.state)
                            ) as T;
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
