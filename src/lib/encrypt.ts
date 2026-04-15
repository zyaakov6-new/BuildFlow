/**
 * AES-256-GCM encryption for sensitive values stored in the database
 * (e.g. Google Calendar refresh tokens).
 *
 * Requires TOKEN_ENCRYPTION_KEY env var — a 64-char hex string (32 bytes).
 * Generate one with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 *
 * Encrypted format: "<iv_hex>:<authTag_hex>:<ciphertext_hex>"
 * Values that don't match this format are returned as-is (migration safety).
 */

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM

function getKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      "TOKEN_ENCRYPTION_KEY must be a 64-character hex string. " +
      "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    );
  }
  return Buffer.from(hex, "hex");
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(value: string): string {
  // If it doesn't look encrypted, return as-is (handles legacy plaintext values)
  if (!value || !value.includes(":")) return value;

  try {
    const key = getKey();
    const parts = value.split(":");
    if (parts.length !== 3) return value;

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv         = Buffer.from(ivHex,         "hex");
    const authTag    = Buffer.from(authTagHex,    "hex");
    const ciphertext = Buffer.from(ciphertextHex, "hex");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return decipher.update(ciphertext).toString("utf8") + decipher.final("utf8");
  } catch {
    // Decryption failed — return raw value so calendar still works if key changes
    console.error("[encrypt] decryptToken failed — returning raw value");
    return value;
  }
}
