/**
 * Prop composition system for building game objects from geometric primitives and materials.
 *
 * Props are composite objects assembled from shapes (box, sphere, cylinder) and
 * materials (wood, metal, stone). They represent static or interactive world
 * objects such as crates, barrels, furniture, and structures.
 *
 * @module Props
 * @category Entities & Simulation
 */

import type { Quaternion, Vector3 } from 'three';
import { resolveMaterialDefinition } from '../materials';
import { PROPS } from './presets';

export * from './presets';
export * from './types';

import type {
  CreatePropInput,
  PropComposition,
  PropDefinition,
  ResolvedPropComponent,
} from './types';

function titleCaseFromId(id: string): string {
  return id
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function clonePosition(
  position: [number, number, number] | Vector3
): [number, number, number] | Vector3 {
  return Array.isArray(position) ? [...position] : position.clone();
}

function cloneRotation(
  rotation: [number, number, number, number] | Quaternion | undefined
): [number, number, number, number] | Quaternion | undefined {
  if (!rotation) {
    return undefined;
  }

  return Array.isArray(rotation) ? [...rotation] : rotation.clone();
}

function clonePropDefinition(definition: PropDefinition): PropDefinition {
  return {
    ...definition,
    components: definition.components.map((component) => ({
      ...component,
      size: [...component.size] as [number, number, number],
      position: clonePosition(component.position),
      rotation: cloneRotation(component.rotation),
    })),
    physics: definition.physics ? { ...definition.physics } : undefined,
    interaction: definition.interaction
      ? {
          ...definition.interaction,
          contents: definition.interaction.contents
            ? [...definition.interaction.contents]
            : undefined,
        }
      : undefined,
    audio: definition.audio ? { ...definition.audio } : undefined,
  };
}

function normalizePropDefinition(
  base: PropDefinition | undefined,
  input: CreatePropInput
): PropDefinition {
  const id = input.id ?? base?.id ?? 'prop';
  return {
    ...clonePropDefinition(
      base ?? {
        id,
        name: titleCaseFromId(id),
        components: input.components,
      }
    ),
    ...input,
    id,
    name: input.name ?? base?.name ?? titleCaseFromId(id),
    components: input.components.map((component) => ({
      ...component,
      size: [...component.size] as [number, number, number],
      position: clonePosition(component.position ?? [0, 0, 0]),
      rotation: cloneRotation(component.rotation),
    })),
  };
}

export function createProp(
  input: string | CreatePropInput,
  overrides: Partial<CreatePropInput> = {}
): PropDefinition {
  const mergedInput =
    typeof input === 'string'
      ? (() => {
          const preset = PROPS[input];
          if (!preset) {
            throw new Error(`Unknown prop preset: ${input}`);
          }

          return {
            ...overrides,
            components: overrides.components ?? preset.components,
            id: overrides.id ?? preset.id,
            name: overrides.name ?? preset.name,
            physics: overrides.physics ?? preset.physics,
            interaction: overrides.interaction ?? preset.interaction,
            audio: overrides.audio ?? preset.audio,
          } satisfies CreatePropInput;
        })()
      : {
          ...overrides,
          ...input,
          components: input.components,
        };

  const definition = normalizePropDefinition(
    typeof input === 'string' ? PROPS[input] : undefined,
    mergedInput
  );

  for (const component of definition.components) {
    resolveMaterialDefinition(component.material);
  }

  return definition;
}

export function resolvePropComposition(
  input: string | CreatePropInput,
  overrides: Partial<CreatePropInput> = {}
): PropComposition {
  const definition = createProp(input, overrides);
  const components: ResolvedPropComponent[] = definition.components.map((component) => ({
    ...component,
    materialId: component.material,
    material: resolveMaterialDefinition(component.material),
  }));

  return {
    definition,
    components,
  };
}
