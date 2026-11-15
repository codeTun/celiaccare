import { Banknote, CreditCard, Headset, Mail, Phone, Store, Truck, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { WhatsAppIcon } from "@/components/social-icons";
import { Price } from "@/components/ui/price";
import { localePath } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { CartDict } from "@/i18n/resources/fr/cart";
import type { CheckoutDict } from "@/i18n/resources/fr/checkout";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import { governorateLabel } from "@/lib/tunisia";
import { cn } from "@/lib/utils";
import type { DeliveryZoneDTO, Locale, OrderType } from "@/types";

import type { CheckoutRestaurant } from "./types";

/**
 * "Livraison & paiement" panel shown on the cart page BEFORE ordering (spec 5.4):
 * covered zones with fees and delays (shop cart) or the restaurant's delivery rules
 * (restaurant cart), accepted payment methods and who to contact.
 */
export function DeliveryInfo({
  lang,
  cartTexts,
  paymentTexts,
  cartType,
  zones,
  restaurant,
  className,
}: {
  lang: Locale;
  /** dict.cart */
  cartTexts: CartDict;
  /** dict.checkout.payment */
  paymentTexts: CheckoutDict["payment"];
  cartType: OrderType;
  zones: DeliveryZoneDTO[];
  /** The partner restaurant of a restaurant cart (null when it no longer takes online orders). */
  restaurant: CheckoutRestaurant | null;
  className?: string;
}) {
  const texts = cartTexts.delivery;
  const freeLabel = cartTexts.summary.free;

  return (
    <section
      aria-labelledby="delivery-info-title"
      className={cn("rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-soft sm:p-7", className)}
    >
      <h2 id="delivery-info-title" className="text-lg font-extrabold text-ink sm:text-xl">
        {texts.title}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{texts.intro}</p>

      <div className="mt-6 grid gap-x-8 gap-y-7 md:grid-cols-2">
        <div className="md:col-span-2">
          {cartType === "RESTAURANT" ? (
            <RestaurantDelivery
              lang={lang}
              texts={texts}
              freeLabel={freeLabel}
              closedText={cartTexts.restaurantClosed.text}
              restaurant={restaurant}
            />
          ) : (
            <ShopZones lang={lang} texts={texts} freeLabel={freeLabel} zones={zones} />
          )}
        </div>

        <InfoBlock icon={<Banknote />} title={texts.paymentTitle}>
          <p>{texts.paymentText}</p>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2.5 font-medium text-ink">
              <Banknote className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
              {paymentTexts.CASH_ON_DELIVERY.label}
            </li>
            <li className="flex items-center gap-2.5 font-medium text-ink">
              <CreditCard className="size-4 shrink-0 text-brand-700" aria-hidden="true" />
              {paymentTexts.CARD_ON_DELIVERY.label}
            </li>
          </ul>
        </InfoBlock>

        <InfoBlock icon={<Headset />} title={texts.contactTitle}>
          {cartType === "RESTAURANT" && restaurant ? (
            <>
              <p>{texts.contactRestaurant}</p>
              <Link
                href={localePath(lang, `/restaurants/${restaurant.slug}`)}
                className="mt-2 inline-flex items-center gap-2 font-semibold text-brand-700 underline-offset-4 hover:underline"
              >
                <Store className="size-4 shrink-0" aria-hidden="true" />
                {interpolate(texts.restaurantContact, { name: restaurant.name })}
              </Link>
              <p className="mt-4">{texts.contactShop}</p>
            </>
          ) : (
            <p>{texts.contactShop}</p>
          )}
          <ul className="mt-3 flex flex-wrap gap-2">
            <li>
              <ContactLink href={`tel:${siteConfig.phone.replace(/\s/g, "")}`} label={texts.call}>
                <Phone aria-hidden="true" />
                <span dir="ltr">{siteConfig.phone}</span>
              </ContactLink>
            </li>
            <li>
              <ContactLink href={`https://wa.me/${siteConfig.whatsapp}`} label={texts.whatsapp} external>
                <WhatsAppIcon aria-hidden="true" />
                {texts.whatsapp}
              </ContactLink>
            </li>
            <li>
              <ContactLink href={`mailto:${siteConfig.email}`} label={texts.email}>
                <Mail aria-hidden="true" />
                {texts.email}
              </ContactLink>
            </li>
          </ul>
        </InfoBlock>
      </div>
    </section>
  );
}

/** Small titled block with an icon. */
function InfoBlock({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="flex items-center gap-2.5 text-base font-bold text-ink">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 [&_svg]:size-[18px]"
        >
          {icon}
        </span>
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-ink-muted">{children}</div>
    </div>
  );
}

function ContactLink({
  href,
  label,
  external = false,
  children,
}: {
  href: string;
  /** Accessible name, e.g. "Appeler" (the visible text may be only the number) */
  label: string;
  external?: boolean;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      title={label}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line-strong bg-white px-4 text-sm font-semibold text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-brand-700"
    >
      {children}
    </a>
  );
}

/** Shop cart: the governorates we deliver to, with fee, delay and free-delivery threshold. */
function ShopZones({
  lang,
  texts,
  freeLabel,
  zones,
}: {
  lang: Locale;
  texts: CartDict["delivery"];
  freeLabel: string;
  zones: DeliveryZoneDTO[];
}) {
  if (zones.length === 0) {
    return (
      <InfoBlock icon={<Truck />} title={texts.zonesTitle}>
        <p>{texts.noZones}</p>
      </InfoBlock>
    );
  }

  return (
    <InfoBlock icon={<Truck />} title={texts.zonesTitle}>
      <p>{interpolate(texts.zonesIntro, { count: zones.length })}</p>
      {/* Every zone stays visible before ordering (spec 5.4), in a box that scrolls past ~8 rows. */}
      <div
        tabIndex={0}
        role="region"
        aria-label={texts.zonesTitle}
        className="mt-3 max-h-[23rem] overflow-y-auto overscroll-contain rounded-xl border border-line focus-visible:outline-2 focus-visible:outline-brand-600"
      >
        <table className="w-full text-start text-sm">
          <thead className="sticky top-0 z-10 bg-canvas text-xs text-ink-subtle shadow-[0_1px_0_var(--color-line)]">
            <tr>
              <th scope="col" className="px-3 py-2 text-start font-semibold sm:px-4">
                {texts.governorate}
              </th>
              <th scope="col" className="px-3 py-2 text-start font-semibold sm:px-4">
                {texts.fee}
              </th>
              <th scope="col" className="px-3 py-2 text-start font-semibold sm:px-4">
                {texts.delay}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {zones.map((zone) => (
              <tr key={zone.id}>
                <th scope="row" className="px-3 py-2.5 text-start font-semibold text-ink sm:px-4">
                  {governorateLabel(zone.governorate, lang)}
                </th>
                <td className="px-3 py-2.5 sm:px-4">
                  {zone.fee === 0 ? (
                    <span className="font-bold text-brand-700">{freeLabel}</span>
                  ) : (
                    <Price value={zone.fee} locale={lang} className="text-ink" />
                  )}
                  {zone.freeFrom !== null && zone.fee > 0 ? (
                    <span className="block text-xs text-brand-700">
                      {interpolate(texts.freeFrom, { price: formatPrice(zone.freeFrom, lang) })}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-ink-muted sm:px-4">
                  <bdi>{zone.delay}</bdi>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-subtle">{texts.zonesMissing}</p>
    </InfoBlock>
  );
}

/** Restaurant cart: delivered by the restaurant itself, in its own governorate only. */
function RestaurantDelivery({
  lang,
  texts,
  freeLabel,
  closedText,
  restaurant,
}: {
  lang: Locale;
  texts: CartDict["delivery"];
  freeLabel: string;
  /** Shown when the restaurant no longer takes online orders */
  closedText: string;
  restaurant: CheckoutRestaurant | null;
}) {
  if (!restaurant) {
    return (
      <InfoBlock icon={<UtensilsCrossed />} title={texts.restaurantTitle}>
        <p>{closedText}</p>
      </InfoBlock>
    );
  }

  const facts = [
    {
      label: texts.restaurantFee,
      value:
        restaurant.deliveryFee === 0 ? (
          <span className="font-bold text-brand-700">{freeLabel}</span>
        ) : (
          <Price value={restaurant.deliveryFee} locale={lang} className="text-ink" />
        ),
    },
    { label: texts.restaurantTime, value: <bdi className="font-bold text-ink">{restaurant.deliveryTime}</bdi> },
    { label: texts.restaurantMin, value: <Price value={restaurant.minOrder} locale={lang} className="text-ink" /> },
  ];

  return (
    <InfoBlock icon={<UtensilsCrossed />} title={texts.restaurantTitle}>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-xl bg-canvas px-4 py-3">
            <dt className="text-xs text-ink-subtle">{fact.label}</dt>
            <dd className="mt-0.5 text-base">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3">
        {interpolate(texts.restaurantArea, {
          governorate: governorateLabel(restaurant.governorate, lang),
          city: restaurant.city,
        })}
      </p>
    </InfoBlock>
  );
}
