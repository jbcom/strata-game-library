/**
 * Deterministic material variant generation.
 *
 * Derives new material definitions from a base by applying bounded deltas to
 * roughness, metalness, and normal scale, merging physics, and substituting
 * colours — plus a batch form that jitters those deltas through an injectable
 * RNG so prop variation stays reproducible.
 *
 * @module MaterialVariants
 * @category Entities & Simulation
 */

import { clamp01 } from './math';
import {
  cloneColorValue,
  cloneMaterialDefinition,
  cloneMaterialTrait,
  mergeMaterialPhysics,
  resolveMaterialDefinition,
} from './presets';
import type {
  MaterialDefinition,
  MaterialVariantOptions,
  MaterialVariantSetOptions,
} from './types';

/**
 * Creates a resolved material variant with deterministic visual and physics deltas.
 */
export function createMaterialVariant(
  material: string | MaterialDefinition,
  options: MaterialVariantOptions = {}
): MaterialDefinition {
  const resolved = resolveMaterialDefinition(material);
  const shell =
    resolved.shell && options.shell ? { ...resolved.shell, ...options.shell } : resolved.shell;
  const volumetric =
    resolved.volumetric && options.volumetric
      ? { ...resolved.volumetric, ...options.volumetric }
      : resolved.volumetric;
  const organic =
    resolved.organic && options.organic
      ? { ...resolved.organic, ...options.organic }
      : resolved.organic;
  const traits = options.traits
    ? options.traits.map(cloneMaterialTrait)
    : resolved.traits || options.appendTraits
      ? [
          ...(resolved.traits ?? []).map(cloneMaterialTrait),
          ...(options.appendTraits ?? []).map(cloneMaterialTrait),
        ]
      : undefined;

  return cloneMaterialDefinition(resolved, {
    id: options.id ?? `${resolved.id}_${options.suffix ?? 'variant'}`,
    baseColor:
      options.baseColor === undefined
        ? cloneColorValue(resolved.baseColor)
        : cloneColorValue(options.baseColor),
    roughness:
      options.roughnessDelta === undefined
        ? resolved.roughness
        : clamp01(resolved.roughness + options.roughnessDelta),
    metalness:
      options.metalnessDelta === undefined
        ? resolved.metalness
        : clamp01(resolved.metalness + options.metalnessDelta),
    normalScale:
      options.normalScaleDelta === undefined
        ? resolved.normalScale
        : Math.max(0, (resolved.normalScale ?? 1) + options.normalScaleDelta),
    shell,
    volumetric,
    organic,
    physics: mergeMaterialPhysics(resolved.physics, options.physics),
    traits,
  });
}

/**
 * Creates a deterministic set of material variants for runtime swapping and prop variation.
 */
export function createMaterialVariants(
  material: string | MaterialDefinition,
  options: MaterialVariantSetOptions
): MaterialDefinition[] {
  if (!Number.isInteger(options.count) || options.count < 1) {
    throw new Error('Material variant count must be a positive integer');
  }

  const rng = options.rng ?? Math.random;
  const resolved = resolveMaterialDefinition(material);
  const idPrefix = options.idPrefix ?? resolved.id;
  const jitter = (amount = 0) => (amount === 0 ? 0 : (rng() * 2 - 1) * amount);

  return Array.from({ length: options.count }, (_, index) =>
    createMaterialVariant(resolved, {
      id: `${idPrefix}_${index + 1}`,
      baseColor:
        options.colors && options.colors.length > 0
          ? cloneColorValue(options.colors[index % options.colors.length])
          : undefined,
      roughnessDelta: jitter(options.roughnessJitter),
      metalnessDelta: jitter(options.metalnessJitter),
      normalScaleDelta: jitter(options.normalScaleJitter),
      physics: options.physics,
      traits: options.traits,
    })
  );
}
