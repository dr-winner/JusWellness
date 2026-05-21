import { NextRequest, NextResponse } from "next/server";
import { inquirySchema } from "@/lib/validations";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  // Rate limit: 3 inquiries per IP per 5 minutes
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const limiter = rateLimit(`inquiry:${ip}`, { maxRequests: 3, windowMs: 300_000 });

  if (!limiter.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait a few minutes." },
      { status: 429, headers: getRateLimitHeaders(limiter) }
    );
  }

  try {
    const body = await request.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("inquiries")
      .insert({
        name: parsed.data.name,
        phone: parsed.data.phone,
        order_type: parsed.data.order_type,
        message: parsed.data.message || null,
      });

    if (error) {
      console.error("Inquiry insert error:", error.message);
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
