/**
 * ChromaMatrix - AES-256-GCM Isomorphic Encryption & Decryption Module
 * Supports password-based key derivation (PBKDF2-SHA256) and authenticated AES-GCM encryption
 * Compatible with modern Web Crypto API and Node.js.
 */

// Magic prefix identifying encrypted ChromaMatrix payload
export const ENCRYPTED_MAGIC = new Uint8Array([0x43, 0x4D, 0x45, 0x31]); // "CME1" (ChromaMatrix Encrypted v1)

/**
 * Derive 256-bit AES key from password and salt using PBKDF2
 */
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt arbitrary payload bytes with a password using AES-256-GCM.
 * Output format: [MAGIC(4B)] + [SALT(16B)] + [IV(12B)] + [CIPHERTEXT + AUTH_TAG]
 */
export async function encryptPayload(dataBytes, password) {
  if (!password || password.length === 0) {
    return dataBytes;
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    dataBytes
  );

  const ciphertext = new Uint8Array(encryptedBuffer);
  const totalLen = ENCRYPTED_MAGIC.length + salt.length + iv.length + ciphertext.length;
  const result = new Uint8Array(totalLen);

  let offset = 0;
  result.set(ENCRYPTED_MAGIC, offset); offset += ENCRYPTED_MAGIC.length;
  result.set(salt, offset); offset += salt.length;
  result.set(iv, offset); offset += iv.length;
  result.set(ciphertext, offset);

  return result;
}

/**
 * Check if payload bytes start with the encrypted magic prefix
 */
export function isPayloadEncrypted(dataBytes) {
  if (!dataBytes || dataBytes.length < ENCRYPTED_MAGIC.length + 28) return false;
  for (let i = 0; i < ENCRYPTED_MAGIC.length; i++) {
    if (dataBytes[i] !== ENCRYPTED_MAGIC[i]) return false;
  }
  return true;
}

/**
 * Decrypt payload bytes with a password using AES-256-GCM.
 * If payload is not encrypted, returns original dataBytes.
 */
export async function decryptPayload(dataBytes, password) {
  if (!isPayloadEncrypted(dataBytes)) {
    return {
      isEncrypted: false,
      data: dataBytes,
      success: true
    };
  }

  if (!password) {
    return {
      isEncrypted: true,
      data: null,
      success: false,
      error: 'Password required to decrypt this protected ChromaMatrix payload.'
    };
  }

  try {
    let offset = ENCRYPTED_MAGIC.length;
    const salt = dataBytes.slice(offset, offset + 16); offset += 16;
    const iv = dataBytes.slice(offset, offset + 12); offset += 12;
    const ciphertext = dataBytes.slice(offset);

    const key = await deriveKey(password, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      ciphertext
    );

    return {
      isEncrypted: true,
      data: new Uint8Array(decryptedBuffer),
      success: true
    };
  } catch (err) {
    return {
      isEncrypted: true,
      data: null,
      success: false,
      error: 'Decryption failed: Incorrect password or corrupted cryptographic authentication tag.'
    };
  }
}
