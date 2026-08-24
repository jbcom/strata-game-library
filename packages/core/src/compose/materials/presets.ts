/**
 * Built-in material presets and definition cloning/resolution.
 *
 * Owns the `MATERIALS` registry of pre-configured materials (fur, metal, wood,
 * shell, crystal, organic) plus the two operations every other material module
 * builds on: deep-cloning a definition and resolving an ID or definition into
 * an owned copy.
 *
 * @module MaterialPresets
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
import type { MaterialDefinition, MaterialPhysics, MaterialTrait } from './types';

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

/** Copies a trait, detaching its mutable array fields from the source. */
export function cloneMaterialTrait(trait: MaterialTrait): MaterialTrait {
  return {
    ...trait,
    channels: [...trait.channels],
    tags: trait.tags ? [...trait.tags] : undefined,
  };
}

/** Clones a colour value, preferring a `clone()` method when the colour is an object. */
export function cloneColorValue(
  color: MaterialDefinition['baseColor']
): MaterialDefinition['baseColor'] {
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

/** Merges physics overrides onto a base, filling gaps with engine defaults. */
export function mergeMaterialPhysics(
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

export function resolveMaterialDefinition(
  material: string | MaterialDefinition
): MaterialDefinition {
  if (typeof material !== 'string') {
    return cloneMaterialDefinition(material);
  }

  const resolved = Object.hasOwn(MATERIALS, material) ? MATERIALS[material] : undefined;
  if (!resolved) {
    throw new Error(`Unknown material: ${material}`);
  }

  return cloneMaterialDefinition(resolved);
}
