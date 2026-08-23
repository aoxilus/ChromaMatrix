/**
 * ChromaMatrix - Printer & Scanner Color Fidelity Benchmark Engine
 * Generates calibration test target sheets, analyzes scanned photos,
 * calculates printer gamut shift, confusion matrices, and recommends optimal palettes.
 */

import { rgbToLab, deltaE2000, rgbToHex, normalizeWhiteBalance } from './colorspace.js';
import { PALETTE_MODES, getPalette } from './palette.js';
import { detectCornerFiducials, rectifyMatrix, sampleCellMedian } from './decoder.js';

export const BENCHMARK_MODES = {
  TEST_16: 'TEST_16',   // 16-color test pattern
  TEST_64: 'TEST_64',   // 64-color gamut sweep
  TEST_256: 'TEST_256'  // 256-color full matrix
};

/**
 * Generate a calibration test target model
 */
export function generateBenchmarkTarget(mode = BENCHMARK_MODES.TEST_64) {
  let paletteMode = PALETTE_MODES.PALETTE_64;
  let cols = 8;
  let rows = 8;

  if (mode === BENCHMARK_MODES.TEST_16) {
    paletteMode = PALETTE_MODES.PALETTE_16;
    cols = 4;
    rows = 4;
  } else if (mode === BENCHMARK_MODES.TEST_256) {
    paletteMode = PALETTE_MODES.PALETTE_256;
    cols = 16;
    rows = 16;
  }

  const palette = getPalette(paletteMode);
  const patches = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx < palette.length) {
        patches.push({
          index: idx,
          col: c,
          row: r,
          expectedRgb: palette[idx].rgb,
          expectedHex: palette[idx].hex,
          expectedLab: palette[idx].lab,
          name: palette[idx].name
        });
      }
    }
  }

  return {
    mode,
    paletteMode,
    cols,
    rows,
    patchCount: patches.length,
    patches
  };
}

/**
 * Render Benchmark Target to SVG string for high-res printing
 */
export function benchmarkTargetToSvg(targetModel, options = {}) {
  const { cols, rows, patches } = targetModel;
  const cellSize = options.cellSize || 36;
  const margin = options.margin !== undefined ? options.margin : 3;

  const totalCols = cols + margin * 2;
  const totalRows = rows + margin * 2;
  const width = totalCols * cellSize;
  const height = totalRows * cellSize;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svg += `  <rect width="100%" height="100%" fill="#FFFFFF"/>\n`;

  // Draw 4 corner fiducial squares (black)
  const fidSize = cellSize * 2;
  svg += `  <!-- Corner Fiducials -->\n`;
  svg += `  <rect x="${cellSize * 0.5}" y="${cellSize * 0.5}" width="${fidSize}" height="${fidSize}" fill="#000000"/>\n`;
  svg += `  <rect x="${width - cellSize * 2.5}" y="${cellSize * 0.5}" width="${fidSize}" height="${fidSize}" fill="#000000"/>\n`;
  svg += `  <rect x="${cellSize * 0.5}" y="${height - cellSize * 2.5}" width="${fidSize}" height="${fidSize}" fill="#000000"/>\n`;
  svg += `  <rect x="${width - cellSize * 2.5}" y="${height - cellSize * 2.5}" width="${fidSize}" height="${fidSize}" fill="#000000"/>\n`;

  // Inner white/black markers inside fiducials for orientation
  svg += `  <rect x="${cellSize}" y="${cellSize}" width="${cellSize}" height="${cellSize}" fill="#FFFFFF"/>\n`;
  svg += `  <rect x="${width - cellSize * 2}" y="${cellSize}" width="${cellSize}" height="${cellSize}" fill="#FFFFFF"/>\n`;
  svg += `  <rect x="${cellSize}" y="${height - cellSize * 2}" width="${cellSize}" height="${cellSize}" fill="#FFFFFF"/>\n`;
  svg += `  <circle cx="${width - cellSize * 1.5}" cy="${height - cellSize * 1.5}" r="${cellSize * 0.4}" fill="#FFFFFF"/>\n`;

  // Title
  svg += `  <text x="${width / 2}" y="${cellSize * 1.5}" font-family="sans-serif" font-size="${cellSize * 0.4}" font-weight="bold" text-anchor="middle" fill="#111827">CHROMAMATRIX PRINTER COLOR CALIBRATION TARGET (${targetModel.mode})</text>\n`;

  // Draw Color Patches
  for (const patch of patches) {
    const px = (patch.col + margin) * cellSize;
    const py = (patch.row + margin) * cellSize;
    const patchSize = cellSize * 0.88;
    const offset = (cellSize - patchSize) / 2;

    svg += `  <rect x="${px + offset}" y="${py + offset}" width="${patchSize}" height="${patchSize}" fill="${patch.expectedHex}" stroke="#E5E7EB" stroke-width="1"/>\n`;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Render Benchmark Target to RGBA Pixel Buffer
 */
export function benchmarkTargetToRgbaBuffer(targetModel, options = {}) {
  const { cols, rows, patches } = targetModel;
  const cellSize = options.cellSize || 36;
  const margin = options.margin !== undefined ? options.margin : 3;

  const totalCols = cols + margin * 2;
  const totalRows = rows + margin * 2;
  const width = totalCols * cellSize;
  const height = totalRows * cellSize;
  const buffer = new Uint8ClampedArray(width * height * 4);
  buffer.fill(255);

  const fidSize = cellSize * 2;

  function fillRect(rx, ry, rw, rh, r, g, b) {
    for (let y = ry; y < ry + rh; y++) {
      for (let x = rx; x < rx + rw; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4;
          buffer[idx] = r;
          buffer[idx + 1] = g;
          buffer[idx + 2] = b;
          buffer[idx + 3] = 255;
        }
      }
    }
  }

  // Draw 4 corner fiducials
  fillRect(Math.round(cellSize * 0.5), Math.round(cellSize * 0.5), fidSize, fidSize, 0, 0, 0);
  fillRect(Math.round(width - cellSize * 2.5), Math.round(cellSize * 0.5), fidSize, fidSize, 0, 0, 0);
  fillRect(Math.round(cellSize * 0.5), Math.round(height - cellSize * 2.5), fidSize, fidSize, 0, 0, 0);
  fillRect(Math.round(width - cellSize * 2.5), Math.round(height - cellSize * 2.5), fidSize, fidSize, 0, 0, 0);

  // Draw Patches
  const patchSize = Math.round(cellSize * 0.88);
  const offset = Math.round((cellSize - patchSize) / 2);

  for (const patch of patches) {
    const px = (patch.col + margin) * cellSize + offset;
    const py = (patch.row + margin) * cellSize + offset;
    fillRect(px, py, patchSize, patchSize, patch.expectedRgb.r, patch.expectedRgb.g, patch.expectedRgb.b);
  }

  return { width, height, data: buffer };
}

/**
 * Analyze a scanned or photographed benchmark target
 */
export function analyzeBenchmarkScan(scannedImageData, targetModel, options = {}) {
  let corners = options.corners;
  if (!corners) {
    const det = detectCornerFiducials(scannedImageData);
    corners = det.corners;
  }

  const res = options.rectifyResolution || 600;
  const rectified = rectifyMatrix(scannedImageData, corners, res);

  const { cols, rows, patches } = targetModel;
  const margin = 3;
  const totalCols = cols + margin * 2;
  const totalRows = rows + margin * 2;

  // Normalized coordinate mapper
  const getPatchCenter = (col, row) => ({
    cx: ((col + margin) / (totalCols - 1)) * res,
    cy: ((row + margin) / (totalRows - 1)) * res
  });

  // Sample Paper White and Black Reference
  const paperWhiteSample = sampleCellMedian(rectified, (2.25 / (totalCols - 1)) * res, (2.25 / (totalRows - 1)) * res, 3);
  const blackRefSample = sampleCellMedian(rectified, (1.0 / (totalCols - 1)) * res, (1.0 / (totalRows - 1)) * res, 3);

  const patchResults = [];
  let totalDeltaE = 0;
  let maxDeltaE = 0;

  for (const patch of patches) {
    const { cx, cy } = getPatchCenter(patch.col, patch.row);
    const rawRgb = sampleCellMedian(rectified, cx, cy, 3);
    const normRgb = normalizeWhiteBalance(rawRgb, paperWhiteSample, blackRefSample);
    const measuredLab = rgbToLab(normRgb.r, normRgb.g, normRgb.b);
    const dE = deltaE2000(measuredLab, patch.expectedLab);

    totalDeltaE += dE;
    if (dE > maxDeltaE) maxDeltaE = dE;

    patchResults.push({
      index: patch.index,
      name: patch.name,
      col: patch.col,
      row: patch.row,
      expectedRgb: patch.expectedRgb,
      expectedHex: patch.expectedHex,
      expectedLab: patch.expectedLab,
      measuredRawRgb: rawRgb,
      measuredNormRgb: normRgb,
      measuredHex: rgbToHex(normRgb.r, normRgb.g, normRgb.b),
      measuredLab,
      deltaE: dE
    });
  }

  const n = patchResults.length;
  const confusionPairs = [];
  const interColorDistances = Array.from({ length: n }, () => Array(n).fill(0));
  let minInterDistance = Infinity;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const d = deltaE2000(patchResults[i].measuredLab, patchResults[j].measuredLab);
      interColorDistances[i][j] = d;
      interColorDistances[j][i] = d;

      if (d < minInterDistance) minInterDistance = d;

      if (d < 6.0) {
        confusionPairs.push({
          colorA: patchResults[i],
          colorB: patchResults[j],
          measuredDeltaE: d
        });
      }
    }
  }

  const avgShift = n > 0 ? (totalDeltaE / n) : 0;
  let recommendedMode = PALETTE_MODES.PALETTE_16;
  let recommendedBitsPerDot = 4;
  let reliabilityRating = 'Good';

  if (minInterDistance >= 18 && confusionPairs.length === 0) {
    recommendedMode = PALETTE_MODES.PALETTE_64;
    recommendedBitsPerDot = 6;
    reliabilityRating = 'Excellent (High Gamut)';
  } else if (minInterDistance >= 10 && confusionPairs.length <= 2) {
    recommendedMode = PALETTE_MODES.PALETTE_16;
    recommendedBitsPerDot = 4;
    reliabilityRating = 'Standard Reliable (4-bit nibbles)';
  } else {
    recommendedMode = PALETTE_MODES.PALETTE_8;
    recommendedBitsPerDot = 3;
    reliabilityRating = 'Ultra-Reliable High Contrast (3-bit)';
  }

  return {
    mode: targetModel.mode,
    patchCount: n,
    avgGamutShiftDeltaE: avgShift,
    maxGamutShiftDeltaE: maxDeltaE,
    minPhysicalSeparationDeltaE: minInterDistance,
    confusionPairCount: confusionPairs.length,
    confusionPairs,
    recommendedMode,
    recommendedBitsPerDot,
    reliabilityRating,
    paperWhiteSample,
    blackRefSample,
    patchResults,
    interColorDistances
  };
}
