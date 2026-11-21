import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { toCheckoutRestaurants } from "@/components/checkout/types";
import { PageHero } from "@/components/page-hero";
import { Container } from "@/components/ui/container";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { pageMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { getDeliveryZones } from "@/models/fetchers/delivery";
import { getRestaurants } from "@/models/fetchers/restaurants";

import { placeOrder } from "./actions";

/**
 * Checkout page (/fr/commande, /ar/commande): delivery details → summary → confirmation.
 * The form needs the cart (stored in the browser), so <CheckoutFlow> is a Client Component;
 * this page gives it the delivery rules (cached) and the Server Action that saves the order.
 */

export async function generateMetadata({ params }: PageProps<"/[lang]/commande">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { checkout } = getDictionary(lang);
  return pageMetadata({
    locale: lang,
    path: "/commande",
    title: checkout.meta.title,
    description: checkout.meta.description,
    noIndex: true,
  });
}

export default async function CheckoutPage({ params }: PageProps<"/[lang]/commande">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const { cart, checkout, common } = getDictionary(lang);

  const [zones, partnerRestaurants] = await Promise.all([
    getDeliveryZones(),
    getRestaurants(lang, { partnerOnly: true }),
  ]);

  return (
    <>
      <PageHero
        lang={lang}
        breadcrumbs={[
          { label: cart.breadcrumb, href: "/panier" },
          { label: checkout.breadcrumb, href: "/commande" },
        ]}
        eyebrow={checkout.hero.eyebrow}
        title={checkout.hero.title}
        description={checkout.hero.description}
      />
      <Container className="py-10 sm:py-14">
        <CheckoutFlow
          lang={lang}
          texts={checkout}
          cartTexts={cart}
          zones={zones}
          restaurants={toCheckoutRestaurants(partnerRestaurants)}
          demo={siteConfig.demoMode ? common.demo : null}
          // Bound ONCE here, on the server (binding inside the Client Component loops forever, see KNOWN-ISSUES).
          placeOrder={placeOrder.bind(null, lang)}
        />
      </Container>
    </>
  );
}
