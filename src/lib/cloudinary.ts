import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export const FOLDERS = {
  products: "jus-wellness/products",
  receipts: "jus-wellness/receipts",
  admin: "jus-wellness/admin",
} as const;

export function getOptimizedUrl(
  publicId: string,
  opts: { width?: number; height?: number; quality?: string } = {}
): string {
  const { width = 600, height, quality = "auto" } = opts;
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality,
    width,
    height,
    crop: "fill",
    gravity: "auto",
    dpr: "auto",
  });
}

export function getBlurPlaceholder(publicId: string): string {
  return cloudinary.url(publicId, {
    fetch_format: "auto",
    quality: 1,
    width: 20,
    effect: "blur:1000",
  });
}
