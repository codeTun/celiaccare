import { Bike, Clock, MapPin, Star } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/components/ui/cloud-image";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { localePath } from "@/i18n/config";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { placeLabel } from "@/components/directory/place";
import { formatPrice, formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Locale, RestaurantCardDTO } from "@/types";

/** Restaurant tile used on the home page and the restaurants directory. */
export function RestaurantCard({
  restaurant,
  locale,
  common,
  className,
}: {
  restaurant: RestaurantCardDTO;
  locale: Locale;
  common: CommonDict;
  className?: string;
}) {
  const href = localePath(locale, `/restaurants/${restaurant.slug}`);
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift",
        // the link covers the whole card, so the card shows the keyboard focus
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand-600",
        className,
      )}
    >
      <div className="relative">
        <CloudImage
          src={restaurant.imageUrl}
          alt=""
          fallbackIcon="chef"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          rounded="rounded-none"
          className="aspect-[16/10]"
          imageClassName="transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute start-3 top-3 flex flex-wrap gap-1.5">
          {restaurant.isPartner ? (
            <Badge tone="saffron" className="bg-saffron-400 text-brand-950 ring-0">
              {common.labels.partner}
            </Badge>
          ) : null}
          <GuaranteeBadge level={restaurant.guaranteeLevel} label={common.guarantee[restaurant.guaranteeLevel].short} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className="flex items-center gap-1.5 text-xs font-medium text-ink-subtle">
          <MapPin className="size-3.5" aria-hidden="true" />
          {restaurant.cuisine ? `${restaurant.cuisine} · ` : ""}
          {placeLabel(restaurant.city, restaurant.governorate, locale)}
        </p>
        <h3 className="text-lg leading-snug font-bold text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {restaurant.name}
          </Link>
        </h3>
        {restaurant.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{restaurant.description}</p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 text-xs font-medium text-ink-muted">
          {restaurant.ratingCount > 0 && restaurant.ratingAvg ? (
            <span className="inline-flex items-center gap-1">
              <Star className="size-3.5 fill-saffron-400 text-saffron-400" aria-hidden="true" />
              <span className="tabular font-bold text-ink">{formatRating(restaurant.ratingAvg, locale)}</span>
              <span className="tabular">({restaurant.ratingCount})</span>
            </span>
          ) : null}
          {restaurant.isPartner ? (
            <>
              <span className="inline-flex items-center gap-1">
                <Clock className="size-3.5" aria-hidden="true" />
                {restaurant.deliveryTime}
              </span>
              <span className="inline-flex items-center gap-1">
                <Bike className="size-3.5" aria-hidden="true" />
                {restaurant.deliveryFee === 0 ? common.labels.free : formatPrice(restaurant.deliveryFee, locale)}
              </span>
            </>
          ) : null}
          <span className="text-ink-subtle">{common.priceLevels[restaurant.priceRange - 1] ?? common.priceLevels[1]}</span>
        </div>
      </div>
    </article>
  );
}
