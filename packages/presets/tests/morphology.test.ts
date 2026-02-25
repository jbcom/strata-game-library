import { describe, expect, it } from 'vitest';
import {
  createMorphology,
  MORPHOLOGY_DEFAULTS,
  quadrupedToMorphology,
  SPECIES_MORPHOLOGY,
} from '../src/creatures/morphology';
import { createQuadruped, QUADRUPED_DEFAULTS } from '../src/creatures/quadruped';

describe('MORPHOLOGY_DEFAULTS', () => {
  it('has all required subsystems', () => {
    expect(MORPHOLOGY_DEFAULTS).toHaveProperty('eyes');
    expect(MORPHOLOGY_DEFAULTS).toHaveProperty('ears');
    expect(MORPHOLOGY_DEFAULTS).toHaveProperty('snout');
    expect(MORPHOLOGY_DEFAULTS).toHaveProperty('whiskers');
    expect(MORPHOLOGY_DEFAULTS).toHaveProperty('paws');
    expect(MORPHOLOGY_DEFAULTS).toHaveProperty('tail');
    expect(MORPHOLOGY_DEFAULTS).toHaveProperty('coat');
  });

  it('eyes have valid defaults', () => {
    const { eyes } = MORPHOLOGY_DEFAULTS;
    expect(eyes.size).toBe(1);
    expect(eyes.pupilShape).toBe(0);
    expect(typeof eyes.irisColor).toBe('string');
  });

  it('whiskers are present by default', () => {
    expect(MORPHOLOGY_DEFAULTS.whiskers.present).toBe(true);
  });

  it('tail is present by default', () => {
    expect(MORPHOLOGY_DEFAULTS.tail.present).toBe(true);
  });
});

describe('SPECIES_MORPHOLOGY', () => {
  const speciesNames = Object.keys(SPECIES_MORPHOLOGY);

  it('has known species', () => {
    expect(speciesNames).toContain('otter');
    expect(speciesNames).toContain('fox');
    expect(speciesNames).toContain('cat');
    expect(speciesNames).toContain('dog');
    expect(speciesNames).toContain('wolf');
    expect(speciesNames).toContain('bear');
    expect(speciesNames).toContain('horse');
  });

  it.each(speciesNames)('species "%s" has valid partial morphology', (species) => {
    const morph = SPECIES_MORPHOLOGY[species];
    expect(typeof morph).toBe('object');

    // Each key should be a valid morphology subsystem
    for (const key of Object.keys(morph)) {
      expect(['eyes', 'ears', 'snout', 'whiskers', 'paws', 'tail', 'coat']).toContain(key);
    }
  });

  it('otter has webbed paws', () => {
    expect(SPECIES_MORPHOLOGY.otter.paws?.webbing).toBe(0.7);
  });

  it('cat has vertical slit pupils', () => {
    expect(SPECIES_MORPHOLOGY.cat.eyes?.pupilShape).toBe(0.8);
  });

  it('bear has no whiskers', () => {
    expect(SPECIES_MORPHOLOGY.bear.whiskers?.present).toBe(false);
  });

  it('horse has single toe (hoof)', () => {
    expect(SPECIES_MORPHOLOGY.horse.paws?.toeCount).toBe(1);
  });
});

describe('createMorphology', () => {
  it('returns defaults when no species is given', () => {
    const morph = createMorphology();

    expect(morph.eyes.size).toBe(MORPHOLOGY_DEFAULTS.eyes.size);
    expect(morph.ears.size).toBe(MORPHOLOGY_DEFAULTS.ears.size);
    expect(morph.tail.present).toBe(MORPHOLOGY_DEFAULTS.tail.present);
    expect(morph.coat.length).toBe(MORPHOLOGY_DEFAULTS.coat.length);
  });

  it('does not mutate MORPHOLOGY_DEFAULTS', () => {
    const morph = createMorphology();
    morph.eyes.size = 999;

    expect(MORPHOLOGY_DEFAULTS.eyes.size).toBe(1);
  });

  it('applies species overrides', () => {
    const otterMorph = createMorphology('otter');

    // Otter ears are smaller
    expect(otterMorph.ears.size).toBe(0.7);
    // Otter paws have webbing
    expect(otterMorph.paws.webbing).toBe(0.7);
    // Non-overridden defaults are preserved
    expect(otterMorph.eyes.size).toBe(MORPHOLOGY_DEFAULTS.eyes.size);
  });

  it('applies species + custom overrides', () => {
    const morph = createMorphology('cat', {
      eyes: { size: 2.0, pupilShape: 0 },
    });

    // Custom override takes precedence
    expect(morph.eyes.size).toBe(2.0);
    expect(morph.eyes.pupilShape).toBe(0);
    // Species override still applies for non-overridden subsystems
    expect(morph.whiskers.length).toBe(SPECIES_MORPHOLOGY.cat.whiskers?.length);
  });

  it('applies custom overrides without species', () => {
    const morph = createMorphology(undefined, {
      tail: { present: false, length: 0 },
    });

    expect(morph.tail.present).toBe(false);
    expect(morph.tail.length).toBe(0);
    // Other defaults preserved
    expect(morph.eyes.size).toBe(MORPHOLOGY_DEFAULTS.eyes.size);
  });

  it('returns unknown species as defaults', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const morph = createMorphology('unknown_species' as any);

    expect(morph.eyes.size).toBe(MORPHOLOGY_DEFAULTS.eyes.size);
    expect(morph.ears.size).toBe(MORPHOLOGY_DEFAULTS.ears.size);
  });

  it('each species creates a valid morphology', () => {
    for (const species of Object.keys(SPECIES_MORPHOLOGY)) {
      const morph = createMorphology(species as keyof typeof SPECIES_MORPHOLOGY);

      // All subsystems present
      expect(morph).toHaveProperty('eyes');
      expect(morph).toHaveProperty('ears');
      expect(morph).toHaveProperty('snout');
      expect(morph).toHaveProperty('whiskers');
      expect(morph).toHaveProperty('paws');
      expect(morph).toHaveProperty('tail');
      expect(morph).toHaveProperty('coat');
    }
  });
});

describe('quadrupedToMorphology', () => {
  it('converts default quadruped params', () => {
    const params = createQuadruped('otter');
    const morph = quadrupedToMorphology(params);

    expect(morph).toHaveProperty('eyes');
    expect(morph).toHaveProperty('ears');
    expect(morph).toHaveProperty('snout');
    expect(morph).toHaveProperty('whiskers');
    expect(morph).toHaveProperty('paws');
    expect(morph).toHaveProperty('tail');
    expect(morph).toHaveProperty('coat');
  });

  it('maps eye properties correctly', () => {
    const params = createQuadruped('cat');
    const morph = quadrupedToMorphology(params);

    expect(morph.eyes.size).toBe(params.eyeSize);
    expect(morph.eyes.position).toBe(params.eyePosition);
    expect(morph.eyes.pupilShape).toBe(params.pupilShape);
  });

  it('maps ear properties correctly', () => {
    const params = createQuadruped('rabbit');
    const morph = quadrupedToMorphology(params);

    expect(morph.ears.size).toBe(params.earSize);
    expect(morph.ears.tipRoundness).toBe(params.earRoundness);
    expect(morph.ears.flop).toBe(params.earDroop);
    expect(morph.ears.position).toBe(params.earPosition);
  });

  it('maps paw properties correctly', () => {
    const params = createQuadruped('otter');
    const morph = quadrupedToMorphology(params);

    expect(morph.paws.size).toBe(params.pawSize);
    expect(morph.paws.webbing).toBe(params.webbing);
    expect(morph.paws.clawLength).toBe(params.clawLength);
  });

  it('maps tail presence correctly', () => {
    const withTail = createQuadruped('fox');
    const morphWithTail = quadrupedToMorphology(withTail);
    expect(morphWithTail.tail.present).toBe(true);

    const noTail = createQuadruped('bear', { hasTail: false });
    const morphNoTail = quadrupedToMorphology(noTail);
    expect(morphNoTail.tail.present).toBe(false);
  });

  it('maps coat properties correctly', () => {
    const params = createQuadruped('wolf');
    const morph = quadrupedToMorphology(params);

    expect(morph.coat.length).toBe(params.furLength);
    expect(morph.coat.density).toBe(params.furDensity);
    expect(morph.coat.mane).toBe(params.mane);
  });

  it('preserves defaults for unmapped properties', () => {
    const params = createQuadruped('otter');
    const morph = quadrupedToMorphology(params);

    // Properties that aren't mapped from QuadrupedParams should keep defaults
    expect(morph.eyes.spacing).toBe(MORPHOLOGY_DEFAULTS.eyes.spacing);
    expect(morph.ears.angle).toBe(MORPHOLOGY_DEFAULTS.ears.angle);
    expect(morph.paws.toeCount).toBe(MORPHOLOGY_DEFAULTS.paws.toeCount);
  });
});
