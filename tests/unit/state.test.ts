import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
    GameState,
    UndoStack,
    SaveSystem,
    AutoSave,
    Checkpoint,
    StateManager,
    createGameState,
    createStateManager,
    createSaveSystem,
    compressState,
    decompressState,
    diffStates,
    mergeStates,
} from '../../src/core/state';

interface TestState {
    count: number;
    name: string;
    items: string[];
}

const INITIAL_STATE: TestState = {
    count: 0,
    name: 'test',
    items: [],
};

describe('GameState', () => {
    let gameState: GameState<TestState>;

    beforeEach(() => {
        gameState = new GameState<TestState>({
            initialState: INITIAL_STATE,
            maxUndoSize: 10,
            enableUndo: true,
        });
    });

    it('should initialize with initial state', () => {
        expect(gameState.get()).toEqual(INITIAL_STATE);
    });

    it('should set state', () => {
        const newState = { count: 5, name: 'updated', items: ['a'] };
        gameState.set(newState);
        expect(gameState.get()).toEqual(newState);
    });

    it('should patch state', () => {
        gameState.patch({ count: 10 });
        expect(gameState.get().count).toBe(10);
        expect(gameState.get().name).toBe('test');
    });

    it('should set individual property', () => {
        gameState.setProperty('count', 20);
        expect(gameState.get().count).toBe(20);
    });

    it('should reset to initial state', () => {
        gameState.set({ count: 100, name: 'changed', items: ['x', 'y'] });
        gameState.reset();
        expect(gameState.get()).toEqual(INITIAL_STATE);
    });

    it('should undo changes', () => {
        gameState.patch({ count: 1 });
        gameState.patch({ count: 2 });
        gameState.patch({ count: 3 });

        expect(gameState.get().count).toBe(3);

        gameState.undo();
        expect(gameState.get().count).toBe(2);

        gameState.undo();
        expect(gameState.get().count).toBe(1);
    });

    it('should redo changes', () => {
        gameState.patch({ count: 1 });
        gameState.patch({ count: 2 });

        gameState.undo();
        expect(gameState.get().count).toBe(1);

        gameState.redo();
        expect(gameState.get().count).toBe(2);
    });

    it('should report canUndo and canRedo correctly', () => {
        expect(gameState.canUndo()).toBe(false);
        expect(gameState.canRedo()).toBe(false);

        gameState.patch({ count: 1 });
        expect(gameState.canUndo()).toBe(true);
        expect(gameState.canRedo()).toBe(false);

        gameState.undo();
        expect(gameState.canUndo()).toBe(false);
        expect(gameState.canRedo()).toBe(true);
    });

    it('should notify listeners on state change', () => {
        const listener = vi.fn();
        gameState.subscribe(listener);

        gameState.patch({ count: 5 });

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            type: 'patch',
            currentValue: expect.objectContaining({ count: 5 }),
        }));
    });

    it('should unsubscribe listeners', () => {
        const listener = vi.fn();
        const unsubscribe = gameState.subscribe(listener);

        gameState.patch({ count: 1 });
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        gameState.patch({ count: 2 });
        expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should export to JSON', () => {
        gameState.patch({ count: 42, items: ['a', 'b'] });
        const json = gameState.toJSON();
        expect(json).toEqual({ count: 42, name: 'test', items: ['a', 'b'] });
    });

    it('should import from JSON', () => {
        const data = { count: 100, name: 'imported', items: ['x'] };
        gameState.fromJSON(data);
        expect(gameState.get()).toEqual(data);
    });

    it('should respect max undo size', () => {
        const smallState = new GameState<TestState>({
            initialState: INITIAL_STATE,
            maxUndoSize: 3,
        });

        for (let i = 1; i <= 5; i++) {
            smallState.patch({ count: i });
        }

        expect(smallState.getUndoStackSize()).toBeLessThanOrEqual(3);
    });
});

describe('UndoStack', () => {
    let undoStack: UndoStack<number>;

    beforeEach(() => {
        undoStack = new UndoStack<number>(5);
    });

    it('should push and undo commands', () => {
        undoStack.push({
            execute: () => 1,
            undo: () => 0,
            timestamp: Date.now(),
        });

        expect(undoStack.canUndo()).toBe(true);
        expect(undoStack.canRedo()).toBe(false);

        const result = undoStack.undo();
        expect(result).toBe(0);
        expect(undoStack.canUndo()).toBe(false);
        expect(undoStack.canRedo()).toBe(true);
    });

    it('should redo commands', () => {
        undoStack.push({
            execute: () => 1,
            undo: () => 0,
            timestamp: Date.now(),
        });

        undoStack.undo();
        const result = undoStack.redo();
        expect(result).toBe(1);
    });

    it('should clear redo stack on new push', () => {
        undoStack.push({ execute: () => 1, undo: () => 0, timestamp: Date.now() });
        undoStack.push({ execute: () => 2, undo: () => 1, timestamp: Date.now() });

        undoStack.undo();
        expect(undoStack.canRedo()).toBe(true);

        undoStack.push({ execute: () => 3, undo: () => 1, timestamp: Date.now() });
        expect(undoStack.canRedo()).toBe(false);
    });

    it('should respect max size', () => {
        for (let i = 0; i < 10; i++) {
            undoStack.push({
                execute: () => i,
                undo: () => i - 1,
                timestamp: Date.now(),
            });
        }

        expect(undoStack.getUndoSize()).toBe(5);
    });

    it('should clear stack', () => {
        undoStack.push({ execute: () => 1, undo: () => 0, timestamp: Date.now() });
        undoStack.clear();
        expect(undoStack.canUndo()).toBe(false);
        expect(undoStack.canRedo()).toBe(false);
    });

    it('should get undo history', () => {
        undoStack.push({ execute: () => 1, undo: () => 0, description: 'Action 1', timestamp: Date.now() });
        undoStack.push({ execute: () => 2, undo: () => 1, description: 'Action 2', timestamp: Date.now() });

        const history = undoStack.getUndoHistory();
        expect(history).toEqual(['Action 1', 'Action 2']);
    });
});

describe('SaveSystem', () => {
    let saveSystem: SaveSystem<TestState>;
    const mockStorage: Record<string, string> = {};

    beforeEach(() => {
        saveSystem = new SaveSystem<TestState>({
            storagePrefix: 'test_save',
            version: 1,
        });

        vi.stubGlobal('localStorage', {
            getItem: (key: string) => mockStorage[key] ?? null,
            setItem: (key: string, value: string) => { mockStorage[key] = value; },
            removeItem: (key: string) => { delete mockStorage[key]; },
            key: (index: number) => Object.keys(mockStorage)[index] ?? null,
            get length() { return Object.keys(mockStorage).length; },
            clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
        });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    });

    it('should save state', async () => {
        const state: TestState = { count: 10, name: 'saved', items: ['a'] };
        const success = await saveSystem.save(state, 'slot1');
        expect(success).toBe(true);
        expect(mockStorage['test_save_slot1']).toBeDefined();
    });

    it('should load state', async () => {
        const state: TestState = { count: 20, name: 'loaded', items: ['b'] };
        await saveSystem.save(state, 'slot2');

        const loaded = await saveSystem.load('slot2');
        expect(loaded).toEqual(state);
    });

    it('should return null for non-existent save', async () => {
        const loaded = await saveSystem.load('nonexistent');
        expect(loaded).toBeNull();
    });

    it('should delete save', async () => {
        await saveSystem.save({ count: 1, name: 'test', items: [] }, 'todelete');
        const deleted = await saveSystem.delete('todelete');
        expect(deleted).toBe(true);

        const loaded = await saveSystem.load('todelete');
        expect(loaded).toBeNull();
    });

    it('should list saves', async () => {
        await saveSystem.save({ count: 1, name: 'a', items: [] }, 'save_a');
        await saveSystem.save({ count: 2, name: 'b', items: [] }, 'save_b');

        const saves = await saveSystem.listSaves();
        expect(saves).toContain('save_a');
        expect(saves).toContain('save_b');
    });

    it('should get save info', async () => {
        const state: TestState = { count: 5, name: 'info', items: [] };
        await saveSystem.save(state, 'infotest');

        const info = await saveSystem.getSaveInfo('infotest');
        expect(info).toBeDefined();
        expect(info?.version).toBe(1);
        expect(info?.timestamp).toBeDefined();
    });

    it('should export and import JSON', () => {
        const state: TestState = { count: 42, name: 'export', items: ['x', 'y'] };
        const json = saveSystem.exportToJSON(state);
        expect(json).toContain('"count": 42');

        const imported = saveSystem.importFromJSON(json);
        expect(imported).toEqual(state);
    });
});

describe('AutoSave', () => {
    let saveSystem: SaveSystem<TestState>;
    let autoSave: AutoSave<TestState>;
    const mockStorage: Record<string, string> = {};

    beforeEach(() => {
        vi.useFakeTimers();

        vi.stubGlobal('localStorage', {
            getItem: (key: string) => mockStorage[key] ?? null,
            setItem: (key: string, value: string) => { mockStorage[key] = value; },
            removeItem: (key: string) => { delete mockStorage[key]; },
            key: (index: number) => Object.keys(mockStorage)[index] ?? null,
            get length() { return Object.keys(mockStorage).length; },
            clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
        });

        saveSystem = new SaveSystem<TestState>({ storagePrefix: 'autosave_test' });
        autoSave = new AutoSave<TestState>(saveSystem, {
            enabled: true,
            intervalMs: 1000,
            maxSlots: 2,
            saveOnChange: true,
            debounceMs: 100,
            storageKey: 'auto',
        });
    });

    afterEach(() => {
        autoSave.stop();
        vi.useRealTimers();
        vi.unstubAllGlobals();
        Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    });

    it('should start and stop', () => {
        expect(autoSave.isRunning()).toBe(false);
        autoSave.start(() => INITIAL_STATE);
        expect(autoSave.isRunning()).toBe(true);
        autoSave.stop();
        expect(autoSave.isRunning()).toBe(false);
    });

    it('should auto-save on interval', async () => {
        const onSave = vi.fn();
        autoSave.start(() => ({ count: 5, name: 'auto', items: [] }), onSave);

        await vi.advanceTimersByTimeAsync(1000);
        expect(onSave).toHaveBeenCalled();
    });

    it('should trigger save on change with debounce', async () => {
        autoSave.start(() => INITIAL_STATE);

        autoSave.triggerSaveOnChange({ count: 1, name: 'changed', items: [] });
        autoSave.triggerSaveOnChange({ count: 2, name: 'changed', items: [] });
        autoSave.triggerSaveOnChange({ count: 3, name: 'changed', items: [] });

        await vi.advanceTimersByTimeAsync(150);
    });

    it('should get config', () => {
        const config = autoSave.getConfig();
        expect(config.intervalMs).toBe(1000);
        expect(config.maxSlots).toBe(2);
    });

    it('should update config', () => {
        autoSave.updateConfig({ intervalMs: 5000 });
        expect(autoSave.getConfig().intervalMs).toBe(5000);
    });
});

describe('Checkpoint', () => {
    let saveSystem: SaveSystem<TestState>;
    let checkpoint: Checkpoint<TestState>;
    const mockStorage: Record<string, string> = {};

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => mockStorage[key] ?? null,
            setItem: (key: string, value: string) => { mockStorage[key] = value; },
            removeItem: (key: string) => { delete mockStorage[key]; },
            key: (index: number) => Object.keys(mockStorage)[index] ?? null,
            get length() { return Object.keys(mockStorage).length; },
            clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
        });

        saveSystem = new SaveSystem<TestState>({ storagePrefix: 'cp_test' });
        checkpoint = new Checkpoint<TestState>(saveSystem, 'checkpoint');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    });

    it('should create checkpoint', async () => {
        const success = await checkpoint.create('cp1', { count: 10, name: 'cp', items: [] });
        expect(success).toBe(true);
        expect(checkpoint.has('cp1')).toBe(true);
    });

    it('should restore checkpoint', async () => {
        const state: TestState = { count: 50, name: 'restore', items: ['a'] };
        await checkpoint.create('cp2', state);

        const restored = await checkpoint.restore('cp2');
        expect(restored).toEqual(state);
    });

    it('should delete checkpoint', async () => {
        await checkpoint.create('cp3', INITIAL_STATE);
        expect(checkpoint.has('cp3')).toBe(true);

        const deleted = await checkpoint.delete('cp3');
        expect(deleted).toBe(true);
        expect(checkpoint.has('cp3')).toBe(false);
    });

    it('should list checkpoints', async () => {
        await checkpoint.create('cpA', INITIAL_STATE);
        await checkpoint.create('cpB', INITIAL_STATE);

        const list = checkpoint.list();
        expect(list.length).toBe(2);
        expect(list.map(cp => cp.name)).toContain('cpA');
        expect(list.map(cp => cp.name)).toContain('cpB');
    });

    it('should clear all checkpoints', async () => {
        await checkpoint.create('cp1', INITIAL_STATE);
        await checkpoint.create('cp2', INITIAL_STATE);

        checkpoint.clear();
        expect(checkpoint.list().length).toBe(0);
    });

    it('should get checkpoint info', async () => {
        await checkpoint.create('infocp', { count: 99, name: 'info', items: [] }, {
            description: 'Test checkpoint',
            metadata: { level: 5 },
        });

        const info = checkpoint.getInfo('infocp');
        expect(info?.description).toBe('Test checkpoint');
        expect(info?.metadata?.level).toBe(5);
    });
});

describe('StateManager', () => {
    interface TestStates {
        game: { score: number; level: number };
        player: { health: number; name: string };
    }

    let manager: StateManager<TestStates>;
    const mockStorage: Record<string, string> = {};

    beforeEach(() => {
        vi.stubGlobal('localStorage', {
            getItem: (key: string) => mockStorage[key] ?? null,
            setItem: (key: string, value: string) => { mockStorage[key] = value; },
            removeItem: (key: string) => { delete mockStorage[key]; },
            key: (index: number) => Object.keys(mockStorage)[index] ?? null,
            get length() { return Object.keys(mockStorage).length; },
            clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
        });

        manager = new StateManager<TestStates>({ storagePrefix: 'manager_test' });
        manager.registerState('game', { score: 0, level: 1 });
        manager.registerState('player', { health: 100, name: 'Player1' });
    });

    afterEach(() => {
        manager.disableAutoSave();
        vi.unstubAllGlobals();
        Object.keys(mockStorage).forEach(k => delete mockStorage[k]);
    });

    it('should register states', () => {
        const gameState = manager.getState('game');
        expect(gameState).toBeDefined();
        expect(gameState?.get()).toEqual({ score: 0, level: 1 });
    });

    it('should get all states', () => {
        const allStates = manager.getAllStates();
        expect(allStates.game).toEqual({ score: 0, level: 1 });
        expect(allStates.player).toEqual({ health: 100, name: 'Player1' });
    });

    it('should set all states', () => {
        manager.setAllStates({
            game: { score: 100, level: 5 },
            player: { health: 50, name: 'Hero' },
        });

        expect(manager.getState('game')?.get().score).toBe(100);
        expect(manager.getState('player')?.get().health).toBe(50);
    });

    it('should save and load', async () => {
        manager.getState('game')?.patch({ score: 500 });

        const saved = await manager.save('test_slot');
        expect(saved).toBe(true);

        manager.reset();
        expect(manager.getState('game')?.get().score).toBe(0);

        const loaded = await manager.load('test_slot');
        expect(loaded).toBe(true);
        expect(manager.getState('game')?.get().score).toBe(500);
    });

    it('should create and restore checkpoints', async () => {
        manager.getState('game')?.patch({ level: 10 });

        const created = await manager.createCheckpoint('level10', { description: 'Level 10' });
        expect(created).toBe(true);

        manager.getState('game')?.patch({ level: 20 });
        expect(manager.getState('game')?.get().level).toBe(20);

        const restored = await manager.restoreCheckpoint('level10');
        expect(restored).toBe(true);
        expect(manager.getState('game')?.get().level).toBe(10);
    });

    it('should reset all states', () => {
        manager.getState('game')?.patch({ score: 999 });
        manager.getState('player')?.patch({ health: 1 });

        manager.reset();

        expect(manager.getState('game')?.get().score).toBe(0);
        expect(manager.getState('player')?.get().health).toBe(100);
    });

    it('should export and import JSON', () => {
        manager.getState('game')?.patch({ score: 1234 });

        const json = manager.exportToJSON();
        expect(json).toContain('1234');

        manager.reset();
        const imported = manager.importFromJSON(json);
        expect(imported).toBe(true);
        expect(manager.getState('game')?.get().score).toBe(1234);
    });
});

describe('Helper functions', () => {
    describe('createGameState', () => {
        it('should create game state', () => {
            const state = createGameState({ value: 1 });
            expect(state.get()).toEqual({ value: 1 });
        });
    });

    describe('createStateManager', () => {
        it('should create state manager', () => {
            const manager = createStateManager<{ test: { x: number } }>();
            expect(manager).toBeInstanceOf(StateManager);
        });
    });

    describe('createSaveSystem', () => {
        it('should create save system', () => {
            const save = createSaveSystem<{ data: string }>();
            expect(save).toBeInstanceOf(SaveSystem);
        });
    });

    describe('compressState', () => {
        it('should compress state to base64', () => {
            const state = { name: 'test', value: 42 };
            const compressed = compressState(state);
            expect(typeof compressed).toBe('string');
            expect(compressed).not.toContain('{');
        });
    });

    describe('decompressState', () => {
        it('should decompress state from base64', () => {
            const original = { name: 'test', value: 42 };
            const compressed = compressState(original);
            const decompressed = decompressState<typeof original>(compressed);
            expect(decompressed).toEqual(original);
        });

        it('should return null for invalid data', () => {
            const result = decompressState('invalid!@#$');
            expect(result).toBeNull();
        });
    });

    describe('diffStates', () => {
        it('should find differences between states', () => {
            const prev = { a: 1, b: 2, c: 3 };
            const next = { a: 1, b: 5, c: 3 };
            const diff = diffStates(prev, next);
            expect(diff).toEqual({ b: 5 });
        });

        it('should detect new properties', () => {
            const prev = { a: 1 };
            const next = { a: 1, b: 2 } as { a: number; b?: number };
            const diff = diffStates(prev, next as typeof prev);
            expect(diff.b).toBe(2);
        });
    });

    describe('mergeStates', () => {
        it('should merge states', () => {
            const base = { a: 1, b: 2, c: 3 };
            const patch1 = { b: 5 };
            const patch2 = { c: 10 };
            const merged = mergeStates(base, patch1, patch2);
            expect(merged).toEqual({ a: 1, b: 5, c: 10 });
        });

        it('should not mutate base state', () => {
            const base = { a: 1 };
            const patch = { a: 2 };
            mergeStates(base, patch);
            expect(base.a).toBe(1);
        });
    });
});
