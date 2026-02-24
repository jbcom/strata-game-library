import { create } from 'zustand';

/**
 * Types of visual transitions between scenes or modes.
 */
export type TransitionType = 'fade' | 'crossfade' | 'wipe' | 'iris' | 'dissolve' | 'none';

/**
 * Configuration for a transition effect.
 */
export interface TransitionConfig {
  /** The type of visual effect to use. */
  type: TransitionType;
  /** Duration of the transition in seconds. */
  duration: number;
  /** Optional easing function (defaults to linear). */
  easing?: (t: number) => number;
  /** For 'fade', the background color. */
  color?: string;
  /** For 'wipe', the direction of the movement. */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** For 'iris', the screen-space center point [0-1]. */
  center?: [number, number];
  /** Whether the transition is reversed (e.g. fade in vs fade out). */
  reverse?: boolean;
}

/**
 * Public interface for the TransitionManager.
 */
export interface TransitionManager {
  /** Starts a transition with the specified configuration. */
  start: (config: TransitionConfig) => Promise<void>;
  /** Cancels any currently running transition. */
  cancel: () => void;
  /** Whether a transition is currently in progress. */
  isTransitioning: boolean;
  /** Current progress of the transition (0-1). */
  progress: number;
  /** The current transition configuration. */
  config: TransitionConfig | null;
}

/**
 * Internal state for the TransitionManager.
 */
interface TransitionState {
  isTransitioning: boolean;
  progress: number;
  config: TransitionConfig | null;
}

/**
 * Creates a new TransitionManager instance.
 *
 * @returns A TransitionManager instance.
 *
 * @example
 * ```typescript
 * const transitions = createTransitionManager();
 * await transitions.start({ type: 'fade', duration: 0.5, color: 'black' });
 * // Scene change here
 * await transitions.start({ type: 'fade', duration: 0.5, color: 'black', reverse: true });
 * ```
 */
export function createTransitionManager(): TransitionManager {
  const useStore = create<TransitionState>(() => ({
    isTransitioning: false,
    progress: 0,
    config: null,
  }));

  let animationFrameId: number | null = null;

  const manager: TransitionManager = {
    start: (config: TransitionConfig) => {
      return new Promise((resolve) => {
        manager.cancel();

        useStore.setState({
          isTransitioning: true,
          progress: 0,
          config,
        });

        const startTime = performance.now();
        const durationMs = config.duration * 1000;

        const animate = (now: number) => {
          const elapsed = now - startTime;
          let progress = Math.min(elapsed / durationMs, 1);

          if (config.easing) {
            progress = config.easing(progress);
          }

          useStore.setState({ progress });

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
          } else {
            useStore.setState({ isTransitioning: false, progress: 1 });
            animationFrameId = null;
            resolve();
          }
        };

        animationFrameId = requestAnimationFrame(animate);
      });
    },

    cancel: () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      useStore.setState({
        isTransitioning: false,
        progress: 0,
        config: null,
      });
    },

    get isTransitioning() {
      return useStore.getState().isTransitioning;
    },
    get progress() {
      return useStore.getState().progress;
    },
    get config() {
      return useStore.getState().config;
    },
  };

  return manager;
}
