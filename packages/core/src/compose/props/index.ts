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
import { MATERIALS, resolveMaterialDefinition } from '../materials';
import type {
  RuntimeBounds,
  RuntimePhysicsProfile,
  RuntimeQuaternionTuple,
  RuntimeVector3Tuple,
} from '../runtime-types';
import { PROPS } from './presets';

export * from './presets';
export * from './types';

import type {
  CreatePropInput,
  PropComposition,
  PropDefinition,
  PropRuntimeInteractionAction,
  PropRuntimeInteractionController,
  PropRuntimeInteractionResult,
  PropRuntimeInteractionSource,
  PropRuntimeInteractionState,
  PropRuntimeNode,
  ResolvedPropComponent,
} from './types';

interface PreparedPropComponent {
  component: ResolvedPropComponent;
  index: number;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  size: RuntimeVector3Tuple;
  volume: number;
}

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

function toVector3Tuple(position: [number, number, number] | Vector3): RuntimeVector3Tuple {
  return Array.isArray(position) ? [...position] : [position.x, position.y, position.z];
}

function toQuaternionTuple(
  rotation: [number, number, number, number] | Quaternion | undefined
): RuntimeQuaternionTuple | undefined {
  return rotation
    ? Array.isArray(rotation)
      ? [...rotation]
      : [rotation.x, rotation.y, rotation.z, rotation.w]
    : undefined;
}

function emptyBounds(): RuntimeBounds {
  return {
    min: [0, 0, 0],
    max: [0, 0, 0],
    size: [0, 0, 0],
    center: [0, 0, 0],
  };
}

function boundsForComponents(components: PreparedPropComponent[]): RuntimeBounds {
  if (components.length === 0) {
    return emptyBounds();
  }

  const min: RuntimeVector3Tuple = [
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    Number.POSITIVE_INFINITY,
  ];
  const max: RuntimeVector3Tuple = [
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ];

  for (const { position, size } of components) {
    for (let axis = 0; axis < 3; axis += 1) {
      const half = size[axis] / 2;
      min[axis] = Math.min(min[axis], position[axis] - half);
      max[axis] = Math.max(max[axis], position[axis] + half);
    }
  }

  return {
    min,
    max,
    size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
    center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
  };
}

function estimateShapeVolume(
  shape: ResolvedPropComponent['shape'],
  size: RuntimeVector3Tuple
): number {
  const [x, y, z] = size.map((value) => Math.max(0, value)) as RuntimeVector3Tuple;

  switch (shape) {
    case 'sphere':
      return (4 / 3) * Math.PI * (x / 2) * (y / 2) * (z / 2);
    case 'cylinder':
      return Math.PI * (x / 2) * (z / 2) * y;
    case 'capsule': {
      const [length, diameterA, diameterB] = [x, y, z].sort((a, b) => b - a);
      const radius = (diameterA + diameterB) / 4;
      const cylinderHeight = Math.max(0, length - 2 * radius);
      return Math.PI * radius * radius * cylinderHeight + (4 / 3) * Math.PI * radius ** 3;
    }
    case 'box':
    case 'mesh':
      return x * y * z;
  }
}

function weightedAverage(
  values: Array<{ value: number | undefined; weight: number }>
): number | undefined {
  const weighted = values.filter((entry) => entry.value !== undefined && entry.weight > 0);
  const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);

  if (totalWeight === 0) {
    return undefined;
  }

  return weighted.reduce((sum, entry) => sum + (entry.value ?? 0) * entry.weight, 0) / totalWeight;
}

function runtimePhysicsSource(
  hasDefinition: boolean,
  hasMaterial: boolean
): RuntimePhysicsProfile['source'] {
  if (hasDefinition && hasMaterial) {
    return 'mixed';
  }

  if (hasDefinition) {
    return 'definition';
  }

  return hasMaterial ? 'material' : 'implicit';
}

function materialIdsByType(): Record<string, string[]> {
  return Object.values(MATERIALS).reduce<Record<string, string[]>>((groups, material) => {
    groups[material.type] = [...(groups[material.type] ?? []), material.id];
    return groups;
  }, {});
}

function defaultInteractionAction(type: PropRuntimeInteractionAction['type']): string {
  switch (type) {
    case 'container':
      return 'open-container';
    case 'seat':
      return 'sit';
    case 'door':
      return 'toggle-door';
    case 'switch':
      return 'toggle-switch';
    case 'collectible':
      return 'collect';
  }
}

function defaultInteractionLabel(type: PropRuntimeInteractionAction['type'], name: string): string {
  switch (type) {
    case 'container':
      return `Open ${name}`;
    case 'seat':
      return `Sit on ${name}`;
    case 'door':
      return `Open ${name}`;
    case 'switch':
      return `Use ${name}`;
    case 'collectible':
      return `Collect ${name}`;
  }
}

function buildPropInteractionActions(
  definition: PropDefinition,
  nodes: PropRuntimeNode[]
): PropRuntimeInteractionAction[] {
  const interaction = definition.interaction;

  if (!interaction) {
    return [];
  }

  const payload: PropRuntimeInteractionAction['payload'] = {
    ...(interaction.capacity !== undefined ? { capacity: interaction.capacity } : {}),
    ...(interaction.contents ? { contents: [...interaction.contents] } : {}),
    ...(interaction.action ? { command: interaction.action } : {}),
  };
  const type = interaction.type;

  return [
    {
      id: `${definition.id}:interaction:${type}`,
      type,
      action: interaction.action ?? defaultInteractionAction(type),
      label: defaultInteractionLabel(type, definition.name),
      enabled: type !== 'container' || interaction.capacity !== 0,
      nodeIds: nodes.map((node) => node.id),
      audio: definition.audio?.interaction,
      payload: Object.keys(payload).length > 0 ? payload : undefined,
    },
  ];
}

function buildPropRuntime(
  definition: PropDefinition,
  components: ResolvedPropComponent[]
): PropComposition['runtime'] {
  const prepared = components.map<PreparedPropComponent>((component, index) => {
    const size = [...component.size] as RuntimeVector3Tuple;
    return {
      component,
      index,
      position: toVector3Tuple(component.position),
      rotation: toQuaternionTuple(component.rotation),
      size,
      volume: estimateShapeVolume(component.shape, size),
    };
  });
  const totalVolume = prepared.reduce((sum, entry) => sum + entry.volume, 0);
  const materialMass = prepared.reduce(
    (sum, entry) => sum + (entry.component.material.physics?.density ?? 0) * entry.volume,
    0
  );
  const hasMaterialPhysics = prepared.some((entry) => entry.component.material.physics);
  const materialWeighted = prepared.map((entry) => ({
    physics: entry.component.material.physics,
    weight: entry.volume,
  }));
  const swappableMaterialIds = materialIdsByType();
  const materialSlots: PropComposition['runtime']['materialSlots'] = {};
  const nodes: PropRuntimeNode[] = prepared.map((entry) => {
    const { component } = entry;
    const materialPhysics = component.material.physics;
    const materialSlot = `${definition.id}:component:${entry.index}:${component.materialId}`;
    const massFromDefinition =
      definition.physics?.mass && totalVolume > 0
        ? definition.physics.mass * (entry.volume / totalVolume)
        : undefined;

    materialSlots[materialSlot] = {
      id: materialSlot,
      materialId: component.materialId,
      material: component.material,
      physics: materialPhysics,
      swappableWith: (swappableMaterialIds[component.material.type] ?? []).filter(
        (materialId) => materialId !== component.materialId
      ),
    };

    return {
      id: `${definition.id}:component:${entry.index}`,
      componentIndex: entry.index,
      shape: component.shape,
      size: entry.size,
      position: entry.position,
      rotation: entry.rotation,
      mesh: component.mesh,
      materialSlot,
      materialId: component.materialId,
      material: component.material,
      volume: entry.volume,
      physics: {
        mode: definition.physics?.type,
        mass:
          massFromDefinition ??
          (materialPhysics ? materialPhysics.density * entry.volume : undefined),
        density: materialPhysics?.density,
        friction: definition.physics?.friction ?? materialPhysics?.friction,
        restitution: definition.physics?.restitution ?? materialPhysics?.restitution,
        source: runtimePhysicsSource(Boolean(definition.physics), Boolean(materialPhysics)),
      },
      interaction: definition.interaction,
    };
  });

  return {
    kind: 'prop',
    id: definition.id,
    name: definition.name,
    nodes,
    materialSlots,
    bounds: boundsForComponents(prepared),
    physics: {
      mode: definition.physics?.type ?? 'static',
      mass: definition.physics?.mass ?? (materialMass > 0 ? materialMass : undefined),
      density: weightedAverage(
        materialWeighted.map((entry) => ({ value: entry.physics?.density, weight: entry.weight }))
      ),
      friction:
        definition.physics?.friction ??
        weightedAverage(
          materialWeighted.map((entry) => ({
            value: entry.physics?.friction,
            weight: entry.weight,
          }))
        ),
      restitution:
        definition.physics?.restitution ??
        weightedAverage(
          materialWeighted.map((entry) => ({
            value: entry.physics?.restitution,
            weight: entry.weight,
          }))
        ),
      source: runtimePhysicsSource(Boolean(definition.physics), hasMaterialPhysics),
    },
    interaction: definition.interaction,
    interactionActions: buildPropInteractionActions(definition, nodes),
    audio: definition.audio,
  };
}

function cloneInteractionState(
  state: PropRuntimeInteractionState = {}
): PropRuntimeInteractionState {
  return {
    ...state,
    contents: state.contents ? [...state.contents] : undefined,
    disabledActionIds: state.disabledActionIds ? [...state.disabledActionIds] : undefined,
  };
}

function withDisabledAction(
  state: PropRuntimeInteractionState,
  actionId: string
): PropRuntimeInteractionState {
  const disabled = new Set(state.disabledActionIds ?? []);
  disabled.add(actionId);

  return {
    ...state,
    disabledActionIds: [...disabled],
  };
}

function disabledResult(
  action: PropRuntimeInteractionAction | undefined,
  status: PropRuntimeInteractionResult['status'],
  state: PropRuntimeInteractionState
): PropRuntimeInteractionResult {
  return {
    status,
    action,
    effects: [],
    nextState: cloneInteractionState(state),
  };
}

function interactionEffectsBase(
  action: PropRuntimeInteractionAction
): PropRuntimeInteractionResult['effects'] {
  return action.audio ? [{ type: 'audio', cue: action.audio }] : [];
}

export function findPropInteractionAction(
  runtime: PropRuntimeInteractionSource,
  action: string | PropRuntimeInteractionAction
): PropRuntimeInteractionAction | undefined {
  const actionId = typeof action === 'string' ? action : action.id;
  return runtime.interactionActions.find((entry) => entry.id === actionId);
}

export function executePropInteractionAction(
  runtime: PropRuntimeInteractionSource,
  action: string | PropRuntimeInteractionAction,
  state: PropRuntimeInteractionState = {}
): PropRuntimeInteractionResult {
  const interactionAction = findPropInteractionAction(runtime, action);

  if (!interactionAction) {
    return disabledResult(undefined, 'not-found', state);
  }

  if (
    !interactionAction.enabled ||
    (state.disabledActionIds ?? []).includes(interactionAction.id)
  ) {
    return disabledResult(interactionAction, 'disabled', state);
  }

  const nextState = cloneInteractionState(state);
  const effects = interactionEffectsBase(interactionAction);
  const payloadItems = interactionAction.payload?.contents ?? state.contents ?? [];

  switch (interactionAction.type) {
    case 'container':
      nextState.open = true;
      effects.push({ type: 'state', key: 'open', value: true });
      if (payloadItems.length > 0) {
        effects.push({ type: 'inventory', operation: 'inspect', items: [...payloadItems] });
      }
      break;
    case 'seat':
      if (state.occupied) {
        return disabledResult(interactionAction, 'already-occupied', state);
      }
      nextState.occupied = true;
      effects.push({ type: 'state', key: 'occupied', value: true });
      break;
    case 'door': {
      const open = !state.open;
      nextState.open = open;
      effects.push({ type: 'state', key: 'open', value: open });
      effects.push({
        type: 'physics',
        operation: 'set-mode',
        nodeIds: [...interactionAction.nodeIds],
        mode: 'kinematic',
      });
      break;
    }
    case 'switch': {
      const active = !state.active;
      nextState.active = active;
      effects.push({ type: 'state', key: 'active', value: active });
      if (interactionAction.payload?.command) {
        effects.push({ type: 'command', command: interactionAction.payload.command });
      }
      break;
    }
    case 'collectible':
      if (state.collected) {
        return disabledResult(interactionAction, 'already-collected', state);
      }
      nextState.collected = true;
      effects.push({ type: 'state', key: 'collected', value: true });
      effects.push({
        type: 'physics',
        operation: 'disable-collider',
        nodeIds: [...interactionAction.nodeIds],
      });
      if (payloadItems.length > 0) {
        effects.push({ type: 'inventory', operation: 'collect', items: [...payloadItems] });
      }
      return {
        status: 'executed',
        action: interactionAction,
        effects,
        nextState: withDisabledAction(nextState, interactionAction.id),
      };
  }

  return {
    status: 'executed',
    action: interactionAction,
    effects,
    nextState,
  };
}

export function createPropInteractionController(
  runtime: PropRuntimeInteractionSource,
  initialState: PropRuntimeInteractionState = {}
): PropRuntimeInteractionController {
  let currentState = cloneInteractionState(initialState);

  return {
    getState: () => cloneInteractionState(currentState),
    setState: (state) => {
      currentState = cloneInteractionState(state);
      return cloneInteractionState(currentState);
    },
    reset: (state = initialState) => {
      currentState = cloneInteractionState(state);
      return cloneInteractionState(currentState);
    },
    execute: (action) => {
      const result = executePropInteractionAction(runtime, action, currentState);
      currentState = cloneInteractionState(result.nextState);
      return result;
    },
  };
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
    runtime: buildPropRuntime(definition, components),
  };
}
