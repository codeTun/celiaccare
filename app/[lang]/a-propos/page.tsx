import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { AboutClosing } from "@/components/sections/about/about-closing";
import { AboutLocal } from "@/components/sections/about/about-local";
import { AboutMission } from "@/components/sections/about/about-mission";
import { AboutNumbers } from "@/components/sections/about/about-numbers";
import { AboutPartners } from "@/components/sections/about/about-partners";
import { AboutProblem } from "@/components/sections/about/about-problem";
import { AboutStory } from "@/components/sections/about/about-story";
import { AboutTeam } from "@/components/sections/about/about-team";
import { VerificationTimeline } from "@/components/sections/about/verification-timeline";
import { GuaranteeLevels } from "@/components/sections/guarantee-levels";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { htmlLang, isLocale, localePath } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/utils";
import { getSiteStats } from "@/models/fetchers/stats";

/** Anchors of the "on this page" links (also the ids of the sections). `model` is linked from the FAQ. */
const SECTION_IDS = {
  story: "histoire",
  model: "modele",
  method: "methode",
  guarantees: "garanties",
  team: "equipe",
} as const;

export async function generateMetadata({ params }: PageProps<"/[lang]/a-propos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { about } = getDictionary(lang);
  return pageMetadata({ locale: lang, path: "/a-propos", title: about.meta.title, description: about.meta.description });
}

/** "Notre démarche" (spec §5.7): our story, mission, verification method, guarantees, team and partners. */
export default async function AboutPage({ params }: PageProps<"/[lang]/a-propos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const { common, home, about } = getDictionary(lang);
  const stats = await getSiteStats(); // cached fetcher: fine outside <Suspense>

  const jumpLinks = [
    { id: SECTION_IDS.story, label: about.hero.jump.story },
    { id: SECTION_IDS.method, label: about.hero.jump.method },
    { id: SECTION_IDS.guarantees, label: about.hero.jump.guarantees },
    { id: SECTION_IDS.team, label: about.hero.jump.team },
  ];

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[{ label: common.nav.about, href: "/a-propos" }]}
        eyebrow={about.hero.eyebrow}
        title={about.hero.title}
        description={about.hero.text}
      >
        <nav aria-labelledby="about-jump-links">
          <p id="about-jump-links" className="text-xs font-semibold text-ink-subtle">
            {about.hero.jumpLabel}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {jumpLinks.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  className="inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-ink-muted shadow-xs ring-1 ring-line transition-colors hover:text-brand-800 hover:ring-brand-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHero>

      <AboutProblem about={about} />
      <AboutStory about={about} id={SECTION_IDS.story} />
      <AboutMission about={about} modelId={SECTION_IDS.model} />
      <VerificationTimeline about={about} id={SECTION_IDS.method} />

      <section id={SECTION_IDS.guarantees} className="scroll-mt-24 py-16 sm:py-24">
        <Container>
          <SectionHeading
            align="center"
            eyebrow={about.guarantees.eyebrow}
            title={about.guarantees.title}
            description={about.guarantees.description}
          />
          <GuaranteeLevels
            className="mt-10 sm:mt-12"
            common={common}
            texts={home.guarantees}
            learnMoreHref={localePath(lang, "/guide-sans-gluten")}
          />
        </Container>
      </section>

      <AboutLocal lang={lang} about={about} />
      <AboutNumbers lang={lang} about={about} home={home} stats={stats} />
      <AboutTeam about={about} id={SECTION_IDS.team} />
      <AboutPartners lang={lang} about={about} />
      <AboutClosing lang={lang} about={about} />

      {/* "AboutPage" structured data (the breadcrumb data comes with <PageHero>) */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: about.meta.title,
          description: about.meta.description,
          url: absoluteUrl(localePath(lang, "/a-propos")),
          inLanguage: htmlLang[lang],
          isPartOf: { "@type": "WebSite", name: siteConfig.name, url: absoluteUrl(localePath(lang)) },
          about: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
        }}
      />
    </>
  );
}
