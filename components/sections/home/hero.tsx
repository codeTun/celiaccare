import {
  ArrowRight,
  BadgeCheck,
  CakeSlice,
  ChefHat,
  CookingPot,
  Croissant,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { SearchForm } from "@/components/search-form";
import { buttonStyles } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { HomeDict } from "@/i18n/resources/fr/home";
import { cn } from "@/lib/utils";
import type { Locale, SiteStatsDTO } from "@/types";

import { JasmineFlower, TunisianDoor } from "../decor";
import { hasSiteStats, SiteStats } from "../site-stats";

/**
 * Top of the home page: the page's <h1>, the product search box, the two main actions,
 * our 3 promises, a Tunisian doorway illustration (large screens) and the live key figures.
 */
export function HomeHero({
  lang,
  common,
  home,
  stats,
}: {
  lang: Locale;
  common: CommonDict;
  home: HomeDict;
  stats: SiteStatsDTO;
}) {
  const productsHref = localePath(lang, "/produits");
  const promises: { icon: LucideIcon; label: string }[] = [
    { icon: BadgeCheck, label: home.hero.trust.verified },
    { icon: Store, label: home.hero.trust.local },
    { icon: Truck, label: home.hero.trust.delivery },
  ];

  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-canvas">
      {/* zellige pattern fading towards the bottom, and two soft lights */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-khatam [mask-image:linear-gradient(to_bottom,#000_25%,transparent_100%)]"
      />
      <div aria-hidden="true" className="absolute -start-40 -top-56 -z-10 size-[38rem] rounded-full bg-brand-100/70 blur-3xl" />
      <div aria-hidden="true" className="absolute -end-32 -bottom-48 -z-10 size-[30rem] rounded-full bg-saffron-100/50 blur-3xl" />
      {/* on phones, a large jasmine watermark */}
      <JasmineFlower
        className="pointer-events-none absolute -end-16 top-2 -z-10 size-72 opacity-[0.045] lg:hidden"
        petalClassName="fill-brand-700"
        heartClassName="fill-brand-700"
      />

      <Container className="grid items-center gap-12 pt-10 pb-10 sm:pt-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:pt-16 lg:pb-14 xl:gap-16">
        <div>
          <p className="inline-flex items-center gap-2.5 rounded-full bg-white/90 py-1.5 ps-1.5 pe-4 text-xs font-semibold text-brand-800 shadow-soft ring-1 ring-brand-100 sm:text-sm">
            <span className="grid size-7 place-items-center rounded-full bg-brand-600" aria-hidden="true">
              <JasmineFlower className="size-5" />
            </span>
            {home.hero.welcome}
          </p>

          <h1 className="mt-6 text-[2rem] leading-[1.1] font-extrabold text-ink min-[360px]:text-4xl sm:text-5xl xl:text-[3.5rem]">
            {home.hero.titleStart}{" "}
            {/* the highlighted words stay together, on their own line */}
            <span className="block whitespace-nowrap text-brand-600 underline decoration-saffron-400/80 decoration-[0.09em] underline-offset-[0.22em]">
              {home.hero.titleHighlight}
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">{home.hero.text}</p>

          <SearchForm
            lang={lang}
            label={home.hero.searchLabel}
            placeholder={home.hero.searchPlaceholder}
            submitLabel={common.actions.search}
            size="lg"
            className="mt-8 max-w-xl"
          />

          {/* frequent searches: plain links to the catalogue */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-subtle">
            <span>{home.hero.popularLabel}</span>
            {home.hero.popular.map((term) => (
              <Link
                key={term}
                href={`${productsHref}?q=${encodeURIComponent(term)}`}
                className="inline-flex h-10 items-center rounded-full bg-white px-3.5 font-medium text-ink-muted ring-1 ring-line transition-colors hover:text-brand-800 hover:ring-brand-300 sm:h-8 sm:px-3"
              >
                {term}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={productsHref} className={buttonStyles({ size: "lg" })}>
              {home.hero.ctaProducts}
              <ArrowRight className="rtl:rotate-180" aria-hidden="true" />
            </Link>
            <Link href={localePath(lang, "/restaurants")} className={buttonStyles({ variant: "outline", size: "lg" })}>
              <ChefHat aria-hidden="true" />
              {home.hero.ctaRestaurants}
            </Link>
          </div>

          <ul aria-label={home.hero.trustLabel} className="mt-8 flex flex-col gap-2.5">
            {promises.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700" aria-hidden="true">
                  <Icon className="size-4" />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>

        <HeroIllustration home={home} />
      </Container>

      {hasSiteStats(stats) ? (
        <Container className="pb-10 sm:pb-14">
          <h2 className="sr-only">{home.stats.label}</h2>
          <SiteStats stats={stats} labels={home.stats} locale={lang} />
        </Container>
      ) : null}
    </section>
  );
}

/**
 * Decorative composition (large screens only): a Sidi Bou Saïd doorway with its jasmine,
 * two small arches showing product categories, and two floating "promise" cards.
 */
function HeroIllustration({ home }: { home: HomeDict }) {
  return (
    <div aria-hidden="true" className="relative mx-auto hidden w-full max-w-[30rem] lg:block">
      <div className="relative aspect-[20/19]">
        <div className="absolute inset-[14%] rounded-full bg-brand-300/40 blur-3xl" />

        {/* the doorway */}
        <div className="absolute start-[17%] top-0 aspect-[3/4] w-[66%] drop-shadow-[0_28px_36px_rgb(9_69_45_/_0.28)]">
          <TunisianDoor idPrefix="hero-door" />
        </div>

        {/* small arches with category icons */}
        <ArchTile icon={Croissant} className="start-0 top-[24%]" />
        <ArchTile icon={CakeSlice} className="end-0 top-[47%]" />
        <ArchTile icon={CookingPot} className="end-[8%] top-[13%] w-[15%]" />

        {/* floating cards */}
        <FloatingCard
          icon={BadgeCheck}
          iconClassName="bg-brand-600 text-white"
          title={home.hero.visual.verifiedTitle}
          text={home.hero.visual.verifiedText}
          className="end-[-4%] top-[78%]"
        />
        <FloatingCard
          icon={Truck}
          iconClassName="bg-saffron-50 text-saffron-700 ring-1 ring-saffron-100"
          title={home.hero.visual.deliveryTitle}
          text={home.hero.visual.deliveryText}
          className="start-[-2%] top-[64%]"
        />
      </div>
    </div>
  );
}

/** A small white doorway with a category icon on a zellige background. */
function ArchTile({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div className={cn("arch absolute aspect-[3/4] w-[22%] bg-white p-1.5 shadow-lift ring-1 ring-line", className)}>
      <div className="arch relative grid size-full place-items-center overflow-hidden bg-brand-50">
        <div className="absolute inset-0 bg-khatam" />
        <Icon className="relative size-[42%] text-brand-700" strokeWidth={1.6} />
      </div>
    </div>
  );
}

function FloatingCard({
  icon: Icon,
  iconClassName,
  title,
  text,
  className,
}: {
  icon: LucideIcon;
  iconClassName: string;
  title: string;
  text: string;
  className?: string;
}) {
  return (
    <div className={cn("absolute flex items-center gap-3 rounded-2xl bg-white/95 py-3 ps-3 pe-4 shadow-lift ring-1 ring-line backdrop-blur", className)}>
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", iconClassName)}>
        <Icon className="size-5" />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-bold whitespace-nowrap text-ink">{title}</span>
        <span className="text-xs whitespace-nowrap text-ink-subtle">{text}</span>
      </span>
    </div>
  );
}
