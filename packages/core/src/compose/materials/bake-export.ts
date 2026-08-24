/**
 * Bake export planning and encoder dispatch.
 *
 * Describes how each rasterized bake target should be encoded — format, MIME
 * type, filename, and which encoder is responsible — then executes that plan,
 * handling PNG in-process and delegating WebP/KTX2 to injected encoders.
 *
 * @module MaterialBakeExport
 * @category Entities & Simulation
 */

import { createMaterialProceduralBakePlan, rasterizeMaterialProceduralBakePlan } from './bake';
import { clamp01 } from './math';
import { encodeMaterialProceduralBakeImagePng, encodeMaterialProceduralBakeRasterPng } from './png';
import type {
  MaterialDefinition,
  MaterialProceduralBakeArtifacts,
  MaterialProceduralBakeExportEncoder,
  MaterialProceduralBakeExportEncoderOptions,
  MaterialProceduralBakeExportExecutionOptions,
  MaterialProceduralBakeExportMimeType,
  MaterialProceduralBakeExportOptions,
  MaterialProceduralBakeExportPlan,
  MaterialProceduralBakeExportResult,
  MaterialProceduralBakeFormat,
  MaterialProceduralBakePlanOptions,
  MaterialProceduralBakeRaster,
  MaterialProceduralBakeRasterImage,
} from './types';

export function replaceBakeFileExtension(
  fileName: string,
  format: MaterialProceduralBakeFormat
): string {
  return fileName.replace(/\.[^/.]+$/, `.${format}`);
}

export function proceduralBakeFormatFromFileName(fileName: string): MaterialProceduralBakeFormat {
  const extension = fileName.split('.').pop()?.toLowerCase();

  return extension === 'webp' || extension === 'ktx2' || extension === 'png' ? extension : 'png';
}

export function proceduralBakeMimeTypeForFormat(
  format: MaterialProceduralBakeFormat
): MaterialProceduralBakeExportMimeType {
  switch (format) {
    case 'webp':
      return 'image/webp';
    case 'ktx2':
      return 'image/ktx2';
    case 'png':
      return 'image/png';
  }
}

export function proceduralBakeEncoderForFormat(
  format: MaterialProceduralBakeFormat
): MaterialProceduralBakeExportEncoder {
  switch (format) {
    case 'webp':
      return 'browser-image-encoder';
    case 'ktx2':
      return 'basis-universal-ktx2';
    case 'png':
      return 'builtin-png';
  }
}

export function proceduralBakeExportFileName(
  image: MaterialProceduralBakeRasterImage,
  format: MaterialProceduralBakeFormat,
  filePrefix: string | undefined
): string {
  if (filePrefix) {
    return `${filePrefix}.${image.channel}.${format}`;
  }

  return replaceBakeFileExtension(image.fileName, format);
}

export function proceduralBakeExportEncoderOptions(
  format: MaterialProceduralBakeFormat,
  options: MaterialProceduralBakeExportOptions
): MaterialProceduralBakeExportEncoderOptions {
  return {
    ...(format === 'webp' && options.quality !== undefined
      ? { quality: clamp01(options.quality) }
      : {}),
    ...(format === 'ktx2' && options.compressionLevel !== undefined
      ? { compressionLevel: Math.max(0, Math.floor(options.compressionLevel)) }
      : {}),
    ...(format === 'ktx2' && options.generateMipmaps !== undefined
      ? { generateMipmaps: options.generateMipmaps }
      : {}),
  };
}

/**
 * Creates external encoder requests for PNG, WebP, or KTX2 bake exports.
 */
export function createMaterialProceduralBakeExportPlan(
  raster: MaterialProceduralBakeRaster,
  options: MaterialProceduralBakeExportOptions = {}
): MaterialProceduralBakeExportPlan {
  const requests = raster.images.map((image) => {
    const format = options.format ?? proceduralBakeFormatFromFileName(image.fileName);
    const encoder = proceduralBakeEncoderForFormat(format);

    return {
      targetId: image.targetId,
      channel: image.channel,
      map: image.map,
      format,
      fileName: proceduralBakeExportFileName(image, format, options.filePrefix),
      mimeType: proceduralBakeMimeTypeForFormat(format),
      encoder,
      colorSpace: image.colorSpace,
      width: image.width,
      height: image.height,
      source: 'rgba8' as const,
      data: new Uint8ClampedArray(image.data),
      options: proceduralBakeExportEncoderOptions(format, options),
    };
  });

  return {
    materialId: raster.materialId,
    textureSize: [...raster.textureSize],
    requests,
    manifest: {
      version: 1,
      materialId: raster.materialId,
      textureSize: [...raster.textureSize],
      targets: requests.map((request) => ({
        channel: request.channel,
        map: request.map,
        format: request.format,
        fileName: request.fileName,
        mimeType: request.mimeType,
        encoder: request.encoder,
        colorSpace: request.colorSpace,
      })),
    },
  };
}

function proceduralBakeExportRequestToRasterImage(
  request: MaterialProceduralBakeExportPlan['requests'][number]
): MaterialProceduralBakeRasterImage {
  return {
    targetId: request.targetId,
    channel: request.channel,
    map: request.map,
    fileName: request.fileName,
    colorSpace: request.colorSpace,
    width: request.width,
    height: request.height,
    data: request.data,
  };
}

/**
 * Executes a procedural bake export plan with built-in PNG and injected WebP/KTX2 encoders.
 */
export function encodeMaterialProceduralBakeExportPlan(
  plan: MaterialProceduralBakeExportPlan,
  options: MaterialProceduralBakeExportExecutionOptions = {}
): MaterialProceduralBakeExportResult[] {
  return plan.requests.map((request) => {
    const data =
      request.encoder === 'builtin-png'
        ? encodeMaterialProceduralBakeImagePng(proceduralBakeExportRequestToRasterImage(request))
        : options.encoders?.[request.encoder]?.(request);

    if (!data) {
      throw new Error(`No procedural bake export encoder registered for "${request.encoder}"`);
    }

    return {
      targetId: request.targetId,
      channel: request.channel,
      map: request.map,
      format: request.format,
      fileName: request.fileName,
      mimeType: request.mimeType,
      encoder: request.encoder,
      data,
    };
  });
}

/**
 * Creates a complete procedural bake artifact bundle for offline or worker pipelines.
 */
export function createMaterialProceduralBakeArtifacts(
  material: string | MaterialDefinition,
  options: MaterialProceduralBakePlanOptions = {}
): MaterialProceduralBakeArtifacts {
  const plan = createMaterialProceduralBakePlan(material, options);
  const raster = rasterizeMaterialProceduralBakePlan(plan);

  return {
    plan,
    raster,
    png: encodeMaterialProceduralBakeRasterPng(raster),
    exports: createMaterialProceduralBakeExportPlan(raster),
  };
}
