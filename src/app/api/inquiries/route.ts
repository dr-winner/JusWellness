import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validations";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase-server";
import { getClientIp } from "@/lib/security";

/**
 * Public inquiry submission endpoint.
 *
 * OWASP A03: Input validated and sanitized via Zod.
 * OWASP A04: Strict rate limiting (3 per 5 min per IP).
 */
export async function POST(request: NextRequest) {
  // Rate limit: 3 inquiries per IP per 5 minutes
  const ip = getClientIp(request);
  const limiter = rateLimit(`inquiry:${ip}`, {
    maxRequests: 3,
    windowMs: 300_000,
  });

  if (!limiter.allowed) {
    logSecurity(request, "rate_limit_exceeded", `Inquiry rate limit: ${ip}`);
    return NextResponse.json(
      { error: "Too many submissions. Please wait a few minutes." },
      { status: 429, headers: getRateLimitHeaders(limiter) }
    );
  }

  try {
    // Limit body size
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 10_000) {
      return NextResponse.json(
        { error: "Request too large" },
        { status: 413 }
      );
    }

    const body = await request.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid form data",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { error } = await supabase.from("inquiries").insert({
      name: parsed.data.name,
      phone: parsed.data.phone,
      order_type: parsed.data.order_type,
      message: parsed.data.message || null,
    });

    if (error) {
      console.error("[Inquiry insert error]", error.message);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 201, headers: getRateLimitHeaders(limiter) }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// Block non-POST
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

// ============================================================
// HELPERS
// ============================================================

function logSecurity(
  request: NextRequest,
  type: string,
  details: string
): void {
  const ip = getClientIp(request);
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
