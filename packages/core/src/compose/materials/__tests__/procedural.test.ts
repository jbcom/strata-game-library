import { describe, expect, it } from 'vitest';
import {
  createChannelLayers,
  createMaterialProceduralPlan,
  proceduralAlgorithmForTrait,
  proceduralShaderPreamble,
  sanitizeShaderIdentifier,
  serializeProceduralColor,
} from '../procedural';
import { createMaterialTrait } from '../traits';
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

describe('proceduralAlgorithmForTrait', () => {
  it('maps every trait type to a distinct algorithm', () => {
    const algorithms = ALL_TRAIT_TYPES.map(proceduralAlgorithmForTrait);

    expect(new Set(algorithms).size).toBe(ALL_TRAIT_TYPES.length);
  });

  it('maps the wood and metal traits to their expected algorithms', () => {
    expect(proceduralAlgorithmForTrait('grain')).toBe('directional-noise');
    expect(proceduralAlgorithmForTrait('scratches')).toBe('scratch-lines');
    expect(proceduralAlgorithmForTrait('absorption')).toBe('depth-absorption');
  });
});

describe('sanitizeShaderIdentifier', () => {
  it('replaces every character illegal in GLSL with an underscore', () => {
    expect(sanitizeShaderIdentifier('wood_oak:grain:oak')).toBe('wood_oak_grain_oak');
    expect(sanitizeShaderIdentifier('a-b.c d')).toBe('a_b_c_d');
  });

  it('strips leading digits so the identifier is a legal GLSL name', () => {
    expect(sanitizeShaderIdentifier('123abc')).toBe('abc');
    expect(sanitizeShaderIdentifier('9')).toBe('layer');
  });

  it('falls back to "layer" when nothing usable remains', () => {
    expect(sanitizeShaderIdentifier('')).toBe('layer');
    // Leading digits are stripped; with nothing left the fallback fires.
    expect(sanitizeShaderIdentifier('123')).toBe('layer');
  });

  it('keeps underscores from illegal characters, since "_" is a legal GLSL start', () => {
    expect(sanitizeShaderIdentifier('***')).toBe('___');
  });

  it('leaves an already-legal identifier untouched', () => {
    expect(sanitizeShaderIdentifier('_valid_Name9')).toBe('_valid_Name9');
  });

  it('never returns a name starting with a digit', () => {
    for (const input of ['1', '42x', '0_0', '7:7']) {
      expect(/^[0-9]/.test(sanitizeShaderIdentifier(input))).toBe(false);
    }
  });
});

describe('createChannelLayers', () => {
  it('starts every PBR channel with an empty list', () => {
    const channels = createChannelLayers();

    expect(Object.keys(channels).sort()).toEqual([
      'baseColor',
      'emissive',
      'metalness',
      'normal',
      'opacity',
      'roughness',
    ]);
    for (const list of Object.values(channels)) {
      expect(list).toEqual([]);
    }
  });

  it('returns independent arrays on each call', () => {
    const first = createChannelLayers();
    first.baseColor.push('x');

    expect(createChannelLayers().baseColor).toEqual([]);
  });
});

describe('serializeProceduralColor', () => {
  it('passes hex strings through unchanged', () => {
    expect(serializeProceduralColor('#ff0000')).toBe('#ff0000');
  });

  it('returns undefined for an absent colour', () => {
    expect(serializeProceduralColor(undefined)).toBeUndefined();
  });

  it('flattens colour objects into an rgb triple', () => {
    expect(serializeProceduralColor({ r: 1, g: 0.5, b: 0 } as never)).toEqual([1, 0.5, 0]);
  });
});

describe('proceduralShaderPreamble', () => {
  it('declares the hash and noise functions the layer shaders call', () => {
    const preamble = proceduralShaderPreamble();

    expect(preamble).toContain('float strataProceduralHash(vec3 value)');
    expect(preamble).toContain('float strataProceduralNoise(vec3 value)');
  });

  it('emits balanced braces', () => {
    const preamble = proceduralShaderPreamble();
    const open = (preamble.match(/\{/g) ?? []).length;
    const close = (preamble.match(/\}/g) ?? []).length;

    expect(open).toBe(close);
  });

  it('is trimmed of surrounding whitespace', () => {
    const preamble = proceduralShaderPreamble();

    expect(preamble).toBe(preamble.trim());
  });
});

describe('createMaterialProceduralPlan', () => {
  it('produces no layers and an empty shader chunk for a material with no traits', () => {
    const plan = createMaterialProceduralPlan('metal_iron');

    expect(plan.layers).toEqual([]);
    expect(plan.shaderChunk).toBe('');
    expect(plan.uniforms).toEqual([]);
  });

  it('carries the resolved material id through to the plan', () => {
    expect(createMaterialProceduralPlan('wood_oak', { inferTraits: true }).materialId).toBe(
      'wood_oak'
    );
  });

  it('builds one layer per supplied trait', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [createMaterialTrait('grain'), createMaterialTrait('wear', { id: 'w' })],
    });

    expect(plan.layers).toHaveLength(2);
    expect(plan.layers.map((layer) => layer.type)).toEqual(['grain', 'wear']);
  });

  it('infers traits only when inferTraits is set', () => {
    expect(createMaterialProceduralPlan('wood_oak').layers).toEqual([]);
    expect(
      createMaterialProceduralPlan('wood_oak', { inferTraits: true }).layers.length
    ).toBeGreaterThan(0);
  });

  it('prefers a material definition’s own traits over inference', () => {
    const material: MaterialDefinition = {
      id: 'custom',
      type: 'solid',
      baseColor: '#ffffff',
      roughness: 0.5,
      metalness: 0,
      traits: [createMaterialTrait('patina', { id: 'own' })],
    };
    const plan = createMaterialProceduralPlan(material, { inferTraits: true });

    expect(plan.layers.map((layer) => layer.traitId)).toEqual(['own']);
  });

  it('gives every layer a GLSL-legal, unique function name', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [
        createMaterialTrait('grain', { id: 'a:b' }),
        createMaterialTrait('wear', { id: 'c d' }),
      ],
    });
    const names = plan.layers.map((layer) => layer.functionName);

    expect(new Set(names).size).toBe(names.length);
    for (const name of names) {
      expect(name).toMatch(/^[A-Za-z_][A-Za-z0-9_]*$/);
    }
  });

  it('offsets each layer seed by its index so identical traits differ', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [
        createMaterialTrait('grain', { id: 'a', seed: 5 }),
        createMaterialTrait('grain', { id: 'b', seed: 5 }),
        createMaterialTrait('grain', { id: 'c', seed: 5 }),
      ],
    });

    expect(plan.layers.map((layer) => layer.seed)).toEqual([5, 106, 207]);
  });

  it('applies the same index offset to the seed uniform as to the layer', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [
        createMaterialTrait('grain', { id: 'a', seed: 5 }),
        createMaterialTrait('grain', { id: 'b', seed: 5 }),
      ],
    });

    for (const layer of plan.layers) {
      const seedUniform = layer.uniforms.find((uniform) => uniform.name.endsWith('_seed'));
      expect(seedUniform?.value).toBe(layer.seed);
    }
  });

  it('indexes each layer under every channel its trait targets', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g' })],
    });
    const layerId = plan.layers[0].id;

    expect(plan.channelLayers.baseColor).toContain(layerId);
    expect(plan.channelLayers.roughness).toContain(layerId);
    expect(plan.channelLayers.normal).toContain(layerId);
    expect(plan.channelLayers.emissive).not.toContain(layerId);
  });

  it('emits scale, seed, and intensity uniforms for every layer', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [createMaterialTrait('wear', { id: 'w' })],
    });
    const suffixes = plan.layers[0].uniforms.map((uniform) =>
      uniform.name.slice(uniform.name.lastIndexOf('_'))
    );

    expect(suffixes).toContain('_scale');
    expect(suffixes).toContain('_seed');
    expect(suffixes).toContain('_intensity');
  });

  it('adds colour uniforms only when the trait carries colours', () => {
    const without = createMaterialProceduralPlan('metal_iron', {
      traits: [createMaterialTrait('wear', { id: 'w' })],
    });
    const with_ = createMaterialProceduralPlan('metal_iron', {
      traits: [
        createMaterialTrait('wear', {
          id: 'w',
          color: '#ff0000',
          secondaryColor: '#00ff00',
        }),
      ],
    });

    expect(without.layers[0].uniforms).toHaveLength(3);
    expect(with_.layers[0].uniforms).toHaveLength(5);
    expect(with_.layers[0].uniforms.some((u) => u.type === 'color')).toBe(true);
  });

  it('aggregates every layer uniform into the plan-level uniform list', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'a' }), createMaterialTrait('wear', { id: 'b' })],
    });

    expect(plan.uniforms).toHaveLength(
      plan.layers.reduce((sum, layer) => sum + layer.uniforms.length, 0)
    );
  });

  it('includes the preamble and one function per layer in the shader chunk', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'a' }), createMaterialTrait('wear', { id: 'b' })],
    });

    expect(plan.shaderChunk).toContain('strataProceduralNoise');
    for (const layer of plan.layers) {
      expect(plan.shaderChunk).toContain(`float ${layer.functionName}(`);
    }
  });

  it('suppresses the shader chunk when includeShaderChunk is false', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'a' })],
      includeShaderChunk: false,
    });

    expect(plan.shaderChunk).toBe('');
    expect(plan.layers).toHaveLength(1);
  });

  it('honours an id prefix in generated layer ids', () => {
    const plan = createMaterialProceduralPlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g' })],
      idPrefix: 'pfx',
    });

    expect(plan.layers[0].id).toBe('pfx:procedural:g');
  });

  it('is deterministic across repeated calls', () => {
    const options = { traits: [createMaterialTrait('grain', { id: 'g' })] };

    expect(createMaterialProceduralPlan('metal_iron', options)).toEqual(
      createMaterialProceduralPlan('metal_iron', options)
    );
  });

  it('does not mutate the traits handed to it', () => {
    const trait = createMaterialTrait('grain', { id: 'g', seed: 1 });
    const snapshot = JSON.parse(JSON.stringify(trait));

    createMaterialProceduralPlan('metal_iron', { traits: [trait] });

    expect(JSON.parse(JSON.stringify(trait))).toEqual(snapshot);
  });

  it('throws for an unknown material id', () => {
    expect(() => createMaterialProceduralPlan('nope')).toThrow('Unknown material: nope');
  });
});
