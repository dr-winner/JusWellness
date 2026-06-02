import { NextRequest, NextResponse } from "next/server";
import cloudinary, { FOLDERS } from "@/lib/cloudinary";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { verifyAdminAuth, logSecurityEvent, getClientIp } from "@/lib/security";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const ALLOWED_FOLDERS = new Set(Object.keys(FOLDERS));

// Magic bytes for image validation (defense-in-depth beyond MIME check)
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF
};

function validateMagicBytes(
  buffer: Buffer,
  mimeType: string
): boolean {
  const expected = MAGIC_BYTES[mimeType];
  if (!expected) return true; // No magic bytes check for avif
  if (buffer.length < expected.length) return false;
  return expected.every((byte, i) => buffer[i] === byte);
}

/**
 * Secure file upload endpoint.
 * OWASP A01: Requires admin authentication.
 * OWASP A04: Rate limiting, file type validation, magic byte verification.
 * OWASP A10: Folder whitelisting prevents path traversal.
 */
export async function POST(request: NextRequest) {
  // --- Auth check ---
  const user = await verifyAdminAuth(request);
  if (!user) {
    logSecurityEvent(request, "unauthorized_access", "Upload without auth");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Rate limit: 20 uploads per minute per user ---
  const limiter = rateLimit(`upload:${user.id}`, {
    maxRequests: 20,
    windowMs: 60_000,
  });

  if (!limiter.allowed) {
    logSecurityEvent(request, "rate_limit_exceeded", "Upload rate limit");
    return NextResponse.json(
      { error: "Too many uploads. Wait a moment." },
      { status: 429, headers: getRateLimitHeaders(limiter) }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "products";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.has(file.type)) {
      logSecurityEvent(
        request,
        "upload_rejected",
        `Invalid type: ${file.type}`,
        user.id
      );
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: ${[...ALLOWED_TYPES].join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Max 5MB." },
        { status: 400 }
      );
    }

    // Whitelist folder — prevent path traversal
    if (!ALLOWED_FOLDERS.has(folder)) {
      logSecurityEvent(
        request,
        "suspicious_input",
        `Invalid upload folder: ${folder}`,
        user.id
      );
      return NextResponse.json(
        { error: "Invalid upload folder" },
        { status: 400 }
      );
    }

    const uploadFolder = FOLDERS[folder as keyof typeof FOLDERS];

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate magic bytes (defense-in-depth)
    if (!validateMagicBytes(buffer, file.type)) {
      logSecurityEvent(
        request,
        "upload_rejected",
        `Magic byte mismatch for ${file.type}`,
        user.id
      );
      return NextResponse.json(
        { error: "File content does not match declared type" },
        { status: 400 }
      );
    }

    // Strip filename to prevent injection
    const safeFilename = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .substring(0, 100);

    const result = await new Promise<{
      public_id: string;
      secure_url: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: uploadFolder,
            resource_type: "image",
            public_id: safeFilename.replace(/\.[^.]+$/, ""), // Strip extension
            transformation: [{ quality: "auto", fetch_format: "auto" }],
            allowed_formats: ["jpg", "png", "webp", "avif"],
          },
          (error, result) => {
            if (error || !result) reject(error || new Error("Upload failed"));
            else resolve(result as any);
          }
        )
        .end(buffer);
    });

    logSecurityEvent(
      request,
      "admin_action",
      `File uploaded: ${result.public_id}`,
      user.id
    );

    return NextResponse.json(
      {
        success: true,
        public_id: result.public_id,
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
      { status: 201, headers: getRateLimitHeaders(limiter) }
    );
  } catch (error) {
    console.error("[Upload error]", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}

// Block other methods
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
