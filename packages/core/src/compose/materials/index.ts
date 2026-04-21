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
