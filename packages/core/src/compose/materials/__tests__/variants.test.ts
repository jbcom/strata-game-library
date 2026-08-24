import { describe, expect, it } from 'vitest';
import { MATERIALS } from '../presets';
import { createMaterialTrait } from '../traits';
import type { MaterialDefinition } from '../types';
import { createMaterialVariant, createMaterialVariants } from '../variants';

/** Deterministic RNG cycling through fixed values, for reproducible jitter. */
const sequenceRng = (values: number[]) => {
  let index = 0;
  return () => values[index++ % values.length];
};

describe('createMaterialVariant', () => {
  it('derives a suffixed id by default', () => {
    expect(createMaterialVariant('metal_iron').id).toBe('metal_iron_variant');
  });

  it('honours an explicit suffix and an explicit id', () => {
    expect(createMaterialVariant('metal_iron', { suffix: 'rusted' }).id).toBe('metal_iron_rusted');
    expect(createMaterialVariant('metal_iron', { id: 'custom' }).id).toBe('custom');
  });

  it('leaves the source registry entry untouched', () => {
    const before = MATERIALS.metal_iron.roughness;
    createMaterialVariant('metal_iron', { roughnessDelta: 0.5 });

    expect(MATERIALS.metal_iron.roughness).toBe(before);
  });

  it('applies roughness and metalness deltas additively', () => {
    const base = MATERIALS.metal_iron;
    const variant = createMaterialVariant('metal_iron', {
      roughnessDelta: 0.1,
      metalnessDelta: -0.1,
    });

    expect(variant.roughness).toBeCloseTo(base.roughness + 0.1, 10);
    expect(variant.metalness).toBeCloseTo(base.metalness - 0.1, 10);
  });

  it('clamps roughness and metalness into the unit range', () => {
    const high = createMaterialVariant('metal_iron', {
      roughnessDelta: 10,
      metalnessDelta: 10,
    });
    const low = createMaterialVariant('metal_iron', {
      roughnessDelta: -10,
      metalnessDelta: -10,
    });

    expect(high.roughness).toBe(1);
    expect(high.metalness).toBe(1);
    expect(low.roughness).toBe(0);
    expect(low.metalness).toBe(0);
  });

  it('leaves roughness untouched when no delta is supplied', () => {
    expect(createMaterialVariant('metal_iron').roughness).toBe(MATERIALS.metal_iron.roughness);
  });

  it('floors normal scale at zero rather than going negative', () => {
    expect(createMaterialVariant('metal_iron', { normalScaleDelta: -100 }).normalScale).toBe(0);
  });

  it('treats a missing normal scale as 1 when applying a delta', () => {
    const source = { ...MATERIALS.metal_iron, normalScale: undefined } as MaterialDefinition;

    expect(createMaterialVariant(source, { normalScaleDelta: 0.5 }).normalScale).toBeCloseTo(
      1.5,
      10
    );
  });

  it('substitutes the base colour when one is supplied', () => {
    expect(createMaterialVariant('metal_iron', { baseColor: '#00ff00' }).baseColor).toBe('#00ff00');
  });

  it('keeps the source colour when no override is given', () => {
    expect(createMaterialVariant('metal_gold').baseColor).toBe(MATERIALS.metal_gold.baseColor);
  });

  it('merges shell overrides field by field instead of replacing them', () => {
    const variant = createMaterialVariant('fur_otter', { shell: { length: 0.5 } });

    expect(variant.shell?.length).toBe(0.5);
    expect(variant.shell?.density).toBe(MATERIALS.fur_otter.shell?.density);
  });

  it('ignores shell overrides on a material with no shell', () => {
    expect(createMaterialVariant('metal_iron', { shell: { length: 1 } }).shell).toBeUndefined();
  });

  it('merges volumetric and organic overrides for the matching material types', () => {
    const crystal = createMaterialVariant('crystal_quartz', {
      volumetric: { transparency: 0.1 },
    });
    const flesh = createMaterialVariant('flesh_mammal', {
      organic: { scatterDistance: 0.5 },
    });

    expect(crystal.volumetric?.transparency).toBe(0.1);
    expect(crystal.volumetric?.refraction).toBe(MATERIALS.crystal_quartz.volumetric?.refraction);
    expect(flesh.organic?.scatterDistance).toBe(0.5);
    expect(flesh.organic?.scatterColor).toBe(MATERIALS.flesh_mammal.organic?.scatterColor);
  });

  it('fills physics defaults when overrides are supplied to a material without physics', () => {
    const variant = createMaterialVariant('metal_iron', { physics: { friction: 0.9 } });

    expect(variant.physics?.friction).toBe(0.9);
    expect(variant.physics?.density).toBeDefined();
  });

  it('replaces traits wholesale when traits are supplied', () => {
    const source = {
      ...MATERIALS.metal_iron,
      traits: [createMaterialTrait('patina', { id: 'old' })],
    } as MaterialDefinition;
    const variant = createMaterialVariant(source, {
      traits: [createMaterialTrait('wear', { id: 'new' })],
    });

    expect(variant.traits?.map((trait) => trait.id)).toEqual(['new']);
  });

  it('appends traits onto the existing set when appendTraits is used', () => {
    const source = {
      ...MATERIALS.metal_iron,
      traits: [createMaterialTrait('patina', { id: 'old' })],
    } as MaterialDefinition;
    const variant = createMaterialVariant(source, {
      appendTraits: [createMaterialTrait('wear', { id: 'extra' })],
    });

    expect(variant.traits?.map((trait) => trait.id)).toEqual(['old', 'extra']);
  });

  it('deep-copies traits so the variant cannot mutate the source', () => {
    const trait = createMaterialTrait('patina', { id: 'shared' });
    const source = { ...MATERIALS.metal_iron, traits: [trait] } as MaterialDefinition;
    const variant = createMaterialVariant(source);

    variant.traits?.[0].channels.push('emissive');

    expect(trait.channels).not.toContain('emissive');
  });

  it('leaves traits undefined for a material that has none', () => {
    expect(createMaterialVariant('metal_iron').traits).toBeUndefined();
  });

  it('is deterministic for identical inputs', () => {
    const options = { roughnessDelta: 0.05, suffix: 'x' };

    expect(createMaterialVariant('metal_iron', options)).toEqual(
      createMaterialVariant('metal_iron', options)
    );
  });

  it('throws for an unknown material id', () => {
    expect(() => createMaterialVariant('nope')).toThrow('Unknown material: nope');
  });
});

describe('createMaterialVariants', () => {
  it('produces exactly the requested count', () => {
    expect(createMaterialVariants('metal_iron', { count: 3 })).toHaveLength(3);
  });

  it('produces a single variant for a count of one', () => {
    expect(createMaterialVariants('metal_iron', { count: 1 })).toHaveLength(1);
  });

  it('numbers variant ids from one', () => {
    const ids = createMaterialVariants('metal_iron', { count: 3 }).map((variant) => variant.id);

    expect(ids).toEqual(['metal_iron_1', 'metal_iron_2', 'metal_iron_3']);
  });

  it('honours an id prefix override', () => {
    const ids = createMaterialVariants('metal_iron', { count: 2, idPrefix: 'crate' }).map(
      (variant) => variant.id
    );

    expect(ids).toEqual(['crate_1', 'crate_2']);
  });

  it('rejects a count below one', () => {
    expect(() => createMaterialVariants('metal_iron', { count: 0 })).toThrow(
      'Material variant count must be a positive integer'
    );
    expect(() => createMaterialVariants('metal_iron', { count: -3 })).toThrow(
      'Material variant count must be a positive integer'
    );
  });

  it('rejects a fractional or non-finite count', () => {
    expect(() => createMaterialVariants('metal_iron', { count: 2.5 })).toThrow(
      'Material variant count must be a positive integer'
    );
    expect(() => createMaterialVariants('metal_iron', { count: Number.NaN })).toThrow(
      'Material variant count must be a positive integer'
    );
    expect(() => createMaterialVariants('metal_iron', { count: Number.POSITIVE_INFINITY })).toThrow(
      'Material variant count must be a positive integer'
    );
  });

  it('cycles the supplied colours when there are more variants than colours', () => {
    const colors = createMaterialVariants('metal_iron', {
      count: 5,
      colors: ['#ff0000', '#00ff00'],
    }).map((variant) => variant.baseColor);

    expect(colors).toEqual(['#ff0000', '#00ff00', '#ff0000', '#00ff00', '#ff0000']);
  });

  it('keeps the base colour when the colour list is empty', () => {
    const variants = createMaterialVariants('metal_gold', { count: 2, colors: [] });

    for (const variant of variants) {
      expect(variant.baseColor).toBe(MATERIALS.metal_gold.baseColor);
    }
  });

  it('produces identical output for the same injected rng', () => {
    const options = { count: 4, roughnessJitter: 0.2, metalnessJitter: 0.2 };
    const first = createMaterialVariants('metal_iron', {
      ...options,
      rng: sequenceRng([0.1, 0.9, 0.5, 0.25]),
    });
    const second = createMaterialVariants('metal_iron', {
      ...options,
      rng: sequenceRng([0.1, 0.9, 0.5, 0.25]),
    });

    expect(first).toEqual(second);
  });

  it('maps an rng value of 0.5 to zero jitter', () => {
    const [variant] = createMaterialVariants('metal_iron', {
      count: 1,
      roughnessJitter: 0.5,
      rng: () => 0.5,
    });

    expect(variant.roughness).toBeCloseTo(MATERIALS.metal_iron.roughness, 10);
  });

  it('maps rng extremes to the full negative and positive jitter range', () => {
    const base = MATERIALS.wood_oak.roughness;
    const [low] = createMaterialVariants('wood_oak', {
      count: 1,
      roughnessJitter: 0.2,
      rng: () => 0,
    });
    const [high] = createMaterialVariants('wood_oak', {
      count: 1,
      roughnessJitter: 0.2,
      rng: () => 1,
    });

    expect(low.roughness).toBeCloseTo(base - 0.2, 10);
    expect(high.roughness).toBeCloseTo(base + 0.2, 10);
  });

  it('does not consume the rng for a zero jitter amount', () => {
    let calls = 0;
    createMaterialVariants('metal_iron', {
      count: 3,
      roughnessJitter: 0,
      rng: () => {
        calls += 1;
        return 0.5;
      },
    });

    expect(calls).toBe(0);
  });

  it('applies no jitter at all when no jitter amounts are given', () => {
    const variants = createMaterialVariants('metal_iron', { count: 3, rng: () => 0 });

    for (const variant of variants) {
      expect(variant.roughness).toBe(MATERIALS.metal_iron.roughness);
      expect(variant.metalness).toBe(MATERIALS.metal_iron.metalness);
    }
  });

  it('keeps jittered values inside the unit range even for extreme jitter', () => {
    const variants = createMaterialVariants('metal_iron', {
      count: 6,
      roughnessJitter: 10,
      metalnessJitter: 10,
      rng: sequenceRng([0, 1, 0.5, 0.2, 0.8, 0.05]),
    });

    for (const variant of variants) {
      expect(variant.roughness).toBeGreaterThanOrEqual(0);
      expect(variant.roughness).toBeLessThanOrEqual(1);
      expect(variant.metalness).toBeGreaterThanOrEqual(0);
      expect(variant.metalness).toBeLessThanOrEqual(1);
    }
  });

  it('never emits a negative normal scale under jitter', () => {
    const variants = createMaterialVariants('metal_iron', {
      count: 4,
      normalScaleJitter: 100,
      rng: sequenceRng([0, 0.1, 0.9, 1]),
    });

    for (const variant of variants) {
      expect(variant.normalScale).toBeGreaterThanOrEqual(0);
    }
  });

  it('applies the same physics overrides to every variant', () => {
    const variants = createMaterialVariants('metal_iron', {
      count: 2,
      physics: { friction: 0.42 },
    });

    for (const variant of variants) {
      expect(variant.physics?.friction).toBe(0.42);
    }
  });

  it('gives each variant its own trait array instances', () => {
    const variants = createMaterialVariants('metal_iron', {
      count: 2,
      traits: [createMaterialTrait('wear', { id: 'w' })],
    });

    variants[0].traits?.[0].channels.push('emissive');

    expect(variants[1].traits?.[0].channels).not.toContain('emissive');
  });

  it('throws for an unknown material id', () => {
    expect(() => createMaterialVariants('nope', { count: 1 })).toThrow('Unknown material: nope');
  });
});
