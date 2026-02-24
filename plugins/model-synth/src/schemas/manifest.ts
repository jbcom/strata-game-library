import { z } from 'zod';

/**
 * Asset Manifest Schema for Otter River Rush
 * Defines 3D models, textures, and sprites with proper typing
 */

export const ModelAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['character', 'obstacle', 'collectible', 'environment']),
  source: z.object({
    type: z.enum(['meshy', 'manual']),
    meshyTaskId: z.string().optional(),
    rigTaskId: z.string().optional(), // For generating more animations
    prompt: z.string().optional(),
  }),
  files: z.object({
    glb: z.string(),
    thumbnails: z.array(z.string()).optional(),
  }),
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        retextureTaskId: z.string(),
        prompt: z.string(),
        glb: z.string(),
      })
    )
    .optional(),
  animations: z
    .array(
      z.object({
        name: z.string(),
        type: z.enum(['idle', 'walk', 'run', 'jump', 'hit', 'death', 'collect']),
        url: z.string(),
      })
    )
    .optional(),
  metadata: z.object({
    polycount: z.number(),
    size: z.number(),
    checksum: z.string(),
    generated: z.date(),
    version: z.string(),
  }),
});

export const TextureAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['pbr', 'environment', 'effect']),
  source: z.object({
    type: z.enum(['ambientcg', 'manual']),
    assetId: z.string().optional(),
    resolution: z.enum(['1K', '2K', '4K', '8K']),
  }),
  files: z.object({
    baseColor: z.string(),
    normal: z.string().optional(),
    roughness: z.string().optional(),
    metallic: z.string().optional(),
    ao: z.string().optional(),
    displacement: z.string().optional(),
  }),
  metadata: z.object({
    size: z.number(),
    checksum: z.string(),
    downloaded: z.date(),
  }),
});

export const SpriteAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['ui', 'particle', 'icon', 'effect', 'hud']),
  source: z.object({
    type: z.enum(['openai', 'manual']),
    prompt: z.string().optional(),
    model: z.enum(['dall-e-2', 'dall-e-3']).optional(),
  }),
  files: z.object({
    png: z.string(),
    variants: z.record(z.string(), z.string()).optional(),
  }),
  metadata: z.object({
    width: z.number(),
    height: z.number(),
    transparent: z.boolean(),
    size: z.number(),
    checksum: z.string(),
    generated: z.date(),
  }),
});

export const AssetManifestSchema = z.object({
  version: z.string(),
  generated: z.date(),
  models: z.array(ModelAssetSchema),
  textures: z.array(TextureAssetSchema),
  sprites: z.array(SpriteAssetSchema),
});

// Export types
export type AssetManifest = z.infer<typeof AssetManifestSchema>;
export type ModelAsset = z.infer<typeof ModelAssetSchema>;
export type TextureAsset = z.infer<typeof TextureAssetSchema>;
export type SpriteAsset = z.infer<typeof SpriteAssetSchema>;
