import { Coins } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ReviewsSection } from "@/components/community/reviews-section";
import { InfoRow, InfoSheet } from "@/components/directory/info-sheet";
import { MapEmbed } from "@/components/directory/map-embed";
import { OrderRequestBox } from "@/components/directory/order-request";
import { SheetReport } from "@/components/directory/sheet-report";
import { DetailPageSkeleton } from "@/components/directory/skeletons";
import { JsonLd } from "@/components/json-ld";
import { DeliveryInfo } from "@/components/restaurants/delivery-info";
import { PriceLevel } from "@/components/restaurants/price-level";
import { RestaurantCartBar, RestaurantCartCard } from "@/components/restaurants/restaurant-cart";
import { RestaurantHeader } from "@/components/restaurants/restaurant-header";
import { RestaurantMenu } from "@/components/restaurants/restaurant-menu";
import { Alert } from "@/components/ui/alert";
import { Container } from "@/components/ui/container";
import { isLocale, localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import { getDictionary } from "@/i18n/server";
import { cloudinaryUrl } from "@/lib/cloudinary-url";
import { pageMetadata, restaurantJsonLd } from "@/lib/seo";
import { getRestaurantBySlug, getRestaurantSlugs } from "@/models/fetchers/restaurants";

/* /fr/restaurants/[slug] — one restaurant: sheet (spec 5.2), gluten-free menu,
   online ordering for partner restaurants, reviews and error reports. Every order goes
   through CeliacCare: no contact of the restaurant, but "Commander / Demander sur CeliacCare". */

type RestaurantPageProps = PageProps<"/[lang]/restaurants/[slug]">;

/** Pages built in advance: one per published restaurant (at least one item, Cache Components rule). */
export async function generateStaticParams() {
  const slugs = await getRestaurantSlugs();
  return slugs.length > 0 ? slugs.map((slug) => ({ slug })) : [{ slug: "__none__" }];
}

export async function generateMetadata({ params }: RestaurantPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const restaurant = await getRestaurantBySlug(lang, slug);
  const { common, restaurants: dict } = getDictionary(lang);
  if (!restaurant) return { title: common.states.notFoundTitle, robots: { index: false } };

  const values = { name: restaurant.name, city: restaurant.city };
  return pageMetadata({
    locale: lang,
    path: `/restaurants/${restaurant.slug}`,
    title: interpolate(dict.meta.detailTitle, values),
    description: interpolate(
      restaurant.isPartner ? dict.meta.detailDescriptionPartner : dict.meta.detailDescription,
      values,
    ),
    image: restaurant.imageUrl
      ? (cloudinaryUrl(restaurant.imageUrl, { width: 1200, height: 630, crop: "fill" }) ?? restaurant.imageUrl)
      : null,
  });
}

export default function RestaurantPage({ params }: RestaurantPageProps) {
  // The slug is URL data: it is read inside <Suspense> (Cache Components rule).
  return (
    <Suspense fallback={<DetailPageSkeleton variant="restaurant" />}>
      <RestaurantContent params={params} />
    </Suspense>
  );
}

async function RestaurantContent({ params }: Pick<RestaurantPageProps, "params">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const restaurant = await getRestaurantBySlug(lang, slug);
  if (!restaurant) notFound();

  const dict = getDictionary(lang);
  const { common, restaurants: texts } = dict;
  // Online ordering: partner restaurants ("conventionnés") with at least one available dish.
  const canOrder =
    restaurant.isPartner && restaurant.menu.some((section) => section.dishes.some((dish) => dish.isAvailable));
  const cartProps = {
    restaurantId: restaurant.id,
    locale: lang,
    cartHref: localePath(lang, "/panier"),
    texts: texts.cart,
  };

  return (
    <>
      <JsonLd data={restaurantJsonLd(restaurant, lang)} />

      <RestaurantHeader
        restaurant={restaurant}
        canOrder={canOrder}
        locale={lang}
        common={common}
        reviewCount={dict.community.reviews.count}
      />

      <Container className="py-10 sm:py-14">
        {/* Mobile: menu, then the sheet and the map. Large screens: the sheet in a side column. */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="min-w-0 space-y-10">
            {restaurant.isPartner ? (
              <DeliveryInfo restaurant={restaurant} locale={lang} common={common} dict={texts} />
            ) : null}
            {/* Not a partner, or nothing on the menu to order: the visitor asks CeliacCare, never the restaurant directly.
                Without any dish, the box sits inside the menu section instead (RestaurantMenu). */}
            {canOrder || restaurant.menu.length === 0 ? null : (
              <OrderRequestBox target={{ kind: "restaurant", slug: restaurant.slug }} locale={lang} texts={common.ordering} />
            )}
            <RestaurantMenu restaurant={restaurant} canOrder={canOrder} locale={lang} common={common} dict={texts} />
            {/* Spec 6.5: visible warning on every sheet */}
            <Alert tone="warning" title={common.disclaimer.title}>
              {common.disclaimer.text}
            </Alert>
          </div>

          <aside className="min-w-0 space-y-6">
            <RestaurantCartCard {...cartProps} />
            <InfoSheet
              place={restaurant}
              practices={[
                { label: common.practices.dedicatedKitchen, ok: restaurant.dedicatedKitchen },
                { label: common.practices.dedicatedUtensils, ok: restaurant.dedicatedUtensils },
                { label: common.practices.trainedStaff, ok: restaurant.trainedStaff },
              ]}
              locale={lang}
              common={common}
              labels={texts.sheet}
              extraRows={
                <InfoRow icon={<Coins />} label={common.labels.priceRange}>
                  <PriceLevel level={restaurant.priceRange} common={common} />
                </InfoRow>
              }
              footer={
                <SheetReport
                  locale={lang}
                  target={{ type: "RESTAURANT", id: restaurant.id, name: restaurant.name }}
                  labels={texts.sheet}
                  community={dict.community}
                  closeLabel={common.actions.close}
                />
              }
            />
            <MapEmbed place={restaurant} locale={lang} common={common} labels={texts.sheet} />
          </aside>
        </div>
      </Container>

      {/* Reviews (EF-22): full width, they have their own two-column layout */}
      <div className="border-t border-line bg-canvas/60 py-14 sm:py-20">
        <Container>
          <ReviewsSection
            locale={lang}
            target={{ type: "RESTAURANT", id: restaurant.id, name: restaurant.name }}
            reviews={restaurant.reviews}
            ratingAvg={restaurant.ratingAvg}
            ratingCount={restaurant.ratingCount}
            dict={dict.community}
            common={common}
          />
        </Container>
      </div>

      <RestaurantCartBar {...cartProps} />
    </>
  );
}
