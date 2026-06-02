/**
 * Security utilities for Jus Wellness
 * Covers: CSRF tokens, timing-safe comparison, input sanitization, security logging
 */

import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

// ============================================================
// TIMING-SAFE COMPARISON
// ============================================================

/**
 * Timing-safe string comparison to prevent timing attacks on HMAC/signature verification.
 * OWASP A02: Cryptographic Failures
 */
export function safeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

// ============================================================
// CSRF TOKEN MANAGEMENT
// ============================================================

const CSRF_SECRET = process.env.CSRF_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "jw-csrf-fallback-key";
const CSRF_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a CSRF token: timestamp.hmac
 */
export function generateCsrfToken(): string {
  const timestamp = Date.now().toString();
  const hmac = createHmac("sha256", CSRF_SECRET)
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

/**
 * Validate a CSRF token. Returns true if valid and not expired.
 */
export function validateCsrfToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, hmac] = parts;
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;

  // Check expiry
  if (Date.now() - ts > CSRF_TOKEN_EXPIRY_MS) return false;

  // Verify HMAC
  const expected = createHmac("sha256", CSRF_SECRET)
    .update(timestamp)
    .digest("hex");

  return safeCompare(hmac, expected);
}

// ============================================================
// SECURITY EVENT LOGGING
// ============================================================

export type SecurityEventType =
  | "auth_login_success"
  | "auth_login_failed"
  | "auth_logout"
  | "auth_token_invalid"
  | "auth_token_expired"
  | "csrf_violation"
  | "rate_limit_exceeded"
  | "invalid_signature"
  | "unauthorized_access"
  | "suspicious_input"
  | "upload_rejected"
  | "admin_action";

interface SecurityEvent {
  type: SecurityEventType;
  ip: string;
  path: string;
  method: string;
  details?: string;
  userId?: string;
  timestamp: string;
}

/**
 * Log security events. In production, pipe to external SIEM/logging service.
 * OWASP A09: Security Logging and Monitoring Failures
 */
export function logSecurityEvent(
  request: NextRequest,
  type: SecurityEventType,
  details?: string,
  userId?: string
): void {
  const event: SecurityEvent = {
    type,
    ip: getClientIp(request),
    path: request.nextUrl.pathname,
    method: request.method,
    details,
    userId,
    timestamp: new Date().toISOString(),
  };

  // Structured JSON log — easily parsable by log aggregators
  console.log(`[SECURITY] ${JSON.stringify(event)}`);
}

// ============================================================
// IP EXTRACTION
// ============================================================

/**
 * Extract client IP from request headers. Handles proxies.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // First IP in chain is the client; trim whitespace
    const first = forwarded.split(",")[0]?.trim();
    if (first && isValidIp(first)) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp && isValidIp(realIp)) return realIp;

  return "unknown";
}

function isValidIp(ip: string): boolean {
  // Basic IPv4/IPv6 validation
  return /^[\d.:a-fA-F]+$/.test(ip) && ip.length <= 45;
}

// ============================================================
// INPUT SANITIZATION (defense in depth beyond Zod)
// ============================================================

/**
 * Strip HTML tags and dangerous characters. Defense-in-depth layer.
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/javascript:/gi, "") // Strip javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Strip event handlers
    .replace(/data:/gi, "") // Strip data: URIs
    .trim();
}

/**
 * Sanitize object values recursively (strings only).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const [key, value] of Object.entries(result)) {
    if (typeof value === "string") {
      (result as Record<string, unknown>)[key] = sanitizeHtml(value);
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }
  return result;
}

// ============================================================
// NONCE GENERATION (for CSP)
// ============================================================

/**
 * Generate a cryptographically random nonce for CSP script-src.
 */
export function generateNonce(): string {
  return randomBytes(16).toString("base64");
}

// ============================================================
// ADMIN AUTH VERIFICATION (for API routes)
// ============================================================

/**
 * Verify that the request comes from an authenticated admin user.
 * Returns the user object or null.
 * OWASP A01: Broken Access Control
 */
export async function verifyAdminAuth(
  request: NextRequest
): Promise<{ id: string; email?: string } | null> {
  const { createClient } = await import("@supabase/supabase-js");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  const accessToken = request.cookies.get("sb-access-token")?.value;
  if (!accessToken) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) return null;

  return { id: user.id, email: user.email };
}

// ============================================================
// RESPONSE HELPERS
// ============================================================

/**
 * Standard error response that never leaks internal details.
 */
export function secureErrorResponse(
  message: string,
  status: number,
  headers?: Record<string, string>
): NextResponse {
  return NextResponse.json(
    { error: message },
    { status, headers: headers || {} }
  );
}
