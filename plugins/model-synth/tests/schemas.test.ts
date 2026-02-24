/**
 * Model synth schema validation tests
 *
 * Tests Zod schemas for asset manifests to ensure correct validation
 * of model, texture, and sprite asset definitions.
 */
import { describe, expect, it } from 'vitest';

import {
  AssetManifestSchema,
  ModelAssetSchema,
  SpriteAssetSchema,
  TextureAssetSchema,
} from '../src/schemas/manifest.js';

describe('ModelAssetSchema', () => {
  const validModel = {
    id: 'otter-001',
    name: 'River Otter',
    category: 'character' as const,
    source: {
      type: 'meshy' as const,
      meshyTaskId: 'task-123',
      prompt: 'cute otter wearing adventure vest',
    },
    files: {
      glb: 'models/otter.glb',
      thumbnails: ['thumbnails/otter-front.png'],
    },
    variants: [
      {
        id: 'otter-mossy',
        name: 'Mossy Otter',
        retextureTaskId: 'retex-456',
        prompt: 'mossy forest variant',
        glb: 'models/otter-mossy.glb',
      },
    ],
    animations: [
      {
        name: 'idle',
        type: 'idle' as const,
        url: 'animations/otter-idle.fbx',
      },
    ],
    metadata: {
      polycount: 8000,
      size: 1024000,
      checksum: 'abc123',
      generated: new Date('2024-01-01'),
      version: '1.0.0',
    },
  };

  it('validates a complete model asset', () => {
    const result = ModelAssetSchema.safeParse(validModel);
    expect(result.success).toBe(true);
  });

  it('validates a minimal model asset (no optional fields)', () => {
    const minimal = {
      id: 'rock-001',
      name: 'Basic Rock',
      category: 'obstacle',
      source: { type: 'manual' },
      files: { glb: 'models/rock.glb' },
      metadata: {
        polycount: 500,
        size: 50000,
        checksum: 'def456',
        generated: new Date(),
        version: '1.0.0',
      },
    };
    const result = ModelAssetSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const invalid = { ...validModel, category: 'weapon' };
    const result = ModelAssetSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = ModelAssetSchema.safeParse({ id: 'test' });
    expect(result.success).toBe(false);
  });

  it('validates all category values', () => {
    for (const cat of ['character', 'obstacle', 'collectible', 'environment']) {
      const data = { ...validModel, category: cat };
      const result = ModelAssetSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('validates animation types', () => {
    const types = ['idle', 'walk', 'run', 'jump', 'hit', 'death', 'collect'];
    for (const type of types) {
      const data = {
        ...validModel,
        animations: [{ name: type, type, url: `animations/${type}.fbx` }],
      };
      const result = ModelAssetSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });
});

describe('TextureAssetSchema', () => {
  const validTexture = {
    id: 'ground-001',
    name: 'Forest Ground',
    category: 'pbr' as const,
    source: {
      type: 'ambientcg' as const,
      assetId: 'Ground037',
      resolution: '2K' as const,
    },
    files: {
      baseColor: 'textures/ground-color.png',
      normal: 'textures/ground-normal.png',
      roughness: 'textures/ground-roughness.png',
    },
    metadata: {
      size: 2048000,
      checksum: 'ghi789',
      downloaded: new Date('2024-01-01'),
    },
  };

  it('validates a complete texture asset', () => {
    const result = TextureAssetSchema.safeParse(validTexture);
    expect(result.success).toBe(true);
  });

  it('validates a minimal texture asset', () => {
    const minimal = {
      id: 'env-001',
      name: 'Sky HDRI',
      category: 'environment',
      source: { type: 'manual', resolution: '4K' },
      files: { baseColor: 'textures/sky.hdr' },
      metadata: {
        size: 4096000,
        checksum: 'jkl012',
        downloaded: new Date(),
      },
    };
    const result = TextureAssetSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('rejects invalid category', () => {
    const invalid = { ...validTexture, category: 'diffuse' };
    const result = TextureAssetSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates all resolution values', () => {
    for (const res of ['1K', '2K', '4K', '8K']) {
      const data = {
        ...validTexture,
        source: { ...validTexture.source, resolution: res },
      };
      const result = TextureAssetSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });
});

describe('SpriteAssetSchema', () => {
  const validSprite = {
    id: 'coin-001',
    name: 'Gold Coin',
    category: 'ui' as const,
    source: {
      type: 'openai' as const,
      prompt: 'pixel art gold coin',
      model: 'dall-e-3' as const,
    },
    files: {
      png: 'sprites/coin.png',
      variants: { silver: 'sprites/coin-silver.png' },
    },
    metadata: {
      width: 64,
      height: 64,
      transparent: true,
      size: 8192,
      checksum: 'mno345',
      generated: new Date('2024-01-01'),
    },
  };

  it('validates a complete sprite asset', () => {
    const result = SpriteAssetSchema.safeParse(validSprite);
    expect(result.success).toBe(true);
  });

  it('validates all category values', () => {
    for (const cat of ['ui', 'particle', 'icon', 'effect', 'hud']) {
      const data = { ...validSprite, category: cat };
      const result = SpriteAssetSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid source model', () => {
    const invalid = {
      ...validSprite,
      source: { ...validSprite.source, model: 'gpt-4' },
    };
    const result = SpriteAssetSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('AssetManifestSchema', () => {
  it('validates a complete manifest', () => {
    const manifest = {
      version: '1.0.0',
      generated: new Date(),
      models: [
        {
          id: 'test',
          name: 'Test Model',
          category: 'environment',
          source: { type: 'manual' },
          files: { glb: 'test.glb' },
          metadata: {
            polycount: 100,
            size: 1000,
            checksum: 'abc',
            generated: new Date(),
            version: '1.0.0',
          },
        },
      ],
      textures: [],
      sprites: [],
    };
    const result = AssetManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it('validates an empty manifest', () => {
    const manifest = {
      version: '0.1.0',
      generated: new Date(),
      models: [],
      textures: [],
      sprites: [],
    };
    const result = AssetManifestSchema.safeParse(manifest);
    expect(result.success).toBe(true);
  });

  it('rejects manifest missing required fields', () => {
    const result = AssetManifestSchema.safeParse({ version: '1.0.0' });
    expect(result.success).toBe(false);
  });
});
