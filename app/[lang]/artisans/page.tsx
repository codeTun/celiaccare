import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProducerCard } from "@/components/cards/producer-card";
import { DirectoryEmptyState } from "@/components/directory/directory-empty-state";
import { HeroHighlights } from "@/components/directory/hero-highlights";
import { JoinCta } from "@/components/directory/join-cta";
import { readParam, type SearchParamsRecord } from "@/components/directory/search-params";
import { DirectoryResultsSkeleton } from "@/components/directory/skeletons";
import { PageHero } from "@/components/page-hero";
import { ProducerFilters, type ProducerSearch } from "@/components/producers/producer-filters";
import { ProducerTypeChips } from "@/components/producers/producer-type-chips";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { isGovernorate } from "@/lib/tunisia";
import { getProducers } from "@/models/fetchers/producers";
import { isListedGuaranteeLevel, PRODUCER_TYPES, type Locale, type ProducerType } from "@/types";

/* /fr/artisans — directory of the small local businesses we work with (never big brands).
   Filters come from the URL: ?q=...&type=BAKERY&gouvernorat=Tunis&garantie=CERTIFIED */

export async function generateMetadata({ params }: PageProps<"/[lang]/artisans">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { producers } = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/artisans",
    title: producers.meta.title,
    description: producers.meta.description,
  });
}

export default async function ArtisansPage({ params, searchParams }: PageProps<"/[lang]/artisans">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { common, producers: dict } = getDictionary(lang);

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[{ label: common.nav.producers, href: "/artisans" }]}
        eyebrow={dict.hero.eyebrow}
        title={dict.hero.title}
        description={dict.hero.description}
      >
        <HeroHighlights items={dict.hero.highlights} />
      </PageHero>

      <Container className="pt-8 pb-4 sm:pt-10">
        {/* The filters live in the URL: read them inside <Suspense> (Cache Components rule). */}
        <Suspense fallback={<DirectoryResultsSkeleton variant="producer" cards={8} />}>
          <ArtisanResults lang={lang} searchParams={searchParams} />
        </Suspense>
      </Container>

      <JoinCta locale={lang} texts={dict.join} />
    </>
  );
}

/** Reads the filters from the URL; unknown values are ignored. */
function parseProducerSearch(params: SearchParamsRecord): ProducerSearch {
  const type = readParam(params, "type");
  const governorate = readParam(params, "gouvernorat");
  const guarantee = readParam(params, "garantie");
  return {
    q: readParam(params, "q"),
    type: (PRODUCER_TYPES as readonly string[]).includes(type) ? (type as ProducerType) : "",
    governorate: isGovernorate(governorate) ? governorate : "",
    // Policy "100 % sans gluten only": only the listed levels can be filtered
    guarantee: isListedGuaranteeLevel(guarantee) ? guarantee : "",
  };
}

async function ArtisanResults({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: PageProps<"/[lang]/artisans">["searchParams"];
}) {
  const search = parseProducerSearch(await searchParams);
  const producers = await getProducers(lang, {
    q: search.q || undefined,
    type: search.type || undefined,
    governorate: search.governorate || undefined,
    guarantee: search.guarantee || undefined,
  });
  const { common, producers: dict } = getDictionary(lang);
  const hasFilters = Boolean(search.q || search.type || search.governorate || search.guarantee);

  // EF-05: when a governorate gives nothing, tell whether it is covered at all.
  let emptyReason: "empty" | "noMatch" | "notCovered" = hasFilters ? "noMatch" : "empty";
  if (producers.length === 0 && search.governorate) {
    const inGovernorate = await getProducers(lang, { governorate: search.governorate });
    if (inGovernorate.length === 0) emptyReason = "notCovered";
  }

  return (
    <>
      <ProducerTypeChips
        locale={lang}
        current={search.type}
        otherFilters={{ q: search.q, gouvernorat: search.governorate, garantie: search.guarantee }}
        common={common}
        dict={dict}
      />

      <ProducerFilters
        // a new key resets the fields when the filters change (type chips, "Effacer les filtres")
        key={[search.q, search.type, search.governorate, search.guarantee].join("|")}
        locale={lang}
        values={search}
        common={common}
        dict={dict}
        className="mt-5"
      />

      {/* Outline h1 (page title) > h2 (results) > h3 (artisan cards), like the catalogue. */}
      <h2 className="sr-only">{dict.results.title}</h2>
      <p role="status" className="mt-8 text-sm font-semibold text-ink-muted">
        {interpolate(producers.length === 1 ? dict.results.countOne : dict.results.countOther, {
          count: producers.length,
        })}
      </p>

      {producers.length > 0 ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {producers.map((producer) => (
            <li key={producer.id} className="flex">
              <ProducerCard
                producer={producer}
                locale={lang}
                common={common}
                productsLabel={producer.productCount === 1 ? dict.results.productsOne : dict.results.productsOther}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-5">
          <DirectoryEmptyState
            reason={emptyReason}
            governorate={search.governorate}
            locale={lang}
            listPath="/artisans"
            texts={dict.results}
          />
        </div>
      )}
    </>
  );
}
