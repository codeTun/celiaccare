import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { lang as getLang } from "next/root-params";
import { Suspense } from "react";

import { ProductSheet } from "@/components/products/product-sheet";
import { ProductSheetSkeleton } from "@/components/products/product-sheet-skeleton";
import { defaultLocale, isLocale } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import { pageMetadata } from "@/lib/seo";
import { getDeliveryZones } from "@/models/fetchers/delivery";
import { getProductBySlug, getProductSlugs, getRelatedProducts } from "@/models/fetchers/products";

/* ==========================================================================
   /fr/produits/[slug] — product sheet (spec 5.3).
   Every product is pre-rendered at build time; the slug is read inside
   <Suspense> and unknown products answer "not found".
   ========================================================================== */

/** Product slugs are made of lowercase letters, digits and dashes: anything else is unknown (no database query). */
function isProductSlug(slug: string) {
  return slug.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  // Cache Components needs at least one value: "__none__" (answered with "not found") while the catalogue is empty.
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/produits/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const product = isProductSlug(slug) ? await getProductBySlug(lang, slug) : null;
  if (!product) notFound();

  return pageMetadata({
    locale: lang,
    path: `/produits/${product.slug}`,
    title: productTitle(product.name, getDictionary(lang).products.meta.detailTitle),
    description: shorten(product.description, 160),
    // 1200×630 crop of the Cloudinary photo for social networks
    image: product.imageUrl
      ? (cloudinaryUrl(product.imageUrl, { width: 1200, height: 630, crop: "fill" }) ?? product.imageUrl)
      : null,
  });
}

export default async function ProductPage({ params }: PageProps<"/[lang]/produits/[slug]">) {
  const lang = await getLang();
  const { common } = getDictionary(isLocale(lang) ? lang : defaultLocale);
  return (
    <Suspense fallback={<ProductSheetSkeleton label={common.actions.loading} />}>
      <ProductSheetLoader params={params} />
    </Suspense>
  );
}

/** Reads the slug (URL data, hence inside <Suspense>) and loads the product. */
async function ProductSheetLoader({ params }: Pick<PageProps<"/[lang]/produits/[slug]">, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const product = isProductSlug(slug) ? await getProductBySlug(lang, slug) : null;
  if (!product) notFound();

  const [related, zones] = await Promise.all([getRelatedProducts(lang, product, 4), getDeliveryZones()]);

  return <ProductSheet locale={lang} product={product} related={related} zones={zones} dict={getDictionary(lang)} />;
}

/**
 * Page title with the words people search for: "Makroudh" -> "Makroudh sans gluten" (fr) / "… بدون غلوتين" (ar).
 * A name that already says it ("Pain sans gluten", "خبز خالٍ من الغلوتين") stays as it is.
 */
function productTitle(name: string, template: string) {
  return /sans[\s-]*gluten|gluten[\s-]*free|غلوتين|جلوتين/i.test(name) ? name : interpolate(template, { name });
}

/** Cuts a text at a word boundary for the meta description: "Un pain moelleux…" */
function shorten(text: string, maxLength: number) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), maxLength / 2))}…`;
}
