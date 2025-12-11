/**
 * Encryption utilities for sensitive data
 * Uses Node.js crypto for encryption/decryption
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { logger } from "./logger";
import { env } from "../config/env";

/**
 * Get encryption key from environment or generate a default (not secure for production)
 */
function getEncryptionKey(): Buffer {
  const keyMaterial = env.JWT_SECRET || "default-encryption-key-change-in-production";
  // Derive a 32-byte key using scrypt
  return scryptSync(keyMaterial, "salt", 32);
}

/**
 * Encrypt sensitive data (e.g., API keys, passwords)
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(16);
    const cipher = createCipheriv("aes-256-cbc", key, iv);
    
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    
    // Return IV + encrypted data (IV is needed for decryption)
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    logger.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypt sensitive data
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = getEncryptionKey();
    const [ivHex, encrypted] = encryptedText.split(":");
    
    if (!ivHex || !encrypted) {
      throw new Error("Invalid encrypted data format");
    }
    
    const iv = Buffer.from(ivHex, "hex");
    const decipher = createDecipheriv("aes-256-cbc", key, iv);
    
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    
    return decrypted;
  } catch (error) {
    logger.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Check if a string is encrypted (has the IV:encrypted format)
 */
export function isEncrypted(text: string): boolean {
  return text.includes(":") && text.split(":").length === 2;
}

