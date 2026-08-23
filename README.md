# 🥑 ChromaMatrix — Optical Color-Dot Paper Data Storage & Decoder

> **Offline optical data storage on standard paper and stickers using high-density color dots, real-time CIELAB perceptual calibration, and Reed-Solomon $GF(2^8)$ error recovery.**

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Author: aoxilus](https://img.shields.io/badge/Author-aoxilus%20🥑-brightgreen.svg)](https://github.com/aoxilus)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue.svg)](https://nodejs.org)

---

## Key Features

1. **Reserved Black & White Framing**: QR-style nested square corner fiducials, timing tracks, and dynamic range calibration targets strictly reserve pure Black and Paper White for spatial/exposure registration.
2. **On-Sheet Self-Calibrating Swatches**: Reference palette swatches printed along the borders allow the decoder to normalize for printer CMYK gamuts, paper reflectance, and ambient camera lighting shifts.
3. **Multi-Mode Color Palettes**:
   - `PALETTE_8` (3 bits/dot): Ultra-high contrast and reliability.
   - `PALETTE_16` (4 bits = 1 nibble/dot, 2 dots/byte): Optimal density and stability.
   - `PALETTE_64` (6 bits/dot): Base64 symbol packing.
   - `ASCII_95` (Printable ASCII 32–126): Direct 1-to-1 character assignment.
   - `PALETTE_256` (8 bits / 1 byte per dot): Maximum byte density.
4. **Reed-Solomon Error Correction Code (RS-ECC)**: Full Galois Field $GF(2^8)$ arithmetic with Berlekamp-Massey algorithm to automatically recover from paper smudges, print bleed, or optical glare.
5. **Printer & Scanner Fidelity Benchmark Lab**: Measures physical color shifts ($\Delta E$), confusion matrices, and recommends the optimal palette for your specific printer and camera setup.
6. **Zero-Dependency Architecture**: Built using pure JavaScript/HTML5 Canvas in the browser and pure Node.js on the server/CLI.

---

## Prior Art & Theoretical Foundation

For an in-depth analysis of related systems (Microsoft HCCB, Zebra Ultracode, Twibright Optar, PaperBack, HCC2D, MMCC, CIELAB color theory) and a complete comparative matrix, see:
👉 **[Documentation: State of the Art & Prior Art Analysis](docs/PRIOR_ART_AND_COMPARISON.md)**

---

## Quick Start

### 1. Start the Interactive Web Application
```bash
npm start
```
Open **`http://localhost:3000`** in your browser to access:
- **Matrix Studio (Encoder)**: Real-time matrix generator, dot inspector, SVG/PNG/Print export.
- **Scan & Decode**: File drag-and-drop or Live Webcam feed with interactive corner handles.
- **Printer Fidelity Lab**: Color calibration test sheet generator and scanned target analyzer.
- **Color Theory & Gamut**: Perceptual CIELAB distance visualizer.

### 2. Run CLI Commands

#### Encode Text or File
```bash
npm run encode -- --input "Hello World" --output matrix.png --mode PALETTE_16
```

#### Decode Scanned Image File
```bash
npm run decode -- --image matrix.png
```

#### Benchmark Printer Color Fidelity
```bash
# Step 1: Generate calibration target
npm run benchmark -- --generate target.png --mode TEST_64

# Step 2: Analyze scanned/photographed target
npm run benchmark -- --analyze target.png --mode TEST_64
```

### 3. Run Automated Tests
```bash
npm test
```

---

## License

Licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** license. See [`LICENSE`](LICENSE) for details.

---

Made with 🥑 by [aoxilus](https://github.com/aoxilus)
