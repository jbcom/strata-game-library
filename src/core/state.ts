/**
 * Core State Management System
 * 
 * Provides game state, save/load, and undo/redo functionality for 3D games.
 * Pure TypeScript implementation with no React dependencies.
 */

export type StateChangeType = 'set' | 'patch' | 'reset' | 'undo' | 'redo';

export interface StateChangeEvent<T> {
    type: StateChangeType;
    key?: string;
    previousValue: T;
    currentValue: T;
    timestamp: number;
}

export type StateListener<T> = (event: StateChangeEvent<T>) => void;

export interface GameStateConfig<T> {
    initialState: T;
    maxUndoSize?: number;
    enableUndo?: boolean;
}

export interface Command<T> {
    execute: () => T;
    undo: () => T;
    description?: string;
    timestamp: number;
}

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

export interface AutoSaveConfig {
    enabled: boolean;
    intervalMs: number;
    maxSlots: number;
    saveOnChange: boolean;
    debounceMs: number;
    storageKey: string;
}

export interface StateManagerConfig {
    storagePrefix?: string;
    version?: number;
    enableCompression?: boolean;
}

export class GameState<T extends object> {
    private state: T;
    private initialState: T;
    private listeners: Set<StateListener<T>> = new Set();
    private undoStack: UndoStack<T>;
    private enableUndo: boolean;

    constructor(config: GameStateConfig<T>) {
        this.initialState = structuredClone(config.initialState);
        this.state = structuredClone(config.initialState);
        this.enableUndo = config.enableUndo ?? true;
        this.undoStack = new UndoStack<T>(config.maxUndoSize ?? 50);
    }

    get(): T {
        return this.state;
    }

    set(newState: T): void {
        const previousValue = structuredClone(this.state);
        this.state = structuredClone(newState);
        
        if (this.enableUndo) {
            this.undoStack.push({
                execute: () => structuredClone(newState),
                undo: () => structuredClone(previousValue),
                timestamp: Date.now(),
            });
        }
        
        this.emit({
            type: 'set',
            previousValue,
            currentValue: this.state,
            timestamp: Date.now(),
        });
    }

    patch(partial: Partial<T>): void {
        const previousValue = structuredClone(this.state);
        this.state = { ...this.state, ...structuredClone(partial) };
        
        if (this.enableUndo) {
            const patchedState = structuredClone(this.state);
            this.undoStack.push({
                execute: () => structuredClone(patchedState),
                undo: () => structuredClone(previousValue),
                timestamp: Date.now(),
            });
        }
        
        this.emit({
            type: 'patch',
            previousValue,
            currentValue: this.state,
            timestamp: Date.now(),
        });
    }

    setProperty<K extends keyof T>(key: K, value: T[K]): void {
        const previousValue = structuredClone(this.state);
        (this.state as T)[key] = structuredClone(value) as T[K];
        
        if (this.enableUndo) {
            const newState = structuredClone(this.state);
            this.undoStack.push({
                execute: () => structuredClone(newState),
                undo: () => structuredClone(previousValue),
                description: `Set ${String(key)}`,
                timestamp: Date.now(),
            });
        }
        
        this.emit({
            type: 'set',
            key: String(key),
            previousValue,
            currentValue: this.state,
            timestamp: Date.now(),
        });
    }

    reset(): void {
        const previousValue = structuredClone(this.state);
        this.state = structuredClone(this.initialState);
        this.undoStack.clear();
        
        this.emit({
            type: 'reset',
            previousValue,
            currentValue: this.state,
            timestamp: Date.now(),
        });
    }

    undo(): boolean {
        const result = this.undoStack.undo();
        if (result !== null) {
            const previousValue = structuredClone(this.state);
            this.state = result;
            
            this.emit({
                type: 'undo',
                previousValue,
                currentValue: this.state,
                timestamp: Date.now(),
            });
            return true;
        }
        return false;
    }

    redo(): boolean {
        const result = this.undoStack.redo();
        if (result !== null) {
            const previousValue = structuredClone(this.state);
            this.state = result;
            
            this.emit({
                type: 'redo',
                previousValue,
                currentValue: this.state,
                timestamp: Date.now(),
            });
            return true;
        }
        return false;
    }

    canUndo(): boolean {
        return this.undoStack.canUndo();
    }

    canRedo(): boolean {
        return this.undoStack.canRedo();
    }

    getUndoStackSize(): number {
        return this.undoStack.getUndoSize();
    }

    getRedoStackSize(): number {
        return this.undoStack.getRedoSize();
    }

    subscribe(listener: StateListener<T>): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private emit(event: StateChangeEvent<T>): void {
        this.listeners.forEach(listener => listener(event));
    }

    toJSON(): T {
        return structuredClone(this.state);
    }

    fromJSON(data: T): void {
        this.set(data);
    }
}

export class UndoStack<T> {
    private undoStack: Command<T>[] = [];
    private redoStack: Command<T>[] = [];
    private maxSize: number;

    constructor(maxSize: number = 50) {
        this.maxSize = maxSize;
    }

    push(command: Command<T>): void {
        this.undoStack.push(command);
        this.redoStack = [];
        
        while (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
    }

    undo(): T | null {
        const command = this.undoStack.pop();
        if (command) {
            this.redoStack.push(command);
            return command.undo();
        }
        return null;
    }

    redo(): T | null {
        const command = this.redoStack.pop();
        if (command) {
            this.undoStack.push(command);
            return command.execute();
        }
        return null;
    }

    canUndo(): boolean {
        return this.undoStack.length > 0;
    }

    canRedo(): boolean {
        return this.redoStack.length > 0;
    }

    getUndoSize(): number {
        return this.undoStack.length;
    }

    getRedoSize(): number {
        return this.redoStack.length;
    }

    clear(): void {
        this.undoStack = [];
        this.redoStack = [];
    }

    getUndoHistory(): string[] {
        return this.undoStack.map(cmd => cmd.description ?? 'Action');
    }

    getRedoHistory(): string[] {
        return this.redoStack.map(cmd => cmd.description ?? 'Action');
    }
}

export class SaveSystem<T extends object> {
    private version: number;
    private storagePrefix: string;
    private enableCompression: boolean;

    constructor(config: StateManagerConfig = {}) {
        this.version = config.version ?? 1;
        this.storagePrefix = config.storagePrefix ?? 'strata_state';
        this.enableCompression = config.enableCompression ?? false;
    }

    async save(state: T, slot: string = 'default'): Promise<boolean> {
        try {
            const saveData: SaveData<T> = {
                version: this.version,
                timestamp: Date.now(),
                state: structuredClone(state),
                checksum: this.calculateChecksum(state),
                compressed: this.enableCompression,
            };

            const jsonString = JSON.stringify(saveData);
            const storageKey = `${this.storagePrefix}_${slot}`;
            
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem(storageKey, jsonString);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Failed to save state:', error);
            return false;
        }
    }

    async load(slot: string = 'default'): Promise<T | null> {
        try {
            const storageKey = `${this.storagePrefix}_${slot}`;
            
            if (typeof localStorage !== 'undefined') {
                const jsonString = localStorage.getItem(storageKey);
                if (!jsonString) return null;
                
                const saveData: SaveData<T> = JSON.parse(jsonString);
                
                if (saveData.checksum && !this.verifyChecksum(saveData.state, saveData.checksum)) {
                    console.warn('Save data checksum mismatch');
                }
                
                return saveData.state;
            }
            
            return null;
        } catch (error) {
            console.error('Failed to load state:', error);
            return null;
        }
    }

    async delete(slot: string = 'default'): Promise<boolean> {
        try {
            const storageKey = `${this.storagePrefix}_${slot}`;
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem(storageKey);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    }

    async listSaves(): Promise<string[]> {
        const saves: string[] = [];
        if (typeof localStorage !== 'undefined') {
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(this.storagePrefix + '_')) {
                    saves.push(key.slice(this.storagePrefix.length + 1));
                }
            }
        }
        return saves;
    }

    async getSaveInfo(slot: string): Promise<{ timestamp: number; version: number } | null> {
        try {
            const storageKey = `${this.storagePrefix}_${slot}`;
            if (typeof localStorage !== 'undefined') {
                const jsonString = localStorage.getItem(storageKey);
                if (!jsonString) return null;
                
                const saveData: SaveData<T> = JSON.parse(jsonString);
                return {
                    timestamp: saveData.timestamp,
                    version: saveData.version,
                };
            }
            return null;
        } catch {
            return null;
        }
    }

    private calculateChecksum(state: T): string {
        const jsonString = JSON.stringify(state);
        let hash = 0;
        for (let i = 0; i < jsonString.length; i++) {
            const char = jsonString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    private verifyChecksum(state: T, checksum: string): boolean {
        return this.calculateChecksum(state) === checksum;
    }

    exportToJSON(state: T): string {
        const saveData: SaveData<T> = {
            version: this.version,
            timestamp: Date.now(),
            state: structuredClone(state),
        };
        return JSON.stringify(saveData, null, 2);
    }

    importFromJSON(jsonString: string): T | null {
        try {
            const saveData: SaveData<T> = JSON.parse(jsonString);
            return saveData.state;
        } catch {
            return null;
        }
    }
}

export class AutoSave<T extends object> {
    private config: AutoSaveConfig;
    private saveSystem: SaveSystem<T>;
    private intervalId: NodeJS.Timeout | null = null;
    private debounceTimeout: NodeJS.Timeout | null = null;
    private currentSlot: number = 0;
    private onSaveCallback?: (success: boolean) => void;

    constructor(saveSystem: SaveSystem<T>, config: Partial<AutoSaveConfig> = {}) {
        this.saveSystem = saveSystem;
        this.config = {
            enabled: config.enabled ?? true,
            intervalMs: config.intervalMs ?? 60000,
            maxSlots: config.maxSlots ?? 3,
            saveOnChange: config.saveOnChange ?? false,
            debounceMs: config.debounceMs ?? 2000,
            storageKey: config.storageKey ?? 'autosave',
        };
    }

    start(getState: () => T, onSave?: (success: boolean) => void): void {
        if (!this.config.enabled) return;
        
        this.onSaveCallback = onSave;
        this.stop();
        
        this.intervalId = setInterval(() => {
            this.performAutoSave(getState());
        }, this.config.intervalMs);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }
    }

    triggerSaveOnChange(state: T): void {
        if (!this.config.enabled || !this.config.saveOnChange) return;
        
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        this.debounceTimeout = setTimeout(() => {
            this.performAutoSave(state);
        }, this.config.debounceMs);
    }

    private async performAutoSave(state: T): Promise<void> {
        const slot = `${this.config.storageKey}_${this.currentSlot}`;
        const success = await this.saveSystem.save(state, slot);
        
        this.currentSlot = (this.currentSlot + 1) % this.config.maxSlots;
        this.onSaveCallback?.(success);
    }

    async loadLatestAutoSave(): Promise<T | null> {
        let latestState: T | null = null;
        let latestTimestamp = 0;
        
        for (let i = 0; i < this.config.maxSlots; i++) {
            const slot = `${this.config.storageKey}_${i}`;
            const info = await this.saveSystem.getSaveInfo(slot);
            
            if (info && info.timestamp > latestTimestamp) {
                const state = await this.saveSystem.load(slot);
                if (state) {
                    latestState = state;
                    latestTimestamp = info.timestamp;
                }
            }
        }
        
        return latestState;
    }

    getConfig(): AutoSaveConfig {
        return { ...this.config };
    }

    updateConfig(config: Partial<AutoSaveConfig>): void {
        this.config = { ...this.config, ...config };
    }

    isRunning(): boolean {
        return this.intervalId !== null;
    }
}

export class Checkpoint<T extends object> {
    private checkpoints: Map<string, CheckpointData<T>> = new Map();
    private saveSystem: SaveSystem<T>;
    private storageKeyPrefix: string;

    constructor(saveSystem: SaveSystem<T>, storageKeyPrefix: string = 'checkpoint') {
        this.saveSystem = saveSystem;
        this.storageKeyPrefix = storageKeyPrefix;
    }

    async create(
        name: string,
        state: T,
        options: { description?: string; metadata?: Record<string, unknown>; persist?: boolean } = {}
    ): Promise<boolean> {
        const checkpoint: CheckpointData<T> = {
            name,
            description: options.description,
            state: structuredClone(state),
            timestamp: Date.now(),
            metadata: options.metadata,
        };
        
        this.checkpoints.set(name, checkpoint);
        
        if (options.persist !== false) {
            return await this.saveSystem.save(state, `${this.storageKeyPrefix}_${name}`);
        }
        
        return true;
    }

    async restore(name: string): Promise<T | null> {
        const checkpoint = this.checkpoints.get(name);
        if (checkpoint) {
            return structuredClone(checkpoint.state);
        }
        
        const loaded = await this.saveSystem.load(`${this.storageKeyPrefix}_${name}`);
        return loaded;
    }

    async delete(name: string): Promise<boolean> {
        this.checkpoints.delete(name);
        return await this.saveSystem.delete(`${this.storageKeyPrefix}_${name}`);
    }

    has(name: string): boolean {
        return this.checkpoints.has(name);
    }

    list(): CheckpointData<T>[] {
        return Array.from(this.checkpoints.values());
    }

    getInfo(name: string): CheckpointData<T> | undefined {
        return this.checkpoints.get(name);
    }

    clear(): void {
        this.checkpoints.clear();
    }

    async loadFromStorage(): Promise<void> {
        const saves = await this.saveSystem.listSaves();
        for (const save of saves) {
            if (save.startsWith(this.storageKeyPrefix + '_')) {
                const name = save.slice(this.storageKeyPrefix.length + 1);
                const state = await this.saveSystem.load(save);
                if (state) {
                    this.checkpoints.set(name, {
                        name,
                        state,
                        timestamp: Date.now(),
                    });
                }
            }
        }
    }
}

export type StateSlot = 'game' | 'player' | 'world' | 'ui' | string;

export class StateManager<TStates extends Record<string, object>> {
    private states: Map<keyof TStates, GameState<TStates[keyof TStates]>> = new Map();
    private saveSystem: SaveSystem<TStates>;
    private autoSave: AutoSave<TStates> | null = null;
    private checkpoints: Checkpoint<TStates>;

    constructor(config: StateManagerConfig = {}) {
        this.saveSystem = new SaveSystem<TStates>(config);
        this.checkpoints = new Checkpoint<TStates>(this.saveSystem);
    }

    registerState<K extends keyof TStates>(
        name: K,
        initialState: TStates[K],
        config?: Omit<GameStateConfig<TStates[K]>, 'initialState'>
    ): GameState<TStates[K]> {
        const gameState = new GameState<TStates[K]>({
            initialState,
            ...config,
        });
        this.states.set(name, gameState as unknown as GameState<TStates[keyof TStates]>);
        return gameState;
    }

    getState<K extends keyof TStates>(name: K): GameState<TStates[K]> | undefined {
        return this.states.get(name) as GameState<TStates[K]> | undefined;
    }

    getAllStates(): TStates {
        const result: Partial<TStates> = {};
        this.states.forEach((state, key) => {
            result[key] = state.get() as TStates[typeof key];
        });
        return result as TStates;
    }

    setAllStates(states: Partial<TStates>): void {
        Object.entries(states).forEach(([key, value]) => {
            const state = this.states.get(key as keyof TStates);
            if (state && value !== undefined) {
                state.set(value as TStates[keyof TStates]);
            }
        });
    }

    async save(slot: string = 'default'): Promise<boolean> {
        return await this.saveSystem.save(this.getAllStates(), slot);
    }

    async load(slot: string = 'default'): Promise<boolean> {
        const loaded = await this.saveSystem.load(slot);
        if (loaded) {
            this.setAllStates(loaded);
            return true;
        }
        return false;
    }

    async listSaves(): Promise<string[]> {
        return await this.saveSystem.listSaves();
    }

    async deleteSave(slot: string): Promise<boolean> {
        return await this.saveSystem.delete(slot);
    }

    async createCheckpoint(
        name: string,
        options?: { description?: string; metadata?: Record<string, unknown>; persist?: boolean }
    ): Promise<boolean> {
        return await this.checkpoints.create(name, this.getAllStates(), options);
    }

    async restoreCheckpoint(name: string): Promise<boolean> {
        const state = await this.checkpoints.restore(name);
        if (state) {
            this.setAllStates(state);
            return true;
        }
        return false;
    }

    getCheckpoints(): CheckpointData<TStates>[] {
        return this.checkpoints.list();
    }

    enableAutoSave(config?: Partial<AutoSaveConfig>, onSave?: (success: boolean) => void): void {
        this.autoSave = new AutoSave<TStates>(this.saveSystem, config);
        this.autoSave.start(() => this.getAllStates(), onSave);
    }

    disableAutoSave(): void {
        this.autoSave?.stop();
        this.autoSave = null;
    }

    isAutoSaveEnabled(): boolean {
        return this.autoSave?.isRunning() ?? false;
    }

    reset(): void {
        this.states.forEach(state => state.reset());
    }

    exportToJSON(): string {
        return this.saveSystem.exportToJSON(this.getAllStates());
    }

    importFromJSON(jsonString: string): boolean {
        const state = this.saveSystem.importFromJSON(jsonString);
        if (state) {
            this.setAllStates(state);
            return true;
        }
        return false;
    }
}

export function createGameState<T extends object>(
    initialState: T,
    config?: Omit<GameStateConfig<T>, 'initialState'>
): GameState<T> {
    return new GameState<T>({ initialState, ...config });
}

export function createStateManager<TStates extends Record<string, object>>(
    config?: StateManagerConfig
): StateManager<TStates> {
    return new StateManager<TStates>(config);
}

export function createSaveSystem<T extends object>(
    config?: StateManagerConfig
): SaveSystem<T> {
    return new SaveSystem<T>(config);
}

export function compressState<T>(state: T): string {
    const jsonString = JSON.stringify(state);
    return btoa(jsonString);
}

export function decompressState<T>(compressed: string): T | null {
    try {
        const jsonString = atob(compressed);
        return JSON.parse(jsonString);
    } catch {
        return null;
    }
}

export function diffStates<T extends object>(prev: T, next: T): Partial<T> {
    const diff: Partial<T> = {};
    const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]) as Set<keyof T>;
    
    allKeys.forEach(key => {
        const prevVal = JSON.stringify(prev[key]);
        const nextVal = JSON.stringify(next[key]);
        if (prevVal !== nextVal) {
            diff[key] = next[key];
        }
    });
    
    return diff;
}

export function mergeStates<T extends object>(base: T, ...patches: Partial<T>[]): T {
    return patches.reduce<T>((result, patch) => ({ ...result, ...patch }) as T, structuredClone(base));
}
