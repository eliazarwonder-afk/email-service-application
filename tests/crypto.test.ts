import { describe, it, expect } from "vitest";
import {
  encryptPassword,
  decryptPassword,
  generateRandomPassword,
} from "../packages/mail-core/src/crypto/encryption";

const TEST_MASTER_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

describe("Mailbox Password AES-256-GCM Encryption Spike", () => {
  it("should encrypt and decrypt a mailbox password successfully", () => {
    const originalPassword = "ZegaBytezMailSecure2026!#$";
    const encrypted = encryptPassword(originalPassword, TEST_MASTER_KEY);

    expect(encrypted).toContain(":");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3); // iv : authTag : ciphertext

    const decrypted = decryptPassword(encrypted, TEST_MASTER_KEY);
    expect(decrypted).toBe(originalPassword);
  });

  it("should fail to decrypt if ciphertext has been tampered with", () => {
    const originalPassword = "SecretMailPassword123";
    const encrypted = encryptPassword(originalPassword, TEST_MASTER_KEY);
    const [iv, authTag, cipher] = encrypted.split(":");

    // Alter one character in ciphertext
    const tamperedCipher =
      cipher.slice(0, -2) + (cipher.slice(-2) === "aa" ? "bb" : "aa");
    const tamperedEncrypted = `${iv}:${authTag}:${tamperedCipher}`;

    expect(() => decryptPassword(tamperedEncrypted, TEST_MASTER_KEY)).toThrow();
  });

  it("should fail to decrypt with an incorrect master key", () => {
    const originalPassword = "SecretMailPassword123";
    const encrypted = encryptPassword(originalPassword, TEST_MASTER_KEY);
    const wrongKey = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

    expect(() => decryptPassword(encrypted, wrongKey)).toThrow();
  });

  it("should generate secure random passwords with correct length", () => {
    const pwd1 = generateRandomPassword(24);
    const pwd2 = generateRandomPassword(24);

    expect(pwd1).toHaveLength(24);
    expect(pwd2).toHaveLength(24);
    expect(pwd1).not.toBe(pwd2);
  });
});
