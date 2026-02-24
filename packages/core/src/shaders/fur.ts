/**
 * Fur shell shader - layered alpha-tested shells for volumetric fur effect
 * Enhanced with improved wind animation and mobile optimization
 *
 * Lifted from Otterfall procedural rendering system.
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

    // Extrude along normal
    vec3 pos = position + normal * (layerOffset * spacing);

    // Enhanced wind effect on fur tips - more natural movement
    if (layerOffset > 0.3) {
      float windStrength = layerOffset * layerOffset; // Quadratic for more tip movement
      pos.x += sin(time * 1.5 + position.y * 3.0 + position.z * 2.0) * 0.008 * windStrength;
      pos.z += cos(time * 1.8 + position.x * 2.5 + position.y * 3.0) * 0.006 * windStrength;
    }

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

  // Improved noise for fur strand variation
  float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = rand(i);
    float b = rand(i + vec2(1.0, 0.0));
    float c = rand(i + vec2(0.0, 1.0));
    float d = rand(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    // Multi-octave noise for more natural fur pattern
    float n = noise(vUv * 40.0) * 0.6 + noise(vUv * 80.0) * 0.4;

    // Alpha test - tapering strands toward tips with better distribution
    float threshold = 0.35 + vLayer * 0.65;
    if (n < threshold) discard;

    // Color gradient from base to tip with subtle variation
    vec3 col = mix(colorBase, colorTip, vLayer);

    // Enhanced ambient occlusion at roots
    float ao = 0.4 + 0.6 * vLayer;
    col *= ao;

    // Rim lighting effect for better depth perception
    float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
    col += vec3(0.1) * rim * vLayer;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Fur shader uniforms factory
 */
export function createFurUniforms(layerOffset: number = 0) {
  return {
    layerOffset: { value: layerOffset },
    spacing: { value: 0.02 },
    time: { value: 0 },
    colorBase: { value: [0.3, 0.2, 0.1] },
    colorTip: { value: [0.6, 0.5, 0.3] },
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
