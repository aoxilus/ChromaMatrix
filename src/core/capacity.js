/**
 * ChromaMatrix - Paper Capacity & Full-Sheet Layout Engine
 * Calculates physical printable capacity (Letter / A4) across optical dot sizes,
 * printer DPI, and scanner/camera capture distances.
 * 
 * 🥑 by aoxilus (https://github.com/aoxilus) · CC BY-NC-SA 4.0 (Attribution-NonCommercial-ShareAlike)
 */

import { PALETTE_MODES } from './palette.js';
import { DEFAULT_ECC_RATIO } from './reedsolomon.js';

export const PAPER_SIZES = {
  LETTER: {
    name: 'Letter (8.5" x 11")',
    widthMm: 215.9,
    heightMm: 279.4,
    printableWidthMm: 190.5,  // 0.5" (12.7mm) margins
    printableHeightMm: 254.0
  },
  A4: {
    name: 'A4 (210mm x 297mm)',
    widthMm: 210.0,
    heightMm: 297.0,
    printableWidthMm: 185.0,  // 12.5mm margins
    printableHeightMm: 272.0
  }
};

export const OPTICAL_CAPTURE_TIERS = [
  {
    id: 'casual_phone',
    name: 'Smartphone Photo (Handheld ~30cm)',
    recommendedDotPitchMm: 0.90, // 0.9mm dot pitch
    reliability: 'High (tolerates moderate hand shake & ambient room lighting)'
  },
  {
    id: 'macro_phone',
    name: 'Close-up Macro Camera (Macro / Fixed Stand ~15cm)',
    recommendedDotPitchMm: 0.50, // 0.5mm dot pitch
    reliability: 'High (requires steady camera & good lighting)'
  },
  {
    id: 'flatbed_300dpi',
    name: 'Flatbed Scanner (300 DPI Optical Scan)',
    recommendedDotPitchMm: 0.25, // 0.25mm dot pitch (~100 dots/inch)
    reliability: 'Extremely High (perfect flat focus & even illumination)'
  },
  {
    id: 'flatbed_600dpi',
    name: 'High-Res Flatbed Scanner (600 - 1200 DPI Optical)',
    recommendedDotPitchMm: 0.15, // 0.15mm dot pitch (~170 dots/inch)
    reliability: 'Maximum Density (requires precision laser/offset print & 600+ DPI scan)'
  }
];

// ASCII-95 stores eight bytes in ten symbols. This is an approximate physical
// capacity, so use its actual fixed-block efficiency rather than claiming one
// character per dot.
export const ASCII95_BITS_PER_DOT = 6.4;

/**
 * Calculate exact characters and byte capacity for a given paper size, dot pitch, and palette mode.
 */
export function calculateSheetCapacity(paperKey = 'LETTER', dotPitchMm = 0.90, mode = PALETTE_MODES.PALETTE_16, eccRatio = DEFAULT_ECC_RATIO) {
  const paper = PAPER_SIZES[paperKey] || PAPER_SIZES.LETTER;

  const cols = Math.floor(paper.printableWidthMm / dotPitchMm);
  const rows = Math.floor(paper.printableHeightMm / dotPitchMm);
  const totalPhysicalDots = cols * rows;

  // Framing & alignment overhead (Corner finders, timing, calibration swatches, header)
  // Approx 5% - 8% of total dots for matrix framing
  const framingOverheadRatio = 0.06;
  const availableDataDots = Math.floor(totalPhysicalDots * (1 - framingOverheadRatio));

  // Bits per dot by mode
  let bitsPerDot = 4;

  if (mode === PALETTE_MODES.PALETTE_8) bitsPerDot = 3;
  else if (mode === PALETTE_MODES.PALETTE_16) bitsPerDot = 4;
  else if (mode === PALETTE_MODES.PALETTE_64) bitsPerDot = 6;
  else if (mode === PALETTE_MODES.PALETTE_ASCII_95) bitsPerDot = ASCII95_BITS_PER_DOT;
  else if (mode === PALETTE_MODES.PALETTE_256) bitsPerDot = 8;

  // Raw data capacity in bytes
  const rawCodewordBytes = Math.floor((availableDataDots * bitsPerDot) / 8);

  // Net usable payload after Reed-Solomon Error Correction
  const netPayloadBytes = Math.floor(rawCodewordBytes / (1 + eccRatio));

  // Approximate standard typed pages (1 standard single-spaced page ~ 2,500 characters / 500 words)
  const approxTypedPages = (netPayloadBytes / 2500).toFixed(1);

  return {
    paperName: paper.name,
    paperKey,
    dotPitchMm,
    mode,
    eccRatio,
    gridDimensions: `${cols} x ${rows} dots`,
    totalPhysicalDots,
    availableDataDots,
    rawCodewordBytes,
    netPayloadBytes,
    approxCharacters: netPayloadBytes,
    approxKilobytes: (netPayloadBytes / 1024).toFixed(1),
    approxTypedPages
  };
}

/**
 * Generate a complete multi-tier capacity report matrix
 */
export function generateCapacityReport(paperKey = 'LETTER', eccRatio = DEFAULT_ECC_RATIO) {
  const paper = PAPER_SIZES[paperKey] || PAPER_SIZES.LETTER;
  const tiers = OPTICAL_CAPTURE_TIERS.map(tier => {
    const modes = [
      PALETTE_MODES.PALETTE_8,
      PALETTE_MODES.PALETTE_16,
      PALETTE_MODES.PALETTE_64,
      PALETTE_MODES.PALETTE_ASCII_95,
      PALETTE_MODES.PALETTE_256
    ];

    const results = {};
    modes.forEach(m => {
      results[m] = calculateSheetCapacity(paperKey, tier.recommendedDotPitchMm, m, eccRatio);
    });

    return {
      tier,
      results
    };
  });

  return {
    paper,
    eccRatio,
    tiers
  };
}
