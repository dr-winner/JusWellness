import { NextRequest, NextResponse } from "next/server";

/**
 * Secure logout — clears httpOnly auth cookies and redirects.
 * OWASP A07: Identification and Authentication Failures
 */
export async function POST(request: NextRequest) {
  // Log the logout event
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  console.log(
    `[SECURITY] ${JSON.stringify({
      type: "auth_logout",
      ip,
      path: "/api/auth/logout",
      method: "POST",
      timestamp: new Date().toISOString(),
    })}`
  );

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const response = NextResponse.redirect(new URL("/login", siteUrl));

  const isProduction = process.env.NODE_ENV === "production";

  const cookieOptions = {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
  };

  // Clear both auth cookies
  response.cookies.set("sb-access-token", "", cookieOptions);
  response.cookies.set("sb-refresh-token", "", cookieOptions);

  // Also clear any legacy non-httpOnly cookies (migration safety)
  response.cookies.set("sb-access-token", "", {
    ...cookieOptions,
    httpOnly: false,
  });
  response.cookies.set("sb-refresh-token", "", {
    ...cookieOptions,
    httpOnly: false,
  });

  return response;
}

// Block non-POST
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
