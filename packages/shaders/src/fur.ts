import * as THREE from 'three';
import type { IUniforms } from './types.js';

/**
 * Fur shell shader - layered alpha-tested shells for volumetric fur effect
 * Migrated from rivermarsh procedural rendering system.
 *
 * Multi-layer shell displacement with wind animation and density falloff.
 */

export const furVertexShader = /* glsl */ `
  uniform float layerOffset;
  uniform float spacing;
  uniform float time;

  varying vec2 vUv;
  varying float vLayer;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vLayer = layerOffset;
    vNormal = normalize(normalMatrix * normal);

    // Multi-layer shell displacement: Extrude along normal per layer
    vec3 pos = position + normal * (layerOffset * spacing);

    // Wind animation for fur tips - more pronounced at higher layers
    float windStrength = pow(layerOffset, 2.0);
    pos.x += sin(time * 2.0 + position.y * 2.0 + position.z * 1.5) * 0.01 * windStrength;
    pos.z += cos(time * 1.5 + position.x * 2.0 + position.y * 1.0) * 0.01 * windStrength;

    // Gravity droop - more pronounced at tips
    pos.y -= pow(layerOffset, 2.5) * 0.04;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const furFragmentShader = /* glsl */ `
  uniform vec3 colorBase;
  uniform vec3 colorTip;

  varying vec2 vUv;
  varying float vLayer;
  varying vec3 vNormal;

  // Simple hash for procedural strands
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // Procedural strand pattern via noise
    float strandNoise = hash(floor(vUv * 50.0));

    // Density falloff on outer layers (tapering effect)
    float density = 1.0 - vLayer * 0.8;

    // Alpha test for strands
    if (step(strandNoise, density) < 0.5) discard;

    // Color gradient from base to tip
    vec3 col = mix(colorBase, colorTip, vLayer);

    // Ambient occlusion at roots
    float ao = 0.4 + 0.6 * vLayer;
    col *= ao;

    // Rim lighting effect for depth perception
    float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    col += vec3(0.1) * rim * vLayer;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface FurUniforms extends IUniforms {
  layerOffset: { value: number };
  spacing: { value: number };
  time: { value: number };
  colorBase: { value: THREE.Color };
  colorTip: { value: THREE.Color };
}

/**
 * Fur shader uniforms factory
 */
export function createFurUniforms(
  options: {
    layerOffset?: number;
    spacing?: number;
    colorBase?: [number, number, number];
    colorTip?: [number, number, number];
  } = {}
): FurUniforms {
  return {
    layerOffset: { value: options.layerOffset ?? 0 },
    spacing: { value: options.spacing ?? defaultFurConfig.spacing },
    time: { value: 0 },
    colorBase: { value: new THREE.Color(...(options.colorBase ?? defaultFurConfig.colorBase)) },
    colorTip: { value: new THREE.Color(...(options.colorTip ?? defaultFurConfig.colorTip)) },
  };
}

/**
 * Configuration for fur rendering
 */
export interface FurConfig {
  /** Number of shell layers */
  layers: number;
  /** Spacing between layers */
  spacing: number;
  /** Base color (roots) */
  colorBase: [number, number, number];
  /** Tip color */
  colorTip: [number, number, number];
}

/**
 * Default fur configuration
 */
export const defaultFurConfig: FurConfig = {
  layers: 16,
  spacing: 0.02,
  colorBase: [0.3, 0.2, 0.1],
  colorTip: [0.6, 0.5, 0.3],
};
