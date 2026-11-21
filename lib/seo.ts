import type { Metadata } from "next";

import { localePath } from "@/i18n/config";
import { siteConfig } from "@/lib/site-config";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import { absoluteUrl } from "@/lib/utils";
import type { Locale, MenuSectionDTO, ProducerType, ProductDetailDTO, RestaurantDetailDTO } from "@/types";

/* ==========================================================================
   SEO helpers: page metadata (title, description, canonical, hreflang,
   Open Graph) and JSON-LD structured data (Google rich results).
   ========================================================================== */

type PageMetadataInput = {
  locale: Locale;
  /** Path WITHOUT the locale, e.g. "/produits/couscous-de-mais" ("/" for home) */
  path: string;
  title: string;
  description: string;
  /** Absolute or root-relative image URL for social networks (1200x630 ideally) */
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
};

/** Search results cut descriptions after about 155 characters. */
const MAX_DESCRIPTION_LENGTH = 155;

/** Shortens a description at a word boundary, with "…", when it is too long for search results. */
function metaDescription(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= MAX_DESCRIPTION_LENGTH) return clean;
  const cut = clean.slice(0, MAX_DESCRIPTION_LENGTH - 1);
  // drop the cut word, then any dangling punctuation ("…, …" / "… :")
  const lastSpace = cut.lastIndexOf(" ");
  let end = lastSpace > 0 ? lastSpace : cut.length;
  while (end > 0 && " ,;:·–—-،".includes(cut[end - 1])) end--;
  return `${cut.slice(0, end)}…`;
}

/** Metadata for a public page, with its French and Arabic versions linked together. */
export function pageMetadata({ locale, path, title, description: fullDescription, image, type = "website", noIndex }: PageMetadataInput): Metadata {
  const url = localePath(locale, path);
  const description = metaDescription(fullDescription);
  const shareImage = image || `${localePath(locale)}/opengraph-image`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        "fr-TN": localePath("fr", path),
        "ar-TN": localePath("ar", path),
        "x-default": localePath("fr", path),
      },
    },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: siteConfig.name,
      // og:locale values supported by Facebook
      locale: locale === "ar" ? "ar_AR" : "fr_FR",
      alternateLocale: locale === "ar" ? ["fr_FR"] : ["ar_AR"],
      // Next replaces the whole parent openGraph object, so always give an image:
      // the page's own photo, or the branded share card of app/[lang]/opengraph-image.tsx.
      images: [{ url: shareImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImage],
    },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

/* --------------------------------------------------------------------------
   JSON-LD builders (schema.org)
   Every purchase goes through CeliacCare: the structured data of restaurants,
   artisans and products never carries a business's own phone, e-mail, website
   or social networks (only CeliacCare's own contacts, in organizationJsonLd).
   -------------------------------------------------------------------------- */

type JsonLdObject = Record<string, unknown>;

/** CeliacCare's phone in international E.164 format: "+216 70 000 000" -> "+21670000000" (others kept as typed). */
function internationalPhone(phone: string) {
  const local = normalizeTunisianPhone(phone);
  return local ? `+216${local}` : phone;
}

/** Prices of the menu as a readable range for priceRange: "12–35 DT" (null when no dish has a price). */
function menuPriceRange(menu: MenuSectionDTO[]) {
  const prices = menu.flatMap((section) => section.dishes.map((dish) => dish.price)).filter((price) => price > 0);
  if (prices.length === 0) return null;
  const min = Math.floor(Math.min(...prices) / 1000);
  const max = Math.ceil(Math.max(...prices) / 1000);
  return min === max ? `${min} DT` : `${min}–${max} DT`;
}

export function organizationJsonLd(): JsonLdObject {
  const sameAs = [siteConfig.instagram, siteConfig.facebook].filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/logo-emblem.svg"),
    email: siteConfig.email,
    telephone: internationalPhone(siteConfig.phone),
    address: { "@type": "PostalAddress", addressLocality: siteConfig.city, addressCountry: siteConfig.country },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd(locale: Locale): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl(localePath(locale)),
    inLanguage: locale === "ar" ? "ar-TN" : "fr-TN",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: absoluteUrl(`${localePath(locale, "/produits")}?q={search_term_string}`) },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function productJsonLd(product: ProductDetailDTO, locale: Locale): JsonLdObject {
  const url = absoluteUrl(localePath(locale, `/produits/${product.slug}`));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: `CC-P${product.id}`,
    url,
    ...(product.imageUrl ? { image: [product.imageUrl] } : {}),
    category: product.categoryName,
    brand: { "@type": "Brand", name: product.producerName },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TND",
      price: (product.price / 1000).toFixed(3),
      availability: product.isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      // The artisan makes the product (brand); the purchase is made through CeliacCare.
      seller: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
    },
    ...(product.ratingCount > 0 && product.ratingAvg
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.ratingAvg.toFixed(1),
            reviewCount: product.ratingCount,
          },
        }
      : {}),
  };
}

export function restaurantJsonLd(restaurant: RestaurantDetailDTO, locale: Locale): JsonLdObject {
  const priceRange = menuPriceRange(restaurant.menu);
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    url: absoluteUrl(localePath(locale, `/restaurants/${restaurant.slug}`)),
    description: restaurant.description ?? undefined,
    ...(restaurant.imageUrl ? { image: [restaurant.imageUrl] } : {}),
    servesCuisine: restaurant.cuisine ?? undefined,
    ...(priceRange ? { priceRange } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressRegion: restaurant.governorate,
      addressCountry: "TN",
    },
    ...(restaurant.latitude != null && restaurant.longitude != null
      ? { geo: { "@type": "GeoCoordinates", latitude: restaurant.latitude, longitude: restaurant.longitude } }
      : {}),
    ...(restaurant.ratingCount > 0 && restaurant.ratingAvg
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: restaurant.ratingAvg.toFixed(1),
            reviewCount: restaurant.ratingCount,
          },
        }
      : {}),
  };
}

const producerSchemaType: Record<ProducerType, string> = {
  BAKERY: "Bakery",
  SPECIALTY_SHOP: "Store",
  GROCERY: "GroceryStore",
  HOME_SELLER: "LocalBusiness",
  COOPERATIVE: "LocalBusiness",
  MANUFACTURER: "LocalBusiness",
};

export function producerJsonLd(
  producer: {
    slug: string;
    name: string;
    type: ProducerType;
    description: string | null;
    city: string;
    governorate: string;
    address: string | null;
    imageUrl: string | null;
    latitude: number | null;
    longitude: number | null;
  },
  locale: Locale,
): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": producerSchemaType[producer.type],
    name: producer.name,
    url: absoluteUrl(localePath(locale, `/artisans/${producer.slug}`)),
    description: producer.description ?? undefined,
    ...(producer.imageUrl ? { image: [producer.imageUrl] } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: producer.address ?? undefined,
      addressLocality: producer.city,
      addressRegion: producer.governorate,
      addressCountry: "TN",
    },
    ...(producer.latitude != null && producer.longitude != null
      ? { geo: { "@type": "GeoCoordinates", latitude: producer.latitude, longitude: producer.longitude } }
      : {}),
  };
}
