/**
 * Compression tests:
 * Brotli/GZIP compress before RS-ECC and transparently decompress after decode.
 */

import {
  COMPRESSION_MODES,
  compressBytes,
  decompressBytes
} from '../src/core/compression.js';
import { encodeChromaMatrixAsync, matrixToRgbaBuffer } from '../src/core/encoder.js';
import { decodeChromaMatrixAsync } from '../src/core/decoder.js';
import { PALETTE_MODES } from '../src/core/palette.js';
import {
  createBinaryLocator,
  decodeBinaryLocator,
  BINARY_LOCATOR_TEXT
} from '../src/core/binary-locator.js';

console.log('--- Running Compression Tests ---');

const text = 'ChromaMatrix compression test '.repeat(80);
const input = new TextEncoder().encode(text);

const binaryLocator = createBinaryLocator();
const locatorInfo = decodeBinaryLocator(binaryLocator.payload);
if (locatorInfo !== BINARY_LOCATOR_TEXT || binaryLocator.footprint !== BINARY_LOCATOR_TEXT.length * 8) {
  throw new Error('Binary ChromaMatrix locator configuration is invalid');
}
console.log(`✓ Horizontal binary ChromaMatrix locator generated (${binaryLocator.footprint} bits)`);

for (const mode of [COMPRESSION_MODES.GZIP, COMPRESSION_MODES.BROTLI]) {
  const compressed = await compressBytes(input, mode);
  const restored = await decompressBytes(compressed, mode);
  if (new TextDecoder().decode(restored) !== text) {
    throw new Error(`${mode} direct roundtrip failed`);
  }
  if (compressed.length >= input.length) {
    throw new Error(`${mode} did not reduce the repetitive test payload`);
  }
  console.log(`✓ ${mode} direct roundtrip: ${input.length} B -> ${compressed.length} B`);
}

const defaultMatrix = await encodeChromaMatrixAsync(text, {
  mode: PALETTE_MODES.PALETTE_16,
  eccRatio: 0.25
});
if (defaultMatrix.compression !== COMPRESSION_MODES.BROTLI) {
  throw new Error('Brotli is not the default compression mode');
}
console.log('✓ Brotli is the default async encoder compression');

for (const mode of [COMPRESSION_MODES.GZIP, COMPRESSION_MODES.BROTLI]) {
  const matrix = await encodeChromaMatrixAsync(text, {
    mode: PALETTE_MODES.PALETTE_16,
    eccRatio: 0.25,
    compression: mode
  });
  const image = matrixToRgbaBuffer(matrix, { cellSize: 16, margin: 2 });
  const decoded = await decodeChromaMatrixAsync(image);
  if (!decoded.success || decoded.text !== text) {
    throw new Error(`${mode} matrix roundtrip failed: ${decoded.error || decoded.text}`);
  }
  if (decoded.compression !== mode) {
    throw new Error(`${mode} compression metadata was not preserved`);
  }
  console.log(`✓ ${mode} matrix roundtrip: ${matrix.originalByteLength} B -> ${matrix.rawByteLength} B`);
}

console.log('All Compression Tests passed successfully!');
