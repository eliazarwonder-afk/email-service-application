import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateDomain,
  validateMailboxUsername,
  validateFullName,
  validateSubject,
  validateEmailBody,
  validateRecipientList,
  validatePhone,
  validateCacNumber,
  validateFolderName,
  validateTxHash,
  sanitizeText,
  sanitizeSearchQuery,
} from "../apps/web/src/lib/validation";

describe("Enterprise Input Validation & Security Suite", () => {
  describe("validateEmail", () => {
    it("should accept valid RFC 5322 emails", () => {
      expect(validateEmail("user@example.com").isValid).toBe(true);
      expect(validateEmail("admin.corp@sub.domain.co.uk").isValid).toBe(true);
      expect(validateEmail("first+tag@company.ng").isValid).toBe(true);
    });

    it("should reject invalid emails, control chars, and injection attempts", () => {
      expect(validateEmail("").isValid).toBe(false);
      expect(validateEmail("plainaddress").isValid).toBe(false);
      expect(validateEmail("@missinguser.com").isValid).toBe(false);
      expect(validateEmail("user@.com").isValid).toBe(false);
      expect(validateEmail("user@domain..com").isValid).toBe(false);
      expect(validateEmail("user@domain.c").isValid).toBe(false); // TLD min 2 chars
      expect(validateEmail("admin\r\nBcc:victim@test.com").isValid).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should accept strong passwords", () => {
      const res = validatePassword("CorrectHorse#2026Secure!");
      expect(res.isValid).toBe(true);
      expect(res.strength).toBe("strong");
    });

    it("should reject short or weak passwords", () => {
      expect(validatePassword("short").isValid).toBe(false);
      expect(validatePassword("short").error).toContain("at least 8 characters");
      expect(validatePassword("a".repeat(129)).isValid).toBe(false);
    });
  });

  describe("validateDomain", () => {
    it("should clean and validate fully-qualified domain names", () => {
      const res = validateDomain("https://www.MyCompany.com/path");
      expect(res.isValid).toBe(true);
      expect(res.value).toBe("mycompany.com");
    });

    it("should reject invalid domain syntax", () => {
      expect(validateDomain("invalid_domain").isValid).toBe(false);
      expect(validateDomain("-hyphenstart.com").isValid).toBe(false);
      expect(validateDomain("domain..com").isValid).toBe(false);
      expect(validateDomain("").isValid).toBe(false);
    });
  });

  describe("validateMailboxUsername", () => {
    it("should accept valid prefixes", () => {
      expect(validateMailboxUsername("info").isValid).toBe(true);
      expect(validateMailboxUsername("john.doe").isValid).toBe(true);
      expect(validateMailboxUsername("sales-eu").isValid).toBe(true);
    });

    it("should reject prefixes with @domain or illegal characters", () => {
      expect(validateMailboxUsername("john@company.com").isValid).toBe(false);
      expect(validateMailboxUsername("john..doe").isValid).toBe(false);
      expect(validateMailboxUsername(".leadingdot").isValid).toBe(false);
      expect(validateMailboxUsername("user#special").isValid).toBe(false);
    });
  });

  describe("validateFullName", () => {
    it("should accept clean names and reject HTML/scripts", () => {
      expect(validateFullName("Chinedu Okafor").isValid).toBe(true);
      expect(validateFullName("<script>alert(1)</script>").isValid).toBe(false);
      expect(validateFullName("A").isValid).toBe(false);
    });
  });

  describe("validateSubject", () => {
    it("should neutralize CRLF header injection", () => {
      const res = validateSubject("Meeting\r\nBcc: spy@evil.com\r\nSubject: Pwned");
      expect(res.isValid).toBe(true);
      expect(res.value).not.toContain("\r");
      expect(res.value).not.toContain("\n");
      expect(res.value).toBe("Meeting Bcc: spy@evil.com Subject: Pwned");
    });
  });

  describe("validateEmailBody", () => {
    it("should neutralize script tags and javascript: URIs", () => {
      const res = validateEmailBody("<script>malicious()</script>Hello world <a href='javascript:alert(1)'>click</a>");
      expect(res.isValid).toBe(true);
      expect(res.value).not.toContain("<script");
      expect(res.value).not.toContain("javascript:");
    });
  });

  describe("validateRecipientList", () => {
    it("should parse and validate comma/newline separated emails", () => {
      const res = validateRecipientList("alice@company.com, bob@partner.org\ncharlie@client.net");
      expect(res.isValid).toBe(true);
      expect(res.recipients).toEqual(["alice@company.com", "bob@partner.org", "charlie@client.net"]);
      expect(res.invalidList).toEqual([]);
    });

    it("should identify invalid recipients in the batch", () => {
      const res = validateRecipientList("valid@company.com, bad-email, another@test.org");
      expect(res.isValid).toBe(false);
      expect(res.invalidList).toContain("bad-email");
    });
  });

  describe("validateTxHash", () => {
    it("should accept valid EVM and Solana/Bitcoin transaction hashes", () => {
      expect(validateTxHash("0x4f355b4a706f9d7842d0a0cd89a3006eb4b299e525492d1c6040082f494f4c8b").isValid).toBe(true);
      expect(validateTxHash("5VERv8NMvzbJMEdV8xnrLkEaWR42vCFWzMtJ558ngvGw").isValid).toBe(true);
    });

    it("should reject malicious or invalid strings", () => {
      expect(validateTxHash("short").isValid).toBe(false);
      expect(validateTxHash("<script>alert(1)</script>").isValid).toBe(false);
    });
  });

  describe("Sanitization utilities", () => {
    it("sanitizeText removes HTML tags and limits length", () => {
      const sanitized = sanitizeText("Hello <b>World</b> & \"all\"", 50);
      expect(sanitized).toBe("Hello World & \"all\"");
    });

    it("sanitizeSearchQuery removes regex/control metacharacters", () => {
      const sanitized = sanitizeSearchQuery("search*term??;drop table--");
      expect(sanitized).not.toContain(";");
      expect(sanitized).not.toContain("*");
      expect(sanitized).not.toContain("?");
      expect(sanitized).toBe("search term drop table--");
    });
  });
});
