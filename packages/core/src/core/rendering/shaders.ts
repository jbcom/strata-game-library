/**
 * Core shader utilities for Strata
 * Provides reusable GLSL snippets, noise functions, and shader composition helpers.
 * @category Rendering Pipeline
 * @module core/shaders
 */

export const ShaderChunks = {
  noise: {
    rand: /* glsl */ `
float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}`,
    rand3: /* glsl */ `
float rand3(vec3 co) {
    return fract(sin(dot(co, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}`,
    simplex2D: /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

float simplex2D(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}`,
    simplex3D: /* glsl */ `
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float simplex3D(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}`,
    perlin2D: /* glsl */ `
vec2 fade(vec2 t) { return t * t * t * (t * (t * 6.0 - 15.0) + 10.0); }

float perlin2D(vec2 P) {
    vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod(Pi, 289.0);
    vec4 ix = Pi.xzxz;
    vec4 iy = Pi.yyww;
    vec4 fx = Pf.xzxz;
    vec4 fy = Pf.yyww;
    vec4 i = permute(permute(ix) + iy);
    vec4 gx = 2.0 * fract(i * 0.0243902439) - 1.0;
    vec4 gy = abs(gx) - 0.5;
    vec4 tx = floor(gx + 0.5);
    gx = gx - tx;
    vec2 g00 = vec2(gx.x, gy.x);
    vec2 g10 = vec2(gx.y, gy.y);
    vec2 g01 = vec2(gx.z, gy.z);
    vec2 g11 = vec2(gx.w, gy.w);
    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;
    float n00 = dot(g00, vec2(fx.x, fy.x));
    float n10 = dot(g10, vec2(fx.y, fy.y));
    float n01 = dot(g01, vec2(fx.z, fy.z));
    float n11 = dot(g11, vec2(fx.w, fy.w));
    vec2 fade_xy = fade(Pf.xy);
    vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}`,
    worley: /* glsl */ `
vec2 worleyHash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}

float worley(vec2 p, float scale) {
    p *= scale;
    vec2 n = floor(p);
    vec2 f = fract(p);
    float dist = 1.0;
    for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
            vec2 g = vec2(float(i), float(j));
            vec2 o = worleyHash(n + g);
            vec2 r = g + o - f;
            float d = dot(r, r);
            dist = min(dist, d);
        }
    }
    return sqrt(dist);
}`,
    fbm: /* glsl */ `
float fbm(vec2 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        value += amplitude * simplex2D(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}`,
    fbm3D: /* glsl */ `
float fbm3D(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 8; i++) {
        if (i >= octaves) break;
        value += amplitude * simplex3D(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}`,
  },
  lighting: {
    toon: /* glsl */ `
float toonShading(float intensity, float levels) {
    return floor(intensity * levels) / levels;
}

vec3 toonLight(vec3 normal, vec3 lightDir, vec3 color, float levels) {
    float NdotL = max(dot(normal, lightDir), 0.0);
    float toon = toonShading(NdotL, levels);
    return color * toon;
}`,
    fresnel: /* glsl */ `
float fresnel(vec3 viewDir, vec3 normal, float power) {
    return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
}

vec3 fresnelColor(vec3 viewDir, vec3 normal, vec3 baseColor, vec3 fresnelColor, float power) {
    float f = fresnel(viewDir, normal, power);
    return mix(baseColor, fresnelColor, f);
}`,
    rim: /* glsl */ `
float rimLight(vec3 viewDir, vec3 normal, float power, float strength) {
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    return pow(rim, power) * strength;
}

vec3 rimColor(vec3 viewDir, vec3 normal, vec3 baseColor, vec3 rimCol, float power, float strength) {
    float rim = rimLight(viewDir, normal, power, strength);
    return baseColor + rimCol * rim;
}`,
    specular: /* glsl */ `
float blinnPhong(vec3 normal, vec3 viewDir, vec3 lightDir, float shininess) {
    vec3 halfDir = normalize(lightDir + viewDir);
    return pow(max(dot(normal, halfDir), 0.0), shininess);
}`,
  },
  uv: {
    triplanar: /* glsl */ `
vec3 triplanarBlend(vec3 normal) {
    vec3 blend = abs(normal);
    blend = pow(blend, vec3(4.0));
    blend /= dot(blend, vec3(1.0));
    return blend;
}

vec4 triplanarSample(sampler2D tex, vec3 position, vec3 normal, float scale) {
    vec3 blend = triplanarBlend(normal);
    vec4 xAxis = texture2D(tex, position.yz * scale);
    vec4 yAxis = texture2D(tex, position.xz * scale);
    vec4 zAxis = texture2D(tex, position.xy * scale);
    return xAxis * blend.x + yAxis * blend.y + zAxis * blend.z;
}`,
    parallax: /* glsl */ `
vec2 parallaxMapping(vec2 uv, vec3 viewDir, sampler2D heightMap, float scale) {
    float height = texture2D(heightMap, uv).r;
    // Prevent division by zero when viewing parallel to surface
    float viewZ = max(abs(viewDir.z), 0.001);
    vec2 offset = viewDir.xy / viewZ * (height * scale);
    return uv - offset;
}

vec2 steepParallax(vec2 uv, vec3 viewDir, sampler2D heightMap, float scale, int layers) {
    float layerDepth = 1.0 / float(layers);
    float currentDepth = 0.0;
    vec2 deltaUV = viewDir.xy * scale / float(layers);
    vec2 currentUV = uv;
    float depthValue = texture2D(heightMap, currentUV).r;
    for (int i = 0; i < 32; i++) {
        if (i >= layers) break;
        if (currentDepth >= depthValue) break;
        currentUV -= deltaUV;
        depthValue = texture2D(heightMap, currentUV).r;
        currentDepth += layerDepth;
    }
    return currentUV;
}`,
    distortion: /* glsl */ `
vec2 waveDistort(vec2 uv, float time, float amplitude, float frequency) {
    uv.x += sin(uv.y * frequency + time) * amplitude;
    uv.y += cos(uv.x * frequency + time) * amplitude;
    return uv;
}

vec2 radialDistort(vec2 uv, vec2 center, float strength) {
    vec2 delta = uv - center;
    float dist = length(delta);
    float distortion = 1.0 + strength * dist * dist;
    return center + delta * distortion;
}`,
    rotation: /* glsl */ `
vec2 rotateUV(vec2 uv, float angle, vec2 pivot) {
    float c = cos(angle);
    float s = sin(angle);
    uv -= pivot;
    uv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
    return uv + pivot;
}`,
  },
  color: {
    palette: /* glsl */ `
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

vec3 rainbowPalette(float t) {
    return palette(t, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.0, 0.33, 0.67));
}

vec3 firePalette(float t) {
    return palette(t, vec3(0.5, 0.5, 0.5), vec3(0.5, 0.5, 0.5), vec3(1.0, 1.0, 1.0), vec3(0.0, 0.1, 0.2));
}`,
    gradient: /* glsl */ `
vec3 gradient2(vec3 color1, vec3 color2, float t) {
    return mix(color1, color2, clamp(t, 0.0, 1.0));
}

vec3 gradient3(vec3 color1, vec3 color2, vec3 color3, float t) {
    t = clamp(t, 0.0, 1.0);
    if (t < 0.5) {
        return mix(color1, color2, t * 2.0);
    }
    return mix(color2, color3, (t - 0.5) * 2.0);
}`,
    posterize: /* glsl */ `
vec3 posterize(vec3 color, float levels) {
    return floor(color * levels + 0.5) / levels;
}

float posterizeValue(float value, float levels) {
    return floor(value * levels + 0.5) / levels;
}`,
    hsv: /* glsl */ `
vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}`,
    saturation: /* glsl */ `
vec3 adjustSaturation(vec3 color, float saturation) {
    float grey = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(grey), color, saturation);
}`,
    contrast: /* glsl */ `
vec3 adjustContrast(vec3 color, float contrast) {
    return (color - 0.5) * contrast + 0.5;
}`,
  },
  animation: {
    time: /* glsl */ `
float pulse(float time, float frequency) {
    return (sin(time * frequency) + 1.0) * 0.5;
}

float sawtooth(float time, float frequency) {
    return fract(time * frequency);
}

float triangle(float time, float frequency) {
    float t = fract(time * frequency);
    return abs(t * 2.0 - 1.0);
}

float square(float time, float frequency) {
    return step(0.5, fract(time * frequency));
}`,
    easing: /* glsl */ `
float easeInQuad(float t) { return t * t; }
float easeOutQuad(float t) { return 1.0 - (1.0 - t) * (1.0 - t); }
float easeInOutQuad(float t) { return t < 0.5 ? 2.0 * t * t : 1.0 - pow(-2.0 * t + 2.0, 2.0) / 2.0; }
float easeInCubic(float t) { return t * t * t; }
float easeOutCubic(float t) { return 1.0 - pow(1.0 - t, 3.0); }
float easeInOutCubic(float t) { return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0; }
float easeOutElastic(float t) {
    float c4 = 6.283185 / 3.0;
    return t == 0.0 ? 0.0 : t == 1.0 ? 1.0 : pow(2.0, -10.0 * t) * sin((t * 10.0 - 0.75) * c4) + 1.0;
}
float easeOutBounce(float t) {
    float n1 = 7.5625;
    float d1 = 2.75;
    if (t < 1.0 / d1) return n1 * t * t;
    else if (t < 2.0 / d1) { t -= 1.5 / d1; return n1 * t * t + 0.75; }
    else if (t < 2.5 / d1) { t -= 2.25 / d1; return n1 * t * t + 0.9375; }
    else { t -= 2.625 / d1; return n1 * t * t + 0.984375; }
}`,
  },
  effects: {
    scanline: /* glsl */ `
float scanline(vec2 uv, float density, float opacity) {
    return 1.0 - step(opacity, sin(uv.y * density * 3.14159));
}

vec3 applyScanlines(vec3 color, vec2 uv, float density, float opacity) {
    float scan = scanline(uv, density, opacity);
    return color * (1.0 - opacity + scan * opacity);
}`,
    glitch: /* glsl */ `
vec2 glitchOffset(vec2 uv, float time, float intensity) {
    float noise = rand(vec2(floor(time * 20.0), floor(uv.y * 20.0)));
    float offset = (noise - 0.5) * intensity * step(0.98, rand(vec2(time)));
    return vec2(uv.x + offset, uv.y);
}

vec3 rgbShift(sampler2D tex, vec2 uv, float amount) {
    float r = texture2D(tex, uv + vec2(amount, 0.0)).r;
    float g = texture2D(tex, uv).g;
    float b = texture2D(tex, uv - vec2(amount, 0.0)).b;
    return vec3(r, g, b);
}`,
    hologram: /* glsl */ `
float hologramScanline(float y, float time, float density) {
    return sin(y * density + time * 10.0) * 0.5 + 0.5;
}

float hologramFlicker(float time) {
    return 0.95 + rand(vec2(floor(time * 30.0))) * 0.05;
}

vec3 hologramColor(vec3 baseColor, float scanline, float flicker, float alpha) {
    return baseColor * scanline * flicker * alpha;
}`,
    dissolve: /* glsl */ `
float dissolveEdge(float noise, float progress, float edgeWidth) {
    float edge = smoothstep(progress - edgeWidth, progress, noise);
    float inner = smoothstep(progress, progress + edgeWidth, noise);
    return edge - inner;
}

vec4 dissolveWithEdge(vec3 baseColor, vec3 edgeColor, float noise, float progress, float edgeWidth) {
    float edge = dissolveEdge(noise, progress, edgeWidth);
    float alpha = step(progress, noise);
    vec3 color = mix(baseColor, edgeColor, edge);
    return vec4(color, alpha);
}`,
  },
};

/**
 * Represents a single uniform value.
 * @category Rendering Pipeline
 */
export interface ShaderUniform {
  value: number | number[] | Float32Array;
}

/**
 * Collection of shader uniforms.
 * @category Rendering Pipeline
 */
export interface ShaderUniforms {
  [key: string]: ShaderUniform;
}

/**
 * Create a time uniform.
 * @category Rendering Pipeline
 */
export function createTimeUniform(): ShaderUniform {
  return { value: 0 };
}

/**
 * Create a progress uniform.
 * @category Rendering Pipeline
 */
export function createProgressUniform(initial: number = 0): ShaderUniform {
  return { value: Math.max(0, Math.min(1, initial)) };
}

/**
 * Create a color uniform.
 * @category Rendering Pipeline
 */
export function createColorUniform(r: number, g: number, b: number): ShaderUniform {
  return { value: [r, g, b] };
}

/**
 * Create a Vector2 uniform.
 * @category Rendering Pipeline
 */
export function createVector2Uniform(x: number, y: number): ShaderUniform {
  return { value: [x, y] };
}

/**
 * Create a Vector3 uniform.
 * @category Rendering Pipeline
 */
export function createVector3Uniform(x: number, y: number, z: number): ShaderUniform {
  return { value: [x, y, z] };
}

/**
 * Compose multiple shader chunks into a single string.
 * @category Rendering Pipeline
 */
export function composeShaderChunks(...chunks: string[]): string {
  return chunks.join('\n\n');
}

/**
 * Build a complete vertex shader.
 * @category Rendering Pipeline
 */
export function buildVertexShader(options: {
  attributes?: string;
  uniforms?: string;
  varyings?: string;
  functions?: string;
  main: string;
}): string {
  return /* glsl */ `
${options.attributes || ''}
${options.uniforms || ''}
${options.varyings || ''}
${options.functions || ''}

void main() {
    ${options.main}
}`;
}

/**
 * Build a complete fragment shader.
 * @category Rendering Pipeline
 */
export function buildFragmentShader(options: {
  precision?: string;
  uniforms?: string;
  varyings?: string;
  functions?: string;
  main: string;
}): string {
  return /* glsl */ `
${options.precision || 'precision highp float;'}
${options.uniforms || ''}
${options.varyings || ''}
${options.functions || ''}

void main() {
    ${options.main}
}`;
}

export const noiseSnippet = composeShaderChunks(
  ShaderChunks.noise.rand,
  ShaderChunks.noise.simplex2D,
  ShaderChunks.noise.simplex3D,
  ShaderChunks.noise.fbm
);

export const lightingSnippet = composeShaderChunks(
  ShaderChunks.lighting.toon,
  ShaderChunks.lighting.fresnel,
  ShaderChunks.lighting.rim,
  ShaderChunks.lighting.specular
);

export const colorSnippet = composeShaderChunks(
  ShaderChunks.color.palette,
  ShaderChunks.color.gradient,
  ShaderChunks.color.posterize,
  ShaderChunks.color.hsv
);

export const animationSnippet = composeShaderChunks(
  ShaderChunks.animation.time,
  ShaderChunks.animation.easing
);

export type ShaderChunkCategory = keyof typeof ShaderChunks;
export type NoiseChunk = keyof typeof ShaderChunks.noise;
export type LightingChunk = keyof typeof ShaderChunks.lighting;
export type UVChunk = keyof typeof ShaderChunks.uv;
export type ColorChunk = keyof typeof ShaderChunks.color;
export type AnimationChunk = keyof typeof ShaderChunks.animation;
export type EffectsChunk = keyof typeof ShaderChunks.effects;
