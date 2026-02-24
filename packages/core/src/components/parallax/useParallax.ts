/**
 * Parallax Background Hook.
 *
 * React hook for managing parallax background state and calculations.
 *
 * @packageDocumentation
 * @module components/parallax/useParallax
 * @category Rendering Pipeline
 */

import { useFrame } from '@react-three/fiber';
import { useCallback, useState } from 'react';
import * as THREE from 'three';
import type { ParallaxLayerConfig, ParallaxState, UseParallaxReturn } from './types';

/**
 * Default parallax state.
 */
const DEFAULT_STATE: ParallaxState = {
  scrollX: 0,
  scrollY: 0,
  timeOfDay: 12,
  elapsedTime: 0,
  weather: 'none',
  weatherIntensity: 0,
};

/**
 * Options for the useParallax hook.
 */
export interface UseParallaxOptions {
  /** Initial scroll position */
  initialScroll?: { x: number; y: number };
  /** Initial time of day */
  initialTimeOfDay?: number;
  /** Enable depth fog */
  enableFog?: boolean;
  /** Fog color */
  fogColor?: THREE.Color | string | number;
  /** Fog density per unit depth */
  fogDensity?: number;
  /** Maximum fog opacity */
  maxFogOpacity?: number;
  /** Auto-advance time of day */
  autoTimeOfDay?: boolean;
  /** Time scale (1 = 1 hour per minute) */
  timeScale?: number;
  /** Multiplier for depth-based speed (default: 0.2) */
  depthSpeedFactor?: number;
}

/**
 * Hook for managing parallax background state.
 *
 * @example
 * ```tsx
 * const { state, setScroll, getLayerOffset } = useParallax({
 *   enableFog: true,
 *   fogDensity: 0.1,
 * });
 *
 * // In your game loop
 * setScroll(playerX, playerY);
 *
 * // For each layer
 * const offset = getLayerOffset(layer.depth);
 * ```
 */
export function useParallax(options: UseParallaxOptions = {}): UseParallaxReturn {
  const {
    initialScroll = { x: 0, y: 0 },
    initialTimeOfDay = 12,
    enableFog = false,
    fogDensity = 0.05,
    maxFogOpacity = 0.8,
    autoTimeOfDay = false,
    timeScale = 1,
    depthSpeedFactor = 0.2,
  } = options;

  const [state, setState] = useState<ParallaxState>({
    ...DEFAULT_STATE,
    scrollX: initialScroll.x,
    scrollY: initialScroll.y,
    timeOfDay: initialTimeOfDay,
  });

  // Update elapsed time and optionally time of day
  useFrame((_, delta) => {
    setState((prev) => {
      const newState = { ...prev, elapsedTime: prev.elapsedTime + delta };

      if (autoTimeOfDay) {
        // Advance time of day
        newState.timeOfDay = (prev.timeOfDay + (delta * timeScale) / 60) % 24;
      }

      return newState;
    });
  });

  // Set scroll position
  const setScroll = useCallback((x: number, y: number) => {
    setState((prev) => ({ ...prev, scrollX: x, scrollY: y }));
  }, []);

  // Set time of day
  const setTimeOfDay = useCallback((time: number) => {
    setState((prev) => ({ ...prev, timeOfDay: time % 24 }));
  }, []);

  // Set weather
  const setWeather = useCallback((weather: ParallaxState['weather'], intensity = 1) => {
    setState((prev) => ({ ...prev, weather, weatherIntensity: intensity }));
  }, []);

  // Calculate layer offset based on depth and scroll speed
  const getLayerOffset = useCallback(
    (depth: number) => {
      // Deeper layers move slower (parallax effect)
      // depth 0 = foreground (moves with camera)
      // depth 10 = far background (barely moves)
      const speedFactor = 1 / (1 + depth * depthSpeedFactor);
      return {
        x: state.scrollX * speedFactor,
        y: state.scrollY * speedFactor * 0.5, // Less vertical parallax
      };
    },
    [state.scrollX, state.scrollY, depthSpeedFactor]
  );

  // Calculate layer opacity with fog effect
  const getLayerOpacity = useCallback(
    (depth: number, baseOpacity = 1): number => {
      if (!enableFog) return baseOpacity;

      // Exponential fog falloff
      const fogAmount = 1 - Math.exp(-depth * fogDensity);
      const fogOpacity = Math.min(fogAmount, maxFogOpacity);

      return baseOpacity * (1 - fogOpacity);
    },
    [enableFog, fogDensity, maxFogOpacity]
  );

  // Calculate layer tint based on time of day
  const getLayerTint = useCallback(
    (config: ParallaxLayerConfig): THREE.Color => {
      if (!config.affectedByDayNight || !config.dayNightColors) {
        if (config.tint) {
          if (config.tint instanceof THREE.Color) return config.tint;
          return new THREE.Color(config.tint);
        }
        return new THREE.Color(0xffffff);
      }

      const { dayNightColors } = config;
      const time = state.timeOfDay;

      // Convert colors
      const dayColor = new THREE.Color(dayNightColors.day);
      const nightColor = new THREE.Color(dayNightColors.night);
      const dawnColor = new THREE.Color(dayNightColors.dawn);
      const duskColor = new THREE.Color(dayNightColors.dusk);

      // Blend based on time
      // 0-5: night, 5-7: dawn, 7-17: day, 17-19: dusk, 19-24: night
      if (time < 5 || time >= 21) {
        return nightColor;
      } else if (time < 7) {
        // Dawn transition
        const t = (time - 5) / 2;
        return dawnColor.clone().lerp(dayColor, t);
      } else if (time < 17) {
        return dayColor;
      } else if (time < 19) {
        // Dusk transition
        const t = (time - 17) / 2;
        return dayColor.clone().lerp(duskColor, t);
      } else {
        // Night transition
        const t = (time - 19) / 2;
        return duskColor.clone().lerp(nightColor, t);
      }
    },
    [state.timeOfDay]
  );

  return {
    state,
    setScroll,
    setTimeOfDay,
    setWeather,
    getLayerOffset,
    getLayerOpacity,
    getLayerTint,
  };
}

/**
 * Calculate the number of repeats needed to fill a viewport.
 */
export function calculateRepeats(
  viewportWidth: number,
  contentWidth: number,
  scrollX: number
): { count: number; startOffset: number } {
  if (contentWidth <= 0) return { count: 1, startOffset: 0 };

  // Calculate how many copies we need to fill the viewport plus buffer
  const count = Math.ceil(viewportWidth / contentWidth) + 2;

  // Calculate the starting offset for seamless scrolling
  const normalizedScroll = ((scrollX % contentWidth) + contentWidth) % contentWidth;
  const startOffset = -normalizedScroll - contentWidth;

  return { count, startOffset };
}
