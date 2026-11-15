import Image from "next/image";
import { createElement } from "react";

import { getCategoryIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";

/**
 * Image stored on Cloudinary (resized & converted by the loader in lib/image-loader.ts).
 * When there is no photo yet, a branded placeholder is shown instead
 * (soft green gradient + Tunisian zellige pattern + the category icon).
 *
 * The parent decides the size: give `className` an aspect ratio, e.g. "aspect-square".
 * Pass alt="" when the name is already written next to the image (cards): the photo and the
 * placeholder are then hidden from screen readers instead of repeating the name.
 */
export function CloudImage({
  src,
  alt,
  sizes,
  fallbackIcon,
  preload = false,
  className,
  imageClassName,
  rounded = "rounded-2xl",
}: {
  src: string | null | undefined;
  alt: string;
  /** How wide the image is on screen, e.g. "(min-width: 1024px) 25vw, 50vw" */
  sizes: string;
  /** Category icon key (lib/icons.ts) used by the placeholder */
  fallbackIcon?: string | null;
  /** true only for the main image at the top of a page (LCP) */
  preload?: boolean;
  className?: string;
  imageClassName?: string;
  rounded?: string;
}) {
  if (!src) {
    return (
      <div
        {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
        className={cn(
          "relative grid place-items-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-saffron-50",
          rounded,
          className,
        )}
      >
        <div className="absolute inset-0 bg-khatam opacity-70" aria-hidden="true" />
        <div className="relative grid size-[38%] max-h-24 max-w-24 min-h-12 min-w-12 place-items-center rounded-full bg-white/90 text-brand-600 shadow-soft ring-1 ring-brand-100">
          {createElement(getCategoryIcon(fallbackIcon), { className: "size-1/2", strokeWidth: 1.6, "aria-hidden": true })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-canvas", rounded, className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className={cn("object-cover", imageClassName)}
      />
    </div>
  );
}
