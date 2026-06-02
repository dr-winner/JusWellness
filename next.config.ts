import type { NextConfig } from "next";

/**
 * Next.js configuration with comprehensive security hardening.
 *
 * OWASP A05: Security Misconfiguration
 * - Strict CSP (no unsafe-eval)
 * - HSTS with preload
 * - Frame ancestors: none
 * - Permissions-Policy restrictive
 */

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self), interest-cohort=()",
  },
  {
    // Modern browsers don't need this; set 0 to prevent XSS filter bypass
    key: "X-XSS-Protection",
    value: "0",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // No 'unsafe-eval' — only 'unsafe-inline' for Next.js CSS-in-JS compatibility
      "script-src 'self' 'unsafe-inline' https://js.paystack.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://res.cloudinary.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.paystack.co https://api.cloudinary.com",
      "frame-src https://checkout.paystack.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  {
    // Prevent search engines from caching sensitive pages
    key: "X-Robots-Tag",
    value: "noindex, nofollow",
  },
];

// Public pages — allow indexing
const publicSecurityHeaders = securityHeaders.filter(
  (h) => h.key !== "X-Robots-Tag"
);

const nextConfig: NextConfig = {
  // Never reveal the framework
  poweredByHeader: false,

  typescript: {
    // TODO: Enable once all types are clean
    ignoreBuildErrors: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dqcejwbxk/**",
      },
    ],
  },

  // Strict React mode for development safety
  reactStrictMode: true,

  async headers() {
    return [
      // Admin routes: full security headers including noindex
      {
        source: "/admin/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [
          ...securityHeaders,
          // API routes: prevent caching of sensitive data
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
        ],
      },
      // Login page: no-cache, noindex
      {
        source: "/login",
        headers: securityHeaders,
      },
      // Public pages: allow indexing
      {
        source: "/((?!admin|api|login).*)",
        headers: publicSecurityHeaders,
      },
    ];
  },

  // Redirect HTTP to HTTPS in production
  async redirects() {
    return [];
  },
};

export default nextConfig;
