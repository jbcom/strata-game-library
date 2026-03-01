/**
 * React hook for persistent game storage via the Capacitor plugin.
 *
 * Provides save/load/delete/list/clear operations for game data with
 * namespace isolation, loading state tracking, and error handling.
 * Uses localStorage on web and native platform storage on iOS/Android.
 *
 * @module useStorage
 * @category Player Experience
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import type { StorageOptions, StorageResult } from '../definitions.js';
import { Strata } from '../index.js';

/**
 * React hook for using Strata's persistent storage API.
 * Provides a convenient interface for saving and loading game data.
 *
 * @param namespace Optional namespace to isolate game data (default: 'strata')
 * @returns Storage utilities for get, set, remove, and clear operations
 *
 * @example
 * ```tsx
 * function GameComponent() {
 *   const { saveGame, loadGame } = useStorage('mygame');
 *
 *   const handleSave = async () => {
 *     await saveGame('progress', { level: 5, score: 1000 });
 *   };
 *
 *   const handleLoad = async () => {
 *     const { value } = await loadGame<{ level: number; score: number }>('progress');
 *     if (value) {
 *       console.log(`Resuming at level ${value.level}`);
 *     }
 *   };
 * }
 * ```
 */
export function useStorage(namespace = 'strata') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const pendingOps = useRef(0);

  const options: StorageOptions = useMemo(() => ({ namespace }), [namespace]);

  const startOperation = useCallback(() => {
    pendingOps.current++;
    setLoading(true);
    setError(null);
  }, []);

  const endOperation = useCallback(() => {
    pendingOps.current--;
    if (pendingOps.current === 0) {
      setLoading(false);
    }
  }, []);

  const normalizeError = useCallback((e: unknown): Error => {
    return e instanceof Error ? e : new Error(String(e));
  }, []);

  /**
   * Save game data to persistent storage.
   */
  const saveGame = useCallback(
    async <T = unknown>(key: string, value: T): Promise<void> => {
      startOperation();
      try {
        await Strata.setItem(key, value, options);
      } catch (e) {
        const err = normalizeError(e);
        setError(err);
        throw err;
      } finally {
        endOperation();
      }
    },
    [options, startOperation, endOperation, normalizeError]
  );

  /**
   * Load game data from persistent storage.
   */
  const loadGame = useCallback(
    async <T = unknown>(key: string): Promise<StorageResult<T>> => {
      startOperation();
      try {
        const result = await Strata.getItem<T>(key, options);
        return result;
      } catch (e) {
        setError(normalizeError(e));
        return { value: null, exists: false };
      } finally {
        endOperation();
      }
    },
    [options, startOperation, endOperation, normalizeError]
  );

  /**
   * Delete a specific key from storage.
   */
  const deleteGame = useCallback(
    async (key: string): Promise<void> => {
      startOperation();
      try {
        await Strata.removeItem(key, options);
      } catch (e) {
        const err = normalizeError(e);
        setError(err);
        throw err;
      } finally {
        endOperation();
      }
    },
    [options, startOperation, endOperation, normalizeError]
  );

  /**
   * Get all save keys in the namespace.
   */
  const listSaves = useCallback(async (): Promise<string[]> => {
    startOperation();
    try {
      const { keys } = await Strata.keys(options);
      return keys;
    } catch (e) {
      setError(normalizeError(e));
      return [];
    } finally {
      endOperation();
    }
  }, [options, startOperation, endOperation, normalizeError]);

  /**
   * Clear all game data in the namespace.
   */
  const clearAllSaves = useCallback(async (): Promise<void> => {
    startOperation();
    try {
      await Strata.clear(options);
    } catch (e) {
      const err = normalizeError(e);
      setError(err);
      throw err;
    } finally {
      endOperation();
    }
  }, [options, startOperation, endOperation, normalizeError]);

  return {
    saveGame,
    loadGame,
    deleteGame,
    listSaves,
    clearAllSaves,
    loading,
    error,
  };
}
