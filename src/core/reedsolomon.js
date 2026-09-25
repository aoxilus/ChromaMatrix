/**
 * ChromaMatrix - Reed-Solomon Error Correction Code (RS-ECC)
 * Galois Field GF(2^8) with primitive polynomial 0x11D (x^8 + x^4 + x^3 + x^2 + 1).
 * Standard polynomial representation (highest degree at index 0).
 * 
 * 🥑 by aoxilus (https://github.com/aoxilus) · CC BY-NC-SA 4.0 (Attribution-NonCommercial-ShareAlike)
 */

const PRIMITIVE_POLYNOMIAL = 0x11d;
const GF_SIZE = 256;

// Keep every RS codeword below the 255-symbol limit of GF(256), while
// allowing the public 50% ECC setting to be real rather than capped at 64.
export const DEFAULT_ECC_RATIO = 0.5;
export const MAX_ECC_RATIO = 0.5;
export const RS_MAX_BLOCK_DATA = 160;
export const RS_MAX_ECC_SYMBOLS = 80;

// Precompute Galois Field tables
const EXP_TABLE = new Uint8Array(GF_SIZE * 2);
const LOG_TABLE = new Uint8Array(GF_SIZE);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP_TABLE[i] = x;
    EXP_TABLE[i + 255] = x;
    LOG_TABLE[x] = i;
    x <<= 1;
    if (x & 0x100) {
      x ^= PRIMITIVE_POLYNOMIAL;
    }
  }
  LOG_TABLE[0] = 0;
})();

export function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]];
}

export function gfDiv(a, b) {
  if (b === 0) throw new Error('Division by zero in GF(256)');
  if (a === 0) return 0;
  return EXP_TABLE[(LOG_TABLE[a] + 255 - LOG_TABLE[b]) % 255];
}

export function gfInv(a) {
  if (a === 0) throw new Error('Cannot invert zero in GF(256)');
  return EXP_TABLE[255 - LOG_TABLE[a]];
}

export function gfAdd(a, b) {
  return a ^ b;
}

function polyScale(p, x) {
  const res = new Uint8Array(p.length);
  for (let i = 0; i < p.length; i++) {
    res[i] = gfMul(p[i], x);
  }
  return res;
}

function polyAdd(p, q) {
  const maxLen = Math.max(p.length, q.length);
  const res = new Uint8Array(maxLen);
  const pOffset = maxLen - p.length;
  const qOffset = maxLen - q.length;

  for (let i = 0; i < p.length; i++) res[i + pOffset] ^= p[i];
  for (let i = 0; i < q.length; i++) res[i + qOffset] ^= q[i];

  return res;
}

function polyMul(p, q) {
  const res = new Uint8Array(p.length + q.length - 1);
  for (let i = 0; i < p.length; i++) {
    for (let j = 0; j < q.length; j++) {
      res[i + j] ^= gfMul(p[i], q[j]);
    }
  }
  return res;
}

function polyEval(poly, x) {
  let y = poly[0];
  for (let i = 1; i < poly.length; i++) {
    y = gfMul(y, x) ^ poly[i];
  }
  return y;
}

/**
 * Generate Reed-Solomon Generator Polynomial for n ECC symbols:
 * g(x) = (x - alpha^0)(x - alpha^1)...(x - alpha^(n-1))
 */
export function rsGeneratorPoly(eccLen) {
  let g = new Uint8Array([1]);
  for (let i = 0; i < eccLen; i++) {
    g = polyMul(g, new Uint8Array([1, EXP_TABLE[i]]));
  }
  return g;
}

/**
 * Encode message bytes using Reed-Solomon ECC.
 */
export function rsEncodeBlock(dataBytes, eccLen) {
  const gen = rsGeneratorPoly(eccLen);
  const msgLen = dataBytes.length;
  const out = new Uint8Array(msgLen + eccLen);
  out.set(dataBytes, 0);

  for (let i = 0; i < msgLen; i++) {
    const coef = out[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        out[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }

  const fullBlock = new Uint8Array(msgLen + eccLen);
  fullBlock.set(dataBytes, 0);
  fullBlock.set(out.subarray(msgLen), msgLen);
  return fullBlock;
}

/**
 * Calculate syndromes of a received codeword: S_i = msg(alpha^i)
 */
export function rsCalculateSyndromes(msg, eccLen) {
  const syndromes = new Uint8Array(eccLen);
  let hasErrors = false;
  for (let i = 0; i < eccLen; i++) {
    const syn = polyEval(msg, EXP_TABLE[i]);
    syndromes[i] = syn;
    if (syn !== 0) hasErrors = true;
  }
  return { syndromes, hasErrors };
}

/**
 * Berlekamp-Massey algorithm to compute error locator polynomial Lambda(x).
 * Lambda(x) = 1 + Lambda_1 * x + Lambda_2 * x^2 + ... + Lambda_v * x^v
 * Stored with lowest degree at index 0: [1, Lambda_1, Lambda_2, ...]
 */
function rsFindErrorLocator(syndromes, eccLen) {
  let lambda = [1];
  let b = [1];
  let l = 0;

  for (let r = 1; r <= eccLen; r++) {
    let delta = syndromes[r - 1];
    for (let j = 1; j <= l; j++) {
      if (j < lambda.length) {
        delta ^= gfMul(lambda[j], syndromes[r - 1 - j]);
      }
    }

    b.unshift(0);

    if (delta !== 0) {
      const t = [...lambda];
      const scaledB = b.map(c => gfMul(c, delta));

      const maxLen = Math.max(lambda.length, scaledB.length);
      const newLambda = new Array(maxLen).fill(0);
      for (let i = 0; i < lambda.length; i++) newLambda[i] ^= lambda[i];
      for (let i = 0; i < scaledB.length; i++) newLambda[i] ^= scaledB[i];

      if (2 * l < r) {
        l = r - l;
        b = t.map(c => gfMul(c, gfInv(delta)));
      }
      lambda = newLambda;
    }
  }

  while (lambda.length > 1 && lambda[lambda.length - 1] === 0) {
    lambda.pop();
  }

  return new Uint8Array(lambda);
}

/**
 * Chien search: Find error positions in msg (0 to msg.length - 1)
 */
function rsFindErrors(lambda, msgLen) {
  const errorPositions = [];
  const numErrors = lambda.length - 1;

  for (let i = 0; i < msgLen; i++) {
    const p = (msgLen - 1 - i) % 255;
    const invX = EXP_TABLE[(255 - p) % 255];

    let sum = lambda[0];
    let xPow = 1;
    for (let j = 1; j < lambda.length; j++) {
      xPow = gfMul(xPow, invX);
      sum ^= gfMul(lambda[j], xPow);
    }

    if (sum === 0) {
      errorPositions.push(i);
    }
  }

  if (errorPositions.length !== numErrors) {
    throw new Error(`Uncorrectable error: expected ${numErrors} errors, found ${errorPositions.length}`);
  }

  return errorPositions;
}

/**
 * Forney algorithm: Calculate error magnitudes and correct errors.
 */
function rsCorrectErrors(msg, syndromes, lambda, errorPositions) {
  const corrected = new Uint8Array(msg);
  const msgLen = msg.length;

  const eccLen = syndromes.length;
  const omega = new Uint8Array(eccLen);
  for (let i = 0; i < eccLen; i++) {
    let sum = 0;
    for (let j = 0; j <= i; j++) {
      if (j < lambda.length) {
        sum ^= gfMul(lambda[j], syndromes[i - j]);
      }
    }
    omega[i] = sum;
  }

  for (let i = 0; i < errorPositions.length; i++) {
    const pos = errorPositions[i];
    const power = (msgLen - 1 - pos) % 255;
    const x = EXP_TABLE[power]; // X_k
    const invX = EXP_TABLE[(255 - power) % 255]; // X_k^(-1)

    // Evaluate Omega(X_k^(-1))
    let num = 0;
    let invXPow = 1;
    for (let j = 0; j < omega.length; j++) {
      num ^= gfMul(omega[j], invXPow);
      invXPow = gfMul(invXPow, invX);
    }

    // Evaluate Lambda'(X_k^(-1)) = sum_{j is odd} lambda_j * (X_k^(-1))^(j - 1)
    let denom = 0;
    for (let j = 1; j < lambda.length; j += 2) {
      let term = lambda[j];
      let p = 1;
      for (let k = 0; k < j - 1; k++) {
        p = gfMul(p, invX);
      }
      denom ^= gfMul(term, p);
    }

    if (denom === 0) {
      throw new Error('Forney algorithm denominator is zero');
    }

    // Correct magnitude: e_k = X_k * Omega(X_k^(-1)) / Lambda'(X_k^(-1))
    const mag = gfMul(x, gfDiv(num, denom));
    corrected[pos] ^= mag;
  }

  return corrected;
}

/**
 * Decode a received codeword block.
 */
export function rsDecodeBlock(codeword, eccLen) {
  const { syndromes, hasErrors } = rsCalculateSyndromes(codeword, eccLen);
  const dataLen = codeword.length - eccLen;

  if (!hasErrors) {
    return {
      data: codeword.slice(0, dataLen),
      correctedErrors: 0,
      success: true
    };
  }

  try {
    const lambda = rsFindErrorLocator(syndromes, eccLen);
    const errorPositions = rsFindErrors(lambda, codeword.length);
    const correctedCodeword = rsCorrectErrors(codeword, syndromes, lambda, errorPositions);

    const verify = rsCalculateSyndromes(correctedCodeword, eccLen);
    if (verify.hasErrors) {
      return {
        data: codeword.slice(0, dataLen),
        correctedErrors: 0,
        success: false,
        error: 'Syndrome verification failed after error correction'
      };
    }

    return {
      data: correctedCodeword.slice(0, dataLen),
      correctedErrors: errorPositions.length,
      success: true
    };
  } catch (err) {
    return {
      data: codeword.slice(0, dataLen),
      correctedErrors: 0,
      success: false,
      error: err.message
    };
  }
}

/**
 * High-level Chunked RS Encoding for arbitrary length byte payloads.
 */
export function encodePayloadRS(payloadBytes, eccRatio = DEFAULT_ECC_RATIO) {
  const maxBlockSize = RS_MAX_BLOCK_DATA;
  const blocks = [];
  const normalizedRatio = Number.isFinite(eccRatio)
    ? Math.max(0, Math.min(MAX_ECC_RATIO, eccRatio))
    : DEFAULT_ECC_RATIO;

  // A final one-byte block with the full parity length wastes space. Spread
  // the payload evenly across the required blocks so the tail has comparable
  // protection and the metadata remains compact.
  const blockCount = Math.max(1, Math.ceil(payloadBytes.length / maxBlockSize));
  const blockDataSize = payloadBytes.length === 0
    ? 0
    : Math.ceil(payloadBytes.length / blockCount);
  const uniformEccLen = Math.max(
    4,
    Math.min(RS_MAX_ECC_SYMBOLS, Math.round(blockDataSize * normalizedRatio))
  );

  if (payloadBytes.length === 0) {
    return [{
      dataLen: 0,
      eccLen: uniformEccLen,
      blockBytes: rsEncodeBlock(new Uint8Array(), uniformEccLen)
    }];
  }

  let offset = 0;
  while (offset < payloadBytes.length) {
    const remaining = payloadBytes.length - offset;
    const chunkSize = Math.min(blockDataSize, remaining);

    const chunk = payloadBytes.slice(offset, offset + chunkSize);
    const encodedBlock = rsEncodeBlock(chunk, uniformEccLen);

    blocks.push({
      dataLen: chunkSize,
      eccLen: uniformEccLen,
      blockBytes: encodedBlock
    });
    offset += chunkSize;
  }

  return blocks;
}

/**
 * High-level Chunked RS Decoding
 */
export function decodePayloadRS(blocksMeta, receivedStream) {
  const recoveredData = [];
  let streamOffset = 0;
  let totalErrorsCorrected = 0;
  let hasFailure = false;

  for (const blockMeta of blocksMeta) {
    const totalBlockLen = blockMeta.dataLen + blockMeta.eccLen;
    const blockCodeword = receivedStream.slice(streamOffset, streamOffset + totalBlockLen);
    streamOffset += totalBlockLen;

    const result = rsDecodeBlock(blockCodeword, blockMeta.eccLen);
    if (!result.success) {
      hasFailure = true;
    }
    totalErrorsCorrected += result.correctedErrors;
    for (let b of result.data) {
      recoveredData.push(b);
    }
  }

  return {
    data: new Uint8Array(recoveredData),
    totalErrorsCorrected,
    success: !hasFailure
  };
}
