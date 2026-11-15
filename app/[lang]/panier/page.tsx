import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CartView } from "@/components/checkout/cart-view";
import { toCheckoutRestaurants } from "@/components/checkout/types";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { getDeliveryZones } from "@/models/fetchers/delivery";
import { getRestaurants } from "@/models/fetchers/restaurants";

/**
 * Cart page (/fr/panier, /ar/panier).
 * The cart itself is stored in the browser: this Server Component only sends the
 * delivery information (cached), and <CartView> (Client Component) does the rest.
 */

export async function generateMetadata({ params }: PageProps<"/[lang]/panier">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { cart } = getDictionary(lang);
  // A cart is personal: no need to show it in search engines.
  return pageMetadata({
    locale: lang,
    path: "/panier",
    title: cart.meta.title,
    description: cart.meta.description,
    noIndex: true,
  });
}

export default async function CartPage({ params }: PageProps<"/[lang]/panier">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { cart, checkout } = getDictionary(lang);

  // Both are cached fetchers: the page stays static and fast.
  const [zones, partnerRestaurants] = await Promise.all([
    getDeliveryZones(),
    getRestaurants(lang, { partnerOnly: true }),
  ]);

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[{ label: cart.breadcrumb, href: "/panier" }]}
        eyebrow={cart.hero.eyebrow}
        title={cart.hero.title}
        description={cart.hero.description}
      />
      <Container className="py-10 sm:py-14">
        <CartView
          lang={lang}
          texts={cart}
          paymentTexts={checkout.payment}
          zones={zones}
          restaurants={toCheckoutRestaurants(partnerRestaurants)}
        />
      </Container>
    </>
  );
}
