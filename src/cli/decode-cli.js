#!/usr/bin/env node
/**
 * ChromaMatrix CLI - Decode Tool
 * Example: node src/cli/decode-cli.js --image matrix.png
 */

import fs from 'fs';
import { PNG } from 'pngjs';
import { decodeChromaMatrix } from '../core/decoder.js';

function printHelp() {
  console.log(`
ChromaMatrix CLI Decoder
Usage: node src/cli/decode-cli.js [options]

Options:
  -i, --image <file>         Input image file (.png) (required)
  -o, --output <file>        Optional output file to save decoded raw bytes
  -h, --help                 Show help
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    image: null,
    output: null
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-i' || a === '--image') opts.image = args[++i];
    else if (a === '-o' || a === '--output') opts.output = args[++i];
    else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return opts;
}

async function loadPng(filePath) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(new PNG({ filterType: 4 }))
      .on('parsed', function () {
        resolve({
          width: this.width,
          height: this.height,
          data: this.data
        });
      })
      .on('error', reject);
  });
}

async function main() {
  const opts = parseArgs();

  if (!opts.image) {
    console.error('Error: Missing required --image argument.\n');
    printHelp();
    process.exit(1);
  }

  if (!fs.existsSync(opts.image)) {
    console.error(`Error: File not found: ${opts.image}\n`);
    process.exit(1);
  }

  console.log(`\n🔍 Loading image ${opts.image}...`);
  const imgData = await loadPng(opts.image);
  console.log(`✓ Image dimensions: ${imgData.width} x ${imgData.height} px`);

  console.log(`⚙️ Running computer vision pipeline, homography, and RS decoder...`);
  const result = decodeChromaMatrix(imgData);

  if (!result.success) {
    console.error(`\n❌ Decode Failed: ${result.error}\n`);
    process.exit(1);
  }

  console.log(`\n✅ Decode Successful!`);
  console.log(`========================================`);
  console.log(`Grid Size:            ${result.gridSize} x ${result.gridSize}`);
  console.log(`Palette Mode:         ${result.mode}`);
  console.log(`Payload Length:       ${result.payloadLength} bytes`);
  console.log(`RS Corrected Errors:  ${result.correctedErrors} bytes`);
  console.log(`Average Color ΔE:     ${result.avgDeltaE.toFixed(2)}`);
  console.log(`========================================\n`);

  if (result.text) {
    console.log(`📄 Decoded Text:\n----------------------------------------\n${result.text}\n----------------------------------------\n`);
  }

  if (opts.output) {
    fs.writeFileSync(opts.output, result.data);
    console.log(`✓ Decoded payload written to ${opts.output}\n`);
  }
}

main().catch(err => {
  console.error('Decoding error:', err.message);
  process.exit(1);
});
