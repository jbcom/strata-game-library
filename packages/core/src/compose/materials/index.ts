import {
  createFurMaterial,
  createMetalMaterial,
  createOrganicMaterial,
  createShellMaterial,
  createVolumetricMaterial,
  createWoodMaterial,
} from './factory';
import type { MaterialDefinition } from './types';

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
