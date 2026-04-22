import type {
  MaterialProceduralBakeBasisUniversalKtx2EncoderOptions,
  MaterialProceduralBakeBrowserImageEncoderOptions,
  MaterialProceduralBakeCanvasLike,
  MaterialProceduralBakeExportEncoderFn,
  MaterialProceduralBakeExportMimeType,
  MaterialProceduralBakeExportRequest,
  MaterialProceduralBakeImageDataLike,
} from './types';

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function decodeBase64(value: string): Uint8Array {
  const normalized = value.replace(/[\n\r\s]/g, '').replace(/=+$/, '');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const character of normalized) {
    const index = BASE64_ALPHABET.indexOf(character);

    if (index < 0) {
      throw new Error('Invalid base64 payload returned by procedural bake image encoder');
    }

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return Uint8Array.from(bytes);
}

function decodeDataUrl(dataUrl: string, expectedMimeType: MaterialProceduralBakeExportMimeType) {
  const match = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(dataUrl);

  if (!match) {
    throw new Error('Procedural bake image encoder did not return a data URL');
  }

  const [, mimeType, base64, payload] = match;

  if (mimeType !== expectedMimeType) {
    throw new Error(
      `Procedural bake image encoder returned "${mimeType}" instead of "${expectedMimeType}"`
    );
  }

  return base64
    ? decodeBase64(payload)
    : Uint8Array.from(decodeURIComponent(payload), (byte) => byte.charCodeAt(0));
}

function defaultBrowserCanvasFactory(
  width: number,
  height: number
): MaterialProceduralBakeCanvasLike {
  if (typeof document === 'undefined') {
    throw new Error(
      'Browser procedural bake image encoding requires a canvasFactory outside browser runtimes'
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  return canvas as unknown as MaterialProceduralBakeCanvasLike;
}

function createBakeImageData(
  request: MaterialProceduralBakeExportRequest,
  canvas: MaterialProceduralBakeCanvasLike
): MaterialProceduralBakeImageDataLike {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Procedural bake image encoder could not create a 2D canvas context');
  }

  const imageData = context.createImageData?.(request.width, request.height) ?? {
    width: request.width,
    height: request.height,
    data: new Uint8ClampedArray(request.width * request.height * 4),
  };

  imageData.data.set(request.data);
  context.putImageData(imageData, 0, 0);

  return imageData;
}

function assertEncoderRequest(
  request: MaterialProceduralBakeExportRequest,
  encoder: MaterialProceduralBakeExportRequest['encoder'],
  mimeType: MaterialProceduralBakeExportMimeType
): void {
  if (request.encoder !== encoder) {
    throw new Error(`Expected procedural bake encoder "${encoder}", received "${request.encoder}"`);
  }

  if (request.mimeType !== mimeType) {
    throw new Error(
      `Expected procedural bake MIME type "${mimeType}", received "${request.mimeType}"`
    );
  }
}

/**
 * Creates a browser canvas encoder for procedural bake WebP/PNG export requests.
 *
 * The default path uses `document.createElement('canvas')`; tests, workers, and non-browser
 * runtimes can provide `canvasFactory` to bind an equivalent canvas implementation.
 */
export function createMaterialProceduralBakeBrowserImageEncoder(
  options: MaterialProceduralBakeBrowserImageEncoderOptions = {}
): MaterialProceduralBakeExportEncoderFn {
  return (request) => {
    const mimeType = options.mimeType ?? request.mimeType;
    assertEncoderRequest(request, 'browser-image-encoder', mimeType);

    const canvas = (options.canvasFactory ?? defaultBrowserCanvasFactory)(
      request.width,
      request.height
    );
    canvas.width = request.width;
    canvas.height = request.height;
    createBakeImageData(request, canvas);

    const quality =
      options.quality !== undefined
        ? clamp01(options.quality)
        : request.options.quality !== undefined
          ? clamp01(request.options.quality)
          : undefined;

    return decodeDataUrl(canvas.toDataURL(mimeType, quality), mimeType);
  };
}

function resolveOutputByteLength(
  request: MaterialProceduralBakeExportRequest,
  options: MaterialProceduralBakeBasisUniversalKtx2EncoderOptions
): number {
  const resolved =
    typeof options.outputByteLength === 'function'
      ? options.outputByteLength(request)
      : options.outputByteLength;

  return Math.max(1024, Math.floor(resolved ?? request.data.byteLength * 2 + 16_384));
}

function applyBasisEncoderOptions(
  request: MaterialProceduralBakeExportRequest,
  options: MaterialProceduralBakeBasisUniversalKtx2EncoderOptions,
  encoder: ReturnType<MaterialProceduralBakeBasisUniversalKtx2EncoderOptions['createEncoder']>
): void {
  encoder.setCreateKTX2File?.(true);
  encoder.setKTX2SRGBTransferFunc?.(options.srgb ?? request.colorSpace === 'srgb');

  if (options.uastc !== undefined) {
    encoder.setUASTC?.(options.uastc);
  }

  if (options.supercompression !== undefined) {
    encoder.setKTX2UASTCSupercompression?.(options.supercompression);
  }

  const generateMipmaps = options.generateMipmaps ?? request.options.generateMipmaps;
  if (generateMipmaps !== undefined) {
    encoder.setMipGen?.(generateMipmaps);
  }

  const perceptual = options.perceptual ?? request.colorSpace === 'srgb';
  encoder.setPerceptual?.(perceptual);

  const qualityLevel =
    options.qualityLevel ??
    (request.options.quality !== undefined
      ? Math.round(clamp01(request.options.quality) * 255)
      : undefined);
  if (qualityLevel !== undefined) {
    encoder.setQualityLevel?.(Math.max(1, Math.floor(qualityLevel)));
  }

  const uastcQualityLevel = options.uastcQualityLevel;
  if (uastcQualityLevel !== undefined) {
    encoder.setKTX2UASTCQualityLevel?.(Math.max(0, Math.floor(uastcQualityLevel)));
  }

  const compressionLevel = options.compressionLevel ?? request.options.compressionLevel;
  if (compressionLevel !== undefined) {
    encoder.setCompressionLevel?.(Math.max(0, Math.floor(compressionLevel)));
  }
}

/**
 * Creates a Basis Universal KTX2 encoder adapter for procedural bake export requests.
 *
 * The Basis encoder itself is injected so the portable core package does not bundle the
 * heavy encoder runtime. Pass `createEncoder: () => new BasisEncoder()` from your worker.
 */
export function createMaterialProceduralBakeBasisUniversalKtx2Encoder(
  options: MaterialProceduralBakeBasisUniversalKtx2EncoderOptions
): MaterialProceduralBakeExportEncoderFn {
  return (request) => {
    assertEncoderRequest(request, 'basis-universal-ktx2', 'image/ktx2');

    const encoder = options.createEncoder();

    try {
      applyBasisEncoderOptions(request, options, encoder);

      const sourceAccepted = encoder.setSliceSourceImage(
        0,
        Uint8Array.from(request.data),
        request.width,
        request.height,
        options.imageIsYFlipped ?? false
      );

      if (sourceAccepted === false) {
        throw new Error('Basis Universal rejected the procedural bake source image');
      }

      const output = new Uint8Array(resolveOutputByteLength(request, options));
      const encodedLength = encoder.encode(output);

      if (!Number.isFinite(encodedLength) || encodedLength <= 0) {
        throw new Error('Basis Universal failed to encode procedural bake KTX2 output');
      }

      if (encodedLength > output.length) {
        throw new Error('Basis Universal procedural bake output exceeded the allocated buffer');
      }

      return output.slice(0, encodedLength);
    } finally {
      encoder.delete?.();
    }
  };
}
