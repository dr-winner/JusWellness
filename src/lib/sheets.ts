/**
 * Google Sheets integration via Apps Script Web App.
 *
 * HOW IT WORKS:
 * 1. Create a Google Sheet with tabs: "Orders", "Wholesale", "Reviews"
 * 2. Open Extensions → Apps Script
 * 3. Paste the script from /scripts/google-sheets-webhook.gs
 * 4. Deploy → New deployment → Web app → Anyone can access
 * 5. Copy the URL and set NEXT_PUBLIC_SHEETS_WEBHOOK_URL in .env.local
 *
 * All writes are fire-and-forget (best effort) — the site works fine
 * even if the webhook is down or not configured.
 */

const WEBHOOK_URL = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK_URL || "";

interface SheetPayload {
  sheet: "Orders" | "Wholesale" | "Reviews";
  data: Record<string, unknown>;
}

/**
 * Send data to Google Sheet via Apps Script webhook.
 * Fire-and-forget — never blocks checkout or throws to the user.
 */
export async function logToSheet(payload: SheetPayload): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.warn("[sheets] No SHEETS_WEBHOOK_URL configured — skipping log");
    return false;
  }

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("[sheets] Webhook responded", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[sheets] Failed to log:", err);
    return false;
  }
}

/**
 * Log an order to the "Orders" sheet.
 */
export function logOrder(order: {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: {
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    subscription: string | null;
  }[];
  subtotal: number;
  subscriptionSavings: number;
  total: number;
}) {
  return logToSheet({
    sheet: "Orders",
    data: {
      ...order,
      timestamp: new Date().toISOString(),
      itemsSummary: order.items
        .map(
          (i) =>
            `${i.name} (${i.size}) x${i.quantity} = GHS ${i.lineTotal.toFixed(2)}${i.subscription ? ` [${i.subscription}]` : ""}`
        )
        .join(" | "),
    },
  });
}

/**
 * Log a wholesale request to the "Wholesale" sheet.
 */
export function logWholesale(request: {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  location: string;
  businessType: string;
  products: string;
  weeklyVolume: string;
  message: string;
}) {
  return logToSheet({
    sheet: "Wholesale",
    data: {
      ...request,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Log a customer review to the "Reviews" sheet.
 */
export function logReview(review: {
  customerName: string;
  product: string;
  rating: number;
  text: string;
}) {
  return logToSheet({
    sheet: "Reviews",
    data: {
      ...review,
      timestamp: new Date().toISOString(),
    },
  });
}
