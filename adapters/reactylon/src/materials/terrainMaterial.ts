/**
 * Babylon.js Terrain ShaderMaterial factory.
 *
 * Adapts Strata's simple terrain GLSL shaders for Babylon.js's ShaderMaterial API.
 * Provides noise-based height displacement with slope-dependent rock coloring.
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
 * Configuration for creating a Babylon.js terrain shader material.
 */
export interface BabylonTerrainMaterialOptions {
  /** Ground/grass color (hex string). */
  groundColor?: string;
  /** Rock/cliff color (hex string). */
  rockColor?: string;
  /** Surface roughness (0-1). */
  roughness?: number;
}

/**
 * Handle returned by the terrain material factory.
 */
export interface BabylonTerrainMaterialHandle {
  /** Get current uniform values. */
  getUniforms(): TerrainUniformValues;
  /** Vertex shader source adapted for Babylon.js. */
  vertexShader: string;
  /** Fragment shader source adapted for Babylon.js. */
  fragmentShader: string;
  /** Dispose of the material handle. */
  dispose(): void;
}

export interface TerrainUniformValues {
  uGroundColor: [number, number, number];
  uRockColor: [number, number, number];
  uRoughness: number;
}

/**
 * Babylon.js-adapted vertex shader for simple terrain.
 * Uses noise-based height displacement with normal calculation from derivatives.
 */
const babylonTerrainVertexShader = /* glsl */ `
  precision highp float;

  attribute vec3 position;
  attribute vec2 uv;

  uniform mat4 worldViewProjection;
  uniform mat4 world;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

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

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Add terrain height variation using noise
    float terrainNoise = noise(pos.xz * 0.1) * 2.0;
    terrainNoise += noise(pos.xz * 0.05) * 4.0;
    pos.y += terrainNoise;

    vPosition = pos;

    // Calculate normal from noise derivatives
    float eps = 0.1;
    float nx = noise((pos.xz + vec2(eps, 0.0)) * 0.1) - noise((pos.xz - vec2(eps, 0.0)) * 0.1);
    float nz = noise((pos.xz + vec2(0.0, eps)) * 0.1) - noise((pos.xz - vec2(0.0, eps)) * 0.1);
    vNormal = normalize(vec3(-nx * 10.0, 1.0, -nz * 10.0));

    gl_Position = worldViewProjection * vec4(pos, 1.0);
  }
`;

/**
 * Babylon.js-adapted fragment shader for simple terrain.
 */
const babylonTerrainFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 uGroundColor;
  uniform vec3 uRockColor;
  uniform float uRoughness;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;

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

  void main() {
    // Base color with noise variation
    float n = noise(vPosition.xz * 0.5);
    vec3 color = mix(uGroundColor * 0.8, uGroundColor * 1.2, n);

    // Add rock color based on slope
    float slope = 1.0 - vNormal.y;
    color = mix(color, uRockColor, smoothstep(0.3, 0.7, slope));

    // Simple lighting
    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
    float lighting = max(dot(vNormal, lightDir), 0.3);
    color *= lighting;

    // Add roughness variation
    float roughnessNoise = noise(vPosition.xz * 2.0);
    color *= 1.0 - uRoughness * roughnessNoise * 0.3;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/**
 * Create a Babylon.js-compatible terrain shader material handle.
 *
 * Usage with Babylon.js:
 * ```ts
 * const handle = createBabylonTerrainShaderMaterial({ groundColor: '#4a6630' });
 * const material = new BABYLON.ShaderMaterial('strataTerrain', scene, {
 *   vertexSource: handle.vertexShader,
 *   fragmentSource: handle.fragmentShader,
 * }, {
 *   attributes: ['position', 'uv'],
 *   uniforms: ['worldViewProjection', 'world', 'uGroundColor', 'uRockColor', 'uRoughness'],
 * });
 * const u = handle.getUniforms();
 * material.setColor3('uGroundColor', new BABYLON.Color3(...u.uGroundColor));
 * material.setColor3('uRockColor', new BABYLON.Color3(...u.uRockColor));
 * material.setFloat('uRoughness', u.uRoughness);
 * ```
 */
export function createBabylonTerrainShaderMaterial(
  options: BabylonTerrainMaterialOptions = {},
): BabylonTerrainMaterialHandle {
  const {
    groundColor = '#4a6630',
    rockColor = '#666666',
    roughness = 0.8,
  } = options;

  if (roughness < 0 || roughness > 1) {
    throw new Error('createBabylonTerrainShaderMaterial: roughness must be between 0 and 1');
  }

  const uniforms: TerrainUniformValues = {
    uGroundColor: hexToRgb(groundColor),
    uRockColor: hexToRgb(rockColor),
    uRoughness: roughness,
  };

  let disposed = false;

  return {
    vertexShader: babylonTerrainVertexShader,
    fragmentShader: babylonTerrainFragmentShader,

    getUniforms() {
      return { ...uniforms };
    },

    dispose() {
      disposed = true;
    },
  };
}
