#!/usr/bin/env node
/**
 * ChromaMatrix CLI - Printer & Scanner Color Fidelity Benchmark Tool
 * Example 1: Generate target -> node src/cli/benchmark-cli.js --generate target.png --mode TEST_64
 * Example 2: Analyze scan -> node src/cli/benchmark-cli.js --analyze scan.png --mode TEST_64
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import {
  BENCHMARK_MODES,
  generateBenchmarkTarget,
  benchmarkTargetToSvg,
  benchmarkTargetToRgbaBuffer,
  analyzeBenchmarkScan
} from '../core/benchmark.js';

function printHelp() {
  console.log(`
ChromaMatrix Printer & Scanner Color Benchmark CLI
Usage: node src/cli/benchmark-cli.js [options]

Commands:
  -g, --generate <file>      Generate calibration target image (.png or .svg)
  -a, --analyze <file>       Analyze scanned/photographed target image (.png)

Options:
  -m, --mode <mode>          Benchmark mode (default: TEST_64)
                             Options: TEST_16, TEST_64, TEST_256
  -h, --help                 Show help
`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    generate: null,
    analyze: null,
    mode: BENCHMARK_MODES.TEST_64
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-g' || a === '--generate') opts.generate = args[++i];
    else if (a === '-a' || a === '--analyze') opts.analyze = args[++i];
    else if (a === '-m' || a === '--mode') opts.mode = args[++i];
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

  if (!opts.generate && !opts.analyze) {
    printHelp();
    process.exit(0);
  }

  if (opts.generate) {
    console.log(`\n🖨️ Generating Calibration Target Chart (${opts.mode})...`);
    const target = generateBenchmarkTarget(opts.mode);
    const ext = path.extname(opts.generate).toLowerCase();

    if (ext === '.svg') {
      const svg = benchmarkTargetToSvg(target);
      fs.writeFileSync(opts.generate, svg);
      console.log(`✓ Target saved to ${opts.generate} (SVG)\n`);
    } else {
      const buffer = benchmarkTargetToRgbaBuffer(target);
      const png = new PNG({ width: buffer.width, height: buffer.height });
      for (let i = 0; i < buffer.data.length; i++) png.data[i] = buffer.data[i];

      const outStream = fs.createWriteStream(opts.generate);
      png.pack().pipe(outStream);
      await new Promise((resolve, reject) => {
        outStream.on('finish', resolve);
        outStream.on('error', reject);
      });
      console.log(`✓ Target saved to ${opts.generate} (${buffer.width}x${buffer.height} PNG)\n`);
      console.log(`💡 Next Steps: Print "${opts.generate}" on your printer, take a scan or clear photo, and run:`);
      console.log(`   node src/cli/benchmark-cli.js --analyze <scanned_photo.png> --mode ${opts.mode}\n`);
    }
  }

  if (opts.analyze) {
    console.log(`\n🔬 Analyzing Scanned Calibration Chart ${opts.analyze}...`);
    const imgData = await loadPng(opts.analyze);
    const target = generateBenchmarkTarget(opts.mode);

    const report = analyzeBenchmarkScan(imgData, target);

    console.log(`\n📊 Color Fidelity & Gamut Analysis Report`);
    console.log(`=======================================================`);
    console.log(`Tested Color Count:          ${report.patchCount} patches`);
    console.log(`Avg Printer/Scanner Shift:   ${report.avgGamutShiftDeltaE.toFixed(2)} ΔE`);
    console.log(`Max Color Drift:             ${report.maxGamutShiftDeltaE.toFixed(2)} ΔE`);
    console.log(`Min Physical Separation:     ${report.minPhysicalSeparationDeltaE.toFixed(2)} ΔE`);
    console.log(`Confused / Clipped Pairs:    ${report.confusionPairCount}`);
    console.log(`Overall Rating:              ${report.reliabilityRating}`);
    console.log(`Recommended Palette Mode:    ${report.recommendedMode} (${report.recommendedBitsPerDot} bits/dot)`);
    console.log(`=======================================================\n`);

    if (report.confusionPairs.length > 0) {
      console.log(`⚠️ Warning: Closely clustered or confused color pairs:`);
      for (const pair of report.confusionPairs.slice(0, 5)) {
        console.log(`   - "${pair.colorA.name}" vs "${pair.colorB.name}" (Measured ΔE: ${pair.measuredDeltaE.toFixed(2)})`);
      }
      console.log('');
    } else {
      console.log(`🎉 All ${report.patchCount} colors are distinct and distinguishable!\n`);
    }
  }
}

main().catch(err => {
  console.error('Benchmark error:', err.message);
  process.exit(1);
});
