/**
 * Core Volumetric Rendering System.
 *
 * Provides utilities for creating volumetric fog, underwater overlays,
 * and light scattering effects.
 *
 * @category Effects & Atmosphere
 * @module core/volumetrics
 */

import * as THREE from 'three';
import { underwaterShader, volumetricFogShader } from '../shaders/volumetrics';

// Extract individual shaders from the shader objects
const volumetricFogMeshVertexShader = volumetricFogShader.vertexShader;
const volumetricFogMeshFragmentShader = volumetricFogShader.fragmentShader;
const underwaterOverlayVertexShader = underwaterShader.vertexShader;
const underwaterOverlayFragmentShader = underwaterShader.fragmentShader;

/**
 * Options for creating a volumetric fog material.
 * @category Effects & Atmosphere
 */
export interface VolumetricFogMeshMaterialOptions {
  /** Fog color. Default: 0xb3c8d9 */
  color?: THREE.ColorRepresentation;
  /** Fog density. Default: 0.02 */
  density?: number;
  /** Fog height. Default: 10 */
  height?: number;
  /** Camera position (for distance calculation). */
  cameraPosition?: THREE.Vector3;
  /** Animation time. */
  time?: number;
}

/**
 * Options for creating an underwater overlay material.
 * @category Effects & Atmosphere
 */
export interface UnderwaterOverlayMaterialOptions {
  /** Water tint color. Default: 0x004d66 */
  waterColor?: THREE.ColorRepresentation;
  /** Fog density underwater. Default: 0.1 */
  density?: number;
  /** Strength of caustics effect. Default: 0.3 */
  causticStrength?: number;
  /** Y-position of the water surface. Default: 0 */
  waterSurface?: number;
  /** Camera Y-position. */
  cameraY?: number;
  /** Animation time. */
  time?: number;
}

/**
 * Create a shader material for volumetric fog volume.
 *
 * @category Effects & Atmosphere
 * @param options - Configuration options
 * @returns ShaderMaterial
 */
export function createVolumetricFogMeshMaterial(
  options: VolumetricFogMeshMaterialOptions = {}
): THREE.ShaderMaterial {
  const {
    color = 0xb3c8d9,
    density = 0.02,
    height = 10,
    cameraPosition = new THREE.Vector3(),
    time = 0,
  } = options;

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: time },
      uColor: { value: new THREE.Color(color) },
      uDensity: { value: density },
      uHeight: { value: height },
      uCameraPosition: { value: cameraPosition },
    },
    vertexShader: volumetricFogMeshVertexShader,
    fragmentShader: volumetricFogMeshFragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.BackSide, // Render backfaces so we're inside the box
  });
}

/**
 * Create a shader material for screen-space underwater effects.
 *
 * @category Effects & Atmosphere
 * @param options - Configuration options
 * @returns ShaderMaterial
 */
export function createUnderwaterOverlayMaterial(
  options: UnderwaterOverlayMaterialOptions = {}
): THREE.ShaderMaterial {
  const {
    waterColor = 0x004d66,
    density = 0.1,
    causticStrength = 0.3,
    waterSurface = 0,
    cameraY = 0,
    time = 0,
  } = options;

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: time },
      uWaterColor: { value: new THREE.Color(waterColor) },
      uDensity: { value: density },
      uCausticStrength: { value: causticStrength },
      uWaterSurface: { value: waterSurface },
      uCameraY: { value: cameraY },
    },
    vertexShader: underwaterOverlayVertexShader,
    fragmentShader: underwaterOverlayFragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
}
