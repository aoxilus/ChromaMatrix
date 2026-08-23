/**
 * Unit tests for Reed-Solomon Error Correction Code
 */

import { rsEncodeBlock, rsDecodeBlock, encodePayloadRS, decodePayloadRS } from '../src/core/reedsolomon.js';

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running Reed-Solomon Tests ---');

// Test 1: Simple single-block encode and decode without errors
{
  const data = new TextEncoder().encode('Hello World 123');
  const eccLen = 8; // Can correct up to 4 byte errors
  const encoded = rsEncodeBlock(data, eccLen);

  const decoded = rsDecodeBlock(encoded, eccLen);
  assert(decoded.success, 'Error-free decode should succeed');
  assert(decoded.correctedErrors === 0, 'No errors should be reported');
  const decodedText = new TextDecoder().decode(decoded.data);
  assert(decodedText === 'Hello World 123', `Decoded text mismatch: expected "Hello World 123", got "${decodedText}"`);
  console.log('✓ Test 1: Clean decode passed');
}

// Test 2: Single block with 3 corrupted bytes (within capacity of 8 ECC symbols)
{
  const data = new TextEncoder().encode('The quick brown fox jumps over the lazy dog');
  const eccLen = 10; // Can correct up to 5 byte errors
  const encoded = rsEncodeBlock(data, eccLen);

  // Corrupt 4 bytes at various locations
  const corrupted = new Uint8Array(encoded);
  corrupted[2] = 0xAA;
  corrupted[15] = 0xBB;
  corrupted[30] = 0xCC;
  corrupted[corrupted.length - 2] = 0xDD; // Corrupt an ECC parity byte too

  const decoded = rsDecodeBlock(corrupted, eccLen);
  assert(decoded.success, 'Corrupted decode should succeed within capacity');
  assert(decoded.correctedErrors === 4, `Expected 4 corrected errors, got ${decoded.correctedErrors}`);
  const decodedText = new TextDecoder().decode(decoded.data);
  assert(decodedText === 'The quick brown fox jumps over the lazy dog', 'Corrected text matches original');
  console.log('✓ Test 2: 4-error correction passed');
}

// Test 3: Chunked payload encoding & decoding with burst errors
{
  const longText = 'ChromaMatrix optical color data storage enables high-density data printing on standard paper! '
    + 'By using self-calibrating reference swatches and Reed-Solomon error correction, '
    + 'even smudges, printer ink fading, and camera distortions can be corrected.';
  const payloadBytes = new TextEncoder().encode(longText);

  const blocks = encodePayloadRS(payloadBytes, 0.25);
  const totalStreamLen = blocks.reduce((sum, b) => sum + b.blockBytes.length, 0);
  const stream = new Uint8Array(totalStreamLen);
  let offset = 0;
  for (const b of blocks) {
    stream.set(b.blockBytes, offset);
    offset += b.blockBytes.length;
  }

  // Inject random noise into stream
  const noisyStream = new Uint8Array(stream);
  for (let i = 0; i < noisyStream.length; i += 12) {
    noisyStream[i] ^= 0x55;
  }

  const result = decodePayloadRS(blocks, noisyStream);
  assert(result.success, 'Chunked RS decode succeeded');
  const recoveredText = new TextDecoder().decode(result.data);
  assert(recoveredText === longText, 'Recovered long text matches original exactly');
  console.log(`✓ Test 3: Chunked RS decode with noise passed (${result.totalErrorsCorrected} errors corrected)`);
}

console.log('All Reed-Solomon tests passed successfully!');
