import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_PATHS = ["/admin"];
const API_PATHS = ["/api"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // --- Admin route protection ---
  const isAdminRoute = ADMIN_PATHS.some((p) => pathname.startsWith(p));
  if (isAdminRoute) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    });

    const accessToken = request.cookies.get("sb-access-token")?.value;
    const refreshToken = request.cookies.get("sb-refresh-token")?.value;

    if (!accessToken || !refreshToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      const redirectResponse = NextResponse.redirect(new URL("/login", request.url));
      redirectResponse.cookies.delete("sb-access-token");
      redirectResponse.cookies.delete("sb-refresh-token");
      return redirectResponse;
    }
  }

  // --- API route protection: verify origin ---
  const isApiRoute = API_PATHS.some((p) => pathname.startsWith(p));
  if (isApiRoute) {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (request.method !== "GET") {
      if (!origin || !host || !origin.includes(host.split(":")[0])) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
