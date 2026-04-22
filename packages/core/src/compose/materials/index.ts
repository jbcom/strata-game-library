/**
 * Built-in material presets for the compositional object system.
 *
 * Provides a registry of pre-configured materials (fur, metal, wood, shell,
 * crystal, organic) that can be referenced by ID when composing creatures,
 * props, and other game objects.
 *
 * @module Materials
 * @category Entities & Simulation
 */

import {
  createFurMaterial,
  createMetalMaterial,
  createOrganicMaterial,
  createShellMaterial,
  createVolumetricMaterial,
  createWoodMaterial,
} from './factory';
import type {
  MaterialDefinition,
  MaterialPhysics,
  MaterialProceduralAlgorithm,
  MaterialProceduralBakeArtifacts,
  MaterialProceduralBakeColorSpace,
  MaterialProceduralBakeEncodedImage,
  MaterialProceduralBakeExportEncoder,
  MaterialProceduralBakeExportEncoderOptions,
  MaterialProceduralBakeExportExecutionOptions,
  MaterialProceduralBakeExportMimeType,
  MaterialProceduralBakeExportOptions,
  MaterialProceduralBakeExportPlan,
  MaterialProceduralBakeExportResult,
  MaterialProceduralBakeFormat,
  MaterialProceduralBakeMap,
  MaterialProceduralBakePlan,
  MaterialProceduralBakePlanOptions,
  MaterialProceduralBakeRaster,
  MaterialProceduralBakeRasterImage,
  MaterialProceduralColor,
  MaterialProceduralLayer,
  MaterialProceduralPlan,
  MaterialProceduralPlanOptions,
  MaterialProceduralUniform,
  MaterialTrait,
  MaterialTraitChannel,
  MaterialTraitInferenceOptions,
  MaterialTraitOptions,
  MaterialTraitType,
  MaterialVariantOptions,
  MaterialVariantSetOptions,
} from './types';

export * from './factory';
export * from './types';

export const MATERIALS: Record<string, MaterialDefinition> = {
  // Fur variants
  fur_otter: createFurMaterial('fur_otter', {
    baseColor: '#4a3520',
    shell: {
      length: 0.03,
      density: 5000,
      wetness: 0.3,
    },
  }),

  fur_fox: createFurMaterial('fur_fox', {
    baseColor: '#c45a25',
    shell: {
      length: 0.05,
      density: 4000,
      pattern: { type: 'gradient', to: '#ffffff', position: 'belly' },
    },
  }),

  // Metals
  metal_iron: createMetalMaterial('metal_iron', {
    baseColor: '#666666',
    roughness: 0.4,
  }),

  metal_gold: createMetalMaterial('metal_gold', {
    baseColor: '#ffd700',
    roughness: 0.2,
  }),

  // Woods
  wood_oak: createWoodMaterial('wood_oak', {
    baseColor: '#8b4513',
    grain: 'oak',
    roughness: 0.6,
  }),

  wood_pine: createWoodMaterial('wood_pine', {
    baseColor: '#deb887',
    grain: 'pine',
    roughness: 0.5,
  }),

  // Shells
  shell_turtle: createShellMaterial('shell_turtle', {
    baseColor: '#2d4a2d',
    pattern: 'hexagonal',
    segments: 13,
  }),

  // Crystals
  crystal_quartz: createVolumetricMaterial('crystal_quartz', {
    baseColor: '#e8e8e8',
    volumetric: {
      refraction: 1.5,
      transparency: 0.9,
    },
  }),

  // Organic
  flesh_mammal: createOrganicMaterial('flesh_mammal', {
    baseColor: '#ffdbac',
    organic: {
      scatterColor: '#ff8888',
      scatterDistance: 0.02,
    },
  }),
};

export function cloneMaterialDefinition(
  material: MaterialDefinition,
  overrides: Partial<MaterialDefinition> = {}
): MaterialDefinition {
  return {
    ...material,
    ...overrides,
    maps: material.maps ? { ...material.maps, ...overrides.maps } : overrides.maps,
    shell: material.shell ? { ...material.shell, ...overrides.shell } : overrides.shell,
    volumetric: material.volumetric
      ? { ...material.volumetric, ...overrides.volumetric }
      : overrides.volumetric,
    organic: material.organic ? { ...material.organic, ...overrides.organic } : overrides.organic,
    physics: material.physics ? { ...material.physics, ...overrides.physics } : overrides.physics,
    traits:
      overrides.traits !== undefined
        ? overrides.traits.map(cloneMaterialTrait)
        : material.traits?.map(cloneMaterialTrait),
  };
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function cloneColorValue(color: MaterialDefinition['baseColor']): MaterialDefinition['baseColor'] {
  if (
    typeof color === 'object' &&
    color !== null &&
    'clone' in color &&
    typeof color.clone === 'function'
  ) {
    return color.clone() as MaterialDefinition['baseColor'];
  }

  return color;
}

function mergeMaterialPhysics(
  base: MaterialPhysics | undefined,
  overrides: Partial<MaterialPhysics> | undefined
): MaterialPhysics | undefined {
  if (!overrides) {
    return base ? { ...base } : undefined;
  }

  return {
    density: overrides.density ?? base?.density ?? 1000,
    friction: overrides.friction ?? base?.friction ?? 0.5,
    restitution: overrides.restitution ?? base?.restitution ?? 0.1,
  };
}

function defaultTraitChannels(type: MaterialTraitType): MaterialTraitChannel[] {
  switch (type) {
    case 'grain':
      return ['baseColor', 'roughness', 'normal'];
    case 'fiber':
      return ['baseColor', 'normal', 'opacity'];
    case 'scratches':
      return ['roughness', 'normal', 'metalness'];
    case 'wear':
      return ['baseColor', 'roughness', 'normal'];
    case 'patina':
      return ['baseColor', 'roughness', 'metalness'];
    case 'veins':
      return ['baseColor', 'normal', 'opacity'];
    case 'mottle':
      return ['baseColor', 'roughness'];
    case 'absorption':
      return ['baseColor', 'opacity'];
  }
}

function cloneMaterialTrait(trait: MaterialTrait): MaterialTrait {
  return {
    ...trait,
    channels: [...trait.channels],
    tags: trait.tags ? [...trait.tags] : undefined,
  };
}

function materialTraitId(prefix: string, type: MaterialTraitType, suffix?: string): string {
  return [prefix, type, suffix].filter(Boolean).join(':');
}

function grainScale(grain: MaterialDefinition['grain']): number {
  switch (grain) {
    case 'pine':
      return 1.35;
    case 'birch':
      return 1.1;
    case 'mahogany':
      return 0.75;
    default:
      return 0.9;
  }
}

export function createMaterialTrait(
  type: MaterialTraitType,
  options: MaterialTraitOptions = {}
): MaterialTrait {
  return {
    id: options.id ?? type,
    type,
    intensity: clamp01(options.intensity ?? 0.5),
    scale: Math.max(0.0001, options.scale ?? 1),
    seed: options.seed ?? 0,
    channels: options.channels ? [...options.channels] : defaultTraitChannels(type),
    color: options.color,
    secondaryColor: options.secondaryColor,
    tags: options.tags ? [...options.tags] : undefined,
  };
}

export function inferMaterialTraits(
  material: string | MaterialDefinition,
  options: MaterialTraitInferenceOptions = {}
): MaterialTrait[] {
  const resolved = resolveMaterialDefinition(material);
  const idPrefix = options.idPrefix ?? resolved.id;
  const intensity = options.intensity ?? 0.6;
  const scale = options.scale ?? 1;
  const seed = options.seed ?? 0;
  const traits = options.includeExisting ? (resolved.traits ?? []).map(cloneMaterialTrait) : [];

  if (resolved.grain) {
    traits.push(
      createMaterialTrait('grain', {
        id: materialTraitId(idPrefix, 'grain', resolved.grain),
        intensity,
        scale: scale * grainScale(resolved.grain),
        seed,
        color: resolved.baseColor,
        tags: ['wood', resolved.grain],
      })
    );
  }

  if (resolved.shell) {
    traits.push(
      createMaterialTrait('fiber', {
        id: materialTraitId(idPrefix, 'fiber'),
        intensity: clamp01(intensity + resolved.shell.colorVariation * 0.25),
        scale: scale * Math.max(0.25, resolved.shell.length * 20),
        seed: seed + 11,
        color: resolved.baseColor,
        tags: ['shell', 'fur'],
      })
    );
  }

  if (resolved.metalness > 0.5) {
    traits.push(
      createMaterialTrait('scratches', {
        id: materialTraitId(idPrefix, 'scratches'),
        intensity: clamp01(intensity * (1 - resolved.roughness * 0.5)),
        scale: scale * 0.75,
        seed: seed + 23,
        tags: ['metal'],
      })
    );
  }

  if (resolved.type === 'volumetric') {
    traits.push(
      createMaterialTrait('veins', {
        id: materialTraitId(idPrefix, 'veins'),
        intensity: clamp01(intensity * (resolved.volumetric?.transparency ?? 0.8)),
        scale: scale * 1.2,
        seed: seed + 37,
        color: resolved.baseColor,
        secondaryColor: resolved.volumetric?.absorption,
        tags: ['volumetric'],
      })
    );
  }

  if (resolved.type === 'organic') {
    traits.push(
      createMaterialTrait('mottle', {
        id: materialTraitId(idPrefix, 'mottle'),
        intensity,
        scale: scale * 1.5,
        seed: seed + 41,
        color: resolved.baseColor,
        secondaryColor: resolved.organic?.scatterColor,
        tags: ['organic'],
      })
    );
  }

  return traits;
}

function proceduralAlgorithmForTrait(type: MaterialTraitType): MaterialProceduralAlgorithm {
  switch (type) {
    case 'grain':
      return 'directional-noise';
    case 'fiber':
      return 'strand-noise';
    case 'scratches':
      return 'scratch-lines';
    case 'wear':
      return 'edge-wear';
    case 'patina':
      return 'oxidation-noise';
    case 'veins':
      return 'branching-veins';
    case 'mottle':
      return 'cellular-mottle';
    case 'absorption':
      return 'depth-absorption';
  }
}

function sanitizeShaderIdentifier(value: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^[^a-zA-Z_]+/, '');
  return sanitized || 'layer';
}

function createChannelLayers(): Record<MaterialTraitChannel, string[]> {
  return {
    baseColor: [],
    roughness: [],
    metalness: [],
    normal: [],
    opacity: [],
    emissive: [],
  };
}

function proceduralExpression(
  algorithm: MaterialProceduralAlgorithm,
  scaleUniform: string,
  seedUniform: string,
  intensityUniform: string
): string {
  switch (algorithm) {
    case 'directional-noise':
      return `clamp((sin((position.x + strataProceduralNoise(position * ${scaleUniform} * 0.35)) * ${scaleUniform} * 12.0 + ${seedUniform}) * 0.5 + 0.5) * ${intensityUniform}, 0.0, 1.0)`;
    case 'strand-noise':
      return `clamp(pow(abs(sin((uv.y + strataProceduralNoise(position * ${scaleUniform})) * ${scaleUniform} * 24.0 + ${seedUniform})), 3.0) * ${intensityUniform}, 0.0, 1.0)`;
    case 'scratch-lines':
      return `step(1.0 - ${intensityUniform} * 0.35, strataProceduralNoise(vec3(uv * ${scaleUniform} * 40.0, ${seedUniform})))`;
    case 'edge-wear':
      return `clamp(smoothstep(0.35, 1.0, 1.0 - abs(normal.y)) * strataProceduralNoise(position * ${scaleUniform} + ${seedUniform}) * ${intensityUniform}, 0.0, 1.0)`;
    case 'oxidation-noise':
      return `clamp(smoothstep(0.25, 0.85, strataProceduralNoise(position * ${scaleUniform} + ${seedUniform})) * ${intensityUniform}, 0.0, 1.0)`;
    case 'branching-veins':
      return `clamp(smoothstep(0.65, 0.95, sin((position.x + position.z) * ${scaleUniform} * 8.0 + strataProceduralNoise(position * ${scaleUniform}) * 3.14159 + ${seedUniform})) * ${intensityUniform}, 0.0, 1.0)`;
    case 'cellular-mottle':
      return `clamp(abs(strataProceduralNoise(floor(position * ${scaleUniform} * 8.0) + ${seedUniform}) - 0.5) * 2.0 * ${intensityUniform}, 0.0, 1.0)`;
    case 'depth-absorption':
      return `clamp(smoothstep(0.0, 1.0, position.y * ${scaleUniform} + strataProceduralNoise(position * ${scaleUniform} + ${seedUniform})) * ${intensityUniform}, 0.0, 1.0)`;
  }
}

function proceduralShaderPreamble(): string {
  return /* glsl */ `
float strataProceduralHash(vec3 value) {
  return fract(sin(dot(value, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
}

float strataProceduralNoise(vec3 value) {
  vec3 cell = floor(value);
  vec3 local = fract(value);
  vec3 curve = local * local * (3.0 - 2.0 * local);

  float n000 = strataProceduralHash(cell + vec3(0.0, 0.0, 0.0));
  float n100 = strataProceduralHash(cell + vec3(1.0, 0.0, 0.0));
  float n010 = strataProceduralHash(cell + vec3(0.0, 1.0, 0.0));
  float n110 = strataProceduralHash(cell + vec3(1.0, 1.0, 0.0));
  float n001 = strataProceduralHash(cell + vec3(0.0, 0.0, 1.0));
  float n101 = strataProceduralHash(cell + vec3(1.0, 0.0, 1.0));
  float n011 = strataProceduralHash(cell + vec3(0.0, 1.0, 1.0));
  float n111 = strataProceduralHash(cell + vec3(1.0, 1.0, 1.0));

  float x00 = mix(n000, n100, curve.x);
  float x10 = mix(n010, n110, curve.x);
  float x01 = mix(n001, n101, curve.x);
  float x11 = mix(n011, n111, curve.x);
  float y0 = mix(x00, x10, curve.y);
  float y1 = mix(x01, x11, curve.y);

  return mix(y0, y1, curve.z);
}
`.trim();
}

function proceduralLayerShader(layer: MaterialProceduralLayer): string {
  const scaleUniform = `${layer.functionName}_scale`;
  const seedUniform = `${layer.functionName}_seed`;
  const intensityUniform = `${layer.functionName}_intensity`;
  const expression = proceduralExpression(
    layer.algorithm,
    scaleUniform,
    seedUniform,
    intensityUniform
  );

  return /* glsl */ `
uniform float ${scaleUniform};
uniform float ${seedUniform};
uniform float ${intensityUniform};

float ${layer.functionName}(vec3 position, vec3 normal, vec2 uv) {
  return ${expression};
}
`.trim();
}

function serializeProceduralColor(
  color: MaterialTrait['color']
): MaterialProceduralColor | undefined {
  if (color === undefined) {
    return undefined;
  }

  if (typeof color === 'string') {
    return color;
  }

  return [color.r, color.g, color.b];
}

const DEFAULT_PROCEDURAL_BAKE_CHANNELS: MaterialTraitChannel[] = [
  'baseColor',
  'roughness',
  'metalness',
  'normal',
  'opacity',
  'emissive',
];

function normalizeTextureSize(
  size: MaterialProceduralBakePlanOptions['textureSize']
): [number, number] {
  if (Array.isArray(size)) {
    return [Math.max(1, Math.floor(size[0])), Math.max(1, Math.floor(size[1]))];
  }

  const dimension = Math.max(1, Math.floor(size ?? 1024));
  return [dimension, dimension];
}

function proceduralBakeMapForChannel(channel: MaterialTraitChannel): MaterialProceduralBakeMap {
  switch (channel) {
    case 'baseColor':
      return 'diffuse';
    case 'roughness':
      return 'roughness';
    case 'metalness':
      return 'metalness';
    case 'normal':
      return 'normal';
    case 'opacity':
      return 'opacity';
    case 'emissive':
      return 'emissive';
  }
}

function proceduralBakeColorSpaceForChannel(
  channel: MaterialTraitChannel
): MaterialProceduralBakeColorSpace {
  switch (channel) {
    case 'baseColor':
    case 'emissive':
      return 'srgb';
    case 'normal':
      return 'normal';
    case 'roughness':
    case 'metalness':
    case 'opacity':
      return 'linear';
  }
}

/**
 * Converts procedural material traits into a deterministic shader/texture layer plan.
 */
export function createMaterialProceduralPlan(
  material: string | MaterialDefinition,
  options: MaterialProceduralPlanOptions = {}
): MaterialProceduralPlan {
  const resolved = resolveMaterialDefinition(material);
  const traits =
    options.traits?.map(cloneMaterialTrait) ??
    (resolved.traits ? resolved.traits.map(cloneMaterialTrait) : undefined) ??
    (options.inferTraits ? inferMaterialTraits(resolved) : []);
  const channelLayers = createChannelLayers();
  const layers = traits.map<MaterialProceduralLayer>((trait, index) => {
    const layerId = `${options.idPrefix ?? resolved.id}:procedural:${trait.id}`;
    const functionName = `strata_${sanitizeShaderIdentifier(layerId)}`;
    const color = serializeProceduralColor(trait.color);
    const secondaryColor = serializeProceduralColor(trait.secondaryColor);
    const uniforms: MaterialProceduralUniform[] = [
      { name: `${functionName}_scale`, type: 'float', value: trait.scale },
      { name: `${functionName}_seed`, type: 'float', value: trait.seed },
      { name: `${functionName}_intensity`, type: 'float', value: trait.intensity },
    ];

    if (color !== undefined) {
      uniforms.push({ name: `${functionName}_color`, type: 'color', value: color });
    }

    if (secondaryColor !== undefined) {
      uniforms.push({
        name: `${functionName}_secondaryColor`,
        type: 'color',
        value: secondaryColor,
      });
    }

    const layer: MaterialProceduralLayer = {
      id: layerId,
      traitId: trait.id,
      type: trait.type,
      algorithm: proceduralAlgorithmForTrait(trait.type),
      functionName,
      channels: [...trait.channels],
      intensity: trait.intensity,
      scale: trait.scale,
      seed: trait.seed,
      color,
      secondaryColor,
      uniforms,
    };

    for (const channel of layer.channels) {
      channelLayers[channel].push(layer.id);
    }

    return {
      ...layer,
      seed: layer.seed + index * 101,
      uniforms: layer.uniforms.map((uniform) =>
        uniform.name.endsWith('_seed') && typeof uniform.value === 'number'
          ? { ...uniform, value: uniform.value + index * 101 }
          : uniform
      ),
    };
  });
  const uniforms = layers.flatMap((layer) => layer.uniforms);
  const shaderChunk =
    options.includeShaderChunk === false || layers.length === 0
      ? ''
      : [proceduralShaderPreamble(), ...layers.map(proceduralLayerShader)].join('\n\n');

  return {
    materialId: resolved.id,
    layers,
    channelLayers,
    uniforms,
    shaderChunk,
  };
}

/**
 * Creates a deterministic manifest for baking procedural material layers into texture maps.
 */
export function createMaterialProceduralBakePlan(
  material: string | MaterialDefinition,
  options: MaterialProceduralBakePlanOptions = {}
): MaterialProceduralBakePlan {
  const procedural = createMaterialProceduralPlan(material, {
    traits: options.traits,
    inferTraits: options.inferTraits,
    includeShaderChunk: options.includeShaderChunk,
    idPrefix: options.idPrefix,
  });
  const textureSize = normalizeTextureSize(options.textureSize);
  const format = options.format ?? 'png';
  const channels = options.channels ?? DEFAULT_PROCEDURAL_BAKE_CHANNELS;
  const filePrefix = options.filePrefix ?? procedural.materialId;
  const targets = channels
    .map((channel) => {
      const layerIds = procedural.channelLayers[channel] ?? [];

      if (layerIds.length === 0 && !options.includeEmptyTargets) {
        return undefined;
      }

      return {
        id: `${procedural.materialId}:bake:${channel}`,
        channel,
        map: proceduralBakeMapForChannel(channel),
        layerIds: [...layerIds],
        textureSize,
        format,
        colorSpace: proceduralBakeColorSpaceForChannel(channel),
        fileName: `${filePrefix}.${channel}.${format}`,
      };
    })
    .filter((target): target is NonNullable<typeof target> => target !== undefined);

  return {
    materialId: procedural.materialId,
    procedural,
    textureSize,
    targets,
    manifest: {
      version: 1,
      materialId: procedural.materialId,
      textureSize,
      targets: targets.map((target) => ({
        channel: target.channel,
        map: target.map,
        fileName: target.fileName,
        colorSpace: target.colorSpace,
      })),
    },
  };
}

function fract(value: number): number {
  return value - Math.floor(value);
}

function mix(a: number, b: number, value: number): number {
  return a * (1 - value) + b * value;
}

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = clamp01((value - edge0) / (edge1 - edge0));

  return t * t * (3 - 2 * t);
}

function proceduralHash(x: number, y: number, z: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123);
}

function proceduralNoise(x: number, y: number, z: number): number {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  const cellZ = Math.floor(z);
  const localX = fract(x);
  const localY = fract(y);
  const localZ = fract(z);
  const curveX = localX * localX * (3 - 2 * localX);
  const curveY = localY * localY * (3 - 2 * localY);
  const curveZ = localZ * localZ * (3 - 2 * localZ);

  const n000 = proceduralHash(cellX, cellY, cellZ);
  const n100 = proceduralHash(cellX + 1, cellY, cellZ);
  const n010 = proceduralHash(cellX, cellY + 1, cellZ);
  const n110 = proceduralHash(cellX + 1, cellY + 1, cellZ);
  const n001 = proceduralHash(cellX, cellY, cellZ + 1);
  const n101 = proceduralHash(cellX + 1, cellY, cellZ + 1);
  const n011 = proceduralHash(cellX, cellY + 1, cellZ + 1);
  const n111 = proceduralHash(cellX + 1, cellY + 1, cellZ + 1);
  const x00 = mix(n000, n100, curveX);
  const x10 = mix(n010, n110, curveX);
  const x01 = mix(n001, n101, curveX);
  const x11 = mix(n011, n111, curveX);
  const y0 = mix(x00, x10, curveY);
  const y1 = mix(x01, x11, curveY);

  return mix(y0, y1, curveZ);
}

function sampleProceduralLayer(layer: MaterialProceduralLayer, u: number, v: number): number {
  const scale = layer.scale;
  const seed = layer.seed;
  const intensity = layer.intensity;
  const x = u;
  const y = v;
  const z = (u + v) * 0.5;

  switch (layer.algorithm) {
    case 'directional-noise':
      return clamp01(
        (Math.sin(
          (x + proceduralNoise(x * scale * 0.35, y * scale * 0.35, z)) * scale * 12 + seed
        ) *
          0.5 +
          0.5) *
          intensity
      );
    case 'strand-noise':
      return clamp01(
        Math.abs(
          Math.sin((v + proceduralNoise(x * scale, y * scale, z * scale)) * scale * 24 + seed)
        ) **
          3 *
          intensity
      );
    case 'scratch-lines':
      return proceduralNoise(u * scale * 40, v * scale * 40, seed) >= 1 - intensity * 0.35 ? 1 : 0;
    case 'edge-wear': {
      const edgeDistance = Math.min(u, v, 1 - u, 1 - v);
      const edgeMask = smoothstep(0.35, 1, 1 - edgeDistance * 2);

      return clamp01(
        edgeMask * proceduralNoise(x * scale + seed, y * scale, z * scale) * intensity
      );
    }
    case 'oxidation-noise':
      return clamp01(
        smoothstep(0.25, 0.85, proceduralNoise(x * scale + seed, y * scale, z * scale)) * intensity
      );
    case 'branching-veins':
      return clamp01(
        smoothstep(
          0.65,
          0.95,
          Math.sin(
            (x + y) * scale * 8 + proceduralNoise(x * scale, y * scale, z * scale) * Math.PI + seed
          )
        ) * intensity
      );
    case 'cellular-mottle':
      return clamp01(
        Math.abs(
          proceduralNoise(Math.floor(x * scale * 8) + seed, Math.floor(y * scale * 8), 0) - 0.5
        ) *
          2 *
          intensity
      );
    case 'depth-absorption':
      return clamp01(
        smoothstep(0, 1, y * scale + proceduralNoise(x * scale + seed, y * scale, z * scale)) *
          intensity
      );
  }
}

function parseProceduralColor(
  color: MaterialProceduralColor | undefined
): [number, number, number] {
  if (Array.isArray(color)) {
    return color.map((value) => Math.round(clamp01(value) * 255)) as [number, number, number];
  }

  if (!color) {
    return [255, 255, 255];
  }

  const hex = color.startsWith('#') ? color.slice(1) : color;
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((character) => character + character)
          .join('')
      : hex.padStart(6, '0').slice(0, 6);

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function layersForTarget(
  plan: MaterialProceduralBakePlan,
  target: MaterialProceduralBakePlan['targets'][number]
): MaterialProceduralLayer[] {
  const layers = new Map(plan.procedural.layers.map((layer) => [layer.id, layer]));

  return target.layerIds
    .map((layerId) => layers.get(layerId))
    .filter((layer): layer is MaterialProceduralLayer => layer !== undefined);
}

function sampleCombinedMask(layers: MaterialProceduralLayer[], u: number, v: number): number {
  return clamp01(layers.reduce((sum, layer) => sum + sampleProceduralLayer(layer, u, v), 0));
}

function writePixel(
  data: Uint8ClampedArray,
  offset: number,
  red: number,
  green: number,
  blue: number,
  alpha = 255
): void {
  data[offset] = Math.round(clamp01(red / 255) * 255);
  data[offset + 1] = Math.round(clamp01(green / 255) * 255);
  data[offset + 2] = Math.round(clamp01(blue / 255) * 255);
  data[offset + 3] = Math.round(clamp01(alpha / 255) * 255);
}

function writeColorBakePixel(
  data: Uint8ClampedArray,
  offset: number,
  layers: MaterialProceduralLayer[],
  u: number,
  v: number
): void {
  let red = 255;
  let green = 255;
  let blue = 255;

  for (const layer of layers) {
    const mask = sampleProceduralLayer(layer, u, v);
    const [targetRed, targetGreen, targetBlue] = parseProceduralColor(
      layer.color ?? layer.secondaryColor
    );

    red = mix(red, targetRed, mask);
    green = mix(green, targetGreen, mask);
    blue = mix(blue, targetBlue, mask);
  }

  writePixel(data, offset, red, green, blue);
}

function writeScalarBakePixel(
  data: Uint8ClampedArray,
  offset: number,
  channel: MaterialTraitChannel,
  mask: number
): void {
  const value = channel === 'opacity' ? 255 * (1 - mask * 0.35) : 255 * mask;

  writePixel(data, offset, value, value, value);
}

function writeNormalBakePixel(
  data: Uint8ClampedArray,
  offset: number,
  layers: MaterialProceduralLayer[],
  u: number,
  v: number,
  width: number,
  height: number
): void {
  const stepU = 1 / Math.max(1, width - 1);
  const stepV = 1 / Math.max(1, height - 1);
  const left = sampleCombinedMask(layers, clamp01(u - stepU), v);
  const right = sampleCombinedMask(layers, clamp01(u + stepU), v);
  const down = sampleCombinedMask(layers, u, clamp01(v - stepV));
  const up = sampleCombinedMask(layers, u, clamp01(v + stepV));
  const strength = 0.75;
  const normalX = clamp01(0.5 - (right - left) * strength);
  const normalY = clamp01(0.5 - (up - down) * strength);

  writePixel(data, offset, normalX * 255, normalY * 255, 255);
}

function rasterizeMaterialProceduralBakeTarget(
  plan: MaterialProceduralBakePlan,
  target: MaterialProceduralBakePlan['targets'][number]
): MaterialProceduralBakeRasterImage {
  const [width, height] = target.textureSize;
  const data = new Uint8ClampedArray(width * height * 4);
  const layers = layersForTarget(plan, target);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;
      const mask = sampleCombinedMask(layers, u, v);

      switch (target.channel) {
        case 'baseColor':
        case 'emissive':
          writeColorBakePixel(data, offset, layers, u, v);
          break;
        case 'normal':
          writeNormalBakePixel(data, offset, layers, u, v, width, height);
          break;
        case 'roughness':
        case 'metalness':
        case 'opacity':
          writeScalarBakePixel(data, offset, target.channel, mask);
          break;
      }
    }
  }

  return {
    targetId: target.id,
    channel: target.channel,
    map: target.map,
    fileName: target.fileName,
    colorSpace: target.colorSpace,
    width,
    height,
    data,
  };
}

/**
 * Rasterizes procedural bake targets into deterministic RGBA byte buffers.
 */
export function rasterizeMaterialProceduralBakePlan(
  plan: MaterialProceduralBakePlan
): MaterialProceduralBakeRaster {
  return {
    materialId: plan.materialId,
    textureSize: [...plan.textureSize],
    images: plan.targets.map((target) => rasterizeMaterialProceduralBakeTarget(plan, target)),
    manifest: {
      ...plan.manifest,
      textureSize: [...plan.manifest.textureSize],
      targets: plan.manifest.targets.map((target) => ({ ...target })),
    },
  };
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

function asciiBytes(value: string): Uint8Array {
  return Uint8Array.from(value, (character) => character.charCodeAt(0));
}

function uint32Bytes(value: number): Uint8Array {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return combined;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;

  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }

  return ((b << 16) | a) >>> 0;
}

function pngChunk(type: string, data: Uint8Array = new Uint8Array()): Uint8Array {
  const typeBytes = asciiBytes(type);
  const payload = concatBytes([typeBytes, data]);

  return concatBytes([uint32Bytes(data.length), payload, uint32Bytes(crc32(payload))]);
}

function zlibNoCompression(data: Uint8Array): Uint8Array {
  const blocks: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  let offset = 0;

  while (offset < data.length) {
    const length = Math.min(65_535, data.length - offset);
    const final = offset + length >= data.length ? 1 : 0;
    const block = new Uint8Array(5 + length);
    const inverted = ~length & 0xffff;

    block[0] = final;
    block[1] = length & 0xff;
    block[2] = (length >>> 8) & 0xff;
    block[3] = inverted & 0xff;
    block[4] = (inverted >>> 8) & 0xff;
    block.set(data.subarray(offset, offset + length), 5);
    blocks.push(block);
    offset += length;
  }

  blocks.push(uint32Bytes(adler32(data)));
  return concatBytes(blocks);
}

function pngFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '.png');
}

function replaceBakeFileExtension(fileName: string, format: MaterialProceduralBakeFormat): string {
  return fileName.replace(/\.[^/.]+$/, `.${format}`);
}

function proceduralBakeFormatFromFileName(fileName: string): MaterialProceduralBakeFormat {
  const extension = fileName.split('.').pop()?.toLowerCase();

  return extension === 'webp' || extension === 'ktx2' || extension === 'png' ? extension : 'png';
}

function proceduralBakeMimeTypeForFormat(
  format: MaterialProceduralBakeFormat
): MaterialProceduralBakeExportMimeType {
  switch (format) {
    case 'webp':
      return 'image/webp';
    case 'ktx2':
      return 'image/ktx2';
    case 'png':
      return 'image/png';
  }
}

function proceduralBakeEncoderForFormat(
  format: MaterialProceduralBakeFormat
): MaterialProceduralBakeExportEncoder {
  switch (format) {
    case 'webp':
      return 'browser-image-encoder';
    case 'ktx2':
      return 'basis-universal-ktx2';
    case 'png':
      return 'builtin-png';
  }
}

function proceduralBakeExportFileName(
  image: MaterialProceduralBakeRasterImage,
  format: MaterialProceduralBakeFormat,
  filePrefix: string | undefined
): string {
  if (filePrefix) {
    return `${filePrefix}.${image.channel}.${format}`;
  }

  return replaceBakeFileExtension(image.fileName, format);
}

function proceduralBakeExportEncoderOptions(
  format: MaterialProceduralBakeFormat,
  options: MaterialProceduralBakeExportOptions
): MaterialProceduralBakeExportEncoderOptions {
  return {
    ...(format === 'webp' && options.quality !== undefined
      ? { quality: clamp01(options.quality) }
      : {}),
    ...(format === 'ktx2' && options.compressionLevel !== undefined
      ? { compressionLevel: Math.max(0, Math.floor(options.compressionLevel)) }
      : {}),
    ...(format === 'ktx2' && options.generateMipmaps !== undefined
      ? { generateMipmaps: options.generateMipmaps }
      : {}),
  };
}

function pngScanlines(image: MaterialProceduralBakeRasterImage): Uint8Array {
  const stride = image.width * 4;
  const scanlines = new Uint8Array((stride + 1) * image.height);

  for (let y = 0; y < image.height; y += 1) {
    const sourceOffset = y * stride;
    const targetOffset = y * (stride + 1);

    scanlines[targetOffset] = 0;
    scanlines.set(image.data.subarray(sourceOffset, sourceOffset + stride), targetOffset + 1);
  }

  return scanlines;
}

/**
 * Encodes one procedural bake image as a PNG byte buffer.
 */
export function encodeMaterialProceduralBakeImagePng(
  image: MaterialProceduralBakeRasterImage
): Uint8Array {
  const ihdr = new Uint8Array(13);

  ihdr.set(uint32Bytes(image.width), 0);
  ihdr.set(uint32Bytes(image.height), 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return concatBytes([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlibNoCompression(pngScanlines(image))),
    pngChunk('IEND'),
  ]);
}

/**
 * Encodes every procedural bake raster image as PNG byte buffers.
 */
export function encodeMaterialProceduralBakeRasterPng(
  raster: MaterialProceduralBakeRaster
): MaterialProceduralBakeEncodedImage[] {
  return raster.images.map((image) => ({
    targetId: image.targetId,
    channel: image.channel,
    map: image.map,
    fileName: pngFileName(image.fileName),
    mimeType: 'image/png',
    data: encodeMaterialProceduralBakeImagePng(image),
  }));
}

/**
 * Creates external encoder requests for PNG, WebP, or KTX2 bake exports.
 */
export function createMaterialProceduralBakeExportPlan(
  raster: MaterialProceduralBakeRaster,
  options: MaterialProceduralBakeExportOptions = {}
): MaterialProceduralBakeExportPlan {
  const requests = raster.images.map((image) => {
    const format = options.format ?? proceduralBakeFormatFromFileName(image.fileName);
    const encoder = proceduralBakeEncoderForFormat(format);

    return {
      targetId: image.targetId,
      channel: image.channel,
      map: image.map,
      format,
      fileName: proceduralBakeExportFileName(image, format, options.filePrefix),
      mimeType: proceduralBakeMimeTypeForFormat(format),
      encoder,
      colorSpace: image.colorSpace,
      width: image.width,
      height: image.height,
      source: 'rgba8' as const,
      data: new Uint8ClampedArray(image.data),
      options: proceduralBakeExportEncoderOptions(format, options),
    };
  });

  return {
    materialId: raster.materialId,
    textureSize: [...raster.textureSize],
    requests,
    manifest: {
      version: 1,
      materialId: raster.materialId,
      textureSize: [...raster.textureSize],
      targets: requests.map((request) => ({
        channel: request.channel,
        map: request.map,
        format: request.format,
        fileName: request.fileName,
        mimeType: request.mimeType,
        encoder: request.encoder,
        colorSpace: request.colorSpace,
      })),
    },
  };
}

function proceduralBakeExportRequestToRasterImage(
  request: MaterialProceduralBakeExportPlan['requests'][number]
): MaterialProceduralBakeRasterImage {
  return {
    targetId: request.targetId,
    channel: request.channel,
    map: request.map,
    fileName: request.fileName,
    colorSpace: request.colorSpace,
    width: request.width,
    height: request.height,
    data: request.data,
  };
}

/**
 * Executes a procedural bake export plan with built-in PNG and injected WebP/KTX2 encoders.
 */
export function encodeMaterialProceduralBakeExportPlan(
  plan: MaterialProceduralBakeExportPlan,
  options: MaterialProceduralBakeExportExecutionOptions = {}
): MaterialProceduralBakeExportResult[] {
  return plan.requests.map((request) => {
    const data =
      request.encoder === 'builtin-png'
        ? encodeMaterialProceduralBakeImagePng(proceduralBakeExportRequestToRasterImage(request))
        : options.encoders?.[request.encoder]?.(request);

    if (!data) {
      throw new Error(`No procedural bake export encoder registered for "${request.encoder}"`);
    }

    return {
      targetId: request.targetId,
      channel: request.channel,
      map: request.map,
      format: request.format,
      fileName: request.fileName,
      mimeType: request.mimeType,
      encoder: request.encoder,
      data,
    };
  });
}

/**
 * Creates a complete procedural bake artifact bundle for offline or worker pipelines.
 */
export function createMaterialProceduralBakeArtifacts(
  material: string | MaterialDefinition,
  options: MaterialProceduralBakePlanOptions = {}
): MaterialProceduralBakeArtifacts {
  const plan = createMaterialProceduralBakePlan(material, options);
  const raster = rasterizeMaterialProceduralBakePlan(plan);

  return {
    plan,
    raster,
    png: encodeMaterialProceduralBakeRasterPng(raster),
    exports: createMaterialProceduralBakeExportPlan(raster),
  };
}

export function resolveMaterialDefinition(
  material: string | MaterialDefinition
): MaterialDefinition {
  if (typeof material !== 'string') {
    return cloneMaterialDefinition(material);
  }

  const resolved = MATERIALS[material];
  if (!resolved) {
    throw new Error(`Unknown material: ${material}`);
  }

  return cloneMaterialDefinition(resolved);
}

/**
 * Creates a resolved material variant with deterministic visual and physics deltas.
 */
export function createMaterialVariant(
  material: string | MaterialDefinition,
  options: MaterialVariantOptions = {}
): MaterialDefinition {
  const resolved = resolveMaterialDefinition(material);
  const shell =
    resolved.shell && options.shell ? { ...resolved.shell, ...options.shell } : resolved.shell;
  const volumetric =
    resolved.volumetric && options.volumetric
      ? { ...resolved.volumetric, ...options.volumetric }
      : resolved.volumetric;
  const organic =
    resolved.organic && options.organic
      ? { ...resolved.organic, ...options.organic }
      : resolved.organic;
  const traits = options.traits
    ? options.traits.map(cloneMaterialTrait)
    : resolved.traits || options.appendTraits
      ? [
          ...(resolved.traits ?? []).map(cloneMaterialTrait),
          ...(options.appendTraits ?? []).map(cloneMaterialTrait),
        ]
      : undefined;

  return cloneMaterialDefinition(resolved, {
    id: options.id ?? `${resolved.id}_${options.suffix ?? 'variant'}`,
    baseColor:
      options.baseColor === undefined
        ? cloneColorValue(resolved.baseColor)
        : cloneColorValue(options.baseColor),
    roughness:
      options.roughnessDelta === undefined
        ? resolved.roughness
        : clamp01(resolved.roughness + options.roughnessDelta),
    metalness:
      options.metalnessDelta === undefined
        ? resolved.metalness
        : clamp01(resolved.metalness + options.metalnessDelta),
    normalScale:
      options.normalScaleDelta === undefined
        ? resolved.normalScale
        : Math.max(0, (resolved.normalScale ?? 1) + options.normalScaleDelta),
    shell,
    volumetric,
    organic,
    physics: mergeMaterialPhysics(resolved.physics, options.physics),
    traits,
  });
}

/**
 * Creates a deterministic set of material variants for runtime swapping and prop variation.
 */
export function createMaterialVariants(
  material: string | MaterialDefinition,
  options: MaterialVariantSetOptions
): MaterialDefinition[] {
  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error('Material variant count must be a positive integer');
  }

  const rng = options.rng ?? Math.random;
  const resolved = resolveMaterialDefinition(material);
  const idPrefix = options.idPrefix ?? resolved.id;
  const jitter = (amount = 0) => (amount === 0 ? 0 : (rng() * 2 - 1) * amount);

  return Array.from({ length: options.count }, (_, index) =>
    createMaterialVariant(resolved, {
      id: `${idPrefix}_${index + 1}`,
      baseColor:
        options.colors && options.colors.length > 0
          ? cloneColorValue(options.colors[index % options.colors.length])
          : undefined,
      roughnessDelta: jitter(options.roughnessJitter),
      metalnessDelta: jitter(options.metalnessJitter),
      normalScaleDelta: jitter(options.normalScaleJitter),
      physics: options.physics,
      traits: options.traits,
    })
  );
}
