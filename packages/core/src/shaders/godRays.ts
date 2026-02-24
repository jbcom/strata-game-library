/**
 * God Rays Shaders
 *
 * Shaders for volumetric light shafts and god rays effects
 *
 * IMPORTANT: The god rays shader expects `uLightPosition` to be in **screen-space**
 * coordinates (UV space, 0.0 to 1.0 range), not world-space. You must project the
 * light's world position to screen space before passing it to the shader:
 *
 * ```typescript
 * const lightScreenPos = lightWorldPos.clone().project(camera);
 * uniforms.uLightPosition.value.set(
 *   (lightScreenPos.x + 1) * 0.5,
 *   (lightScreenPos.y + 1) * 0.5,
 *   lightScreenPos.z // z can be used to check if light is behind camera
 * );
 * ```
 */

import * as THREE from 'three';

export const godRaysVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const godRaysFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLightPosition;
  uniform vec3 uLightColor;
  uniform float uIntensity;
  uniform float uDecay;
  uniform float uDensity;
  uniform float uWeight;
  uniform float uExposure;
  uniform int uSamples;
  uniform vec2 uResolution;
  uniform float uScattering;
  uniform float uNoiseFactor;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
      );
  }

  float fbm(vec2 p) {
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
      // Protect against division by zero when uSamples is 0
      int samples = max(uSamples, 1);

      vec2 lightScreenPos = uLightPosition.xy;
      vec2 deltaTexCoord = (vUv - lightScreenPos) * uDensity / float(samples);

      vec2 texCoord = vUv;
      float illuminationDecay = 1.0;
      vec3 color = vec3(0.0);

      for (int i = 0; i < 100; i++) {
          if (i >= samples) break;

          texCoord -= deltaTexCoord;

          float noiseVal = 1.0;
          if (uNoiseFactor > 0.0) {
              noiseVal = 0.5 + 0.5 * fbm(texCoord * 10.0 + uTime * 0.1);
          }

          float dist = length(texCoord - lightScreenPos);
          float falloff = exp(-dist * uScattering);

          vec3 sampleColor = uLightColor * falloff * noiseVal;
          sampleColor *= illuminationDecay * uWeight;

          color += sampleColor;
          illuminationDecay *= uDecay;
      }

      color *= uExposure * uIntensity;

      float alpha = length(color) * 0.5;
      alpha = clamp(alpha, 0.0, 1.0);

      gl_FragColor = vec4(color, alpha);
  }
`;

export const volumetricSpotlightVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewDirection;

  void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vNormal = normalize(normalMatrix * normal);
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const volumetricSpotlightFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLightColor;
  uniform float uIntensity;
  uniform float uAngle;
  uniform float uPenumbra;
  uniform float uDistance;
  uniform float uDustDensity;
  uniform vec3 uLightPosition;
  uniform vec3 uLightDirection;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
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

  void main() {
      vec3 toLight = uLightPosition - vWorldPosition;
      float dist = length(toLight);
      vec3 lightDir = normalize(toLight);

      float cosAngle = dot(-lightDir, normalize(uLightDirection));
      float spotEffect = smoothstep(cos(uAngle + uPenumbra), cos(uAngle), cosAngle);

      float distAttenuation = 1.0 - smoothstep(0.0, uDistance, dist);

      float dust = noise(vWorldPosition * 2.0 + vec3(uTime * 0.1, uTime * 0.05, uTime * 0.08));
      dust = 0.3 + 0.7 * dust;
      dust *= uDustDensity;

      float edgeFade = 1.0 - abs(dot(vNormal, vViewDirection));
      edgeFade = pow(edgeFade, 2.0);

      float alpha = spotEffect * distAttenuation * dust * uIntensity * edgeFade;
      alpha = clamp(alpha, 0.0, 0.8);

      gl_FragColor = vec4(uLightColor, alpha);
  }
`;

export const volumetricPointLightVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  varying float vDistanceToCenter;

  uniform vec3 uLightPosition;

  void main() {
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      vNormal = normalize(normalMatrix * normal);
      vViewDirection = normalize(cameraPosition - worldPos.xyz);
      vDistanceToCenter = length(worldPos.xyz - uLightPosition);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const volumetricPointLightFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uLightColor;
  uniform float uIntensity;
  uniform float uRadius;
  uniform float uDustDensity;
  uniform float uFlicker;
  uniform vec3 uLightPosition;

  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  varying vec3 vViewDirection;
  varying float vDistanceToCenter;

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

  void main() {
      float distFactor = 1.0 - smoothstep(0.0, uRadius, vDistanceToCenter);
      distFactor = pow(distFactor, 1.5);

      float dust = noise(vWorldPosition * 3.0 + vec3(uTime * 0.1));
      dust = 0.5 + 0.5 * dust;
      dust *= uDustDensity;

      float flicker = 1.0;
      if (uFlicker > 0.0) {
          flicker = 0.8 + 0.2 * sin(uTime * 10.0 + noise(vec3(uTime)) * 5.0);
          flicker = mix(1.0, flicker, uFlicker);
      }

      float edgeFade = 1.0 - abs(dot(vNormal, vViewDirection));
      edgeFade = pow(edgeFade, 1.5);

      float alpha = distFactor * dust * uIntensity * flicker * edgeFade;
      alpha = clamp(alpha, 0.0, 0.7);

      vec3 color = uLightColor * (1.0 + 0.2 * distFactor);

      gl_FragColor = vec4(color, alpha);
  }
`;

export interface GodRaysUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uLightPosition: { value: THREE.Vector3 };
  uLightColor: { value: THREE.Color };
  uIntensity: { value: number };
  uDecay: { value: number };
  uDensity: { value: number };
  uWeight: { value: number };
  uExposure: { value: number };
  uSamples: { value: number };
  uResolution: { value: THREE.Vector2 };
  uScattering: { value: number };
  uNoiseFactor: { value: number };
}

export interface VolumetricSpotlightUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uLightColor: { value: THREE.Color };
  uIntensity: { value: number };
  uAngle: { value: number };
  uPenumbra: { value: number };
  uDistance: { value: number };
  uDustDensity: { value: number };
  uLightPosition: { value: THREE.Vector3 };
  uLightDirection: { value: THREE.Vector3 };
}

export interface VolumetricPointLightUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uLightColor: { value: THREE.Color };
  uIntensity: { value: number };
  uRadius: { value: number };
  uDustDensity: { value: number };
  uFlicker: { value: number };
  uLightPosition: { value: THREE.Vector3 };
}

export function createGodRaysUniforms(
  lightPosition: THREE.Vector3,
  lightColor: THREE.Color,
  options: {
    intensity?: number;
    decay?: number;
    density?: number;
    weight?: number;
    exposure?: number;
    samples?: number;
    resolution?: THREE.Vector2;
    scattering?: number;
    noiseFactor?: number;
  } = {}
): GodRaysUniforms {
  return {
    uTime: { value: 0 },
    uLightPosition: { value: lightPosition.clone() },
    uLightColor: { value: lightColor.clone() },
    uIntensity: { value: options.intensity ?? 1.0 },
    uDecay: { value: options.decay ?? 0.95 },
    uDensity: { value: options.density ?? 1.0 },
    uWeight: { value: options.weight ?? 0.01 },
    uExposure: { value: options.exposure ?? 1.0 },
    uSamples: { value: options.samples ?? 50 },
    uResolution: { value: options.resolution?.clone() ?? new THREE.Vector2(1920, 1080) },
    uScattering: { value: options.scattering ?? 2.0 },
    uNoiseFactor: { value: options.noiseFactor ?? 0.3 },
  };
}

export function createVolumetricSpotlightUniforms(
  lightPosition: THREE.Vector3,
  lightDirection: THREE.Vector3,
  lightColor: THREE.Color,
  options: {
    intensity?: number;
    angle?: number;
    penumbra?: number;
    distance?: number;
    dustDensity?: number;
  } = {}
): VolumetricSpotlightUniforms {
  return {
    uTime: { value: 0 },
    uLightColor: { value: lightColor.clone() },
    uIntensity: { value: options.intensity ?? 1.0 },
    uAngle: { value: options.angle ?? Math.PI / 6 },
    uPenumbra: { value: options.penumbra ?? 0.1 },
    uDistance: { value: options.distance ?? 10 },
    uDustDensity: { value: options.dustDensity ?? 0.5 },
    uLightPosition: { value: lightPosition.clone() },
    uLightDirection: { value: lightDirection.clone().normalize() },
  };
}

export function createVolumetricPointLightUniforms(
  lightPosition: THREE.Vector3,
  lightColor: THREE.Color,
  options: {
    intensity?: number;
    radius?: number;
    dustDensity?: number;
    flicker?: number;
  } = {}
): VolumetricPointLightUniforms {
  return {
    uTime: { value: 0 },
    uLightColor: { value: lightColor.clone() },
    uIntensity: { value: options.intensity ?? 1.0 },
    uRadius: { value: options.radius ?? 5 },
    uDustDensity: { value: options.dustDensity ?? 0.5 },
    uFlicker: { value: options.flicker ?? 0 },
    uLightPosition: { value: lightPosition.clone() },
  };
}
