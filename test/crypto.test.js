/**
 * Unit tests for AES-256-GCM Encryption, Decryption, and Paper Capacity Calculations
 */

import { encryptPayload, decryptPayload, isPayloadEncrypted } from '../src/core/crypto.js';
import { calculateSheetCapacity, generateCapacityReport, PAPER_SIZES } from '../src/core/capacity.js';
import { PALETTE_MODES } from '../src/core/palette.js';

console.log('--- Running Crypto & Capacity Tests ---');

// Test 1: AES-256-GCM Encrypt & Decrypt Roundtrip
{
  const plaintext = 'Top Secret Optical Paper Document with AES-256-GCM encryption!';
  const plainBytes = new TextEncoder().encode(plaintext);
  const password = 'CorrectHorseBatteryStaple2026!';

  console.log(`[Test 1] Encrypting with AES-256-GCM: "${plaintext}"`);
  const encrypted = await encryptPayload(plainBytes, password);

  if (!isPayloadEncrypted(encrypted)) {
    throw new Error('isPayloadEncrypted should return true for encrypted payload');
  }

  // Attempt decryption with WRONG password -> should fail
  const wrongDec = await decryptPayload(encrypted, 'WrongPassword123');
  if (wrongDec.success) {
    throw new Error('Decryption with wrong password should fail');
  }
  console.log('✓ Wrong password authentication rejected cleanly');

  // Decrypt with correct password -> should succeed
  const rightDec = await decryptPayload(encrypted, password);
  if (!rightDec.success) {
    throw new Error(`Decryption with correct password failed: ${rightDec.error}`);
  }

  const recoveredText = new TextDecoder().decode(rightDec.data);
  if (recoveredText !== plaintext) {
    throw new Error(`Decrypted text mismatch! Expected "${plaintext}", got "${recoveredText}"`);
  }
  console.log('✓ Test 1: AES-256-GCM encrypt & decrypt roundtrip passed');
}

// Test 2: Paper Capacity Math
{
  const letterReport = calculateSheetCapacity('LETTER', 0.90, PALETTE_MODES.PALETTE_16, 0.25);
  console.log(`[Test 2] Letter Sheet Capacity (0.9mm dot pitch / Phone Scan):`);
  console.log(`- Grid: ${letterReport.gridDimensions}`);
  console.log(`- Net Characters: ${letterReport.netPayloadBytes.toLocaleString()} chars (~${letterReport.approxKilobytes} KB)`);
  console.log(`- Approx Typed Book Pages: ${letterReport.approxTypedPages} pages`);

  if (letterReport.netPayloadBytes < 15000 || letterReport.netPayloadBytes > 30000) {
    throw new Error(`Letter capacity out of expected range: ${letterReport.netPayloadBytes}`);
  }

  const a4Flatbed = calculateSheetCapacity('A4', 0.25, PALETTE_MODES.PALETTE_16, 0.25);
  console.log(`A4 Sheet Capacity (0.25mm dot pitch / 300 DPI Scanner):`);
  console.log(`- Grid: ${a4Flatbed.gridDimensions}`);
  console.log(`- Net Characters: ${a4Flatbed.netPayloadBytes.toLocaleString()} chars (~${a4Flatbed.approxKilobytes} KB)`);

  if (a4Flatbed.netPayloadBytes < 200000) {
    throw new Error(`A4 flatbed scanner capacity too low: ${a4Flatbed.netPayloadBytes}`);
  }

  const asciiCapacity = calculateSheetCapacity('LETTER', 0.90, PALETTE_MODES.PALETTE_ASCII_95, 0.5);
  const expectedAsciiRawBytes = Math.floor(asciiCapacity.availableDataDots * 6.4 / 8);
  if (asciiCapacity.rawCodewordBytes !== expectedAsciiRawBytes) {
    throw new Error('ASCII_95 capacity must use reversible base95 efficiency, not 1 byte/dot');
  }
  console.log('✓ Test 2: Sheet capacity calculations passed');
}

console.log('All Crypto & Capacity tests passed successfully!');
