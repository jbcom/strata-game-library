import { describe, expect, it } from 'vitest';
import {
  adler32,
  asciiBytes,
  concatBytes,
  crc32,
  encodeMaterialProceduralBakeImagePng,
  encodeMaterialProceduralBakeRasterPng,
  PNG_SIGNATURE,
  pngChunk,
  pngFileName,
  pngScanlines,
  uint32Bytes,
  zlibNoCompression,
} from '../png';
import type { MaterialProceduralBakeRaster, MaterialProceduralBakeRasterImage } from '../types';

const makeImage = (width: number, height: number, fill = 0): MaterialProceduralBakeRasterImage =>
  ({
    targetId: 't',
    channel: 'baseColor',
    map: 'diffuse',
    fileName: 'mat.baseColor.png',
    colorSpace: 'srgb',
    width,
    height,
    data: new Uint8ClampedArray(width * height * 4).fill(fill),
  }) as MaterialProceduralBakeRasterImage;

const readUint32 = (bytes: Uint8Array, offset: number): number =>
  ((bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]) >>>
  0;

describe('asciiBytes', () => {
  it('encodes ASCII one byte per character', () => {
    expect(Array.from(asciiBytes('IHDR'))).toEqual([73, 72, 68, 82]);
  });

  it('returns an empty array for an empty string', () => {
    expect(asciiBytes('')).toHaveLength(0);
  });
});

describe('uint32Bytes', () => {
  it('writes big-endian byte order', () => {
    expect(Array.from(uint32Bytes(0x01020304))).toEqual([1, 2, 3, 4]);
  });

  it('encodes zero as four zero bytes', () => {
    expect(Array.from(uint32Bytes(0))).toEqual([0, 0, 0, 0]);
  });

  it('encodes the maximum 32-bit value', () => {
    expect(Array.from(uint32Bytes(0xffffffff))).toEqual([255, 255, 255, 255]);
  });

  it('round-trips through a big-endian read', () => {
    for (const value of [0, 1, 255, 256, 65_535, 16_777_216, 4_294_967_295]) {
      expect(readUint32(uint32Bytes(value), 0)).toBe(value);
    }
  });
});

describe('concatBytes', () => {
  it('joins chunks in order', () => {
    const joined = concatBytes([
      new Uint8Array([1, 2]),
      new Uint8Array([3]),
      new Uint8Array([4, 5]),
    ]);

    expect(Array.from(joined)).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns an empty buffer for no chunks', () => {
    expect(concatBytes([])).toHaveLength(0);
  });

  it('ignores empty chunks without disturbing the offsets', () => {
    const joined = concatBytes([new Uint8Array([1]), new Uint8Array(), new Uint8Array([2])]);

    expect(Array.from(joined)).toEqual([1, 2]);
  });
});

describe('crc32', () => {
  it('matches the known CRC-32 of "IEND"', () => {
    // The IEND chunk CRC is a fixed, published PNG constant.
    expect(crc32(asciiBytes('IEND'))).toBe(0xae426082);
  });

  it('matches the known CRC-32 of the ASCII string "123456789"', () => {
    expect(crc32(asciiBytes('123456789'))).toBe(0xcbf43926);
  });

  it('returns zero for empty input', () => {
    expect(crc32(new Uint8Array())).toBe(0);
  });

  it('always returns an unsigned 32-bit value', () => {
    for (const input of ['a', 'IDAT', 'IHDR', 'zzzzzzzz']) {
      const value = crc32(asciiBytes(input));
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(0xffffffff);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('differs for inputs that differ by a single bit', () => {
    expect(crc32(new Uint8Array([0]))).not.toBe(crc32(new Uint8Array([1])));
  });
});

describe('adler32', () => {
  it('returns 1 for empty input, per the specification', () => {
    expect(adler32(new Uint8Array())).toBe(1);
  });

  it('matches the known Adler-32 of "Wikipedia"', () => {
    expect(adler32(asciiBytes('Wikipedia'))).toBe(0x11e60398);
  });

  it('packs b into the high half and a into the low half', () => {
    const value = adler32(new Uint8Array([255]));

    expect(value & 0xffff).toBe(256);
    expect(value >>> 16).toBe(256);
  });

  it('stays unsigned for long inputs that would overflow a signed shift', () => {
    const value = adler32(new Uint8Array(10_000).fill(255));

    expect(value).toBeGreaterThanOrEqual(0);
  });
});

describe('pngChunk', () => {
  it('frames length, type, payload, and CRC', () => {
    const chunk = pngChunk('IDAT', new Uint8Array([1, 2, 3]));

    expect(readUint32(chunk, 0)).toBe(3);
    expect(Array.from(chunk.slice(4, 8))).toEqual(Array.from(asciiBytes('IDAT')));
    expect(Array.from(chunk.slice(8, 11))).toEqual([1, 2, 3]);
    expect(chunk).toHaveLength(12 + 3);
  });

  it('computes the CRC over type and data together, not data alone', () => {
    const chunk = pngChunk('IDAT', new Uint8Array([1, 2, 3]));
    const expected = crc32(concatBytes([asciiBytes('IDAT'), new Uint8Array([1, 2, 3])]));

    expect(readUint32(chunk, chunk.length - 4)).toBe(expected);
  });

  it('emits a valid zero-length chunk when no data is given', () => {
    const chunk = pngChunk('IEND');

    expect(chunk).toHaveLength(12);
    expect(readUint32(chunk, 0)).toBe(0);
    expect(readUint32(chunk, 8)).toBe(0xae426082);
  });
});

describe('zlibNoCompression', () => {
  it('starts with the 0x78 0x01 zlib header', () => {
    const out = zlibNoCompression(new Uint8Array([1, 2, 3]));

    expect(out[0]).toBe(0x78);
    expect(out[1]).toBe(0x01);
  });

  it('ends with the Adler-32 checksum of the input', () => {
    const data = new Uint8Array([9, 8, 7, 6]);
    const out = zlibNoCompression(data);

    expect(readUint32(out, out.length - 4)).toBe(adler32(data));
  });

  it('marks a single small block as final and stores the data verbatim', () => {
    const data = new Uint8Array([10, 20, 30]);
    const out = zlibNoCompression(data);

    expect(out[2]).toBe(1);
    expect(out[3] | (out[4] << 8)).toBe(3);
    expect(Array.from(out.slice(7, 10))).toEqual([10, 20, 30]);
  });

  it('writes the one-s complement of the length after the length', () => {
    const out = zlibNoCompression(new Uint8Array(3));
    const length = out[3] | (out[4] << 8);
    const inverted = out[5] | (out[6] << 8);

    expect(inverted).toBe(~length & 0xffff);
  });

  it('splits input larger than one stored block and marks only the last as final', () => {
    const data = new Uint8Array(70_000).fill(7);
    const out = zlibNoCompression(data);

    // header(2) + block1(5 + 65535) + block2(5 + 4465) + adler(4)
    expect(out).toHaveLength(2 + 5 + 65_535 + 5 + 4_465 + 4);
    expect(out[2]).toBe(0);
    expect(out[2 + 5 + 65_535]).toBe(1);
  });

  it('produces a header-plus-checksum stream for empty input', () => {
    const out = zlibNoCompression(new Uint8Array());

    expect(out).toHaveLength(6);
    expect(readUint32(out, 2)).toBe(1);
  });
});

describe('pngScanlines', () => {
  it('prefixes each row with a zero filter byte', () => {
    const image = makeImage(2, 2, 9);
    const scanlines = pngScanlines(image);
    const stride = 2 * 4;

    expect(scanlines).toHaveLength((stride + 1) * 2);
    expect(scanlines[0]).toBe(0);
    expect(scanlines[stride + 1]).toBe(0);
  });

  it('copies row pixel data immediately after each filter byte', () => {
    const image = makeImage(1, 2);
    image.data.set([1, 2, 3, 4], 0);
    image.data.set([5, 6, 7, 8], 4);

    const scanlines = pngScanlines(image);

    expect(Array.from(scanlines.slice(1, 5))).toEqual([1, 2, 3, 4]);
    expect(Array.from(scanlines.slice(6, 10))).toEqual([5, 6, 7, 8]);
  });

  it('returns an empty buffer for a zero-height image', () => {
    expect(pngScanlines(makeImage(4, 0))).toHaveLength(0);
  });
});

describe('pngFileName', () => {
  it('rewrites any extension to .png', () => {
    expect(pngFileName('mat.baseColor.webp')).toBe('mat.baseColor.png');
    expect(pngFileName('mat.roughness.ktx2')).toBe('mat.roughness.png');
  });

  it('leaves an existing .png extension in place', () => {
    expect(pngFileName('mat.normal.png')).toBe('mat.normal.png');
  });

  it('appends nothing when there is no extension to replace', () => {
    expect(pngFileName('noextension')).toBe('noextension');
  });

  it('only replaces the final extension segment', () => {
    expect(pngFileName('a.b.c.webp')).toBe('a.b.c.png');
  });
});

describe('encodeMaterialProceduralBakeImagePng', () => {
  it('starts with the eight-byte PNG signature', () => {
    const png = encodeMaterialProceduralBakeImagePng(makeImage(2, 2));

    expect(Array.from(png.slice(0, 8))).toEqual(Array.from(PNG_SIGNATURE));
  });

  it('writes width, height, bit depth 8, and colour type 6 into IHDR', () => {
    const png = encodeMaterialProceduralBakeImagePng(makeImage(3, 5));

    expect(readUint32(png, 16)).toBe(3);
    expect(readUint32(png, 20)).toBe(5);
    expect(png[24]).toBe(8);
    expect(png[25]).toBe(6);
    expect(png[26]).toBe(0);
    expect(png[27]).toBe(0);
    expect(png[28]).toBe(0);
  });

  it('declares an IHDR payload of exactly 13 bytes', () => {
    const png = encodeMaterialProceduralBakeImagePng(makeImage(2, 2));

    expect(readUint32(png, 8)).toBe(13);
    expect(Array.from(png.slice(12, 16))).toEqual(Array.from(asciiBytes('IHDR')));
  });

  it('emits IHDR, IDAT, and IEND in that order', () => {
    const png = encodeMaterialProceduralBakeImagePng(makeImage(2, 2));
    const text = Array.from(png, (byte) => String.fromCharCode(byte)).join('');

    expect(text.indexOf('IHDR')).toBeGreaterThan(-1);
    expect(text.indexOf('IDAT')).toBeGreaterThan(text.indexOf('IHDR'));
    expect(text.indexOf('IEND')).toBeGreaterThan(text.indexOf('IDAT'));
  });

  it('terminates with a well-formed IEND chunk', () => {
    const png = encodeMaterialProceduralBakeImagePng(makeImage(2, 2));

    expect(Array.from(png.slice(-12))).toEqual(Array.from(pngChunk('IEND')));
  });

  it('gives every chunk a CRC that validates', () => {
    const png = encodeMaterialProceduralBakeImagePng(makeImage(4, 4));
    let offset = 8;

    while (offset < png.length) {
      const length = readUint32(png, offset);
      const payload = png.slice(offset + 4, offset + 8 + length);
      expect(readUint32(png, offset + 8 + length)).toBe(crc32(payload));
      offset += 12 + length;
    }

    expect(offset).toBe(png.length);
  });

  it('is deterministic for identical input', () => {
    const image = makeImage(4, 4, 128);

    expect(Array.from(encodeMaterialProceduralBakeImagePng(image))).toEqual(
      Array.from(encodeMaterialProceduralBakeImagePng(image))
    );
  });

  it('produces different bytes for different pixel data', () => {
    const a = encodeMaterialProceduralBakeImagePng(makeImage(2, 2, 0));
    const b = encodeMaterialProceduralBakeImagePng(makeImage(2, 2, 255));

    expect(Array.from(a)).not.toEqual(Array.from(b));
  });

  it('encodes a 1x1 image without error', () => {
    const png = encodeMaterialProceduralBakeImagePng(makeImage(1, 1));

    expect(readUint32(png, 16)).toBe(1);
    expect(readUint32(png, 20)).toBe(1);
  });
});

describe('encodeMaterialProceduralBakeRasterPng', () => {
  const raster = (images: MaterialProceduralBakeRasterImage[]) =>
    ({
      materialId: 'mat',
      textureSize: [2, 2],
      images,
      manifest: { version: 1, materialId: 'mat', textureSize: [2, 2], targets: [] },
    }) as MaterialProceduralBakeRaster;

  it('encodes one entry per raster image', () => {
    const encoded = encodeMaterialProceduralBakeRasterPng(
      raster([makeImage(2, 2), makeImage(2, 2)])
    );

    expect(encoded).toHaveLength(2);
  });

  it('forces the png mime type and extension regardless of the source name', () => {
    const image = { ...makeImage(2, 2), fileName: 'mat.baseColor.webp' };
    const [encoded] = encodeMaterialProceduralBakeRasterPng(raster([image]));

    expect(encoded.mimeType).toBe('image/png');
    expect(encoded.fileName).toBe('mat.baseColor.png');
  });

  it('carries target metadata through to each encoded entry', () => {
    const [encoded] = encodeMaterialProceduralBakeRasterPng(raster([makeImage(2, 2)]));

    expect(encoded.targetId).toBe('t');
    expect(encoded.channel).toBe('baseColor');
    expect(encoded.map).toBe('diffuse');
  });

  it('produces byte buffers that begin with the PNG signature', () => {
    const [encoded] = encodeMaterialProceduralBakeRasterPng(raster([makeImage(2, 2)]));

    expect(Array.from(encoded.data.slice(0, 8))).toEqual(Array.from(PNG_SIGNATURE));
  });

  it('returns an empty list for a raster with no images', () => {
    expect(encodeMaterialProceduralBakeRasterPng(raster([]))).toEqual([]);
  });
});
