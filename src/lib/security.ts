import { NextRequest, NextResponse } from "next/server";
import { getClientIP } from "./api-helpers";

// ═══════════════════════════════════════════════════════════
// RATE LIMITING CONFIGURATION
// ═══════════════════════════════════════════════════════════

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

// Rate limit tiers for different route types
export const RATE_LIMITS = {
  // Very strict - sensitive forms (quotes, messages, auth)
  forms: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour

  // Strict - auth endpoints
  auth: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10 per 15 min

  // Moderate - order creation
  orders: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10 per hour

  // Standard - API read operations
  api: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute

  // Lenient - admin authenticated routes
  admin: { maxRequests: 300, windowMs: 60 * 1000 }, // 300 per minute

  // Upload - file uploads
  upload: { maxRequests: 20, windowMs: 60 * 60 * 1000 }, // 20 per hour

  // Webhook - external webhooks (more lenient)
  webhook: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 per minute
} as const satisfies Record<string, RateLimitConfig>;

// ═══════════════════════════════════════════════════════════
// ENHANCED RATE LIMITING WITH SLIDING WINDOW
// ═══════════════════════════════════════════════════════════

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup old entries periodically (every 5 minutes)
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60 * 1000;

function cleanupOldEntries(maxAge: number = 60 * 60 * 1000) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;

  lastCleanup = now;
  const cutoff = now - maxAge;

  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((t) => t > cutoff);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}

export function checkRateLimitEnhanced(
  key: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number; retryAfter: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Cleanup periodically
  cleanupOldEntries();

  // Get or create record
  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter to only timestamps within window
  record.timestamps = record.timestamps.filter((t) => t > windowStart);

  const count = record.timestamps.length;
  const remaining = Math.max(0, config.maxRequests - count);

  if (count >= config.maxRequests) {
    // Calculate when the oldest request in window will expire
    const oldestTimestamp = record.timestamps[0] ?? now;
    const resetAt = oldestTimestamp + config.windowMs;
    const retryAfter = Math.ceil((resetAt - now) / 1000);

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter,
    };
  }

  // Add current request
  record.timestamps.push(now);

  return {
    allowed: true,
    remaining: remaining - 1,
    resetAt: now + config.windowMs,
    retryAfter: 0,
  };
}

// ═══════════════════════════════════════════════════════════
// RATE LIMIT MIDDLEWARE
// ═══════════════════════════════════════════════════════════

export function createRateLimitResponse(
  retryAfter: number,
  message = "Too many requests"
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(Date.now() + retryAfter * 1000),
      },
    }
  );
}

export function withRateLimitEnhanced(
  tier: keyof typeof RATE_LIMITS,
  keyPrefix?: string
) {
  const config = RATE_LIMITS[tier];

  return function <T extends (...args: unknown[]) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (...args: unknown[]): Promise<NextResponse> => {
      const req = args[0] as NextRequest;
      const ip = getClientIP(req);
      const key = `${keyPrefix ?? tier}:${ip}`;

      const result = checkRateLimitEnhanced(key, config);

      if (!result.allowed) {
        return createRateLimitResponse(
          result.retryAfter,
          `Too many requests. Please try again in ${result.retryAfter} seconds.`
        );
      }

      const response = await handler(...args);

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
      response.headers.set("X-RateLimit-Remaining", String(result.remaining));
      response.headers.set("X-RateLimit-Reset", String(result.resetAt));

      return response;
    }) as T;
  };
}

// ═══════════════════════════════════════════════════════════
// HONEYPOT PROTECTION
// ═══════════════════════════════════════════════════════════

export interface HoneypotFields {
  honeypot?: string;
  _hp_name?: string;
  website?: string;
  _timestamp?: number;
}

export function validateHoneypot(data: HoneypotFields): {
  valid: boolean;
  reason?: string;
} {
  // Check if any honeypot field is filled
  if (data.honeypot && data.honeypot.trim() !== "") {
    return { valid: false, reason: "honeypot_triggered" };
  }

  if (data._hp_name && data._hp_name.trim() !== "") {
    return { valid: false, reason: "honeypot_triggered" };
  }

  if (data.website && data.website.trim() !== "") {
    return { valid: false, reason: "honeypot_triggered" };
  }

  // Check timestamp (form submitted too quickly - likely bot)
  // Forms should take at least 3 seconds to fill
  if (data._timestamp) {
    const submissionTime = Date.now() - data._timestamp;
    if (submissionTime < 3000) {
      return { valid: false, reason: "submission_too_fast" };
    }
    // Also reject if timestamp is more than 24 hours old
    if (submissionTime > 24 * 60 * 60 * 1000) {
      return { valid: false, reason: "timestamp_expired" };
    }
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════
// CSRF PROTECTION
// ═══════════════════════════════════════════════════════════

import { createHash, randomBytes } from "crypto";

const csrfTokens = new Map<string, { token: string; expires: number }>();

// Generate a CSRF token
export function generateCsrfToken(): { token: string; expiresAt: number } {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  // Store token hash for validation
  const tokenHash = createHash("sha256").update(token).digest("hex");
  csrfTokens.set(tokenHash, { token: tokenHash, expires: expiresAt });

  // Cleanup expired tokens
  const now = Date.now();
  for (const [hash, data] of csrfTokens.entries()) {
    if (data.expires < now) {
      csrfTokens.delete(hash);
    }
  }

  return { token, expiresAt };
}

// Validate a CSRF token
export function validateCsrfToken(token: string): boolean {
  if (!token) {
    return false;
  }
  if (token.length !== 64) {
    return false;
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const stored = csrfTokens.get(tokenHash);

  if (!stored) {
    return false;
  }

  if (stored.expires < Date.now()) {
    csrfTokens.delete(tokenHash);
    return false;
  }

  // Token is valid, remove it (one-time use)
  csrfTokens.delete(tokenHash);
  return true;
}

// ═══════════════════════════════════════════════════════════
// INPUT SANITIZATION
// ═══════════════════════════════════════════════════════════

// Escape HTML entities to prevent XSS
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char] ?? char);
}

// Strip HTML tags
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

// Sanitize string input (removes dangerous patterns)
export function sanitizeString(str: string): string {
  if (!str || typeof str !== "string") {
    return "";
  }

  return str
    // Remove null bytes
    .replace(/\0/g, "")
    // Remove CRLF injection
    .replace(/\r\n|\r|\n/g, " ")
    // Strip HTML tags
    .replace(/<[^>]*>/g, "")
    // Limit consecutive spaces
    .replace(/\s{2,}/g, " ")
    // Trim
    .trim();
}

// Sanitize for SQL-like patterns (additional protection layer)
export function sanitizeSqlPatterns(str: string): string {
  return str
    .replace(/--/g, "")
    .replace(/;/g, "")
    .replace(/'/g, "''")
    .replace(/"/g, '""');
}

// Sanitize phone number
export function sanitizePhone(phone: string): string {
  // Keep only digits, +, and spaces
  return phone.replace(/[^\d+\s-()]/g, "").trim();
}

// Sanitize email
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Deep sanitize object (sanitize all string values)
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };

  for (const key in result) {
    const value = result[key];
    if (typeof value === "string") {
      (result[key] as string) = sanitizeString(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      (result[key] as Record<string, unknown>) = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }

  return result;
}

// ═══════════════════════════════════════════════════════════
// SECURITY HEADERS HELPER
// ═══════════════════════════════════════════════════════════

export const SECURITY_HEADERS = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
};

// ═══════════════════════════════════════════════════════════
// IP BLOCKING
// ═══════════════════════════════════════════════════════════

const blockedIPs = new Set<string>();
const suspiciousIPs = new Map<string, { count: number; firstSeen: number }>();

const BLOCK_THRESHOLD = 50; // Number of suspicious activities before blocking
const SUSPICIOUS_WINDOW = 60 * 60 * 1000; // 1 hour

export function recordSuspiciousActivity(ip: string): void {
  const now = Date.now();
  const record = suspiciousIPs.get(ip);

  if (!record) {
    suspiciousIPs.set(ip, { count: 1, firstSeen: now });
    return;
  }

  // Reset if window expired
  if (now - record.firstSeen > SUSPICIOUS_WINDOW) {
    suspiciousIPs.set(ip, { count: 1, firstSeen: now });
    return;
  }

  record.count++;

  if (record.count >= BLOCK_THRESHOLD) {
    blockedIPs.add(ip);
    suspiciousIPs.delete(ip);
  }
}

export function isIPBlocked(ip: string): boolean {
  return blockedIPs.has(ip);
}

export function unblockIP(ip: string): void {
  blockedIPs.delete(ip);
}

// ═══════════════════════════════════════════════════════════
// STRIPE WEBHOOK SECURITY
// ═══════════════════════════════════════════════════════════

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-01-28.clover",
});

export async function verifyStripeWebhook(
  req: NextRequest
): Promise<{ event: Stripe.Event | null; error: string | null }> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return { event: null, error: "Webhook secret not configured" };
  }

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return { event: null, error: "Missing Stripe signature" };
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return { event, error: null };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook verification failed:", errorMessage);
    return { event: null, error: `Webhook verification failed: ${errorMessage}` };
  }
}

// ═══════════════════════════════════════════════════════════
// COMBINED SECURITY MIDDLEWARE
// ═══════════════════════════════════════════════════════════

export interface SecurityCheckResult {
  passed: boolean;
  error?: string;
  statusCode?: number;
}

export function performSecurityChecks(
  req: NextRequest,
  options: {
    rateLimit?: keyof typeof RATE_LIMITS;
    checkHoneypot?: boolean;
    checkCsrf?: boolean;
    honeypotData?: HoneypotFields;
    csrfToken?: string;
  }
): SecurityCheckResult {
  const ip = getClientIP(req);

  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    return {
      passed: false,
      error: "Access denied",
      statusCode: 403,
    };
  }

  // Rate limiting
  if (options.rateLimit) {
    const config = RATE_LIMITS[options.rateLimit];
    const result = checkRateLimitEnhanced(`${options.rateLimit}:${ip}`, config);

    if (!result.allowed) {
      return {
        passed: false,
        error: `Too many requests. Please try again in ${result.retryAfter} seconds.`,
        statusCode: 429,
      };
    }
  }

  // Honeypot validation
  if (options.checkHoneypot && options.honeypotData) {
    const honeypotResult = validateHoneypot(options.honeypotData);
    if (!honeypotResult.valid) {
      recordSuspiciousActivity(ip);
      return {
        passed: false,
        error: "Invalid submission",
        statusCode: 400,
      };
    }
  }

  // CSRF validation
  if (options.checkCsrf && options.csrfToken) {
    if (!validateCsrfToken(options.csrfToken)) {
      recordSuspiciousActivity(ip);
      return {
        passed: false,
        error: "Invalid or expired security token",
        statusCode: 403,
      };
    }
  }

  return { passed: true };
}
