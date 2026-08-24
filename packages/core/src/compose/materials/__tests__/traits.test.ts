import { describe, expect, it } from 'vitest';
import { MATERIALS } from '../presets';
import {
  createMaterialTrait,
  defaultTraitChannels,
  grainScale,
  inferMaterialTraits,
  materialTraitId,
} from '../traits';
import type { MaterialDefinition, MaterialTraitType } from '../types';

const ALL_TRAIT_TYPES: MaterialTraitType[] = [
  'grain',
  'fiber',
  'scratches',
  'wear',
  'patina',
  'veins',
  'mottle',
  'absorption',
];

describe('defaultTraitChannels', () => {
  it('returns a non-empty channel set for every trait type', () => {
    for (const type of ALL_TRAIT_TYPES) {
      expect(defaultTraitChannels(type).length).toBeGreaterThan(0);
    }
  });

  it('never repeats a channel within one trait type', () => {
    for (const type of ALL_TRAIT_TYPES) {
      const channels = defaultTraitChannels(type);
      expect(new Set(channels).size).toBe(channels.length);
    }
  });

  it('routes metal-flavoured traits to the metalness channel', () => {
    expect(defaultTraitChannels('scratches')).toContain('metalness');
    expect(defaultTraitChannels('patina')).toContain('metalness');
  });

  it('routes translucency traits to the opacity channel', () => {
    expect(defaultTraitChannels('veins')).toContain('opacity');
    expect(defaultTraitChannels('absorption')).toContain('opacity');
  });

  it('returns a fresh array each call so callers cannot corrupt the table', () => {
    const first = defaultTraitChannels('grain');
    first.push('emissive');

    expect(defaultTraitChannels('grain')).not.toContain('emissive');
  });
});

describe('materialTraitId', () => {
  it('joins prefix and type with a colon when no suffix is given', () => {
    expect(materialTraitId('wood_oak', 'grain')).toBe('wood_oak:grain');
  });

  it('appends the suffix as a third segment when present', () => {
    expect(materialTraitId('wood_oak', 'grain', 'oak')).toBe('wood_oak:grain:oak');
  });

  it('drops an empty-string suffix rather than leaving a trailing colon', () => {
    expect(materialTraitId('m', 'wear', '')).toBe('m:wear');
  });

  it('drops an empty prefix rather than leaving a leading colon', () => {
    expect(materialTraitId('', 'wear')).toBe('wear');
  });
});

describe('grainScale', () => {
  it('gives pine the coarsest scale and mahogany the finest', () => {
    expect(grainScale('pine')).toBeGreaterThan(grainScale('birch'));
    expect(grainScale('birch')).toBeGreaterThan(grainScale('oak'));
    expect(grainScale('oak')).toBeGreaterThan(grainScale('mahogany'));
  });

  it('falls back to the default scale for unknown or absent grains', () => {
    expect(grainScale(undefined)).toBe(0.9);
    expect(grainScale('teak' as MaterialDefinition['grain'])).toBe(0.9);
  });

  it('never returns a non-positive scale', () => {
    for (const grain of ['pine', 'birch', 'oak', 'mahogany', undefined]) {
      expect(grainScale(grain as MaterialDefinition['grain'])).toBeGreaterThan(0);
    }
  });
});

describe('createMaterialTrait', () => {
  it('defaults id to the trait type and intensity to the midpoint', () => {
    const trait = createMaterialTrait('wear');

    expect(trait.id).toBe('wear');
    expect(trait.type).toBe('wear');
    expect(trait.intensity).toBe(0.5);
    expect(trait.scale).toBe(1);
    expect(trait.seed).toBe(0);
  });

  it('clamps intensity into the unit range at both bounds', () => {
    expect(createMaterialTrait('wear', { intensity: 5 }).intensity).toBe(1);
    expect(createMaterialTrait('wear', { intensity: -5 }).intensity).toBe(0);
    expect(createMaterialTrait('wear', { intensity: 0 }).intensity).toBe(0);
  });

  it('floors scale at a small positive epsilon so it is never zero or negative', () => {
    expect(createMaterialTrait('wear', { scale: 0 }).scale).toBe(0.0001);
    expect(createMaterialTrait('wear', { scale: -10 }).scale).toBe(0.0001);
    expect(createMaterialTrait('wear', { scale: 0.00001 }).scale).toBe(0.0001);
  });

  it('keeps a legitimate large scale untouched', () => {
    expect(createMaterialTrait('wear', { scale: 256 }).scale).toBe(256);
  });

  it('accepts negative and fractional seeds verbatim', () => {
    expect(createMaterialTrait('wear', { seed: -17.5 }).seed).toBe(-17.5);
  });

  it('uses explicit channels over the defaults for the type', () => {
    const trait = createMaterialTrait('grain', { channels: ['emissive'] });

    expect(trait.channels).toEqual(['emissive']);
  });

  it('copies the supplied channels and tags rather than aliasing them', () => {
    const channels = ['roughness' as const];
    const tags = ['x'];
    const trait = createMaterialTrait('grain', { channels, tags });

    channels.push('normal' as never);
    tags.push('y');

    expect(trait.channels).toEqual(['roughness']);
    expect(trait.tags).toEqual(['x']);
  });

  it('leaves tags undefined when none are given', () => {
    expect(createMaterialTrait('grain').tags).toBeUndefined();
  });
});

describe('inferMaterialTraits', () => {
  it('infers a grain trait for wood presets, scaled by species', () => {
    const oak = inferMaterialTraits('wood_oak');
    const pine = inferMaterialTraits('wood_pine');
    const oakGrain = oak.find((trait) => trait.type === 'grain');
    const pineGrain = pine.find((trait) => trait.type === 'grain');

    expect(oakGrain).toBeDefined();
    expect(pineGrain).toBeDefined();
    expect(pineGrain?.scale).toBeGreaterThan(oakGrain?.scale ?? 0);
  });

  it('tags the wood grain trait with the species', () => {
    const grain = inferMaterialTraits('wood_oak').find((trait) => trait.type === 'grain');

    expect(grain?.tags).toEqual(['wood', 'oak']);
    expect(grain?.id).toBe('wood_oak:grain:oak');
  });

  it('infers a fiber trait for shell-bearing fur materials', () => {
    const traits = inferMaterialTraits('fur_otter');

    expect(traits.some((trait) => trait.type === 'fiber')).toBe(true);
  });

  it('infers a veins trait for volumetric materials', () => {
    const traits = inferMaterialTraits('crystal_quartz');

    expect(traits.some((trait) => trait.type === 'veins')).toBe(true);
  });

  it('infers a mottle trait for organic materials', () => {
    const traits = inferMaterialTraits('flesh_mammal');

    expect(traits.some((trait) => trait.type === 'mottle')).toBe(true);
  });

  it('infers scratches only when metalness exceeds the halfway threshold', () => {
    const justUnder = inferMaterialTraits({
      ...MATERIALS.metal_iron,
      metalness: 0.5,
    } as MaterialDefinition);
    const justOver = inferMaterialTraits({
      ...MATERIALS.metal_iron,
      metalness: 0.51,
    } as MaterialDefinition);

    expect(justUnder.some((trait) => trait.type === 'scratches')).toBe(false);
    expect(justOver.some((trait) => trait.type === 'scratches')).toBe(true);
  });

  it('returns an empty list for a featureless material', () => {
    const plain: MaterialDefinition = {
      id: 'plain',
      type: 'solid',
      baseColor: '#808080',
      roughness: 0.5,
      metalness: 0,
    };

    expect(inferMaterialTraits(plain)).toEqual([]);
  });

  it('is deterministic for the same input', () => {
    expect(inferMaterialTraits('wood_oak')).toEqual(inferMaterialTraits('wood_oak'));
  });

  it('offsets each inferred trait type by a distinct seed delta', () => {
    const fiber = inferMaterialTraits('fur_otter', { seed: 100 }).find(
      (trait) => trait.type === 'fiber'
    );
    const veins = inferMaterialTraits('crystal_quartz', { seed: 100 }).find(
      (trait) => trait.type === 'veins'
    );

    expect(fiber?.seed).toBe(111);
    expect(veins?.seed).toBe(137);
  });

  it('honours an id prefix override for generated trait ids', () => {
    const traits = inferMaterialTraits('wood_oak', { idPrefix: 'custom' });

    expect(traits[0]?.id.startsWith('custom:')).toBe(true);
  });

  it('excludes pre-existing traits unless includeExisting is set', () => {
    const source = {
      ...MATERIALS.wood_oak,
      traits: [createMaterialTrait('patina', { id: 'pre' })],
    } as MaterialDefinition;

    expect(inferMaterialTraits(source).some((trait) => trait.id === 'pre')).toBe(false);
    expect(
      inferMaterialTraits(source, { includeExisting: true }).some((trait) => trait.id === 'pre')
    ).toBe(true);
  });

  it('places pre-existing traits before the inferred ones when included', () => {
    const source = {
      ...MATERIALS.wood_oak,
      traits: [createMaterialTrait('patina', { id: 'pre' })],
    } as MaterialDefinition;
    const traits = inferMaterialTraits(source, { includeExisting: true });

    expect(traits[0]?.id).toBe('pre');
  });

  it('clamps a runaway intensity option into the unit range', () => {
    const traits = inferMaterialTraits('crystal_quartz', { intensity: 100 });

    for (const trait of traits) {
      expect(trait.intensity).toBeLessThanOrEqual(1);
      expect(trait.intensity).toBeGreaterThanOrEqual(0);
    }
  });

  it('scales every inferred trait proportionally with the scale option', () => {
    const single = inferMaterialTraits('wood_oak', { scale: 1 });
    const doubled = inferMaterialTraits('wood_oak', { scale: 2 });

    for (let i = 0; i < single.length; i += 1) {
      expect(doubled[i].scale).toBeCloseTo(single[i].scale * 2, 10);
    }
  });

  it('throws for an unknown material id', () => {
    expect(() => inferMaterialTraits('nope')).toThrow('Unknown material: nope');
  });
});
