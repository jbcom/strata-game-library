/**
 * Babylon.js Water ShaderMaterial factory.
 *
 * Adapts Strata's GLSL water shaders for Babylon.js's ShaderMaterial API.
 * Babylon.js uses a different uniform binding model than Three.js, so we
 * translate the shader uniforms into Babylon.js-compatible structures.
 *
 * The GLSL shader code from @strata-game-library/shaders is portable
 * between renderers; only the uniform binding and built-in variable
 * mappings differ.
 */

/**
 * Parsed hex color as [r, g, b] floats in 0-1 range.
 */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return [(num >> 16) / 255, ((num >> 8) & 0xff) / 255, (num & 0xff) / 255];
}

/**
 * Configuration for creating a Babylon.js water shader material.
 */
export interface BabylonWaterMaterialOptions {
  /** Surface water color (hex string). */
  waterColor?: string;
  /** Deep water color (hex string). */
  deepWaterColor?: string;
  /** Foam color (hex string). */
  foamColor?: string;
  /** Caustic intensity 0-1. */
  causticIntensity?: number;
  /** Wave height multiplier. */
  waveHeight?: number;
}

/**
 * Handle returned by the water material factory.
 * Provides methods to update uniforms and retrieve shader configuration.
 */
export interface BabylonWaterMaterialHandle {
  /** Update the time uniform for wave animation. */
  updateTime(time: number): void;
  /** Get the current uniform values. */
  getUniforms(): WaterUniformValues;
  /** Get the vertex shader GLSL source (adapted for Babylon.js). */
  vertexShader: string;
  /** Get the fragment shader GLSL source (adapted for Babylon.js). */
  fragmentShader: string;
  /** Dispose of the material handle. */
  dispose(): void;
}

export interface WaterUniformValues {
  uTime: number;
  uWaterColor: [number, number, number];
  uDeepWaterColor: [number, number, number];
  uFoamColor: [number, number, number];
  uCausticIntensity: number;
  uWaveHeight: number;
}

/**
 * Babylon.js-adapted vertex shader for advanced water.
 *
 * Babylon.js uses different built-in attribute/uniform names:
 * - `position` -> `position` (same)
 * - `uv` -> `uv` (same)
 * - `projectionMatrix * modelViewMatrix` -> `worldViewProjection`
 * - `modelMatrix` -> `world`
 *
 * We use Babylon.js's ShaderMaterial conventions with explicit attributes.
 */
const babylonWaterVertexShader = /* glsl */ `
  precision highp float;

  // Babylon.js built-in attributes
  attribute vec3 position;
  attribute vec2 uv;

  // Babylon.js built-in uniforms
  uniform mat4 worldViewProjection;
  uniform mat4 world;

  // Custom uniforms
  uniform float uTime;
  uniform float uWaveHeight;

  // Varyings
  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vElevation;

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

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;

    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return value;
  }

  void main() {
    vUv = uv;
    vPosition = position;

    vec3 pos = position;

    float wave1 = sin(pos.x * 0.4 + uTime * 0.8) * 0.15 * uWaveHeight;
    float wave2 = sin(pos.z * 0.3 + uTime * 1.2) * 0.12 * uWaveHeight;
    float wave3 = sin((pos.x + pos.z) * 0.2 + uTime * 0.6) * 0.1 * uWaveHeight;

    float noiseValue = fbm(vec2(pos.x * 0.1, pos.z * 0.1) + uTime * 0.05);

    pos.y += wave1 + wave2 + wave3 + noiseValue * 0.1 * uWaveHeight;

    vElevation = pos.y;
    gl_Position = worldViewProjection * vec4(pos, 1.0);
  }
`;

/**
 * Babylon.js-adapted fragment shader for advanced water with caustics.
 */
const babylonWaterFragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uWaterColor;
  uniform vec3 uDeepWaterColor;
  uniform vec3 uFoamColor;
  uniform float uCausticIntensity;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying float vElevation;

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

  float caustic(vec2 uv, float time) {
    vec2 p = uv * 10.0;

    float c1 = noise(p + time * 0.3);
    float c2 = noise(p * 1.5 - time * 0.2);
    float c3 = noise(p * 2.0 + time * 0.4);

    return (c1 + c2 + c3) / 3.0;
  }

  void main() {
    vec2 causticUV = vUv + vec2(sin(uTime * 0.5) * 0.1, cos(uTime * 0.3) * 0.1);
    float causticPattern = caustic(causticUV, uTime);
    causticPattern = pow(causticPattern, 2.0) * uCausticIntensity;

    float depthFactor = smoothstep(-0.1, 0.1, vElevation);
    vec3 waterColor = mix(uDeepWaterColor, uWaterColor, depthFactor);

    vec3 finalColor = waterColor + vec3(causticPattern);

    if (vElevation > 0.08) {
      finalColor = mix(finalColor, uFoamColor, smoothstep(0.08, 0.12, vElevation));
    }

    float fresnel = pow(1.0 - abs(dot(normalize(vPosition), vec3(0.0, 0.0, 1.0))), 2.0);
    finalColor += vec3(fresnel * 0.1);

    gl_FragColor = vec4(finalColor, 0.75);
  }
`;

/**
 * Create a Babylon.js-compatible water shader material handle.
 *
 * Returns a handle with shader sources adapted for Babylon.js's built-in
 * uniform names and an API to update uniforms per frame.
 *
 * Usage with Babylon.js directly:
 * ```ts
 * const handle = createBabylonWaterShaderMaterial({ waterColor: '#2a5a8a' });
 * const material = new BABYLON.ShaderMaterial('strataWater', scene, {
 *   vertexSource: handle.vertexShader,
 *   fragmentSource: handle.fragmentShader,
 * }, {
 *   attributes: ['position', 'uv'],
 *   uniforms: ['worldViewProjection', 'world', 'uTime', 'uWaveHeight',
 *              'uWaterColor', 'uDeepWaterColor', 'uFoamColor', 'uCausticIntensity'],
 * });
 * const uniforms = handle.getUniforms();
 * material.setFloat('uTime', uniforms.uTime);
 * material.setColor3('uWaterColor', new BABYLON.Color3(...uniforms.uWaterColor));
 * // ... etc
 * ```
 */
export function createBabylonWaterShaderMaterial(
  options: BabylonWaterMaterialOptions = {},
): BabylonWaterMaterialHandle {
  const {
    waterColor = '#2a5a8a',
    deepWaterColor = '#1a3a5a',
    foamColor = '#8ab4d4',
    causticIntensity = 0.4,
    waveHeight = 0.5,
  } = options;

  if (causticIntensity < 0 || causticIntensity > 1) {
    throw new Error('createBabylonWaterShaderMaterial: causticIntensity must be between 0 and 1');
  }

  const uniforms: WaterUniformValues = {
    uTime: 0,
    uWaterColor: hexToRgb(waterColor),
    uDeepWaterColor: hexToRgb(deepWaterColor),
    uFoamColor: hexToRgb(foamColor),
    uCausticIntensity: causticIntensity,
    uWaveHeight: waveHeight,
  };

  let disposed = false;

  return {
    vertexShader: babylonWaterVertexShader,
    fragmentShader: babylonWaterFragmentShader,

    updateTime(time: number) {
      if (!disposed) {
        uniforms.uTime = time;
      }
    },

    getUniforms() {
      return { ...uniforms };
    },

    dispose() {
      disposed = true;
    },
  };
}
