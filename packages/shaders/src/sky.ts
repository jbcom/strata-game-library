/**
 * Procedural Sky Shaders
 *
 * Day/night cycle, stars, weather effects
 */

export const skyVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const skyFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uSunIntensity;
  uniform float uSunAngle;
  uniform float uAmbientLight;
  uniform float uStarVisibility;
  uniform float uFogDensity;
  uniform float uWeatherIntensity;
  uniform vec2 uGyroTilt;

  varying vec2 vUv;
  varying vec3 vPosition;

  // Simple noise for stars
  float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  // Sky gradient based on time of day
  vec3 getSkyColor(float height) {
      // Day sky: blue gradient
      vec3 daySkyTop = vec3(0.4, 0.6, 0.9);
      vec3 daySkyHorizon = vec3(0.7, 0.8, 0.95);

      // Night sky: dark blue/black
      vec3 nightSkyTop = vec3(0.01, 0.01, 0.05);
      vec3 nightSkyHorizon = vec3(0.1, 0.1, 0.2);

      // Interpolate based on sun intensity
      vec3 skyTop = mix(nightSkyTop, daySkyTop, uSunIntensity);
      vec3 skyHorizon = mix(nightSkyHorizon, daySkyHorizon, uSunIntensity);

      return mix(skyHorizon, skyTop, height);
  }

  void main() {
      // Apply gyroscopic tilt to UV
      vec2 adjustedUv = vUv + uGyroTilt;

      // Calculate height with horizon adjustment
      float height = adjustedUv.y;

      // Base sky color
      vec3 skyColor = getSkyColor(height);

      // Add stars at night
      if (uStarVisibility > 0.0) {
          float starNoise = hash(floor(adjustedUv * 200.0));
          if (starNoise > 0.995) {
              float starBrightness = (starNoise - 0.995) * 200.0;
              skyColor += vec3(starBrightness) * uStarVisibility;
          }
      }

      // Add sun glow
      if (uSunIntensity > 0.0) {
          float sunY = (uSunAngle / 180.0); // 0 to 1
          float distToSun = distance(adjustedUv, vec2(0.5, sunY));
          float sunGlow = smoothstep(0.2, 0.0, distToSun) * uSunIntensity;
          skyColor += vec3(1.0, 0.9, 0.7) * sunGlow;
      }

      // Weather effects (fog/clouds)
      if (uWeatherIntensity > 0.0) {
          float cloudNoise = hash(floor(adjustedUv * 10.0 + vec2(uTime * 0.1)));
          vec3 cloudColor = vec3(0.8, 0.8, 0.85);
          skyColor = mix(skyColor, cloudColor, cloudNoise * uWeatherIntensity * 0.5);
      }

      // Apply fog density
      if (uFogDensity > 0.0) {
          vec3 fogColor = vec3(0.9, 0.9, 0.95);
          skyColor = mix(skyColor, fogColor, uFogDensity * (1.0 - height));
      }

      // Apply ambient lighting
      skyColor *= (0.5 + uAmbientLight * 0.5);

      gl_FragColor = vec4(skyColor, 1.0);
  }
`;

import * as THREE from 'three';

export interface SkyUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uSunIntensity: { value: number };
  uSunAngle: { value: number };
  uAmbientLight: { value: number };
  uStarVisibility: { value: number };
  uFogDensity: { value: number };
  uWeatherIntensity: { value: number };
  uGyroTilt: { value: THREE.Vector2 };
}

export function createSkyUniforms(
  timeOfDay: {
    sunIntensity: number;
    sunAngle: number;
    ambientLight: number;
    starVisibility: number;
    fogDensity: number;
  },
  weather: { intensity: number },
  gyroTilt?: THREE.Vector2
): SkyUniforms {
  return {
    uTime: { value: 0 },
    uSunIntensity: { value: timeOfDay.sunIntensity },
    uSunAngle: { value: timeOfDay.sunAngle },
    uAmbientLight: { value: timeOfDay.ambientLight },
    uStarVisibility: { value: timeOfDay.starVisibility },
    uFogDensity: { value: timeOfDay.fogDensity },
    uWeatherIntensity: { value: weather.intensity },
    uGyroTilt: { value: gyroTilt || new THREE.Vector2(0, 0) },
  };
}
