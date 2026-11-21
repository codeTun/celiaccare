import { ArrowRight, Pause, Play, WheatOff } from "lucide-react";
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
import { brandInitials, brandShortName, monogramTones, type MonogramTone } from "./brand-monogram";

/** Below this number of businesses the row stays still (centered, wrapping): too few for a loop. */
const MIN_BRANDS_TO_SCROLL = 5;
/** Speed of the loop: seconds per tile (the whole list passes in count × this). */
const SECONDS_PER_BRAND = 3.75;

/**
 * Brand band at the very bottom of the home page, right above the footer: every active artisan,
 * manufacturer and restaurant as a "logo" tile (its official logo when the admin uploaded one with
 * its agreement, otherwise a monogram drawn in the colours of the site), in one row that scrolls
 * slowly. Server Component, NO client JavaScript: the loop is a CSS animation (app/globals.css,
 * .brand-marquee), paused under the mouse, while a tile has the focus, and for good with the pause
 * button (a checkbox read by CSS); with "reduce motion" the row becomes a still, horizontally
 * scrollable list.
 */
export function BrandMarquee({ lang, home, brands }: { lang: Locale; home: HomeDict; brands: BrandDTO[] }) {
  if (brands.length === 0) return null;

  // "Nos partenaires" only once the agreements are signed (lib/site-config.ts); until then the
  // honest title and subtitle of real businesses that are not partners yet.
  const texts = siteConfig.partnersSigned ? home.brands.partners : home.brands.demo;
  const scrolling = brands.length >= MIN_BRANDS_TO_SCROLL;
  // Computed once for the row (two neighbours never share a colour), used by both copies of the loop.
  const tones = monogramTones(brands);

  return (
    <section aria-labelledby="home-brands-title" className="brand-band border-t border-line bg-canvas pb-3 sm:pb-6">
      <Container className="flex flex-col gap-1 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8 sm:pt-9">
        <div className="min-w-0">
          <h2 id="home-brands-title" className="flex items-center gap-2 text-base font-extrabold text-ink sm:text-lg">
            <JasmineFlower className="size-[18px]" petalClassName="fill-brand-600" />
            {texts.title}
          </h2>
          <p className="mt-0.5 text-sm leading-snug text-ink-muted sm:leading-relaxed">{texts.subtitle}</p>
        </div>
        <div className="flex shrink-0 items-center justify-between gap-2">
          {/* py-3: a 44 px touch target, whose room is taken back by negative margins (not above it on
              phones: the subtitle sits right on top, its last line would get the focus ring) */}
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
          {scrolling ? <PauseToggle label={home.brands.pause} /> : null}
        </div>
      </Container>

      {scrolling ? (
        <div
          className="brand-marquee mx-auto mt-3 max-w-7xl py-2 sm:mt-5 sm:py-3"
          style={{ "--brand-marquee-duration": `${brands.length * SECONDS_PER_BRAND}s` } as CSSProperties}
        >
          {/* The list twice: moving the track by half its width loops without a jump. */}
          <div className="brand-marquee-track">
            <BrandList brands={brands} tones={tones} />
            <BrandList brands={brands} tones={tones} copy />
          </div>
        </div>
      ) : (
        <Container className="mt-3 py-2 sm:mt-5 sm:py-3">
          <BrandList brands={brands} tones={tones} still />
        </Container>
      )}
    </section>
  );
}

/**
 * Stops the loop for good (WCAG 2.2.2 "Pause, Stop, Hide": hover and focus only pause it for a
 * moment, and phones have no hover). No JavaScript: a checkbox drawn as a round pause / play button,
 * read by app/globals.css (.brand-band:has(.brand-marquee-pause :checked)). Hidden with "reduce
 * motion", where the row never moves. 44 px touch target around a 32 px circle; the negative margins
 * match the link next to it, so both stay on the subtitle's line.
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

/**
 * One list of tiles. `copy`: the second list of the loop, only there for the eyes: hidden from
 * screen readers (aria-hidden) and out of the Tab order (tabIndex -1), but still clickable, since
 * it fills half of the visible row (`inert` would make those tiles dead to the mouse and to touch).
 * `still`: centered and wrapping, no loop. The lists of the loop are laid out by app/globals.css
 * (.brand-marquee-list), which also hides the copy when the row stops (reduce motion, keyboard).
 */
function BrandList({
  brands,
  tones,
  copy = false,
  still = false,
}: {
  brands: BrandDTO[];
  tones: MonogramTone[];
  copy?: boolean;
  still?: boolean;
}) {
  return (
    <ul className={still ? "flex flex-wrap justify-center gap-3" : "brand-marquee-list"} aria-hidden={copy || undefined}>
      {brands.map((brand, index) => (
        <li key={`${brand.kind}:${brand.slug}`}>
          <BrandTile brand={brand} tone={tones[index]} copy={copy} />
        </li>
      ))}
    </ul>
  );
}

/**
 * The "logo" of a business: its mark, its name and "Fabricant · Mohamedia". The whole tile links to its page.
 * A name made of generic words before an acronym is written short ("ATMC – Djerba"), the full name stays in
 * the tooltip. Screen readers hear "ATMC – Djerba, Boulangerie-pâtisserie, Houmt Souk (Djerba)".
 */
function BrandTile({ brand, tone, copy }: { brand: BrandDTO; tone: MonogramTone; copy: boolean }) {
  return (
    <Link
      href={brand.href}
      tabIndex={copy ? -1 : undefined}
      prefetch={copy ? false : undefined}
      className={cn(
        // relative: the tile holds its screen-reader commas (sr-only = position absolute), so the scroll
        // container clips them; otherwise, in the still "reduce motion" row, they would widen the page
        "group relative flex h-14 w-max max-w-[18rem] min-w-[13rem] items-center gap-3 rounded-2xl bg-white ps-2 pe-5 ring-1 ring-line",
        "transition-shadow duration-300 hover:shadow-soft hover:ring-brand-200 focus-visible:ring-brand-200",
        // focused from the keyboard while the list is wrapped: never hidden under the sticky header
        "scroll-mt-24",
        "sm:h-[68px] sm:max-w-[19.5rem] sm:ps-3",
      )}
    >
      <BrandMark brand={brand} tone={tone} />
      {/* Flex column aligned at its start (not text-align): in Arabic a short Latin name sits right next to
          the mark, like the line below it */}
      <span className="flex min-w-0 flex-col items-start">
        {/* dir="auto": a Latin name keeps its own direction on Arabic pages (truncated at its end) */}
        <span
          dir="auto"
          title={brand.name}
          className="max-w-full truncate font-display text-[15px] leading-snug font-semibold text-ink"
        >
          {brandShortName(brand.name)}
          <span className="sr-only">, </span>
        </span>
        {/* "Fabricant · Mohamedia": when it is too long, the city is cut at its own end, also on Arabic pages */}
        <span className="mt-0.5 flex max-w-full min-w-0 gap-1 text-xs text-ink-subtle">
          <span className="max-w-36 shrink-0 truncate">
            {brand.typeLabel}
            <span className="sr-only">, </span>
          </span>
          <span aria-hidden="true">·</span>
          <span dir="auto" title={brand.city} className="min-w-0 truncate">
            {brand.city}
          </span>
        </span>
      </span>
    </Link>
  );
}

/**
 * The official logo (grey at rest, in colour on hover / focus), or a monogram: 1–2 initials
 * or the acronym, in a colour pair of the site (`tone`, see monogramTones), on a faint zellige
 * star, with a tiny wheat-off sign. Decorative: the name is written right next to it.
 */
function BrandMark({ brand, tone }: { brand: BrandDTO; tone: MonogramTone }) {
  if (brand.logoUrl) {
    return (
      <span className="grid size-10 shrink-0 place-items-center sm:size-11">
        <Image
          src={brand.logoUrl}
          alt=""
          width={44}
          height={44}
          className="size-full object-contain opacity-75 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-focus-visible:opacity-100 group-focus-visible:grayscale-0"
        />
      </span>
    );
  }

  const initials = brandInitials(brand.name);
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl sm:size-11",
        // Latin letters: the same drawing on French and Arabic pages, like a real logo
        "[font-family:var(--font-latin),ui-sans-serif,system-ui,sans-serif]",
        tone.box,
      )}
    >
      <span className={cn("absolute inset-0 bg-center", tone.pattern)} />
      {initials ? (
        <>
          <span className={cn("relative leading-none font-extrabold", initialsSize(initials))}>{initials}</span>
          {/* 9 px: crisp on 2× screens, a smudge on 1× screens, where it is left out */}
          <WheatOff
            className={cn("absolute end-1 top-1 size-[9px] [@media(resolution<2dppx)]:hidden", tone.mark)}
            strokeWidth={2.5}
          />
        </>
      ) : (
        <WheatOff className="relative size-5" strokeWidth={2} />
      )}
    </span>
  );
}

/** Smaller letters when there are more of them ("G", "IH", "ATMC" all fit the 44 px square). */
function initialsSize(initials: string) {
  if (initials.length === 1) return "text-xl";
  // a little air between two letters: "TT" must not merge into one "Π"
  if (initials.length === 2) return "text-base tracking-[0.04em]";
  if (initials.length === 3) return "text-[13px] tracking-tight";
  return "text-[11px] tracking-tight";
}
