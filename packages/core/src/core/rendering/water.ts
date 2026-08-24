/**
 * Water Materials - Core TypeScript (no React)
 *
 * Pure TypeScript functions for creating water materials
 */

import {
  advancedWaterFragmentShader,
  advancedWaterVertexShader,
  waterFragmentShader,
  waterVertexShader,
} from '@strata-game-library/shaders/water';
import * as THREE from 'three';

export interface WaterMaterialOptions {
  time?: number;
}

export interface AdvancedWaterMaterialOptions {
  waterColor?: THREE.ColorRepresentation;
  deepWaterColor?: THREE.ColorRepresentation;
  foamColor?: THREE.ColorRepresentation;
  causticIntensity?: number;
  time?: number;
}

/**
 * Create simple water material (pure TypeScript)
 */
export function createWaterMaterial(options: WaterMaterialOptions = {}): THREE.ShaderMaterial {
  const { time = 0 } = options;

  if (typeof time !== 'number' || !Number.isFinite(time)) {
    throw new Error('createWaterMaterial: time must be a finite number');
  }

  return new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms: {
      time: { value: time },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/**
 * Create advanced water material (pure TypeScript)
 */
export function createAdvancedWaterMaterial(
  options: AdvancedWaterMaterialOptions = {}
): THREE.ShaderMaterial {
  const {
    waterColor = 0x2a5a8a,
    deepWaterColor = 0x1a3a5a,
    foamColor = 0x8ab4d4,
    causticIntensity = 0.4,
    time = 0,
  } = options;

  // Input validation
  if (typeof time !== 'number' || !Number.isFinite(time)) {
    throw new Error('createAdvancedWaterMaterial: time must be a finite number');
  }
  if (causticIntensity < 0 || causticIntensity > 1) {
    throw new Error('createAdvancedWaterMaterial: causticIntensity must be between 0 and 1');
  }

  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: time },
      uWaterColor: { value: new THREE.Color(waterColor).toArray() },
      uDeepWaterColor: { value: new THREE.Color(deepWaterColor).toArray() },
      uFoamColor: { value: new THREE.Color(foamColor).toArray() },
      uCausticIntensity: { value: causticIntensity },
    },
    vertexShader: advancedWaterVertexShader,
    fragmentShader: advancedWaterFragmentShader,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

/**
 * Create water geometry (pure TypeScript)
 */
export function createWaterGeometry(size: number, segments: number = 32): THREE.PlaneGeometry {
  if (size <= 0) {
    throw new Error('createWaterGeometry: size must be positive');
  }
  if (segments <= 0 || !Number.isInteger(segments)) {
    throw new Error('createWaterGeometry: segments must be a positive integer');
  }
  return new THREE.PlaneGeometry(size, size, segments, segments);
}
