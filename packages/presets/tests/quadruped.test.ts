import { describe, expect, it } from 'vitest';
import {
  createCustomQuadruped,
  createQuadruped,
  type FormName,
  QUADRUPED_DEFAULTS,
  QUADRUPED_FORMS,
} from '../src/creatures/quadruped';

describe('createQuadruped', () => {
  describe('defaults', () => {
    it('returns all required fields', () => {
      const result = createQuadruped('otter');

      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('bodyLength');
      expect(result).toHaveProperty('earSize');
      expect(result).toHaveProperty('tailLength');
      expect(result).toHaveProperty('furLength');
      expect(result).toHaveProperty('age');
      expect(result).toHaveProperty('build');
    });

    it('uses QUADRUPED_DEFAULTS as base', () => {
      const result = createCustomQuadruped({});

      expect(result.size).toBe(QUADRUPED_DEFAULTS.size);
      expect(result.bodyLength).toBe(QUADRUPED_DEFAULTS.bodyLength);
      expect(result.age).toBe(QUADRUPED_DEFAULTS.age);
    });
  });

  describe('forms', () => {
    const formNames = Object.keys(QUADRUPED_FORMS) as FormName[];

    it.each(formNames)('form "%s" produces valid output', (form) => {
      const result = createQuadruped(form);

      // All required properties present
      expect(typeof result.size).toBe('number');
      expect(typeof result.earSize).toBe('number');
      expect(typeof result.tailLength).toBe('number');

      // Values are reasonable
      expect(result.size).toBeGreaterThan(0);
      expect(result.size).toBeLessThan(10);
    });

    it('otter form has characteristic traits', () => {
      const otter = createQuadruped('otter');

      // Otters have short legs
      expect(otter.legLength).toBeLessThan(1);
      // Otters have webbed feet
      expect(otter.webbing).toBeGreaterThan(0.5);
      // Otters have elongated body
      expect(otter.bodyLength).toBeGreaterThan(1);
    });

    it('horse form has characteristic traits', () => {
      const horse = createQuadruped('horse');

      // Horses are large
      expect(horse.size).toBeGreaterThan(1.5);
      // Horses have long legs
      expect(horse.legLength).toBeGreaterThan(1);
      // Horses have mane
      expect(horse.mane).toBe(1.0);
      // Horses have long snout
      expect(horse.snoutLength).toBeGreaterThan(1.3);
    });

    it('bear form has characteristic traits', () => {
      const bear = createQuadruped('bear');

      // Bears are large
      expect(bear.size).toBeGreaterThan(1.3);
      // Bears have small ears
      expect(bear.earSize).toBeLessThan(1);
      // Bears have short tail
      expect(bear.tailLength).toBeLessThan(0.5);
    });
  });

  describe('customization', () => {
    it('allows size override', () => {
      const result = createQuadruped('otter', { size: 5 });
      expect(result.size).toBe(5);
    });

    it('allows multiple overrides', () => {
      const result = createQuadruped('dog', {
        earSize: 2.5,
        tailLength: 0.5,
        furLength: 2.0,
      });

      expect(result.earSize).toBe(2.5);
      expect(result.tailLength).toBe(0.5);
      expect(result.furLength).toBe(2.0);
    });

    it('preserves form values not overridden', () => {
      const wolfWithCustomEars = createQuadruped('wolf', { earSize: 0.5 });
      const pureWolf = createQuadruped('wolf');

      // Overridden value
      expect(wolfWithCustomEars.earSize).toBe(0.5);
      // Preserved form value
      expect(wolfWithCustomEars.snoutLength).toBe(pureWolf.snoutLength);
    });
  });

  describe('age modifiers', () => {
    it('baby has smaller size', () => {
      const adult = createQuadruped('otter', { age: 'adult' });
      const baby = createQuadruped('otter', { age: 'baby' });

      expect(baby.size).toBeLessThan(adult.size);
    });

    it('baby has larger relative head', () => {
      const adult = createQuadruped('otter', { age: 'adult' });
      const baby = createQuadruped('otter', { age: 'baby' });

      expect(baby.headSize).toBeGreaterThan(adult.headSize);
    });

    it('baby has larger eyes', () => {
      const adult = createQuadruped('otter', { age: 'adult' });
      const baby = createQuadruped('otter', { age: 'baby' });

      expect(baby.eyeSize).toBeGreaterThan(adult.eyeSize);
    });

    it('old has wear by default', () => {
      const old = createQuadruped('otter', { age: 'old' });

      expect(old.wear).toBeGreaterThan(0);
    });
  });

  describe('build modifiers', () => {
    it('stocky has wider body', () => {
      const average = createQuadruped('dog', { build: 'average' });
      const stocky = createQuadruped('dog', { build: 'stocky' });

      expect(stocky.bodyWidth).toBeGreaterThan(average.bodyWidth);
    });

    it('thin has narrower body', () => {
      const average = createQuadruped('cat', { build: 'average' });
      const thin = createQuadruped('cat', { build: 'thin' });

      expect(thin.bodyWidth).toBeLessThan(average.bodyWidth);
    });

    it('heavy has thicker legs', () => {
      const average = createQuadruped('bear', { build: 'average' });
      const heavy = createQuadruped('bear', { build: 'heavy' });

      expect(heavy.legThickness).toBeGreaterThan(average.legThickness);
    });
  });
});

describe('createCustomQuadruped', () => {
  it('creates from scratch with defaults', () => {
    const result = createCustomQuadruped({});

    expect(result.size).toBe(QUADRUPED_DEFAULTS.size);
    expect(result.age).toBe(QUADRUPED_DEFAULTS.age);
  });

  it('allows full customization', () => {
    const result = createCustomQuadruped({
      size: 3,
      earSize: 5,
      hasTail: false,
    });

    expect(result.size).toBe(3);
    expect(result.earSize).toBe(5);
    expect(result.hasTail).toBe(false);
  });
});
