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
import { cloneMaterialDefinition, resolveMaterialDefinition } from '../materials';
import { resolveSkeletonDefinition } from '../skeletons';
import type {
  CreateCreatureInput,
  CreatureComposition,
  CreatureDefinition,
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
    materialsByBone[bone.id] = {
      ...region,
      boneId: bone.id,
      pattern,
      materialId: region.material,
      material: cloneMaterialDefinition(material, region.color ? { baseColor: region.color } : {}),
    };
  }

  const baseScale = definition.scale ?? 1;
  const scaleVariation = definition.scaleVariation ?? 0;
  const variation = scaleVariation > 0 ? (rng() * 2 - 1) * scaleVariation : 0;

  return {
    definition,
    skeleton,
    scale: Math.max(0.01, baseScale * (1 + variation)),
    materialsByBone,
  };
}
