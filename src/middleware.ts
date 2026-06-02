import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ============================================================
// SECURITY HEADERS (applied to ALL responses)
// ============================================================

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "0", // Modern browsers: CSP > X-XSS-Protection; "0" avoids false positives
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(self), interest-cohort=()",
};

// ============================================================
// ROUTE MATCHERS
// ============================================================

const ADMIN_PATHS = ["/admin"];
const ADMIN_API_PATHS = ["/api/upload", "/api/admin"];
const PUBLIC_API_PATHS = ["/api/orders", "/api/inquiries", "/api/webhooks", "/api/csrf-token"];

function isAdminRoute(pathname: string): boolean {
  return ADMIN_PATHS.some((p) => pathname.startsWith(p));
}

function isAdminApiRoute(pathname: string): boolean {
  return ADMIN_API_PATHS.some((p) => pathname.startsWith(p));
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_PATHS.some((p) => pathname.startsWith(p));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api");
}

// ============================================================
// MIDDLEWARE
// ============================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Apply security headers to ALL responses
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value);
  }

  // --- Admin page protection ---
  if (isAdminRoute(pathname)) {
    const user = await verifyAuth(request);
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      const redirectResponse = NextResponse.redirect(loginUrl);
      clearAuthCookies(redirectResponse);
      return redirectResponse;
    }
  }

  // --- Admin API protection ---
  if (isAdminApiRoute(pathname)) {
    const user = await verifyAuth(request);
    if (!user) {
      logSecurity(request, "unauthorized_access", "Admin API without auth");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // --- API route CSRF + Origin verification ---
  if (isApiRoute(pathname) && !pathname.startsWith("/api/webhooks")) {
    const method = request.method;

    // Only check mutating methods
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      // Verify Origin header
      const origin = request.headers.get("origin");
      const host = request.headers.get("host");

      if (!origin || !host) {
        logSecurity(request, "csrf_violation", "Missing origin/host header");
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Origin must match host (handles port stripping for dev)
      const originHost = new URL(origin).hostname;
      const requestHost = host.split(":")[0];

      if (originHost !== requestHost) {
        logSecurity(
          request,
          "csrf_violation",
          `Origin mismatch: ${originHost} vs ${requestHost}`
        );
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  return response;
}

// ============================================================
// AUTH VERIFICATION
// ============================================================

async function verifyAuth(
  request: NextRequest
): Promise<{ id: string; email?: string } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  const accessToken = request.cookies.get("sb-access-token")?.value;
  const refreshToken = request.cookies.get("sb-refresh-token")?.value;

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
// COOKIE MANAGEMENT
// ============================================================

function clearAuthCookies(response: NextResponse): void {
  const cookieOptions = {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  response.cookies.set("sb-access-token", "", cookieOptions);
  response.cookies.set("sb-refresh-token", "", cookieOptions);
}

// ============================================================
// SECURITY LOGGING (lightweight version for Edge Runtime)
// ============================================================

function logSecurity(
  request: NextRequest,
  type: string,
  details: string
): void {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  console.log(
    `[SECURITY] ${JSON.stringify({
      type,
      ip,
      path: request.nextUrl.pathname,
      method: request.method,
      details,
      timestamp: new Date().toISOString(),
    })}`
  );
}

// ============================================================
// MATCHER
// ============================================================

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
