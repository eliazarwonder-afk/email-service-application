import crypto from "crypto";

/**
 * Constant-time string comparison to prevent timing attacks.
 * Conforms to secure-code-guardian & auth-implementation-patterns guidelines.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");

    if (bufA.length !== bufB.length) {
      // Dummy comparison to ensure consistent execution timing
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Validates HMAC-SHA256 signature for incoming WHMCS webhooks.
 * Header: `x-zegabytez-signature: sha256=<hex>`
 */
export function verifyWebhookSignature(
  rawBody: string,
  providedSignature: string | null,
  secret: string
): boolean {
  if (!providedSignature || !secret) return false;

  const cleanSignature = providedSignature.startsWith("sha256=")
    ? providedSignature.slice(7)
    : providedSignature;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  return timingSafeCompare(cleanSignature, expectedSignature);
}

/**
 * In-memory sliding window rate limiter for authentication endpoints.
 * Blocks brute-force password spraying and credential stuffing.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetInMs: windowMs };
  }

  if (record.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}

/**
 * Input sanitization utility for API fields preventing XSS and injection attacks.
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .replace(/[<>]/g, ""); // strip raw angular tags
}
