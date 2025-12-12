/**
 * Game State Persistence and Utility Hooks
 *
 * Hooks for save/load, checkpoints, and autosave functionality.
 *
 * @module components/state/hooks
 */

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { CheckpointData } from '../../core/state';
import { GameStateContext } from './context';
import type {
    GameStateContextValue,
    UseAutoSaveOptions,
    UseAutoSaveReturn,
    UseCheckpointReturn,
    UseSaveLoadOptions,
    UseSaveLoadReturn,
} from './types';

function useGameStateContextInternal<T extends object>(): GameStateContextValue<T> {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('Hook must be used within a GameStateProvider');
    }
    return context as GameStateContextValue<T>;
}

/**
 * Hook for save/load game state to persistent storage.
 *
 * @public
 * @param options - Save/load configuration
 * @returns Save/load functions
 *
 * @example
 * ```tsx
 * const { save, load, listSaves } = useSaveLoad();
 *
 * // Save to default slot
 * await save();
 *
 * // Save to named slot
 * await save('checkpoint-1');
 *
 * // Load from slot
 * await load('checkpoint-1');
 *
 * // List all saves
 * const saves = await listSaves();
 * ```
 */
export function useSaveLoad<T extends object>(
    options: UseSaveLoadOptions = {}
): UseSaveLoadReturn<T> {
    const { store } = useGameStateContextInternal<T>();

    const save = useCallback(
        async (slot: string = 'default') => {
            return store.getState().save(slot);
        },
        [store]
    );

    const load = useCallback(
        async (slot: string = 'default') => {
            return store.getState().load(slot);
        },
        [store]
    );

    const deleteSave = useCallback(
        async (slot: string) => {
            return store.getState().deleteSave(slot);
        },
        [store]
    );

    const listSaves = useCallback(async () => {
        return store.getState().listSaves();
    }, [store]);

    const exportJSON = useCallback(() => {
        return JSON.stringify({
            version: options.version ?? 1,
            timestamp: Date.now(),
            data: store.getState().data,
        });
    }, [store, options.version]);

    const importJSON = useCallback(
        (json: string) => {
            try {
                const parsed = JSON.parse(json);
                if (parsed.data) {
                    store.getState().set(parsed.data);
                    return true;
                }
                return false;
            } catch {
                return false;
            }
        },
        [store]
    );

    return {
        save,
        load,
        deleteSave,
        listSaves,
        exportJSON,
        importJSON,
    };
}

/**
 * Hook for checkpoint save/restore functionality.
 *
 * @public
 * @returns Checkpoint management functions
 *
 * @example
 * ```tsx
 * const { createCheckpoint, restoreCheckpoint, listCheckpoints } = useCheckpoint();
 *
 * // Create named checkpoint
 * await createCheckpoint('before-boss', 'Before the boss fight');
 *
 * // List checkpoints
 * const checkpoints = listCheckpoints();
 *
 * // Restore checkpoint
 * await restoreCheckpoint('before-boss');
 * ```
 */
export function useCheckpoint<T extends object>(): UseCheckpointReturn<T> {
    const { store } = useGameStateContextInternal<T>();

    const createCheckpoint = useCallback(
        async (name: string, description?: string, metadata?: Record<string, unknown>) => {
            return store.getState().createCheckpoint(name, { description, metadata });
        },
        [store]
    );

    const restoreCheckpoint = useCallback(
        async (name: string) => {
            return store.getState().restoreCheckpoint(name);
        },
        [store]
    );

    const deleteCheckpoint = useCallback(
        async (name: string) => {
            return store.getState().deleteCheckpoint(name);
        },
        [store]
    );

    const hasCheckpoint = useCallback(
        (name: string) => {
            const checkpoints = store.getState().listCheckpoints();
            return checkpoints.some((cp: CheckpointData<T>) => cp.name === name);
        },
        [store]
    );

    const listCheckpoints = useCallback(() => {
        return store.getState().listCheckpoints();
    }, [store]);

    return {
        createCheckpoint,
        restoreCheckpoint,
        deleteCheckpoint,
        hasCheckpoint,
        listCheckpoints,
    };
}

/**
 * Hook for automatic state saving at intervals.
 *
 * @public
 * @param options - Autosave configuration
 * @returns Autosave control functions
 *
 * @example
 * ```tsx
 * const { enable, disable, isEnabled, triggerSave } = useAutoSave({
 *   intervalMs: 30000,
 *   onSave: (success) => console.log('Autosave:', success),
 * });
 *
 * // Enable autosave
 * useEffect(() => {
 *   enable();
 *   return () => disable();
 * }, []);
 *
 * // Manually trigger save
 * await triggerSave();
 * ```
 */
export function useAutoSave<T extends object>(options: UseAutoSaveOptions = {}): UseAutoSaveReturn {
    const { store } = useGameStateContextInternal<T>();
    const [isEnabled, setIsEnabled] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const enable = useCallback(() => {
        if (intervalRef.current) return;

        const intervalMs = options.intervalMs ?? 60000;
        intervalRef.current = setInterval(async () => {
            try {
                const success = await store.getState().save('autosave');
                options.onSave?.(success);
            } catch (error) {
                console.error('Auto-save failed:', error);
                options.onSave?.(false);
            }
        }, intervalMs);
        setIsEnabled(true);
    }, [store, options]);

    const disable = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsEnabled(false);
    }, []);

    const triggerSave = useCallback(async () => {
        const success = await store.getState().save('autosave');
        options.onSave?.(success);
    }, [store, options]);

    const loadLatest = useCallback(async () => {
        return store.getState().load('autosave');
    }, [store]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        isEnabled,
        enable,
        disable,
        triggerSave,
        loadLatest,
    };
}
