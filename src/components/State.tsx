/**
 * State Management React Components and Hooks
 * 
 * Provides React integration for the core state management system.
 * @module components/State
 */

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
    useMemo,
    ReactNode,
} from 'react';
import {
    GameState,
    StateManager,
    SaveSystem,
    AutoSave,
    Checkpoint,
    StateChangeEvent,
    CheckpointData,
    AutoSaveConfig,
    StateManagerConfig,
    createGameState,
} from '../core/state';

export interface GameStateContextValue<T extends object> {
    state: T;
    setState: (newState: T) => void;
    patchState: (partial: Partial<T>) => void;
    resetState: () => void;
    undo: () => boolean;
    redo: () => boolean;
    canUndo: boolean;
    canRedo: boolean;
    undoStackSize: number;
    redoStackSize: number;
    gameState: GameState<T>;
}

const GameStateContext = createContext<GameStateContextValue<any> | null>(null);

export interface GameStateProviderProps<T extends object> {
    initialState: T;
    maxUndoSize?: number;
    enableUndo?: boolean;
    onChange?: (event: StateChangeEvent<T>) => void;
    children: ReactNode;
}

export function GameStateProvider<T extends object>({
    initialState,
    maxUndoSize = 50,
    enableUndo = true,
    onChange,
    children,
}: GameStateProviderProps<T>) {
    const gameStateRef = useRef<GameState<T> | null>(null);
    
    if (!gameStateRef.current) {
        gameStateRef.current = createGameState(initialState, { maxUndoSize, enableUndo });
    }
    
    const [state, setLocalState] = useState<T>(gameStateRef.current.get());
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [undoStackSize, setUndoStackSize] = useState(0);
    const [redoStackSize, setRedoStackSize] = useState(0);
    
    useEffect(() => {
        const gameState = gameStateRef.current!;
        
        const unsubscribe = gameState.subscribe((event) => {
            setLocalState(event.currentValue);
            setCanUndo(gameState.canUndo());
            setCanRedo(gameState.canRedo());
            setUndoStackSize(gameState.getUndoStackSize());
            setRedoStackSize(gameState.getRedoStackSize());
            onChange?.(event);
        });
        
        return unsubscribe;
    }, [onChange]);
    
    const setState = useCallback((newState: T) => {
        gameStateRef.current?.set(newState);
    }, []);
    
    const patchState = useCallback((partial: Partial<T>) => {
        gameStateRef.current?.patch(partial);
    }, []);
    
    const resetState = useCallback(() => {
        gameStateRef.current?.reset();
    }, []);
    
    const undo = useCallback(() => {
        return gameStateRef.current?.undo() ?? false;
    }, []);
    
    const redo = useCallback(() => {
        return gameStateRef.current?.redo() ?? false;
    }, []);
    
    const value = useMemo<GameStateContextValue<T>>(() => ({
        state,
        setState,
        patchState,
        resetState,
        undo,
        redo,
        canUndo,
        canRedo,
        undoStackSize,
        redoStackSize,
        gameState: gameStateRef.current!,
    }), [state, setState, patchState, resetState, undo, redo, canUndo, canRedo, undoStackSize, redoStackSize]);
    
    return (
        <GameStateContext.Provider value={value}>
            {children}
        </GameStateContext.Provider>
    );
}

export function useGameState<T extends object>(): GameStateContextValue<T> {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('useGameState must be used within a GameStateProvider');
    }
    return context as GameStateContextValue<T>;
}

export interface UseSaveLoadOptions {
    storagePrefix?: string;
    version?: number;
}

export interface UseSaveLoadReturn<T extends object> {
    save: (slot?: string) => Promise<boolean>;
    load: (slot?: string) => Promise<boolean>;
    deleteSave: (slot?: string) => Promise<boolean>;
    listSaves: () => Promise<string[]>;
    exportJSON: () => string;
    importJSON: (json: string) => boolean;
    getSaveInfo: (slot: string) => Promise<{ timestamp: number; version: number } | null>;
}

export function useSaveLoad<T extends object>(
    options: UseSaveLoadOptions = {}
): UseSaveLoadReturn<T> {
    const { state, setState, gameState } = useGameState<T>();
    const saveSystemRef = useRef<SaveSystem<T>>(new SaveSystem<T>(options));
    
    const save = useCallback(async (slot: string = 'default') => {
        return await saveSystemRef.current.save(state, slot);
    }, [state]);
    
    const load = useCallback(async (slot: string = 'default') => {
        const loaded = await saveSystemRef.current.load(slot);
        if (loaded) {
            setState(loaded);
            return true;
        }
        return false;
    }, [setState]);
    
    const deleteSave = useCallback(async (slot: string = 'default') => {
        return await saveSystemRef.current.delete(slot);
    }, []);
    
    const listSaves = useCallback(async () => {
        return await saveSystemRef.current.listSaves();
    }, []);
    
    const exportJSON = useCallback(() => {
        return saveSystemRef.current.exportToJSON(state);
    }, [state]);
    
    const importJSON = useCallback((json: string) => {
        const imported = saveSystemRef.current.importFromJSON(json);
        if (imported) {
            setState(imported);
            return true;
        }
        return false;
    }, [setState]);
    
    const getSaveInfo = useCallback(async (slot: string) => {
        return await saveSystemRef.current.getSaveInfo(slot);
    }, []);
    
    return {
        save,
        load,
        deleteSave,
        listSaves,
        exportJSON,
        importJSON,
        getSaveInfo,
    };
}

export interface UseUndoReturn {
    undo: () => boolean;
    redo: () => boolean;
    canUndo: boolean;
    canRedo: boolean;
    undoStackSize: number;
    redoStackSize: number;
}

export function useUndo(): UseUndoReturn {
    const { undo, redo, canUndo, canRedo, undoStackSize, redoStackSize } = useGameState();
    
    return {
        undo,
        redo,
        canUndo,
        canRedo,
        undoStackSize,
        redoStackSize,
    };
}

export interface UseCheckpointOptions {
    storagePrefix?: string;
}

export interface UseCheckpointReturn<T extends object> {
    createCheckpoint: (name: string, description?: string, metadata?: Record<string, unknown>) => Promise<boolean>;
    restoreCheckpoint: (name: string) => Promise<boolean>;
    deleteCheckpoint: (name: string) => Promise<boolean>;
    hasCheckpoint: (name: string) => boolean;
    listCheckpoints: () => CheckpointData<T>[];
}

export function useCheckpoint<T extends object>(
    options: UseCheckpointOptions = {}
): UseCheckpointReturn<T> {
    const { state, setState } = useGameState<T>();
    const saveSystemRef = useRef<SaveSystem<T>>(new SaveSystem<T>(options));
    const checkpointRef = useRef<Checkpoint<T>>(new Checkpoint<T>(saveSystemRef.current, options.storagePrefix ?? 'checkpoint'));
    const [, forceUpdate] = useState(0);
    
    const createCheckpoint = useCallback(async (
        name: string,
        description?: string,
        metadata?: Record<string, unknown>
    ) => {
        const success = await checkpointRef.current.create(name, state, { description, metadata });
        forceUpdate(n => n + 1);
        return success;
    }, [state]);
    
    const restoreCheckpoint = useCallback(async (name: string) => {
        const restored = await checkpointRef.current.restore(name);
        if (restored) {
            setState(restored);
            return true;
        }
        return false;
    }, [setState]);
    
    const deleteCheckpoint = useCallback(async (name: string) => {
        const success = await checkpointRef.current.delete(name);
        forceUpdate(n => n + 1);
        return success;
    }, []);
    
    const hasCheckpoint = useCallback((name: string) => {
        return checkpointRef.current.has(name);
    }, []);
    
    const listCheckpoints = useCallback(() => {
        return checkpointRef.current.list();
    }, []);
    
    return {
        createCheckpoint,
        restoreCheckpoint,
        deleteCheckpoint,
        hasCheckpoint,
        listCheckpoints,
    };
}

export interface UseAutoSaveOptions extends Partial<AutoSaveConfig> {
    onSave?: (success: boolean) => void;
}

export interface UseAutoSaveReturn {
    isEnabled: boolean;
    enable: () => void;
    disable: () => void;
    triggerSave: () => void;
    loadLatest: () => Promise<boolean>;
}

export function useAutoSave<T extends object>(
    options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
    const { state, setState } = useGameState<T>();
    const saveSystemRef = useRef<SaveSystem<T>>(new SaveSystem<T>());
    const autoSaveRef = useRef<AutoSave<T>>(new AutoSave<T>(saveSystemRef.current, options));
    const [isEnabled, setIsEnabled] = useState(false);
    
    const enable = useCallback(() => {
        autoSaveRef.current.start(() => state, options.onSave);
        setIsEnabled(true);
    }, [state, options.onSave]);
    
    const disable = useCallback(() => {
        autoSaveRef.current.stop();
        setIsEnabled(false);
    }, []);
    
    const triggerSave = useCallback(() => {
        autoSaveRef.current.triggerSaveOnChange(state);
    }, [state]);
    
    const loadLatest = useCallback(async () => {
        const latest = await autoSaveRef.current.loadLatestAutoSave();
        if (latest) {
            setState(latest);
            return true;
        }
        return false;
    }, [setState]);
    
    useEffect(() => {
        return () => {
            autoSaveRef.current.stop();
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

export interface PersistGateProps {
    loading?: ReactNode;
    storageKey?: string;
    children: ReactNode;
}

export function PersistGate({ loading, storageKey = 'default', children }: PersistGateProps) {
    const { setState } = useGameState();
    const { load } = useSaveLoad();
    const [isHydrated, setIsHydrated] = useState(false);
    
    useEffect(() => {
        let mounted = true;
        
        async function hydrate() {
            try {
                await load(storageKey);
            } catch (error) {
                console.warn('Failed to hydrate state:', error);
            }
            if (mounted) {
                setIsHydrated(true);
            }
        }
        
        hydrate();
        
        return () => {
            mounted = false;
        };
    }, [load, storageKey]);
    
    if (!isHydrated) {
        return <>{loading ?? null}</>;
    }
    
    return <>{children}</>;
}

export interface StateDebuggerProps {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    collapsed?: boolean;
    showUndoHistory?: boolean;
}

export function StateDebugger({
    position = 'bottom-right',
    collapsed: initialCollapsed = true,
    showUndoHistory = false,
}: StateDebuggerProps) {
    const { state, canUndo, canRedo, undoStackSize, redoStackSize } = useGameState();
    const [collapsed, setCollapsed] = useState(initialCollapsed);
    
    const positionStyles: React.CSSProperties = {
        position: 'fixed',
        zIndex: 9999,
        ...(position.includes('top') ? { top: 16 } : { bottom: 16 }),
        ...(position.includes('left') ? { left: 16 } : { right: 16 }),
    };
    
    const containerStyles: React.CSSProperties = {
        ...positionStyles,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        maxWidth: collapsed ? 'auto' : '400px',
        maxHeight: collapsed ? 'auto' : '80vh',
    };
    
    const headerStyles: React.CSSProperties = {
        padding: '8px 12px',
        backgroundColor: 'rgba(100, 100, 100, 0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
    };
    
    const contentStyles: React.CSSProperties = {
        padding: '12px',
        overflowY: 'auto',
        maxHeight: '60vh',
    };
    
    return (
        <div style={containerStyles}>
            <div style={headerStyles} onClick={() => setCollapsed(!collapsed)}>
                <span style={{ fontWeight: 'bold' }}>🎮 State Debugger</span>
                <span>{collapsed ? '▼' : '▲'}</span>
            </div>
            
            {!collapsed && (
                <div style={contentStyles}>
                    <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                        <div style={{ marginBottom: '4px' }}>
                            <span style={{ color: '#888' }}>Undo: </span>
                            <span style={{ color: canUndo ? '#4caf50' : '#666' }}>{undoStackSize}</span>
                            <span style={{ color: '#888' }}> | Redo: </span>
                            <span style={{ color: canRedo ? '#4caf50' : '#666' }}>{redoStackSize}</span>
                        </div>
                    </div>
                    
                    <div>
                        <div style={{ color: '#888', marginBottom: '4px' }}>Current State:</div>
                        <pre style={{
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            color: '#e0e0e0',
                            fontSize: '11px',
                        }}>
                            {JSON.stringify(state, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

export interface StateManagerProviderProps<TStates extends Record<string, object>> {
    config?: StateManagerConfig;
    children: ReactNode;
}

export const StateManagerContext = createContext<StateManager<any> | null>(null);

export function StateManagerProvider<TStates extends Record<string, object>>({
    config,
    children,
}: StateManagerProviderProps<TStates>) {
    const managerRef = useRef<StateManager<TStates> | null>(null);
    
    if (!managerRef.current) {
        managerRef.current = new StateManager<TStates>(config);
    }
    
    return (
        <StateManagerContext.Provider value={managerRef.current}>
            {children}
        </StateManagerContext.Provider>
    );
}

export function useStateManager<TStates extends Record<string, object>>(): StateManager<TStates> {
    const manager = useContext(StateManagerContext);
    if (!manager) {
        throw new Error('useStateManager must be used within a StateManagerProvider');
    }
    return manager as StateManager<TStates>;
}
