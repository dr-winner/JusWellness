import { NextRequest, NextResponse } from "next/server";
import { orderSchema } from "@/lib/validations";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { createServerClient } from "@/lib/supabase-server";
import { getClientIp } from "@/lib/security";

/**
 * Order creation endpoint — public facing.
 *
 * OWASP A03: Input injection — all inputs validated via Zod + sanitized.
 * OWASP A04: Rate limited per IP.
 * OWASP A08: Server-side price verification — never trust client totals.
 */
export async function POST(request: NextRequest) {
  // Rate limit: 5 orders per IP per minute
  const ip = getClientIp(request);
  const limiter = rateLimit(`order:${ip}`, {
    maxRequests: 5,
    windowMs: 60_000,
  });

  if (!limiter.allowed) {
    logSecurity(request, "rate_limit_exceeded", `Order rate limit: ${ip}`);
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(limiter) }
    );
  }

  try {
    // Limit request body size (defense-in-depth)
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 50_000) {
      return NextResponse.json(
        { error: "Request too large" },
        { status: 413 }
      );
    }

    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid order data",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { items, ...orderData } = parsed.data;

    // Calculate totals server-side (NEVER trust client totals)
    const subtotal = items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    );
    const total = subtotal;

    // Sanity check: reject unreasonable totals
    if (total > 100_000 || total <= 0) {
      logSecurity(
        request,
        "suspicious_input",
        `Unreasonable order total: ${total}`
      );
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }

    // Verify prices against DB
    const supabase = createServerClient();
    const productIds = items
      .map((i) => i.product_id)
      .filter((id): id is string => !!id);

    if (productIds.length > 0) {
      const { data: dbProducts } = await supabase
        .from("product_sizes")
        .select("price, label, product_id, products(name)")
        .in("product_id", productIds);

      if (dbProducts && dbProducts.length > 0) {
        for (const item of items) {
          if (!item.product_id) continue;
          const dbItem = dbProducts.find(
            (p) =>
              p.product_id === item.product_id && p.label === item.size_label
          );
          if (
            dbItem &&
            Math.abs(Number(dbItem.price) - item.unit_price) > 0.01
          ) {
            logSecurity(
              request,
              "suspicious_input",
              `Price mismatch: ${item.product_name} expected ${dbItem.price}, got ${item.unit_price}`
            );
            return NextResponse.json(
              {
                error:
                  "Price mismatch detected. Please refresh and try again.",
              },
              { status: 409 }
            );
          }
        }
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        delivery_address: orderData.delivery_address || null,
        channel: orderData.channel,
        status: "pending",
        subtotal,
        delivery_fee: 0,
        total,
        payment_status: "unpaid",
        notes: orderData.notes || null,
        customer_id: null,
      })
      .select("id, order_number")
      .single();

    if (orderError) {
      console.error("[Order creation error]", orderError.message);
      return NextResponse.json(
        { error: "Failed to create order. Please try again." },
        { status: 500 }
      );
    }

    // Insert order items (server-calculated total_price)
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      product_name: item.product_name,
      size_label: item.size_label,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity, // Server-calculated
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("[Order items error]", itemsError.message);
    }

    return NextResponse.json(
      {
        success: true,
        order_number: order.order_number,
        order_id: order.id,
      },
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
