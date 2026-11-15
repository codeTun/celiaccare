/**
 * Build a Cloudinary delivery URL with on-the-fly transformations.
 * Pure string code (no SDK, no secret): safe on the server and in the browser.
 *
 *   https://res.cloudinary.com/<cloud>/image/upload/<id>.jpg
 *   -> https://res.cloudinary.com/<cloud>/image/upload/c_limit,f_auto,q_auto,w_640/<id>.jpg
 *   - c_limit : never upscale
 *   - f_auto  : WebP / AVIF when the browser supports it
 *   - q_auto  : best quality / weight balance
 *   - w_640   : the width we need
 */
const UPLOAD_SEGMENT = "/image/upload/";

type TransformOptions = {
  width: number;
  height?: number;
  quality?: number | "auto";
  crop?: "limit" | "fill" | "fit";
};

export function cloudinaryUrl(src: string, { width, height, quality = "auto", crop = "limit" }: TransformOptions) {
  const index = src.indexOf(UPLOAD_SEGMENT);
  if (!src.startsWith("https://res.cloudinary.com/") || index === -1) return null;
  const head = src.slice(0, index + UPLOAD_SEGMENT.length);
  const tail = src.slice(index + UPLOAD_SEGMENT.length);
  const transforms = [
    `c_${crop}`,
    "f_auto",
    crop === "fill" ? "g_auto" : null,
    height ? `h_${Math.round(height)}` : null,
    `q_${quality}`,
    `w_${Math.round(width)}`,
  ]
    .filter(Boolean)
    .join(",");
  return `${head}${transforms}/${tail}`;
}
