/**
 * Core Cloud System
 *
 * Pure TypeScript functions for creating GPU-optimized cloud materials, geometries,
 * and volumetric simulation. All functions are framework-agnostic and reusable across
 * vanilla Three.js, React Three Fiber, or custom engines.
 *
 * **Rendering Techniques**:
 * - **2D Layers**: Shader-based procedural textures for efficient background clouds
 * - **3D Volumes**: Fragment shader raymarching with light scattering and self-shadowing
 *
 * **Performance Design**:
 * - Minimal CPU overhead (geometry generated once, uniforms updated per frame)
 * - Configurable quality/performance tradeoff (raymarching steps)
 * - Shared uniform structures for batch rendering
 *
 * @category World Building
 * @module core/clouds
 *
 * @example
 * ```typescript
 * // Vanilla Three.js 2D cloud layer
 * import { createCloudLayerMaterial, createCloudLayerGeometry } from '@jbcom/strata/core';
 *
 * const material = createCloudLayerMaterial({
 *   layer: { coverage: 0.5, altitude: 100 },
 *   wind: { speed: 0.02, direction: new THREE.Vector2(1, 0) }
 * });
 * const geometry = createCloudLayerGeometry([200, 200]);
 * const cloudMesh = new THREE.Mesh(geometry, material);
 * scene.add(cloudMesh);
 *
 * // Volumetric clouds
 * const volumetricMaterial = createVolumetricCloudMaterial({
 *   cloudBase: 60,
 *   cloudHeight: 80,
 *   coverage: 0.6,
 *   steps: 32
 * });
 * const sphereGeometry = createVolumetricCloudGeometry(500);
 * const volumeCloud = new THREE.Mesh(sphereGeometry, volumetricMaterial);
 * scene.add(volumeCloud);
 * ```
 */

import * as THREE from 'three';
import {
  cloudLayerFragmentShader,
  cloudLayerVertexShader,
  createCloudLayerUniforms,
  createVolumetricCloudUniforms,
  volumetricCloudFragmentShader,
  volumetricCloudVertexShader,
} from '../shaders/clouds';

/**
 * Configuration for a single cloud layer.
 *
 * Defines visual appearance, position, and density parameters for a 2D cloud plane.
 *
 * @category World Building
 */
export interface CloudLayerConfig {
  /**
   * Altitude of the cloud layer in world units.
   *
   * Y-position where this layer is rendered in 3D space.
   */
  altitude: number;

  /**
   * Density of the clouds (0-2+).
   *
   * Controls opacity and visual thickness:
   * - `0.5` = Wispy, semi-transparent
   * - `1.0` = Standard cumulus
   * - `1.5+` = Dense, thick clouds
   */
  density: number;

  /**
   * Cloud coverage (0-1).
   *
   * Percentage of sky covered by clouds:
   * - `0` = Clear sky
   * - `0.5` = Partly cloudy
   * - `1.0` = Complete overcast
   */
  coverage: number;

  /**
   * Base color of the clouds (lit surfaces).
   */
  cloudColor: THREE.Color;

  /**
   * Color of cloud shadows (occluded regions).
   */
  shadowColor: THREE.Color;

  /**
   * Scale of the cloud noise pattern.
   *
   * Default: 5.0
   *
   * Smaller values create large cloud formations; larger values create fine detail.
   */
  scale?: number;
}

/**
 * Configuration for wind simulation.
 * @category World Building
 */
export interface WindConfig {
  /** Wind direction vector (normalized). */
  direction: THREE.Vector2;
  /** Wind speed multiplier. */
  speed: number;
}

/**
 * Configuration for day/night cycle integration.
 * @category World Building
 */
export interface DayNightConfig {
  /** Sun intensity (0-1). */
  sunIntensity: number;
  /** Sun elevation angle in degrees. */
  sunAngle: number;
  /** Sun light color. */
  sunColor: THREE.Color;
}

/**
 * Options for creating a cloud layer material.
 * @category World Building
 */
export interface CloudMaterialOptions {
  /** Layer configuration. */
  layer: Partial<CloudLayerConfig>;
  /** Wind configuration. */
  wind?: Partial<WindConfig>;
  /** Day/night configuration. */
  dayNight?: Partial<DayNightConfig>;
  /** Animation time. */
  time?: number;
}

/**
 * Options for creating a volumetric cloud material.
 * @category World Building
 */
export interface VolumetricCloudOptions {
  /** Base altitude of the cloud volume. */
  cloudBase?: number;
  /** Height/thickness of the cloud volume. */
  cloudHeight?: number;
  /** Cloud coverage (0-1). */
  coverage?: number;
  /** Cloud density (0-1). */
  density?: number;
  /** Base cloud color. */
  cloudColor?: THREE.Color;
  /** Cloud shadow color. */
  shadowColor?: THREE.Color;
  /** Wind configuration. */
  wind?: Partial<WindConfig>;
  /** Day/night configuration. */
  dayNight?: Partial<DayNightConfig>;
  /** Raymarching steps. Higher = better quality but slower. */
  steps?: number;
  /** Light sampling steps. Higher = better shadows. */
  lightSteps?: number;
  /** Animation time. */
  time?: number;
}

/**
 * Complete cloud sky configuration.
 * @category World Building
 */
export interface CloudSkyConfig {
  layers: CloudLayerConfig[];
  wind: WindConfig;
  dayNight: DayNightConfig;
}

const defaultCloudLayer: CloudLayerConfig = {
  altitude: 100,
  density: 1.0,
  coverage: 0.5,
  cloudColor: new THREE.Color(1, 1, 1),
  shadowColor: new THREE.Color(0.7, 0.75, 0.85),
  scale: 5.0,
};

const defaultWind: WindConfig = {
  direction: new THREE.Vector2(1, 0),
  speed: 0.01,
};

const defaultDayNight: DayNightConfig = {
  sunIntensity: 1.0,
  sunAngle: 60,
  sunColor: new THREE.Color(1, 0.95, 0.8),
};

/**
 * Create a shader material for a 2D cloud layer.
 *
 * @category World Building
 * @param options - Cloud layer options
 * @returns Configured shader material
 */
export function createCloudLayerMaterial(options: CloudMaterialOptions): THREE.ShaderMaterial {
  const { layer, wind = {}, dayNight = {}, time = 0 } = options;

  if (layer.coverage !== undefined && (layer.coverage < 0 || layer.coverage > 1)) {
    throw new Error('createCloudLayerMaterial: coverage must be between 0 and 1');
  }
  if (layer.density !== undefined && layer.density < 0) {
    throw new Error('createCloudLayerMaterial: density must be non-negative');
  }

  const mergedLayer = { ...defaultCloudLayer, ...layer };
  const mergedWind = { ...defaultWind, ...wind };
  const mergedDayNight = { ...defaultDayNight, ...dayNight };

  const uniforms = createCloudLayerUniforms({
    coverage: mergedLayer.coverage,
    density: mergedLayer.density,
    altitude: mergedLayer.altitude,
    cloudColor: mergedLayer.cloudColor,
    shadowColor: mergedLayer.shadowColor,
    windDirection: mergedWind.direction,
    windSpeed: mergedWind.speed,
    sunIntensity: mergedDayNight.sunIntensity,
    sunAngle: mergedDayNight.sunAngle,
    sunColor: mergedDayNight.sunColor,
    scale: mergedLayer.scale,
  });
  uniforms.uTime.value = time;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: cloudLayerVertexShader,
    fragmentShader: cloudLayerFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/**
 * Create a shader material for volumetric clouds.
 *
 * Uses raymarching to render 3D clouds with internal scattering and shadows.
 *
 * @category World Building
 * @param options - Volumetric cloud options
 * @returns Configured shader material
 */
export function createVolumetricCloudMaterial(
  options: VolumetricCloudOptions = {}
): THREE.ShaderMaterial {
  const {
    cloudBase = 50,
    cloudHeight = 50,
    coverage = 0.5,
    density = 1.0,
    cloudColor = new THREE.Color(1, 1, 1),
    shadowColor = new THREE.Color(0.6, 0.65, 0.75),
    wind = {},
    dayNight = {},
    steps = 32,
    lightSteps = 4,
    time = 0,
  } = options;

  if (coverage < 0 || coverage > 1) {
    throw new Error('createVolumetricCloudMaterial: coverage must be between 0 and 1');
  }
  if (density < 0) {
    throw new Error('createVolumetricCloudMaterial: density must be non-negative');
  }

  const mergedWind = { ...defaultWind, ...wind };
  const mergedDayNight = { ...defaultDayNight, ...dayNight };

  const uniforms = createVolumetricCloudUniforms({
    coverage,
    density,
    cloudBase,
    cloudHeight,
    cloudColor,
    shadowColor,
    windDirection: mergedWind.direction,
    windSpeed: mergedWind.speed,
    sunIntensity: mergedDayNight.sunIntensity,
    sunAngle: mergedDayNight.sunAngle,
    sunColor: mergedDayNight.sunColor,
    steps,
    lightSteps,
  });
  uniforms.uTime.value = time;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: volumetricCloudVertexShader,
    fragmentShader: volumetricCloudFragmentShader,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
  });
}

/**
 * Create geometry for a cloud layer.
 * @category World Building
 */
export function createCloudLayerGeometry(
  size: [number, number] = [200, 200],
  segments: [number, number] = [1, 1]
): THREE.PlaneGeometry {
  return new THREE.PlaneGeometry(size[0], size[1], segments[0], segments[1]);
}

/**
 * Create geometry for volumetric clouds (a sphere surrounding the viewer).
 * @category World Building
 */
export function createVolumetricCloudGeometry(
  radius: number = 500,
  widthSegments: number = 32,
  heightSegments: number = 16
): THREE.SphereGeometry {
  return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
}

/**
 * Adapt cloud colors based on time of day (sun angle).
 *
 * Automatically shifts cloud colors to orange/red during sunset.
 *
 * @category World Building
 * @param baseCloudColor - Base color of clouds
 * @param baseShadowColor - Base color of shadows
 * @param sunAngle - Current sun angle in degrees
 * @param sunIntensity - Current sun intensity (0-1)
 * @param target - Optional target object to avoid allocations in render loops
 * @returns Object containing adapted colors
 */
const _warmCloudColor = new THREE.Color();
const _warmShadowColor = new THREE.Color();
export function adaptCloudColorsForTimeOfDay(
  baseCloudColor: THREE.Color,
  baseShadowColor: THREE.Color,
  sunAngle: number,
  sunIntensity: number,
  target = {
    cloudColor: new THREE.Color(),
    shadowColor: new THREE.Color(),
    sunColor: new THREE.Color(),
  }
): { cloudColor: THREE.Color; shadowColor: THREE.Color; sunColor: THREE.Color } {
  const sunHeight = Math.sin((sunAngle * Math.PI) / 180);

  if (sunHeight < 0.1) {
    target.sunColor.set(1.0, 0.4, 0.2);
  } else if (sunHeight < 0.3) {
    target.sunColor.set(1.0, 0.7, 0.4);
  } else {
    target.sunColor.set(1.0, 0.95, 0.85);
  }

  target.cloudColor.copy(baseCloudColor);
  target.shadowColor.copy(baseShadowColor);

  if (sunHeight < 0.3) {
    const warmth = 1 - sunHeight / 0.3;
    target.cloudColor.lerp(_warmCloudColor.set(1.0, 0.85, 0.7), warmth * 0.5);
    target.shadowColor.lerp(_warmShadowColor.set(0.6, 0.4, 0.5), warmth * 0.3);
  }

  if (sunIntensity < 0.3) {
    const darkness = 1 - sunIntensity / 0.3;
    target.cloudColor.multiplyScalar(1 - darkness * 0.5);
    target.shadowColor.multiplyScalar(1 - darkness * 0.3);
  }

  return target;
}

/**
 * Calculate wind offset for cloud animation
 * @param time Current time value
 * @param windDirection Wind direction vector
 * @param windSpeed Wind speed multiplier
 * @param target Optional target vector to avoid allocations in render loops
 * @returns Wind offset vector
 */
export function calculateWindOffset(
  time: number,
  windDirection: THREE.Vector2,
  windSpeed: number,
  target: THREE.Vector2 = new THREE.Vector2()
): THREE.Vector2 {
  return target.set(windDirection.x * windSpeed * time, windDirection.y * windSpeed * time);
}

/**
 * Generate Fractional Brownian Motion (FBM) noise.
 * Useful for CPU-side cloud density sampling.
 * @internal
 */
export function fbmNoise2D(x: number, y: number, octaves: number = 6): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1;
  let maxValue = 0;

  const hash = (px: number, py: number): number => {
    const n = Math.sin(px * 127.1 + py * 311.7) * 43758.5453;
    return n - Math.floor(n);
  };

  const noise = (px: number, py: number): number => {
    const ix = Math.floor(px);
    const iy = Math.floor(py);
    const fx = px - ix;
    const fy = py - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);

    const a = hash(ix, iy);
    const b = hash(ix + 1, iy);
    const c = hash(ix, iy + 1);
    const d = hash(ix + 1, iy + 1);

    return a * (1 - sx) * (1 - sy) + b * sx * (1 - sy) + c * (1 - sx) * sy + d * sx * sy;
  };

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }

  return value / maxValue;
}

/**
 * Sample cloud density at a 3D point.
 * @category World Building
 */
export function sampleCloudDensity(
  x: number,
  y: number,
  z: number,
  coverage: number,
  cloudBase: number,
  cloudHeight: number
): number {
  // Guard against division by zero when cloudHeight is 0
  if (cloudHeight <= 0) return 0;

  const heightFactor = (y - cloudBase) / cloudHeight;
  if (heightFactor < 0 || heightFactor > 1) return 0;

  const heightShape = 4 * heightFactor * (1 - heightFactor);
  const baseNoise = fbmNoise2D(x * 0.01, z * 0.01, 5);
  const threshold = 1 - coverage;

  // Guard against division by zero when coverage is 0 (threshold = 1)
  if (threshold >= 1) return 0;

  const cloud = Math.max(0, baseNoise - threshold) / (1 - threshold);

  return cloud * heightShape;
}

/**
 * Create a default configuration for a cloud sky.
 * @category World Building
 */
export function createDefaultCloudSkyConfig(): CloudSkyConfig {
  return {
    layers: [
      {
        altitude: 80,
        density: 0.8,
        coverage: 0.4,
        cloudColor: new THREE.Color(1, 1, 1),
        shadowColor: new THREE.Color(0.75, 0.8, 0.9),
        scale: 4.0,
      },
      {
        altitude: 120,
        density: 0.6,
        coverage: 0.3,
        cloudColor: new THREE.Color(0.95, 0.95, 1),
        shadowColor: new THREE.Color(0.7, 0.75, 0.85),
        scale: 6.0,
      },
      {
        altitude: 160,
        density: 0.4,
        coverage: 0.2,
        cloudColor: new THREE.Color(0.9, 0.9, 0.95),
        shadowColor: new THREE.Color(0.65, 0.7, 0.8),
        scale: 8.0,
      },
    ],
    wind: {
      direction: new THREE.Vector2(1, 0.3),
      speed: 0.01,
    },
    dayNight: {
      sunIntensity: 1.0,
      sunAngle: 60,
      sunColor: new THREE.Color(1, 0.95, 0.8),
    },
  };
}
