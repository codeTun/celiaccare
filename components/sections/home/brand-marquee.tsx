import { ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Container } from "@/components/ui/container";
import { localePath } from "@/i18n/config";
import type { HomeDict } from "@/i18n/resources/fr/home";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { BrandDTO, Locale } from "@/types";

import { JasmineFlower } from "../decor";
import {
  brandInitials,
  brandShortName,
  logoVariants,
  monogramTones,
  type LogoVariant,
  type MonogramTone,
} from "./brand-monogram";

/** Below this number of businesses the wall stays still (centered, wrapping): too few for two moving rows. */
const MIN_BRANDS_TO_MOVE = 6;
/** Each copy of a row holds at least this many logos, so a row is always wider than the screen. */
const MIN_LOGOS_PER_COPY = 8;
/** Speed: seconds per logo. The second row is a little slower, for a gentle parallax. */
const SECONDS_PER_LOGO = [3.4, 4.1] as const;

type WallLogo = { brand: BrandDTO; tone: MonogramTone; variant: LogoVariant };

/**
 * Brand wall at the very bottom of the home page, right above the footer: every active artisan,
 * manufacturer and restaurant as a LOGO (its official logo when the admin uploaded one with its
 * agreement, otherwise a lockup drawn in the colours of the site: emblem + stylised name), on two rows
 * that slide in opposite directions, with a small Tunisian star between two logos.
 * Server Component, NO client JavaScript: the motion is a CSS animation (app/globals.css, .brand-wall).
 *
 * Accessibility: the moving rows are decoration for the eyes (aria-hidden, out of the Tab order, still
 * clickable). The real list is .brand-wall-still: every business once, read by screen readers; it
 * appears (still, wrapped) as soon as a logo gets the keyboard focus, and for visitors who chose
 * "reduce motion". The motion pauses under the mouse and stops for good with the pause button.
 */
export function BrandMarquee({ lang, home, brands }: { lang: Locale; home: HomeDict; brands: BrandDTO[] }) {
  if (brands.length === 0) return null;

  // "Nos partenaires" only once the agreements are signed (lib/site-config.ts); until then the
  // honest title and subtitle of real businesses that are not partners yet.
  const texts = siteConfig.partnersSigned ? home.brands.partners : home.brands.demo;
  const moving = brands.length >= MIN_BRANDS_TO_MOVE;

  // Two rows: every other business, so each row mixes the alphabet. Colours and lockup styles are
  // computed per row, so two neighbours never look alike.
  const rows = [brands.filter((_, i) => i % 2 === 0), brands.filter((_, i) => i % 2 === 1)].map((row) => {
    const tones = monogramTones(row);
    const variants = logoVariants(row);
    return row.map((brand, i): WallLogo => ({ brand, tone: tones[i], variant: variants[i] }));
  });
  const all: WallLogo[] = brands.map(
    (brand) => rows.flat().find((logo) => logo.brand.slug === brand.slug && logo.brand.kind === brand.kind)!,
  );

  return (
    <section aria-labelledby="home-brands-title" className="brand-band border-t border-line bg-canvas pb-6 sm:pb-9">
      <Container className="flex flex-col gap-1 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pt-9">
        <div className="min-w-0">
          <h2 id="home-brands-title" className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg">
            <JasmineFlower className="size-[18px]" petalClassName="fill-brand-600" />
            {texts.title}
          </h2>
          <p className="mt-0.5 text-sm leading-snug text-ink-muted sm:leading-relaxed">{texts.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-2">
          <Link
            href={localePath(lang, "/artisans")}
            className="group -mb-3 inline-flex scroll-mt-24 items-center gap-1.5 py-3 text-sm font-semibold text-brand-700 hover:text-brand-800 sm:-my-3"
          >
            {home.brands.seeAll}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
          {moving ? <PauseToggle label={home.brands.pause} /> : null}
        </div>
      </Container>

      <div className="brand-wall mx-auto mt-4 max-w-7xl sm:mt-6">
        {moving ? (
          <div className="brand-wall-rows" aria-hidden="true">
            {rows.map((row, index) => {
              const copy = fillRow(row);
              return (
                <div
                  key={index}
                  className="brand-wall-row"
                  data-direction={index === 0 ? "start" : "end"}
                  style={{ "--brand-wall-duration": `${copy.length * SECONDS_PER_LOGO[index]}s` } as CSSProperties}
                >
                  {/* The row twice: moving the track by half its width loops without a jump. */}
                  <div className="brand-wall-track">
                    <MovingList logos={copy} />
                    <MovingList logos={copy} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* The real list (every business once): for screen readers and the keyboard; the visible wall
            when nothing moves (few businesses, or "reduce motion"). */}
        <ul className="brand-wall-still" data-static={moving ? undefined : ""}>
          {all.map((logo) => (
            <li key={`${logo.brand.kind}:${logo.brand.slug}`}>
              <Link href={logo.brand.href} className="brand-logo group scroll-mt-24 rounded-xl px-2 py-1.5">
                <LogoLockup logo={logo} labelled />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** A row's logos, repeated until the row is wider than any screen (the loop needs it). */
function fillRow(row: WallLogo[]): WallLogo[] {
  if (row.length === 0) return row;
  const times = Math.max(1, Math.ceil(MIN_LOGOS_PER_COPY / row.length));
  return Array.from({ length: times }, () => row).flat();
}

/** One copy of a moving row: logos for the eyes (the whole row is aria-hidden), each one still a link. */
function MovingList({ logos }: { logos: WallLogo[] }) {
  return (
    <ul className="brand-wall-list">
      {logos.map((logo, index) => (
        <li key={index} className="flex items-center">
          <Link href={logo.brand.href} tabIndex={-1} prefetch={false} className="brand-logo group">
            <LogoLockup logo={logo} />
          </Link>
          <KhatamStar />
        </li>
      ))}
    </ul>
  );
}

/**
 * The "logo" of a business: its official logo, or a lockup drawn from its name in one of four
 * styles (badge, tile, arch, seal), so the wall looks like a set of different brands.
 * `labelled`: in the real list, the official logo carries the business name as its text alternative.
 */
function LogoLockup({ logo, labelled = false }: { logo: WallLogo; labelled?: boolean }) {
  const { brand, tone, variant } = logo;
  const name = brandShortName(brand.name);

  if (brand.logoUrl) {
    return (
      <Image
        src={brand.logoUrl}
        alt={labelled ? brand.name : ""}
        width={160}
        height={48}
        className="h-9 w-auto max-w-36 object-contain sm:h-11 sm:max-w-40"
      />
    );
  }

  const initials = brandInitials(brand.name);
  return (
    <span className="flex items-center gap-2.5 sm:gap-3" title={brand.name}>
      <span
        aria-hidden="true"
        className={cn(
          "relative grid shrink-0 place-items-center overflow-hidden",
          "[font-family:var(--font-latin),ui-sans-serif,system-ui,sans-serif]",
          EMBLEM[variant],
          variant === "seal" ? SEAL_RING : tone.box,
        )}
      >
        {variant === "seal" ? null : <span className={cn("absolute inset-0 bg-center", tone.pattern)} />}
        <span className={cn("relative leading-none font-extrabold", initialsSize(initials))}>{initials}</span>
      </span>
      <span className="flex min-w-0 flex-col items-start">
        {/* Latin brand names keep their own direction and font on Arabic pages, like a real logo */}
        <span
          dir="ltr"
          className={cn(
            "whitespace-nowrap text-ink [font-family:var(--font-latin),ui-sans-serif,system-ui,sans-serif]",
            WORDMARK[variant],
          )}
        >
          {name}
        </span>
        {variant === "badge" || variant === "seal" ? (
          <span className="mt-0.5 text-[9px] leading-none font-semibold tracking-[0.22em] text-ink-subtle uppercase sm:text-[10px]">
            {brand.typeLabel}
          </span>
        ) : null}
      </span>
    </span>
  );
}

/** Emblem shape of each lockup style. */
const EMBLEM: Record<LogoVariant, string> = {
  badge: "size-9 rounded-full sm:size-11",
  tile: "size-9 rounded-[11px] sm:size-11 sm:rounded-[13px]",
  // a Tunisian door arch: round top, square-ish bottom
  arch: "h-10 w-8 rounded-t-full rounded-b-[6px] sm:h-12 sm:w-10",
  seal: "size-9 rounded-full sm:size-11",
};
/** The seal is drawn in outline (the other styles use the colour pair of the business). */
const SEAL_RING = "bg-white text-brand-700 ring-2 ring-inset ring-brand-600 outline-1 outline-offset-2 outline-brand-200";

/** Wordmark typography of each lockup style. */
const WORDMARK: Record<LogoVariant, string> = {
  badge: "text-[13px] font-extrabold tracking-[0.14em] uppercase sm:text-[15px]",
  tile: "text-base font-bold tracking-tight sm:text-xl",
  arch: "text-base font-semibold tracking-[-0.01em] sm:text-lg",
  seal: "text-xs font-semibold tracking-[0.26em] uppercase sm:text-sm",
};

/** Smaller letters when there are more of them ("G", "IH", "ATMC" all fit the emblem). */
function initialsSize(initials: string) {
  if (initials.length <= 1) return "text-base sm:text-xl";
  if (initials.length === 2) return "text-[13px] tracking-[0.04em] sm:text-base";
  if (initials.length === 3) return "text-[11px] tracking-tight sm:text-[13px]";
  return "text-[9px] tracking-tight sm:text-[11px]";
}

/** The 8-point star of Tunisian zellige (two squares), between two logos of a moving row. */
function KhatamStar() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="mx-6 size-3 shrink-0 text-saffron-300 sm:mx-10 sm:size-4">
      <rect x="3" y="3" width="10" height="10" fill="currentColor" />
      <rect x="3" y="3" width="10" height="10" fill="currentColor" transform="rotate(45 8 8)" />
    </svg>
  );
}

/**
 * Stops the motion for good (WCAG 2.2.2 "Pause, Stop, Hide": hover only pauses it for a moment, and
 * phones have no hover). No JavaScript: a checkbox drawn as a round pause / play button, read by
 * app/globals.css (.brand-band:has(.brand-marquee-pause :checked)). Hidden with "reduce motion".
 */
function PauseToggle({ label }: { label: string }) {
  return (
    <label className="brand-marquee-pause group/pause relative -me-1.5 -mb-3 grid size-11 shrink-0 cursor-pointer place-items-center sm:-my-3 motion-reduce:hidden">
      <input type="checkbox" className="sr-only scroll-mt-24" aria-label={label} />
      <span
        aria-hidden="true"
        className={cn(
          "grid size-8 place-items-center rounded-full bg-white text-ink-muted ring-1 ring-line transition-colors",
          "group-hover/pause:text-brand-700 group-hover/pause:ring-brand-200",
          "group-has-[:checked]/pause:bg-brand-50 group-has-[:checked]/pause:text-brand-700 group-has-[:checked]/pause:ring-brand-200",
          "group-has-[:focus-visible]/pause:outline-2 group-has-[:focus-visible]/pause:outline-offset-2 group-has-[:focus-visible]/pause:outline-brand-600",
        )}
      >
        {/* media controls keep their direction in Arabic (not mirrored) */}
        <Pause className="size-3.5 fill-current group-has-[:checked]/pause:hidden" />
        <Play className="hidden size-3.5 fill-current group-has-[:checked]/pause:block" />
      </span>
    </label>
  );
}
