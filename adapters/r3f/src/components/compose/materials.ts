import type { MaterialDefinition } from '@strata-game-library/core/compose';
import * as THREE from 'three';
import type { RuntimeMaterialOptions } from './types';

function toColorRepresentation(color: MaterialDefinition['baseColor']): THREE.ColorRepresentation {
  return color;
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

  return new THREE.MeshStandardMaterial(parameters);
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
