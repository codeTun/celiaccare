import { Banknote, BadgeCheck, CalendarCheck, ClipboardCheck, Clock, MapPin, ShieldCheck, Store, Truck } from "lucide-react";
import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/cards/product-card";
import { cartLabels } from "@/components/cart/labels";
import { ReportButton } from "@/components/community/report-button";
import { ReviewsSection } from "@/components/community/reviews-section";
import { placeLabel } from "@/components/directory/place";
import { JsonLd } from "@/components/json-ld";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CloudImage } from "@/components/ui/cloud-image";
import { Container } from "@/components/ui/container";
import { GuaranteeBadge } from "@/components/ui/guarantee-badge";
import { Price } from "@/components/ui/price";
import { RatingStars } from "@/components/ui/rating-stars";
import { SectionHeading } from "@/components/ui/section-heading";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { Dictionary } from "@/i18n/server";
import { formatDate, formatPrice, formatRating } from "@/lib/format";
import { productJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import type { DeliveryZoneDTO, Locale, ProductCardDTO, ProductDetailDTO } from "@/types";

import { catalogHref } from "./catalog-params";
import { DeliveryBox } from "./delivery-box";
import { FrenchText } from "./french-text";
import { IngredientList } from "./ingredient-list";
import { pluralize } from "./plural";
import { ProducerBox } from "./producer-box";
import { ProductPurchaseBox, ProductPurchaseProvider, ProductStickyBar } from "./product-purchase";

const sectionTitle = "text-xl font-extrabold text-ink sm:text-2xl";

/**
 * Product sheet (spec 5.3): photo, name, artisan, guarantee level, price and "add to cart";
 * then description, ingredients & allergens, certification, artisan, delivery, verification
 * dates, "Signaler une erreur", reviews and products of the same category. Server Component.
 */
export function ProductSheet({
  locale,
  product,
  related,
  zones,
  dict,
}: {
  locale: Locale;
  product: ProductDetailDTO;
  /** Other products of the same category */
  related: ProductCardDTO[];
  /** Delivery zones of the shop (fees and delays) */
  zones: DeliveryZoneDTO[];
  dict: Dictionary;
}) {
  const { common, products, community } = dict;
  const labels = products.sheet;
  const guarantee = common.guarantee[product.guaranteeLevel];
  const categoryHref = catalogHref(locale, { category: product.categorySlug });
  const producerHref = localePath(locale, `/artisans/${product.producerSlug}`);
  // "par {name}": the artisan's name becomes a link
  const [byBefore, byAfter = ""] = common.labels.by.split("{name}");
  // "Source : {source}" (spec 6.1: a source and a date on every sheet) — the artisan's verification source
  const [sourceBefore, sourceAfter = ""] = common.verification.source.split("{source}");

  const purchase = {
    item: {
      kind: "PRODUCT" as const,
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      merchantName: product.producerName,
      href: `/produits/${product.slug}`,
    },
    cartLabels: cartLabels(common),
    quantityLabels: { quantity: labels.quantity, decrease: labels.decrease, increase: labels.increase },
    disabled: !product.isAvailable,
  };

  return (
    <ProductPurchaseProvider>
      <div>
        <JsonLd data={productJsonLd(product, locale)} />

        <Container className="pt-6 pb-14 sm:pt-8 lg:pb-20">
          <Breadcrumbs
            lang={locale}
            items={[
              { label: common.nav.products, href: "/produits" },
              { label: product.categoryName, href: `/produits?categorie=${product.categorySlug}` },
              { label: product.name, href: `/produits/${product.slug}` },
            ]}
            className="mb-6 sm:mb-8"
          />

          {/* Photo + main information */}
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="relative">
                <CloudImage
                  src={product.imageUrl}
                  alt={product.name}
                  fallbackIcon={product.categoryIcon}
                  sizes="(min-width: 1280px) 600px, (min-width: 1024px) 46vw, 100vw"
                  preload
                  rounded="rounded-[var(--radius-card)]"
                  className="aspect-square w-full ring-1 ring-line"
                />
                {product.isAvailable ? null : (
                  <Badge tone="neutral" className="absolute end-4 top-4 bg-white/95">
                    {common.labels.unavailable}
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex min-w-0 flex-col">
              <Link
                href={categoryHref}
                className="self-start text-xs font-bold tracking-[0.14em] text-brand-700 uppercase underline-offset-4 hover:underline rtl:tracking-normal"
              >
                {product.categoryName}
              </Link>
              <h1 className="mt-2 text-3xl leading-tight font-extrabold text-ink sm:text-4xl">{product.name}</h1>

              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-muted">
                <Store className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                <span>
                  {byBefore}
                  <Link href={producerHref} className="font-semibold text-ink underline-offset-4 hover:text-brand-800 hover:underline">
                    {product.producerName}
                  </Link>
                  {byAfter}
                </span>
                <span className="text-line-strong" aria-hidden="true">
                  ·
                </span>
                <MapPin className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                <span>{placeLabel(product.producer.city, product.producer.governorate, locale)}</span>
              </p>

              {product.ratingCount > 0 && product.ratingAvg !== null ? (
                <a href="#avis" className="group mt-3 inline-flex items-center gap-2 self-start text-sm text-ink-muted">
                  <RatingStars
                    value={product.ratingAvg}
                    label={interpolate(common.labels.rating, { rating: formatRating(product.ratingAvg, locale) })}
                  />
                  <span className="font-bold text-ink tabular">{formatRating(product.ratingAvg, locale)}</span>
                  <span className="underline-offset-4 group-hover:text-brand-800 group-hover:underline">
                    {pluralize(locale, product.ratingCount, community.reviews.count)}
                  </span>
                </a>
              ) : (
                <a
                  href="#avis"
                  className="mt-3 self-start text-sm text-ink-muted underline-offset-4 hover:text-brand-800 hover:underline"
                >
                  {common.labels.noReviews} · <span className="font-semibold text-brand-700">{labels.giveReview}</span>
                </a>
              )}

              {/* Guarantee level, always visible (spec 5.2) */}
              <div className="mt-6 rounded-2xl border border-line bg-canvas p-4 sm:p-5">
                <GuaranteeBadge level={product.guaranteeLevel} label={guarantee.label} size="md" />
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{guarantee.description}</p>
                <Link
                  href={localePath(locale, "/guide-sans-gluten")}
                  className="mt-2 inline-block text-sm font-semibold text-brand-700 underline-offset-4 hover:text-brand-800 hover:underline"
                >
                  {labels.guaranteeLink}
                </Link>
              </div>

              {/* Price and availability */}
              <div className="mt-6 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <Price value={product.price} locale={locale} className="text-3xl text-ink" />
                {product.unit ? <span className="text-sm text-ink-subtle">· {product.unit}</span> : null}
              </div>
              <p
                className={cn(
                  "mt-2 inline-flex items-center gap-2 text-sm font-semibold",
                  product.isAvailable ? "text-brand-700" : "text-ink-subtle",
                )}
              >
                <span
                  className={cn("size-2 rounded-full", product.isAvailable ? "bg-brand-500" : "bg-line-strong")}
                  aria-hidden="true"
                />
                {product.isAvailable ? common.labels.available : labels.unavailable}
              </p>
              {product.isAvailable ? null : <p className="mt-1 text-sm text-ink-muted">{labels.unavailableText}</p>}

              <ProductPurchaseBox {...purchase} className="mt-5" />

              <ul className="mt-6 flex flex-col gap-2 text-sm text-ink-muted">
                <li className="flex items-start gap-2.5">
                  <Truck className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {zones.length > 0 ? pluralize(locale, zones.length, labels.deliveryZones) : labels.deliveryNone}
                </li>
                <li className="flex items-start gap-2.5">
                  <Banknote className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
                  {labels.payment}
                </li>
              </ul>
            </div>
          </div>

          {/* Details + artisan, delivery and verification */}
          <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem] xl:gap-16">
            <div className="flex min-w-0 flex-col gap-10">
              <section aria-labelledby="description-title">
                <h2 id="description-title" className={sectionTitle}>
                  {labels.description}
                </h2>
                <p className="mt-3 text-base leading-relaxed whitespace-pre-line text-ink-muted">{product.description}</p>
              </section>

              <section aria-labelledby="ingredients-title">
                <h2 id="ingredients-title" className={sectionTitle}>
                  {labels.ingredientsTitle}
                </h2>
                <div className="mt-4">
                  <IngredientList
                    locale={locale}
                    ingredients={product.ingredients}
                    mayContain={product.mayContain}
                    labels={labels}
                  />
                </div>
              </section>

              {product.certification ? (
                <section
                  aria-labelledby="certification-title"
                  className="flex gap-4 rounded-[var(--radius-card)] border border-brand-200 bg-brand-50/60 p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
                    <BadgeCheck className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 id="certification-title" className="text-base font-bold text-brand-900">
                      {labels.certificationTitle}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-brand-900/80">{product.certification}</p>
                  </div>
                </section>
              ) : null}
            </div>

            <div className="flex flex-col gap-5">
              <ProducerBox
                locale={locale}
                producer={product.producer}
                productName={product.name}
                labels={labels}
                common={common}
              />
              <DeliveryBox locale={locale} zones={zones} labels={labels} common={common} />

              <section aria-labelledby="verification-title" className="rounded-[var(--radius-card)] border border-line bg-canvas p-5">
                <h2 id="verification-title" className="flex items-center gap-2 text-base font-bold text-ink">
                  <ShieldCheck className="size-5 text-brand-600" aria-hidden="true" />
                  {labels.verificationTitle}
                </h2>
                <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-muted">
                  <li className="flex items-start gap-2">
                    <ClipboardCheck className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    <span>
                      {sourceBefore}
                      <FrenchText locale={locale}>{product.producer.verificationSource}</FrenchText>
                      {sourceAfter}
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarCheck className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    {interpolate(common.verification.verifiedOn, { date: formatDate(product.verifiedAt, locale) })}
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
                    {interpolate(labels.updatedOn, { date: formatDate(product.updatedAt, locale) })}
                  </li>
                </ul>
                {product.needsReview ? (
                  <Alert tone="warning" title={common.verification.underReview} className="mt-4">
                    {common.verification.underReviewText}
                  </Alert>
                ) : null}
                <p className="mt-4 text-sm leading-relaxed text-ink-muted">{labels.reportPrompt}</p>
                <ReportButton
                  locale={locale}
                  target={{ type: "PRODUCT", id: product.id, name: product.name }}
                  dict={community}
                  closeLabel={common.actions.close}
                  className="mt-3"
                />
              </section>

              <Alert tone="info" title={common.disclaimer.title}>
                {common.disclaimer.text}
              </Alert>
            </div>
          </div>

          <div className="mt-16 border-t border-line pt-14 lg:mt-20 lg:pt-16">
            <ReviewsSection
              locale={locale}
              target={{ type: "PRODUCT", id: product.id, name: product.name }}
              reviews={product.reviews}
              ratingAvg={product.ratingAvg}
              ratingCount={product.ratingCount}
              dict={community}
              common={common}
            />
          </div>
        </Container>

        {related.length > 0 ? (
          <section className="border-t border-line bg-canvas py-14 sm:py-20">
            <Container>
              <SectionHeading
                eyebrow={labels.relatedEyebrow}
                title={labels.relatedTitle}
                action={{ href: categoryHref, label: labels.seeCategory }}
              />
              <ul role="list" className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {related.map((card) => (
                  <li key={card.id} className="flex">
                    <ProductCard product={card} locale={locale} common={common} className="w-full" />
                  </li>
                ))}
              </ul>
            </Container>
          </section>
        ) : null}

        {/* Last child on purpose: the phone bar stays at the bottom of the screen until the footer. */}
        <ProductStickyBar {...purchase} price={formatPrice(product.price, locale)} unit={product.unit} />
      </div>
    </ProductPurchaseProvider>
  );
}
