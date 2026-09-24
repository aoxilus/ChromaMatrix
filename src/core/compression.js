/**
 * ChromaMatrix payload compression.
 *
 * Compression is applied before Reed-Solomon so the matrix stores fewer
 * symbols while ECC still protects the compressed byte stream.
 */

export const COMPRESSION_MODES = Object.freeze({
  NONE: 'none',
  GZIP: 'gzip',
  BROTLI: 'brotli'
});

export const COMPRESSION_IDS = Object.freeze({
  none: 0,
  gzip: 1,
  brotli: 2
});

export function compressionIdFromMode(mode) {
  return COMPRESSION_IDS[mode] ?? 0;
}

export function compressionModeFromId(id) {
  return Object.keys(COMPRESSION_IDS).find(mode => COMPRESSION_IDS[mode] === id) || COMPRESSION_MODES.NONE;
}

function asUint8Array(value) {
  return value instanceof Uint8Array
    ? value
    : new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
}

async function streamTransform(bytes, format) {
  if (typeof CompressionStream === 'undefined') {
    throw new Error(`${format} compression is not available in this runtime`);
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function streamDecompress(bytes, format) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error(`${format} decompression is not available in this runtime`);
  }

  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(format));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function getBrotli() {
  if (typeof process !== 'undefined' && process.versions?.node) {
    const zlib = await import('node:zlib');
    return {
      compress: (bytes, options) => new Uint8Array(zlib.brotliCompressSync(Buffer.from(bytes), {
        params: options?.quality ? {
          [zlib.constants.BROTLI_PARAM_QUALITY]: options.quality
        } : undefined
      })),
      decompress: bytes => new Uint8Array(zlib.brotliDecompressSync(Buffer.from(bytes)))
    };
  }

  const module = await import('../vendor/brotli/index.web.js');
  return module.default;
}

export async function compressBytes(bytes, mode = COMPRESSION_MODES.NONE, options = {}) {
  const input = asUint8Array(bytes);
  if (mode === COMPRESSION_MODES.NONE) return input;
  if (mode === COMPRESSION_MODES.GZIP) {
    if (typeof process !== 'undefined' && process.versions?.node) {
      const zlib = await import('node:zlib');
      return new Uint8Array(zlib.gzipSync(Buffer.from(input), { level: options.level ?? 9 }));
    }
    return streamTransform(input, 'gzip');
  }
  if (mode === COMPRESSION_MODES.BROTLI) {
    const brotli = await getBrotli();
    return asUint8Array(brotli.compress(input, { quality: options.quality ?? 5 }));
  }
  throw new Error(`Unsupported compression mode: ${mode}`);
}

export async function decompressBytes(bytes, mode = COMPRESSION_MODES.NONE) {
  const input = asUint8Array(bytes);
  if (mode === COMPRESSION_MODES.NONE) return input;
  if (mode === COMPRESSION_MODES.GZIP) {
    if (typeof process !== 'undefined' && process.versions?.node) {
      const zlib = await import('node:zlib');
      return new Uint8Array(zlib.gunzipSync(Buffer.from(input)));
    }
    return streamDecompress(input, 'gzip');
  }
  if (mode === COMPRESSION_MODES.BROTLI) {
    const brotli = await getBrotli();
    return asUint8Array(brotli.decompress(input));
  }
  throw new Error(`Unsupported compression mode: ${mode}`);
}
