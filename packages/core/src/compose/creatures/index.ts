/**
 * Creature composition system and preset definitions.
 *
 * Creatures are composed from skeletons, material coverings, AI behaviors,
 * stats, animations, and spawn rules. This module provides the creature
 * registry and built-in presets like the river otter.
 *
 * @module Creatures
 * @category Entities & Simulation
 */

import type * as THREE from 'three';
import { COVERINGS } from '../coverings';
import { createMaterialVariant, MATERIALS, resolveMaterialDefinition } from '../materials';
import type {
  RuntimeBounds,
  RuntimePhysicsProfile,
  RuntimeQuaternionTuple,
  RuntimeVector3Tuple,
} from '../runtime-types';
import { resolveSkeletonDefinition } from '../skeletons';
import type { BoneDefinition, SkeletonDefinition } from '../skeletons/types';
import type {
  CreateCreatureInput,
  CreatureComposition,
  CreatureDefinition,
  CreatureRuntimeAnimationBinding,
  CreatureRuntimeAnimationGraph,
  CreatureRuntimeAnimationGraphOptions,
  CreatureRuntimeAnimationGraphState,
  CreatureRuntimeAnimationGraphTransition,
  CreatureRuntimeBone,
  CreatureRuntimeIKChainBonePlan,
  CreatureRuntimeIKChainPlan,
  CreatureRuntimeIKRigPlan,
  CreatureRuntimeIKSolverKind,
  CreatureRuntimeRigBindingPlan,
  CreatureRuntimeRigBindingSource,
  CreatureRuntimeRigBindingStatus,
  ResolvedCreatureMaterial,
} from './types';

export * from './types';

export const CREATURES: Record<string, CreatureDefinition> = {
  otter_river: {
    id: 'otter_river',
    name: 'River Otter',
    description: 'A playful aquatic mammal often seen fishing in rivers.',

    skeleton: 'quadruped_medium',
    covering: COVERINGS.otter,

    scale: 1.0,
    scaleVariation: 0.15,

    stats: {
      health: 50,
      speed: 6,
      swimSpeed: 12,
      stamina: 80,
    },

    ai: 'prey',

    animations: {
      idle: 'otter_idle',
      walk: 'otter_walk',
      run: 'otter_run',
      swim: 'otter_swim',
      eat: 'otter_eat',
      play: 'otter_play',
    },

    biomes: ['marsh'],
    spawnWeight: 0.4,
    packSize: [2, 6],
    timeOfDay: ['day', 'dawn', 'dusk'],

    drops: {
      guaranteed: [{ item: 'otter_pelt', count: 1 }],
      chance: [{ item: 'fish', count: [1, 3], probability: 0.3 }],
    },

    sounds: {
      idle: ['otter_chirp_1', 'otter_chirp_2', 'otter_squeak'],
      alert: 'otter_alert',
      hurt: 'otter_hurt',
    },
  },
};

interface PreparedCreatureBone {
  bone: BoneDefinition;
  index: number;
  position: RuntimeVector3Tuple;
  rotation?: RuntimeQuaternionTuple;
  size: RuntimeVector3Tuple;
  volume: number;
  material: ResolvedCreatureMaterial;
}

function titleCaseFromId(id: string): string {
  return id
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function cloneCreatureDefinition(definition: CreatureDefinition): CreatureDefinition {
  return {
    ...definition,
    covering: {
      skeleton: definition.covering.skeleton,
      regions: Object.fromEntries(
        Object.entries(definition.covering.regions).map(([pattern, region]) => [
          pattern,
          { ...region },
        ])
      ),
      patterns: definition.covering.patterns?.map((pattern) => ({
        ...pattern,
        direction: Array.isArray(pattern.direction)
          ? [...pattern.direction]
          : pattern.direction?.clone(),
      })),
      markings: definition.covering.markings?.map((marking) => ({
        ...marking,
        regions: [...marking.regions],
      })),
    },
    stats: { ...definition.stats },
    animations: { ...definition.animations },
    assets: definition.assets
      ? {
          ...definition.assets,
          animationClips: definition.assets.animationClips
            ? { ...definition.assets.animationClips }
            : undefined,
          boneMap: definition.assets.boneMap ? { ...definition.assets.boneMap } : undefined,
        }
      : undefined,
    biomes: [...definition.biomes],
    packSize: definition.packSize ? ([...definition.packSize] as [number, number]) : undefined,
    timeOfDay: definition.timeOfDay ? [...definition.timeOfDay] : undefined,
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

function mergeCreatureDefinition(
  base: CreatureDefinition | undefined,
  input: CreateCreatureInput
): CreatureDefinition {
  const skeletonId = typeof input.skeleton === 'string' ? input.skeleton : input.skeleton.id;
  const coveringSkeleton = input.covering.skeleton ?? skeletonId;
  if (coveringSkeleton !== skeletonId) {
    throw new Error(
      `Creature covering skeleton "${coveringSkeleton}" does not match creature skeleton "${skeletonId}"`
    );
  }

  const mergedId = input.id ?? base?.id ?? skeletonId;

  return {
    ...cloneCreatureDefinition(
      base ?? {
        id: mergedId,
        name: titleCaseFromId(mergedId),
        skeleton: input.skeleton,
        covering: { skeleton: coveringSkeleton, regions: {} },
        scale: 1,
        stats: input.stats,
        ai: input.ai,
        animations: {
          idle: `${mergedId}_idle`,
          walk: `${mergedId}_walk`,
          run: `${mergedId}_run`,
        },
        biomes: [],
        spawnWeight: 1,
      }
    ),
    ...input,
    id: mergedId,
    name: input.name ?? base?.name ?? titleCaseFromId(mergedId),
    skeleton: input.skeleton,
    covering: {
      skeleton: coveringSkeleton,
      regions: {
        ...(base?.covering.regions ?? {}),
        ...Object.fromEntries(
          Object.entries(input.covering.regions).map(([pattern, region]) => [
            pattern,
            { ...region },
          ])
        ),
      },
      patterns:
        input.covering.patterns?.map((pattern) => ({
          ...pattern,
          direction: Array.isArray(pattern.direction)
            ? [...pattern.direction]
            : pattern.direction?.clone(),
        })) ??
        base?.covering.patterns?.map((pattern) => ({
          ...pattern,
          direction: Array.isArray(pattern.direction)
            ? [...pattern.direction]
            : pattern.direction?.clone(),
        })),
      markings:
        input.covering.markings?.map((marking) => ({
          ...marking,
          regions: [...marking.regions],
        })) ??
        base?.covering.markings?.map((marking) => ({
          ...marking,
          regions: [...marking.regions],
        })),
    },
    stats: {
      ...(base?.stats ?? {}),
      ...input.stats,
    },
    animations: {
      idle: `${mergedId}_idle`,
      walk: `${mergedId}_walk`,
      run: `${mergedId}_run`,
      ...(base?.animations ?? {}),
      ...(input.animations ?? {}),
    },
    assets: input.assets
      ? {
          ...input.assets,
          animationClips: input.assets.animationClips
            ? { ...input.assets.animationClips }
            : undefined,
          boneMap: input.assets.boneMap ? { ...input.assets.boneMap } : undefined,
        }
      : base?.assets
        ? {
            ...base.assets,
            animationClips: base.assets.animationClips
              ? { ...base.assets.animationClips }
              : undefined,
            boneMap: base.assets.boneMap ? { ...base.assets.boneMap } : undefined,
          }
        : undefined,
    biomes: input.biomes ? [...input.biomes] : base?.biomes ? [...base.biomes] : [],
    spawnWeight: input.spawnWeight ?? base?.spawnWeight ?? 1,
    packSize: input.packSize
      ? ([Math.min(...input.packSize), Math.max(...input.packSize)] as [number, number])
      : base?.packSize
        ? ([...base.packSize] as [number, number])
        : undefined,
    timeOfDay: input.timeOfDay
      ? [...input.timeOfDay]
      : base?.timeOfDay
        ? [...base.timeOfDay]
        : undefined,
  };
}

function escapePattern(pattern: string): string {
  return pattern.replace(/[|\\{}()[\]^$+?.]/g, '\\$&');
}

function matchesBonePattern(boneId: string, pattern: string): boolean {
  if (pattern === '*') {
    return true;
  }

  if (!pattern.includes('*')) {
    return boneId === pattern;
  }

  return new RegExp(`^${escapePattern(pattern).replace(/\*/g, '.*')}$`).test(boneId);
}

function selectRegionPattern(
  boneId: string,
  regions: Record<
    string,
    { material: string; color?: string | THREE.Color; scale?: number; variation?: number }
  >
):
  | [string, { material: string; color?: string | THREE.Color; scale?: number; variation?: number }]
  | undefined {
  const matches = Object.entries(regions).filter(([pattern]) =>
    matchesBonePattern(boneId, pattern)
  );
  if (matches.length === 0) {
    return undefined;
  }

  return matches.sort(([patternA], [patternB]) => {
    const score = (pattern: string) =>
      (pattern.includes('*') ? 0 : 10_000) + pattern.replaceAll('*', '').length;
    return score(patternB) - score(patternA);
  })[0];
}

function toVector3Tuple(position: [number, number, number] | THREE.Vector3): RuntimeVector3Tuple {
  return Array.isArray(position) ? [...position] : [position.x, position.y, position.z];
}

function toQuaternionTuple(
  rotation: [number, number, number, number] | THREE.Quaternion | undefined
): RuntimeQuaternionTuple | undefined {
  return rotation
    ? Array.isArray(rotation)
      ? [...rotation]
      : [rotation.x, rotation.y, rotation.z, rotation.w]
    : undefined;
}

function addVector(a: RuntimeVector3Tuple, b: RuntimeVector3Tuple): RuntimeVector3Tuple {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function scaleVector(vector: RuntimeVector3Tuple, scale: number): RuntimeVector3Tuple {
  return [vector[0] * scale, vector[1] * scale, vector[2] * scale];
}

function resolveBoneWorldPositions(skeleton: SkeletonDefinition): Map<string, RuntimeVector3Tuple> {
  const bonesById = new Map(skeleton.bones.map((bone) => [bone.id, bone]));
  const positions = new Map<string, RuntimeVector3Tuple>();

  const resolveBone = (bone: BoneDefinition): RuntimeVector3Tuple => {
    const cached = positions.get(bone.id);
    if (cached) {
      return cached;
    }

    const local = toVector3Tuple(bone.position);
    const parent = bone.parent ? bonesById.get(bone.parent) : undefined;
    const world = parent ? addVector(resolveBone(parent), local) : local;
    positions.set(bone.id, world);
    return world;
  };

  for (const bone of skeleton.bones) {
    resolveBone(bone);
  }

  return positions;
}

function emptyBounds(): RuntimeBounds {
  return {
    min: [0, 0, 0],
    max: [0, 0, 0],
    size: [0, 0, 0],
    center: [0, 0, 0],
  };
}

function boundsForBones(bones: PreparedCreatureBone[]): RuntimeBounds {
  if (bones.length === 0) {
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

  for (const { position, size } of bones) {
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

function estimateBoneVolume(shape: BoneDefinition['shape'], size: RuntimeVector3Tuple): number {
  const [x, y, z] = size.map((value) => Math.max(0, value)) as RuntimeVector3Tuple;

  switch (shape) {
    case 'sphere':
      return (4 / 3) * Math.PI * (x / 2) * (y / 2) * (z / 2);
    case 'cylinder':
      return Math.PI * (x / 2) * (z / 2) * y;
    case 'capsule': {
      const [length, diameterA, diameterB] = [x, y, z].sort((a, b) => b - a);
      const radius = (diameterA + diameterB) / 4;
      const cylinderLength = Math.max(0, length - 2 * radius);
      return Math.PI * radius * radius * cylinderLength + (4 / 3) * Math.PI * radius ** 3;
    }
    case 'box':
    case 'custom':
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

function uniqueStrings(values: readonly string[] | undefined): string[] {
  return values ? [...new Set(values.filter((value) => value.length > 0))] : [];
}

function rigBindingStatus(
  sourceBones: Set<string> | undefined,
  sourceBone: string
): CreatureRuntimeRigBindingStatus {
  if (!sourceBones) {
    return 'unverified';
  }

  return sourceBones.has(sourceBone) ? 'matched' : 'missing';
}

const CREATURE_TERMINAL_ANIMATIONS = new Set(['death', 'die', 'dead']);
const CREATURE_ONE_SHOT_ANIMATIONS = new Set(['attack', 'hurt', 'eat', 'play']);
const CREATURE_LOCOMOTION_ANIMATIONS = ['walk', 'run', 'swim', 'fly'] as const;

function clampPositive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function creatureAnimationTags(name: string): string[] {
  const tags = new Set<string>();

  if (name === 'idle') {
    tags.add('idle');
  }

  if (
    CREATURE_LOCOMOTION_ANIMATIONS.includes(name as (typeof CREATURE_LOCOMOTION_ANIMATIONS)[number])
  ) {
    tags.add('locomotion');
    tags.add(name);
  }

  if (name === 'attack') {
    tags.add('action');
    tags.add('combat');
  }

  if (CREATURE_TERMINAL_ANIMATIONS.has(name)) {
    tags.add('terminal');
  }

  return [...tags];
}

function creatureAnimationSpeedScale(name: string, stats: CreatureDefinition['stats']): number {
  if (name === 'run') {
    return 1.4;
  }

  if (name === 'swim' && stats.swimSpeed !== undefined) {
    return clampPositive(stats.swimSpeed / clampPositive(stats.speed, 1), 1);
  }

  if (name === 'fly' && stats.flySpeed !== undefined) {
    return clampPositive(stats.flySpeed / clampPositive(stats.speed, 1), 1);
  }

  return 1;
}

function defaultCreatureAnimationGraphState(
  animation: CreatureRuntimeAnimationBinding,
  stats: CreatureDefinition['stats']
): CreatureRuntimeAnimationGraphState {
  const terminal = CREATURE_TERMINAL_ANIMATIONS.has(animation.name);
  const oneShot = terminal || CREATURE_ONE_SHOT_ANIMATIONS.has(animation.name);

  return {
    id: animation.name,
    animation: animation.name,
    targetBones: [...animation.targetBones],
    loop: !oneShot,
    speedScale: creatureAnimationSpeedScale(animation.name, stats),
    clampWhenFinished: oneShot,
    tags: creatureAnimationTags(animation.name),
  };
}

function transitionId(from: string, event: string, to: string): string {
  return `${from}:${event}:${to}`;
}

function appendCreatureAnimationTransition(
  transitions: CreatureRuntimeAnimationGraphTransition[],
  availableStates: ReadonlySet<string>,
  transition: Omit<CreatureRuntimeAnimationGraphTransition, 'id'> & { id?: string }
): void {
  if (
    transition.from === transition.to ||
    !availableStates.has(transition.from) ||
    !availableStates.has(transition.to)
  ) {
    return;
  }

  const id = transition.id ?? transitionId(transition.from, transition.event, transition.to);

  if (transitions.some((candidate) => candidate.id === id)) {
    return;
  }

  transitions.push({ ...transition, id });
}

function appendCreatureAnimationTransitionFromMany(
  transitions: CreatureRuntimeAnimationGraphTransition[],
  availableStates: ReadonlySet<string>,
  fromStates: readonly string[],
  transition: Omit<CreatureRuntimeAnimationGraphTransition, 'id' | 'from'> & { id?: string }
): void {
  for (const from of fromStates) {
    appendCreatureAnimationTransition(transitions, availableStates, { ...transition, from });
  }
}

/**
 * Creates an adapter-neutral animation graph from runtime creature animation bindings.
 *
 * The graph is deliberately declarative: adapters can map states to Three actions,
 * Babylon animation groups, or custom animation systems without core owning playback.
 */
export function createCreatureAnimationGraph(
  source: Pick<CreatureComposition['runtime'], 'id' | 'animations' | 'stats'>,
  options: CreatureRuntimeAnimationGraphOptions = {}
): CreatureRuntimeAnimationGraph {
  const states = source.animations.map((animation) => {
    const defaults = defaultCreatureAnimationGraphState(animation, source.stats);
    const override = options.stateOverrides?.[animation.name];

    return {
      ...defaults,
      ...override,
      targetBones: override?.targetBones ? [...override.targetBones] : defaults.targetBones,
      tags: override?.tags ? [...override.tags] : defaults.tags,
    };
  });
  const availableStates = new Set(states.map((state) => state.id));
  const defaultDuration = Math.max(0, options.transitionDuration ?? 0.2);
  const initialState =
    options.initialState && availableStates.has(options.initialState)
      ? options.initialState
      : availableStates.has('idle')
        ? 'idle'
        : (states[0]?.id ?? '');
  const transitions: CreatureRuntimeAnimationGraphTransition[] = [];

  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'idle',
    to: 'walk',
    event: 'move',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 10,
    guard: 'canMove',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'walk',
    to: 'idle',
    event: 'stop',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 10,
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'walk',
    to: 'run',
    event: 'sprint',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 20,
    guard: 'canSprint',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'run',
    to: 'walk',
    event: 'walk',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 20,
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'run',
    to: 'idle',
    event: 'stop',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 10,
  });

  const groundStates = ['idle', 'walk', 'run'];
  appendCreatureAnimationTransitionFromMany(transitions, availableStates, groundStates, {
    to: 'swim',
    event: 'enter-water',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 30,
    guard: 'canSwim',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'swim',
    to: 'idle',
    event: 'exit-water',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 30,
  });
  appendCreatureAnimationTransitionFromMany(transitions, availableStates, groundStates, {
    to: 'fly',
    event: 'take-off',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 30,
    guard: 'canFly',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'fly',
    to: 'idle',
    event: 'land',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 30,
  });

  const nonTerminalStates = states
    .map((state) => state.id)
    .filter((state) => !CREATURE_TERMINAL_ANIMATIONS.has(state));
  appendCreatureAnimationTransitionFromMany(transitions, availableStates, nonTerminalStates, {
    to: 'attack',
    event: 'attack',
    mode: 'cross-fade',
    duration: Math.min(defaultDuration, 0.1),
    priority: 50,
    guard: 'canAttack',
  });
  appendCreatureAnimationTransition(transitions, availableStates, {
    from: 'attack',
    to: initialState,
    event: 'complete',
    mode: 'cross-fade',
    duration: defaultDuration,
    priority: 40,
  });
  for (const deathState of ['death', 'die', 'dead']) {
    appendCreatureAnimationTransitionFromMany(transitions, availableStates, nonTerminalStates, {
      to: deathState,
      event: 'die',
      mode: 'play',
      duration: 0,
      priority: 100,
      guard: 'isDead',
    });
  }

  for (const transition of options.transitions ?? []) {
    appendCreatureAnimationTransition(transitions, availableStates, {
      ...transition,
      id: transition.id,
      duration: Math.max(0, transition.duration),
    });
  }

  const locomotionStates = CREATURE_LOCOMOTION_ANIMATIONS.filter((state) =>
    availableStates.has(state)
  );

  return {
    creatureId: source.id,
    initialState,
    states,
    transitions,
    blendGroups:
      options.includeLocomotionBlend === false || locomotionStates.length < 2
        ? []
        : [
            {
              id: 'locomotion',
              states: [...locomotionStates],
              normalized: true,
              tags: ['locomotion'],
            },
          ],
  };
}

/**
 * Creates a deterministic binding plan from Strata logical bones to an asset/source rig.
 *
 * The optional source bone list should come from an imported model or rig. Without it,
 * bindings are still emitted but remain unverified so adapters can surface expected
 * source names before assets are loaded.
 */
export function createCreatureRigBindingPlan(
  runtime: CreatureRuntimeRigBindingSource,
  sourceBoneNames?: readonly string[]
): CreatureRuntimeRigBindingPlan {
  const sourceBones = uniqueStrings(sourceBoneNames);
  const sourceBoneSet = sourceBoneNames ? new Set(sourceBones) : undefined;
  const mappedSourceBones = new Set<string>();
  const bindings = runtime.bones.map((bone) => {
    const sourceBone = runtime.asset?.boneMap[bone.boneId] ?? bone.boneId;
    const explicit = runtime.asset?.boneMap[bone.boneId] !== undefined;

    mappedSourceBones.add(sourceBone);

    return {
      runtimeBoneId: bone.id,
      boneId: bone.boneId,
      sourceBone,
      explicit,
      status: rigBindingStatus(sourceBoneSet, sourceBone),
      animationTargets: [...bone.animationTargets],
    };
  });
  const matched = bindings.filter((binding) => binding.status === 'matched');
  const missing = bindings.filter((binding) => binding.status === 'missing');
  const unverified = bindings.filter((binding) => binding.status === 'unverified');

  return {
    creatureId: runtime.id,
    ...(runtime.asset?.model ? { model: runtime.asset.model } : {}),
    ...(runtime.asset?.rig ? { rig: runtime.asset.rig } : {}),
    sourceBones,
    bindings,
    matched,
    missing,
    unverified,
    unmappedSourceBones: sourceBones.filter((sourceBone) => !mappedSourceBones.has(sourceBone)),
    coverage: {
      total: bindings.length,
      matched: matched.length,
      missing: missing.length,
      unverified: unverified.length,
      matchedRatio: bindings.length > 0 ? matched.length / bindings.length : 1,
    },
  };
}

function distance3(a: RuntimeVector3Tuple, b: RuntimeVector3Tuple): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function dominantBoneLength(bone: CreatureRuntimeBone): number {
  return Math.max(...bone.size);
}

function ikSolverForBoneCount(count: number): CreatureRuntimeIKSolverKind {
  if (count <= 1) {
    return 'single-bone';
  }

  return count === 2 ? 'two-bone' : 'fabrik';
}

function ikChainTotalLength(
  bones: CreatureRuntimeIKChainBonePlan[],
  targetPosition?: RuntimeVector3Tuple
): number {
  if (bones.length === 0) {
    return 0;
  }

  let total = bones.reduce((sum, bone) => sum + bone.length, 0);

  for (let index = 1; index < bones.length; index += 1) {
    total += distance3(
      bones[index - 1]?.position ?? [0, 0, 0],
      bones[index]?.position ?? [0, 0, 0]
    );
  }

  const last = bones.at(-1);
  if (last && targetPosition) {
    total += distance3(last.position, targetPosition);
  }

  return total;
}

/**
 * Creates an adapter-neutral IK rig plan from runtime creature bones and skeleton IK chains.
 *
 * This does not solve IK directly; it gives adapters enough validated chain metadata
 * to choose Three, Babylon, or custom solver implementations consistently.
 */
export function createCreatureIKRigPlan(
  runtime: Pick<CreatureComposition['runtime'], 'id' | 'bones' | 'ikChains'>
): CreatureRuntimeIKRigPlan {
  const bonesById = new Map(runtime.bones.map((bone) => [bone.boneId, bone]));
  const chains = (runtime.ikChains ?? []).map<CreatureRuntimeIKChainPlan>((chain) => {
    const missingBones = chain.bones.filter((boneId) => !bonesById.has(boneId));
    const plannedBones = chain.bones.flatMap<CreatureRuntimeIKChainBonePlan>((boneId) => {
      const bone = bonesById.get(boneId);

      return bone
        ? [
            {
              runtimeBoneId: bone.id,
              boneId: bone.boneId,
              parent: bone.parent,
              position: [...bone.position],
              length: dominantBoneLength(bone),
            },
          ]
        : [];
    });
    const target = bonesById.get(chain.target);
    const status = missingBones.length > 0 ? 'missing-bones' : target ? 'ready' : 'missing-target';

    return {
      id: chain.id,
      bones: plannedBones,
      targetBoneId: chain.target,
      targetRuntimeBoneId: target?.id,
      targetPosition: target ? [...target.position] : undefined,
      solver: ikSolverForBoneCount(plannedBones.length),
      totalLength: ikChainTotalLength(plannedBones, target?.position),
      status,
      missingBones,
    };
  });
  const ready = chains.filter((chain) => chain.status === 'ready');
  const missing = chains.filter((chain) => chain.status !== 'ready');

  return {
    creatureId: runtime.id,
    chains,
    ready,
    missing,
    coverage: {
      total: chains.length,
      ready: ready.length,
      missing: missing.length,
      readyRatio: chains.length > 0 ? ready.length / chains.length : 1,
    },
  };
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

export function createCreature(
  input: string | CreateCreatureInput,
  overrides: Partial<CreateCreatureInput> = {}
): CreatureDefinition {
  if (typeof input === 'string') {
    const preset = CREATURES[input];
    if (!preset) {
      throw new Error(`Unknown creature preset: ${input}`);
    }

    return mergeCreatureDefinition(preset, {
      ...overrides,
      skeleton: overrides.skeleton ?? preset.skeleton,
      covering: overrides.covering ?? preset.covering,
      stats: overrides.stats ?? preset.stats,
      ai: overrides.ai ?? preset.ai,
    });
  }

  return mergeCreatureDefinition(undefined, {
    ...overrides,
    ...input,
    covering: {
      ...(overrides.covering ?? {}),
      ...input.covering,
      regions: {
        ...(overrides.covering?.regions ?? {}),
        ...input.covering.regions,
      },
    },
    stats: {
      ...(overrides.stats ?? {}),
      ...input.stats,
    },
    animations: {
      ...(overrides.animations ?? {}),
      ...(input.animations ?? {}),
    },
  });
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
