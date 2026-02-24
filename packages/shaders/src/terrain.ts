import * as THREE from 'three';
import type { IUniforms } from './types.js';

/**
 * Terrain shader - PBR textured ground with triplanar mapping and biome-specific elevation
 *
 * Lifted from Otterfall procedural rendering system.
 */

/**
 * Common biome GLSL functions
 */
const BIOME_GLSL = /* glsl */ `
  int getBiomeType(vec2 pos, vec2 biomeCenters[7], int biomeTypes[7]) {
    int closestIdx = 0;
    float closestDist = distance(pos, biomeCenters[0]);

    for (int i = 1; i < 7; i++) {
      float dist = distance(pos, biomeCenters[i]);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    return biomeTypes[closestIdx];
  }

  vec3 getBiomeColor(vec2 pos, vec2 biomeCenters[7], float biomeRadii[7], vec3 biomeColors[7]) {
    // Find closest biome
    int closestIdx = 0;
    float closestDist = distance(pos, biomeCenters[0]);

    for (int i = 1; i < 7; i++) {
      float dist = distance(pos, biomeCenters[i]);
      if (dist < closestDist) {
        closestDist = dist;
        closestIdx = i;
      }
    }

    vec3 baseColor = biomeColors[closestIdx];

    // Blend with adjacent biomes at boundaries
    vec3 blendedColor = baseColor;
    float totalWeight = 1.0;

    for (int i = 0; i < 7; i++) {
      if (i != closestIdx) {
        float dist = distance(pos, biomeCenters[i]);
        float blendRadius = biomeRadii[i] * 0.3; // 30% blend zone
        float weight = smoothstep(blendRadius, 0.0, dist - biomeRadii[i]);
        blendedColor += biomeColors[i] * weight;
        totalWeight += weight;
      }
    }

    return blendedColor / totalWeight;
  }
`;

export const terrainVertexShader = /* glsl */ `
  uniform vec2 biomeCenters[7];
  uniform float biomeRadii[7];
  uniform int biomeTypes[7]; // 0=marsh, 1=forest, 2=desert, 3=tundra, 4=savanna, 5=mountain, 6=scrubland

  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vWorldPos;
  varying float vElevation;
  varying float vSlope;
  varying vec3 vNormal;
  varying vec3 vTriplanarPos;

  // Simple hash noise
  float hash(vec2 p) {
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }

  ${BIOME_GLSL}

  void main() {
    vUv = uv;
    vPos = position;

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vec2 worldXZ = worldPos.xz;

    // Calculate elevation based on biome
    int biomeType = getBiomeType(worldXZ, biomeCenters, biomeTypes);
    float elevation = 0.0;

    // Mountain biome: elevated terrain with slopes up to 45 degrees
    if (biomeType == 5) {
      float n1 = noise(worldXZ * 0.05);
      float n2 = noise(worldXZ * 0.1);
      float n3 = noise(worldXZ * 0.2);
      elevation = n1 * 15.0 + n2 * 8.0 + n3 * 3.0;
    }
    // Tundra: gentle rolling hills
    else if (biomeType == 3) {
      elevation = noise(worldXZ * 0.03) * 2.0;
    }
    // Other biomes: mostly flat with subtle variation
    else {
      elevation = noise(worldXZ * 0.1) * 0.5;
    }

    vec3 newPosition = position;
    newPosition.y += elevation;

    vElevation = elevation;
    vWorldPos = (modelMatrix * vec4(newPosition, 1.0)).xyz;

    // Calculate approximate normal for triplanar mapping
    float dx = noise(worldXZ + vec2(0.1, 0.0)) - noise(worldXZ - vec2(0.1, 0.0));
    float dz = noise(worldXZ + vec2(0.0, 0.1)) - noise(worldXZ - vec2(0.0, 0.1));
    float dy_dx = dx * 10.0;
    float dy_dz = dz * 10.0;
    vec3 tangentX = normalize(vec3(1.0, dy_dx, 0.0));
    vec3 tangentZ = normalize(vec3(0.0, dy_dz, 1.0));
    vNormal = normalize(cross(tangentZ, tangentX));

    // Calculate slope for walkability
    vSlope = length(vec2(dx, dz)) * 10.0;

    // Store world position for triplanar mapping
    vTriplanarPos = vWorldPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const terrainFragmentShader = /* glsl */ `
  uniform vec3 biomeColors[7];
  uniform vec2 biomeCenters[7];
  uniform float biomeRadii[7];
  uniform int biomeTypes[7]; // 0=marsh, 1=forest, 2=desert, 3=tundra, 4=savanna, 5=mountain, 6=scrubland

  // PBR texture samplers (one set per biome)
  uniform sampler2D marshAlbedo;
  uniform sampler2D marshNormal;
  uniform sampler2D marshRoughness;
  uniform sampler2D marshAO;

  uniform sampler2D forestAlbedo;
  uniform sampler2D forestNormal;
  uniform sampler2D forestRoughness;
  uniform sampler2D forestAO;

  uniform sampler2D desertAlbedo;
  uniform sampler2D desertNormal;
  uniform sampler2D desertRoughness;
  uniform sampler2D desertAO;

  uniform sampler2D tundraAlbedo;
  uniform sampler2D tundraNormal;
  uniform sampler2D tundraRoughness;
  uniform sampler2D tundraAO;

  uniform sampler2D mountainAlbedo;
  uniform sampler2D mountainNormal;
  uniform sampler2D mountainRoughness;
  uniform sampler2D mountainAO;

  uniform bool useTextures; // Toggle between textured and procedural

  varying vec2 vUv;
  varying vec3 vPos;
  varying vec3 vWorldPos;
  varying float vElevation;
  varying float vSlope;
  varying vec3 vNormal;
  varying vec3 vTriplanarPos;

  // Simple hash noise
  float hash(vec2 p) {
    return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));
  }

  // Triplanar texture sampling
  vec4 triplanarSample(sampler2D tex, vec3 pos, vec3 normal) {
    // Calculate blend weights based on surface normal
    vec3 blendWeights = abs(normal);
    blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

    // Sample texture from three planes
    float scale = 0.1; // Texture tiling scale
    vec4 xSample = texture2D(tex, pos.yz * scale);
    vec4 ySample = texture2D(tex, pos.xz * scale);
    vec4 zSample = texture2D(tex, pos.xy * scale);

    // Blend samples based on normal
    return xSample * blendWeights.x + ySample * blendWeights.y + zSample * blendWeights.z;
  }

  // Sample complete PBR material using triplanar mapping
  struct PBRMaterial {
    vec3 albedo;
    vec3 normal;
    float roughness;
    float ao;
  };

  PBRMaterial sampleBiomeMaterial(int biomeType, vec3 pos, vec3 normal) {
    PBRMaterial mat;

    if (biomeType == 0) { // Marsh
      mat.albedo = triplanarSample(marshAlbedo, pos, normal).rgb;
      mat.normal = triplanarSample(marshNormal, pos, normal).rgb;
      mat.roughness = triplanarSample(marshRoughness, pos, normal).r;
      mat.ao = triplanarSample(marshAO, pos, normal).r;
    } else if (biomeType == 1) { // Forest
      mat.albedo = triplanarSample(forestAlbedo, pos, normal).rgb;
      mat.normal = triplanarSample(forestNormal, pos, normal).rgb;
      mat.roughness = triplanarSample(forestRoughness, pos, normal).r;
      mat.ao = triplanarSample(forestAO, pos, normal).r;
    } else if (biomeType == 2) { // Desert
      mat.albedo = triplanarSample(desertAlbedo, pos, normal).rgb;
      mat.normal = triplanarSample(desertNormal, pos, normal).rgb;
      mat.roughness = triplanarSample(desertRoughness, pos, normal).r;
      mat.ao = triplanarSample(desertAO, pos, normal).r;
    } else if (biomeType == 3) { // Tundra
      mat.albedo = triplanarSample(tundraAlbedo, pos, normal).rgb;
      mat.normal = triplanarSample(tundraNormal, pos, normal).rgb;
      mat.roughness = triplanarSample(tundraRoughness, pos, normal).r;
      mat.ao = triplanarSample(tundraAO, pos, normal).r;
    } else if (biomeType == 5) { // Mountain
      mat.albedo = triplanarSample(mountainAlbedo, pos, normal).rgb;
      mat.normal = triplanarSample(mountainNormal, pos, normal).rgb;
      mat.roughness = triplanarSample(mountainRoughness, pos, normal).r;
      mat.ao = triplanarSample(mountainAO, pos, normal).r;
    } else {
      // Fallback for savanna/scrubland (use forest textures)
      mat.albedo = triplanarSample(forestAlbedo, pos, normal).rgb;
      mat.normal = triplanarSample(forestNormal, pos, normal).rgb;
      mat.roughness = triplanarSample(forestRoughness, pos, normal).r;
      mat.ao = triplanarSample(forestAO, pos, normal).r;
    }

    return mat;
  }

  // Triplanar detail mapping (procedural fallback)
  float triplanarDetail(vec3 pos) {
    // Sample detail from three planes
    float detailX = hash(pos.yz * 8.0);
    float detailY = hash(pos.xz * 8.0);
    float detailZ = hash(pos.xy * 8.0);

    // Calculate blend weights based on surface normal approximation
    vec3 blendWeights = vec3(0.1, 0.8, 0.1);
    blendWeights = blendWeights / (blendWeights.x + blendWeights.y + blendWeights.z);

    return detailX * blendWeights.x + detailY * blendWeights.y + detailZ * blendWeights.z;
  }

  ${BIOME_GLSL}

  void main() {
    vec2 worldXZ = vWorldPos.xz;
    int biomeType = getBiomeType(worldXZ, biomeCenters, biomeTypes);

    vec3 finalColor;

    if (useTextures) {
      // Use PBR textures with triplanar mapping
      PBRMaterial mat = sampleBiomeMaterial(biomeType, vTriplanarPos, vNormal);

      // Start with albedo
      finalColor = mat.albedo;

      // Apply ambient occlusion
      finalColor *= mat.ao;

      // Simple lighting based on normal map
      // Convert normal map from [0,1] to [-1,1]
      vec3 normalTS = mat.normal * 2.0 - 1.0;
      float lighting = max(dot(normalTS, vec3(0.0, 1.0, 0.0)), 0.3);
      finalColor *= lighting;

      // Biome-specific effects
      if (biomeType == 3) { // Tundra: Add snow sparkle
        float sparkle = hash(vPos.xz * 10.0);
        finalColor = mix(finalColor, vec3(1.0, 1.0, 1.0), sparkle * 0.2);

        // Snow on elevated areas
        if (vElevation > 0.5) {
          finalColor = mix(finalColor, vec3(0.95, 0.95, 1.0), 0.4);
        }
      }

      if (biomeType == 5) { // Mountain: Snow caps on peaks
        if (vElevation > 18.0) {
          finalColor = mix(finalColor, vec3(0.9, 0.9, 0.95), 0.6);
        }
      }
    } else {
      // Fallback to procedural rendering
      vec3 baseColor = getBiomeColor(worldXZ, biomeCenters, biomeRadii, biomeColors);
      float detail = triplanarDetail(vWorldPos);

      // Tundra: Add snow shader effect
      if (biomeType == 3) {
        float sparkle = hash(vPos.xz * 10.0);
        baseColor = mix(baseColor, vec3(1.0, 1.0, 1.0), sparkle * 0.3);

        if (vElevation > 0.5) {
          baseColor = mix(baseColor, vec3(0.95, 0.95, 1.0), 0.6);
        }

        baseColor += vec3(detail * 0.2);
      }

      // Mountain: Rocky appearance with elevation-based coloring
      if (biomeType == 5) {
        float rockFactor = smoothstep(5.0, 15.0, vElevation);
        vec3 rockColor = vec3(0.3, 0.3, 0.35);
        baseColor = mix(baseColor, rockColor, rockFactor);

        if (vElevation > 18.0) {
          baseColor = mix(baseColor, vec3(0.9, 0.9, 0.95), 0.8);
        }

        baseColor = mix(baseColor, baseColor * detail, 0.3);
      }

      // Add base noise variation
      float n = hash(vPos.xz * 0.5);
      finalColor = mix(baseColor * 0.8, baseColor * 1.2, n);

      // Apply detail normal map effect
      finalColor = mix(finalColor, finalColor * (0.8 + detail * 0.4), 0.5);
    }

    // Distance-based darkening (vignette on floor)
    float dist = length(vPos.xz);
    finalColor *= smoothstep(100.0, 30.0, dist);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

/**
 * Simple terrain shader for non-biome use
 *
 * Lifted from Otterfall biome selector diorama.
 */
export const simpleTerrainVertexShader = /* glsl */ `
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

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const simpleTerrainFragmentShader = /* glsl */ `
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

export interface TerrainUniforms extends IUniforms {
  biomeColors: { value: THREE.Color[] | number[][] };
  biomeCenters: { value: THREE.Vector2[] | number[][] };
  biomeRadii: { value: number[] };
  biomeTypes: { value: number[] };
  useTextures: { value: boolean };
  marshAlbedo: { value: THREE.Texture | null };
  marshNormal: { value: THREE.Texture | null };
  marshRoughness: { value: THREE.Texture | null };
  marshAO: { value: THREE.Texture | null };
  forestAlbedo: { value: THREE.Texture | null };
  forestNormal: { value: THREE.Texture | null };
  forestRoughness: { value: THREE.Texture | null };
  forestAO: { value: THREE.Texture | null };
  desertAlbedo: { value: THREE.Texture | null };
  desertNormal: { value: THREE.Texture | null };
  desertRoughness: { value: THREE.Texture | null };
  desertAO: { value: THREE.Texture | null };
  tundraAlbedo: { value: THREE.Texture | null };
  tundraNormal: { value: THREE.Texture | null };
  tundraRoughness: { value: THREE.Texture | null };
  tundraAO: { value: THREE.Texture | null };
  mountainAlbedo: { value: THREE.Texture | null };
  mountainNormal: { value: THREE.Texture | null };
  mountainRoughness: { value: THREE.Texture | null };
  mountainAO: { value: THREE.Texture | null };
}

/**
 * Terrain shader uniforms factory
 */
export function createTerrainUniforms(): TerrainUniforms {
  return {
    biomeColors: { value: [] },
    biomeCenters: { value: [] },
    biomeRadii: { value: [] },
    biomeTypes: { value: [] },
    useTextures: { value: false },
    // Texture samplers - to be set by the user
    marshAlbedo: { value: null },
    marshNormal: { value: null },
    marshRoughness: { value: null },
    marshAO: { value: null },
    forestAlbedo: { value: null },
    forestNormal: { value: null },
    forestRoughness: { value: null },
    forestAO: { value: null },
    desertAlbedo: { value: null },
    desertNormal: { value: null },
    desertRoughness: { value: null },
    desertAO: { value: null },
    tundraAlbedo: { value: null },
    tundraNormal: { value: null },
    tundraRoughness: { value: null },
    tundraAO: { value: null },
    mountainAlbedo: { value: null },
    mountainNormal: { value: null },
    mountainRoughness: { value: null },
    mountainAO: { value: null },
  };
}

export interface SimpleTerrainUniforms extends IUniforms {
  uGroundColor: { value: THREE.Color | number[] };
  uRockColor: { value: THREE.Color | number[] };
  uRoughness: { value: number };
}

/**
 * Simple terrain uniforms factory
 */
export function createSimpleTerrainUniforms(): SimpleTerrainUniforms {
  return {
    uGroundColor: { value: new THREE.Color(0.3, 0.4, 0.2) },
    uRockColor: { value: new THREE.Color(0.4, 0.4, 0.4) },
    uRoughness: { value: 0.8 },
  };
}
