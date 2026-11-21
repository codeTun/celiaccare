import "server-only";

import { v2 as cloudinary, type UploadApiOptions, type UploadApiResponse } from "cloudinary";

/**
 * Cloudinary = where product, restaurant and artisan photos (and the official logos) are stored.
 * Uploads always happen on the SERVER (inside admin Server Actions), so the
 * API secret never reaches the browser.
 * Credentials: CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in .env
 */

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
  );
}

let configured = false;
function client() {
  if (!configured) {
    if (process.env.CLOUDINARY_URL) {
      cloudinary.config({ secure: true });
    } else {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }
    configured = true;
  }
  return cloudinary;
}

export type UploadedImage = { url: string; publicId: string; width: number; height: number };

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const BASE_OPTIONS: UploadApiOptions = {
  resource_type: "image",
  allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
  transformation: [{ width: 1600, height: 1600, crop: "limit" }], // never store huge originals
  unique_filename: true,
  use_filename: false,
  overwrite: false,
};

/** Check a file coming from an <input type="file"> before uploading it. Returns an error message or null. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME.includes(file.type)) return "Format accepté : JPG, PNG, WEBP ou AVIF.";
  if (file.size > MAX_IMAGE_BYTES) return "Image trop lourde (5 Mo maximum).";
  return null;
}

/** An <input type="file"> left empty still sends an empty File: treat it as "no new image". */
export function isEmptyFile(value: FormDataEntryValue | null): boolean {
  return !value || typeof value === "string" || value.size === 0;
}

/** Upload an image File to Cloudinary, in the folder "celiaccare/<folder>" ("logos": artisan and restaurant logos). */
export async function uploadImage(
  file: File,
  folder: "products" | "categories" | "producers" | "restaurants" | "dishes" | "logos",
) {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary n'est pas configuré (voir CLOUDINARY_* dans .env).");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = client().uploader.upload_stream({ ...BASE_OPTIONS, folder: `celiaccare/${folder}` }, (error, res) => {
      // `error` is a plain object { message, http_code }, not an Error instance
      if (error || !res) reject(new Error(error?.message ?? "Échec de l'envoi de l'image vers Cloudinary."));
      else resolve(res);
    });
    stream.end(buffer);
  });
  return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height } satisfies UploadedImage;
}

/** Delete an image from Cloudinary (ignored when Cloudinary is not configured). */
export async function deleteImage(publicId: string | null | undefined) {
  if (!publicId || !isCloudinaryConfigured()) return false;
  try {
    const result: { result: string } = await client().uploader.destroy(publicId, { resource_type: "image", invalidate: true });
    return result.result === "ok";
  } catch {
    return false; // never block a deletion in our database because of Cloudinary
  }
}
