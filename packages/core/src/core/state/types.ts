/**
 * State Management Type Definitions.
 *
 * Framework-agnostic types for managing persistent game state, undo/redo history,
 * and cross-platform storage adapters.
 *
 * @packageDocumentation
 * @module core/state/types
 * @category Game Systems
 */

import type { TemporalState } from 'zundo';
import type { StoreApi } from 'zustand';

/**
 * Encapsulated save data for persistence.
 * @category Game Systems
 */
export interface SaveData<T> {
  /** Store version at time of saving. */
  version: number;
  /** Creation timestamp in milliseconds. */
  timestamp: number;
  /** The actual state object being saved. */
  state: T;
  /** Integrity hash for the state data. */
  checksum?: string;
  /** Whether the state data is compressed. */
  compressed?: boolean;
}

/**
 * Named state snapshot for recovery.
 * @category Game Systems
 */
export interface CheckpointData<T> {
  /** Unique name for the checkpoint. */
  name: string;
  /** Optional detailed description. */
  description?: string;
  /** The captured state object. */
  state: T;
  /** Creation timestamp. */
  timestamp: number;
  /** Optional arbitrary metadata. */
  metadata?: Record<string, unknown>;
}

/**
 * Interface for cross-platform storage backends.
 * @category Game Systems
 */
export interface PersistenceAdapter {
  /** Persist state data to storage. */
  save<T>(key: string, data: SaveData<T>): Promise<boolean>;
  /** Retrieve state data from storage. */
  load<T>(key: string): Promise<SaveData<T> | null>;
  /** Permanently remove a save from storage. */
  delete(key: string): Promise<boolean>;
  /** List all available save keys with a specific prefix. */
  listSaves(prefix: string): Promise<string[]>;
  /** Get basic info about a save without loading the full state. */
  getSaveInfo(key: string): Promise<{ timestamp: number; version: number } | null>;
}

/**
 * Configuration for creating a game store.
 * @category Game Systems
 */
export interface StoreConfig<T> {
  /** Name of the store for debugging. */
  name?: string;
  /** Current version of the state schema. */
  version?: number;
  /** Key prefix for persistent storage. */
  storagePrefix?: string;
  /** Backend adapter for persistence. */
  persistenceAdapter?: PersistenceAdapter;
  /** Maximum number of undo steps to retain. */
  maxUndoHistory?: number;
  /** Whether to enable persistence features. */
  enablePersistence?: boolean;
  /** Whether to enable undo/redo history. */
  enableUndo?: boolean;
  /** Callback fired after a successful save. */
  onSave?: (success: boolean) => void;
  /** Callback fired after a state load attempt. */
  onLoad?: (state: T | null) => void;
  /** Function to select which parts of state to persist. */
  partialize?: (state: T) => Partial<T>;
  /** Custom equality function for state change detection. */
  equality?: (pastState: T, currentState: T) => boolean;
}

/**
 * Internal store state shape.
 * @category Game Systems
 */
export interface GameStoreState<T> {
  /** Current active state data. */
  data: T;
  /** The original state at time of creation. */
  _initial: T;
  /** Incremental version of the state schema. */
  _version: number;
  /** Timestamp of the last successful save. */
  _lastSaved: number | null;
  /** Whether state has changed since the last save. */
  _isDirty: boolean;
}

/**
 * Core actions for manipulating game state.
 * @category Game Systems
 */
export interface GameStoreActions<T> {
  /** Completely replace the current state. */
  set: (newState: T | ((prev: T) => T)) => void;
  /** Apply a partial update to the current state. */
  patch: (partial: Partial<T> | ((prev: T) => Partial<T>)) => void;
  /** Revert state to its initial configuration. */
  reset: () => void;

  /** Undo the last state change. */
  undo: () => void;
  /** Redo the previously undone change. */
  redo: () => void;
  /** Whether an undo operation is possible. */
  canUndo: () => boolean;
  /** Whether a redo operation is possible. */
  canRedo: () => boolean;
  /** Purge all undo/redo history. */
  clearHistory: () => void;

  /** Persist current state to a storage slot. */
  save: (slot?: string) => Promise<boolean>;
  /** Load state from a storage slot. */
  load: (slot?: string) => Promise<boolean>;
  /** Delete a save slot from storage. */
  deleteSave: (slot: string) => Promise<boolean>;
  /** List all active save slots. */
  listSaves: () => Promise<string[]>;

  /** Create a named recovery point in memory. */
  createCheckpoint: (name: string, options?: CheckpointOptions) => Promise<boolean>;
  /** Restore state from a named checkpoint. */
  restoreCheckpoint: (name: string) => Promise<boolean>;
  /** Permanently remove a checkpoint. */
  deleteCheckpoint: (name: string) => Promise<boolean>;
  /** List all active checkpoints. */
  listCheckpoints: () => CheckpointData<T>[];

  /** Access the raw state data. */
  getData: () => T;
}

/**
 * Configuration options for checkpoints.
 * @category Game Systems
 */
export interface CheckpointOptions {
  /** Optional detailed description. */
  description?: string;
  /** Arbitrary metadata to attach. */
  metadata?: Record<string, unknown>;
  /** Whether to also persist this checkpoint to storage. */
  persist?: boolean;
}

/**
 * Combined type representing a full game store.
 * @category Game Systems
 */
export type GameStore<T> = GameStoreState<T> & GameStoreActions<T>;

/**
 * Underlying Zustand API for the game store.
 * @category Game Systems
 */
export type GameStoreApi<T> = StoreApi<GameStore<T>> & {
  /** Interface for time-travel state manipulation. */
  temporal: StoreApi<TemporalState<GameStore<T>>>;
};

/**
 * Valid types of state change operations.
 * @category Game Systems
 */
export type StateChangeType = 'set' | 'patch' | 'reset' | 'undo' | 'redo' | 'load';

/**
 * Metadata describing a state change event.
 * @category Game Systems
 */
export interface StateChangeEvent<T> {
  /** The operation that triggered the change. */
  type: StateChangeType;
  /** Optional key identifying which part of state changed. */
  key?: string;
  /** State value before the change. */
  previousValue: T;
  /** State value after the change. */
  currentValue: T;
  /** Event timestamp. */
  timestamp: number;
}

/**
 * Function signature for state change listeners.
 * @category Game Systems
 */
export type StateListener<T> = (event: StateChangeEvent<T>) => void;

/**
 * Configuration for the automatic save system.
 * @category Game Systems
 */
export interface AutoSaveConfig {
  /** Whether autosave is enabled. */
  enabled: boolean;
  /** Interval in milliseconds between saves. */
  intervalMs: number;
  /** Maximum number of autosave slots to cycle through. */
  maxSlots: number;
  /** Whether to trigger a save immediately on every state change. */
  saveOnChange: boolean;
  /** Wait time after a change before autosaving. */
  debounceMs: number;
  /** Unique key for identifying autosave data in storage. */
  storageKey: string;
}

/**
 * Generate a hash checksum for a state object.
 * @category Game Systems
 */
export function calculateChecksum<T>(state: T): string {
  const jsonString = JSON.stringify(state);
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

/**
 * Validate a state object against a checksum.
 * @category Game Systems
 */
export function verifyChecksum<T>(state: T, checksum: string): boolean {
  return calculateChecksum(state) === checksum;
}
