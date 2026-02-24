/**
 * State Component Type Definitions
 *
 * Types for React integration with Zustand-based game state management.
 * @module components/state/types
 */

import type { ReactNode } from 'react';
import type {
  AutoSaveConfig,
  CheckpointData,
  GameStore,
  GameStoreApi,
  StateChangeEvent,
  StoreConfig,
} from '../../core/state';

export interface GameStateContextValue<T extends object> {
  store: GameStoreApi<T>;
  /** @deprecated Use `store` instead. Kept for backwards compatibility. */
  useStore: GameStoreApi<T>;
}

export interface GameStateProviderProps<T extends object> {
  store?: GameStoreApi<T>;
  initialState?: T;
  config?: Partial<StoreConfig<T>>;
  onChange?: (event: StateChangeEvent<T>) => void;
  children: ReactNode;
}

export interface UseSaveLoadOptions {
  version?: number;
}

export interface UseSaveLoadReturn<_T extends object> {
  save: (slot?: string) => Promise<boolean>;
  load: (slot?: string) => Promise<boolean>;
  deleteSave: (slot: string) => Promise<boolean>;
  listSaves: () => Promise<string[]>;
  exportJSON: () => string;
  importJSON: (json: string) => boolean;
}

export interface UseUndoReturn {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export interface UseCheckpointReturn<T extends object> {
  createCheckpoint: (
    name: string,
    description?: string,
    metadata?: Record<string, unknown>
  ) => Promise<boolean>;
  restoreCheckpoint: (name: string) => Promise<boolean>;
  deleteCheckpoint: (name: string) => Promise<boolean>;
  hasCheckpoint: (name: string) => boolean;
  listCheckpoints: () => CheckpointData<T>[];
}

export interface UseAutoSaveOptions extends Partial<AutoSaveConfig> {
  onSave?: (success: boolean) => void;
}

export interface UseAutoSaveReturn {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  triggerSave: () => Promise<void>;
  loadLatest: () => Promise<boolean>;
}

export interface PersistGateProps {
  loading?: ReactNode;
  storageKey?: string;
  children: ReactNode;
}

export interface StateDebuggerProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  collapsed?: boolean;
}

export type { GameStoreApi, GameStore, CheckpointData, AutoSaveConfig, StateChangeEvent };
