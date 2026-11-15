"use client";

import { cloudinaryUrl } from "./cloudinary-url";

/**
 * next/image loader (next.config.ts → images.loaderFile).
 * Our photos live on Cloudinary: instead of resizing them on our server, we ask
 * Cloudinary for the right width and format directly in the URL (see cloudinary-url.ts).
 * Local files (in /public) are returned unchanged.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return (
    cloudinaryUrl(src, { width, quality: quality ?? "auto" }) ??
    // Local file: the width is only a hint (static files ignore the query string).
    `${src}${src.includes("?") ? "&" : "?"}w=${width}`
  );
}
