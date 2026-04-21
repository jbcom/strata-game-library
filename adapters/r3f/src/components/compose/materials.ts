import {
  createMaterialProceduralPlan,
  inferMaterialTraits,
  type MaterialDefinition,
  type MaterialTrait,
} from '@strata-game-library/core/compose';
import * as THREE from 'three';
import type { RuntimeMaterialOptions } from './types';

function toColorRepresentation(color: MaterialDefinition['baseColor']): THREE.ColorRepresentation {
  return color;
}

function cloneMaterialTraits(traits: MaterialDefinition['traits']): MaterialDefinition['traits'] {
  return traits?.map((trait) => ({
    ...trait,
    channels: [...trait.channels],
    tags: trait.tags ? [...trait.tags] : undefined,
  }));
}

function resolveMaterialTraits(definition: MaterialDefinition): MaterialTrait[] {
  return cloneMaterialTraits(definition.traits) ?? inferMaterialTraits(definition);
}

/**
 * Converts a core composition material definition into a Three.js material.
 */
export function createRuntimeMaterial(
  definition: MaterialDefinition,
  options: RuntimeMaterialOptions = {}
): THREE.Material {
  const volumetricTransparency =
    options.transparentVolumetrics && definition.type === 'volumetric'
      ? (definition.volumetric?.transparency ?? 0.65)
      : undefined;
  const parameters: THREE.MeshStandardMaterialParameters = {
    color: toColorRepresentation(definition.baseColor),
    roughness: definition.roughness,
    metalness: definition.metalness,
  };

  if (definition.normalScale !== undefined) {
    parameters.normalScale = new THREE.Vector2(definition.normalScale, definition.normalScale);
  }

  if (volumetricTransparency !== undefined) {
    parameters.transparent = true;
    parameters.opacity = volumetricTransparency;
  }

  const material = new THREE.MeshStandardMaterial(parameters);
  const traits = resolveMaterialTraits(definition);
  const procedural =
    traits.length > 0
      ? createMaterialProceduralPlan(definition, { traits, includeShaderChunk: true })
      : undefined;

  if (traits.length > 0 || procedural) {
    material.userData = {
      ...material.userData,
      strataMaterialTraits: traits,
      strataMaterialProceduralPlan: procedural,
    };
  }

  return material;
}

/**
 * Resolves an override-aware material for a runtime material slot.
 */
export function resolveRuntimeMaterial(
  slotId: string,
  definition: MaterialDefinition,
  options: RuntimeMaterialOptions = {}
): THREE.Material {
  const override =
    options.materialOverrides?.[slotId] ?? options.materialOverrides?.[definition.id];

  if (override instanceof THREE.Material) {
    return override;
  }

  return createRuntimeMaterial(override ?? definition, options);
}
