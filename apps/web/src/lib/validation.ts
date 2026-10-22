/**
 * ZegaMail Enterprise Input Validation & Security Sanitization Suite
 * 
 * Protects client-side forms and server-side API routes against:
 * - Cross-Site Scripting (XSS)
 * - SMTP Header Injection (\r\n)
 * - Path Traversal (../)
 * - Buffer Overload / ReDoS Attacks
 * - Malformed Email & Domain Syntax
 */

export interface ValidationResult<T = string> {
  isValid: boolean;
  error?: string;
  value: T;
}

export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
  strength: "weak" | "fair" | "strong";
  score: number; // 0 to 4
  value: string;
}

export interface RecipientListResult {
  isValid: boolean;
  error?: string;
  recipients: string[];
  invalidList: string[];
}

/**
 * Strict RFC 5322 compliant email validator
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateEmail(input: unknown, fieldName = "Email"): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: `${fieldName} is required.`,
      value: "",
    };
  }

  const clean = input.trim().toLowerCase();

  if (clean.length < 3 || clean.length > 254) {
    return {
      isValid: false,
      error: `${fieldName} must be between 3 and 254 characters.`,
      value: clean,
    };
  }

  if (/[\r\n\0\s]/.test(clean)) {
    return {
      isValid: false,
      error: `${fieldName} cannot contain spaces or newline characters.`,
      value: clean.replace(/[\r\n\0\s]/g, ""),
    };
  }

  if (!EMAIL_REGEX.test(clean)) {
    return {
      isValid: false,
      error: `Please enter a valid email address (e.g. name@company.com).`,
      value: clean,
    };
  }

  const parts = clean.split("@");
  if (parts.length !== 2) {
    return { isValid: false, error: "Invalid email structure.", value: clean };
  }

  const domainPart = parts[1];
  if (!domainPart.includes(".")) {
    return { isValid: false, error: "Email domain must include a valid extension (e.g. .com, .net).", value: clean };
  }

  const tld = domainPart.split(".").pop();
  if (!tld || tld.length < 2) {
    return { isValid: false, error: "Email domain has an incomplete extension.", value: clean };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Validates password with strength rating and minimum requirements
 */
export function validatePassword(input: unknown, minLength = 8): PasswordValidationResult {
  if (typeof input !== "string" || !input) {
    return {
      isValid: false,
      error: "Password is required.",
      strength: "weak",
      score: 0,
      value: "",
    };
  }

  const val = input;

  if (val.length < minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${minLength} characters long.`,
      strength: "weak",
      score: 1,
      value: val,
    };
  }

  if (val.length > 128) {
    return {
      isValid: false,
      error: "Password cannot exceed 128 characters.",
      strength: "weak",
      score: 1,
      value: val,
    };
  }

  if (/[\0\r\n]/.test(val)) {
    return {
      isValid: false,
      error: "Password contains invalid control characters.",
      strength: "weak",
      score: 0,
      value: val,
    };
  }

  let score = 0;
  if (val.length >= 8) score++;
  if (val.length >= 12) score++;
  if (/[a-z]/.test(val) && /[A-Z]/.test(val)) score++;
  if (/\d/.test(val)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val)) score++;

  let strength: "weak" | "fair" | "strong" = "weak";
  if (score >= 4) {
    strength = "strong";
  } else if (score >= 2) {
    strength = "fair";
  }

  return {
    isValid: true,
    strength,
    score,
    value: val,
  };
}

/**
 * Fully Qualified Domain Name (FQDN) validator
 */
const DOMAIN_REGEX = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export function validateDomain(input: unknown): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: "Domain name is required.",
      value: "",
    };
  }

  let clean = input.trim().toLowerCase();
  // Strip protocol and path if user accidentally pasted URL
  clean = clean.replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "").replace(/^www\./i, "");

  if (clean.length < 3 || clean.length > 253) {
    return {
      isValid: false,
      error: "Domain name must be between 3 and 253 characters.",
      value: clean,
    };
  }

  if (clean.includes("..")) {
    return {
      isValid: false,
      error: "Domain name cannot contain consecutive dots.",
      value: clean,
    };
  }

  if (!DOMAIN_REGEX.test(clean)) {
    return {
      isValid: false,
      error: "Please enter a valid domain name (e.g. yourcompany.com or acme.ng).",
      value: clean,
    };
  }

  const parts = clean.split(".");
  const tld = parts[parts.length - 1];
  if (!tld || tld.length < 2 || !/^[a-z]+$/i.test(tld)) {
    return {
      isValid: false,
      error: "Domain must end with a valid extension (e.g. .com, .ng, .co, .net).",
      value: clean,
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Validates mailbox username prefix (e.g. 'john' in john@company.com)
 */
export function validateMailboxUsername(input: unknown): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: "Mailbox prefix is required.",
      value: "",
    };
  }

  const clean = input.trim().toLowerCase();

  if (clean.length < 1 || clean.length > 64) {
    return {
      isValid: false,
      error: "Mailbox prefix must be between 1 and 64 characters.",
      value: clean,
    };
  }

  if (clean.includes("@")) {
    return {
      isValid: false,
      error: "Do not include '@domain.com' in the mailbox prefix.",
      value: clean.split("@")[0],
    };
  }

  if (!/^[a-z0-9](?:[a-z0-9._-]{0,62}[a-z0-9])?$/.test(clean)) {
    return {
      isValid: false,
      error: "Prefix can only contain lowercase letters, numbers, hyphens, dots, and underscores.",
      value: clean,
    };
  }

  if (clean.includes("..")) {
    return {
      isValid: false,
      error: "Prefix cannot contain consecutive dots.",
      value: clean,
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Validates full name or organization name
 */
export function validateFullName(input: unknown, fieldLabel = "Full Name"): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: `${fieldLabel} is required.`,
      value: "",
    };
  }

  // Reject explicit tags/scripts or dangerous characters immediately
  if (/[<>{}[\]\\\/;]/.test(input)) {
    return {
      isValid: false,
      error: `${fieldLabel} cannot contain HTML or script characters.`,
      value: "",
    };
  }

  const clean = sanitizeText(input, 100);

  if (clean.length < 2) {
    return {
      isValid: false,
      error: `${fieldLabel} must be at least 2 characters.`,
      value: clean,
    };
  }

  if (clean.length > 80) {
    return {
      isValid: false,
      error: `${fieldLabel} cannot exceed 80 characters.`,
      value: clean.slice(0, 80),
    };
  }

  if (!/[a-zA-Z\u00C0-\u024F\u1E00-\u1EFF]/.test(clean)) {
    return {
      isValid: false,
      error: `${fieldLabel} must contain valid letters.`,
      value: clean,
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Validates email subject and prevents SMTP header injection (\r\n)
 */
export function validateSubject(input: unknown, maxLength = 200): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: "Subject line is required.",
      value: "",
    };
  }

  // Security: Prevent SMTP Carriage Return / Line Feed Injection
  const clean = input
    .replace(/[\r\n\0]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length < 1) {
    return {
      isValid: false,
      error: "Subject line cannot be blank.",
      value: "",
    };
  }

  if (clean.length > maxLength) {
    return {
      isValid: false,
      error: `Subject cannot exceed ${maxLength} characters.`,
      value: clean.slice(0, maxLength),
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Validates email body / message content
 */
export function validateEmailBody(input: unknown, maxLength = 65536): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: "Message body cannot be empty.",
      value: "",
    };
  }

  if (input.length > maxLength) {
    return {
      isValid: false,
      error: `Message content exceeds the maximum allowed length (${maxLength} characters).`,
      value: input.slice(0, maxLength),
    };
  }

  // Neutralize raw script injections
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/javascript:/gi, "");

  return {
    isValid: true,
    value: sanitized,
  };
}

/**
 * Validates a list of email addresses (comma, semicolon, or newline separated)
 */
export function validateRecipientList(input: unknown): RecipientListResult {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: "At least one recipient email address is required.",
      recipients: [],
      invalidList: [],
    };
  }

  const rawList = input
    .split(/[,;\n\r]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (rawList.length === 0) {
    return {
      isValid: false,
      error: "At least one recipient email is required.",
      recipients: [],
      invalidList: [],
    };
  }

  const recipients: string[] = [];
  const invalidList: string[] = [];

  for (const item of rawList) {
    const res = validateEmail(item);
    if (res.isValid) {
      if (!recipients.includes(res.value)) {
        recipients.push(res.value);
      }
    } else {
      invalidList.push(item);
    }
  }

  if (invalidList.length > 0) {
    return {
      isValid: false,
      error: `The following email address${invalidList.length > 1 ? "es are" : " is"} invalid: ${invalidList.slice(0, 3).join(", ")}${invalidList.length > 3 ? "..." : ""}`,
      recipients,
      invalidList,
    };
  }

  return {
    isValid: true,
    recipients,
    invalidList: [],
  };
}

/**
 * Validates phone numbers (international E.164 and local)
 */
export function validatePhone(input: unknown): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return { isValid: true, value: "" }; // Optional in most forms
  }

  const clean = input.trim();
  const digitsOnly = clean.replace(/[^0-9+]/g, "");

  if (digitsOnly.length < 7 || digitsOnly.length > 17) {
    return {
      isValid: false,
      error: "Please enter a valid phone number with 7 to 15 digits.",
      value: clean,
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Validates business CAC / Registration number
 */
export function validateCacNumber(input: unknown): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return { isValid: true, value: "" }; // Optional
  }

  const clean = input.trim();
  if (!/^[A-Za-z0-9\-\/ ]{3,25}$/.test(clean)) {
    return {
      isValid: false,
      error: "Registration number can only contain letters, numbers, dashes, and slashes.",
      value: clean,
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Validates folder name
 */
export function validateFolderName(input: unknown): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: "Folder name is required.",
      value: "",
    };
  }

  const clean = sanitizeText(input, 30);

  if (clean.length < 1 || clean.length > 30) {
    return {
      isValid: false,
      error: "Folder name must be between 1 and 30 characters.",
      value: clean,
    };
  }

  if (/[\\\/:\*\?"<>\|]/.test(clean) || clean.includes("..")) {
    return {
      isValid: false,
      error: "Folder name cannot contain special path characters (\\ / : * ? \" < > |) or '..'.",
      value: clean,
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Validates crypto transaction hash (TXID)
 */
export function validateTxHash(input: unknown): ValidationResult<string> {
  if (typeof input !== "string" || !input.trim()) {
    return {
      isValid: false,
      error: "Transaction hash or TXID is required for verification.",
      value: "",
    };
  }

  const clean = input.trim();

  if (clean.length < 16 || clean.length > 130) {
    return {
      isValid: false,
      error: "Transaction hash length is invalid. Please copy the full TXID.",
      value: clean,
    };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
    return {
      isValid: false,
      error: "Transaction hash contains invalid characters.",
      value: clean,
    };
  }

  return {
    isValid: true,
    value: clean,
  };
}

/**
 * Strips dangerous HTML and limits length
 */
export function sanitizeText(input: unknown, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>?/gm, "") // Strip HTML tags
    .replace(/[\0\r]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Sanitizes search input to prevent injection or ReDoS
 */
export function sanitizeSearchQuery(input: unknown, maxLength = 120): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\0\r\n]/g, " ")
    .replace(/[<>{}[\]\\;*?]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
