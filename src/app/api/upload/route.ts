import { NextRequest, NextResponse } from "next/server";
import cloudinary, { FOLDERS } from "@/lib/cloudinary";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function POST(request: NextRequest) {
  // Rate limit: 20 uploads per minute per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const limiter = rateLimit(`upload:${ip}`, { maxRequests: 20, windowMs: 60_000 });

  if (!limiter.allowed) {
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
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
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

    // Resolve folder path
    const uploadFolder = FOLDERS[folder as keyof typeof FOLDERS] || FOLDERS.products;

    // Convert to buffer and upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

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
            transformation: [
              { quality: "auto", fetch_format: "auto" },
            ],
            allowed_formats: ["jpg", "png", "webp", "avif"],
          },
          (error, result) => {
            if (error || !result) reject(error || new Error("Upload failed"));
            else resolve(result as any);
          }
        )
        .end(buffer);
    });

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
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
