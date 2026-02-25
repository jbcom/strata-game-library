/**
 * useStrataScene - Configure a Strata-powered Babylon.js scene.
 *
 * Provides a declarative way to set up common scene features
 * (fog, ambient lighting, physics) for Strata games running
 * on the Babylon.js renderer via Reactylon.
 *
 * The hook resolves configuration with sensible defaults and provides
 * callback functions to apply settings to a Babylon.js Scene instance.
 *
 * @example
 * ```ts
 * import { useStrataScene } from '@strata-game-library/reactylon';
 *
 * function GameScene() {
 *   const { ready, config, applyToScene } = useStrataScene({
 *     fog: { mode: 'exponential', density: 0.01, color: '#c8d8e8' },
 *     ambientLight: { intensity: 0.6, color: '#ffffff' },
 *     physics: { gravity: -9.81 },
 *   });
 *
 *   // Apply to Babylon.js scene when available
 *   useEffect(() => {
 *     if (sceneRef.current) {
 *       applyToScene(sceneRef.current);
 *     }
 *   }, [applyToScene]);
 *
 *   return <>{ready && <World />}</>;
 * }
 * ```
 */

import { useCallback, useMemo } from 'react';

/** Fog configuration for the scene. */
export interface FogConfig {
  mode: 'linear' | 'exponential' | 'exponential2';
  density?: number;
  color?: string;
  near?: number;
  far?: number;
}

/** Ambient light configuration. */
export interface AmbientLightConfig {
  intensity?: number;
  color?: string;
}

/** Physics configuration. */
export interface PhysicsConfig {
  gravity?: number;
  enabled?: boolean;
}

/** Full scene configuration accepted by useStrataScene. */
export interface StrataSceneConfig {
  fog?: FogConfig;
  ambientLight?: AmbientLightConfig;
  physics?: PhysicsConfig;
}

/** Return value from useStrataScene. */
export interface StrataSceneResult {
  /** Whether the scene configuration has been resolved and is ready. */
  ready: boolean;
  /** The resolved configuration with all defaults applied. */
  config: Required<StrataSceneConfig>;
  /**
   * Apply the resolved configuration to a Babylon.js Scene instance.
   *
   * Call this in a useEffect when you have access to the scene:
   * ```ts
   * applyToScene(scene); // sets fog, creates ambient light, configures gravity
   * ```
   *
   * @param scene - A Babylon.js Scene instance (typed as `unknown` to avoid
   *   requiring @babylonjs/core as a direct dependency of this module).
   */
  applyToScene: (scene: unknown) => void;
}

const DEFAULT_CONFIG: Required<StrataSceneConfig> = {
  fog: { mode: 'exponential', density: 0.01, color: '#c8d8e8' },
  ambientLight: { intensity: 0.6, color: '#ffffff' },
  physics: { gravity: -9.81, enabled: true },
};

/**
 * Babylon.js fog mode constants matching BABYLON.Scene.FOGMODE_*.
 * We use the numeric values directly to avoid requiring @babylonjs/core at import time.
 */
const BABYLON_FOG_MODES = {
  linear: 2,       // BABYLON.Scene.FOGMODE_LINEAR
  exponential: 1,  // BABYLON.Scene.FOGMODE_EXP
  exponential2: 3, // BABYLON.Scene.FOGMODE_EXP2
} as const;

/**
 * Parse a hex color string to [r, g, b] floats (0-1).
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) / 255, ((num >> 8) & 0xff) / 255, (num & 0xff) / 255];
}

/**
 * Hook to configure a Strata-powered Babylon.js scene.
 *
 * Merges the provided config with sensible defaults and provides an
 * `applyToScene` callback that configures a Babylon.js Scene instance
 * with fog, ambient lighting, and physics settings.
 */
export function useStrataScene(config: StrataSceneConfig = {}): StrataSceneResult {
  const resolved = useMemo<Required<StrataSceneConfig>>(
    () => ({
      fog: { ...DEFAULT_CONFIG.fog, ...config.fog },
      ambientLight: { ...DEFAULT_CONFIG.ambientLight, ...config.ambientLight },
      physics: { ...DEFAULT_CONFIG.physics, ...config.physics },
    }),
    [config.fog, config.ambientLight, config.physics],
  );

  const applyToScene = useCallback(
    (scene: unknown) => {
      // Use duck typing to apply settings to a Babylon.js Scene instance
      // without requiring @babylonjs/core as a compile-time dependency.
      const s = scene as Record<string, unknown>;
      if (!s || typeof s !== 'object') return;

      // Apply fog
      const fog = resolved.fog;
      s.fogMode = BABYLON_FOG_MODES[fog.mode];
      if (fog.density !== undefined) {
        s.fogDensity = fog.density;
      }
      if (fog.color && typeof s.fogColor === 'object' && s.fogColor !== null) {
        const [r, g, b] = hexToRgb(fog.color);
        const fogColor = s.fogColor as Record<string, unknown>;
        fogColor.r = r;
        fogColor.g = g;
        fogColor.b = b;
      }
      if (fog.near !== undefined) {
        s.fogStart = fog.near;
      }
      if (fog.far !== undefined) {
        s.fogEnd = fog.far;
      }

      // Apply ambient light color
      const ambient = resolved.ambientLight;
      if (typeof s.ambientColor === 'object' && s.ambientColor !== null) {
        const [r, g, b] = hexToRgb(ambient.color ?? '#ffffff');
        const ambientColor = s.ambientColor as Record<string, unknown>;
        ambientColor.r = r * (ambient.intensity ?? 1);
        ambientColor.g = g * (ambient.intensity ?? 1);
        ambientColor.b = b * (ambient.intensity ?? 1);
      }

      // Apply gravity
      const physics = resolved.physics;
      if (physics.enabled && typeof s.gravity === 'object' && s.gravity !== null) {
        const gravity = s.gravity as Record<string, unknown>;
        gravity.x = 0;
        gravity.y = physics.gravity ?? -9.81;
        gravity.z = 0;
      }
    },
    [resolved],
  );

  return { ready: true, config: resolved, applyToScene };
}
