import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomePage, homeMetadata } from "@/components/sections/home/home-page";
import { isLocale } from "@/i18n/config";
import { getBrandShowcase } from "@/models/fetchers/brands";
import { getCategories } from "@/models/fetchers/categories";
import { getProducers } from "@/models/fetchers/producers";
import { getFeaturedProducts } from "@/models/fetchers/products";
import { getPartnerRestaurants } from "@/models/fetchers/restaurants";
import { getSiteStats } from "@/models/fetchers/stats";

/**
 * Home page: /fr and /ar. The page reads the data through the models and passes it
 * as props to the sections in components/sections/home/. Every fetcher is cached
 * ('use cache'), so the page is prerendered and needs no <Suspense>.
 */
export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return homeMetadata(lang);
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const [stats, categories, featuredProducts, partnerRestaurants, producers, brands] = await Promise.all([
    getSiteStats(),
    getCategories(lang),
    getFeaturedProducts(lang, 8),
    getPartnerRestaurants(lang, 3),
    getProducers(lang),
    getBrandShowcase(lang),
  ]);

  return (
    <HomePage
      lang={lang}
      stats={stats}
      categories={categories}
      featuredProducts={featuredProducts}
      partnerRestaurants={partnerRestaurants}
      producers={producers}
      brands={brands}
    />
  );
}
