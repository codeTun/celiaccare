import "server-only";

import { cachePolicy } from "@/lib/cache";
import { TAGS } from "@/lib/cache-tags";
import { governorateLabel } from "@/lib/tunisia";
import { localize, needsReview } from "@/lib/utils";
import {
  isOneOf,
  isPublicProduct,
  matchesAllWords,
  publicProducers,
  publicProducts,
  searchWords,
  selectProductCards,
  toProductCardDTO,
} from "@/models/fetchers/mappers";
import {
  GUARANTEE_LEVELS,
  PRODUCER_TYPES,
  type Locale,
  type ProducerCardDTO,
  type ProducerDetailDTO,
  type ProducerFilters,
} from "@/types";

/**
 * The small businesses directory ("Artisans"), in alphabetical order.
 * - q: every word must appear in the name, city, governorate (French or Arabic) or description
 *   (accents and case ignored, so "beja" finds "Béja");
 * - type, governorate, guarantee: exact filters.
 */
export async function getProducers(locale: Locale, filters: ProducerFilters = {}): Promise<ProducerCardDTO[]> {
  "use cache";
  cachePolicy([TAGS.producers, TAGS.products]);

  let query = publicProducers();
  const { type, governorate, guarantee } = filters;
  if (isOneOf(PRODUCER_TYPES, type)) query = query.where({ type });
  if (governorate) query = query.where({ governorate });
  if (isOneOf(GUARANTEE_LEVELS, guarantee)) query = query.where({ guaranteeLevel: guarantee });

  const rows = await query
    .select("id", "slug", "name", "type", "description", "descriptionAr", "city", "governorate", "imageUrl", "guaranteeLevel")
    .include("products", (products) => products.where(isPublicProduct).count())
    .orderBy([(producer) => producer.name.asc(), (producer) => producer.id.asc()])
    .all();

  // The directory is small: the text search runs here, with accents ignored (not possible with SQL LIKE).
  const words = searchWords(filters.q);
  return rows
    .filter((row) =>
      matchesAllWords(
        [row.name, row.city, row.governorate, governorateLabel(row.governorate, "ar"), row.description, row.descriptionAr],
        words,
      ),
    )
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      type: row.type,
      description: localize(locale, row.description, row.descriptionAr),
      city: row.city,
      governorate: row.governorate,
      imageUrl: row.imageUrl,
      guaranteeLevel: row.guaranteeLevel,
      productCount: row.products,
    }));
}

/**
 * A producer page: contact details, preparation practices, verification (source + date)
 * and its public products (available ones first, then alphabetical). Null when unknown or hidden.
 */
export async function getProducerBySlug(locale: Locale, slug: string): Promise<ProducerDetailDTO | null> {
  "use cache";
  cachePolicy([TAGS.producers, TAGS.producer(slug), TAGS.products, TAGS.categories, TAGS.reviews]);

  const row = await publicProducers()
    .where((producer) => producer.slug.eq(slug))
    .select(
      "id",
      "slug",
      "name",
      "type",
      "description",
      "descriptionAr",
      "city",
      "governorate",
      "address",
      "latitude",
      "longitude",
      "phone",
      "whatsapp",
      "email",
      "website",
      "instagram",
      "facebook",
      "openingHours",
      "guaranteeLevel",
      "dedicatedSpace",
      "dedicatedUtensils",
      "trainedStaff",
      "verificationSource",
      "verifiedAt",
      "imageUrl",
    )
    .first();
  if (!row) return null;

  const productRows = await selectProductCards(publicProducts().where({ producerId: row.id }))
    .orderBy([(p) => p.name.asc(), (p) => p.id.asc()])
    .all();
  const products = productRows.map((product) => toProductCardDTO(product, locale));
  // Available products first; the alphabetical order is kept inside each group (stable sort).
  products.sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    description: localize(locale, row.description, row.descriptionAr),
    city: row.city,
    governorate: row.governorate,
    imageUrl: row.imageUrl,
    guaranteeLevel: row.guaranteeLevel,
    productCount: products.length,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone,
    whatsapp: row.whatsapp,
    email: row.email,
    website: row.website,
    instagram: row.instagram,
    facebook: row.facebook,
    openingHours: row.openingHours,
    dedicatedSpace: row.dedicatedSpace,
    dedicatedUtensils: row.dedicatedUtensils,
    trainedStaff: row.trainedStaff,
    verificationSource: row.verificationSource,
    verifiedAt: row.verifiedAt.toISOString(),
    needsReview: needsReview(row.verifiedAt),
    products,
  };
}

/** Slugs of every public producer (generateStaticParams of the producer page). */
export async function getProducerSlugs(): Promise<string[]> {
  "use cache";
  cachePolicy([TAGS.producers]);

  const rows = await publicProducers()
    .select("slug")
    .orderBy((producer) => producer.slug.asc())
    .all();
  return rows.map((row) => row.slug);
}
