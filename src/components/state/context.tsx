/**
 * Game State React Context and Core Hooks
 *
 * Provides React integration for Zustand-based game state management.
 * Uses the store directly without shadow copies.
 *
 * @module components/state/context
 */

import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { GameStore, GameStoreApi } from '../../core/state';
import { createGameStore } from '../../core/state';
import type {
    GameStateContextValue,
    GameStateProviderProps,
    PersistGateProps,
    StateDebuggerProps,
} from './types';

export const GameStateContext = createContext<GameStateContextValue<any> | null>(null);

/**
 * Provides game state context to child components.
 *
 * Accepts either a pre-created store or creates one from initialState.
 *
 * @category Game Systems
 * @param props - Provider configuration.
 * @returns React context provider.
 *
 * @example
 * ```tsx
 * <GameStateProvider initialState={{ health: 100 }}>
 *   <App />
 * </GameStateProvider>
 * ```
 */
export function GameStateProvider<T extends object>({
    store: externalStore,
    initialState,
    config,
    onChange,
    children,
}: GameStateProviderProps<T>): React.ReactElement {
    const storeRef = useRef<GameStoreApi<T> | null>(null);

    if (!storeRef.current) {
        if (externalStore) {
            storeRef.current = externalStore;
        } else if (initialState) {
            storeRef.current = createGameStore(initialState, config);
        } else {
            throw new Error('GameStateProvider requires either store or initialState prop');
        }
    }

    useEffect(() => {
        if (!onChange) return;

        const store = storeRef.current;
        if (!store) return;
        const unsubscribe = store.subscribe((newState, prevState) => {
            if (newState.data !== prevState.data) {
                onChange({
                    type: 'set',
                    previousValue: prevState.data,
                    currentValue: newState.data,
                    timestamp: Date.now(),
                });
            }
        });

        return unsubscribe;
    }, [onChange]);

    // Store reference is stable and set once, so empty deps is safe
    const value = useMemo<GameStateContextValue<T>>(() => {
        const store = storeRef.current;
        if (!store) {
            throw new Error('GameStateProvider: store not initialized');
        }
        return {
            store,
            // Kept for backwards compatibility
            useStore: store,
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <GameStateContext.Provider value={value}>{children}</GameStateContext.Provider>;
}

/**
 * Access the game state store from context.
 *
 * @category Game Systems
 * @returns The game store API.
 */
export function useGameStateContext<T extends object>(): GameStateContextValue<T> {
    const context = useContext(GameStateContext);
    if (!context) {
        throw new Error('useGameStateContext must be used within a GameStateProvider');
    }
    return context as GameStateContextValue<T>;
}

/**
 * Subscribe to game state with an optional selector.
 *
 * @category Game Systems
 * @param selector - Optional function to select a slice of state.
 * @returns Selected state value or full store state.
 */
export function useGameState<T extends object, U = GameStore<T>>(
    selector?: (state: GameStore<T>) => U
): U {
    const { store } = useGameStateContext<T>();
    if (selector) {
        return store(selector);
    }
    return store() as unknown as U;
}

/**
 * Hook for undo/redo functionality.
 *
 * @category Game Systems
 * @returns Undo/redo functions and state.
 */
export function useUndo<T extends object>() {
    const { store } = useGameStateContext<T>();
    // Get stable function references once
    const { undo, redo } = store.getState();
    // Subscribe only to undo/redo availability, not entire state
    const canUndo = store((s) => s.canUndo());
    const canRedo = store((s) => s.canRedo());

    return { undo, redo, canUndo, canRedo };
}

/**
 * Gate component that waits for state hydration before rendering children.
 *
 * @category Game Systems
 * @param props - Gate configuration.
 * @returns Loading indicator or children after hydration.
 */
export function PersistGate({
    loading,
    storageKey = 'default',
    children,
}: PersistGateProps): React.ReactElement {
    const { store } = useGameStateContext();
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function hydrate() {
            try {
                await store.getState().load(storageKey);
            } catch (error) {
                // Log error but start with fresh state
                console.error('Failed to hydrate state from storage:', error);
            }
            if (mounted) {
                setIsHydrated(true);
            }
        }

        hydrate();

        return () => {
            mounted = false;
        };
    }, [store, storageKey]);

    if (!isHydrated) {
        return <>{loading ?? null}</>;
    }

    return <>{children}</>;
}

/**
 * Debug panel for inspecting current game state.
 *
 * @category Game Systems
 * @param props - Debugger configuration.
 * @returns Debug overlay component.
 */
export function StateDebugger({
    position = 'bottom-right',
    collapsed: initialCollapsed = true,
}: StateDebuggerProps): React.ReactElement {
    const { store } = useGameStateContext();
    const state = store();
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
            <button
                type="button"
                style={{
                    ...headerStyles,
                    border: 'none',
                    width: '100%',
                    textAlign: 'left',
                    font: 'inherit',
                }}
                onClick={() => setCollapsed(!collapsed)}
            >
                <span style={{ fontWeight: 'bold' }}>State Debugger</span>
                <span>{collapsed ? '▼' : '▲'}</span>
            </button>

            {!collapsed && (
                <div style={contentStyles}>
                    <div
                        style={{
                            marginBottom: '12px',
                            padding: '8px',
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                        }}
                    >
                        <div style={{ marginBottom: '4px' }}>
                            <span style={{ color: '#888' }}>Undo: </span>
                            <span style={{ color: state.canUndo() ? '#4caf50' : '#666' }}>
                                {state.canUndo() ? 'available' : 'none'}
                            </span>
                            <span style={{ color: '#888' }}> | Redo: </span>
                            <span style={{ color: state.canRedo() ? '#4caf50' : '#666' }}>
                                {state.canRedo() ? 'available' : 'none'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <div style={{ color: '#888', marginBottom: '4px' }}>Current Data:</div>
                        <pre
                            style={{
                                margin: 0,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                color: '#e0e0e0',
                                fontSize: '11px',
                            }}
                        >
                            {JSON.stringify(state.data, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
