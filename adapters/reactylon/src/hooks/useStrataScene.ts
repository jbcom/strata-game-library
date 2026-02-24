/**
 * useStrataScene - Configure a Strata-powered Babylon.js scene.
 *
 * Provides a declarative way to set up common scene features
 * (fog, ambient lighting, physics) for Strata games running
 * on the Babylon.js renderer.
 *
 * @example
 * ```ts
 * import { useStrataScene } from '@strata-game-library/reactylon';
 *
 * function GameScene() {
 *   const scene = useStrataScene({
 *     fog: { mode: 'exponential', density: 0.01, color: '#c8d8e8' },
 *     ambientLight: { intensity: 0.6, color: '#ffffff' },
 *     physics: { gravity: -9.81 },
 *   });
 *
 *   return <>{scene.ready && <World />}</>;
 * }
 * ```
 */

import { useMemo } from 'react';

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
  /** Whether the scene has been configured and is ready. */
  ready: boolean;
  /** The resolved configuration. */
  config: Required<StrataSceneConfig>;
}

const DEFAULT_CONFIG: Required<StrataSceneConfig> = {
  fog: { mode: 'exponential', density: 0.01, color: '#c8d8e8' },
  ambientLight: { intensity: 0.6, color: '#ffffff' },
  physics: { gravity: -9.81, enabled: true },
};

/**
 * Hook to configure a Strata-powered Babylon.js scene.
 *
 * Scaffold placeholder: returns a merged config object.
 * The final implementation will apply these settings to the
 * Babylon.js scene instance via Reactylon's scene context.
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

  // TODO: Apply resolved config to the Babylon.js scene via Reactylon context.
  // When Reactylon provides a useScene() hook, this will:
  // 1. Get the scene instance
  // 2. Set scene.fogMode, scene.fogDensity, scene.fogColor
  // 3. Create/update a HemisphericLight for ambient
  // 4. Enable Babylon.js physics engine if config.physics.enabled

  return { ready: true, config: resolved };
}
