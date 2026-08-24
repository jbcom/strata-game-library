/**
 * Material trait construction and inference.
 *
 * A trait is a named surface characteristic (grain, fiber, scratches, veins,
 * mottle...) with an intensity, scale, seed, and the PBR channels it affects.
 * This module builds traits explicitly and infers a plausible set from the
 * properties of an existing material definition.
 *
 * @module MaterialTraits
 * @category Entities & Simulation
 */

import { clamp01 } from './math';
import { cloneMaterialTrait, resolveMaterialDefinition } from './presets';
import type {
  MaterialDefinition,
  MaterialTrait,
  MaterialTraitChannel,
  MaterialTraitInferenceOptions,
  MaterialTraitOptions,
  MaterialTraitType,
} from './types';

/** The PBR channels a trait type affects when the caller does not name them. */
export function defaultTraitChannels(type: MaterialTraitType): MaterialTraitChannel[] {
  switch (type) {
    case 'grain':
      return ['baseColor', 'roughness', 'normal'];
    case 'fiber':
      return ['baseColor', 'normal', 'opacity'];
    case 'scratches':
      return ['roughness', 'normal', 'metalness'];
    case 'wear':
      return ['baseColor', 'roughness', 'normal'];
    case 'patina':
      return ['baseColor', 'roughness', 'metalness'];
    case 'veins':
      return ['baseColor', 'normal', 'opacity'];
    case 'mottle':
      return ['baseColor', 'roughness'];
    case 'absorption':
      return ['baseColor', 'opacity'];
  }
}

/** Builds a colon-joined trait identifier, skipping an absent suffix. */
export function materialTraitId(prefix: string, type: MaterialTraitType, suffix?: string): string {
  return [prefix, type, suffix].filter(Boolean).join(':');
}

/** Relative feature size multiplier for a wood grain species. */
export function grainScale(grain: MaterialDefinition['grain']): number {
  switch (grain) {
    case 'pine':
      return 1.35;
    case 'birch':
      return 1.1;
    case 'mahogany':
      return 0.75;
    default:
      return 0.9;
  }
}

export function createMaterialTrait(
  type: MaterialTraitType,
  options: MaterialTraitOptions = {}
): MaterialTrait {
  return {
    id: options.id ?? type,
    type,
    intensity: clamp01(options.intensity ?? 0.5),
    scale: Math.max(0.0001, options.scale ?? 1),
    seed: options.seed ?? 0,
    channels: options.channels ? [...options.channels] : defaultTraitChannels(type),
    color: options.color,
    secondaryColor: options.secondaryColor,
    tags: options.tags ? [...options.tags] : undefined,
  };
}

export function inferMaterialTraits(
  material: string | MaterialDefinition,
  options: MaterialTraitInferenceOptions = {}
): MaterialTrait[] {
  const resolved = resolveMaterialDefinition(material);
  const idPrefix = options.idPrefix ?? resolved.id;
  const intensity = options.intensity ?? 0.6;
  const scale = options.scale ?? 1;
  const seed = options.seed ?? 0;
  const traits = options.includeExisting ? (resolved.traits ?? []).map(cloneMaterialTrait) : [];

  if (resolved.grain) {
    traits.push(
      createMaterialTrait('grain', {
        id: materialTraitId(idPrefix, 'grain', resolved.grain),
        intensity,
        scale: scale * grainScale(resolved.grain),
        seed,
        color: resolved.baseColor,
        tags: ['wood', resolved.grain],
      })
    );
  }

  if (resolved.shell) {
    traits.push(
      createMaterialTrait('fiber', {
        id: materialTraitId(idPrefix, 'fiber'),
        intensity: clamp01(intensity + resolved.shell.colorVariation * 0.25),
        scale: scale * Math.max(0.25, resolved.shell.length * 20),
        seed: seed + 11,
        color: resolved.baseColor,
        tags: ['shell', 'fur'],
      })
    );
  }

  if (resolved.metalness > 0.5) {
    traits.push(
      createMaterialTrait('scratches', {
        id: materialTraitId(idPrefix, 'scratches'),
        intensity: clamp01(intensity * (1 - resolved.roughness * 0.5)),
        scale: scale * 0.75,
        seed: seed + 23,
        tags: ['metal'],
      })
    );
  }

  if (resolved.type === 'volumetric') {
    traits.push(
      createMaterialTrait('veins', {
        id: materialTraitId(idPrefix, 'veins'),
        intensity: clamp01(intensity * (resolved.volumetric?.transparency ?? 0.8)),
        scale: scale * 1.2,
        seed: seed + 37,
        color: resolved.baseColor,
        secondaryColor: resolved.volumetric?.absorption,
        tags: ['volumetric'],
      })
    );
  }

  if (resolved.type === 'organic') {
    traits.push(
      createMaterialTrait('mottle', {
        id: materialTraitId(idPrefix, 'mottle'),
        intensity,
        scale: scale * 1.5,
        seed: seed + 41,
        color: resolved.baseColor,
        secondaryColor: resolved.organic?.scatterColor,
        tags: ['organic'],
      })
    );
  }

  return traits;
}
