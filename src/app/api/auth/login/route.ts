import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side login endpoint.
 * OWASP A07: Auth tokens stored as httpOnly cookies — not accessible to JS/XSS.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Basic validation
    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (email.length > 255 || password.length > 128 || password.length < 8) {
      logSecurity(request, "auth_login_failed", `Invalid input format: ${maskEmail(email)}`);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !data.session) {
      logSecurity(request, "auth_login_failed", `Email: ${maskEmail(email)}`);

      // Generic error — never reveal whether email exists
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    logSecurity(
      request,
      "auth_login_success",
      `User: ${data.user.id}`,
    );

    // Build response with httpOnly secure cookies
    const response = NextResponse.json(
      { success: true, redirectTo: "/admin" },
      { status: 200 }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Access token — short-lived (7 days), httpOnly
    response.cookies.set("sb-access-token", data.session.access_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    // Refresh token — longer-lived (30 days), httpOnly
    response.cookies.set("sb-refresh-token", data.session.refresh_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Block other methods
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

// ============================================================
// HELPERS
// ============================================================

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local?.[0] || "*"}***@${domain}`;
}

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
