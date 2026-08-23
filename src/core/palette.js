/**
 * ChromaMatrix - Color Palette Definition & Color Matching Engine
 * Defines standard calibrated palettes (8, 16, 64, ASCII-95, 256 colors)
 * ensuring pure Black and White are reserved strictly for alignment markers.
 */

import { rgbToLab, deltaE2000, rgbToHex } from './colorspace.js';

export const PALETTE_MODES = {
  PALETTE_8: 'PALETTE_8',         // 3 bits/dot (8 colors) - Ultra high reliability
  PALETTE_16: 'PALETTE_16',       // 4 bits/dot (16 colors) - 1 nibble/dot, 2 dots/byte
  PALETTE_64: 'PALETTE_64',       // 6 bits/dot (64 colors) - Base64 mapping
  PALETTE_ASCII_95: 'ASCII_95',   // 95 printable ASCII chars (32 ' ' through 126 '~')
  PALETTE_256: 'PALETTE_256'      // 8 bits/dot (256 colors) - 1 full byte/dot
};

/**
 * Generate HSL to RGB helper
 * h in [0, 360), s in [0, 1], l in [0, 1]
 */
function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;

  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

/**
 * 8-Color Palette (Ultra-Reliable 3 bits per dot)
 * 8 maximally distinct hues across the color wheel.
 */
const BASE_PALETTE_8 = [
  { index: 0, hex: '#E6194B', name: 'Crimson',   rgb: { r: 230, g: 25, b: 75 } },
  { index: 1, hex: '#00A859', name: 'Emerald',   rgb: { r: 0, g: 168, b: 89 } },
  { index: 2, hex: '#0044BB', name: 'Cobalt',    rgb: { r: 0, g: 68, b: 187 } },
  { index: 3, hex: '#FFDD00', name: 'Yellow',    rgb: { r: 255, g: 221, b: 0 } },
  { index: 4, hex: '#00C8FF', name: 'Cyan',      rgb: { r: 0, g: 200, b: 255 } },
  { index: 5, hex: '#9900CC', name: 'Purple',    rgb: { r: 153, g: 0, b: 204 } },
  { index: 6, hex: '#FF7700', name: 'Orange',    rgb: { r: 255, g: 119, b: 0 } },
  { index: 7, hex: '#005555', name: 'Teal',      rgb: { r: 0, g: 85, b: 85 } }
];

/**
 * 16-Color Palette (4 bits = 1 nibble per dot)
 * 16 distinct hues distributed with controlled lightness and chroma.
 */
const BASE_PALETTE_16 = [
  { index: 0,  hex: '#E6194B', name: 'Crimson',      rgb: { r: 230, g: 25, b: 75 } },
  { index: 1,  hex: '#00A859', name: 'Emerald',      rgb: { r: 0, g: 168, b: 89 } },
  { index: 2,  hex: '#0044BB', name: 'Cobalt',       rgb: { r: 0, g: 68, b: 187 } },
  { index: 3,  hex: '#FFDD00', name: 'Yellow',       rgb: { r: 255, g: 221, b: 0 } },
  { index: 4,  hex: '#FF7700', name: 'Orange',       rgb: { r: 255, g: 119, b: 0 } },
  { index: 5,  hex: '#9900CC', name: 'Purple',       rgb: { r: 153, g: 0, b: 204 } },
  { index: 6,  hex: '#00C8FF', name: 'Cyan',         rgb: { r: 0, g: 200, b: 255 } },
  { index: 7,  hex: '#FF0099', name: 'Magenta',      rgb: { r: 255, g: 0, b: 153 } },
  { index: 8,  hex: '#FFA0B4', name: 'Pink',         rgb: { r: 255, g: 160, b: 180 } },
  { index: 9,  hex: '#008080', name: 'Teal',         rgb: { r: 0, g: 128, b: 128 } },
  { index: 10, hex: '#C8A2C8', name: 'Lilac',        rgb: { r: 200, g: 162, b: 200 } },
  { index: 11, hex: '#8B4513', name: 'SaddleBrown',   rgb: { r: 139, g: 69, b: 19 } },
  { index: 12, hex: '#E6DC78', name: 'Khaki',        rgb: { r: 230, g: 220, b: 120 } },
  { index: 13, hex: '#700000', name: 'Maroon',       rgb: { r: 112, g: 0, b: 0 } },
  { index: 14, hex: '#88E088', name: 'Mint',         rgb: { r: 136, g: 224, b: 136 } },
  { index: 15, hex: '#666600', name: 'Olive',        rgb: { r: 102, g: 102, b: 0 } }
];

/**
 * Generate 64-Color Palette (6 bits per dot)
 */
function generatePalette64() {
  const palette = [];
  const lightnessLevels = [0.35, 0.50, 0.65, 0.78];
  const saturationLevels = [0.90, 0.85, 0.80, 0.75];
  let idx = 0;

  for (let lIdx = 0; lIdx < 4; lIdx++) {
    const l = lightnessLevels[lIdx];
    const s = saturationLevels[lIdx];
    for (let hIdx = 0; hIdx < 16; hIdx++) {
      const h = (hIdx * (360 / 16) + (lIdx * 7.5)) % 360;
      const rgb = hslToRgb(h, s, l);
      palette.push({
        index: idx,
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        name: `Color-64-#${idx}`,
        rgb
      });
      idx++;
    }
  }
  return palette;
}

/**
 * Generate ASCII 95-Color Palette (Printable ASCII characters 32 to 126)
 */
function generateAsciiPalette() {
  const palette = [];
  const charCount = 95; // 32 ' ' to 126 '~'

  for (let i = 0; i < charCount; i++) {
    const charCode = 32 + i;
    const char = String.fromCharCode(charCode);

    const tier = i % 5;
    const tierStep = Math.floor(i / 5);
    const h = (tierStep * (360 / 19) + tier * 11) % 360;
    const l = 0.35 + (tier * 0.11);
    const s = 0.85 - (tier * 0.04);

    const rgb = hslToRgb(h, s, l);
    palette.push({
      index: i,
      charCode,
      char,
      hex: rgbToHex(rgb.r, rgb.g, rgb.b),
      name: `ASCII '${char}' (${charCode})`,
      rgb
    });
  }
  return palette;
}

/**
 * Generate 256-Color Palette (8 bits / 1 byte per dot)
 */
function generatePalette256() {
  const palette = [];
  const layers = [
    { l: 0.30, s: 0.95 },
    { l: 0.38, s: 0.90 },
    { l: 0.45, s: 0.95 },
    { l: 0.52, s: 0.85 },
    { l: 0.60, s: 0.90 },
    { l: 0.68, s: 0.80 },
    { l: 0.75, s: 0.85 },
    { l: 0.82, s: 0.75 }
  ];

  let idx = 0;
  for (let lIdx = 0; lIdx < layers.length; lIdx++) {
    const { l, s } = layers[lIdx];
    for (let hIdx = 0; hIdx < 32; hIdx++) {
      const h = (hIdx * (360 / 32) + (lIdx * 4.5)) % 360;
      const rgb = hslToRgb(h, s, l);
      palette.push({
        index: idx,
        hex: rgbToHex(rgb.r, rgb.g, rgb.b),
        name: `Color-256-#${idx}`,
        rgb
      });
      idx++;
    }
  }
  return palette;
}

const PALETTE_CACHE = {
  [PALETTE_MODES.PALETTE_8]: BASE_PALETTE_8.map(p => ({ ...p, lab: rgbToLab(p.rgb.r, p.rgb.g, p.rgb.b) })),
  [PALETTE_MODES.PALETTE_16]: BASE_PALETTE_16.map(p => ({ ...p, lab: rgbToLab(p.rgb.r, p.rgb.g, p.rgb.b) })),
  [PALETTE_MODES.PALETTE_64]: generatePalette64().map(p => ({ ...p, lab: rgbToLab(p.rgb.r, p.rgb.g, p.rgb.b) })),
  [PALETTE_MODES.PALETTE_ASCII_95]: generateAsciiPalette().map(p => ({ ...p, lab: rgbToLab(p.rgb.r, p.rgb.g, p.rgb.b) })),
  [PALETTE_MODES.PALETTE_256]: generatePalette256().map(p => ({ ...p, lab: rgbToLab(p.rgb.r, p.rgb.g, p.rgb.b) }))
};

export function getPalette(mode = PALETTE_MODES.PALETTE_16) {
  const pal = PALETTE_CACHE[mode];
  if (!pal) {
    throw new Error(`Unknown palette mode: ${mode}`);
  }
  return pal;
}

export function classifyColor(sampleRgb, mode = PALETTE_MODES.PALETTE_16, calibratedSwatches = null) {
  const palette = getPalette(mode);
  const sampleLab = rgbToLab(sampleRgb.r, sampleRgb.g, sampleRgb.b);

  let bestIndex = 0;
  let minDeltaE = Infinity;

  for (let i = 0; i < palette.length; i++) {
    let targetLab;
    if (calibratedSwatches && calibratedSwatches[i]) {
      const sw = calibratedSwatches[i];
      targetLab = sw.lab || rgbToLab(sw.r, sw.g, sw.b);
    } else {
      targetLab = palette[i].lab;
    }

    const dE = deltaE2000(sampleLab, targetLab);
    if (dE < minDeltaE) {
      minDeltaE = dE;
      bestIndex = i;
    }
  }

  return {
    index: bestIndex,
    paletteColor: palette[bestIndex],
    deltaE: minDeltaE
  };
}

export function analyzePaletteSeparation(mode = PALETTE_MODES.PALETTE_16) {
  const palette = getPalette(mode);
  const n = palette.length;
  let minDistance = Infinity;
  let maxDistance = 0;
  let totalDistance = 0;
  let pairCount = 0;

  const matrix = Array.from({ length: n }, () => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const dE = deltaE2000(palette[i].lab, palette[j].lab);
      matrix[i][j] = dE;
      matrix[j][i] = dE;

      if (dE < minDistance) minDistance = dE;
      if (dE > maxDistance) maxDistance = dE;
      totalDistance += dE;
      pairCount++;
    }
  }

  return {
    mode,
    colorCount: n,
    minDeltaE: minDistance,
    maxDeltaE: maxDistance,
    avgDeltaE: pairCount > 0 ? (totalDistance / pairCount) : 0,
    distanceMatrix: matrix
  };
}
