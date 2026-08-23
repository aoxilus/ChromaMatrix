/**
 * Unit tests for Palette generation & color separation
 */

import { PALETTE_MODES, getPalette, analyzePaletteSeparation, classifyColor } from '../src/core/palette.js';

console.log('--- Running Palette & Color Distance Tests ---');

for (const mode of Object.values(PALETTE_MODES)) {
  const analysis = analyzePaletteSeparation(mode);
  console.log(`[${mode}] Colors: ${analysis.colorCount}, Min ΔE: ${analysis.minDeltaE.toFixed(2)}, Avg ΔE: ${analysis.avgDeltaE.toFixed(2)}, Max ΔE: ${analysis.maxDeltaE.toFixed(2)}`);

  if (mode === PALETTE_MODES.PALETTE_8) {
    if (analysis.minDeltaE < 18) {
      throw new Error(`PALETTE_8 min Delta E too low: ${analysis.minDeltaE}`);
    }
  }

  // Ensure no palette color is pure black or pure white
  const palette = getPalette(mode);
  for (const c of palette) {
    const lab = c.lab;
    if (lab.L < 10) {
      throw new Error(`Color ${c.hex} is too close to Black (L=${lab.L.toFixed(1)})`);
    }
    if (lab.L > 92 && Math.sqrt(lab.a * lab.a + lab.b * lab.b) < 15) {
      throw new Error(`Color ${c.hex} is too close to White (L=${lab.L.toFixed(1)})`);
    }
  }
}

// Test color classification
const sample = { r: 235, g: 30, b: 70 }; // Close to Crimson
const matched = classifyColor(sample, PALETTE_MODES.PALETTE_8);
console.log(`Classified sample (235, 30, 70) as ${matched.paletteColor.name} with ΔE = ${matched.deltaE.toFixed(2)}`);
if (matched.paletteColor.name !== 'Crimson') {
  throw new Error('Classification failed for sample close to Crimson');
}

console.log('All Palette tests passed successfully!');
