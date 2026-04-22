import {
  createMaterialProceduralBakePlan,
  createMaterialProceduralPlan,
  inferMaterialTraits,
  type MaterialDefinition,
  type MaterialTrait,
  type RuntimeMaterialSlot,
  resolveMaterialDefinition,
} from '@strata-game-library/core/compose';
import type {
  ReactylonColorValue,
  ReactylonRuntimeMaterialDescriptor,
  ReactylonRuntimeMaterialOptions,
} from './types.js';

function serializeColor(color: MaterialDefinition['baseColor']): ReactylonColorValue {
  if (typeof color === 'string' || typeof color === 'number') {
    return color;
  }

  if ('r' in color && 'g' in color && 'b' in color) {
    return [color.r, color.g, color.b];
  }

  return '#ffffff';
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

function resolveSlotMaterial(
  slot: RuntimeMaterialSlot,
  options: ReactylonRuntimeMaterialOptions
): MaterialDefinition {
  const override =
    options.materialOverrides?.[slot.id] ?? options.materialOverrides?.[slot.materialId];

  return override === undefined ? slot.material : resolveMaterialDefinition(override);
}

/**
 * Converts a core runtime material slot into a serializable Babylon/Reactylon descriptor.
 */
export function createReactylonRuntimeMaterialDescriptor(
  slot: RuntimeMaterialSlot,
  options: ReactylonRuntimeMaterialOptions = {}
): ReactylonRuntimeMaterialDescriptor {
  const material = resolveSlotMaterial(slot, options);
  const opacity =
    options.transparentVolumetrics && material.type === 'volumetric'
      ? (material.volumetric?.transparency ?? 0.65)
      : 1;
  const traits = resolveMaterialTraits(material);

  return {
    id: slot.id,
    materialId: material.id,
    type: material.type,
    baseColor: serializeColor(material.baseColor),
    roughness: material.roughness,
    metalness: material.metalness,
    normalScale: material.normalScale,
    transparent: opacity < 1,
    opacity,
    physics: material.physics ?? slot.physics,
    swappableWith: [...(slot.swappableWith ?? [])],
    traits,
    procedural:
      traits.length > 0
        ? createMaterialProceduralPlan(material, { traits, includeShaderChunk: true })
        : undefined,
    proceduralBake:
      traits.length > 0
        ? createMaterialProceduralBakePlan(material, {
            traits,
            includeShaderChunk: false,
          })
        : undefined,
  };
}
