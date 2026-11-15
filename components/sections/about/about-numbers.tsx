import { Container } from "@/components/ui/container";
import type { AboutDict } from "@/i18n/resources/fr/about";
import type { HomeDict } from "@/i18n/resources/fr/home";
import type { Locale, SiteStatsDTO } from "@/types";

import { hasSiteStats, SiteStats } from "../site-stats";

/** "CeliacCare aujourd'hui": live key figures on a dark green band. Hidden while the catalogue is empty. */
export function AboutNumbers({
  lang,
  about,
  home,
  stats,
}: {
  lang: Locale;
  about: AboutDict;
  home: HomeDict;
  stats: SiteStatsDTO;
}) {
  if (!hasSiteStats(stats)) return null;

  return (
    <section className="relative isolate overflow-hidden bg-brand-900 py-14 text-white sm:py-20">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-khatam-light" />
      <div aria-hidden="true" className="absolute -start-32 -top-40 -z-10 size-96 rounded-full bg-brand-600/40 blur-3xl" />
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
        <div className="shrink-0">
          <p className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-brand-200 uppercase rtl:tracking-normal">
            <span className="h-px w-6 bg-brand-300" aria-hidden="true" />
            {about.numbers.eyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">{about.numbers.title}</h2>
        </div>
        <SiteStats stats={stats} labels={home.stats} locale={lang} tone="dark" className="lg:max-w-4xl lg:flex-1" />
      </Container>
    </section>
  );
}
