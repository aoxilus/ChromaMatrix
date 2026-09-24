# 🥑 ChromaMatrix — State of the Art, Prior Art & Technical Comparison

> **[Read in English 🇺🇸](PRIOR_ART_AND_COMPARISON.md)** · **[Leer en Español 🇪🇸](PRIOR_ART_AND_COMPARISON.es.md)**

Live production: <https://esail.ac.tamu.edu/pdata/> · Source repository:
<https://github.com/aoxilus/ChromaMatrix>

---

## 1. Executive Summary

**ChromaMatrix** stands at the intersection of two computational disciplines:
1. **High-Capacity Color 2D Optical Barcodes**
2. **Optical Paper Cold Storage & Air-Gapped Physical Data Archival**

The foundational principle is utilizing the chromatic color dimension (3D RGB/CMYK or perceptual $L^*a^*b^*$ space) to break past the theoretical 1 bit/cell limit of traditional monochrome 2D symbologies (such as QR Code and Data Matrix), achieving between 3 and 8 bits per printed physical dot, shielded by **Reed-Solomon Error Correction Code (RS-ECC)** over Galois Field $GF(2^8)$.

This document consolidates prior patent, academic, and open-source research over the last 30+ years, detailing how **ChromaMatrix** builds upon and differentiates from existing state-of-the-art systems.

---

## 2. Chronology & Taxonomy of Prior Art (1985 – Present)

```
[1985] Cauzin Softstrip ──> Optical paper tape in computing magazines (B/W analog-digital)
   │
[2007] Twibright Optar ───> Binary file backup on A4 paper (Golay ECC, B/W)
[2007] MS HCCB / Tag ─────> 4- & 8-color triangular matrices (Microsoft Research)
[2008] PaperBack ─────────> Back up to 5.8 MB per A4 sheet (Reed-Solomon, B/W 600 DPI)
[2008] MMCC (Stanford) ───> Color-channel multiplexing for mobile camera transmission
   │
[2011] HCC2D (Querini) ───> Color QR code with perimeter reference cells
[2012] COBRA / PMCode ────> CIELAB ΔE distance metrics for chromatic aberration resilience
[2015] Zebra Ultracode ───> Industrial color 2D barcode standard (AIM/ISO 2023)
   │
[TODAY] ChromaMatrix ─────> Multi-palette paper & sticker storage, real-time CIELAB calibration,
                            hardware fidelity benchmark lab, and zero-dependency Web/Node stack.
```

---

### A. Precursors in Paper Data Storage (*Cold Storage*)

#### 1. Cauzin Softstrip (1985)
* **Historical Pioneer.** Proprietary optical storage system created by Cauzin Systems.
* Printed digital software programs directly into printed magazine pages (for Apple II, Commodore 64, IBM PC), which users scanned with a motorized optical wand reader.
* **Limitation:** Bound to proprietary scanning hardware with very low data density (~500 bytes per strip).

#### 2. Twibright Optar (2007)
* **Author:** Twibright Labs (Open Source).
* **Technology:** Encodes arbitrary binary files into printable matrices on laser printers for A4 paper.
* **Capacity:** ~200 KB to 1 MB per page.
* **Error Correction:** Golay (23,12) code (the same code used by the Voyager space probes).
* **Difference with ChromaMatrix:** Optar is strictly monochrome (B/W pixels and crosses). It does not leverage color, limiting physical data density.

#### 3. PaperBack (2008)
* **Author:** Piotr Bushuev.
* **Technology:** Windows software for backing up files onto A4 paper sheets at 600 DPI with built-in compression.
* **Capacity:** Up to 5.8 MB per page in ideal laboratory conditions.
* **Error Correction:** Reed-Solomon.
* **Limitations:**
  - Requires a high-end flatbed scanner calibrated to 600+ DPI; practically unreadable by standard smartphone cameras due to lack of adaptive perspective and illumination normalization.
  - Relying on 1-pixel monochrome microdots makes it vulnerable to paper dust, print bleed, and ink smudges.

---

### B. Industrial & Commercial 2D Color Barcode Symbologies

#### 1. High Capacity Color Barcode (HCCB) / Microsoft Tag (2007–2015)
* **Developer:** Gavin Jancke (Microsoft Research).
* **Structure:** Grid of 4- or 8-color triangles bounded by a black border and alignment bars.
* **Key Contribution:** Proved the feasibility of packing multiple bits per cell using color palettes.
* **Decline:** Commercialized as *Microsoft Tag* for URL redirection and marketing. The rise of fast autofocus smartphone cameras and open, royalty-free standard monochrome QR codes led to its retirement in 2015.

#### 2. Ultracode (Zebra Technologies, 2015 / AIM Standard 2023)
* **Developer:** Zebra Technologies.
* **Structure:** High-density 2D matrix symbology using up to 8 colors and grayscale, with Reed-Solomon Error Correction (RSEC).
* **Focus:** Industrial asset tracking, healthcare/pharma labeling, designed for standard sRGB-compliant scanners and industrial imagers.

---

### C. Specialized Academic Research

#### 1. HCC2D (High Capacity Colored 2-Dimensional Code) — Querini et al. (2011–2014)
* **Institution:** University of Rome Tor Vergata.
* **Innovation:** Enhanced standard QR codes with 4, 8, and 16 colors.
* **Calibration Mechanism:** Introduced **perimeter reference color cells** so the vision decoder could calculate the distortion transformation (printer CMYK $\rightarrow$ paper reflectance $\rightarrow$ camera RGB sensor).

#### 2. MMCC (Mobile Multi-Colour Composite Code) — Stanford University (2008)
* **Innovation:** Color-division multiplexing to increase transmission throughput for low-resolution mobile cameras, modeling JPEG compression artifacts at cell boundaries.

#### 3. Rainbow Barcodes & Color Calibration Models — HP Labs & Purdue University (2007–2010)
* **Contribution:** Formal mathematical modeling of nonlinear transforms between subtractive printer inks (CMY/CMYK) and additive camera sensors (RGB), demonstrating the necessity of localized reference swatches.

#### 4. COBRA & PMCode (2012–2015)
* **Contribution:** Introduced perceptual **CIELAB ($L^*a^*b^*$)** color space and $\Delta E$ Euclidean distance metrics to decouple luminance shifts ($L^*$) from chromatic color information ($a^*, b^*$).

---

## 3. Technical Comparison Matrix

| Feature | Twibright Optar (2007) | PaperBack (2008) | Microsoft HCCB (2007) | HCC2D (2014) | **ChromaMatrix (2026)** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Symbology Type** | Monochrome (B/W) | Monochrome (B/W) | Color (Triangles) | Color (QR Modules) | **Color (Modular Matrix)** |
| **Bits per Dot/Cell** | 1 bit | 1 bit | 2 to 3 bits | 2 to 4 bits | **3 to 8 bits** (Multi-palette) |
| **Color Space** | Luminance Threshold | Binary Threshold | Local RGB Space | Sampled RGB | **Perceptual CIELAB ($L^*a^*b^*$) with $\Delta E$ metrics** |
| **Color Calibration** | N/A | N/A | Reference bars | Perimeter cells | **On-Sheet Palette Swatches + Reserved B/W Dynamic Range** |
| **Error Correction** | Golay (23,12) | Reed-Solomon | Reed-Solomon | Reed-Solomon | **Reed-Solomon $GF(2^8)$ with Berlekamp-Massey** |
| **Lighting Tolerance** | Moderate (Flatbed) | Low (Light sensitive) | Moderate | High | **Very High (Photometric background normalization + CIELAB)** |
| **Fidelity Diagnostics** | None | None | None | None | **Built-in Printer & Scanner Fidelity Lab ($\Delta E$ & Confusion Matrix)** |
| **Runtime Stack** | C Binary (Linux) | Win32 Binary (.exe) | Proprietary / DLL | MATLAB/C Prototypes | **Pure Web (Canvas/Webcam) + Node.js CLI (Zero-dependency)** |
| **Primary Use Cases** | Document archival | File backups | Marketing links | Academic research | **Cold Storage, UV Stickers, Air-Gapped Crypto Backups** |

---

## 4. Architectural Innovations in ChromaMatrix

ChromaMatrix synthesizes 20+ years of optical storage research into a modern, production-grade architecture:

### 1. CIELAB Perceptual Uniformity Decoupling
Rather than calculating Euclidean distance in RGB space (where shadow gradients or warm room bulbs distort $R, G, B$ values unevenly), ChromaMatrix converts camera pixel samples into **CIE $L^*a^*b^*$**:
$$\Delta E = \sqrt{(\Delta L^*)^2 + (\Delta a^*)^2 + (\Delta b^*)^2}$$
This makes color dot classification largely invariant to ambient illumination brightness shifts across the sheet.

### 2. Reserved Pure Black & White Dynamic Range Registration
* The 4 corner finder markers and perimeter timing tracks strictly reserve **Pure Black ($L^* \approx 0$)** and **Paper White ($L^* \approx 100$)**.
* This provides an instant baseline of the maximum dynamic range of the camera sensor and paper reflectance.

### 3. On-Sheet Self-Calibrating Swatches
Every generated matrix prints physical swatches of all active palette colors along its borders.
The decoder reads these physical swatches first to construct a **live dynamic color profile**, automatically compensating for specific printer ink fading and camera sensor color balance.

### 4. Multi-Tier Adaptive Palette Modes
* **`PALETTE_8` (3 bits/dot):** Maximum contrast for degraded paper, low-cost inkjet printers, and outdoor UV stickers.
* **`PALETTE_16` (4 bits/dot = 1 nibble):** Optimal balance between density and optical stability (exact 2 dots per byte).
* **`PALETTE_64` (6 bits/dot):** Direct Base64 stream packing.
* **`ASCII_95` (Printable ASCII 32–126):** Direct 1-to-1 character assignment for plaintext source code, keys, and manual text.
* **`PALETTE_256` (8 bits/dot = 1 byte):** Maximum theoretical byte density for high-resolution flatbed scanners.

### 5. Integrated Printer & Scanner Fidelity Lab
Allows users to print a standardized calibration sheet, photograph or scan it, and receive:
* A full **color confusion matrix**.
* Average measured physical color shift ($\Delta E$).
* Automated palette recommendation tailored specifically to their printer ink and camera setup.

---

## 5. References & Academic Citations

1. **G. Jancke (Microsoft Corp.)**, *"Color barcode and method of decoding same"*, US Patent 7,789,298 B2 (2010).
2. **R. Querini, G. F. Italiano**, *"Facilitating color barcodes decoding with reference color cells"*, In *Proceedings of the 2011 ACM Symposium on Applied Computing (SAC)*, pp. 248–253, 2011.
3. **R. Querini, G. F. Italiano**, *"Color Barcodes for Mobile Phones: A Survey"*, *International Journal of Computer Science and Applications*, Vol. 11, No. 1, pp. 41–66, 2014.
4. **H. Kato, K. T. Tan, D. Chai**, *"Barcodes for Mobile Devices"*, Cambridge University Press, 2010.
5. **C. Peikari, S. Raman, K. J. Ray Liu**, *"Multi-Colour Composite 2D Barcode (MMCC) for High Capacity Mobile Transmission"*, IEEE Transactions on Multimedia, 2008.
6. **Twibright Labs**, *"Optar: Optical Archiver for Paper Storage"*, 2007. [https://twibright.com/optar/](https://twibright.com/optar/)
7. **P. Bushuev**, *"PaperBack: Backup data to paper sheets"*, 2008.
8. **AIM Inc. / Zebra Technologies**, *"Ultracode Symbology Specification"*, AIM Standard / ISO/IEC, 2023.

---

Made with 🥑 by [aoxilus](https://github.com/aoxilus) · Licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)
