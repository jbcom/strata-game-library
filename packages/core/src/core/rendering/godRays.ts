/**
 * Core God Rays System.
 *
 * Provides utilities for creating volumetric light shafts (god rays)
 * using screen-space raymarching and scattering.
 *
 * @category Effects & Atmosphere
 * @module core/godRays
 */

import {
  godRaysFragmentShader,
  godRaysVertexShader,
  volumetricPointLightFragmentShader,
  volumetricPointLightVertexShader,
  volumetricSpotlightFragmentShader,
  volumetricSpotlightVertexShader,
} from '@strata-game-library/shaders/godRays';
import * as THREE from 'three';

/**
 * Options for creating a god rays material.
 * @category Effects & Atmosphere
 */
export interface GodRaysMaterialOptions {
  /** Light source position in screen space (or world space if handled by shader). */
  lightPosition: THREE.Vector3;
  /** Color of the light rays. */
  lightColor: THREE.Color;
  /** Intensity multiplier. */
  intensity: number;
  /** Decay factor (how fast rays fade). */
  decay: number;
  /** Density of the rays. */
  density: number;
  /** Number of samples for raymarching. */
  samples: number;
  /** Exposure adjustment. */
  exposure: number;
  /** Scattering coefficient. */
  scattering: number;
  /** Noise factor for irregularity. */
  noiseFactor: number;
}

/**
 * Options for creating a volumetric spotlight material.
 * @category Effects & Atmosphere
 */
export interface VolumetricSpotlightMaterialOptions {
  lightPosition: THREE.Vector3;
  lightDirection: THREE.Vector3;
  lightColor: THREE.Color;
  intensity: number;
  angle: number;
  penumbra: number;
  distance: number;
  dustDensity: number;
}

/**
 * Options for creating a volumetric point light material.
 * @category Effects & Atmosphere
 */
export interface VolumetricPointLightMaterialOptions {
  lightPosition: THREE.Vector3;
  lightColor: THREE.Color;
  intensity: number;
  radius: number;
  dustDensity: number;
  flicker?: number;
}

/**
 * Create a shader material for screen-space god rays.
 *
 * @category Effects & Atmosphere
 * @param options - Configuration options
 * @returns ShaderMaterial
 */
export function createGodRaysMaterial(options: GodRaysMaterialOptions): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLightPosition: { value: options.lightPosition },
      uLightColor: { value: options.lightColor },
      uIntensity: { value: options.intensity },
      uDecay: { value: options.decay },
      uDensity: { value: options.density },
      uSamples: { value: options.samples },
      uExposure: { value: options.exposure },
      uScattering: { value: options.scattering },
      uNoiseFactor: { value: options.noiseFactor },
      uTime: { value: 0 },
    },
    vertexShader: godRaysVertexShader,
    fragmentShader: godRaysFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
}

/**
 * Create a shader material for volumetric spotlight beams.
 *
 * @category Effects & Atmosphere
 * @param options - Configuration options
 * @returns ShaderMaterial
 */
export function createVolumetricSpotlightMaterial(
  options: VolumetricSpotlightMaterialOptions
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLightPosition: { value: options.lightPosition },
      uLightDirection: { value: options.lightDirection },
      uLightColor: { value: options.lightColor },
      uIntensity: { value: options.intensity },
      uAngle: { value: options.angle },
      uPenumbra: { value: options.penumbra },
      uDistance: { value: options.distance },
      uDustDensity: { value: options.dustDensity },
      uTime: { value: 0 },
    },
    vertexShader: volumetricSpotlightVertexShader,
    fragmentShader: volumetricSpotlightFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/**
 * Create a shader material for volumetric point lights.
 *
 * @category Effects & Atmosphere
 * @param options - Configuration options
 * @returns ShaderMaterial
 */
export function createVolumetricPointLightMaterial(
  options: VolumetricPointLightMaterialOptions
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uLightPosition: { value: options.lightPosition },
      uLightColor: { value: options.lightColor },
      uIntensity: { value: options.intensity },
      uRadius: { value: options.radius },
      uDustDensity: { value: options.dustDensity },
      uFlicker: { value: options.flicker || 0 },
      uTime: { value: 0 },
    },
    vertexShader: volumetricPointLightVertexShader,
    fragmentShader: volumetricPointLightFragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
}

/**
 * Create geometry for a spotlight beam cone.
 * @category Effects & Atmosphere
 */
export function createSpotlightConeGeometry(
  angle: number,
  distance: number
): THREE.CylinderGeometry {
  const radiusTop = 0.1;
  const radiusBottom = distance * Math.tan(angle);
  const height = distance;
  const segments = 32;

  const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments, 1, true);
  geometry.translate(0, -height / 2, 0);
  geometry.rotateX(-Math.PI / 2);

  return geometry;
}

/**
 * Create geometry for a point light sphere.
 * @category Effects & Atmosphere
 */
export function createPointLightSphereGeometry(radius: number): THREE.SphereGeometry {
  return new THREE.SphereGeometry(radius, 32, 32);
}

/**
 * Convert world position to screen space coordinates (0-1).
 * @category Effects & Atmosphere
 */
const _vec3 = new THREE.Vector3();
export function getLightScreenPosition(
  worldPos: THREE.Vector3,
  camera: THREE.Camera,
  target = new THREE.Vector2()
): THREE.Vector2 | null {
  _vec3.copy(worldPos).project(camera);

  // Check if behind camera
  if (_vec3.z > 1) return null;

  return target.set((_vec3.x + 1) / 2, (_vec3.y + 1) / 2);
}

/**
 * Calculate light intensity based on sun angle (0-180).
 * @category Effects & Atmosphere
 */
export function calculateGodRayIntensityFromAngle(sunAngle: number, baseIntensity: number): number {
  // Max intensity near horizon (0 and 180), min at noon (90)
  const factor = Math.abs(Math.cos((sunAngle * Math.PI) / 180));
  return baseIntensity * (0.2 + 0.8 * factor); // Never fully zero
}

/**
 * Blend light color with atmosphere color based on sun angle.
 * @category Effects & Atmosphere
 */
export function blendGodRayColors(
  lightColor: THREE.Color,
  atmosphereColor: THREE.Color,
  sunAngle: number,
  target = new THREE.Color()
): THREE.Color {
  // Blend towards atmosphere color near horizon
  const factor = Math.abs(Math.cos((sunAngle * Math.PI) / 180)) ** 2;
  return target.copy(lightColor).lerp(atmosphereColor, factor * 0.8);
}

/**
 * Calculate scattering intensity based on view angle relative to light.
 * @category Effects & Atmosphere
 */
export function calculateScatteringIntensity(viewDir: THREE.Vector3, lightDir: THREE.Vector3) {
  const dot = Math.max(0, viewDir.dot(lightDir));
  // Mie scattering approximation
  return dot ** 4;
}
