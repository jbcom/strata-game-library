/**
 * Minimal dependency-free PNG encoding for baked material textures.
 *
 * Implements just enough of the PNG and zlib specifications to serialize an
 * RGBA8 raster: CRC-32, Adler-32, stored (uncompressed) deflate blocks, and
 * IHDR/IDAT/IEND chunk framing. Self-contained so bakes work in Node, workers,
 * and browsers without a canvas or a compression library.
 *
 * @module MaterialPng
 * @category Entities & Simulation
 */

import type {
  MaterialProceduralBakeEncodedImage,
  MaterialProceduralBakeRaster,
  MaterialProceduralBakeRasterImage,
} from './types';

export const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

export function asciiBytes(value: string): Uint8Array {
  return Uint8Array.from(value, (character) => character.charCodeAt(0));
}

export function uint32Bytes(value: number): Uint8Array {
  return new Uint8Array([
    (value >>> 24) & 0xff,
    (value >>> 16) & 0xff,
    (value >>> 8) & 0xff,
    value & 0xff,
  ]);
}

export function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const combined = new Uint8Array(length);
  let offset = 0;

  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return combined;
}

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

export function adler32(bytes: Uint8Array): number {
  let a = 1;
  let b = 0;

  for (const byte of bytes) {
    a = (a + byte) % 65521;
    b = (b + a) % 65521;
  }

  return ((b << 16) | a) >>> 0;
}

export function pngChunk(type: string, data: Uint8Array = new Uint8Array()): Uint8Array {
  const typeBytes = asciiBytes(type);
  const payload = concatBytes([typeBytes, data]);

  return concatBytes([uint32Bytes(data.length), payload, uint32Bytes(crc32(payload))]);
}

export function zlibNoCompression(data: Uint8Array): Uint8Array {
  const blocks: Uint8Array[] = [new Uint8Array([0x78, 0x01])];
  let offset = 0;

  while (offset < data.length) {
    const length = Math.min(65_535, data.length - offset);
    const final = offset + length >= data.length ? 1 : 0;
    const block = new Uint8Array(5 + length);
    const inverted = ~length & 0xffff;

    block[0] = final;
    block[1] = length & 0xff;
    block[2] = (length >>> 8) & 0xff;
    block[3] = inverted & 0xff;
    block[4] = (inverted >>> 8) & 0xff;
    block.set(data.subarray(offset, offset + length), 5);
    blocks.push(block);
    offset += length;
  }

  blocks.push(uint32Bytes(adler32(data)));
  return concatBytes(blocks);
}

export function pngFileName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '.png');
}

export function pngScanlines(image: MaterialProceduralBakeRasterImage): Uint8Array {
  const stride = image.width * 4;
  const scanlines = new Uint8Array((stride + 1) * image.height);

  for (let y = 0; y < image.height; y += 1) {
    const sourceOffset = y * stride;
    const targetOffset = y * (stride + 1);

    scanlines[targetOffset] = 0;
    scanlines.set(image.data.subarray(sourceOffset, sourceOffset + stride), targetOffset + 1);
  }

  return scanlines;
}

/**
 * Encodes one procedural bake image as a PNG byte buffer.
 */
export function encodeMaterialProceduralBakeImagePng(
  image: MaterialProceduralBakeRasterImage
): Uint8Array {
  const ihdr = new Uint8Array(13);

  ihdr.set(uint32Bytes(image.width), 0);
  ihdr.set(uint32Bytes(image.height), 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return concatBytes([
    PNG_SIGNATURE,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlibNoCompression(pngScanlines(image))),
    pngChunk('IEND'),
  ]);
}

/**
 * Encodes every procedural bake raster image as PNG byte buffers.
 */
export function encodeMaterialProceduralBakeRasterPng(
  raster: MaterialProceduralBakeRaster
): MaterialProceduralBakeEncodedImage[] {
  return raster.images.map((image) => ({
    targetId: image.targetId,
    channel: image.channel,
    map: image.map,
    fileName: pngFileName(image.fileName),
    mimeType: 'image/png',
    data: encodeMaterialProceduralBakeImagePng(image),
  }));
}
