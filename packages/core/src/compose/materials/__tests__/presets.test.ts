import { describe, expect, it } from 'vitest';
import {
  cloneColorValue,
  cloneMaterialDefinition,
  cloneMaterialTrait,
  MATERIALS,
  mergeMaterialPhysics,
  resolveMaterialDefinition,
} from '../presets';
import { createMaterialTrait } from '../traits';
import type { MaterialDefinition } from '../types';

describe('MATERIALS registry', () => {
  it('keys every entry by its own id', () => {
    for (const [key, material] of Object.entries(MATERIALS)) {
      expect(material.id).toBe(key);
    }
  });

  it('keeps roughness and metalness inside the physical unit range', () => {
    for (const material of Object.values(MATERIALS)) {
      expect(material.roughness).toBeGreaterThanOrEqual(0);
      expect(material.roughness).toBeLessThanOrEqual(1);
      expect(material.metalness).toBeGreaterThanOrEqual(0);
      expect(material.metalness).toBeLessThanOrEqual(1);
    }
  });

  it('gives the volumetric and organic presets their defining sub-objects', () => {
    expect(MATERIALS.crystal_quartz.type).toBe('volumetric');
    expect(MATERIALS.crystal_quartz.volumetric).toBeDefined();
    expect(MATERIALS.flesh_mammal.type).toBe('organic');
    expect(MATERIALS.flesh_mammal.organic).toBeDefined();
  });

  it('gives both fur presets shell parameters and both wood presets a grain', () => {
    expect(MATERIALS.fur_otter.shell).toBeDefined();
    expect(MATERIALS.fur_fox.shell).toBeDefined();
    expect(MATERIALS.wood_oak.grain).toBe('oak');
    expect(MATERIALS.wood_pine.grain).toBe('pine');
  });
});

describe('resolveMaterialDefinition', () => {
  it('resolves a known id to an equal but distinct object', () => {
    const resolved = resolveMaterialDefinition('metal_gold');

    expect(resolved.id).toBe('metal_gold');
    expect(resolved).not.toBe(MATERIALS.metal_gold);
  });

  it('does not let mutations of the result leak back into the registry', () => {
    const resolved = resolveMaterialDefinition('wood_oak');
    const originalRoughness = MATERIALS.wood_oak.roughness;

    resolved.roughness = 0.999;

    expect(MATERIALS.wood_oak.roughness).toBe(originalRoughness);
  });

  it('detaches nested shell objects from the registry entry', () => {
    const resolved = resolveMaterialDefinition('fur_otter');
    const originalLength = MATERIALS.fur_otter.shell?.length;

    if (resolved.shell) {
      resolved.shell.length = 99;
    }

    expect(MATERIALS.fur_otter.shell?.length).toBe(originalLength);
  });

  it('throws a named error for an unknown id', () => {
    expect(() => resolveMaterialDefinition('not_a_material')).toThrow(
      'Unknown material: not_a_material'
    );
  });

  it('throws for the empty string rather than returning a default', () => {
    expect(() => resolveMaterialDefinition('')).toThrow('Unknown material: ');
  });

  it('does not resolve inherited Object.prototype keys as materials', () => {
    expect(() => resolveMaterialDefinition('constructor')).toThrow('Unknown material');
    expect(() => resolveMaterialDefinition('toString')).toThrow('Unknown material');
  });

  it('clones a definition passed directly instead of returning the same reference', () => {
    const input = MATERIALS.metal_iron;
    const resolved = resolveMaterialDefinition(input);

    expect(resolved).not.toBe(input);
    expect(resolved.id).toBe(input.id);
  });
});

describe('cloneMaterialDefinition', () => {
  const base: MaterialDefinition = {
    id: 'base',
    type: 'solid',
    baseColor: '#112233',
    roughness: 0.5,
    metalness: 0.25,
  };

  it('returns an equal copy when no overrides are given', () => {
    const copy = cloneMaterialDefinition(base);

    expect(copy).toEqual(base);
    expect(copy).not.toBe(base);
  });

  it('applies scalar overrides over the base values', () => {
    const copy = cloneMaterialDefinition(base, { roughness: 0.9, id: 'derived' });

    expect(copy.roughness).toBe(0.9);
    expect(copy.id).toBe('derived');
    expect(copy.metalness).toBe(0.25);
  });

  it('merges nested shell fields rather than replacing the whole object', () => {
    const withShell = cloneMaterialDefinition(base, {
      shell: { length: 0.1, density: 100, colorVariation: 0.2 },
    } as Partial<MaterialDefinition>);
    const merged = cloneMaterialDefinition(withShell, {
      shell: { length: 0.5 },
    } as Partial<MaterialDefinition>);

    expect(merged.shell?.length).toBe(0.5);
    expect(merged.shell?.density).toBe(100);
  });

  it('takes nested objects from the overrides when the base has none', () => {
    const merged = cloneMaterialDefinition(base, {
      organic: { scatterColor: '#ff0000', scatterDistance: 0.01 },
    } as Partial<MaterialDefinition>);

    expect(merged.organic?.scatterColor).toBe('#ff0000');
  });

  it('replaces traits wholesale when overrides supply them', () => {
    const withTraits = cloneMaterialDefinition(base, {
      traits: [createMaterialTrait('grain'), createMaterialTrait('wear')],
    });
    const replaced = cloneMaterialDefinition(withTraits, {
      traits: [createMaterialTrait('patina')],
    });

    expect(replaced.traits?.map((trait) => trait.type)).toEqual(['patina']);
  });

  it('clears traits when overrides explicitly pass an empty array', () => {
    const withTraits = cloneMaterialDefinition(base, { traits: [createMaterialTrait('grain')] });
    const cleared = cloneMaterialDefinition(withTraits, { traits: [] });

    expect(cleared.traits).toEqual([]);
  });

  it('deep-copies traits so the clone cannot mutate the source channels', () => {
    const withTraits = cloneMaterialDefinition(base, { traits: [createMaterialTrait('grain')] });
    const copy = cloneMaterialDefinition(withTraits);

    copy.traits?.[0].channels.push('emissive');

    expect(withTraits.traits?.[0].channels).not.toContain('emissive');
  });
});

describe('cloneMaterialTrait', () => {
  it('detaches the channels array from the source trait', () => {
    const trait = createMaterialTrait('grain');
    const copy = cloneMaterialTrait(trait);

    copy.channels.push('emissive');

    expect(trait.channels).not.toContain('emissive');
  });

  it('detaches tags when present and preserves undefined when absent', () => {
    const tagged = createMaterialTrait('wear', { tags: ['a', 'b'] });
    const untagged = createMaterialTrait('wear');

    expect(cloneMaterialTrait(tagged).tags).toEqual(['a', 'b']);
    expect(cloneMaterialTrait(tagged).tags).not.toBe(tagged.tags);
    expect(cloneMaterialTrait(untagged).tags).toBeUndefined();
  });
});

describe('cloneColorValue', () => {
  it('returns hex strings unchanged', () => {
    expect(cloneColorValue('#abcdef')).toBe('#abcdef');
  });

  it('calls clone() on colour-like objects and returns the new instance', () => {
    let calls = 0;
    const cloned = { r: 1, g: 0, b: 0 };
    const colorLike = {
      r: 1,
      g: 0,
      b: 0,
      clone() {
        calls += 1;
        return cloned;
      },
    };

    const result = cloneColorValue(colorLike as never);

    expect(calls).toBe(1);
    expect(result).toBe(cloned);
  });

  it('returns plain objects without a clone method as-is', () => {
    const plain = { r: 0.5, g: 0.5, b: 0.5 };

    expect(cloneColorValue(plain as never)).toBe(plain);
  });

  it('does not throw on null, which is typeof object', () => {
    expect(cloneColorValue(null as never)).toBeNull();
  });
});

describe('mergeMaterialPhysics', () => {
  it('returns undefined when there is neither a base nor overrides', () => {
    expect(mergeMaterialPhysics(undefined, undefined)).toBeUndefined();
  });

  it('copies the base when there are no overrides', () => {
    const base = { density: 500, friction: 0.2, restitution: 0.9 };
    const merged = mergeMaterialPhysics(base, undefined);

    expect(merged).toEqual(base);
    expect(merged).not.toBe(base);
  });

  it('fills every missing field with engine defaults when there is no base', () => {
    expect(mergeMaterialPhysics(undefined, {})).toEqual({
      density: 1000,
      friction: 0.5,
      restitution: 0.1,
    });
  });

  it('prefers override values over base values field by field', () => {
    const merged = mergeMaterialPhysics(
      { density: 500, friction: 0.2, restitution: 0.9 },
      { friction: 0.8 }
    );

    expect(merged).toEqual({ density: 500, friction: 0.8, restitution: 0.9 });
  });

  it('treats an explicit zero override as a real value, not a missing one', () => {
    const merged = mergeMaterialPhysics(
      { density: 500, friction: 0.2, restitution: 0.9 },
      { friction: 0, restitution: 0, density: 0 }
    );

    expect(merged).toEqual({ density: 0, friction: 0, restitution: 0 });
  });
});
