/**
 * Water shader - animated rippling water surface with procedural normal mapping
 *
 * Lifted from Otterfall procedural rendering system.
 */

export const waterVertexShader = /* glsl */ `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;

    vec3 pos = position;

    // Multi-layered wave displacement for more realistic water
    float wave1 = sin(pos.x * 0.5 + time) * 0.05;
    float wave2 = cos(pos.z * 0.3 + time * 1.3) * 0.03;
    float wave3 = sin(pos.x * 1.2 - pos.z * 0.8 + time * 0.7) * 0.02;
    pos.y += wave1 + wave2 + wave3;

    // Calculate approximate normal from wave derivatives
    float dx = cos(pos.x * 0.5 + time) * 0.025 + sin(pos.x * 1.2 - pos.z * 0.8 + time * 0.7) * 0.024;
    float dz = -sin(pos.z * 0.3 + time * 1.3) * 0.009 - cos(pos.x * 1.2 - pos.z * 0.8 + time * 0.7) * 0.016;

    vec3 tangentX = normalize(vec3(1.0, dx, 0.0));
    vec3 tangentZ = normalize(vec3(0.0, dz, 1.0));
    vNormal = normalize(cross(tangentZ, tangentX));

    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

    // Calculate view direction for fresnel
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const waterFragmentShader = /* glsl */ `
  uniform float time;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  // Procedural noise for water detail
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

  // Fresnel effect for realistic water reflections
  float fresnel(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
  }

  // Procedural normal map simulation
  vec3 proceduralNormal(vec2 uv, float time) {
    // Two layers of scrolling noise for normal perturbation
    vec2 uv1 = uv * 4.0 + vec2(time * 0.05, time * 0.03);
    vec2 uv2 = uv * 3.0 - vec2(time * 0.04, time * 0.06);

    float n1 = noise(uv1);
    float n2 = noise(uv2);

    // Create normal perturbation
    vec3 normalOffset = vec3(
      (n1 - 0.5) * 0.3,
      1.0,
      (n2 - 0.5) * 0.3
    );

    return normalize(normalOffset);
  }

  void main() {
    // Base water colors
    vec3 deepColor = vec3(0.02, 0.1, 0.15);
    vec3 shallowColor = vec3(0.1, 0.3, 0.4);
    vec3 foamColor = vec3(0.8, 0.9, 0.95);
    vec3 reflectionColor = vec3(0.6, 0.7, 0.8);

    // Animated UV scrolling for detail
    vec2 scrollUV1 = vWorldPos.xz * 0.5 + vec2(time * 0.02, time * 0.015);
    vec2 scrollUV2 = vWorldPos.xz * 0.3 - vec2(time * 0.015, time * 0.025);

    // Multi-layered ripple pattern with UV scrolling
    float ripple1 = sin(scrollUV1.x * 4.0) * cos(scrollUV1.y * 3.0);
    float ripple2 = sin(scrollUV2.x * 5.0) * cos(scrollUV2.y * 4.0);
    float ripple = (ripple1 + ripple2) * 0.25 + 0.5;

    // Procedural normal map for surface detail
    vec3 detailNormal = proceduralNormal(vWorldPos.xz * 0.2, time);
    vec3 finalNormal = normalize(vNormal + detailNormal * 0.3);

    // Depth gradient based on distance from center
    float depth = length(vWorldPos.xz) / 50.0;
    depth = clamp(depth, 0.0, 1.0);

    // Fresnel effect for reflections
    float fresnelFactor = fresnel(vViewDir, finalNormal, 3.0);

    // Mix colors based on depth
    vec3 col = mix(shallowColor, deepColor, depth);

    // Add ripple highlights
    col += ripple * 0.08;

    // Add fresnel reflections
    col = mix(col, reflectionColor, fresnelFactor * 0.4);

    // Foam at edges (shallow water) with animated detail
    float foamNoise = noise(vWorldPos.xz * 2.0 + time * 0.5);
    float foam = smoothstep(0.8, 1.0, 1.0 - depth) * ripple * foamNoise;
    col = mix(col, foamColor, foam * 0.4);

    // Specular highlights from normal
    vec3 lightDir = normalize(vec3(1.0, 1.0, 0.5));
    float specular = pow(max(dot(reflect(-lightDir, finalNormal), vViewDir), 0.0), 32.0);
    col += specular * 0.3;

    // Transparency based on depth and fresnel
    float alpha = mix(0.6, 0.9, depth) * (1.0 - fresnelFactor * 0.2);

    gl_FragColor = vec4(col, alpha);
  }
`;

/**
 * Advanced water shader with caustics
 *
 * Lifted from Otterfall prototype.
 */
export const advancedWaterVertexShader = /* glsl */ `
  uniform float uTime;
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

    float wave1 = sin(pos.x * 0.4 + uTime * 0.8) * 0.15;
    float wave2 = sin(pos.y * 0.3 + uTime * 1.2) * 0.12;
    float wave3 = sin((pos.x + pos.y) * 0.2 + uTime * 0.6) * 0.1;

    float noiseValue = fbm(vec2(pos.x * 0.1, pos.y * 0.1) + uTime * 0.05);

    pos.z += wave1 + wave2 + wave3 + noiseValue * 0.1;

    vElevation = pos.z;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const advancedWaterFragmentShader = /* glsl */ `
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
 * Water shader uniforms factory
 */
export function createWaterUniforms() {
  return {
    time: { value: 0 },
  };
}

/**
 * Advanced water uniforms factory
 */
export function createAdvancedWaterUniforms() {
  return {
    uTime: { value: 0 },
    uWaterColor: { value: [0.165, 0.353, 0.541] },
    uDeepWaterColor: { value: [0.102, 0.227, 0.353] },
    uFoamColor: { value: [0.541, 0.706, 0.831] },
    uCausticIntensity: { value: 0.4 },
  };
}
