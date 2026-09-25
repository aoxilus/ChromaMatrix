/**
 * Roundtrip Test for ChromaMatrix:
 * Encode string -> Render RGBA buffer -> Decode -> Verify exact match
 */

import {
  bytesToSymbols,
  encodeChromaMatrix,
  matrixToRgbaBuffer,
  symbolsToBytes
} from '../src/core/encoder.js';
import { decodeChromaMatrix } from '../src/core/decoder.js';
import { PALETTE_MODES } from '../src/core/palette.js';
import { PNG } from 'pngjs';

console.log('--- Running ChromaMatrix Roundtrip Tests ---');

// Test 1: High-reliability 8-color mode
{
  const text = 'ChromaMatrix 2026: Paper Data Storage Works!';
  console.log(`[Test 1] Encoding with PALETTE_8: "${text}"`);

  const matrix = encodeChromaMatrix(text, { mode: PALETTE_MODES.PALETTE_8, eccRatio: 0.25 });
  console.log(`Grid Size: ${matrix.gridSize}x${matrix.gridSize}, Total Codewords: ${matrix.totalCodewordBytes}`);

  const imgBuffer = matrixToRgbaBuffer(matrix, { cellSize: 16, margin: 2, dotShape: 'circle' });
  console.log(`Rendered Image: ${imgBuffer.width}x${imgBuffer.height} px`);

  // Decode directly from rendered image buffer
  const decoded = decodeChromaMatrix(imgBuffer);
  if (!decoded.success) {
    throw new Error(`Decode failed: ${decoded.error}`);
  }

  console.log(`Decoded Text: "${decoded.text}" (Corrected errors: ${decoded.correctedErrors}, Avg ΔE: ${decoded.avgDeltaE.toFixed(2)})`);
  if (decoded.text !== text) {
    throw new Error(`Text mismatch! Expected "${text}", got "${decoded.text}"`);
  }
  console.log('✓ Test 1: PALETTE_8 clean roundtrip passed');
}

// Test 2: 16-color mode with noise & color jitter
{
  const text = 'Secure Optical Barcode on Paper with RS-ECC and CIELAB Calibration.';
  console.log(`[Test 2] Encoding with PALETTE_16: "${text}"`);

  const matrix = encodeChromaMatrix(text, { mode: PALETTE_MODES.PALETTE_16, eccRatio: 0.25 });
  const imgBuffer = matrixToRgbaBuffer(matrix, { cellSize: 16, margin: 2, dotShape: 'circle' });

  // Simulate optical sensor noise, slight color drift, and paper background tint
  const noisy = {
    width: imgBuffer.width,
    height: imgBuffer.height,
    data: new Uint8ClampedArray(imgBuffer.data)
  };

  for (let i = 0; i < noisy.data.length; i += 4) {
    // Add warm yellow light tint (slight R and G boost, B drop)
    noisy.data[i] = Math.min(255, Math.max(0, noisy.data[i] + 5 + Math.floor((Math.random() - 0.5) * 8)));
    noisy.data[i + 1] = Math.min(255, Math.max(0, noisy.data[i + 1] + 3 + Math.floor((Math.random() - 0.5) * 8)));
    noisy.data[i + 2] = Math.min(255, Math.max(0, noisy.data[i + 2] - 5 + Math.floor((Math.random() - 0.5) * 8)));
  }

  const decoded = decodeChromaMatrix(noisy);
  if (!decoded.success) {
    throw new Error(`Decode with noise failed: ${decoded.error}`);
  }

  console.log(`Decoded Text: "${decoded.text}" (Corrected errors: ${decoded.correctedErrors}, Avg ΔE: ${decoded.avgDeltaE.toFixed(2)})`);
  if (decoded.text !== text) {
    throw new Error(`Text mismatch! Expected "${text}", got "${decoded.text}"`);
  }
  console.log('✓ Test 2: PALETTE_16 with noise & color drift passed');
}

// Test 3: ASCII 95 direct character assignment mode
{
  const text = 'Direct ASCII: 12345 ABCDEF !@#$%^&*()';
  console.log(`[Test 3] Encoding with PALETTE_ASCII_95: "${text}"`);

  const matrix = encodeChromaMatrix(text, { mode: PALETTE_MODES.PALETTE_ASCII_95, eccRatio: 0.3 });
  const imgBuffer = matrixToRgbaBuffer(matrix, { cellSize: 18, margin: 2, dotShape: 'circle' });

  const decoded = decodeChromaMatrix(imgBuffer);
  if (!decoded.success) {
    throw new Error(`Decode ASCII_95 failed: ${decoded.error}`);
  }

  console.log(`Decoded Text: "${decoded.text}" (Corrected errors: ${decoded.correctedErrors})`);
  if (decoded.text !== text) {
    throw new Error(`Text mismatch! Expected "${text}", got "${decoded.text}"`);
  }
  console.log('✓ Test 3: PALETTE_ASCII_95 roundtrip passed');
}

// Test 4: ASCII-95 must preserve arbitrary RS bytes through an actual PNG.
{
  const payload = Uint8Array.from({ length: 257 }, (_, i) => i & 0xFF);
  console.log('[Test 4] Encoding arbitrary binary data with PALETTE_ASCII_95 through PNG');

  const directSymbols = bytesToSymbols(payload, PALETTE_MODES.PALETTE_ASCII_95);
  const directRoundtrip = symbolsToBytes(directSymbols, PALETTE_MODES.PALETTE_ASCII_95);
  if (directRoundtrip.length !== payload.length ||
      directRoundtrip.some((value, index) => value !== payload[index])) {
    throw new Error('ASCII_95 direct binary symbol roundtrip failed');
  }

  const matrix = encodeChromaMatrix(payload, {
    mode: PALETTE_MODES.PALETTE_ASCII_95,
    eccRatio: 0.5
  });
  const rendered = matrixToRgbaBuffer(matrix, { cellSize: 16, margin: 2, dotShape: 'circle' });
  const png = new PNG({ width: rendered.width, height: rendered.height });
  png.data.set(rendered.data);
  const pngBytes = PNG.sync.write(png);
  const decodedPng = PNG.sync.read(pngBytes);
  const decoded = decodeChromaMatrix({
    width: decodedPng.width,
    height: decodedPng.height,
    data: decodedPng.data
  });

  if (!decoded.success) {
    throw new Error(`ASCII_95 PNG decode failed: ${decoded.error}`);
  }
  if (decoded.data.length !== payload.length) {
    throw new Error(`Binary length mismatch: expected ${payload.length}, got ${decoded.data.length}`);
  }
  for (let i = 0; i < payload.length; i++) {
    if (decoded.data[i] !== payload[i]) {
      throw new Error(`Binary mismatch at byte ${i}: expected ${payload[i]}, got ${decoded.data[i]}`);
    }
  }
  console.log(`✓ Test 4: ASCII_95 binary-safe PNG roundtrip passed (${matrix.symbolCount} symbols)`);
}

console.log('All ChromaMatrix Roundtrip Tests passed successfully!');
