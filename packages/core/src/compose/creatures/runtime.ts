/**
 * Assembles a resolved creature: skeleton bones scaled and materialised into
 * runtime bones with physics, material slots, animation bindings, an animation
 * graph, and an IK rig plan.
 *
 * @module CreatureRuntime
 * @category Entities & Simulation
 */

import type * as THREE from 'three';
import { createMaterialVariant, MATERIALS, resolveMaterialDefinition } from '../materials';
import type { RuntimePhysicsProfile, RuntimeVector3Tuple } from '../runtime-types';
import { resolveSkeletonDefinition } from '../skeletons';
import type { SkeletonDefinition } from '../skeletons/types';
import { createCreatureAnimationGraph } from './animation-graph';
import {
  boundsForBones,
  estimateBoneVolume,
  type PreparedCreatureBone,
  resolveBoneWorldPositions,
  selectRegionPattern,
  toQuaternionTuple,
  toVector3Tuple,
  weightedAverage,
} from './bone-geometry';
import { createCreature } from './definitions';
import { createCreatureIKRigPlan } from './ik';
import type {
  CreateCreatureInput,
  CreatureComposition,
  CreatureDefinition,
  CreatureRuntimeAnimationBinding,
  CreatureRuntimeBone,
  ResolvedCreatureMaterial,
} from './types';
import { scaleVector } from './vector-math';

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

function buildCreatureRuntime(
  definition: CreatureDefinition,
  skeleton: SkeletonDefinition,
  scale: number,
  materialsByBone: Record<string, ResolvedCreatureMaterial>
): CreatureComposition['runtime'] {
  const worldPositions = resolveBoneWorldPositions(skeleton);
  const allBoneIds = skeleton.bones.map((bone) => bone.id);
  const animationTargets = skeleton.animationTargets ?? {};
  const prepared = skeleton.bones.map<PreparedCreatureBone>((bone, index) => {
    const size = scaleVector([...bone.size] as RuntimeVector3Tuple, scale);
    return {
      bone,
      index,
      position: scaleVector(worldPositions.get(bone.id) ?? toVector3Tuple(bone.position), scale),
      rotation: toQuaternionTuple(bone.rotation),
      size,
      volume: estimateBoneVolume(bone.shape, size),
      material: materialsByBone[bone.id],
    };
  });
  const materialSlots: CreatureComposition['runtime']['materialSlots'] = {};
  const materialWeighted = prepared.map((entry) => ({
    physics: entry.material.material.physics,
    weight: entry.volume,
  }));
  const hasBonePhysics = skeleton.bones.some((bone) => bone.physics);
  const hasMaterialPhysics = prepared.some((entry) => entry.material.material.physics);
  const swappableMaterialIds = materialIdsByType();
  const bones: CreatureRuntimeBone[] = prepared.map((entry) => {
    const materialPhysics = entry.material.material.physics;
    const materialSlot = `${definition.id}:bone:${entry.bone.id}:${entry.material.materialId}`;

    materialSlots[materialSlot] = {
      id: materialSlot,
      materialId: entry.material.materialId,
      material: entry.material.material,
      physics: materialPhysics,
      swappableWith: (swappableMaterialIds[entry.material.material.type] ?? []).filter(
        (materialId) => materialId !== entry.material.materialId
      ),
    };

    return {
      id: `${definition.id}:bone:${entry.bone.id}`,
      boneId: entry.bone.id,
      parent: entry.bone.parent,
      shape: entry.bone.shape,
      size: entry.size,
      position: entry.position,
      rotation: entry.rotation,
      materialSlot,
      materialId: entry.material.materialId,
      material: entry.material.material,
      volume: entry.volume,
      physics: {
        mode: 'dynamic',
        mass:
          entry.bone.physics?.mass ??
          (materialPhysics ? materialPhysics.density * entry.volume : undefined),
        density: materialPhysics?.density,
        friction: materialPhysics?.friction,
        restitution: materialPhysics?.restitution,
        source: runtimePhysicsSource(Boolean(entry.bone.physics), Boolean(materialPhysics)),
      },
      animationTargets: Object.entries(animationTargets)
        .filter(([, targetBones]) => targetBones.includes(entry.bone.id))
        .map(([name]) => name),
    };
  });
  const animations = Object.entries(definition.animations)
    .filter(([, clip]) => clip !== undefined)
    .map<CreatureRuntimeAnimationBinding>(([name, clip]) => ({
      name,
      clip: clip as string | THREE.AnimationClip,
      targetBones: animationTargets[name] ? [...animationTargets[name]] : [...allBoneIds],
    }));
  const ikChains = skeleton.ikChains?.map((chain) => ({
    ...chain,
    bones: [...chain.bones],
  }));

  return {
    kind: 'creature',
    id: definition.id,
    name: definition.name,
    scale,
    bones,
    materialSlots,
    bounds: boundsForBones(prepared),
    physics: {
      mode: 'dynamic',
      mass: bones.reduce((sum, bone) => sum + (bone.physics.mass ?? 0), 0) || undefined,
      density: weightedAverage(
        materialWeighted.map((entry) => ({ value: entry.physics?.density, weight: entry.weight }))
      ),
      friction: weightedAverage(
        materialWeighted.map((entry) => ({ value: entry.physics?.friction, weight: entry.weight }))
      ),
      restitution: weightedAverage(
        materialWeighted.map((entry) => ({
          value: entry.physics?.restitution,
          weight: entry.weight,
        }))
      ),
      source: runtimePhysicsSource(hasBonePhysics, hasMaterialPhysics),
    },
    animations,
    animationGraph: createCreatureAnimationGraph({
      id: definition.id,
      animations,
      stats: definition.stats,
    }),
    asset: definition.assets
      ? {
          model: definition.assets.model,
          rig: definition.assets.rig,
          animationClips: definition.assets.animationClips
            ? { ...definition.assets.animationClips }
            : {},
          boneMap: definition.assets.boneMap ? { ...definition.assets.boneMap } : {},
        }
      : undefined,
    ikChains,
    ikRig: createCreatureIKRigPlan({
      id: definition.id,
      bones,
      ikChains,
    }),
    spawn: {
      biomes: [...definition.biomes],
      spawnWeight: definition.spawnWeight,
      packSize: definition.packSize ? ([...definition.packSize] as [number, number]) : undefined,
      timeOfDay: definition.timeOfDay ? [...definition.timeOfDay] : undefined,
    },
    ai: definition.ai,
    stats: { ...definition.stats },
    drops: definition.drops
      ? {
          guaranteed: definition.drops.guaranteed?.map((item) => ({ ...item })),
          chance: definition.drops.chance?.map((item) => ({ ...item })),
        }
      : undefined,
    sounds: definition.sounds
      ? {
          ...definition.sounds,
          idle: definition.sounds.idle ? [...definition.sounds.idle] : undefined,
        }
      : undefined,
  };
}

export function resolveCreatureComposition(
  input: string | CreateCreatureInput,
  overrides: Partial<CreateCreatureInput> = {},
  rng: () => number = Math.random
): CreatureComposition {
  const definition = createCreature(input, overrides);
  const skeleton = resolveSkeletonDefinition(definition.skeleton);
  const materialsByBone: Record<string, ResolvedCreatureMaterial> = {};

  for (const bone of skeleton.bones) {
    const matched = selectRegionPattern(bone.id, definition.covering.regions);
    if (!matched) {
      throw new Error(
        `No covering region matched bone "${bone.id}" on creature "${definition.id}"`
      );
    }

    const [pattern, region] = matched;
    const material = resolveMaterialDefinition(region.material);
    const variation = region.variation ? (rng() * 2 - 1) * region.variation : 0;
    materialsByBone[bone.id] = {
      ...region,
      boneId: bone.id,
      pattern,
      materialId: region.material,
      material: createMaterialVariant(material, {
        id: `${definition.id}_${bone.id}_${region.material}`,
        baseColor: region.color,
        roughnessDelta: variation * 0.1,
        normalScaleDelta: variation * 0.25,
      }),
    };
  }

  const baseScale = definition.scale ?? 1;
  const scaleVariation = definition.scaleVariation ?? 0;
  const variation = scaleVariation > 0 ? (rng() * 2 - 1) * scaleVariation : 0;
  const resolvedScale = Math.max(0.01, baseScale * (1 + variation));

  return {
    definition,
    skeleton,
    scale: resolvedScale,
    materialsByBone,
    runtime: buildCreatureRuntime(definition, skeleton, resolvedScale, materialsByBone),
  };
}
