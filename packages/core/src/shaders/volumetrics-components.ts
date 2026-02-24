/**
 * Volumetric Effects Component Shaders
 *
 * Shaders for VolumetricFogMesh and UnderwaterOverlay components
 */

import type * as THREE from 'three';

export const volumetricFogMeshVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vViewDirection = normalize(worldPos.xyz - cameraPosition);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const volumetricFogMeshFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  uniform float uFogHeight;
  uniform vec3 uCameraPosition;

  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  float hash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yxz + 19.19);
      return fract((p.x + p.y) * p.z);
  }

  float noise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      return mix(
          mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
          f.z
      );
  }

  float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
          value += amplitude * noise(p);
          p *= 2.0;
          amplitude *= 0.5;
      }
      return value;
  }

  void main() {
      // Height-based density
      float heightFactor = exp(-max(0.0, vWorldPosition.y) / uFogHeight);

      // Animated noise for volumetric appearance
      vec3 noisePos = vWorldPosition * 0.02 + vec3(uTime * 0.02, 0.0, uTime * 0.01);
      float noiseVal = fbm(noisePos);

      float fogAmount = uFogDensity * heightFactor * (0.5 + 0.5 * noiseVal);

      // Fade near edges
      float dist = length(vWorldPosition.xz - uCameraPosition.xz);
      float edgeFade = smoothstep(80.0, 40.0, dist);

      fogAmount *= edgeFade;

      gl_FragColor = vec4(uFogColor, fogAmount);
  }
`;

export const underwaterOverlayVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const underwaterOverlayFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uWaterColor;
  uniform float uDensity;
  uniform float uCausticStrength;
  uniform float uWaterSurface;
  uniform float uCameraY;

  varying vec2 vUv;

  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float caustics(vec2 uv, float time) {
      float c = 0.0;
      for (int i = 0; i < 3; i++) {
          float fi = float(i);
          vec2 p = uv * (2.0 + fi) + time * (0.1 + fi * 0.05);
          c += abs(sin(p.x * 8.0 + sin(p.y * 6.0 + time)) *
                   sin(p.y * 10.0 + sin(p.x * 7.0 - time * 0.8)));
      }
      return c / 3.0;
  }

  void main() {
      // Only show underwater effect when camera is below water
      if (uCameraY >= uWaterSurface) {
          discard;
      }

      float depth = (uWaterSurface - uCameraY) * uDensity;
      float opacity = clamp(depth * 0.3, 0.0, 0.6);

      // Caustics
      float c = caustics(vUv * 3.0, uTime) * uCausticStrength;

      vec3 color = uWaterColor + vec3(c * 0.2);

      gl_FragColor = vec4(color, opacity);
  }
`;

export interface VolumetricFogMeshUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uFogColor: { value: number[] };
  uFogDensity: { value: number };
  uFogHeight: { value: number };
  uCameraPosition: { value: number[] };
}

export interface UnderwaterOverlayUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uWaterColor: { value: number[] };
  uDensity: { value: number };
  uCausticStrength: { value: number };
  uWaterSurface: { value: number };
  uCameraY: { value: number };
}

export function createVolumetricFogMeshUniforms(
  color: THREE.Color,
  density: number,
  height: number,
  cameraPosition: THREE.Vector3
): VolumetricFogMeshUniforms {
  return {
    uTime: { value: 0 },
    uFogColor: { value: color.toArray() },
    uFogDensity: { value: density },
    uFogHeight: { value: height },
    uCameraPosition: { value: cameraPosition.toArray() },
  };
}

export function createUnderwaterOverlayUniforms(
  waterColor: THREE.Color,
  density: number,
  causticStrength: number,
  waterSurface: number,
  cameraY: number
): UnderwaterOverlayUniforms {
  return {
    uTime: { value: 0 },
    uWaterColor: { value: waterColor.toArray() },
    uDensity: { value: density },
    uCausticStrength: { value: causticStrength },
    uWaterSurface: { value: waterSurface },
    uCameraY: { value: cameraY },
  };
}
