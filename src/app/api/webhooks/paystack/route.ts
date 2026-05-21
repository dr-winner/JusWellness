import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createServerClient } from "@/lib/supabase-server";

function verifyPaystackSignature(body: string, signature: string): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("PAYSTACK_SECRET_KEY not configured");
    return false;
  }
  const hash = createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!signature || !verifyPaystackSignature(body, signature)) {
    console.warn("Invalid Paystack webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(body);

    if (event.event === "charge.success") {
      const { reference, amount, metadata } = event.data;
      const orderId = metadata?.order_id;

      if (orderId) {
        const supabase = createServerClient();
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            payment_reference: reference,
            paid_amount: amount / 100, // Paystack sends kobo/pesewas
          })
          .eq("id", orderId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}

// Block non-POST methods
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
