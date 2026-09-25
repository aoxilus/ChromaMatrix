/**
 * Real PNG integration diagnostics for every color palette.
 *
 * Generates a PNG, writes it to disk, reads it back through pngjs, and runs
 * the same decoder path used by the CLI. This catches regressions that a
 * direct in-memory RGBA roundtrip would miss.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import {
  encodeChromaMatrixAsync,
  matrixToRgbaBuffer
} from '../src/core/encoder.js';
import { decodeChromaMatrixAsync } from '../src/core/decoder.js';
import { PALETTE_MODES } from '../src/core/palette.js';
import { COMPRESSION_MODES } from '../src/core/compression.js';

console.log('--- Running PNG Palette Diagnostics ---');

const payload =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' +
  'Curabitur eget leo id eros sodales dictum. '.repeat(12);

const palettes = [
  PALETTE_MODES.PALETTE_8,
  PALETTE_MODES.PALETTE_16,
  PALETTE_MODES.PALETTE_64,
  PALETTE_MODES.PALETTE_ASCII_95,
  PALETTE_MODES.PALETTE_256
];

const compressions = [
  COMPRESSION_MODES.NONE,
  COMPRESSION_MODES.GZIP,
  COMPRESSION_MODES.BROTLI
];

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chromamatrix-palette-'));
const results = [];
const unexpectedFailures = [];

try {
  for (const mode of palettes) {
    for (const compression of compressions) {
      const matrix = await encodeChromaMatrixAsync(payload, {
        mode,
        compression,
        eccRatio: 0.25
      });
      const rgba = matrixToRgbaBuffer(matrix, {
        cellSize: 8,
        margin: 2,
        dotShape: 'circle'
      });
      const png = new PNG({ width: rgba.width, height: rgba.height });
      png.data = Buffer.from(rgba.data);
      const imagePath = path.join(tempDir, `${mode}-${compression}.png`);
      fs.writeFileSync(imagePath, PNG.sync.write(png));

      const decodedPng = PNG.sync.read(fs.readFileSync(imagePath));
      const decoded = await decodeChromaMatrixAsync({
        width: decodedPng.width,
        height: decodedPng.height,
        data: new Uint8ClampedArray(decodedPng.data)
      });
      const passed = decoded.success && decoded.text === payload;
      const result = {
        mode,
        compression,
        grid: `${matrix.gridSize}x${matrix.gridSize}`,
        image: `${decodedPng.width}x${decodedPng.height}`,
        passed,
        error: passed ? null : decoded.error || 'decoded text mismatch'
      };
      results.push(result);

      if (!passed) {
        unexpectedFailures.push(result);
      }
    }
  }
} finally {
  if (process.env.KEEP_TEST_ARTIFACTS !== '1') {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

if (process.env.KEEP_TEST_ARTIFACTS === '1') {
  console.log(`PNG artifacts retained for inspection: ${tempDir}`);
}

for (const result of results) {
  if (result.passed) {
    console.log(
      `✓ ${result.mode} + ${result.compression}: PNG ${result.image}, grid ${result.grid}`
    );
  } else {
    console.log(`✗ ${result.mode} + ${result.compression}: ${result.error}`);
  }
}

const passed = results.filter(result => result.passed).length;
console.log(
  `PNG diagnostics: ${passed}/${results.length} passed; ` +
  `${unexpectedFailures.length} failure(s).`
);

if (unexpectedFailures.length > 0) {
  throw new Error(
    `PNG palette diagnostics found ${unexpectedFailures.length} unexpected failure(s).`
  );
}

console.log('PNG palette diagnostics completed with no failures.');
