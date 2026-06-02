import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createServerClient } from "@/lib/supabase-server";

/**
 * Paystack webhook handler.
 * OWASP A02: Uses timing-safe comparison for HMAC verification.
 * OWASP A08: Validates event structure before processing.
 */

function verifyPaystackSignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("[SECURITY] PAYSTACK_SECRET_KEY not configured");
    return false;
  }

  const hash = createHmac("sha512", secret).update(body).digest("hex");

  // Timing-safe comparison — prevents timing attacks
  const hashBuf = Buffer.from(hash, "utf8");
  const sigBuf = Buffer.from(signature, "utf8");

  if (hashBuf.length !== sigBuf.length) return false;
  return timingSafeEqual(hashBuf, sigBuf);
}

// Allowed event types — reject anything we don't handle
const ALLOWED_EVENTS = new Set(["charge.success", "charge.failed"]);

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  // Read raw body for signature verification
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!signature || !verifyPaystackSignature(body, signature)) {
    console.log(
      `[SECURITY] ${JSON.stringify({
        type: "invalid_signature",
        ip,
        path: "/api/webhooks/paystack",
        method: "POST",
        details: "Invalid Paystack webhook signature",
        timestamp: new Date().toISOString(),
      })}`
    );
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);

    // Validate event structure
    if (
      !event ||
      typeof event.event !== "string" ||
      !event.data ||
      typeof event.data !== "object"
    ) {
      return NextResponse.json(
        { error: "Invalid event structure" },
        { status: 400 }
      );
    }

    // Only process known event types
    if (!ALLOWED_EVENTS.has(event.event)) {
      // Acknowledge unknown events gracefully (Paystack expects 200)
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (event.event === "charge.success") {
      const { reference, amount, metadata } = event.data;

      // Validate required fields
      if (!reference || typeof amount !== "number") {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const orderId = metadata?.order_id;

      if (orderId) {
        // Validate orderId is a valid UUID
        if (
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            orderId
          )
        ) {
          console.log(
            `[SECURITY] ${JSON.stringify({
              type: "suspicious_input",
              ip,
              path: "/api/webhooks/paystack",
              details: `Invalid orderId format: ${orderId.substring(0, 50)}`,
              timestamp: new Date().toISOString(),
            })}`
          );
          return NextResponse.json(
            { error: "Invalid order ID" },
            { status: 400 }
          );
        }

        const supabase = createServerClient();

        // Verify order exists and is in correct state before updating
        const { data: existingOrder } = await supabase
          .from("orders")
          .select("id, payment_status")
          .eq("id", orderId)
          .single();

        if (!existingOrder) {
          console.log(
            `[SECURITY] ${JSON.stringify({
              type: "suspicious_input",
              ip,
              path: "/api/webhooks/paystack",
              details: `Order not found: ${orderId}`,
              timestamp: new Date().toISOString(),
            })}`
          );
          return NextResponse.json(
            { error: "Order not found" },
            { status: 404 }
          );
        }

        // Prevent double-processing
        if (existingOrder.payment_status === "paid") {
          return NextResponse.json({ received: true }, { status: 200 });
        }

        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            payment_reference: String(reference).substring(0, 200),
            paid_amount: amount / 100, // Paystack sends kobo/pesewas
          })
          .eq("id", orderId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[SECURITY] Webhook processing error:", err);
    return NextResponse.json(
      { error: "Processing failed" },
      { status: 500 }
    );
  }
}

// Block non-POST methods
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
