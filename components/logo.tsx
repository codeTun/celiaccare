import { useId } from "react";

import { cn } from "@/lib/utils";

/**
 * CeliacCare logo — inspired by the brand name and by celiac disease:
 * - the "C" of CeliacCare is drawn as a cross-section of the small intestine,
 *   opened into a C, with healthy VILLI (the tiny finger-like folds that celiac
 *   disease damages and that heal on a gluten-free diet) growing inward;
 * - at its heart, a heart: "Care".
 */
const RING = "M46.94 47.47A21.5 21.5 0 1 1 46.94 16.53";
const VILLI =
  "M33.99 50.9L33.19 43.34M23.67 49.08L27 42.25M15.89 42.07L22.33 38.04M13 32L20.6 32M15.89 21.93L22.33 25.96M23.67 14.92L27 21.75M33.99 13.1L33.19 20.66";
const HEART =
  "M32.6 37.36C32.6 37.36 26.77 33.57 26.77 30.07C26.77 28.14 28.28 26.86 29.92 26.86C31.08 26.86 32.13 27.56 32.6 28.61C33.07 27.56 34.12 26.86 35.28 26.86C36.92 26.86 38.43 28.14 38.43 30.07C38.43 33.57 32.6 37.36 32.6 37.36Z";

const TONES = {
  // on white / light backgrounds
  brand: { from: "#1DB06C", to: "#0A5636" },
  // on dark green backgrounds (footer, admin sidebar)
  light: { from: "#D9F2E4", to: "#3DBB7E" },
} as const;

export function LogoEmblem({
  className,
  title,
  tone = "brand",
}: {
  className?: string;
  title?: string;
  tone?: keyof typeof TONES;
}) {
  // Unique gradient id: the logo can appear several times on one page.
  const gradientId = `cc-gut-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const colors = TONES[tone];
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={colors.from} />
          <stop offset="1" stopColor={colors.to} />
        </linearGradient>
      </defs>
      <g stroke={`url(#${gradientId})`} fill="none" strokeLinecap="round">
        <path d={RING} strokeWidth="9.5" />
        <path d={VILLI} strokeWidth="4.6" />
      </g>
      <path d={HEART} fill="#F2B93B" />
    </svg>
  );
}

/** Emblem + "CeliacCare" wordmark. Use tone="light" on dark green backgrounds. */
export function Logo({
  className,
  tone = "dark",
  showSuffix = true,
  label = "CeliacCare",
}: {
  className?: string;
  tone?: "dark" | "light";
  showSuffix?: boolean;
  label?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <LogoEmblem className="h-10 w-10" tone={tone === "dark" ? "brand" : "light"} />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.35rem] font-extrabold tracking-tight",
            tone === "dark" ? "text-ink" : "text-white",
          )}
        >
          Celiac<span className={tone === "dark" ? "text-brand-600" : "text-brand-300"}>Care</span>
        </span>
        {showSuffix ? (
          <span
            className={cn(
              "mt-1 text-[0.62rem] font-bold tracking-[0.32em] uppercase",
              tone === "dark" ? "text-ink-subtle" : "text-brand-200",
            )}
          >
            Tunisie
          </span>
        ) : null}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
