/**
 * Procedural Cloud Shaders
 *
 * Noise-based cloud generation with FBM, wind movement, and day/night adaptation
 */

import * as THREE from 'three';

export const cloudLayerVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const cloudLayerFragmentShader = /* glsl */ `
  #define PI 3.14159265359

  uniform float uTime;
  uniform float uCoverage;
  uniform float uDensity;
  uniform float uAltitude;
  uniform vec3 uCloudColor;
  uniform vec3 uShadowColor;
  uniform vec2 uWindDirection;
  uniform float uWindSpeed;
  uniform float uSunIntensity;
  uniform float uSunAngle;
  uniform vec3 uSunColor;
  uniform float uScale;

  varying vec2 vUv;
  varying vec3 vWorldPosition;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxValue = 0.0;

    #define MAX_FBM_OCTAVES 8
    for (int i = 0; i < MAX_FBM_OCTAVES; i++) {
      if (i >= octaves) break;
      value += amplitude * noise(p * frequency);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return maxValue > 0.0 ? value / maxValue : 0.0;
  }

  void main() {
    vec2 windOffset = uWindDirection * uWindSpeed * uTime;
    vec2 samplePos = (vUv + windOffset) * uScale;

    float cloud = fbm(samplePos, 6);
    float detail = fbm(samplePos * 3.0 + 100.0, 4) * 0.5;
    cloud = cloud + detail * 0.3;

    float threshold = 1.0 - uCoverage;
    cloud = smoothstep(threshold - 0.1, threshold + 0.2, cloud);
    cloud *= uDensity;

    float heightGradient = fbm(samplePos * 0.5, 3);
    float cloudOpacity = cloud * (0.5 + heightGradient * 0.5);

    float sunHeight = sin(uSunAngle * PI / 180.0);
    vec3 lightDir = normalize(vec3(0.5, sunHeight, 0.5));
    float shadowSample = fbm(samplePos + lightDir.xz * 0.1, 4);
    float shadow = smoothstep(0.3, 0.7, shadowSample);

    vec3 baseColor = mix(uShadowColor, uCloudColor, shadow);
    vec3 sunTint = uSunColor * uSunIntensity * max(0.0, sunHeight);
    vec3 finalColor = baseColor + sunTint * 0.2 * cloud;

    float edgeFade = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
    edgeFade *= smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    cloudOpacity *= edgeFade;

    gl_FragColor = vec4(finalColor, cloudOpacity);
  }
`;

export const volumetricCloudVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const volumetricCloudFragmentShader = /* glsl */ `
  #define PI 3.14159265359

  uniform float uTime;
  uniform float uCoverage;
  uniform float uDensity;
  uniform float uCloudBase;
  uniform float uCloudHeight;
  uniform vec3 uCloudColor;
  uniform vec3 uShadowColor;
  uniform vec2 uWindDirection;
  uniform float uWindSpeed;
  uniform float uSunIntensity;
  uniform float uSunAngle;
  uniform vec3 uSunColor;
  uniform int uSteps;
  uniform int uLightSteps;

  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;

  float hash3D(vec3 p) {
    return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash3D(i);
    float n100 = hash3D(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash3D(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash3D(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash3D(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash3D(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash3D(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash3D(i + vec3(1.0, 1.0, 1.0));

    return mix(
      mix(mix(n000, n100, f.x), mix(n010, n110, f.x), f.y),
      mix(mix(n001, n101, f.x), mix(n011, n111, f.x), f.y),
      f.z
    );
  }

  float fbm3D(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    float maxValue = 0.0;

    for (int i = 0; i < 8; i++) {
      if (i >= octaves) break;
      value += amplitude * noise3D(p * frequency);
      maxValue += amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return maxValue > 0.0 ? value / maxValue : 0.0;
  }

  float sampleCloudDensity(vec3 pos) {
    float heightFactor = (pos.y - uCloudBase) / uCloudHeight;
    if (heightFactor < 0.0 || heightFactor > 1.0) return 0.0;

    float heightShape = 4.0 * heightFactor * (1.0 - heightFactor);

    vec3 windOffset = vec3(uWindDirection.x, 0.0, uWindDirection.y) * uWindSpeed * uTime;
    vec3 samplePos = (pos + windOffset) * 0.01;

    float baseCloud = fbm3D(samplePos, 5);
    float detail = fbm3D(samplePos * 4.0 + 50.0, 3) * 0.3;
    float cloud = baseCloud + detail;

    float threshold = 1.0 - uCoverage;
    cloud = smoothstep(threshold, threshold + 0.3, cloud);

    return cloud * heightShape * uDensity;
  }

  float lightMarch(vec3 pos) {
    float sunHeight = sin(uSunAngle * PI / 180.0);
    vec3 lightDir = normalize(vec3(0.3, max(0.1, sunHeight), 0.3));
    float stepSize = uCloudHeight / max(float(uLightSteps), 1.0);
    float totalDensity = 0.0;

    for (int i = 0; i < 16; i++) {
      if (i >= uLightSteps) break;
      pos += lightDir * stepSize;
      totalDensity += sampleCloudDensity(pos) * stepSize;
    }

    return exp(-totalDensity * 0.5);
  }

  void main() {
    vec3 rayDir = normalize(-vViewDirection);

    // Handle near-horizontal rays to prevent division by zero
    if (abs(rayDir.y) < 0.0001) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float tMin = (uCloudBase - vWorldPosition.y) / rayDir.y;
    float tMax = (uCloudBase + uCloudHeight - vWorldPosition.y) / rayDir.y;

    if (tMin > tMax) {
      float temp = tMin;
      tMin = tMax;
      tMax = temp;
    }

    tMin = max(0.0, tMin);
    tMax = max(0.0, tMax);

    if (tMin >= tMax) {
      gl_FragColor = vec4(0.0);
      return;
    }

    float stepSize = (tMax - tMin) / max(float(uSteps), 1.0);
    vec3 pos = vWorldPosition + rayDir * tMin;

    vec4 accumulatedColor = vec4(0.0);
    float accumulatedAlpha = 0.0;

    for (int i = 0; i < 64; i++) {
      if (i >= uSteps) break;
      if (accumulatedAlpha > 0.95) break;

      float density = sampleCloudDensity(pos);

      if (density > 0.01) {
        float lightTransmittance = lightMarch(pos);
        vec3 cloudCol = mix(uShadowColor, uCloudColor, lightTransmittance);
        cloudCol += uSunColor * uSunIntensity * lightTransmittance * 0.3;

        float alpha = density * stepSize * 2.0;
        alpha = 1.0 - exp(-alpha);

        accumulatedColor.rgb += cloudCol * alpha * (1.0 - accumulatedAlpha);
        accumulatedAlpha += alpha * (1.0 - accumulatedAlpha);
      }

      pos += rayDir * stepSize;
    }

    gl_FragColor = vec4(accumulatedColor.rgb, accumulatedAlpha);
  }
`;

export interface CloudLayerUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uCoverage: { value: number };
  uDensity: { value: number };
  uAltitude: { value: number };
  uCloudColor: { value: THREE.Color };
  uShadowColor: { value: THREE.Color };
  uWindDirection: { value: THREE.Vector2 };
  uWindSpeed: { value: number };
  uSunIntensity: { value: number };
  uSunAngle: { value: number };
  uSunColor: { value: THREE.Color };
  uScale: { value: number };
}

export interface VolumetricCloudUniforms {
  [uniform: string]: THREE.IUniform;
  uTime: { value: number };
  uCoverage: { value: number };
  uDensity: { value: number };
  uCloudBase: { value: number };
  uCloudHeight: { value: number };
  uCloudColor: { value: THREE.Color };
  uShadowColor: { value: THREE.Color };
  uWindDirection: { value: THREE.Vector2 };
  uWindSpeed: { value: number };
  uSunIntensity: { value: number };
  uSunAngle: { value: number };
  uSunColor: { value: THREE.Color };
  uSteps: { value: number };
  uLightSteps: { value: number };
}

export function createCloudLayerUniforms(options: {
  coverage?: number;
  density?: number;
  altitude?: number;
  cloudColor?: THREE.Color;
  shadowColor?: THREE.Color;
  windDirection?: THREE.Vector2;
  windSpeed?: number;
  sunIntensity?: number;
  sunAngle?: number;
  sunColor?: THREE.Color;
  scale?: number;
}): CloudLayerUniforms {
  return {
    uTime: { value: 0 },
    uCoverage: { value: options.coverage ?? 0.5 },
    uDensity: { value: options.density ?? 1.0 },
    uAltitude: { value: options.altitude ?? 100 },
    uCloudColor: { value: options.cloudColor?.clone() ?? new THREE.Color(1, 1, 1) },
    uShadowColor: { value: options.shadowColor?.clone() ?? new THREE.Color(0.7, 0.75, 0.85) },
    uWindDirection: { value: options.windDirection?.clone() ?? new THREE.Vector2(1, 0) },
    uWindSpeed: { value: options.windSpeed ?? 0.01 },
    uSunIntensity: { value: options.sunIntensity ?? 1.0 },
    uSunAngle: { value: options.sunAngle ?? 60 },
    uSunColor: { value: options.sunColor?.clone() ?? new THREE.Color(1, 0.95, 0.8) },
    uScale: { value: options.scale ?? 5.0 },
  };
}

export function createVolumetricCloudUniforms(options: {
  coverage?: number;
  density?: number;
  cloudBase?: number;
  cloudHeight?: number;
  cloudColor?: THREE.Color;
  shadowColor?: THREE.Color;
  windDirection?: THREE.Vector2;
  windSpeed?: number;
  sunIntensity?: number;
  sunAngle?: number;
  sunColor?: THREE.Color;
  steps?: number;
  lightSteps?: number;
}): VolumetricCloudUniforms {
  return {
    uTime: { value: 0 },
    uCoverage: { value: options.coverage ?? 0.5 },
    uDensity: { value: options.density ?? 1.0 },
    uCloudBase: { value: options.cloudBase ?? 50 },
    uCloudHeight: { value: options.cloudHeight ?? 50 },
    uCloudColor: { value: options.cloudColor?.clone() ?? new THREE.Color(1, 1, 1) },
    uShadowColor: { value: options.shadowColor?.clone() ?? new THREE.Color(0.6, 0.65, 0.75) },
    uWindDirection: { value: options.windDirection?.clone() ?? new THREE.Vector2(1, 0) },
    uWindSpeed: { value: options.windSpeed ?? 0.5 },
    uSunIntensity: { value: options.sunIntensity ?? 1.0 },
    uSunAngle: { value: options.sunAngle ?? 60 },
    uSunColor: { value: options.sunColor?.clone() ?? new THREE.Color(1, 0.95, 0.8) },
    uSteps: { value: options.steps ?? 32 },
    uLightSteps: { value: options.lightSteps ?? 4 },
  };
}
