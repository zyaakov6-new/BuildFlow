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

function getKey(): Buffer | null {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    console.warn("[encrypt] TOKEN_ENCRYPTION_KEY missing or invalid — tokens stored as plaintext");
    return null;
  }
  return Buffer.from(hex, "hex");
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  if (!key) return plaintext; // no key — store plaintext (degraded mode)
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptToken(value: string): string {
  // If it doesn't look encrypted, return as-is (plaintext or degraded mode)
  if (!value || !value.includes(":")) return value;

  try {
    const key = getKey();
    if (!key) return value; // no key — assume plaintext
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
    console.error("[encrypt] decryptToken failed — returning raw value");
    return value;
  }
}
