/**
 * ChromaMatrix - Color Space & Metrics Module
 * Provides sRGB <-> CIEXYZ <-> CIELAB conversions and CIE76 / CIEDE2000 color difference metrics.
 * 
 * 🥑 by aoxilus (https://github.com/aoxilus) · CC BY-NC-SA 4.0 (Attribution-NonCommercial-ShareAlike)
 */

// D65 Standard Illuminant reference white point
const D65 = {
  X: 0.95047,
  Y: 1.00000,
  Z: 1.08883
};

/**
 * Convert 8-bit sRGB to normalized linear RGB [0, 1]
 */
export function srgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/**
 * Convert linear RGB [0, 1] to 8-bit sRGB [0, 255]
 */
export function linearToSrgb(v) {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(c * 255)));
}

/**
 * Convert sRGB [0-255, 0-255, 0-255] to CIEXYZ
 */
export function rgbToXyz(r, g, b) {
  const rLin = srgbToLinear(r);
  const gLin = srgbToLinear(g);
  const bLin = srgbToLinear(b);

  // sRGB D65 transformation matrix
  const x = rLin * 0.4124564 + gLin * 0.3575761 + bLin * 0.1804375;
  const y = rLin * 0.2126729 + gLin * 0.7151522 + bLin * 0.0721750;
  const z = rLin * 0.0193339 + gLin * 0.1191920 + bLin * 0.9503041;

  return { x, y, z };
}

/**
 * Convert CIEXYZ to CIELAB (L*, a*, b*)
 * L*: Lightness [0, 100]
 * a*: Green-Red axis [-128, +127]
 * b*: Blue-Yellow axis [-128, +127]
 */
export function xyzToLab(x, y, z) {
  const xR = x / D65.X;
  const yR = y / D65.Y;
  const zR = z / D65.Z;

  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

  const fx = f(xR);
  const fy = f(yR);
  const fz = f(zR);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return { L, a, b };
}

/**
 * Direct conversion from sRGB [0-255] to CIELAB
 */
export function rgbToLab(r, g, b) {
  const { x, y, z } = rgbToXyz(r, g, b);
  return xyzToLab(x, y, z);
}

/**
 * Convert CIELAB to CIEXYZ
 */
export function labToXyz(L, a, b) {
  const fy = (L + 16) / 116;
  const fx = a / 500 + fy;
  const fz = fy - b / 200;

  const fx3 = fx * fx * fx;
  const fy3 = fy * fy * fy;
  const fz3 = fz * fz * fz;

  const xR = fx3 > 0.008856 ? fx3 : (fx - 16 / 116) / 7.787;
  const yR = L > 8.0 ? fy3 : (L / 903.3);
  const zR = fz3 > 0.008856 ? fz3 : (fz - 16 / 116) / 7.787;

  return {
    x: xR * D65.X,
    y: yR * D65.Y,
    z: zR * D65.Z
  };
}

/**
 * Convert CIEXYZ to sRGB [0-255]
 */
export function xyzToRgb(x, y, z) {
  const rLin = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  const gLin = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  const bLin = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  return {
    r: linearToSrgb(rLin),
    g: linearToSrgb(gLin),
    b: linearToSrgb(bLin)
  };
}

/**
 * Direct conversion from CIELAB to sRGB [0-255]
 */
export function labToRgb(L, a, b) {
  const { x, y, z } = labToXyz(L, a, b);
  return xyzToRgb(x, y, z);
}

/**
 * CIE76 Euclidean Color Distance in LAB space
 */
export function deltaE76(lab1, lab2) {
  const dL = lab1.L - lab2.L;
  const da = lab1.a - lab2.a;
  const db = lab1.b - lab2.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * CIEDE2000 Color Difference Formula (International Standard for perceptual accuracy)
 */
export function deltaE2000(lab1, lab2) {
  const L1 = lab1.L, a1 = lab1.a, b1 = lab1.b;
  const L2 = lab2.L, a2 = lab2.a, b2 = lab2.b;

  const rad2deg = 180 / Math.PI;
  const deg2rad = Math.PI / 180;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const avgC = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7))));

  const a1p = (1 + G) * a1;
  const a2p = (1 + G) * a2;

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p) * rad2deg;
  if (h1p < 0) h1p += 360;

  let h2p = Math.atan2(b2, a2p) * rad2deg;
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h2p - h1p) <= 180) {
      dhp = h2p - h1p;
    } else if (h2p - h1p > 180) {
      dhp = h2p - h1p - 360;
    } else {
      dhp = h2p - h1p + 360;
    }
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * deg2rad);

  const avgLp = (L1 + L2) / 2;
  const avgCp = (C1p + C2p) / 2;

  let avghp = 0;
  if (C1p * C2p !== 0) {
    if (Math.abs(h1p - h2p) <= 180) {
      avghp = (h1p + h2p) / 2;
    } else if (h1p + h2p < 360) {
      avghp = (h1p + h2p + 360) / 2;
    } else {
      avghp = (h1p + h2p - 360) / 2;
    }
  }

  const T = 1 - 0.17 * Math.cos((avghp - 30) * deg2rad)
            + 0.24 * Math.cos((2 * avghp) * deg2rad)
            + 0.32 * Math.cos((3 * avghp + 6) * deg2rad)
            - 0.20 * Math.cos((4 * avghp - 63) * deg2rad);

  const dTheta = 30 * Math.exp(-Math.pow((avghp - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const SL = 1 + (0.015 * Math.pow(avgLp - 50, 2)) / Math.sqrt(20 + Math.pow(avgLp - 50, 2));
  const SC = 1 + 0.045 * avgCp;
  const SH = 1 + 0.015 * avgCp * T;
  const RT = -Math.sin(2 * dTheta * deg2rad) * RC;

  const dE = Math.sqrt(
    Math.pow(dLp / SL, 2) +
    Math.pow(dCp / SC, 2) +
    Math.pow(dHp / SH, 2) +
    RT * (dCp / SC) * (dHp / SH)
  );

  return dE;
}

/**
 * Normalizes an RGB sample against measured paper white and black reference patches.
 * Removes lighting color casts (e.g. warm yellow tungsten lamp, cool blue office light).
 */
export function normalizeWhiteBalance(sampleRgb, paperWhiteRgb, blackRefRgb) {
  // If no reference points, return sample as-is
  if (!paperWhiteRgb || !blackRefRgb) return sampleRgb;

  const normalizeChannel = (val, white, black) => {
    const range = Math.max(10, white - black);
    const normalized = ((val - black) / range) * 255;
    return Math.min(255, Math.max(0, Math.round(normalized)));
  };

  return {
    r: normalizeChannel(sampleRgb.r, paperWhiteRgb.r, blackRefRgb.r),
    g: normalizeChannel(sampleRgb.g, paperWhiteRgb.g, blackRefRgb.g),
    b: normalizeChannel(sampleRgb.b, paperWhiteRgb.b, blackRefRgb.b)
  };
}

/**
 * Convert RGB to Hex String (e.g. #FF5733)
 */
export function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert Hex String to RGB object
 */
export function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}
