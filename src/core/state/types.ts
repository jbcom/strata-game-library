/**
 * State Management Type Definitions
 *
 * Pure TypeScript types for Zustand + Immer + zundo state management.
 * Framework-agnostic with adapter pattern for cross-platform persistence.
 *
 * @module core/state/types
 */

import type { TemporalState } from 'zundo';
import type { StoreApi } from 'zustand';

export interface SaveData<T> {
    version: number;
    timestamp: number;
    state: T;
    checksum?: string;
    compressed?: boolean;
}

export interface CheckpointData<T> {
    name: string;
    description?: string;
    state: T;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

export interface PersistenceAdapter {
    save<T>(key: string, data: SaveData<T>): Promise<boolean>;
    load<T>(key: string): Promise<SaveData<T> | null>;
    delete(key: string): Promise<boolean>;
    listSaves(prefix: string): Promise<string[]>;
    getSaveInfo(key: string): Promise<{ timestamp: number; version: number } | null>;
}

export interface StoreConfig<T> {
    name?: string;
    version?: number;
    storagePrefix?: string;
    persistenceAdapter?: PersistenceAdapter;
    maxUndoHistory?: number;
    enablePersistence?: boolean;
    enableUndo?: boolean;
    onSave?: (success: boolean) => void;
    onLoad?: (state: T | null) => void;
    partialize?: (state: T) => Partial<T>;
    equality?: (pastState: T, currentState: T) => boolean;
}

/**
 * Internal store state shape.
 * Note: These types are re-exported from store.ts for the actual implementation.
 * This interface documents the shape for external consumers.
 */
export interface GameStoreState<T> {
    /** Current state data */
    data: T;
    /** Initial state (internal) */
    _initial: T;
    /** Store version (internal) */
    _version: number;
    /** Last save timestamp (internal) */
    _lastSaved: number | null;
    /** Dirty flag (internal) */
    _isDirty: boolean;
}

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

export interface CheckpointOptions {
    description?: string;
    metadata?: Record<string, unknown>;
    persist?: boolean;
}

export type GameStore<T> = GameStoreState<T> & GameStoreActions<T>;

export type GameStoreApi<T> = StoreApi<GameStore<T>> & {
    temporal: StoreApi<TemporalState<GameStore<T>>>;
};

export type StateChangeType = 'set' | 'patch' | 'reset' | 'undo' | 'redo' | 'load';

export interface StateChangeEvent<T> {
    type: StateChangeType;
    key?: string;
    previousValue: T;
    currentValue: T;
    timestamp: number;
}

export type StateListener<T> = (event: StateChangeEvent<T>) => void;

export interface AutoSaveConfig {
    enabled: boolean;
    intervalMs: number;
    maxSlots: number;
    saveOnChange: boolean;
    debounceMs: number;
    storageKey: string;
}

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

export function verifyChecksum<T>(state: T, checksum: string): boolean {
    return calculateChecksum(state) === checksum;
}
