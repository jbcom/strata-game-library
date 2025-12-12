/**
 * State Store Tests
 *
 * Tests for Zustand-based game state store with undo/redo and persistence.
 * Covers ideal, normal, edge, and error cases per STANDARDS.md.
 *
 * @vitest-environment jsdom
 * @module core/state/__tests__/store.test
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameStore, createPersistenceAdapter } from '../store';
import type { PersistenceAdapter } from '../types';

interface TestState {
    count: number;
    name: string;
    items: string[];
}

const initialState: TestState = {
    count: 0,
    name: 'test',
    items: [],
};

describe('createGameStore', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('ideal case - store creation', () => {
        it('creates store with initial state', () => {
            const store = createGameStore(initialState);
            const state = store.getState();

            expect(state.data.count).toBe(0);
            expect(state.data.name).toBe('test');
            expect(state.data.items).toEqual([]);
        });

        it('provides getData() method for easy access', () => {
            const store = createGameStore(initialState);
            const data = store.getState().getData();

            expect(data).toEqual(initialState);
        });
    });

    describe('normal usage - state updates', () => {
        it('updates state via set()', () => {
            const store = createGameStore(initialState);

            store.getState().set({ count: 5, name: 'updated', items: ['a'] });

            expect(store.getState().data.count).toBe(5);
            expect(store.getState().data.name).toBe('updated');
            expect(store.getState().data.items).toEqual(['a']);
        });

        it('updates state via set() with function', () => {
            const store = createGameStore(initialState);

            store.getState().set((prev) => ({ ...prev, count: prev.count + 10 }));

            expect(store.getState().data.count).toBe(10);
        });

        it('patches state via patch()', () => {
            const store = createGameStore(initialState);

            store.getState().patch({ count: 3 });

            expect(store.getState().data.count).toBe(3);
            expect(store.getState().data.name).toBe('test');
        });

        it('patches state via patch() with function', () => {
            const store = createGameStore(initialState);

            store.getState().patch((prev) => ({ items: [...prev.items, 'new'] }));

            expect(store.getState().data.items).toEqual(['new']);
        });

        it('resets state to initial', () => {
            const store = createGameStore(initialState);

            store.getState().set({ count: 100, name: 'changed', items: ['x', 'y'] });
            store.getState().reset();

            expect(store.getState().data).toEqual(initialState);
        });

        it('marks state as dirty after changes', () => {
            const store = createGameStore(initialState);

            expect(store.getState()._isDirty).toBe(false);
            store.getState().patch({ count: 1 });
            expect(store.getState()._isDirty).toBe(true);
        });
    });

    describe('normal usage - undo/redo', () => {
        it('supports undo after state change', async () => {
            const store = createGameStore(initialState);

            store.getState().patch({ count: 5 });
            expect(store.getState().data.count).toBe(5);

            await new Promise((resolve) => setTimeout(resolve, 10));

            store.getState().undo();

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(store.getState().data.count).toBe(0);
        });

        it('supports redo after undo', async () => {
            const store = createGameStore(initialState);

            store.getState().patch({ count: 10 });
            await new Promise((resolve) => setTimeout(resolve, 10));

            store.getState().undo();
            await new Promise((resolve) => setTimeout(resolve, 10));

            store.getState().redo();
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(store.getState().data.count).toBe(10);
        });

        it('reports canUndo correctly', async () => {
            const store = createGameStore(initialState);

            expect(store.getState().canUndo()).toBe(false);

            store.getState().patch({ count: 1 });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(store.getState().canUndo()).toBe(true);
        });

        it('reports canRedo correctly', async () => {
            const store = createGameStore(initialState);

            store.getState().patch({ count: 1 });
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(store.getState().canRedo()).toBe(false);

            store.getState().undo();
            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(store.getState().canRedo()).toBe(true);
        });
    });

    describe('normal usage - persistence', () => {
        it('saves state to storage', async () => {
            const store = createGameStore(initialState);

            store.getState().patch({ count: 42 });
            const success = await store.getState().save('test-slot');

            expect(success).toBe(true);
            expect(store.getState()._isDirty).toBe(false);
            expect(store.getState()._lastSaved).not.toBeNull();
        });

        it('loads state from storage', async () => {
            const store = createGameStore(initialState);

            store.getState().patch({ count: 99 });
            await store.getState().save('load-test');

            store.getState().reset();
            expect(store.getState().data.count).toBe(0);

            const success = await store.getState().load('load-test');

            expect(success).toBe(true);
            expect(store.getState().data.count).toBe(99);
        });

        it('lists saves', async () => {
            const store = createGameStore(initialState, { storagePrefix: 'list-test' });

            await store.getState().save('slot1');
            await store.getState().save('slot2');

            const saves = await store.getState().listSaves();

            expect(saves.length).toBeGreaterThanOrEqual(2);
        });

        it('deletes saves', async () => {
            const store = createGameStore(initialState);

            await store.getState().save('delete-test');
            const deleted = await store.getState().deleteSave('delete-test');

            expect(deleted).toBe(true);
        });
    });

    describe('normal usage - checkpoints', () => {
        it('creates and restores checkpoints', async () => {
            const store = createGameStore(initialState);

            store.getState().patch({ count: 50 });
            await store.getState().createCheckpoint('halfway');

            store.getState().patch({ count: 100 });
            expect(store.getState().data.count).toBe(100);

            const restored = await store.getState().restoreCheckpoint('halfway');

            expect(restored).toBe(true);
            expect(store.getState().data.count).toBe(50);
        });

        it('lists checkpoints', async () => {
            const store = createGameStore(initialState);

            await store.getState().createCheckpoint('cp1');
            await store.getState().createCheckpoint('cp2');

            const checkpoints = store.getState().listCheckpoints();

            expect(checkpoints.length).toBe(2);
            expect(checkpoints.map((c) => c.name)).toContain('cp1');
            expect(checkpoints.map((c) => c.name)).toContain('cp2');
        });

        it('deletes checkpoints', async () => {
            const store = createGameStore(initialState);

            await store.getState().createCheckpoint('to-delete');
            await store.getState().deleteCheckpoint('to-delete');

            const checkpoints = store.getState().listCheckpoints();
            expect(checkpoints.map((c) => c.name)).not.toContain('to-delete');
        });
    });

    describe('edge cases', () => {
        it('handles empty initial state', () => {
            const store = createGameStore({});
            expect(store.getState().data).toEqual({});
        });

        it('handles deeply nested state updates', () => {
            interface NestedState {
                level1: { level2: { level3: { value: number } } };
            }

            const store = createGameStore<NestedState>({
                level1: { level2: { level3: { value: 1 } } },
            });

            store.getState().set({
                level1: { level2: { level3: { value: 999 } } },
            });

            expect(store.getState().data.level1.level2.level3.value).toBe(999);
        });

        it('handles restoring non-existent checkpoint', async () => {
            const store = createGameStore(initialState);

            const restored = await store.getState().restoreCheckpoint('does-not-exist');

            expect(restored).toBe(false);
        });

        it('handles loading non-existent save', async () => {
            const store = createGameStore(initialState);

            const loaded = await store.getState().load('non-existent-save');

            expect(loaded).toBe(false);
        });
    });

    describe('error cases', () => {
        it('handles persistence disabled', async () => {
            const store = createGameStore(initialState, { enablePersistence: false });

            const saved = await store.getState().save();
            expect(saved).toBe(false);

            const loaded = await store.getState().load();
            expect(loaded).toBe(false);
        });
    });
});

describe('createPersistenceAdapter', () => {
    describe('ideal case', () => {
        it('validates and returns a valid adapter', () => {
            const mockAdapter: PersistenceAdapter = {
                save: vi.fn().mockResolvedValue(true),
                load: vi.fn().mockResolvedValue(null),
                delete: vi.fn().mockResolvedValue(true),
                listSaves: vi.fn().mockResolvedValue([]),
                getSaveInfo: vi.fn().mockResolvedValue(null),
            };

            const result = createPersistenceAdapter(mockAdapter);
            expect(result).toBe(mockAdapter);
        });
    });

    describe('error cases', () => {
        it('throws when save method is missing', () => {
            const invalidAdapter = {
                load: vi.fn(),
                delete: vi.fn(),
                listSaves: vi.fn(),
                getSaveInfo: vi.fn(),
            } as unknown as PersistenceAdapter;

            expect(() => createPersistenceAdapter(invalidAdapter)).toThrow(
                'PersistenceAdapter missing required method: save'
            );
        });

        it('throws when load method is missing', () => {
            const invalidAdapter = {
                save: vi.fn(),
                delete: vi.fn(),
                listSaves: vi.fn(),
                getSaveInfo: vi.fn(),
            } as unknown as PersistenceAdapter;

            expect(() => createPersistenceAdapter(invalidAdapter)).toThrow(
                'PersistenceAdapter missing required method: load'
            );
        });
    });
});
