/**
 * @module Systems
 * @category Game Systems
 *
 * Game Systems - Core utilities for state management, save/load, and ECS.
 *
 * For React Three Fiber components, use @strata-game-library/r3f.
 */

// Core types
export type {
  CheckpointOptions,
  GameStoreActions,
  GameStoreState,
  PersistenceAdapter,
  SaveData,
  StateChangeType,
  StateListener,
  StoreConfig,
} from '../core';

// Core utilities
export {
  calculateChecksum,
  create,
  createGameStore,
  createPersistenceAdapter,
  createWebPersistenceAdapter,
  immer,
  temporal,
  useStore,
  verifyChecksum,
  webPersistenceAdapter,
} from '../core';
