/**
 * Creature definition merging: cloning presets, layering user input over a
 * base definition, and the `createCreature` entry point.
 *
 * Every array and nested object is copied on the way through so a returned
 * definition never aliases the shared preset registry.
 *
 * @module CreatureDefinitions
 * @category Entities & Simulation
 */

import { CREATURES } from './presets';
import type { CreateCreatureInput, CreatureDefinition } from './types';

export function titleCaseFromId(id: string): string {
  return id
    .split(/[_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Deep-copies a definition so callers never mutate the shared preset registry. */
export function cloneCreatureDefinition(definition: CreatureDefinition): CreatureDefinition {
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

export function mergeCreatureDefinition(
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
