/**
 * ChromaMatrix binary format locator.
 *
 * A reserved black/white horizontal line gives a camera, OCR system, or AI
 * a simple binary preamble before it has to understand the color payload.
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

  return {
    text,
    payload,
    bits,
    footprint: bits.length
  };
}

export function isBinaryLocatorCell(gx, gy, gridSize, locator = createBinaryLocator()) {
  const end = BINARY_LOCATOR_START + locator.footprint;
  return gridSize >= end + BINARY_LOCATOR_START &&
    gy === BINARY_LOCATOR_ROW && gx >= BINARY_LOCATOR_START && gx < end;
}

export function getBinaryLocatorCell(gx, gy, locator = createBinaryLocator()) {
  if (!isBinaryLocatorCell(gx, gy, gridSizeForLocator(locator), locator)) return false;
  return locator.bits[gx - BINARY_LOCATOR_START] === 1;
}

function gridSizeForLocator(locator) {
  return BINARY_LOCATOR_START + locator.footprint + BINARY_LOCATOR_START;
}

export function decodeBinaryLocator(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const text = new TextDecoder().decode(data);
  return text === BINARY_LOCATOR_TEXT ? text : null;
}
