import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { RestaurantCard } from "@/components/cards/restaurant-card";
import { DirectoryEmptyState } from "@/components/directory/directory-empty-state";
import { HeroHighlights } from "@/components/directory/hero-highlights";
import { JoinCta } from "@/components/directory/join-cta";
import { readParam, type SearchParamsRecord } from "@/components/directory/search-params";
import { DirectoryResultsSkeleton } from "@/components/directory/skeletons";
import { PageHero } from "@/components/page-hero";
import { PartnerSteps } from "@/components/restaurants/partner-steps";
import { RestaurantFilters, type RestaurantSearch } from "@/components/restaurants/restaurant-filters";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { isGovernorate } from "@/lib/tunisia";
import { getRestaurants } from "@/models/fetchers/restaurants";
import { GUARANTEE_LEVELS, type GuaranteeLevel, type Locale } from "@/types";

/* /fr/restaurants — directory of gluten-free restaurants, partner restaurants
   (online ordering) first. Filters come from the URL:
   ?q=...&gouvernorat=Sousse&garantie=CERTIFIED&partenaires=1 */

export async function generateMetadata({ params }: PageProps<"/[lang]/restaurants">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { restaurants } = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/restaurants",
    title: restaurants.meta.title,
    description: restaurants.meta.description,
  });
}

export default async function RestaurantsPage({ params, searchParams }: PageProps<"/[lang]/restaurants">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { common, restaurants: dict } = getDictionary(lang);

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[{ label: common.nav.restaurants, href: "/restaurants" }]}
        eyebrow={dict.hero.eyebrow}
        title={dict.hero.title}
        description={dict.hero.description}
      >
        <HeroHighlights items={dict.hero.highlights} />
      </PageHero>

      <Container className="pt-8 pb-4 sm:pt-10">
        {/* The filters live in the URL: read them inside <Suspense> (Cache Components rule). */}
        <Suspense fallback={<DirectoryResultsSkeleton variant="restaurant" />}>
          <RestaurantResults lang={lang} searchParams={searchParams} />
        </Suspense>
      </Container>

      <div className="mt-12 sm:mt-16">
        <PartnerSteps locale={lang} dict={dict} />
      </div>
      <JoinCta locale={lang} texts={dict.join} />
    </>
  );
}

/** Reads the filters from the URL; unknown values are ignored. */
function parseRestaurantSearch(params: SearchParamsRecord): RestaurantSearch {
  const governorate = readParam(params, "gouvernorat");
  const guarantee = readParam(params, "garantie");
  return {
    q: readParam(params, "q"),
    governorate: isGovernorate(governorate) ? governorate : "",
    guarantee: (GUARANTEE_LEVELS as readonly string[]).includes(guarantee) ? (guarantee as GuaranteeLevel) : "",
    partnerOnly: readParam(params, "partenaires") === "1",
  };
}

async function RestaurantResults({
  lang,
  searchParams,
}: {
  lang: Locale;
  searchParams: PageProps<"/[lang]/restaurants">["searchParams"];
}) {
  const search = parseRestaurantSearch(await searchParams);
  const restaurants = await getRestaurants(lang, {
    q: search.q || undefined,
    governorate: search.governorate || undefined,
    guarantee: search.guarantee || undefined,
    partnerOnly: search.partnerOnly,
  });
  const { common, restaurants: dict } = getDictionary(lang);
  const hasFilters = Boolean(search.q || search.governorate || search.guarantee || search.partnerOnly);

  // EF-05: when a governorate gives nothing, tell whether it is covered at all.
  let emptyReason: "empty" | "noMatch" | "notCovered" = hasFilters ? "noMatch" : "empty";
  if (restaurants.length === 0 && search.governorate) {
    const inGovernorate = await getRestaurants(lang, { governorate: search.governorate });
    if (inGovernorate.length === 0) emptyReason = "notCovered";
  }

  // Two groups with a title when the list mixes partners and other restaurants.
  const partners = restaurants.filter((restaurant) => restaurant.isPartner);
  const others = restaurants.filter((restaurant) => !restaurant.isPartner);
  const showTitles = partners.length > 0 && others.length > 0;
  const groups = [
    {
      key: "partners",
      items: partners,
      title: showTitles ? dict.results.partnersTitle : null,
      text: dict.results.partnersText,
    },
    {
      key: "others",
      items: others,
      title: showTitles ? dict.results.othersTitle : null,
      text: dict.results.othersText,
    },
  ];

  return (
    <>
      <RestaurantFilters
        // a new key resets the fields when the filters change (e.g. "Effacer les filtres")
        key={[search.q, search.governorate, search.guarantee, search.partnerOnly].join("|")}
        locale={lang}
        values={search}
        common={common}
        dict={dict}
      />

      <p role="status" className="mt-8 text-sm font-semibold text-ink-muted">
        {interpolate(restaurants.length === 1 ? dict.results.countOne : dict.results.countOther, {
          count: restaurants.length,
        })}
      </p>

      {restaurants.length > 0 ? (
        // Partner restaurants (online ordering) and the other verified addresses, in two groups
        <div className="mt-5 space-y-12">
          {groups.map((group) =>
            group.items.length > 0 ? (
              <section key={group.key} aria-labelledby={group.title ? `group-${group.key}` : undefined}>
                {group.title ? (
                  <div className="mb-5">
                    <h2 id={`group-${group.key}`} className="text-xl font-extrabold text-ink sm:text-2xl">
                      {group.title}
                    </h2>
                    <p className="mt-1 text-sm text-ink-muted">{group.text}</p>
                  </div>
                ) : null}
                <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                  {group.items.map((restaurant) => (
                    <li key={restaurant.id} className="flex">
                      <RestaurantCard restaurant={restaurant} locale={lang} common={common} className="w-full" />
                    </li>
                  ))}
                </ul>
              </section>
            ) : null,
          )}
        </div>
      ) : (
        <div className="mt-5">
          <DirectoryEmptyState
            reason={emptyReason}
            governorate={search.governorate}
            locale={lang}
            listPath="/restaurants"
            texts={dict.results}
          />
        </div>
      )}
    </>
  );
}
