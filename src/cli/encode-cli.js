#!/usr/bin/env node
/**
 * ChromaMatrix CLI - Encode Tool
 * Example: node src/cli/encode-cli.js --input "Hello World" --output matrix.png --mode PALETTE_16
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { DEFAULT_ECC_RATIO } from '../core/reedsolomon.js';
import { encodeChromaMatrix, matrixToSvg, matrixToRgbaBuffer } from '../core/encoder.js';
import { PALETTE_MODES } from '../core/palette.js';

function printHelp() {
  console.log(`
ChromaMatrix CLI Encoder
Usage: node src/cli/encode-cli.js [options]

Options:
  -i, --input <text|file>    Input text or filepath to encode (required)
  -o, --output <file>        Output file (.png or .svg) (default: matrix.png)
  -m, --mode <mode>          Palette Mode (default: PALETTE_16)
                             Options: PALETTE_8, PALETTE_16, PALETTE_64, ASCII_95, PALETTE_256
  -e, --ecc <ratio>          Reed-Solomon ECC ratio [0.1 to 0.5] (default: 0.5)
  -s, --cell-size <px>       Cell size in pixels (default: 16)
  -d, --dot-shape <shape>    Dot shape: 'circle' | 'square' | 'rounded' (default: circle)
  -h, --help                 Show help
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    input: null,
    output: 'matrix.png',
    mode: PALETTE_MODES.PALETTE_16,
    ecc: DEFAULT_ECC_RATIO,
    cellSize: 16,
    dotShape: 'circle'
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-i' || a === '--input') opts.input = args[++i];
    else if (a === '-o' || a === '--output') opts.output = args[++i];
    else if (a === '-m' || a === '--mode') opts.mode = args[++i];
    else if (a === '-e' || a === '--ecc') opts.ecc = parseFloat(args[++i]);
    else if (a === '-s' || a === '--cell-size') opts.cellSize = parseInt(args[++i], 10);
    else if (a === '-d' || a === '--dot-shape') opts.dotShape = args[++i];
    else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs();

  if (!opts.input) {
    console.error('Error: Missing required --input argument.\n');
    printHelp();
    process.exit(1);
  }

  let payload;
  if (fs.existsSync(opts.input)) {
    payload = fs.readFileSync(opts.input);
  } else {
    payload = opts.input;
  }

  console.log(`\n🔵 Encoding with ChromaMatrix (${opts.mode})...`);
  const matrix = encodeChromaMatrix(payload, {
    mode: opts.mode,
    eccRatio: opts.ecc
  });

  console.log(`✓ Grid dimensions: ${matrix.gridSize} x ${matrix.gridSize} cells`);
  console.log(`✓ Payload size: ${matrix.rawByteLength} bytes (${matrix.symbolCount} symbols)`);
  console.log(`✓ Reed-Solomon Codewords: ${matrix.totalCodewordBytes} bytes`);

  const ext = path.extname(opts.output).toLowerCase();

  if (ext === '.svg') {
    const svg = matrixToSvg(matrix, {
      cellSize: opts.cellSize,
      dotShape: opts.dotShape
    });
    fs.writeFileSync(opts.output, svg);
    console.log(`✓ Output saved to ${opts.output} (SVG)\n`);
  } else {
    const buffer = matrixToRgbaBuffer(matrix, {
      cellSize: opts.cellSize,
      dotShape: opts.dotShape
    });

    const png = new PNG({ width: buffer.width, height: buffer.height });
    for (let i = 0; i < buffer.data.length; i++) {
      png.data[i] = buffer.data[i];
    }

    const outStream = fs.createWriteStream(opts.output);
    png.pack().pipe(outStream);

    await new Promise((resolve, reject) => {
      outStream.on('finish', resolve);
      outStream.on('error', reject);
    });

    console.log(`✓ Output saved to ${opts.output} (${buffer.width}x${buffer.height} PNG)\n`);
  }
}

main().catch(err => {
  console.error('Encoding error:', err.message);
  process.exit(1);
});
