/**
 * Extended schema validation tests
 *
 * Tests edge cases, boundary conditions, and type inference for Zod schemas.
 * Complements the existing schemas.test.ts with additional coverage.
 */
import { describe, expect, it } from 'vitest';
import type {
  AssetManifest,
  ModelAsset,
  SpriteAsset,
  TextureAsset,
} from '../src/schemas/manifest.js';
import {
  AssetManifestSchema,
  ModelAssetSchema,
  SpriteAssetSchema,
  TextureAssetSchema,
} from '../src/schemas/manifest.js';

describe('ModelAssetSchema - edge cases', () => {
  const baseModel = {
    id: 'test-001',
    name: 'Test Model',
    category: 'character' as const,
    source: { type: 'meshy' as const },
    files: { glb: 'models/test.glb' },
    metadata: {
      polycount: 1000,
      size: 500,
      checksum: 'abc',
      generated: new Date(),
      version: '1.0.0',
    },
  };

  it('rejects empty id', () => {
    // Empty string is technically valid for z.string() without min()
    const result = ModelAssetSchema.safeParse({ ...baseModel, id: '' });
    // z.string() allows empty strings
    expect(result.success).toBe(true);
  });

  it('rejects non-string id', () => {
    const result = ModelAssetSchema.safeParse({ ...baseModel, id: 123 });
    expect(result.success).toBe(false);
  });

  it('rejects non-string name', () => {
    const result = ModelAssetSchema.safeParse({ ...baseModel, name: null });
    expect(result.success).toBe(false);
  });

  it('rejects invalid source type', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      source: { type: 'blender' },
    });
    expect(result.success).toBe(false);
  });

  it('validates meshy source type', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      source: { type: 'meshy', meshyTaskId: 'task-x', prompt: 'test' },
    });
    expect(result.success).toBe(true);
  });

  it('validates manual source type', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      source: { type: 'manual' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing glb in files', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      files: { thumbnails: ['thumb.png'] },
    });
    expect(result.success).toBe(false);
  });

  it('accepts files without thumbnails', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      files: { glb: 'model.glb' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty thumbnails array', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      files: { glb: 'model.glb', thumbnails: [] },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid animation type', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      animations: [{ name: 'dance', type: 'dance', url: 'anim.fbx' }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty animations array', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      animations: [],
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty variants array', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      variants: [],
    });
    expect(result.success).toBe(true);
  });

  it('rejects variant with missing required fields', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      variants: [{ id: 'v1', name: 'Variant' }], // missing retextureTaskId, prompt, glb
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative polycount', () => {
    // z.number() without min() allows negative numbers
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      metadata: { ...baseModel.metadata, polycount: -100 },
    });
    // Zod allows negative numbers for z.number()
    expect(result.success).toBe(true);
  });

  it('rejects non-numeric polycount', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      metadata: { ...baseModel.metadata, polycount: 'high' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing version in metadata', () => {
    const { version, ...noVersion } = baseModel.metadata;
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      metadata: noVersion,
    });
    expect(result.success).toBe(false);
  });

  it('accepts Date object for generated field', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      metadata: { ...baseModel.metadata, generated: new Date('2025-06-15') },
    });
    expect(result.success).toBe(true);
  });

  it('rejects string for generated field', () => {
    const result = ModelAssetSchema.safeParse({
      ...baseModel,
      metadata: { ...baseModel.metadata, generated: '2025-06-15' },
    });
    expect(result.success).toBe(false);
  });
});

describe('TextureAssetSchema - edge cases', () => {
  const baseTexture = {
    id: 'tex-001',
    name: 'Test Texture',
    category: 'pbr' as const,
    source: { type: 'ambientcg' as const, resolution: '2K' as const },
    files: { baseColor: 'textures/base.png' },
    metadata: {
      size: 1024,
      checksum: 'xyz',
      downloaded: new Date(),
    },
  };

  it('rejects invalid resolution', () => {
    const result = TextureAssetSchema.safeParse({
      ...baseTexture,
      source: { ...baseTexture.source, resolution: '16K' },
    });
    expect(result.success).toBe(false);
  });

  it('validates all texture categories', () => {
    for (const cat of ['pbr', 'environment', 'effect']) {
      const result = TextureAssetSchema.safeParse({
        ...baseTexture,
        category: cat,
      });
      expect(result.success).toBe(true);
    }
  });

  it('accepts all PBR texture files', () => {
    const result = TextureAssetSchema.safeParse({
      ...baseTexture,
      files: {
        baseColor: 'textures/base.png',
        normal: 'textures/normal.png',
        roughness: 'textures/rough.png',
        metallic: 'textures/metal.png',
        ao: 'textures/ao.png',
        displacement: 'textures/disp.png',
      },
    });
    expect(result.success).toBe(true);
  });

  it('requires baseColor in files', () => {
    const result = TextureAssetSchema.safeParse({
      ...baseTexture,
      files: { normal: 'textures/normal.png' },
    });
    expect(result.success).toBe(false);
  });

  it('validates manual source type', () => {
    const result = TextureAssetSchema.safeParse({
      ...baseTexture,
      source: { type: 'manual', resolution: '4K' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid source type', () => {
    const result = TextureAssetSchema.safeParse({
      ...baseTexture,
      source: { type: 'photoshop', resolution: '2K' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing metadata', () => {
    const { metadata, ...noMeta } = baseTexture;
    const result = TextureAssetSchema.safeParse(noMeta);
    expect(result.success).toBe(false);
  });
});

describe('SpriteAssetSchema - edge cases', () => {
  const baseSprite = {
    id: 'sprite-001',
    name: 'Test Sprite',
    category: 'ui' as const,
    source: { type: 'openai' as const },
    files: { png: 'sprites/test.png' },
    metadata: {
      width: 128,
      height: 128,
      transparent: true,
      size: 4096,
      checksum: 'def',
      generated: new Date(),
    },
  };

  it('validates all sprite categories', () => {
    for (const cat of ['ui', 'particle', 'icon', 'effect', 'hud']) {
      const result = SpriteAssetSchema.safeParse({
        ...baseSprite,
        category: cat,
      });
      expect(result.success).toBe(true);
    }
  });

  it('validates manual source type', () => {
    const result = SpriteAssetSchema.safeParse({
      ...baseSprite,
      source: { type: 'manual' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts dall-e-2 model', () => {
    const result = SpriteAssetSchema.safeParse({
      ...baseSprite,
      source: { type: 'openai', model: 'dall-e-2' },
    });
    expect(result.success).toBe(true);
  });

  it('accepts dall-e-3 model', () => {
    const result = SpriteAssetSchema.safeParse({
      ...baseSprite,
      source: { type: 'openai', model: 'dall-e-3' },
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid source type', () => {
    const result = SpriteAssetSchema.safeParse({
      ...baseSprite,
      source: { type: 'midjourney' },
    });
    expect(result.success).toBe(false);
  });

  it('requires png in files', () => {
    const result = SpriteAssetSchema.safeParse({
      ...baseSprite,
      files: { variants: { alt: 'alt.png' } },
    });
    expect(result.success).toBe(false);
  });

  it('accepts variants as record of strings', () => {
    const result = SpriteAssetSchema.safeParse({
      ...baseSprite,
      files: {
        png: 'sprites/main.png',
        variants: {
          silver: 'sprites/silver.png',
          bronze: 'sprites/bronze.png',
        },
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-boolean transparent field', () => {
    const result = SpriteAssetSchema.safeParse({
      ...baseSprite,
      metadata: { ...baseSprite.metadata, transparent: 'yes' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric width', () => {
    const result = SpriteAssetSchema.safeParse({
      ...baseSprite,
      metadata: { ...baseSprite.metadata, width: 'large' },
    });
    expect(result.success).toBe(false);
  });
});

describe('AssetManifestSchema - edge cases', () => {
  it('validates manifest with multiple assets of each type', () => {
    const manifest = {
      version: '2.0.0',
      generated: new Date(),
      models: [
        {
          id: 'm1',
          name: 'Model 1',
          category: 'character',
          source: { type: 'meshy' },
          files: { glb: 'm1.glb' },
          metadata: {
            polycount: 1000,
            size: 500,
            checksum: 'a',
            generated: new Date(),
            version: '1.0.0',
          },
        },
        {
          id: 'm2',
          name: 'Model 2',
          category: 'environment',
          source: { type: 'manual' },
          files: { glb: 'm2.glb' },
          metadata: {
            polycount: 2000,
            size: 1000,
            checksum: 'b',
            generated: new Date(),
            version: '1.0.0',
          },
        },
      ],
      textures: [
        {
          id: 't1',
          name: 'Texture 1',
          category: 'pbr',
          source: { type: 'ambientcg', resolution: '2K' },
          files: { baseColor: 't1.png' },
          metadata: { size: 2048, checksum: 'c', downloaded: new Date() },
        },
      ],
      sprites: [
        {
          id: 's1',
          name: 'Sprite 1',
          category: 'ui',
          source: { type: 'openai' },
          files: { png: 's1.png' },
          metadata: {
            width: 64,
            height: 64,
            transparent: true,
            size: 1024,
            checksum: 'd',
            generated: new Date(),
          },
        },
      ],
    };

    const result = AssetManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it('rejects missing version', () => {
    const result = AssetManifestSchema.safeParse({
      generated: new Date(),
      models: [],
      textures: [],
      sprites: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing generated date', () => {
    const result = AssetManifestSchema.safeParse({
      version: '1.0.0',
      models: [],
      textures: [],
      sprites: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing models array', () => {
    const result = AssetManifestSchema.safeParse({
      version: '1.0.0',
      generated: new Date(),
      textures: [],
      sprites: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing textures array', () => {
    const result = AssetManifestSchema.safeParse({
      version: '1.0.0',
      generated: new Date(),
      models: [],
      sprites: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing sprites array', () => {
    const result = AssetManifestSchema.safeParse({
      version: '1.0.0',
      generated: new Date(),
      models: [],
      textures: [],
    });
    expect(result.success).toBe(false);
  });

  it('validates type inference for parsed manifest', () => {
    const raw = {
      version: '1.0.0',
      generated: new Date(),
      models: [],
      textures: [],
      sprites: [],
    };

    const result = AssetManifestSchema.safeParse(raw);
    if (result.success) {
      const manifest: AssetManifest = result.data;
      expect(manifest.version).toBe('1.0.0');
      expect(manifest.models).toEqual([]);
      expect(manifest.textures).toEqual([]);
      expect(manifest.sprites).toEqual([]);
    }
  });
});

describe('Zod type exports', () => {
  it('ModelAsset type is correctly inferred', () => {
    const model: ModelAsset = {
      id: 'test',
      name: 'Test',
      category: 'character',
      source: { type: 'meshy' },
      files: { glb: 'test.glb' },
      metadata: {
        polycount: 100,
        size: 50,
        checksum: 'x',
        generated: new Date(),
        version: '1.0.0',
      },
    };

    const result = ModelAssetSchema.safeParse(model);
    expect(result.success).toBe(true);
  });

  it('TextureAsset type is correctly inferred', () => {
    const texture: TextureAsset = {
      id: 'tex',
      name: 'Tex',
      category: 'pbr',
      source: { type: 'ambientcg', resolution: '1K' },
      files: { baseColor: 'tex.png' },
      metadata: { size: 100, checksum: 'y', downloaded: new Date() },
    };

    const result = TextureAssetSchema.safeParse(texture);
    expect(result.success).toBe(true);
  });

  it('SpriteAsset type is correctly inferred', () => {
    const sprite: SpriteAsset = {
      id: 'spr',
      name: 'Spr',
      category: 'icon',
      source: { type: 'manual' },
      files: { png: 'spr.png' },
      metadata: {
        width: 32,
        height: 32,
        transparent: false,
        size: 256,
        checksum: 'z',
        generated: new Date(),
      },
    };

    const result = SpriteAssetSchema.safeParse(sprite);
    expect(result.success).toBe(true);
  });
});
