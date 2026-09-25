# 🥑 ChromaMatrix — Optical Color-Dot Paper Data Storage & Decoder

> **Offline optical data storage on standard paper and stickers using high-density color dots, real-time CIELAB perceptual calibration, and Reed-Solomon $GF(2^8)$ error recovery.**

> **[Read in English 🇺🇸](README.md)** · **[Leer en Español 🇪🇸](README.es.md)**

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Author: aoxilus](https://img.shields.io/badge/Author-aoxilus%20🥑-brightgreen.svg)](https://github.com/aoxilus)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-blue.svg)](https://nodejs.org)

---

## Key Features

1. **Reserved Black & White Framing**: QR-style nested square corner fiducials, timing tracks, and dynamic range calibration targets strictly reserve pure Black and Paper White for spatial/exposure registration.
2. **On-Sheet Self-Calibrating Swatches**: Reference palette swatches printed along the borders allow the decoder to normalize for printer CMYK gamuts, paper reflectance, and ambient camera lighting shifts.
3. **Multi-Mode Color Palettes**:
   - `PALETTE_8` (3 bits/dot): Default Android/phone contract with separated spectra.
   - `PALETTE_16` (4 bits = 1 nibble/dot, 2 dots/byte): Optimal density and stability.
   - `PALETTE_64` (6 bits/dot): Base64 symbol packing.
   - `ASCII_95` (95 symbols): Binary-safe base-95 packing for arbitrary payload bytes.
   - `PALETTE_256` (8 bits / 1 byte per dot): Maximum byte density.
4. **Reed-Solomon Error Correction Code (RS-ECC)**: Full Galois Field $GF(2^8)$ arithmetic with Berlekamp-Massey algorithm to automatically recover from paper smudges, print bleed, or optical glare.
5. **Printer & Scanner Fidelity Benchmark Lab**: Measures physical color shifts ($\Delta E$), confusion matrices, and recommends the optimal palette for your specific printer and camera setup.
6. **Zero-Dependency Architecture**: Built using pure JavaScript/HTML5 Canvas in the browser and pure Node.js on the server/CLI.
7. **Bilingual UI (English & Spanish)**: Live language toggle directly in the web interface.
8. **Payload Compression**: Optional GZIP or Brotli compression runs before Reed-Solomon to reduce matrix size while preserving automatic decoding.
9. **Binary Format Signature**: A reserved horizontal black-and-white ASCII-binary line spells `ChromaMatrix` before color decoding begins, so an AI can identify the format and find its source repository.

---

## Prior Art & Theoretical Foundation

For an in-depth analysis of related systems (Microsoft HCCB, Zebra Ultracode, Twibright Optar, PaperBack, HCC2D, MMCC, CIELAB color theory) and a complete comparative matrix, see:
👉 **[Documentation: State of the Art & Prior Art Analysis](docs/PRIOR_ART_AND_COMPARISON.md)** (or **[Leer en Español](docs/PRIOR_ART_AND_COMPARISON.es.md)**)

---

## Quick Start

### 1. Open Production

The live production application is available at:
👉 **<https://esail.ac.tamu.edu/pdata/>**

The source repository is [`aoxilus/ChromaMatrix`](https://github.com/aoxilus/ChromaMatrix).

### 2. Start the Interactive Web Application Locally
```bash
npm start
```
Open **`http://localhost:3000`** in your browser to access:
- **Encode**: Generate color-dot matrices and export them as SVG, PNG, or print.
- **Decode**: Read an uploaded, pasted, or camera-captured matrix.
- **Wiki**: Purpose, workflow, capacity, color calibration, and CIELAB notes.
- **Print test**: Generate and analyze printer calibration targets.

### 3. Run CLI Commands

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

### 4. Run Automated Tests
```bash
npm test
```

### 5. Android Reader

Open [`android/`](android/) in Android Studio. It targets Android 11+ and
packages the local web reader, including upload, paste, and camera decoding.
The phone-safe default is `PALETTE_8`; existing palette modes remain readable.

### Verified encode/decode contract

- `ASCII_95` uses reversible base-95 packing and preserves arbitrary binary
  Reed-Solomon codewords through a downloaded PNG.
- The default/max ECC setting is 50% parity: 160 data bytes plus 80 parity
  symbols per block, correcting up to 40 corrupted symbols in that block.
- `npm test` covers real PNG serialization and decoding for all five palettes
  and all three compression modes.
- Brotli remains the general-purpose density choice. A 256-color palette is
  denser digitally but is much less reliable under physical color drift.

### Verified status

The automated PNG matrix passes 15/15 cases. For handheld camera capture,
`PALETTE_8` and `PALETTE_16` remain the recommended modes.

---

## 📌 Roadmap & Pending Optimizations

Techniques identified for future density and throughput upgrades:

- [x] **Stream Compression Pipelines (Gzip / Brotli)**: Optional pre-compression of text payloads before symbol packing, reducing required physical dot grid size on repetitive content.
- [ ] **Language-Aware Huffman & Tokenization (BPE / Byte-Pair Encoding)**: Assign shorter chromatic symbol sequences to high-frequency syllables and dictionary words based on language statistics.
- [ ] **Efficient Binary-to-Symbol Mapping**: Optimized Base85 / Z85 vs raw byte multiplexing to maximize entropy per printed dot without ballooning character counts.
- [ ] **Metadata Deduplication & Short Hashing**: Optional content-addressable hash headers for multi-page document sequencing.

---

## License

Licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)** license. See [`LICENSE`](LICENSE) for details.

---

Made with 🥑 by [aoxilus](https://github.com/aoxilus)
