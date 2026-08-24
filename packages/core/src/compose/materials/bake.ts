/**
 * Procedural bake planning and CPU rasterization.
 *
 * Converts a procedural shader plan into a texture-bake manifest, then
 * rasterizes each target on the CPU into RGBA byte buffers using a value-noise
 * implementation that mirrors the GLSL preamble emitted by `./procedural`.
 * Output is deterministic for a given plan — no renderer, no canvas.
 *
 * @module MaterialBake
 * @category Entities & Simulation
 */

import { clamp01, fract, mix, smoothstep } from './math';
import { createMaterialProceduralPlan } from './procedural';
import type {
  MaterialDefinition,
  MaterialProceduralBakeColorSpace,
  MaterialProceduralBakeMap,
  MaterialProceduralBakePlan,
  MaterialProceduralBakePlanOptions,
  MaterialProceduralBakeRaster,
  MaterialProceduralBakeRasterImage,
  MaterialProceduralColor,
  MaterialProceduralLayer,
  MaterialTraitChannel,
} from './types';

export const DEFAULT_PROCEDURAL_BAKE_CHANNELS: MaterialTraitChannel[] = [
  'baseColor',
  'roughness',
  'metalness',
  'normal',
  'opacity',
  'emissive',
];

export function normalizeTextureSize(
  size: MaterialProceduralBakePlanOptions['textureSize']
): [number, number] {
  if (Array.isArray(size)) {
    return [Math.max(1, Math.floor(size[0])), Math.max(1, Math.floor(size[1]))];
  }

  const dimension = Math.max(1, Math.floor(size ?? 1024));
  return [dimension, dimension];
}

export function proceduralBakeMapForChannel(
  channel: MaterialTraitChannel
): MaterialProceduralBakeMap {
  switch (channel) {
    case 'baseColor':
      return 'diffuse';
    case 'roughness':
      return 'roughness';
    case 'metalness':
      return 'metalness';
    case 'normal':
      return 'normal';
    case 'opacity':
      return 'opacity';
    case 'emissive':
      return 'emissive';
  }
}

export function proceduralBakeColorSpaceForChannel(
  channel: MaterialTraitChannel
): MaterialProceduralBakeColorSpace {
  switch (channel) {
    case 'baseColor':
    case 'emissive':
      return 'srgb';
    case 'normal':
      return 'normal';
    case 'roughness':
    case 'metalness':
    case 'opacity':
      return 'linear';
  }
}

/**
 * Creates a deterministic manifest for baking procedural material layers into texture maps.
 */
export function createMaterialProceduralBakePlan(
  material: string | MaterialDefinition,
  options: MaterialProceduralBakePlanOptions = {}
): MaterialProceduralBakePlan {
  const procedural = createMaterialProceduralPlan(material, {
    traits: options.traits,
    inferTraits: options.inferTraits,
    includeShaderChunk: options.includeShaderChunk,
    idPrefix: options.idPrefix,
  });
  const textureSize = normalizeTextureSize(options.textureSize);
  const format = options.format ?? 'png';
  const channels = options.channels ?? DEFAULT_PROCEDURAL_BAKE_CHANNELS;
  const filePrefix = options.filePrefix ?? procedural.materialId;
  const targets = channels
    .map((channel) => {
      const layerIds = procedural.channelLayers[channel] ?? [];

      if (layerIds.length === 0 && !options.includeEmptyTargets) {
        return undefined;
      }

      return {
        id: `${procedural.materialId}:bake:${channel}`,
        channel,
        map: proceduralBakeMapForChannel(channel),
        layerIds: [...layerIds],
        textureSize,
        format,
        colorSpace: proceduralBakeColorSpaceForChannel(channel),
        fileName: `${filePrefix}.${channel}.${format}`,
      };
    })
    .filter((target): target is NonNullable<typeof target> => target !== undefined);

  return {
    materialId: procedural.materialId,
    procedural,
    textureSize,
    targets,
    manifest: {
      version: 1,
      materialId: procedural.materialId,
      textureSize,
      targets: targets.map((target) => ({
        channel: target.channel,
        map: target.map,
        fileName: target.fileName,
        colorSpace: target.colorSpace,
      })),
    },
  };
}

export function proceduralHash(x: number, y: number, z: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453123);
}

export function proceduralNoise(x: number, y: number, z: number): number {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  const cellZ = Math.floor(z);
  const localX = fract(x);
  const localY = fract(y);
  const localZ = fract(z);
  const curveX = localX * localX * (3 - 2 * localX);
  const curveY = localY * localY * (3 - 2 * localY);
  const curveZ = localZ * localZ * (3 - 2 * localZ);

  const n000 = proceduralHash(cellX, cellY, cellZ);
  const n100 = proceduralHash(cellX + 1, cellY, cellZ);
  const n010 = proceduralHash(cellX, cellY + 1, cellZ);
  const n110 = proceduralHash(cellX + 1, cellY + 1, cellZ);
  const n001 = proceduralHash(cellX, cellY, cellZ + 1);
  const n101 = proceduralHash(cellX + 1, cellY, cellZ + 1);
  const n011 = proceduralHash(cellX, cellY + 1, cellZ + 1);
  const n111 = proceduralHash(cellX + 1, cellY + 1, cellZ + 1);
  const x00 = mix(n000, n100, curveX);
  const x10 = mix(n010, n110, curveX);
  const x01 = mix(n001, n101, curveX);
  const x11 = mix(n011, n111, curveX);
  const y0 = mix(x00, x10, curveY);
  const y1 = mix(x01, x11, curveY);

  return mix(y0, y1, curveZ);
}

export function sampleProceduralLayer(
  layer: MaterialProceduralLayer,
  u: number,
  v: number
): number {
  const scale = layer.scale;
  const seed = layer.seed;
  const intensity = layer.intensity;
  const x = u;
  const y = v;
  const z = (u + v) * 0.5;

  switch (layer.algorithm) {
    case 'directional-noise':
      return clamp01(
        (Math.sin(
          (x + proceduralNoise(x * scale * 0.35, y * scale * 0.35, z)) * scale * 12 + seed
        ) *
          0.5 +
          0.5) *
          intensity
      );
    case 'strand-noise':
      return clamp01(
        Math.abs(
          Math.sin((v + proceduralNoise(x * scale, y * scale, z * scale)) * scale * 24 + seed)
        ) **
          3 *
          intensity
      );
    case 'scratch-lines':
      return proceduralNoise(u * scale * 40, v * scale * 40, seed) >= 1 - intensity * 0.35 ? 1 : 0;
    case 'edge-wear': {
      const edgeDistance = Math.min(u, v, 1 - u, 1 - v);
      const edgeMask = smoothstep(0.35, 1, 1 - edgeDistance * 2);

      return clamp01(
        edgeMask * proceduralNoise(x * scale + seed, y * scale, z * scale) * intensity
      );
    }
    case 'oxidation-noise':
      return clamp01(
        smoothstep(0.25, 0.85, proceduralNoise(x * scale + seed, y * scale, z * scale)) * intensity
      );
    case 'branching-veins':
      return clamp01(
        smoothstep(
          0.65,
          0.95,
          Math.sin(
            (x + y) * scale * 8 + proceduralNoise(x * scale, y * scale, z * scale) * Math.PI + seed
          )
        ) * intensity
      );
    case 'cellular-mottle':
      return clamp01(
        Math.abs(
          proceduralNoise(Math.floor(x * scale * 8) + seed, Math.floor(y * scale * 8), 0) - 0.5
        ) *
          2 *
          intensity
      );
    case 'depth-absorption':
      return clamp01(
        smoothstep(0, 1, y * scale + proceduralNoise(x * scale + seed, y * scale, z * scale)) *
          intensity
      );
  }
}

export function parseProceduralColor(
  color: MaterialProceduralColor | undefined
): [number, number, number] {
  if (Array.isArray(color)) {
    return color.map((value) => Math.round(clamp01(value) * 255)) as [number, number, number];
  }

  if (!color) {
    return [255, 255, 255];
  }

  const hex = color.startsWith('#') ? color.slice(1) : color;
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((character) => character + character)
          .join('')
      : hex.padStart(6, '0').slice(0, 6);

  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

export function layersForTarget(
  plan: MaterialProceduralBakePlan,
  target: MaterialProceduralBakePlan['targets'][number]
): MaterialProceduralLayer[] {
  const layers = new Map(plan.procedural.layers.map((layer) => [layer.id, layer]));

  return target.layerIds
    .map((layerId) => layers.get(layerId))
    .filter((layer): layer is MaterialProceduralLayer => layer !== undefined);
}

export function sampleCombinedMask(
  layers: MaterialProceduralLayer[],
  u: number,
  v: number
): number {
  return clamp01(layers.reduce((sum, layer) => sum + sampleProceduralLayer(layer, u, v), 0));
}

export function writePixel(
  data: Uint8ClampedArray,
  offset: number,
  red: number,
  green: number,
  blue: number,
  alpha = 255
): void {
  data[offset] = Math.round(clamp01(red / 255) * 255);
  data[offset + 1] = Math.round(clamp01(green / 255) * 255);
  data[offset + 2] = Math.round(clamp01(blue / 255) * 255);
  data[offset + 3] = Math.round(clamp01(alpha / 255) * 255);
}

export function writeColorBakePixel(
  data: Uint8ClampedArray,
  offset: number,
  layers: MaterialProceduralLayer[],
  u: number,
  v: number
): void {
  let red = 255;
  let green = 255;
  let blue = 255;

  for (const layer of layers) {
    const mask = sampleProceduralLayer(layer, u, v);
    const [targetRed, targetGreen, targetBlue] = parseProceduralColor(
      layer.color ?? layer.secondaryColor
    );

    red = mix(red, targetRed, mask);
    green = mix(green, targetGreen, mask);
    blue = mix(blue, targetBlue, mask);
  }

  writePixel(data, offset, red, green, blue);
}

export function writeScalarBakePixel(
  data: Uint8ClampedArray,
  offset: number,
  channel: MaterialTraitChannel,
  mask: number
): void {
  const value = channel === 'opacity' ? 255 * (1 - mask * 0.35) : 255 * mask;

  writePixel(data, offset, value, value, value);
}

export function writeNormalBakePixel(
  data: Uint8ClampedArray,
  offset: number,
  layers: MaterialProceduralLayer[],
  u: number,
  v: number,
  width: number,
  height: number
): void {
  const stepU = 1 / Math.max(1, width - 1);
  const stepV = 1 / Math.max(1, height - 1);
  const left = sampleCombinedMask(layers, clamp01(u - stepU), v);
  const right = sampleCombinedMask(layers, clamp01(u + stepU), v);
  const down = sampleCombinedMask(layers, u, clamp01(v - stepV));
  const up = sampleCombinedMask(layers, u, clamp01(v + stepV));
  const strength = 0.75;
  const normalX = clamp01(0.5 - (right - left) * strength);
  const normalY = clamp01(0.5 - (up - down) * strength);

  writePixel(data, offset, normalX * 255, normalY * 255, 255);
}

export function rasterizeMaterialProceduralBakeTarget(
  plan: MaterialProceduralBakePlan,
  target: MaterialProceduralBakePlan['targets'][number]
): MaterialProceduralBakeRasterImage {
  const [width, height] = target.textureSize;
  const data = new Uint8ClampedArray(width * height * 4);
  const layers = layersForTarget(plan, target);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const u = (x + 0.5) / width;
      const v = (y + 0.5) / height;
      const mask = sampleCombinedMask(layers, u, v);

      switch (target.channel) {
        case 'baseColor':
        case 'emissive':
          writeColorBakePixel(data, offset, layers, u, v);
          break;
        case 'normal':
          writeNormalBakePixel(data, offset, layers, u, v, width, height);
          break;
        case 'roughness':
        case 'metalness':
        case 'opacity':
          writeScalarBakePixel(data, offset, target.channel, mask);
          break;
      }
    }
  }

  return {
    targetId: target.id,
    channel: target.channel,
    map: target.map,
    fileName: target.fileName,
    colorSpace: target.colorSpace,
    width,
    height,
    data,
  };
}

/**
 * Rasterizes procedural bake targets into deterministic RGBA byte buffers.
 */
export function rasterizeMaterialProceduralBakePlan(
  plan: MaterialProceduralBakePlan
): MaterialProceduralBakeRaster {
  return {
    materialId: plan.materialId,
    textureSize: [...plan.textureSize],
    images: plan.targets.map((target) => rasterizeMaterialProceduralBakeTarget(plan, target)),
    manifest: {
      ...plan.manifest,
      textureSize: [...plan.manifest.textureSize],
      targets: plan.manifest.targets.map((target) => ({ ...target })),
    },
  };
}
