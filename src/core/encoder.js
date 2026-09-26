/**
 * ChromaMatrix - Optical Color-Dot 2D Matrix Encoder
 * Generates print-ready color dot matrices with QR-style alignment markers,
 * timing tracks, color calibration swatches, and Reed-Solomon ECC payload.
 * 
 * 🥑 by aoxilus (https://github.com/aoxilus) · CC BY-NC-SA 4.0 (Attribution-NonCommercial-ShareAlike)
 */

import { PALETTE_MODES, getPalette } from './palette.js';
import { DEFAULT_ECC_RATIO, encodePayloadRS } from './reedsolomon.js';
import { hexToRgb } from './colorspace.js';
import {
  COMPRESSION_MODES,
  compressionIdFromMode,
  compressionModeFromId,
  compressBytes
} from './compression.js';

// Reserved color definitions
export const COLOR_RESERVED_BLACK = '#000000';
export const COLOR_RESERVED_WHITE = '#FFFFFF';
export const MAX_GRID_SIZE = 253;

// Cell types in matrix layout
export const CELL_TYPES = {
  EMPTY: 0,
  FINDER: 1,
  TIMING: 2,
  CALIBRATION: 3,
  HEADER: 4,
  DATA: 5
};

/**
 * CRC16-CCITT implementation for header validation
 */
export function crc16(data) {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data[i] << 8);
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  return crc;
}

export function getPaletteModeId(mode) {
  switch (mode) {
    case PALETTE_MODES.PALETTE_8: return 1;
    case PALETTE_MODES.PALETTE_16: return 2;
    case PALETTE_MODES.PALETTE_64: return 3;
    case PALETTE_MODES.PALETTE_ASCII_95: return 4;
    case PALETTE_MODES.PALETTE_256: return 5;
    default: return 2;
  }
}

export function getPaletteModeFromId(id) {
  switch (id) {
    case 1: return PALETTE_MODES.PALETTE_8;
    case 2: return PALETTE_MODES.PALETTE_16;
    case 3: return PALETTE_MODES.PALETTE_64;
    case 4: return PALETTE_MODES.PALETTE_ASCII_95;
    case 5: return PALETTE_MODES.PALETTE_256;
    default: return PALETTE_MODES.PALETTE_16;
  }
}

export function getCompressionIdFromHeaderMode(modeByte) {
  return (modeByte >> 4) & 0x0F;
}

/**
 * Get fixed coordinate list for header cells around corner finders
 */
export function getHeaderCoordinates(gridSize) {
  return [
    { x: 0, y: 7 }, { x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 },
    { x: 7, y: 0 }, { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 },
    { x: gridSize - 7, y: 7 }, { x: gridSize - 6, y: 7 }, { x: gridSize - 5, y: 7 }, { x: gridSize - 4, y: 7 },
    { x: gridSize - 3, y: 7 }, { x: gridSize - 2, y: 7 }, { x: gridSize - 1, y: 7 },
    { x: 7, y: gridSize - 7 }, { x: 7, y: gridSize - 6 }, { x: 7, y: gridSize - 5 }, { x: 7, y: gridSize - 4 },
    { x: 7, y: gridSize - 3 }, { x: 7, y: gridSize - 2 }, { x: 7, y: gridSize - 1 }
  ];
}

/**
 * Get coordinate list for calibration swatches
 */
export function getCalibrationCoordinates(gridSize, count) {
  const coords = [];
  let idx = 0;

  for (let x = 8; x < gridSize - 8 && idx < count; x++) {
    coords.push({ x, y: 7, idx: idx++ });
  }
  for (let y = 8; y < gridSize - 8 && idx < count; y++) {
    coords.push({ x: 7, y, idx: idx++ });
  }
  for (let x = 8; x < gridSize - 8 && idx < count; x++) {
    coords.push({ x, y: gridSize - 8, idx: idx++ });
  }
  for (let y = 8; y < gridSize - 8 && idx < count; y++) {
    coords.push({ x: gridSize - 8, y, idx: idx++ });
  }

  return coords;
}

/**
 * Check if a cell coordinate is reserved for finders, timing, calibration, or header
 */
export function isCellReserved(gx, gy, gridSize, calibCount) {
  // Finder patterns (4 corners 7x7)
  if ((gx < 7 && gy < 7) ||
      (gx >= gridSize - 7 && gy < 7) ||
      (gx < 7 && gy >= gridSize - 7) ||
      (gx >= gridSize - 7 && gy >= gridSize - 7)) return true;

  // Timing tracks
  if (gx === 6 || gx === gridSize - 7 || gy === 6 || gy === gridSize - 7) return true;

  // Header cells
  const hCoords = getHeaderCoordinates(gridSize);
  for (let i = 0; i < hCoords.length; i++) {
    if (hCoords[i].x === gx && hCoords[i].y === gy) return true;
  }

  // Calibration swatches
  const cCoords = getCalibrationCoordinates(gridSize, calibCount);
  for (let i = 0; i < cCoords.length; i++) {
    if (cCoords[i].x === gx && cCoords[i].y === gy) return true;
  }

  return false;
}

/**
 * ASCII-95 uses fixed-size base-95 chunks instead of pretending arbitrary
 * binary bytes are printable characters. Eight bytes fit in ten symbols
 * because 95^10 >= 256^8; the final chunk uses the smallest reversible
 * representation for its byte length.
 */
const BASE95 = 95n;
const BASE95_CHUNK_BYTES = 8;

function base95SymbolCount(byteCount) {
  const target = 1n << (8n * BigInt(byteCount));
  let capacity = 1n;
  let count = 0;
  do {
    capacity *= BASE95;
    count++;
  } while (capacity < target);
  return count;
}

function bytesToBase95Symbols(bytes) {
  const symbols = [];
  for (let offset = 0; offset < bytes.length; offset += BASE95_CHUNK_BYTES) {
    const byteCount = Math.min(BASE95_CHUNK_BYTES, bytes.length - offset);
    let value = 0n;
    for (let i = 0; i < byteCount; i++) {
      value = (value << 8n) | BigInt(bytes[offset + i]);
    }

    const symbolCount = base95SymbolCount(byteCount);
    const chunk = new Array(symbolCount).fill(0);
    for (let i = symbolCount - 1; i >= 0; i--) {
      chunk[i] = Number(value % BASE95);
      value /= BASE95;
    }
    symbols.push(...chunk);
  }
  return symbols;
}

function base95SymbolsToBytes(symbols, expectedByteLength) {
  const bytes = [];
  let symbolOffset = 0;
  let byteOffset = 0;
  const targetLength = expectedByteLength ?? 0;

  while (byteOffset < targetLength && symbolOffset < symbols.length) {
    const byteCount = Math.min(BASE95_CHUNK_BYTES, targetLength - byteOffset);
    const symbolCount = base95SymbolCount(byteCount);
    if (symbolOffset + symbolCount > symbols.length) break;

    let value = 0n;
    for (let i = 0; i < symbolCount; i++) {
      value = value * BASE95 + BigInt(symbols[symbolOffset + i] % 95);
    }

    const chunk = new Uint8Array(byteCount);
    for (let i = byteCount - 1; i >= 0; i--) {
      chunk[i] = Number(value & 0xFFn);
      value >>= 8n;
    }
    bytes.push(...chunk);
    symbolOffset += symbolCount;
    byteOffset += byteCount;
  }

  return new Uint8Array(bytes);
}

function base95ByteLengthFromSymbolLength(symbolLength) {
  const fullChunks = Math.floor(symbolLength / base95SymbolCount(BASE95_CHUNK_BYTES));
  const remainder = symbolLength % base95SymbolCount(BASE95_CHUNK_BYTES);
  let byteLength = fullChunks * BASE95_CHUNK_BYTES;

  for (let byteCount = 1; byteCount < BASE95_CHUNK_BYTES; byteCount++) {
    if (base95SymbolCount(byteCount) === remainder) {
      byteLength += byteCount;
      break;
    }
  }
  return byteLength;
}

/**
 * Convert byte payload into a stream of palette symbol indices based on mode.
 *
 * The ASCII-95 mode is a binary-safe base-95 transport. It is not a direct
 * byte-to-printable-character mapping because Reed-Solomon parity is arbitrary
 * binary data.
 */
export function bytesToSymbols(bytes, mode) {
  const symbols = [];

  if (mode === PALETTE_MODES.PALETTE_8) {
    let bitBuffer = 0;
    let bitsInBuffer = 0;
    for (let i = 0; i < bytes.length; i++) {
      bitBuffer = (bitBuffer << 8) | bytes[i];
      bitsInBuffer += 8;
      while (bitsInBuffer >= 3) {
        bitsInBuffer -= 3;
        symbols.push((bitBuffer >> bitsInBuffer) & 0x07);
      }
    }
    if (bitsInBuffer > 0) {
      symbols.push((bitBuffer << (3 - bitsInBuffer)) & 0x07);
    }
  } else if (mode === PALETTE_MODES.PALETTE_16) {
    for (let i = 0; i < bytes.length; i++) {
      symbols.push((bytes[i] >> 4) & 0x0F);
      symbols.push(bytes[i] & 0x0F);
    }
  } else if (mode === PALETTE_MODES.PALETTE_64) {
    let bitBuffer = 0;
    let bitsInBuffer = 0;
    for (let i = 0; i < bytes.length; i++) {
      bitBuffer = (bitBuffer << 8) | bytes[i];
      bitsInBuffer += 8;
      while (bitsInBuffer >= 6) {
        bitsInBuffer -= 6;
        symbols.push((bitBuffer >> bitsInBuffer) & 0x3F);
      }
    }
    if (bitsInBuffer > 0) {
      symbols.push((bitBuffer << (6 - bitsInBuffer)) & 0x3F);
    }
  } else if (mode === PALETTE_MODES.PALETTE_ASCII_95) {
    symbols.push(...bytesToBase95Symbols(bytes));
  } else if (mode === PALETTE_MODES.PALETTE_256) {
    for (let i = 0; i < bytes.length; i++) {
      symbols.push(bytes[i]);
    }
  }

  return symbols;
}

/**
 * Convert stream of palette symbol indices back into byte payload
 */
export function symbolsToBytes(symbols, mode, expectedByteLength) {
  const bytes = [];

  if (mode === PALETTE_MODES.PALETTE_8) {
    let bitBuffer = 0;
    let bitsInBuffer = 0;
    for (let i = 0; i < symbols.length; i++) {
      bitBuffer = (bitBuffer << 3) | (symbols[i] & 0x07);
      bitsInBuffer += 3;
      if (bitsInBuffer >= 8) {
        bitsInBuffer -= 8;
        bytes.push((bitBuffer >> bitsInBuffer) & 0xFF);
        if (expectedByteLength && bytes.length >= expectedByteLength) break;
      }
    }
  } else if (mode === PALETTE_MODES.PALETTE_16) {
    for (let i = 0; i < symbols.length; i += 2) {
      const high = (symbols[i] || 0) & 0x0F;
      const low = (symbols[i + 1] || 0) & 0x0F;
      bytes.push((high << 4) | low);
      if (expectedByteLength && bytes.length >= expectedByteLength) break;
    }
  } else if (mode === PALETTE_MODES.PALETTE_64) {
    let bitBuffer = 0;
    let bitsInBuffer = 0;
    for (let i = 0; i < symbols.length; i++) {
      bitBuffer = (bitBuffer << 6) | (symbols[i] & 0x3F);
      bitsInBuffer += 6;
      if (bitsInBuffer >= 8) {
        bitsInBuffer -= 8;
        bytes.push((bitBuffer >> bitsInBuffer) & 0xFF);
        if (expectedByteLength && bytes.length >= expectedByteLength) break;
      }
    }
  } else if (mode === PALETTE_MODES.PALETTE_ASCII_95) {
    // The header gives the exact codeword length, which is required to
    // distinguish the shorter final base-95 chunk from padding cells.
    const byteLength = expectedByteLength === undefined
      ? base95ByteLengthFromSymbolLength(symbols.length)
      : expectedByteLength;
    return base95SymbolsToBytes(symbols, byteLength);
  } else if (mode === PALETTE_MODES.PALETTE_256) {
    for (let i = 0; i < symbols.length; i++) {
      bytes.push(symbols[i] & 0xFF);
      if (expectedByteLength && bytes.length >= expectedByteLength) break;
    }
  }

  return new Uint8Array(bytes);
}

/**
 * Calculate required matrix grid dimension (W x W) to hold payload + header + markers
 */
export function calculateRequiredGridSize(symbolCount, paletteColorCount) {
  let size = 25;
  if (size % 2 === 0) size++;
  while (true) {
    let availableDataCells = 0;
    const calibCount = paletteColorCount + 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!isCellReserved(x, y, size, calibCount)) {
          availableDataCells++;
        }
      }
    }

    if (availableDataCells >= symbolCount) {
      return size;
    }
    if (size >= MAX_GRID_SIZE) {
      throw new Error(`Payload requires a grid larger than the supported ${MAX_GRID_SIZE} x ${MAX_GRID_SIZE} limit`);
    }
    size += 2;
  }
}

/**
 * Build the full ChromaMatrix model
 */
export function encodeChromaMatrix(dataInput, options = {}) {
  // The default contract targets phone cameras: fewer, spectrally separated
  // colors are more reliable than maximum density at low capture resolution.
  const mode = options.mode || PALETTE_MODES.PALETTE_8;
  const eccRatio = options.eccRatio !== undefined ? options.eccRatio : DEFAULT_ECC_RATIO;
  const compressionId = options.compressionId || 0;

  let rawBytes;
  if (typeof dataInput === 'string') {
    rawBytes = new TextEncoder().encode(dataInput);
  } else if (dataInput instanceof Uint8Array) {
    rawBytes = dataInput;
  } else {
    rawBytes = new Uint8Array(dataInput);
  }

  // 1. Reed-Solomon Encoding
  const rsBlocks = encodePayloadRS(rawBytes, eccRatio);
  const totalCodewordBytes = rsBlocks.reduce((sum, b) => sum + b.blockBytes.length, 0);
  const codewordStream = new Uint8Array(totalCodewordBytes);
  let streamOffset = 0;
  for (const b of rsBlocks) {
    codewordStream.set(b.blockBytes, streamOffset);
    streamOffset += b.blockBytes.length;
  }

  // 2. Symbols
  const dataSymbols = bytesToSymbols(codewordStream, mode);
  const palette = getPalette(mode);

  // 3. Grid size
  const requiredGridSize = calculateRequiredGridSize(dataSymbols.length, palette.length);
  const minSize = options.gridSize || requiredGridSize;
  let gridSize = Math.max(minSize, requiredGridSize);
  if (gridSize % 2 === 0) gridSize++;
  if (gridSize > MAX_GRID_SIZE) {
    throw new Error(`Grid size ${gridSize} exceeds the supported ${MAX_GRID_SIZE} x ${MAX_GRID_SIZE} limit`);
  }

  // 4. Initialize grid
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({
      type: CELL_TYPES.EMPTY,
      color: COLOR_RESERVED_WHITE,
      symbolIndex: -1
    }))
  );

  function drawFinderPattern(startX, startY, isBottomRight = false) {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const x = startX + dx;
        const y = startY + dy;
        let isBlack = false;

        if (isBottomRight) {
          if (dx === 0 || dx === 6 || dy === 0 || dy === 6) isBlack = true;
          else if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) isBlack = (dx === dy || dx + dy === 6);
          else isBlack = false;
        } else {
          if (dx === 0 || dx === 6 || dy === 0 || dy === 6) isBlack = true;
          else if (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) isBlack = true;
          else isBlack = false;
        }

        grid[y][x] = {
          type: CELL_TYPES.FINDER,
          color: isBlack ? COLOR_RESERVED_BLACK : COLOR_RESERVED_WHITE,
          symbolIndex: -1
        };
      }
    }
  }

  // Corner finders
  drawFinderPattern(0, 0, false);
  drawFinderPattern(gridSize - 7, 0, false);
  drawFinderPattern(0, gridSize - 7, false);
  drawFinderPattern(gridSize - 7, gridSize - 7, true);

  // Timing tracks
  for (let x = 7; x < gridSize - 7; x++) {
    const isBlack = (x % 2 === 0);
    grid[6][x] = { type: CELL_TYPES.TIMING, color: isBlack ? COLOR_RESERVED_BLACK : COLOR_RESERVED_WHITE };
    grid[gridSize - 7][x] = { type: CELL_TYPES.TIMING, color: isBlack ? COLOR_RESERVED_BLACK : COLOR_RESERVED_WHITE };
  }
  for (let y = 7; y < gridSize - 7; y++) {
    const isBlack = (y % 2 === 0);
    grid[y][6] = { type: CELL_TYPES.TIMING, color: isBlack ? COLOR_RESERVED_BLACK : COLOR_RESERVED_WHITE };
    grid[y][gridSize - 7] = { type: CELL_TYPES.TIMING, color: isBlack ? COLOR_RESERVED_BLACK : COLOR_RESERVED_WHITE };
  }

  // Calibration Swatches
  const calibColors = [
    { name: 'Ref-Black', hex: COLOR_RESERVED_BLACK, index: -1 },
    { name: 'Ref-White', hex: COLOR_RESERVED_WHITE, index: -2 },
    ...palette
  ];

  const calibCoords = getCalibrationCoordinates(gridSize, calibColors.length);
  for (let i = 0; i < calibCoords.length && i < calibColors.length; i++) {
    const { x, y } = calibCoords[i];
    grid[y][x] = {
      type: CELL_TYPES.CALIBRATION,
      color: calibColors[i].hex,
      calibIndex: calibColors[i].index
    };
  }

  // Header
  const headerBytes = new Uint8Array(13);
  headerBytes[0] = 0x43; // 'C'
  headerBytes[1] = 0x4D; // 'M'
  headerBytes[2] = getPaletteModeId(mode) | (compressionId << 4);
  headerBytes[3] = gridSize;
  headerBytes[4] = (rawBytes.length >> 24) & 0xFF;
  headerBytes[5] = (rawBytes.length >> 16) & 0xFF;
  headerBytes[6] = (rawBytes.length >> 8) & 0xFF;
  headerBytes[7] = rawBytes.length & 0xFF;
  headerBytes[8] = rsBlocks.length;
  headerBytes[9] = rsBlocks[0].dataLen;
  headerBytes[10] = rsBlocks[0].eccLen;

  const headerCrc = crc16(headerBytes.subarray(0, 11));
  headerBytes[11] = (headerCrc >> 8) & 0xFF;
  headerBytes[12] = headerCrc & 0xFF;

  const headerSymbols = [];
  for (let i = 0; i < headerBytes.length; i++) {
    headerSymbols.push((headerBytes[i] >> 4) & 0x0F);
    headerSymbols.push(headerBytes[i] & 0x0F);
  }

  const headerCoords = getHeaderCoordinates(gridSize);
  const pal16 = getPalette(PALETTE_MODES.PALETTE_16);
  for (let i = 0; i < headerSymbols.length && i < headerCoords.length; i++) {
    const { x, y } = headerCoords[i];
    const sym = headerSymbols[i];
    grid[y][x] = {
      type: CELL_TYPES.HEADER,
      color: pal16[sym].hex,
      symbolIndex: sym,
      headerSymbolIndex: i
    };
  }

  // Fill Payload Data
  let dataSymIdx = 0;
  const paddingSeed = codewordStream.reduce((hash, byte) => (
    Math.imul(hash ^ byte, 16777619) >>> 0
  ), 2166136261);
  function getPaddingSymbol(x, y) {
    let hash = paddingSeed ^ Math.imul(x + 0x9E3779B9, 0x85EBCA6B);
    hash ^= Math.imul(y + 0xC2B2AE35, 0x27D4EB2F);
    hash ^= Math.imul(gridSize, 0x165667B1);
    hash = Math.imul(hash ^ (hash >>> 16), 0x85EBCA6B);
    hash = Math.imul(hash ^ (hash >>> 13), 0xC2B2AE35);
    return (hash ^ (hash >>> 16)) >>> 0;
  }

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (grid[y][x].type === CELL_TYPES.EMPTY) {
        if (dataSymIdx < dataSymbols.length) {
          const sym = dataSymbols[dataSymIdx];
          const colorObj = palette[sym] || palette[0];
          grid[y][x] = {
            type: CELL_TYPES.DATA,
            color: colorObj.hex,
            symbolIndex: sym,
            dataIndex: dataSymIdx
          };
          dataSymIdx++;
        } else {
          const padSym = getPaddingSymbol(x, y) % palette.length;
          grid[y][x] = {
            type: CELL_TYPES.DATA,
            color: palette[padSym].hex,
            symbolIndex: padSym,
            isPadding: true
          };
        }
      }
    }
  }

  return {
    gridSize,
    mode,
    eccRatio,
    compressionId,
    compression: compressionModeFromId(compressionId),
    rawByteLength: rawBytes.length,
    originalByteLength: options.originalByteLength ?? rawBytes.length,
    totalCodewordBytes,
    symbolCount: dataSymbols.length,
    rsBlocksMeta: rsBlocks.map(b => ({ dataLen: b.dataLen, eccLen: b.eccLen })),
    grid
  };
}

/**
 * Compress a payload and then encode the compressed bytes into a matrix.
 * The compression identifier is stored in the high nibble of the existing
 * palette-mode header byte, preserving compatibility with uncompressed data.
 */
export async function encodeChromaMatrixAsync(dataInput, options = {}) {
  const rawBytes = typeof dataInput === 'string'
    ? new TextEncoder().encode(dataInput)
    : dataInput instanceof Uint8Array
      ? dataInput
      : new Uint8Array(dataInput);
  const compression = options.compression ?? COMPRESSION_MODES.BROTLI;
  const compressedBytes = await compressBytes(rawBytes, compression, options);
  return encodeChromaMatrix(compressedBytes, {
    ...options,
    compressionId: compressionIdFromMode(compression),
    originalByteLength: rawBytes.length
  });
}

/**
 * Render ChromaMatrix to SVG string
 */
export function matrixToSvg(matrixModel, options = {}) {
  const { gridSize, grid } = matrixModel;
  const cellSize = options.cellSize || 16;
  const margin = options.margin !== undefined ? options.margin : 2;
  const dotShape = options.dotShape || 'circle';
  const dotScale = options.dotScale !== undefined ? options.dotScale : 0.85;

  const totalGridUnits = gridSize + margin * 2;
  const totalPx = totalGridUnits * cellSize;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalPx} ${totalPx}" width="${totalPx}" height="${totalPx}">\n`;
  svg += `  <rect width="100%" height="100%" fill="#FFFFFF"/>\n`;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = grid[y][x];
      const px = (x + margin) * cellSize;
      const py = (y + margin) * cellSize;

      if (cell.type === CELL_TYPES.FINDER || cell.type === CELL_TYPES.TIMING) {
        svg += `  <rect x="${px}" y="${py}" width="${cellSize}" height="${cellSize}" fill="${cell.color}"/>\n`;
      } else {
        const radius = (cellSize * dotScale) / 2;
        const cx = px + cellSize / 2;
        const cy = py + cellSize / 2;

        if (dotShape === 'circle') {
          svg += `  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${cell.color}"/>\n`;
        } else if (dotShape === 'rounded') {
          const size = cellSize * dotScale;
          const offset = (cellSize - size) / 2;
          const rx = size * 0.25;
          svg += `  <rect x="${px + offset}" y="${py + offset}" width="${size}" height="${size}" rx="${rx}" fill="${cell.color}"/>\n`;
        } else {
          const size = cellSize * dotScale;
          const offset = (cellSize - size) / 2;
          svg += `  <rect x="${px + offset}" y="${py + offset}" width="${size}" height="${size}" fill="${cell.color}"/>\n`;
        }
      }
    }
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Render ChromaMatrix to RGBA Pixel Buffer (Uint8ClampedArray)
 */
export function matrixToRgbaBuffer(matrixModel, options = {}) {
  const { gridSize, grid } = matrixModel;
  const cellSize = options.cellSize || 16;
  const margin = options.margin !== undefined ? options.margin : 2;
  const dotShape = options.dotShape || 'circle';
  const dotScale = options.dotScale !== undefined ? options.dotScale : 0.85;

  const totalGridUnits = gridSize + margin * 2;
  const width = totalGridUnits * cellSize;
  const height = width;
  const buffer = new Uint8ClampedArray(width * height * 4);

  buffer.fill(255);

  const radius = (cellSize * dotScale) / 2;
  const radiusSq = radius * radius;
  const dotSize = cellSize * dotScale;
  const dotOffset = (cellSize - dotSize) / 2;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      const cell = grid[gy][gx];
      const rgb = hexToRgb(cell.color);
      const cellX = (gx + margin) * cellSize;
      const cellY = (gy + margin) * cellSize;
      const cx = cellX + cellSize / 2;
      const cy = cellY + cellSize / 2;

      for (let py = 0; py < cellSize; py++) {
        for (let px = 0; px < cellSize; px++) {
          const imgX = cellX + px;
          const imgY = cellY + py;

          if (imgX >= width || imgY >= height) continue;

          let fill = false;
          if (cell.type === CELL_TYPES.FINDER || cell.type === CELL_TYPES.TIMING) {
            fill = true;
          } else if (dotShape === 'circle') {
            const dx = (imgX + 0.5) - cx;
            const dy = (imgY + 0.5) - cy;
            if (dx * dx + dy * dy <= radiusSq) fill = true;
          } else {
            if (px >= dotOffset && px < dotOffset + dotSize &&
                py >= dotOffset && py < dotOffset + dotSize) {
              fill = true;
            }
          }

          if (fill) {
            const idx = (imgY * width + imgX) * 4;
            buffer[idx] = rgb.r;
            buffer[idx + 1] = rgb.g;
            buffer[idx + 2] = rgb.b;
            buffer[idx + 3] = 255;
          }
        }
      }
    }
  }

  return { width, height, data: buffer };
}
