import { Bike, Clock, Handshake, MapPin, ShoppingBasket, Star } from "lucide-react";

import { ContactButtons } from "@/components/directory/contact-buttons";
import { DetailHero } from "@/components/directory/detail-hero";
import { placeLabel } from "@/components/directory/place";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { CloudImage } from "@/components/ui/cloud-image";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { RestaurantsDict } from "@/i18n/resources/fr/restaurants";
import { formatPrice, formatRating } from "@/lib/format";
import { pluralize, type PluralForms } from "@/lib/utils";
import type { Locale, RestaurantDetailDTO } from "@/types";

import { PriceLevel } from "./price-level";

/**
 * Top of a restaurant page: cover photo, badges (partner, guarantee level),
 * name (the page's <h1>), cuisine and city, rating, price range,
 * delivery summary (partners) and the main actions.
 */
export function RestaurantHeader({
  restaurant,
  canOrder,
  locale,
  common,
  dict,
  reviewCount,
}: {
  restaurant: RestaurantDetailDTO;
  /** Partner restaurant with at least one available dish */
  canOrder: boolean;
  locale: Locale;
  common: CommonDict;
  dict: RestaurantsDict;
  /** "12 avis" in every plural form: dict.community.reviews.count */
  reviewCount: PluralForms;
}) {
  const hasRating = restaurant.ratingCount > 0 && restaurant.ratingAvg !== null;
  // 4.3 -> "4,3" in French (one decimal, Latin digits), like the reviews section
  const ratingText = formatRating(restaurant.ratingAvg ?? 0, locale);

  return (
    <DetailHero
      lang={locale}
      breadcrumbs={[
        { label: common.nav.restaurants, href: "/restaurants" },
        { label: restaurant.name, href: `/restaurants/${restaurant.slug}` },
      ]}
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <CloudImage
          src={restaurant.imageUrl}
          alt={restaurant.name}
          fallbackIcon="chef"
          sizes="(min-width: 1280px) 600px, (min-width: 1024px) 46vw, 100vw"
          preload
          rounded="rounded-[var(--radius-card)]"
          className="aspect-[16/10] w-full shadow-lift ring-1 ring-line"
        />

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {restaurant.isPartner ? (
              <Badge tone="saffron" className="bg-saffron-400 px-3 py-1 text-sm text-brand-950 ring-0">
                <Handshake aria-hidden="true" />
                {common.labels.partnerRestaurant}
              </Badge>
            ) : null}
            <GuaranteeBadge
              level={restaurant.guaranteeLevel}
              label={common.guarantee[restaurant.guaranteeLevel].label}
              size="md"
            />
          </div>

          <h1 className="mt-4 text-3xl leading-[1.1] font-extrabold text-ink sm:text-4xl lg:text-5xl">
            {restaurant.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4 text-brand-600" aria-hidden="true" />
              {restaurant.cuisine ? `${restaurant.cuisine} · ` : ""}
              {placeLabel(restaurant.city, restaurant.governorate, locale)}
            </span>
            <PriceLevel level={restaurant.priceRange} common={common} />
            {hasRating ? (
              <a href="#avis" className="inline-flex items-center gap-1.5 rounded-md hover:text-brand-700">
                <RatingStars
                  value={restaurant.ratingAvg ?? 0}
                  label={interpolate(common.labels.rating, { rating: ratingText })}
                />
                <span className="font-bold text-ink tabular">{ratingText}</span>
                <span className="underline-offset-4 hover:underline">
                  ({pluralize(locale, restaurant.ratingCount, reviewCount)})
                </span>
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 text-line-strong" aria-hidden="true" />
                {common.labels.noReviews}
              </span>
            )}
          </div>

          {restaurant.description ? (
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">{restaurant.description}</p>
          ) : null}

          {restaurant.isPartner ? (
            <ul className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-ink">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line">
                <Clock className="size-3.5 text-brand-600" aria-hidden="true" />
                <span className="sr-only">{common.labels.deliveryTime}</span>
                {restaurant.deliveryTime}
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 ring-1 ring-line">
                <Bike className="size-3.5 text-brand-600" aria-hidden="true" />
                <span className="text-ink-muted">{common.labels.delivery}</span>
                {restaurant.deliveryFee === 0 ? common.labels.free : formatPrice(restaurant.deliveryFee, locale)}
              </li>
            </ul>
          ) : null}

          <div className="mt-7 flex flex-wrap items-center gap-2">
            {canOrder ? (
              <a href="#carte" className={buttonStyles({ size: "lg", className: "w-full sm:w-auto" })}>
                <ShoppingBasket aria-hidden="true" />
                {dict.page.orderOnline}
              </a>
            ) : null}
            <ContactButtons
              contact={restaurant}
              common={common}
              labels={dict.sheet}
              primary={canOrder ? undefined : "call"}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>
    </DetailHero>
  );
}
