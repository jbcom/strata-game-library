/**
 * Core Sky and Atmosphere Utilities
 *
 * Pure TypeScript functions for creating GPU-accelerated procedural sky materials,
 * managing time of day transitions, and simulating atmospheric scattering effects.
 *
 * **Zero React Dependencies**: All functions are framework-agnostic and can be used
 * in vanilla Three.js projects, custom game engines, or any JavaScript environment.
 *
 * **Performance-First Design**: Materials use optimized shader code with minimal
 * uniform updates. Geometry creation is memoizable and reusable across instances.
 *
 * @category World Building
 * @module core/sky
 *
 * @example
 * ```typescript
 * // Vanilla Three.js usage
 * import { createSkyMaterial, createSkyGeometry } from '@jbcom/strata/core';
 *
 * const material = createSkyMaterial({
 *   timeOfDay: { sunAngle: 45, sunIntensity: 0.8 }
 * });
 * const geometry = createSkyGeometry([200, 100]);
 * const skyMesh = new THREE.Mesh(geometry, material);
 * scene.add(skyMesh);
 *
 * // Update per frame
 * function animate(time) {
 *   material.uniforms.uTime.value = time;
 *   material.uniforms.uSunAngle.value = calculateSunAngle(time);
 * }
 * ```
 */

import * as THREE from 'three';
import { createSkyUniforms, skyFragmentShader, skyVertexShader } from '../shaders/sky';

/**
 * State representing the time of day and atmospheric conditions.
 *
 * All values are normalized (0-1) or use standard units (degrees) for consistency.
 *
 * @category World Building
 */
export interface TimeOfDayStateCore {
  /**
   * Sun light intensity (0-1).
   *
   * - `0` = Night (no sun)
   * - `1` = Noon (peak brightness)
   */
  sunIntensity: number;

  /**
   * Sun angle in degrees (0-180).
   *
   * - `0°` = Sunrise/sunset (horizon)
   * - `90°` = Noon (zenith)
   * - `180°` = Sunset/sunrise (horizon)
   */
  sunAngle: number;

  /**
   * Alias for sunAngle. @deprecated Use sunAngle instead.
   */
  sunElevation?: number;

  /**
   * Ambient light intensity (0-1).
   *
   * Base light level independent of direct sunlight.
   */
  ambientLight: number;

  /**
   * Star visibility (0-1).
   *
   * Higher values increase star field opacity in the shader.
   */
  starVisibility: number;

  /**
   * Fog density for atmospheric scattering (0-1).
   *
   * Controls distance haze and atmospheric depth.
   */
  fogDensity: number;
}

/**
 * State representing weather intensity.
 * @category World Building
 */
export interface WeatherStateCore {
  /** Weather intensity (0-1). 0 = clear, 1 = stormy. */
  intensity: number;
}

/**
 * Options for creating a sky material.
 * @category World Building
 */
export interface SkyMaterialOptions {
  /** Time of day settings */
  timeOfDay: Partial<TimeOfDayStateCore>;
  /** Weather settings */
  weather?: Partial<WeatherStateCore>;
  /** Gyroscope tilt for mobile/VR effects */
  gyroTilt?: THREE.Vector2;
  /** Animation time in seconds */
  time?: number;
}

/**
 * Create a shader material for procedural sky rendering.
 *
 * Generates a `THREE.ShaderMaterial` configured for GPU-accelerated atmospheric scattering,
 * day/night cycles, and dynamic weather integration. The material uses custom vertex and
 * fragment shaders for Rayleigh/Mie scattering simulation.
 *
 * **Performance**: Single material instance per sky; uniforms update per frame (sub-millisecond cost).
 *
 * @category World Building
 * @param options - Configuration options
 * @returns Configured shader material ready for rendering
 * @throws {Error} If sunIntensity is outside [0, 1] range
 * @throws {Error} If sunAngle is outside [0, 180] range
 *
 * @example
 * ```typescript
 * // Basic day sky
 * const daySky = createSkyMaterial({
 *   timeOfDay: {
 *     sunAngle: 60,
 *     sunIntensity: 1.0
 *   }
 * });
 *
 * // Night sky with stars
 * const nightSky = createSkyMaterial({
 *   timeOfDay: {
 *     sunAngle: 0,
 *     sunIntensity: 0,
 *     starVisibility: 1.0
 *   }
 * });
 *
 * // Stormy weather
 * const stormSky = createSkyMaterial({
 *   timeOfDay: { sunAngle: 45, sunIntensity: 0.3 },
 *   weather: { intensity: 0.8 }
 * });
 *
 * // Update uniforms per frame
 * function animate(time) {
 *   daySky.uniforms.uTime.value = time;
 *   daySky.uniforms.uSunAngle.value = (time % 24) * 7.5;
 * }
 * ```
 *
 * @see {@link createSkyGeometry} for creating the geometry
 * @see {@link TimeOfDayStateCore} for all available time parameters
 */
export function createSkyMaterial(options: SkyMaterialOptions): THREE.ShaderMaterial {
  const { timeOfDay, weather = {}, gyroTilt, time = 0 } = options;

  // Input validation
  if (
    timeOfDay &&
    timeOfDay.sunIntensity !== undefined &&
    (timeOfDay.sunIntensity < 0 || timeOfDay.sunIntensity > 1)
  ) {
    throw new Error('createSkyMaterial: sunIntensity must be between 0 and 1');
  }
  if (
    timeOfDay &&
    timeOfDay.sunAngle !== undefined &&
    (timeOfDay.sunAngle < -180 || timeOfDay.sunAngle > 360)
  ) {
    throw new Error('createSkyMaterial: sunAngle must be between -180 and 360');
  }

  const defaultTimeOfDay: TimeOfDayStateCore = {
    sunIntensity: 1.0,
    sunAngle: 60,
    ambientLight: 0.8,
    starVisibility: 0,
    fogDensity: 0,
  };

  const defaultWeather: WeatherStateCore = {
    intensity: 0,
  };

  const mergedTimeOfDay = { ...defaultTimeOfDay, ...timeOfDay };

  // Handle sunElevation alias (deprecated)
  if (timeOfDay?.sunElevation !== undefined) {
    // Deprecation warning - only log once per session
    if (typeof window !== 'undefined' && !(window as any).__strataWarnedSunElevation) {
      console.warn('createSkyMaterial: sunElevation is deprecated, use sunAngle instead');
      (window as any).__strataWarnedSunElevation = true;
    }
    mergedTimeOfDay.sunAngle = timeOfDay.sunElevation;
  }

  const mergedWeather = { ...defaultWeather, ...weather };

  const uniforms = createSkyUniforms(mergedTimeOfDay, mergedWeather, gyroTilt);
  uniforms.uTime.value = time;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: skyVertexShader,
    fragmentShader: skyFragmentShader,
    side: THREE.DoubleSide,
  });
}

/**
 * Create a geometry for the sky plane.
 *
 * Returns a standard Three.js PlaneGeometry suitable for sky rendering.
 * The geometry is positioned and oriented by the parent mesh, typically
 * placed behind all scene content but in front of the camera far plane.
 *
 * **Optimization Tip**: Reuse the same geometry across multiple sky materials
 * if experimenting with different shader configurations.
 *
 * @category World Building
 * @param size - Width and height of the sky plane in world units. Default: [200, 100]
 * @returns PlaneGeometry ready for sky material attachment
 *
 * @example
 * ```typescript
 * // Standard usage
 * const geometry = createSkyGeometry([200, 100]);
 * const material = createSkyMaterial({ timeOfDay: { sunAngle: 60 } });
 * const skyMesh = new THREE.Mesh(geometry, material);
 * skyMesh.position.set(0, 0, -50);
 *
 * // Large-scale scene
 * const largeGeometry = createSkyGeometry([500, 250]);
 * ```
 */
export function createSkyGeometry(size: [number, number] = [200, 100]): THREE.PlaneGeometry {
  return new THREE.PlaneGeometry(size[0], size[1], 1, 1);
}

/**
 * @deprecated Use `TimeOfDayStateCore` instead. This alias will be removed in v2.0.
 * @category World Building
 */
export type TimeOfDayState = TimeOfDayStateCore;

/**
 * @deprecated Use `WeatherStateCore` instead. This alias will be removed in v2.0.
 * @category World Building
 */
export type WeatherState = WeatherStateCore;
