import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes recommended for GCM

function getMasterKey(masterKeyHex?: string): Buffer {
  const keyHex = masterKeyHex || process.env.ENCRYPTION_MASTER_KEY;
  if (!keyHex) {
    throw new Error(
      "ENCRYPTION_MASTER_KEY environment variable is missing. It must be a 64-character (32-byte) hex string."
    );
  }
  const key = Buffer.from(keyHex, "hex");
  if (key.length !== 32) {
    throw new Error(
      `Invalid master key length: expected 32 bytes (64 hex characters), got ${key.length} bytes.`
    );
  }
  return key;
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: `iv:authTag:ciphertext` (hex encoded)
 */
export function encryptPassword(plaintext: string, masterKeyHex?: string): string {
  const key = getMasterKey(masterKeyHex);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypts an encrypted payload formatted as `iv:authTag:ciphertext`.
 */
export function decryptPassword(encryptedData: string, masterKeyHex?: string): string {
  const key = getMasterKey(masterKeyHex);
  const parts = encryptedData.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted format. Expected 'iv:authTag:ciphertext'.");
  }

  const [ivHex, authTagHex, cipherHex] = parts;
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const ciphertext = Buffer.from(cipherHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

/**
 * Generates a high-entropy random password suitable for cPanel mailboxes.
 */
export function generateRandomPassword(length = 20): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~=";
  const randomBytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += charset[randomBytes[i] % charset.length];
  }
  return result;
}
