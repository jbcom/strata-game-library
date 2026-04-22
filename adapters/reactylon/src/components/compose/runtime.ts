import {
  type CreateCreatureInput,
  type CreatePropInput,
  type CreatureComposition,
  type CreatureRuntimeAssembly,
  createCreatureRigBindingPlan,
  type PropComposition,
  type PropRuntimeAssembly,
  resolveCreatureComposition,
  resolvePropComposition,
} from '@strata-game-library/core/compose';
import { createReactylonRuntimeMaterialDescriptor } from './materials.js';
import type {
  ReactylonCreatureInput,
  ReactylonPropInput,
  ReactylonRuntimeCreatureDescriptor,
  ReactylonRuntimeMaterialOptions,
  ReactylonRuntimePropDescriptor,
  ReactylonRuntimeTransformOptions,
} from './types.js';

function scaleVector(scale: ReactylonRuntimeTransformOptions['scale']): [number, number, number] {
  if (scale === undefined) {
    return [1, 1, 1];
  }

  return typeof scale === 'number' ? [scale, scale, scale] : scale;
}

function isPropComposition(input: ReactylonPropInput): input is PropComposition {
  return typeof input === 'object' && 'runtime' in input;
}

function isPropRuntimeAssembly(input: ReactylonPropInput): input is PropRuntimeAssembly {
  return typeof input === 'object' && 'kind' in input && input.kind === 'prop';
}

function resolveRuntimeProp(input: ReactylonPropInput): PropRuntimeAssembly {
  if (isPropRuntimeAssembly(input)) {
    return input;
  }

  if (isPropComposition(input)) {
    return input.runtime;
  }

  return resolvePropComposition(input as string | CreatePropInput).runtime;
}

function isCreatureComposition(input: ReactylonCreatureInput): input is CreatureComposition {
  return typeof input === 'object' && 'runtime' in input;
}

function isCreatureRuntimeAssembly(
  input: ReactylonCreatureInput
): input is CreatureRuntimeAssembly {
  return typeof input === 'object' && 'kind' in input && input.kind === 'creature';
}

function resolveRuntimeCreature(input: ReactylonCreatureInput): CreatureRuntimeAssembly {
  if (isCreatureRuntimeAssembly(input)) {
    return input;
  }

  if (isCreatureComposition(input)) {
    return input.runtime;
  }

  return resolveCreatureComposition(input as string | CreateCreatureInput).runtime;
}

/**
 * Resolves a prop composition into a serializable Reactylon/Babylon runtime descriptor.
 */
export function resolveReactylonRuntimeProp(
  prop: ReactylonPropInput,
  options: ReactylonRuntimeMaterialOptions & ReactylonRuntimeTransformOptions = {}
): ReactylonRuntimePropDescriptor {
  const runtime = resolveRuntimeProp(prop);
  const materialSlots = Object.fromEntries(
    Object.values(runtime.materialSlots).map((slot) => [
      slot.id,
      createReactylonRuntimeMaterialDescriptor(slot, options),
    ])
  );

  return {
    kind: 'prop',
    id: runtime.id,
    name: runtime.name,
    position: options.position ?? [0, 0, 0],
    rotation: options.rotation,
    scale: scaleVector(options.scale),
    nodes: runtime.nodes.map((node) => ({
      id: node.id,
      componentIndex: node.componentIndex,
      shape: node.shape,
      size: node.size,
      position: node.position,
      rotation: node.rotation,
      mesh: node.mesh,
      materialSlot: node.materialSlot,
      materialId: node.materialId,
      volume: node.volume,
      physics: node.physics,
      interaction: node.interaction,
    })),
    materialSlots,
    bounds: runtime.bounds,
    physics: runtime.physics,
    interaction: runtime.interaction,
    interactionActions: (runtime.interactionActions ?? []).map((action) => ({
      ...action,
      nodeIds: [...action.nodeIds],
      payload: action.payload
        ? {
            ...action.payload,
            contents: action.payload.contents ? [...action.payload.contents] : undefined,
          }
        : undefined,
    })),
    audio: runtime.audio,
  };
}

/**
 * Resolves a creature composition into a serializable Reactylon/Babylon runtime descriptor.
 */
export function resolveReactylonRuntimeCreature(
  creature: ReactylonCreatureInput,
  options: ReactylonRuntimeMaterialOptions & ReactylonRuntimeTransformOptions = {}
): ReactylonRuntimeCreatureDescriptor {
  const runtime = resolveRuntimeCreature(creature);
  const materialSlots = Object.fromEntries(
    Object.values(runtime.materialSlots).map((slot) => [
      slot.id,
      createReactylonRuntimeMaterialDescriptor(slot, options),
    ])
  );

  return {
    kind: 'creature',
    id: runtime.id,
    name: runtime.name,
    position: options.position ?? [0, 0, 0],
    rotation: options.rotation,
    resolvedScale: runtime.scale,
    scale: scaleVector(options.scale),
    bones: runtime.bones.map((bone) => ({
      id: bone.id,
      boneId: bone.boneId,
      parent: bone.parent,
      shape: bone.shape,
      size: bone.size,
      position: bone.position,
      rotation: bone.rotation,
      materialSlot: bone.materialSlot,
      materialId: bone.materialId,
      volume: bone.volume,
      physics: bone.physics,
      animationTargets: [...bone.animationTargets],
    })),
    materialSlots,
    bounds: runtime.bounds,
    physics: runtime.physics,
    animations: runtime.animations.map((animation) => ({
      ...animation,
      targetBones: [...animation.targetBones],
    })),
    animationGraph: {
      ...runtime.animationGraph,
      states: runtime.animationGraph.states.map((state) => ({
        ...state,
        targetBones: [...state.targetBones],
        tags: [...state.tags],
      })),
      transitions: runtime.animationGraph.transitions.map((transition) => ({ ...transition })),
      blendGroups: runtime.animationGraph.blendGroups.map((group) => ({
        ...group,
        states: [...group.states],
        tags: [...group.tags],
      })),
    },
    asset: runtime.asset
      ? {
          ...runtime.asset,
          animationClips: { ...runtime.asset.animationClips },
          boneMap: { ...runtime.asset.boneMap },
        }
      : undefined,
    rigBinding: createCreatureRigBindingPlan(runtime),
    ikChains: runtime.ikChains?.map((chain) => ({
      ...chain,
      bones: [...chain.bones],
    })),
    spawn: {
      ...runtime.spawn,
      biomes: [...runtime.spawn.biomes],
      packSize: runtime.spawn.packSize ? [...runtime.spawn.packSize] : undefined,
      timeOfDay: runtime.spawn.timeOfDay ? [...runtime.spawn.timeOfDay] : undefined,
    },
    ai: runtime.ai,
    stats: { ...runtime.stats },
    drops: runtime.drops
      ? {
          guaranteed: runtime.drops.guaranteed?.map((drop) => ({ ...drop })),
          chance: runtime.drops.chance?.map((drop) => ({ ...drop })),
        }
      : undefined,
    sounds: runtime.sounds
      ? {
          ...runtime.sounds,
          idle: runtime.sounds.idle ? [...runtime.sounds.idle] : undefined,
        }
      : undefined,
  };
}
