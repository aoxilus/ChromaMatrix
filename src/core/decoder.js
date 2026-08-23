/**
 * ChromaMatrix - Computer Vision & Optical Decoder Engine
 * Detects corner markers, applies perspective homography unwarping,
 * samples calibration swatches, classifies dot colors, and performs RS-ECC recovery.
 */

import { PALETTE_MODES, getPalette, classifyColor } from './palette.js';
import { decodePayloadRS } from './reedsolomon.js';
import {
  symbolsToBytes,
  getPaletteModeFromId,
  crc16,
  getHeaderCoordinates,
  getCalibrationCoordinates,
  isCellReserved
} from './encoder.js';
import { rgbToLab, normalizeWhiteBalance } from './colorspace.js';

/**
 * Solve 8-DOF Linear System for 4-Point Projective Transformation (Homography)
 */
export function getPerspectiveTransform(srcQuad, dstQuad) {
  const A = [];
  const b = [];

  for (let i = 0; i < 4; i++) {
    const { x: dx, y: dy } = dstQuad[i];
    const { x: sx, y: sy } = srcQuad[i];

    A.push([dx, dy, 1, 0, 0, 0, -dx * sx, -dy * sx]);
    b.push(sx);

    A.push([0, 0, 0, dx, dy, 1, -dx * sy, -dy * sy]);
    b.push(sy);
  }

  const n = 8;
  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > Math.abs(A[maxRow][i])) maxRow = k;
    }
    [A[i], A[maxRow]] = [A[maxRow], A[i]];
    [b[i], b[maxRow]] = [b[maxRow], b[i]];

    for (let k = i + 1; k < n; k++) {
      const factor = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) {
        A[k][j] -= factor * A[i][j];
      }
      b[k] -= factor * b[i];
    }
  }

  const h = new Array(8);
  for (let i = n - 1; i >= 0; i--) {
    let sum = b[i];
    for (let j = i + 1; j < n; j++) {
      sum -= A[i][j] * h[j];
    }
    h[i] = sum / A[i][i];
  }

  return [
    h[0], h[1], h[2],
    h[3], h[4], h[5],
    h[6], h[7], 1.0
  ];
}

/**
 * Apply homography to map point (u, v) to source image coordinate (x, y)
 */
export function applyHomography(H, u, v) {
  const w = H[6] * u + H[7] * v + H[8];
  const x = (H[0] * u + H[1] * v + H[2]) / w;
  const y = (H[3] * u + H[4] * v + H[5]) / w;
  return { x, y };
}

/**
 * Bilinear interpolation sampling from image buffer
 */
export function sampleBilinear(imageData, x, y) {
  const { width, height, data } = imageData;
  if (x < 0 || x >= width - 1 || y < 0 || y >= height - 1) {
    const cx = Math.max(0, Math.min(width - 1, Math.round(x)));
    const cy = Math.max(0, Math.min(height - 1, Math.round(y)));
    const idx = (cy * width + cx) * 4;
    return { r: data[idx], g: data[idx + 1], b: data[idx + 2] };
  }

  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = x0 + 1;
  const y1 = y0 + 1;

  const dx = x - x0;
  const dy = y - y0;

  const idx00 = (y0 * width + x0) * 4;
  const idx10 = (y0 * width + x1) * 4;
  const idx01 = (y1 * width + x0) * 4;
  const idx11 = (y1 * width + x1) * 4;

  const interp = (cOffset) => {
    const v00 = data[idx00 + cOffset];
    const v10 = data[idx10 + cOffset];
    const v01 = data[idx01 + cOffset];
    const v11 = data[idx11 + cOffset];

    const v0 = v00 * (1 - dx) + v10 * dx;
    const v1 = v01 * (1 - dx) + v11 * dx;
    return Math.round(v0 * (1 - dy) + v1 * dy);
  };

  return {
    r: interp(0),
    g: interp(1),
    b: interp(2)
  };
}

/**
 * Auto-detect 4 corner finder markers from an arbitrary image.
 */
export function detectCornerFiducials(imageData) {
  const { width, height, data } = imageData;
  const gray = new Uint8Array(width * height);
  let minLum = 255;
  let maxLum = 0;

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    const lum = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
    gray[i] = lum;
    if (lum < minLum) minLum = lum;
    if (lum > maxLum) maxLum = lum;
  }

  const threshold = minLum + (maxLum - minLum) * 0.40;
  const halfW = Math.floor(width / 2);
  const halfH = Math.floor(height / 2);

  function findCornerInQuadrant(startX, endX, startY, endY, targetDirection) {
    let bestScore = -Infinity;
    let bestPt = { x: (startX + endX) / 2, y: (startY + endY) / 2 };

    for (let y = startY; y < endY; y += 1) {
      for (let x = startX; x < endX; x += 1) {
        const idx = y * width + x;
        if (gray[idx] < threshold) {
          let score = 0;
          if (targetDirection === 'TL') score = -(x + y);
          else if (targetDirection === 'TR') score = (x - y);
          else if (targetDirection === 'BL') score = -(x - y);
          else if (targetDirection === 'BR') score = (x + y);

          if (score > bestScore) {
            bestScore = score;
            bestPt = { x, y };
          }
        }
      }
    }
    return bestPt;
  }

  const tl = findCornerInQuadrant(0, halfW, 0, halfH, 'TL');
  const tr = findCornerInQuadrant(halfW, width, 0, halfH, 'TR');
  const bl = findCornerInQuadrant(0, halfW, halfH, height, 'BL');
  const br = findCornerInQuadrant(halfW, width, halfH, height, 'BR');

  return {
    corners: [tl, tr, br, bl],
    detected: true
  };
}

/**
 * Rectify and unwarp the matrix into canonical coordinates
 */
export function rectifyMatrix(imageData, corners, targetResolution = 600) {
  const dstQuad = [
    { x: 0, y: 0 },
    { x: targetResolution, y: 0 },
    { x: targetResolution, y: targetResolution },
    { x: 0, y: targetResolution }
  ];

  const H = getPerspectiveTransform(corners, dstQuad);
  const rectifiedData = new Uint8ClampedArray(targetResolution * targetResolution * 4);

  for (let y = 0; y < targetResolution; y++) {
    for (let x = 0; x < targetResolution; x++) {
      const srcPt = applyHomography(H, x, y);
      const rgb = sampleBilinear(imageData, srcPt.x, srcPt.y);
      const outIdx = (y * targetResolution + x) * 4;
      rectifiedData[outIdx] = rgb.r;
      rectifiedData[outIdx + 1] = rgb.g;
      rectifiedData[outIdx + 2] = rgb.b;
      rectifiedData[outIdx + 3] = 255;
    }
  }

  return {
    width: targetResolution,
    height: targetResolution,
    data: rectifiedData,
    homography: H
  };
}

/**
 * Sample median RGB from a pixel cluster around (cx, cy)
 */
export function sampleCellMedian(imageData, cx, cy, radius = 2) {
  const { width, height, data } = imageData;
  const rVals = [];
  const gVals = [];
  const bVals = [];

  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const px = Math.round(cx + dx);
      const py = Math.round(cy + dy);
      if (px >= 0 && px < width && py >= 0 && py < height) {
        const idx = (py * width + px) * 4;
        rVals.push(data[idx]);
        gVals.push(data[idx + 1]);
        bVals.push(data[idx + 2]);
      }
    }
  }

  if (rVals.length === 0) return { r: 128, g: 128, b: 128 };

  rVals.sort((a, b) => a - b);
  gVals.sort((a, b) => a - b);
  bVals.sort((a, b) => a - b);

  const mid = Math.floor(rVals.length / 2);
  return {
    r: rVals[mid],
    g: gVals[mid],
    b: bVals[mid]
  };
}

/**
 * Full Decode Pipeline for ChromaMatrix
 */
export function decodeChromaMatrix(imageData, options = {}) {
  let corners = options.corners;
  if (!corners) {
    const det = detectCornerFiducials(imageData);
    corners = det.corners;
  }

  const span = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
  // Adaptive resolution: ensure at least 6-10 pixels per cell even for 200x200 grids
  const res = options.rectifyResolution || Math.max(1200, Math.min(3200, Math.round(span)));
  const rectified = rectifyMatrix(imageData, corners, res);

  const candidateGridSizes = options.gridSize
    ? [options.gridSize]
    : Array.from({ length: 115 }, (_, i) => 25 + i * 2); // 25 to 253!

  let bestResult = null;

  for (const testGridSize of candidateGridSizes) {
    try {
      const cellSize = res / testGridSize;
      const sampleRadius = Math.max(1, Math.min(3, Math.floor(cellSize * 0.22)));

      const getCellCenter = (gx, gy) => ({
        cx: (gx + 0.5) * cellSize,
        cy: (gy + 0.5) * cellSize
      });

      // Sample Paper White and Black references
      const blackRefSample = sampleCellMedian(rectified, 3.5 * cellSize, 3.5 * cellSize, sampleRadius);
      const paperWhiteSample = sampleCellMedian(rectified, 1.5 * cellSize, 1.5 * cellSize, sampleRadius);

      // Header coordinates
      const headerCoords = getHeaderCoordinates(testGridSize);
      const headerSymbols = [];
      for (const coord of headerCoords) {
        const { cx, cy } = getCellCenter(coord.x, coord.y);
        const rawRgb = sampleCellMedian(rectified, cx, cy, sampleRadius);
        const normRgb = normalizeWhiteBalance(rawRgb, paperWhiteSample, blackRefSample);
        const classified = classifyColor(normRgb, PALETTE_MODES.PALETTE_16);
        headerSymbols.push(classified.index);
      }

      const headerBytes = symbolsToBytes(headerSymbols, PALETTE_MODES.PALETTE_16, 13);
      if (headerBytes.length < 13) continue;

      // Verify Magic 'CM'
      if (headerBytes[0] !== 0x43 || headerBytes[1] !== 0x4D) continue;

      // Verify CRC
      const expectedCrc = (headerBytes[11] << 8) | headerBytes[12];
      const actualCrc = crc16(headerBytes.subarray(0, 11));
      if (expectedCrc !== actualCrc) continue;

      // Header is valid!
      const modeId = headerBytes[2];
      const mode = getPaletteModeFromId(modeId);
      const gridSize = headerBytes[3];
      const payloadLength = (headerBytes[4] << 24) | (headerBytes[5] << 16) | (headerBytes[6] << 8) | headerBytes[7];
      const blockCount = headerBytes[8];
      const blockDataLen = headerBytes[9];
      const blockEccLen = headerBytes[10];

      if (gridSize !== testGridSize) continue;

      // Build RS block metadata candidates (Uniform vs Proportional Tail)
      const candidateMetaConfigs = [];

      // Config 1: Proportional tail (standard)
      const metaProportional = [];
      let bytesLeftProp = payloadLength;
      for (let b = 0; b < blockCount; b++) {
        const dLen = Math.min(blockDataLen, bytesLeftProp);
        let ecc = blockEccLen;
        if (b === blockCount - 1 && dLen < blockDataLen) {
          const eccRatio = (blockEccLen / 2) / blockDataLen;
          ecc = Math.max(4, Math.min(64, Math.round(dLen * eccRatio) * 2));
          if (ecc % 2 !== 0) ecc++;
        }
        metaProportional.push({ dataLen: dLen, eccLen: ecc });
        bytesLeftProp -= dLen;
      }
      candidateMetaConfigs.push(metaProportional);

      // Config 2: Uniform ECC across all blocks
      const metaUniform = [];
      let bytesLeftUni = payloadLength;
      for (let b = 0; b < blockCount; b++) {
        const dLen = Math.min(blockDataLen, bytesLeftUni);
        metaUniform.push({ dataLen: dLen, eccLen: blockEccLen });
        bytesLeftUni -= dLen;
      }
      candidateMetaConfigs.push(metaUniform);

      // Config 3: If blockCount > 1 and tail block is shorter, generate sweep of even ECCs for tail
      if (blockCount > 1 && payloadLength % blockDataLen !== 0) {
        const tailDataLen = payloadLength % blockDataLen;
        for (let testEcc = 4; testEcc <= blockEccLen; testEcc += 2) {
          const metaSweep = [];
          let rem = payloadLength;
          for (let b = 0; b < blockCount; b++) {
            const dLen = Math.min(blockDataLen, rem);
            const ecc = (b === blockCount - 1) ? testEcc : blockEccLen;
            metaSweep.push({ dataLen: dLen, eccLen: ecc });
            rem -= dLen;
          }
          candidateMetaConfigs.push(metaSweep);
        }
      }

      // Sample Calibration Reference Swatches
      const palette = getPalette(mode);
      const calibColors = [
        { name: 'Ref-Black', index: -1 },
        { name: 'Ref-White', index: -2 },
        ...palette
      ];

      const calibratedSwatches = [];
      const calibCoords = getCalibrationCoordinates(gridSize, calibColors.length);

      for (let i = 0; i < calibCoords.length && i < calibColors.length; i++) {
        const cCoord = calibCoords[i];
        const { cx, cy } = getCellCenter(cCoord.x, cCoord.y);
        const rgb = sampleCellMedian(rectified, cx, cy, sampleRadius);
        const normRgb = normalizeWhiteBalance(rgb, paperWhiteSample, blackRefSample);
        const lab = rgbToLab(normRgb.r, normRgb.g, normRgb.b);

        const colorMeta = calibColors[i];
        if (colorMeta && colorMeta.index >= 0) {
          calibratedSwatches[colorMeta.index] = { ...normRgb, lab };
        }
      }

      // Sample Data Cells
      const classifiedSymbols = [];
      const cellSamples = [];
      let totalDeltaE = 0;

      for (let gy = 0; gy < gridSize; gy++) {
        for (let gx = 0; gx < gridSize; gx++) {
          if (!isCellReserved(gx, gy, gridSize, calibColors.length)) {
            const { cx, cy } = getCellCenter(gx, gy);
            const rawRgb = sampleCellMedian(rectified, cx, cy, sampleRadius);
            const normRgb = normalizeWhiteBalance(rawRgb, paperWhiteSample, blackRefSample);

            const match = classifyColor(normRgb, mode, calibratedSwatches);
            classifiedSymbols.push(match.index);
            totalDeltaE += match.deltaE;

            cellSamples.push({
              gx,
              gy,
              rawRgb,
              normRgb,
              classifiedIndex: match.index,
              deltaE: match.deltaE
            });
          }
        }
      }

      // Try decoding RS codewords with candidate metadata configurations
      for (const rsBlocksMeta of candidateMetaConfigs) {
        const totalCodewordExpected = rsBlocksMeta.reduce((sum, b) => sum + b.dataLen + b.eccLen, 0);
        const rawCodewords = symbolsToBytes(classifiedSymbols, mode, totalCodewordExpected);

        const rsResult = decodePayloadRS(rsBlocksMeta, rawCodewords);

        if (rsResult.success) {
          let text = null;
          try {
            text = new TextDecoder('utf-8', { fatal: false }).decode(rsResult.data);
          } catch {
            text = null;
          }

          bestResult = {
            success: true,
            gridSize,
            mode,
            payloadLength: rsResult.data.length,
            data: rsResult.data,
            text,
            correctedErrors: rsResult.totalErrorsCorrected,
            avgDeltaE: cellSamples.length > 0 ? (totalDeltaE / cellSamples.length) : 0,
            rectifiedImage: rectified,
            cellSamples,
            header: {
              mode,
              gridSize,
              payloadLength,
              blockCount,
              blockDataLen,
              blockEccLen
            }
          };
          break;
        }
      }

      if (bestResult) break;
    } catch {
      // Continue search
    }
  }

  if (bestResult) return bestResult;

  return {
    success: false,
    error: 'Failed to decode ChromaMatrix: could not find valid header or uncorrectable errors exceed ECC capacity.'
  };
}
