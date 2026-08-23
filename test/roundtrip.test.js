/**
 * Roundtrip Test for ChromaMatrix:
 * Encode string -> Render RGBA buffer -> Decode -> Verify exact match
 */

import { encodeChromaMatrix, matrixToRgbaBuffer } from '../src/core/encoder.js';
import { decodeChromaMatrix } from '../src/core/decoder.js';
import { PALETTE_MODES } from '../src/core/palette.js';

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

console.log('All ChromaMatrix Roundtrip Tests passed successfully!');
