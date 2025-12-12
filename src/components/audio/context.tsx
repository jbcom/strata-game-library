/**
 * Audio Context and Provider
 *
 * React context for audio system management.
 * @module components/audio
 */

import { useRef, useEffect, useMemo, useState, createContext, useContext } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import {
    SoundManager,
    SpatialAudio,
    createSoundManager,
    createSpatialAudio,
    setupAutoUnlock,
} from '../../core/audio';
import type { AudioContextValue, AudioProviderProps } from './types';

const AudioContext = createContext<AudioContextValue | null>(null);

/**
 * Hook to access the audio context within an AudioProvider.
 *
 * @example
 * ```tsx
 * function AudioControlPanel() {
 *   const { soundManager, isReady } = useAudioContext();
 * }
 * ```
 *
 * @returns AudioContextValue with managers and ready state
 * @throws Error if used outside AudioProvider
 */
export function useAudioContext(): AudioContextValue {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudioContext must be used within an AudioProvider');
    }
    return context;
}

/**
 * Hook to get the SoundManager instance (nullable).
 *
 * @returns SoundManager or null if not in context
 */
export function useAudioManager(): SoundManager | null {
    const context = useContext(AudioContext);
    return context?.soundManager ?? null;
}

/**
 * Hook to get the SpatialAudio instance (nullable).
 *
 * @returns SpatialAudio or null if not in context
 */
export function useSpatialAudio(): SpatialAudio | null {
    const context = useContext(AudioContext);
    return context?.spatialAudio ?? null;
}

/**
 * Hook to get the Three.js AudioListener.
 *
 * @returns AudioListener or null if not in context
 */
export function useAudioListener(): THREE.AudioListener | null {
    const context = useContext(AudioContext);
    return context?.listener ?? null;
}

/**
 * Context provider that manages the audio system.
 *
 * @example
 * ```tsx
 * <Canvas>
 *   <AudioProvider masterVolume={0.8}>
 *     <AudioListener />
 *     <AmbientAudio url="/music/background.mp3" autoplay />
 *     <PositionalAudio url="/sfx/waterfall.mp3" position={[10, 0, 5]} />
 *   </AudioProvider>
 * </Canvas>
 * ```
 */
export function AudioProvider({ children, masterVolume = 1 }: AudioProviderProps) {
    const [isReady, setIsReady] = useState(false);
    const { camera } = useThree();
    const soundManagerRef = useRef<SoundManager | null>(null);
    const spatialAudioRef = useRef<SpatialAudio | null>(null);
    const listenerRef = useRef<THREE.AudioListener | null>(null);

    // Initialize audio system once when camera is available
    useEffect(() => {
        soundManagerRef.current = createSoundManager({ masterVolume });

        const listener = new THREE.AudioListener();
        camera.add(listener);
        listenerRef.current = listener;

        spatialAudioRef.current = createSpatialAudio(listener);

        setupAutoUnlock();

        setIsReady(true);

        return () => {
            soundManagerRef.current?.dispose();
            spatialAudioRef.current?.dispose();
            camera.remove(listener);
        };
    }, [camera]); // masterVolume excluded: handled by separate effect to prevent re-initialization

    // Update master volume without re-initializing audio system
    useEffect(() => {
        if (isReady && soundManagerRef.current) {
            soundManagerRef.current.setMasterVolume(masterVolume);
        }
    }, [masterVolume, isReady]);

    const value = useMemo(
        () => ({
            soundManager: soundManagerRef.current,
            spatialAudio: spatialAudioRef.current,
            listener: listenerRef.current,
            isReady,
        }),
        [isReady]
    );

    // Only render children when audio system is ready to prevent null manager access
    if (!isReady || !soundManagerRef.current) return null;

    return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}
