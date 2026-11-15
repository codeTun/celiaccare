"use client";

import { ImagePlus, RotateCcw } from "lucide-react";
import { useEffect, useId, useRef, useState, type ChangeEvent, type ReactNode } from "react";

import { CloudImage } from "@/components/ui/cloud-image";
import { Checkbox } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/** Same rules as lib/cloudinary.ts (checked again on the server). */
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Photo field of the admin forms (products, restaurants, artisans, categories, dishes).
 * - shows the current Cloudinary photo (or the branded placeholder);
 * - lets the admin pick a new JPG / PNG / WEBP / AVIF file (5 MB max, checked here AND on the server)
 *   and previews it before saving;
 * - offers "Retirer la photo" when there is a current photo.
 *
 * On the server (Server Action):
 *   const file = formData.get("image");           // name prop
 *   if (!isEmptyFile(file)) { const problem = validateImageFile(file as File); ... uploadImage(...) }
 *   const remove = formData.get("removeImage") === "on";   // removeName prop
 * The <form> needs nothing special: React sends files with Server Actions.
 *
 * @example
 * <ImageUploadField label="Photo du produit" currentUrl={product.imageUrl} alt={product.name}
 *   fallbackIcon={product.categoryIcon} error={state.fieldErrors?.image} />
 */
export function ImageUploadField({
  label,
  name = "image",
  removeName = "removeImage",
  currentUrl,
  alt,
  fallbackIcon,
  hint = "JPG, PNG, WEBP ou AVIF · 5 Mo maximum. Format carré conseillé.",
  error,
  required = false,
  className,
}: {
  label: ReactNode;
  /** Name of the file input (default "image"). */
  name?: string;
  /** Name of the "remove the photo" checkbox (default "removeImage"). */
  removeName?: string;
  /** Current photo (Cloudinary URL) or null. */
  currentUrl?: string | null;
  /** Description of the photo for screen readers. */
  alt: string;
  /** Category icon key for the placeholder (lib/icons.ts). */
  fallbackIcon?: string | null;
  hint?: ReactNode;
  error?: string | string[] | null;
  /** A photo is mandatory (only when there is no current photo). */
  required?: boolean;
  className?: string;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);

  // Free the memory used by the preview when it changes or when the field disappears.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function clearSelection() {
    if (inputRef.current) inputRef.current.value = "";
    setPreviewUrl(null);
    setFileName(null);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setLocalError(null);
    if (!file) {
      clearSelection();
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      clearSelection();
      setLocalError("Format accepté : JPG, PNG, WEBP ou AVIF.");
      return;
    }
    if (file.size > MAX_BYTES) {
      clearSelection();
      setLocalError("Image trop lourde (5 Mo maximum). Réduisez-la puis réessayez.");
      return;
    }
    setRemove(false);
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  const serverError = Array.isArray(error) ? error[0] : error;
  const message = localError ?? serverError ?? null;
  const describedBy = [`${id}-hint`, message ? `${id}-error` : null].filter(Boolean).join(" ");
  const showCurrent = !previewUrl && !remove;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-semibold text-ink" id={`${id}-label`}>
        {label}
        {required && !currentUrl ? (
          <span className="ms-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>

      <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-line-strong bg-canvas/60 p-4 sm:flex-row sm:items-center">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {previewUrl ? (
            // A local preview (blob: URL) cannot go through the Cloudinary loader of next/image.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt={`Aperçu : ${alt}`} className="size-full object-cover" />
          ) : (
            <CloudImage
              src={showCurrent ? currentUrl : null}
              alt={alt}
              sizes="112px"
              fallbackIcon={fallbackIcon}
              className="size-full"
              rounded="rounded-2xl"
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={id}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-600"
            >
              <ImagePlus className="size-4" aria-hidden="true" />
              {currentUrl || previewUrl ? "Changer la photo" : "Choisir une photo"}
              <input
                ref={inputRef}
                id={id}
                type="file"
                name={name}
                accept={ACCEPTED_TYPES.join(",")}
                required={required && !currentUrl}
                onChange={onFileChange}
                aria-labelledby={`${id}-label`}
                aria-describedby={describedBy}
                aria-invalid={message ? true : undefined}
                className="sr-only"
              />
            </label>
            {previewUrl ? (
              <button
                type="button"
                onClick={clearSelection}
                className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-white hover:text-ink"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Annuler
              </button>
            ) : null}
          </div>

          {fileName ? <p className="truncate text-xs text-ink-muted">Nouvelle photo : {fileName}</p> : null}

          {currentUrl && !previewUrl ? (
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <Checkbox name={removeName} checked={remove} onChange={(event) => setRemove(event.target.checked)} />
              Retirer la photo actuelle
            </label>
          ) : null}

          <p id={`${id}-hint`} className="text-xs text-ink-subtle">
            {hint}
          </p>
        </div>
      </div>

      {message ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}
