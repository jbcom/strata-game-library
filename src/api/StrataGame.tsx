import { Canvas } from '@react-three/fiber';
import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { AudioListener } from '../components/audio/AudioListener';
import { GameStateProvider } from '../components/state/context';
import type { Game } from '../game/types';

const GameContext = createContext<Game | null>(null);

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error('useGame must be used within a StrataGame');
    return context;
};

interface StrataGameProps {
    game: Game;
    loading?: React.ReactNode;
    error?: React.ComponentType<{ error: Error }>;
    children?: React.ReactNode;
}

export function StrataGame({ game, loading, error: ErrorComponent, children }: StrataGameProps) {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [gameError, setError] = useState<Error | null>(null);

    useEffect(() => {
        game.start()
            .then(() => setStatus('ready'))
            .catch((e) => {
                console.error('Failed to start game:', e);
                setError(e);
                setStatus('error');
            });

        return () => {
            game.stop();
        };
    }, [game]);

    if (status === 'loading') return loading || <div>Loading...</div>;
    if (status === 'error') {
        return ErrorComponent && gameError ? (
            <ErrorComponent error={gameError} />
        ) : (
            <div>Error: {gameError?.message}</div>
        );
    }

    return (
        <GameContext.Provider value={game}>
            <GameStateProvider store={game.store}>
                <Canvas>
                    <AudioListener />

                    {/* Scene Rendering */}
                    <SceneRenderer sceneManager={game.sceneManager} />

                    {/* Mode Rendering */}
                    <ModeRenderer modeManager={game.modeManager} />

                    {children}
                </Canvas>

                {/* UI Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        zIndex: 10,
                    }}
                >
                    <div style={{ pointerEvents: 'auto' }}>
                        <SceneUI sceneManager={game.sceneManager} />
                        <ModeUI modeManager={game.modeManager} />
                        {game.definition.ui?.hud && <game.definition.ui.hud />}
                    </div>
                </div>
            </GameStateProvider>
        </GameContext.Provider>
    );
}

function SceneRenderer({ sceneManager }: { sceneManager: any }) {
    const [current, setCurrent] = useState(sceneManager.current);

    // In a real implementation, we'd subscribe to scene changes
    useEffect(() => {
        // This is a simplified version; real SceneManager should be an EventEmitter or use a store
        const interval = setInterval(() => {
            if (sceneManager.current !== current) {
                setCurrent(sceneManager.current);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [sceneManager, current]);

    if (!current) return null;
    return <>{current.render()}</>;
}

function SceneUI({ sceneManager }: { sceneManager: any }) {
    const [current, setCurrent] = useState(sceneManager.current);

    useEffect(() => {
        const interval = setInterval(() => {
            if (sceneManager.current !== current) {
                setCurrent(sceneManager.current);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [sceneManager, current]);

    if (!current || !current.ui) return null;
    return <>{current.ui()}</>;
}

function ModeRenderer({ modeManager }: { modeManager: any }) {
    const [current, setCurrent] = useState(modeManager.current);

    useEffect(() => {
        const interval = setInterval(() => {
            if (modeManager.current !== current) {
                setCurrent(modeManager.current);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [modeManager, current]);

    if (!current || !current.config.render) return null;
    return <>{current.config.render({ instance: current })}</>;
}

function ModeUI({ modeManager }: { modeManager: any }) {
    const [current, setCurrent] = useState(modeManager.current);

    useEffect(() => {
        const interval = setInterval(() => {
            if (modeManager.current !== current) {
                setCurrent(modeManager.current);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [modeManager, current]);

    if (!current || !current.config.ui) return null;
    const UIComponent = current.config.ui;
    return <UIComponent instance={current} />;
}
