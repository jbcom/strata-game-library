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
    })
  );
}
