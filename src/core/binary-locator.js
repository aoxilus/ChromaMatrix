/**
 * ChromaMatrix binary format locator.
 *
 * A reserved black/white 2D block gives a camera, OCR system, or AI a simple
 * binary preamble before it has to understand the color payload.
 */

export const BINARY_LOCATOR_TEXT = 'ChromaMatrix';
export const BINARY_LOCATOR_ROW = 8;
export const BINARY_LOCATOR_START = 8;

export function createBinaryLocator(text = BINARY_LOCATOR_TEXT) {
  const payload = new TextEncoder().encode(text);
  const bits = [];
  for (const byte of payload) {
    for (let bit = 7; bit >= 0; bit--) bits.push((byte >> bit) & 1);
  }

  // Pack the signature into a compact 2D block. The old horizontal layout
  // forced every matrix to be at least 113x113.
  const width = Math.max(1, Math.ceil(Math.sqrt(bits.length)));
  const height = Math.max(1, Math.ceil(bits.length / width));

  return {
    text,
    payload,
    bits,
    footprint: bits.length,
    width,
    height
  };
}

export function isBinaryLocatorCell(gx, gy, gridSize, locator = createBinaryLocator()) {
  const localX = gx - BINARY_LOCATOR_START;
  const localY = gy - BINARY_LOCATOR_ROW;
  // Leave the calibration ring (at gridSize - 8) outside the signature block.
  const fitsGrid = gridSize >= BINARY_LOCATOR_START + locator.width + 9 &&
    gridSize >= BINARY_LOCATOR_ROW + locator.height + 9;

  return fitsGrid &&
    localX >= 0 && localX < locator.width &&
    localY >= 0 && localY < locator.height;
}

export function getBinaryLocatorCell(gx, gy, locator = createBinaryLocator()) {
  const localX = gx - BINARY_LOCATOR_START;
  const localY = gy - BINARY_LOCATOR_ROW;
  if (localX < 0 || localX >= locator.width ||
      localY < 0 || localY >= locator.height) {
    return false;
  }

  const bitIndex = localY * locator.width + localX;
  return locator.bits[bitIndex] === 1;
}

export function decodeBinaryLocator(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const text = new TextDecoder().decode(data);
  return text === BINARY_LOCATOR_TEXT ? text : null;
}
