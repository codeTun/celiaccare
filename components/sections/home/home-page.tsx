import type { Metadata } from "next";
import type { JSX } from "react";

import { Alert } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import type {
  BrandDTO,
  CategoryDTO,
  Locale,
  ProducerCardDTO,
  ProductCardDTO,
  RestaurantCardDTO,
  SiteStatsDTO,
} from "@/types";

import { ApproachTeaser } from "./approach-teaser";
import { BrandMarquee } from "./brand-marquee";
import { CategoriesSection } from "./categories-section";
import { FeaturedProducts } from "./featured-products";
import { GuaranteesSection } from "./guarantees-section";
import { HomeHero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { JoinBand } from "./join-band";
import { PartnerRestaurants } from "./partner-restaurants";
import { ProducersSpotlight } from "./producers-spotlight";

type HomePageProps = {
  lang: Locale;
  stats: SiteStatsDTO;
  categories: CategoryDTO[];
  featuredProducts: ProductCardDTO[];
  partnerRestaurants: RestaurantCardDTO[];
  producers: ProducerCardDTO[];
  /** Every active artisan and restaurant, for the brand band above the footer. */
  brands: BrandDTO[];
};

/**
 * The whole home page (Server Component). app/[lang]/page.tsx reads the data with the
 * cached fetchers (models/) and passes it here as props; this component only renders.
 * With an empty database, empty sections hide themselves or show a friendly message.
 */
export function HomePage({
  lang,
  stats,
  categories,
  featuredProducts,
  partnerRestaurants,
  producers,
  brands,
}: HomePageProps): JSX.Element {
  const { common, home } = getDictionary(lang);

  return (
    <>
      {/* 1. Hero: <h1>, search, main actions, promises, key figures */}
      <HomeHero lang={lang} common={common} home={home} stats={stats} />

      {/* 2-3. Catalogue: categories, then featured products */}
      <div className="space-y-16 py-16 sm:space-y-20 sm:py-24">
        <CategoriesSection lang={lang} home={home} categories={categories} />
        <FeaturedProducts lang={lang} common={common} home={home} products={featuredProducts} />
      </div>

      {/* 4. How it works */}
      <HowItWorks lang={lang} home={home} />

      {/* 5. The guarantee levels (policy "100 % sans gluten only") */}
      <GuaranteesSection lang={lang} common={common} home={home} />

      {/* 6. Partner restaurants */}
      <PartnerRestaurants lang={lang} common={common} home={home} restaurants={partnerRestaurants} />

      {/* 7. Small producers */}
      <ProducersSpotlight lang={lang} common={common} home={home} producers={producers} />

      {/* 8. "Notre démarche" teaser */}
      <ApproachTeaser lang={lang} home={home} />

      {/* 9. Become a partner / suggest an address */}
      <JoinBand lang={lang} home={home} />

      {/* 10. Medical disclaimer (spec §6.5), kept discreet */}
      <Container className="pb-16 sm:pb-20">
        <Alert
          tone="info"
          title={common.disclaimer.title}
          className="mx-auto max-w-3xl border-line bg-canvas text-ink-muted [&>svg]:text-brand-700"
        >
          {common.disclaimer.text}
        </Alert>
      </Container>

      {/* 11. The businesses we list, as a calm scrolling band of logos, right above the footer */}
      <BrandMarquee lang={lang} home={home} brands={brands} />
    </>
  );
}

/**
 * Metadata of the home page, for app/[lang]/page.tsx:
 *   export async function generateMetadata({ params }) { ...; return homeMetadata(lang); }
 * The title is complete on its own (no " · CeliacCare" suffix from the layout template).
 */
export function homeMetadata(lang: Locale): Metadata {
  const { home } = getDictionary(lang);
  const metadata = pageMetadata({ locale: lang, path: "/", title: home.meta.title, description: home.meta.description });
  return { ...metadata, title: { absolute: home.meta.title } };
}
