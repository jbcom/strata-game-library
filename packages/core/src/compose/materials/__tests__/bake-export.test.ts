import { describe, expect, it } from 'vitest';
import { createMaterialProceduralBakePlan, rasterizeMaterialProceduralBakePlan } from '../bake';
import {
  createMaterialProceduralBakeArtifacts,
  createMaterialProceduralBakeExportPlan,
  encodeMaterialProceduralBakeExportPlan,
  proceduralBakeEncoderForFormat,
  proceduralBakeExportEncoderOptions,
  proceduralBakeExportFileName,
  proceduralBakeFormatFromFileName,
  proceduralBakeMimeTypeForFormat,
  replaceBakeFileExtension,
} from '../bake-export';
import { createMaterialTrait } from '../traits';
import type {
  MaterialProceduralBakeFormat,
  MaterialProceduralBakeRaster,
  MaterialProceduralBakeRasterImage,
} from '../types';

const FORMATS: MaterialProceduralBakeFormat[] = ['png', 'webp', 'ktx2'];

const sampleRaster = (): MaterialProceduralBakeRaster =>
  rasterizeMaterialProceduralBakePlan(
    createMaterialProceduralBakePlan('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness'],
      textureSize: [2, 2],
    })
  );

describe('replaceBakeFileExtension', () => {
  it('swaps the final extension for the requested format', () => {
    expect(replaceBakeFileExtension('mat.baseColor.png', 'webp')).toBe('mat.baseColor.webp');
    expect(replaceBakeFileExtension('mat.baseColor.webp', 'ktx2')).toBe('mat.baseColor.ktx2');
  });

  it('leaves a name with no extension unchanged', () => {
    expect(replaceBakeFileExtension('plain', 'png')).toBe('plain');
  });
});

describe('proceduralBakeFormatFromFileName', () => {
  it('recognizes each supported extension', () => {
    expect(proceduralBakeFormatFromFileName('a.png')).toBe('png');
    expect(proceduralBakeFormatFromFileName('a.webp')).toBe('webp');
    expect(proceduralBakeFormatFromFileName('a.ktx2')).toBe('ktx2');
  });

  it('is case-insensitive', () => {
    expect(proceduralBakeFormatFromFileName('a.WEBP')).toBe('webp');
    expect(proceduralBakeFormatFromFileName('a.KTX2')).toBe('ktx2');
  });

  it('falls back to png for unknown or missing extensions', () => {
    expect(proceduralBakeFormatFromFileName('a.jpg')).toBe('png');
    expect(proceduralBakeFormatFromFileName('noextension')).toBe('png');
    expect(proceduralBakeFormatFromFileName('')).toBe('png');
  });

  it('uses only the final extension segment', () => {
    expect(proceduralBakeFormatFromFileName('a.png.webp')).toBe('webp');
  });
});

describe('format metadata', () => {
  it('maps each format to its MIME type', () => {
    expect(proceduralBakeMimeTypeForFormat('png')).toBe('image/png');
    expect(proceduralBakeMimeTypeForFormat('webp')).toBe('image/webp');
    expect(proceduralBakeMimeTypeForFormat('ktx2')).toBe('image/ktx2');
  });

  it('routes only png to the built-in encoder', () => {
    expect(proceduralBakeEncoderForFormat('png')).toBe('builtin-png');
    expect(proceduralBakeEncoderForFormat('webp')).toBe('browser-image-encoder');
    expect(proceduralBakeEncoderForFormat('ktx2')).toBe('basis-universal-ktx2');
  });

  it('assigns a distinct encoder to each format', () => {
    expect(new Set(FORMATS.map(proceduralBakeEncoderForFormat)).size).toBe(FORMATS.length);
  });
});

describe('proceduralBakeExportFileName', () => {
  const image = {
    fileName: 'mat.roughness.png',
    channel: 'roughness',
  } as MaterialProceduralBakeRasterImage;

  it('rebuilds the name from a supplied prefix', () => {
    expect(proceduralBakeExportFileName(image, 'webp', 'atlas')).toBe('atlas.roughness.webp');
  });

  it('rewrites the existing name when no prefix is given', () => {
    expect(proceduralBakeExportFileName(image, 'ktx2', undefined)).toBe('mat.roughness.ktx2');
  });

  it('treats an empty prefix as absent rather than producing a leading dot', () => {
    expect(proceduralBakeExportFileName(image, 'png', '')).toBe('mat.roughness.png');
  });
});

describe('proceduralBakeExportEncoderOptions', () => {
  it('returns nothing for png regardless of the options given', () => {
    expect(
      proceduralBakeExportEncoderOptions('png', { quality: 0.5, compressionLevel: 3 })
    ).toEqual({});
  });

  it('passes clamped quality through for webp only', () => {
    expect(proceduralBakeExportEncoderOptions('webp', { quality: 0.75 })).toEqual({
      quality: 0.75,
    });
    expect(proceduralBakeExportEncoderOptions('webp', { quality: 5 })).toEqual({ quality: 1 });
    expect(proceduralBakeExportEncoderOptions('webp', { quality: -5 })).toEqual({ quality: 0 });
    expect(proceduralBakeExportEncoderOptions('ktx2', { quality: 0.75 })).toEqual({});
  });

  it('floors and clamps the ktx2 compression level to a non-negative integer', () => {
    expect(proceduralBakeExportEncoderOptions('ktx2', { compressionLevel: 3.9 })).toEqual({
      compressionLevel: 3,
    });
    expect(proceduralBakeExportEncoderOptions('ktx2', { compressionLevel: -4 })).toEqual({
      compressionLevel: 0,
    });
  });

  it('passes the mipmap flag through for ktx2 only, including false', () => {
    expect(proceduralBakeExportEncoderOptions('ktx2', { generateMipmaps: false })).toEqual({
      generateMipmaps: false,
    });
    expect(proceduralBakeExportEncoderOptions('webp', { generateMipmaps: true })).toEqual({});
  });

  it('omits every field when no options are supplied', () => {
    for (const format of FORMATS) {
      expect(proceduralBakeExportEncoderOptions(format, {})).toEqual({});
    }
  });
});

describe('createMaterialProceduralBakeExportPlan', () => {
  it('emits one request per raster image', () => {
    const raster = sampleRaster();
    const plan = createMaterialProceduralBakeExportPlan(raster);

    expect(plan.requests).toHaveLength(raster.images.length);
  });

  it('infers png from the source filename when no format is forced', () => {
    const [request] = createMaterialProceduralBakeExportPlan(sampleRaster()).requests;

    expect(request.format).toBe('png');
    expect(request.encoder).toBe('builtin-png');
    expect(request.mimeType).toBe('image/png');
  });

  it('applies a forced format to the request, encoder, and filename', () => {
    const [request] = createMaterialProceduralBakeExportPlan(sampleRaster(), {
      format: 'ktx2',
    }).requests;

    expect(request.format).toBe('ktx2');
    expect(request.encoder).toBe('basis-universal-ktx2');
    expect(request.fileName.endsWith('.ktx2')).toBe(true);
  });

  it('copies pixel data so later mutation cannot corrupt the raster', () => {
    const raster = sampleRaster();
    const [request] = createMaterialProceduralBakeExportPlan(raster).requests;

    expect(request.data).not.toBe(raster.images[0].data);
    request.data[0] = 1;
    expect(raster.images[0].data[0]).not.toBe(1);
  });

  it('preserves dimensions, colour space, and the rgba8 source tag', () => {
    const raster = sampleRaster();
    const [request] = createMaterialProceduralBakeExportPlan(raster).requests;

    expect(request.width).toBe(raster.images[0].width);
    expect(request.height).toBe(raster.images[0].height);
    expect(request.colorSpace).toBe(raster.images[0].colorSpace);
    expect(request.source).toBe('rgba8');
  });

  it('summarizes each request in a versioned manifest', () => {
    const plan = createMaterialProceduralBakeExportPlan(sampleRaster(), { format: 'webp' });

    expect(plan.manifest.version).toBe(1);
    expect(plan.manifest.targets).toHaveLength(plan.requests.length);
    expect(plan.manifest.targets[0].encoder).toBe('browser-image-encoder');
  });

  it('copies the texture size rather than aliasing the raster', () => {
    const raster = sampleRaster();
    const plan = createMaterialProceduralBakeExportPlan(raster);

    expect(plan.textureSize).toEqual(raster.textureSize);
    expect(plan.textureSize).not.toBe(raster.textureSize);
  });
});

describe('encodeMaterialProceduralBakeExportPlan', () => {
  it('encodes png requests in-process without any injected encoder', () => {
    const plan = createMaterialProceduralBakeExportPlan(sampleRaster());
    const results = encodeMaterialProceduralBakeExportPlan(plan);

    expect(results).toHaveLength(plan.requests.length);
    expect(results[0].data.length).toBeGreaterThan(0);
    expect(Array.from(results[0].data.slice(1, 4))).toEqual([80, 78, 71]);
  });

  it('throws a named error when a non-png encoder is missing', () => {
    const plan = createMaterialProceduralBakeExportPlan(sampleRaster(), { format: 'webp' });

    expect(() => encodeMaterialProceduralBakeExportPlan(plan)).toThrow(
      'No procedural bake export encoder registered for "browser-image-encoder"'
    );
  });

  it('delegates to an injected encoder for non-png formats', () => {
    const plan = createMaterialProceduralBakeExportPlan(sampleRaster(), { format: 'ktx2' });
    const results = encodeMaterialProceduralBakeExportPlan(plan, {
      encoders: {
        'basis-universal-ktx2': () => new Uint8Array([1, 2, 3]),
      },
    });

    expect(Array.from(results[0].data)).toEqual([1, 2, 3]);
    expect(results[0].encoder).toBe('basis-universal-ktx2');
  });

  it('hands the request to the injected encoder for inspection', () => {
    const plan = createMaterialProceduralBakeExportPlan(sampleRaster(), { format: 'webp' });
    let seenWidth = -1;
    encodeMaterialProceduralBakeExportPlan(plan, {
      encoders: {
        'browser-image-encoder': (request) => {
          seenWidth = request.width;
          return new Uint8Array([0]);
        },
      },
    });

    expect(seenWidth).toBe(2);
  });

  it('throws when an injected encoder returns an empty result', () => {
    const plan = createMaterialProceduralBakeExportPlan(sampleRaster(), { format: 'webp' });

    expect(() =>
      encodeMaterialProceduralBakeExportPlan(plan, {
        encoders: { 'browser-image-encoder': () => undefined as never },
      })
    ).toThrow('No procedural bake export encoder registered');
  });

  it('carries format and filename metadata onto each result', () => {
    const plan = createMaterialProceduralBakeExportPlan(sampleRaster());
    const [result] = encodeMaterialProceduralBakeExportPlan(plan);

    expect(result.format).toBe('png');
    expect(result.fileName).toBe(plan.requests[0].fileName);
    expect(result.mimeType).toBe('image/png');
  });

  it('returns an empty list for a plan with no requests', () => {
    const empty = createMaterialProceduralBakeExportPlan({
      materialId: 'm',
      textureSize: [1, 1],
      images: [],
      manifest: { version: 1, materialId: 'm', textureSize: [1, 1], targets: [] },
    } as MaterialProceduralBakeRaster);

    expect(encodeMaterialProceduralBakeExportPlan(empty)).toEqual([]);
  });
});

describe('createMaterialProceduralBakeArtifacts', () => {
  it('bundles the plan, raster, png encodings, and export plan together', () => {
    const artifacts = createMaterialProceduralBakeArtifacts('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness'],
      textureSize: [2, 2],
    });

    expect(artifacts.plan.targets).toHaveLength(1);
    expect(artifacts.raster.images).toHaveLength(1);
    expect(artifacts.png).toHaveLength(1);
    expect(artifacts.exports.requests).toHaveLength(1);
  });

  it('produces png buffers carrying the PNG signature', () => {
    const artifacts = createMaterialProceduralBakeArtifacts('metal_iron', {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness'],
      textureSize: [2, 2],
    });

    expect(artifacts.png[0].data[0]).toBe(137);
    expect(Array.from(artifacts.png[0].data.slice(1, 4))).toEqual([80, 78, 71]);
  });

  it('produces empty bundles for a material with no traits', () => {
    const artifacts = createMaterialProceduralBakeArtifacts('metal_iron');

    expect(artifacts.plan.targets).toEqual([]);
    expect(artifacts.raster.images).toEqual([]);
    expect(artifacts.png).toEqual([]);
    expect(artifacts.exports.requests).toEqual([]);
  });

  it('is deterministic across repeated calls', () => {
    const options = {
      traits: [createMaterialTrait('mottle', { id: 'm' })],
      channels: ['roughness' as const],
      textureSize: 2,
    };
    const first = createMaterialProceduralBakeArtifacts('metal_iron', options);
    const second = createMaterialProceduralBakeArtifacts('metal_iron', options);

    expect(Array.from(first.png[0].data)).toEqual(Array.from(second.png[0].data));
  });

  it('throws for an unknown material id', () => {
    expect(() => createMaterialProceduralBakeArtifacts('nope')).toThrow('Unknown material: nope');
  });
});
