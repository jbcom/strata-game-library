import * as THREE from 'three';
import type { IUniforms } from './types.js';

/**
 * Volumetric Rendering Shaders
 *
 * Raymarched volumetric effects for fog, underwater, and atmospheric scattering.
 *
 * Lifted from Otterfall procedural rendering system.
 */

// Common GLSL noise functions
const NOISE_GLSL = `
// Hash function
float hash(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yxz + 19.19);
    return fract((p.x + p.y) * p.z);
}

// 3D Value noise
float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n = mix(
        mix(
            mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
            mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x),
            f.y
        ),
        mix(
            mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
            mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x),
            f.y
        ),
        f.z
    );
    return n;
}

// FBM (Fractal Brownian Motion)
float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 6; i++) {
        if (i >= octaves) break;
        value += amplitude * noise(p * frequency);
        amplitude *= 0.5;
        frequency *= 2.0;
    }

    return value;
}
`;

// =============================================================================
// VOLUMETRIC FOG SHADER
// =============================================================================

export const volumetricFogVertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const volumetricFogFragmentShader = /* glsl */ `
    uniform sampler2D tDepth;
    uniform sampler2D tDiffuse;
    uniform float uCameraNear;
    uniform float uCameraFar;
    uniform vec3 uFogColor;
    uniform float uFogDensity;
    uniform float uFogHeight;
    uniform float uFogFalloff;
    uniform float uTime;
    uniform vec3 uLightDirection;
    uniform vec3 uLightColor;
    uniform float uScatteringStrength;
    uniform vec2 uResolution;
    uniform vec3 uCameraPosition;
    uniform mat4 uProjectionMatrixInverse;
    uniform mat4 uViewMatrixInverse;

    varying vec2 vUv;

    ${NOISE_GLSL}

    // Convert depth buffer value to linear depth
    float linearizeDepth(float depth) {
        float z = depth * 2.0 - 1.0;
        return (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
    }

    // Reconstruct world position from depth
    vec3 getWorldPosition(vec2 uv, float depth) {
        vec4 clipSpace = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 viewSpace = uProjectionMatrixInverse * clipSpace;
        if (abs(viewSpace.w) < 0.0001) {
            return vec3(0.0);
        }
        viewSpace /= viewSpace.w;
        vec4 worldSpace = uViewMatrixInverse * viewSpace;
        return worldSpace.xyz;
    }

    // Height-based fog density
    float getFogDensity(vec3 pos) {
        float heightFactor = exp(-uFogFalloff * max(0.0, pos.y - uFogHeight));

        // Add noise for volumetric look
        float noiseVal = fbm(pos * 0.05 + vec3(uTime * 0.02, 0.0, uTime * 0.01), 3);

        return uFogDensity * heightFactor * (0.5 + 0.5 * noiseVal);
    }

    // Light scattering (Mie/Rayleigh approximation)
    float getMieScattering(vec3 rayDir, vec3 lightDir) {
        float cosAngle = dot(rayDir, lightDir);
        float g = 0.7; // Anisotropy factor
        float phase = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * cosAngle, 1.5);
        return phase * 0.25;
    }

    void main() {
        vec4 sceneColor = texture2D(tDiffuse, vUv);
        float depth = texture2D(tDepth, vUv).r;

        // Skip sky (depth = 1)
        if (depth >= 1.0) {
            gl_FragColor = sceneColor;
            return;
        }

        vec3 worldPos = getWorldPosition(vUv, depth);
        vec3 rayDir = normalize(worldPos - uCameraPosition);
        float rayLength = length(worldPos - uCameraPosition);

        // Raymarch through fog
        #define MAX_STEPS 32
        float stepSize = rayLength / float(MAX_STEPS);

        vec3 fogAccum = vec3(0.0);
        float transmittance = 1.0;
        vec3 currentPos = uCameraPosition;

        vec3 lightDir = normalize(uLightDirection);

        for (int i = 0; i < MAX_STEPS; i++) {
            currentPos += rayDir * stepSize;

            float density = getFogDensity(currentPos);

            if (density > 0.001) {
                // Light scattering
                float scatter = getMieScattering(rayDir, lightDir);
                vec3 lightContribution = uLightColor * scatter * uScatteringStrength;

                // Accumulate fog color with light
                vec3 fogSample = uFogColor + lightContribution;

                float absorption = density * stepSize;
                fogAccum += fogSample * transmittance * absorption;
                transmittance *= exp(-absorption);

                if (transmittance < 0.01) break;
            }
        }

        // Blend fog with scene
        vec3 finalColor = sceneColor.rgb * transmittance + fogAccum;

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

export const volumetricFogShader = {
  vertexShader: volumetricFogVertexShader,
  fragmentShader: volumetricFogFragmentShader,
};

export function createVolumetricFogUniforms(): VolumetricFogUniforms {
  return {
    tDepth: { value: null },
    tDiffuse: { value: null },
    uCameraNear: { value: 0.1 },
    uCameraFar: { value: 1000.0 },
    uFogColor: { value: new THREE.Color(0.7, 0.8, 0.9) },
    uFogDensity: { value: 0.02 },
    uFogHeight: { value: 10.0 },
    uFogFalloff: { value: 0.1 },
    uTime: { value: 0 },
    uLightDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3) },
    uLightColor: { value: new THREE.Color(1.0, 0.95, 0.8) },
    uScatteringStrength: { value: 0.3 },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
    uCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
    uProjectionMatrixInverse: { value: null },
    uViewMatrixInverse: { value: null },
  };
}

// =============================================================================
// UNDERWATER SHADER
// =============================================================================

export const underwaterVertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const underwaterFragmentShader = /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform float uTime;
    uniform vec3 uWaterColor;
    uniform float uWaterDensity;
    uniform float uCausticStrength;
    uniform float uCausticScale;
    uniform float uWaterSurface;
    uniform vec3 uCameraPosition;
    uniform float uCameraNear;
    uniform float uCameraFar;
    uniform mat4 uProjectionMatrixInverse;
    uniform mat4 uViewMatrixInverse;

    varying vec2 vUv;

    ${NOISE_GLSL}

    // Caustic pattern using overlapping waves
    float caustics(vec2 uv, float time) {
        float c = 0.0;

        // Multiple layers of sine waves
        for (int i = 0; i < 3; i++) {
            float fi = float(i);
            vec2 p = uv * (1.0 + fi * 0.5) + time * (0.05 + fi * 0.02);
            float wave1 = sin(p.x * 10.0 + sin(p.y * 8.0 + time));
            float wave2 = sin(p.y * 12.0 + sin(p.x * 9.0 - time * 0.7));
            c += abs(wave1 * wave2) * (1.0 / (1.0 + fi));
        }

        return c / 3.0;
    }

    // Light rays from surface
    float godRays(vec2 uv, float depth, float time) {
        float rays = 0.0;

        // Multiple ray angles
        for (int i = 0; i < 4; i++) {
            float angle = float(i) * 0.78539; // PI/4
            vec2 dir = vec2(cos(angle), sin(angle));
            float ray = noise(vec3(uv * 3.0 + dir * time * 0.1, depth * 0.5));
            rays += ray * (1.0 / float(i + 1));
        }

        return rays * 0.5;
    }

    float linearizeDepth(float depth) {
        float z = depth * 2.0 - 1.0;
        return (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
    }

    vec3 getWorldPosition(vec2 uv, float depth) {
        vec4 clipSpace = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 viewSpace = uProjectionMatrixInverse * clipSpace;
        if (abs(viewSpace.w) < 0.0001) {
            return vec3(0.0);
        }
        viewSpace /= viewSpace.w;
        vec4 worldSpace = uViewMatrixInverse * viewSpace;
        return worldSpace.xyz;
    }

    void main() {
        vec4 sceneColor = texture2D(tDiffuse, vUv);
        float depth = texture2D(tDepth, vUv).r;

        // Check if camera is underwater
        if (uCameraPosition.y >= uWaterSurface) {
            gl_FragColor = sceneColor;
            return;
        }

        float linearDepth = linearizeDepth(depth);

        // Distance-based absorption
        float absorption = 1.0 - exp(-uWaterDensity * linearDepth);

        // Caustics on surfaces
        vec3 worldPos = getWorldPosition(vUv, depth);
        float causticPattern = caustics(worldPos.xz * uCausticScale, uTime);

        // Stronger caustics near surface
        float surfaceProximity = 1.0 - clamp((uWaterSurface - worldPos.y) / 10.0, 0.0, 1.0);
        causticPattern *= surfaceProximity * uCausticStrength;

        // God rays effect
        float rays = godRays(vUv, linearDepth, uTime) * surfaceProximity * 0.3;

        // Apply underwater color grading
        vec3 underwaterTint = mix(sceneColor.rgb, uWaterColor, absorption * 0.7);

        // Add caustics and rays
        underwaterTint += vec3(causticPattern) * (1.0 - absorption);
        underwaterTint += vec3(0.2, 0.4, 0.5) * rays;

        // Depth fog
        underwaterTint = mix(underwaterTint, uWaterColor, absorption * 0.5);

        gl_FragColor = vec4(underwaterTint, 1.0);
    }
`;

export const underwaterShader = {
  vertexShader: underwaterVertexShader,
  fragmentShader: underwaterFragmentShader,
};

export function createUnderwaterUniforms(): UnderwaterUniforms {
  return {
    tDiffuse: { value: null },
    tDepth: { value: null },
    uTime: { value: 0 },
    uWaterColor: { value: new THREE.Color(0.0, 0.3, 0.5) },
    uWaterDensity: { value: 0.1 },
    uCausticStrength: { value: 0.3 },
    uCausticScale: { value: 2.0 },
    uWaterSurface: { value: 0.0 },
    uCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
    uCameraNear: { value: 0.1 },
    uCameraFar: { value: 1000.0 },
    uProjectionMatrixInverse: { value: null },
    uViewMatrixInverse: { value: null },
  };
}

// =============================================================================
// ATMOSPHERIC SCATTERING
// =============================================================================

export const atmosphereVertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const atmosphereFragmentShader = /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform float uTime;
    uniform vec3 uSunDirection;
    uniform vec3 uSunColor;
    uniform vec3 uSkyColor;
    uniform float uRayleighCoeff;
    uniform float uMieCoeff;
    uniform vec3 uCameraPosition;
    uniform float uCameraNear;
    uniform float uCameraFar;
    uniform mat4 uProjectionMatrixInverse;
    uniform mat4 uViewMatrixInverse;

    varying vec2 vUv;

    const float PI = 3.14159265359;

    float rayleighPhase(float cosAngle) {
        return 0.75 * (1.0 + cosAngle * cosAngle);
    }

    float miePhase(float cosAngle, float g) {
        float g2 = g * g;
        return (1.0 - g2) / (4.0 * PI * pow(1.0 + g2 - 2.0 * g * cosAngle, 1.5));
    }

    float linearizeDepth(float depth) {
        float z = depth * 2.0 - 1.0;
        return (2.0 * uCameraNear * uCameraFar) / (uCameraFar + uCameraNear - z * (uCameraFar - uCameraNear));
    }

    vec3 getWorldPosition(vec2 uv, float depth) {
        vec4 clipSpace = vec4(uv * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        vec4 viewSpace = uProjectionMatrixInverse * clipSpace;
        if (abs(viewSpace.w) < 0.0001) {
            return vec3(0.0);
        }
        viewSpace /= viewSpace.w;
        vec4 worldSpace = uViewMatrixInverse * viewSpace;
        return worldSpace.xyz;
    }

    void main() {
        vec4 sceneColor = texture2D(tDiffuse, vUv);
        float depth = texture2D(tDepth, vUv).r;

        float linearDepth = linearizeDepth(depth);
        vec3 worldPos = getWorldPosition(vUv, depth);
        vec3 rayDir = normalize(worldPos - uCameraPosition);
        vec3 sunDir = normalize(uSunDirection);

        float cosAngle = dot(rayDir, sunDir);

        // Scattering calculations
        float rayleigh = rayleighPhase(cosAngle) * uRayleighCoeff;
        float mie = miePhase(cosAngle, 0.76) * uMieCoeff;

        // Distance-based scattering
        float scatterAmount = 1.0 - exp(-linearDepth * 0.001);

        // Combine scattering
        vec3 rayleighScatter = uSkyColor * rayleigh;
        vec3 mieScatter = uSunColor * mie;
        vec3 totalScatter = (rayleighScatter + mieScatter) * scatterAmount;

        // Apply atmospheric scattering
        vec3 finalColor = sceneColor.rgb + totalScatter;

        // Add sun disk for sky pixels
        if (depth >= 1.0) {
            float sunDisk = smoothstep(0.999, 0.9999, cosAngle);
            finalColor += uSunColor * sunDisk * 2.0;
        }

        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

export const atmosphereShader = {
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
};

export function createAtmosphereUniforms(): AtmosphereUniforms {
  return {
    tDiffuse: { value: null },
    tDepth: { value: null },
    uTime: { value: 0 },
    uSunDirection: { value: new THREE.Vector3(0.3, 0.7, 0.5) },
    uSunColor: { value: new THREE.Color(1.0, 0.9, 0.7) },
    uSkyColor: { value: new THREE.Color(0.4, 0.6, 0.9) },
    uRayleighCoeff: { value: 0.0025 },
    uMieCoeff: { value: 0.001 },
    uCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
    uCameraNear: { value: 0.1 },
    uCameraFar: { value: 1000.0 },
    uProjectionMatrixInverse: { value: null },
    uViewMatrixInverse: { value: null },
  };
}

// =============================================================================
// DUST PARTICLES (VOLUMETRIC)
// =============================================================================

export const dustParticlesVertexShader = /* glsl */ `
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

export const dustParticlesFragmentShader = /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uDensity;
    uniform float uParticleSize;
    uniform vec3 uLightDirection;
    uniform vec3 uCameraPosition;
    uniform vec2 uResolution;

    varying vec2 vUv;

    ${NOISE_GLSL}

    float dustParticle(vec3 pos, float size) {
        // Create discrete particles using 3D grid
        vec3 grid = fract(pos / size) - 0.5;
        float particle = length(grid) - 0.3;

        // Randomize per-cell
        vec3 cellId = floor(pos / size);
        float random = hash(cellId);

        // Only show some particles
        if (random > uDensity) return 0.0;

        // Particle brightness based on light direction
        vec3 lightDir = normalize(uLightDirection);
        float brightness = max(0.2, dot(normalize(grid), lightDir));

        return smoothstep(0.1, 0.0, particle) * brightness;
    }

    void main() {
        vec4 sceneColor = texture2D(tDiffuse, vUv);

        // Raymarch for dust particles
        vec3 rayOrigin = uCameraPosition;
        vec3 rayDir = normalize(vec3(
            (vUv.x - 0.5) * uResolution.x / uResolution.y,
            vUv.y - 0.5,
            1.0
        ));

        float dustAccum = 0.0;
        #define MAX_DUST_STEPS 16
        float stepSize = 2.0;

        vec3 pos = rayOrigin;
        for (int i = 0; i < MAX_DUST_STEPS; i++) {
            pos += rayDir * stepSize;

            // Animate dust floating
            vec3 animPos = pos + vec3(
                sin(uTime * 0.5 + pos.y) * 0.5,
                uTime * 0.2,
                cos(uTime * 0.3 + pos.x) * 0.5
            );

            dustAccum += dustParticle(animPos, uParticleSize * 20.0);
        }

        // Add dust glow to scene
        vec3 dustColor = vec3(1.0, 0.95, 0.85) * dustAccum * 0.02;

        gl_FragColor = vec4(sceneColor.rgb + dustColor, 1.0);
    }
`;

export const dustParticlesShader = {
  vertexShader: dustParticlesVertexShader,
  fragmentShader: dustParticlesFragmentShader,
};

export function createDustParticlesUniforms(): DustParticlesUniforms {
  return {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uDensity: { value: 0.02 },
    uParticleSize: { value: 0.01 },
    uLightDirection: { value: new THREE.Vector3(0.5, 0.8, 0.3) },
    uCameraPosition: { value: new THREE.Vector3(0, 0, 0) },
    uResolution: { value: new THREE.Vector2(1920, 1080) },
  };
}

export interface VolumetricFogUniforms extends IUniforms {
  tDepth: { value: THREE.Texture | null };
  tDiffuse: { value: THREE.Texture | null };
  uCameraNear: { value: number };
  uCameraFar: { value: number };
  uFogColor: { value: THREE.Color };
  uFogDensity: { value: number };
  uFogHeight: { value: number };
  uFogFalloff: { value: number };
  uTime: { value: number };
  uLightDirection: { value: THREE.Vector3 };
  uLightColor: { value: THREE.Color };
  uScatteringStrength: { value: number };
  uResolution: { value: THREE.Vector2 };
  uCameraPosition: { value: THREE.Vector3 };
  uProjectionMatrixInverse: { value: THREE.Matrix4 | null };
  uViewMatrixInverse: { value: THREE.Matrix4 | null };
}

export interface UnderwaterUniforms extends IUniforms {
  tDiffuse: { value: THREE.Texture | null };
  tDepth: { value: THREE.Texture | null };
  uTime: { value: number };
  uWaterColor: { value: THREE.Color };
  uWaterDensity: { value: number };
  uCausticStrength: { value: number };
  uCausticScale: { value: number };
  uWaterSurface: { value: number };
  uCameraPosition: { value: THREE.Vector3 };
  uCameraNear: { value: number };
  uCameraFar: { value: number };
  uProjectionMatrixInverse: { value: THREE.Matrix4 | null };
  uViewMatrixInverse: { value: THREE.Matrix4 | null };
}

export interface AtmosphereUniforms extends IUniforms {
  tDiffuse: { value: THREE.Texture | null };
  tDepth: { value: THREE.Texture | null };
  uTime: { value: number };
  uSunDirection: { value: THREE.Vector3 };
  uSunColor: { value: THREE.Color };
  uSkyColor: { value: THREE.Color };
  uRayleighCoeff: { value: number };
  uMieCoeff: { value: number };
  uCameraPosition: { value: THREE.Vector3 };
  uCameraNear: { value: number };
  uCameraFar: { value: number };
  uProjectionMatrixInverse: { value: THREE.Matrix4 | null };
  uViewMatrixInverse: { value: THREE.Matrix4 | null };
}

export interface DustParticlesUniforms extends IUniforms {
  tDiffuse: { value: THREE.Texture | null };
  uTime: { value: number };
  uDensity: { value: number };
  uParticleSize: { value: number };
  uLightDirection: { value: THREE.Vector3 };
  uCameraPosition: { value: THREE.Vector3 };
  uResolution: { value: THREE.Vector2 };
}
