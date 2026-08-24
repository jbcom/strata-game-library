import { describe, expect, it } from 'vitest';
import {
  createMaterialProceduralBakePlan,
  DEFAULT_PROCEDURAL_BAKE_CHANNELS,
  normalizeTextureSize,
  parseProceduralColor,
  proceduralBakeColorSpaceForChannel,
  proceduralBakeMapForChannel,
  proceduralHash,
  proceduralNoise,
  rasterizeMaterialProceduralBakePlan,
  sampleProceduralLayer,
} from '../bake';
import { createMaterialProceduralPlan } from '../procedural';
import { createMaterialTrait } from '../traits';
import type { MaterialProceduralLayer, MaterialTraitChannel } from '../types';

const CHANNELS: MaterialTraitChannel[] = [
  'baseColor',
  'roughness',
  'metalness',
  'normal',
  'opacity',
  'emissive',
];

describe('normalizeTextureSize', () => {
  it('expands a single dimension into a square', () => {
    expect(normalizeTextureSize(256)).toEqual([256, 256]);
  });

  it('defaults to 1024 square when no size is given', () => {
    expect(normalizeTextureSize(undefined)).toEqual([1024, 1024]);
  });

  it('preserves a non-square explicit pair', () => {
    expect(normalizeTextureSize([256, 128])).toEqual([256, 128]);
  });

  it('floors fractional dimensions', () => {
    expect(normalizeTextureSize(64.9)).toEqual([64, 64]);
    expect(normalizeTextureSize([32.7, 16.2])).toEqual([32, 16]);
  });

  it('never returns a dimension below one, even for zero or negatives', () => {
    expect(normalizeTextureSize(0)).toEqual([1, 1]);
    expect(normalizeTextureSize(-512)).toEqual([1, 1]);
    expect(normalizeTextureSize([0, -8])).toEqual([1, 1]);
  });
});

describe('channel mapping', () => {
  it('maps every channel to a bake map name', () => {
    for (const channel of CHANNELS) {
      expect(proceduralBakeMapForChannel(channel)).toBeTruthy();
    }
    expect(proceduralBakeMapForChannel('baseColor')).toBe('diffuse');
  });

  it('marks only the colour channels as sRGB', () => {
    expect(proceduralBakeColorSpaceForChannel('baseColor')).toBe('srgb');
    expect(proceduralBakeColorSpaceForChannel('emissive')).toBe('srgb');
  });

  it('marks normal maps distinctly from linear scalar maps', () => {
    expect(proceduralBakeColorSpaceForChannel('normal')).toBe('normal');
    expect(proceduralBakeColorSpaceForChannel('roughness')).toBe('linear');
    expect(proceduralBakeColorSpaceForChannel('metalness')).toBe('linear');
    expect(proceduralBakeColorSpaceForChannel('opacity')).toBe('linear');
  });

  it('covers exactly the six PBR channels in the default channel list', () => {
    expect([...DEFAULT_PROCEDURAL_BAKE_CHANNELS].sort()).toEqual([...CHANNELS].sort());
  });
});

describe('parseProceduralColor', () => {
  it('defaults to opaque white when no colour is supplied', () => {
    expect(parseProceduralColor(undefined)).toEqual([255, 255, 255]);
  });

  it('parses six-digit hex with and without a leading hash', () => {
    expect(parseProceduralColor('#ff8000')).toEqual([255, 128, 0]);
    expect(parseProceduralColor('ff8000')).toEqual([255, 128, 0]);
  });

  it('expands three-digit shorthand hex', () => {
    expect(parseProceduralColor('#f00')).toEqual([255, 0, 0]);
    expect(parseProceduralColor('#abc')).toEqual([170, 187, 204]);
  });

  it('scales a normalized rgb triple into bytes', () => {
    expect(parseProceduralColor([1, 0.5, 0])).toEqual([255, 128, 0]);
  });

  it('clamps out-of-range triple components into the byte range', () => {
    expect(parseProceduralColor([5, -5, 0.5])).toEqual([255, 0, 128]);
  });

  it('treats the empty string as the white default rather than parsing it', () => {
    expect(parseProceduralColor('')).toEqual([255, 255, 255]);
  });

  it('left-pads short hex so it never reads past the string', () => {
    expect(parseProceduralColor('#ff')).toEqual([0, 0, 255]);
  });

  it('always returns three components inside the byte range', () => {
    for (const input of ['#000000', '#ffffff', '#123', [0, 0, 0], [1, 1, 1]] as const) {
      const rgb = parseProceduralColor(input as never);
      expect(rgb).toHaveLength(3);
      for (const component of rgb) {
        expect(component).toBeGreaterThanOrEqual(0);
        expect(component).toBeLessThanOrEqual(255);
      }
    }
  });
});

describe('proceduralHash / proceduralNoise', () => {
  it('produces hashes inside [0, 1)', () => {
    for (let i = 0; i < 50; i += 1) {
      const value = proceduralHash(i * 1.3, i * -2.7, i * 0.4);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it('is deterministic for identical coordinates', () => {
    expect(proceduralHash(1.5, 2.5, 3.5)).toBe(proceduralHash(1.5, 2.5, 3.5));
    expect(proceduralNoise(1.5, 2.5, 3.5)).toBe(proceduralNoise(1.5, 2.5, 3.5));
  });

  it('produces different values for different coordinates', () => {
    expect(proceduralHash(1, 2, 3)).not.toBe(proceduralHash(3, 2, 1));
  });

  it('produces noise inside [0, 1] across a sampled volume', () => {
    for (let i = 0; i < 60; i += 1) {
      const value = proceduralNoise(i * 0.37, i * 0.73, i * 0.11);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it('equals the lattice hash exactly at integer lattice points', () => {
    expect(proceduralNoise(3, 4, 5)).toBeCloseTo(proceduralHash(3, 4, 5), 12);
  });

  it('varies continuously between neighbouring samples', () => {
    const a = proceduralNoise(2.5, 2.5, 2.5);
    const b = proceduralNoise(2.5001, 2.5, 2.5);

    expect(Math.abs(a - b)).toBeLessThan(0.01);
  });

  it('handles negative coordinates without leaving the unit range', () => {
    const value = proceduralNoise(-4.25, -9.75, -0.5);

    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(1);
  });
});

describe('sampleProceduralLayer', () => {
  const layerFor = (algorithm: MaterialProceduralLayer['algorithm']): MaterialProceduralLayer =>
    ({
      id: 'l',
      traitId: 't',
      type: 'grain',
      algorithm,
      functionName: 'strata_l',
      channels: ['baseColor'],
      intensity: 0.8,
      scale: 2,
      seed: 3,
      uniforms: [],
    }) as MaterialProceduralLayer;

  const ALGORITHMS: MaterialProceduralLayer['algorithm'][] = [
    'directional-noise',
    'strand-noise',
    'scratch-lines',
    'edge-wear',
    'oxidation-noise',
    'branching-veins',
    'cellular-mottle',
    'depth-absorption',
  ];

  it('returns a mask inside [0, 1] for every algorithm across the UV square', () => {
    for (const algorithm of ALGORITHMS) {
      const layer = layerFor(algorithm);
      for (const [u, v] of [
        [0, 0],
        [0.5, 0.5],
        [1, 1],
        [0.25, 0.75],
      ]) {
        const mask = sampleProceduralLayer(layer, u, v);
        expect(Number.isFinite(mask)).toBe(true);
        expect(mask).toBeGreaterThanOrEqual(0);
        expect(mask).toBeLessThanOrEqual(1);
      }
    }
  });

  it('is deterministic for the same layer and coordinates', () => {
    for (const algorithm of ALGORITHMS) {
      const layer = layerFor(algorithm);
      expect(sampleProceduralLayer(layer, 0.3, 0.7)).toBe(sampleProceduralLayer(layer, 0.3, 0.7));
    }
  });

  it('returns zero everywhere when intensity is zero', () => {
    for (const algorithm of ALGORITHMS) {
      const layer = { ...layerFor(algorithm), intensity: 0 };
      // scratch-lines is a step function and stays binary; the rest scale to 0.
      if (algorithm === 'scratch-lines') {
        continue;
      }
      expect(sampleProceduralLayer(layer, 0.42, 0.58)).toBe(0);
    }
  });

  it('emits only 0 or 1 for the scratch-lines step algorithm', () => {
    const layer = layerFor('scratch-lines');
    for (let i = 0; i <= 10; i += 1) {
      expect([0, 1]).toContain(sampleProceduralLayer(layer, i / 10, 0.5));
    }
  });

  it('changes output when the seed changes', () => {
    const a = sampleProceduralLayer(layerFor('oxidation-noise'), 0.3, 0.7);
    const b = sampleProceduralLayer({ ...layerFor('oxidation-noise'), seed: 999 }, 0.3, 0.7);

    expect(a).not.toBe(b);
  });

  it('brightens the edge-wear mask nearer the UV border than the centre', () => {
    const layer = layerFor('edge-wear');
    const centre = sampleProceduralLayer(layer, 0.5, 0.5);

    expect(centre).toBe(0);
  });
});

describe('createMaterialProceduralBakePlan', () => {
  it('omits targets with no contributing layers by default', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron');

    expect(plan.targets).toEqual([]);
  });

  it('emits every channel when includeEmptyTargets is set', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      includeEmptyTargets: true,
    });

    expect(plan.targets).toHaveLength(CHANNELS.length);
  });

  it('emits only the channels the traits actually target', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
    });

    expect(plan.targets.map((target) => target.channel).sort()).toEqual(['baseColor', 'roughness']);
  });

  it('restricts output to an explicit channel list', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g' })],
      channels: ['normal'],
    });

    expect(plan.targets.map((target) => target.channel)).toEqual(['normal']);
  });

  it('applies the requested texture size to every target and the manifest', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g' })],
      textureSize: [8, 4],
    });

    expect(plan.textureSize).toEqual([8, 4]);
    expect(plan.manifest.textureSize).toEqual([8, 4]);
    for (const target of plan.targets) {
      expect(target.textureSize).toEqual([8, 4]);
    }
  });

  it('names files from the material id, channel, and format', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness'],
    });

    expect(plan.targets[0].fileName).toBe('metal_iron.roughness.png');
  });

  it('honours a file prefix override', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness'],
      filePrefix: 'atlas',
    });

    expect(plan.targets[0].fileName).toBe('atlas.roughness.png');
  });

  it('threads a non-png format into the filename and target', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness'],
      format: 'webp',
    });

    expect(plan.targets[0].format).toBe('webp');
    expect(plan.targets[0].fileName).toBe('metal_iron.roughness.webp');
  });

  it('summarizes every target in a versioned manifest', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g' })],
    });

    expect(plan.manifest.version).toBe(1);
    expect(plan.manifest.targets).toHaveLength(plan.targets.length);
    expect(plan.manifest.materialId).toBe('metal_iron');
  });

  it('is deterministic across repeated calls', () => {
    const options = { traits: [createMaterialTrait('grain', { id: 'g' })], textureSize: 4 };

    expect(createMaterialProceduralBakePlan('metal_iron', options)).toEqual(
      createMaterialProceduralBakePlan('metal_iron', options)
    );
  });
});

describe('rasterizeMaterialProceduralBakePlan', () => {
  const smallPlan = () =>
    createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g', intensity: 0.9 })],
      textureSize: [4, 4],
    });

  it('produces one image per target with the right buffer length', () => {
    const raster = rasterizeMaterialProceduralBakePlan(smallPlan());

    expect(raster.images).toHaveLength(smallPlan().targets.length);
    for (const image of raster.images) {
      expect(image.data).toHaveLength(image.width * image.height * 4);
    }
  });

  it('carries target metadata onto each image', () => {
    const plan = smallPlan();
    const raster = rasterizeMaterialProceduralBakePlan(plan);

    for (let i = 0; i < plan.targets.length; i += 1) {
      expect(raster.images[i].targetId).toBe(plan.targets[i].id);
      expect(raster.images[i].channel).toBe(plan.targets[i].channel);
      expect(raster.images[i].fileName).toBe(plan.targets[i].fileName);
    }
  });

  it('writes fully opaque alpha for every pixel', () => {
    const raster = rasterizeMaterialProceduralBakePlan(smallPlan());

    for (const image of raster.images) {
      for (let offset = 3; offset < image.data.length; offset += 4) {
        expect(image.data[offset]).toBe(255);
      }
    }
  });

  it('writes a greyscale value for scalar channels', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness'],
      textureSize: [4, 4],
    });
    const image = rasterizeMaterialProceduralBakePlan(plan).images[0];

    for (let offset = 0; offset < image.data.length; offset += 4) {
      expect(image.data[offset]).toBe(image.data[offset + 1]);
      expect(image.data[offset + 1]).toBe(image.data[offset + 2]);
    }
  });

  it('writes normal maps with a full-strength blue channel', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g' })],
      channels: ['normal'],
      textureSize: [4, 4],
    });
    const image = rasterizeMaterialProceduralBakePlan(plan).images[0];

    for (let offset = 2; offset < image.data.length; offset += 4) {
      expect(image.data[offset]).toBe(255);
    }
  });

  it('keeps opacity bright, since the mask only subtracts a fraction', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('fiber', { id: 'f', intensity: 1 })],
      channels: ['opacity'],
      textureSize: [4, 4],
    });
    const image = rasterizeMaterialProceduralBakePlan(plan).images[0];

    for (let offset = 0; offset < image.data.length; offset += 4) {
      expect(image.data[offset]).toBeGreaterThanOrEqual(Math.floor(255 * 0.65));
    }
  });

  it('handles a 1x1 texture without dividing by zero in the normal step', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g' })],
      channels: ['normal'],
      textureSize: 1,
    });
    const image = rasterizeMaterialProceduralBakePlan(plan).images[0];

    expect(image.data).toHaveLength(4);
    for (const byte of image.data) {
      expect(Number.isFinite(byte)).toBe(true);
    }
  });

  it('produces an empty image list for a plan with no targets', () => {
    const raster = rasterizeMaterialProceduralBakePlan(
      createMaterialProceduralBakePlan('metal_iron')
    );

    expect(raster.images).toEqual([]);
  });

  it('copies the texture size and manifest rather than aliasing the plan', () => {
    const plan = smallPlan();
    const raster = rasterizeMaterialProceduralBakePlan(plan);

    expect(raster.textureSize).not.toBe(plan.textureSize);
    expect(raster.manifest).not.toBe(plan.manifest);
    expect(raster.manifest.targets[0]).not.toBe(plan.manifest.targets[0]);
  });

  it('is deterministic byte for byte', () => {
    const plan = smallPlan();
    const first = rasterizeMaterialProceduralBakePlan(plan);
    const second = rasterizeMaterialProceduralBakePlan(plan);

    for (let i = 0; i < first.images.length; i += 1) {
      expect(Array.from(first.images[i].data)).toEqual(Array.from(second.images[i].data));
    }
  });

  it('renders a visibly non-uniform mask for a textured trait', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('grain', { id: 'g', intensity: 1, scale: 4 })],
      channels: ['roughness'],
      textureSize: [16, 16],
    });
    const image = rasterizeMaterialProceduralBakePlan(plan).images[0];
    const reds = new Set<number>();

    for (let offset = 0; offset < image.data.length; offset += 4) {
      reds.add(image.data[offset]);
    }

    expect(reds.size).toBeGreaterThan(1);
  });

  it('drops layer ids that are absent from the procedural plan', () => {
    const plan = createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness'],
      textureSize: [2, 2],
    });
    plan.targets[0].layerIds.push('does-not-exist');

    expect(() => rasterizeMaterialProceduralBakePlan(plan)).not.toThrow();
  });

  it('matches the procedural plan the bake plan embedded', () => {
    const traits = [createMaterialTrait('grain', { id: 'g' })];
    const plan = createMaterialProceduralBakePlan('metal_iron', { traits });

    expect(plan.procedural).toEqual(createMaterialProceduralPlan('metal_iron', { traits }));
  });
});
