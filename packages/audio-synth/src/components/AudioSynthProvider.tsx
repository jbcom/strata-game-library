/**
 * Audio Synth Provider
 * React context provider for procedural audio synthesis.
 * @packageDocumentation
 * @module components/AudioSynthProvider
 */

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SynthManager } from '../core/SynthManager.js';
import type {
  AudioSynthContextValue,
  ISynthManager,
  SFXPreset,
  SynthManagerConfig,
} from '../core/types.js';

const AudioSynthContext = createContext<AudioSynthContextValue | null>(null);

/**
 * Props for AudioSynthProvider.
 */
export interface AudioSynthProviderProps {
  /** Child components */
  children: ReactNode;
  /** Master volume (0-1) */
  masterVolume?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Auto-initialize on first user interaction */
  autoInit?: boolean;
}

/**
 * Context provider for procedural audio synthesis.
 *
 * Manages the audio engine lifecycle and provides hooks for
 * playing sound effects and background music.
 *
 * @category Audio
 * @example
 * ```tsx
 * function App() {
 *   return (
 *     <AudioSynthProvider masterVolume={0.8}>
 *       <Game />
 *     </AudioSynthProvider>
 *   );
 * }
 * ```
 */
export function AudioSynthProvider({
  children,
  masterVolume = 1,
  debug = false,
  autoInit = true,
}: AudioSynthProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const managerRef = useRef<ISynthManager | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  // Create manager on mount
  useEffect(() => {
    const config: SynthManagerConfig = { masterVolume, debug };
    managerRef.current = new SynthManager(config);

    if (autoInit) {
      // Set up auto-initialization on first user interaction
      const handleInteraction = async () => {
        if (!managerRef.current || isReady) return;

        try {
          if (!initPromiseRef.current) {
            initPromiseRef.current = managerRef.current.init();
          }
          await initPromiseRef.current;
          setIsReady(true);
        } catch (error) {
          if (debug) {
            console.error('[AudioSynth] Failed to initialize:', error);
          }
        }

        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
      };

      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
      document.addEventListener('keydown', handleInteraction);

      return () => {
        document.removeEventListener('click', handleInteraction);
        document.removeEventListener('touchstart', handleInteraction);
        document.removeEventListener('keydown', handleInteraction);
        managerRef.current?.dispose();
      };
    }

    return () => {
      managerRef.current?.dispose();
    };
  }, [autoInit, debug, isReady, masterVolume]);

  // Update master volume
  useEffect(() => {
    if (isReady && managerRef.current) {
      managerRef.current.setMasterVolume(masterVolume);
    }
  }, [masterVolume, isReady]);

  const playSFX = useCallback((preset: SFXPreset | string) => {
    managerRef.current?.playSFX(preset);
  }, []);

  const playMusic = useCallback((patternId: string) => {
    managerRef.current?.playMusic(patternId);
  }, []);

  const stopMusic = useCallback(() => {
    managerRef.current?.stopMusic();
  }, []);

  const setMasterVolume = useCallback((volume: number) => {
    managerRef.current?.setMasterVolume(volume);
  }, []);

  const value = useMemo<AudioSynthContextValue>(
    () => ({
      manager: managerRef.current,
      isReady,
      playSFX,
      playMusic,
      stopMusic,
      setMasterVolume,
    }),
    [isReady, playSFX, playMusic, stopMusic, setMasterVolume]
  );

  return <AudioSynthContext.Provider value={value}>{children}</AudioSynthContext.Provider>;
}

/**
 * Hook to access the audio synth context.
 *
 * @returns AudioSynthContextValue with manager and helper functions
 * @throws Error if used outside AudioSynthProvider
 *
 * @example
 * ```tsx
 * function ShootButton() {
 *   const { playSFX, isReady } = useAudioSynth();
 *
 *   return (
 *     <button
 *       onClick={() => playSFX('gunshot')}
 *       disabled={!isReady}
 *     >
 *       Shoot
 *     </button>
 *   );
 * }
 * ```
 */
export function useAudioSynth(): AudioSynthContextValue {
  const context = useContext(AudioSynthContext);
  if (!context) {
    throw new Error('useAudioSynth must be used within an AudioSynthProvider');
  }
  return context;
}

/**
 * Hook to check if audio is ready.
 *
 * @returns boolean indicating if audio context is initialized
 */
export function useAudioReady(): boolean {
  const context = useContext(AudioSynthContext);
  return context?.isReady ?? false;
}

/**
 * Hook to get the playSFX function directly.
 *
 * @returns playSFX function or no-op if not in context
 */
export function usePlaySFX(): (preset: SFXPreset | string) => void {
  const context = useContext(AudioSynthContext);
  return context?.playSFX ?? (() => {});
}

/**
 * Hook to get the playMusic function directly.
 *
 * @returns playMusic function or no-op if not in context
 */
export function usePlayMusic(): (patternId: string) => void {
  const context = useContext(AudioSynthContext);
  return context?.playMusic ?? (() => {});
}
