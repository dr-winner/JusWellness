import { NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/security";

/**
 * CSRF token endpoint — returns a fresh token for form submissions.
 * OWASP A04: Insecure Design — CSRF protection for state-changing requests.
 */
export async function GET() {
  const token = generateCsrfToken();

  return NextResponse.json(
    { token },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
}
