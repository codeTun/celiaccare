import { Store } from "lucide-react";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { cartLabels } from "@/components/cart/labels";
import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/components/ui/cloud-image";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Locale, ProductCardDTO } from "@/types";

/** Product tile used on the home page, the catalogue and the artisan pages. */
export function ProductCard({
  product,
  locale,
  common,
  preloadImage = false,
  className,
}: {
  product: ProductCardDTO;
  locale: Locale;
  common: CommonDict;
  preloadImage?: boolean;
  className?: string;
}) {
  const href = localePath(locale, `/produits/${product.slug}`);
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift",
        // the link covers the whole card, so the card shows the keyboard focus (the cart button keeps its own)
        "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-brand-600",
        className,
      )}
    >
      <div className="relative p-2 pb-0">
        <CloudImage
          src={product.imageUrl}
          alt=""
          fallbackIcon={product.categoryIcon}
          sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, 46vw"
          preload={preloadImage}
          className="aspect-[4/3]"
          imageClassName="transition duration-500 group-hover:scale-[1.03]"
        />
        {/* Badges share one wrapping row so they never overlap on narrow cards */}
        <div className="absolute start-4 end-4 top-4 flex flex-wrap items-start gap-1.5">
          <GuaranteeBadge level={product.guaranteeLevel} label={common.guarantee[product.guaranteeLevel].short} />
          {!product.isAvailable ? (
            <Badge tone="neutral" className="bg-white/95">
              {common.labels.unavailable}
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4 pt-3.5">
        <p className="text-[11px] font-bold tracking-[0.12em] text-brand-700 uppercase rtl:tracking-normal">
          {product.categoryName}
        </p>
        <h3 className="line-clamp-2 text-[15px] leading-snug font-bold text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-ink-subtle">
          <Store className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">
            {interpolate(common.labels.by, { name: product.producerName })} · {product.producerCity}
          </span>
        </p>
        {product.ratingCount > 0 && product.ratingAvg ? (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <RatingStars
              value={product.ratingAvg}
              label={interpolate(common.labels.rating, { rating: formatRating(product.ratingAvg, locale) })}
            />
            <span className="tabular">({product.ratingCount})</span>
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="leading-tight">
            <Price value={product.price} locale={locale} className="text-lg text-ink" />
            {product.unit ? <span className="block text-xs text-ink-subtle">{product.unit}</span> : null}
          </p>
          <div className="relative z-10">
            <AddToCartButton
              iconOnly
              size="md"
              disabled={!product.isAvailable}
              labels={cartLabels(common)}
              item={{
                kind: "PRODUCT",
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                merchantName: product.producerName,
                href: `/produits/${product.slug}`,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
