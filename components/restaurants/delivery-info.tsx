import { Banknote, Bike, Clock, MapPinCheck, PhoneOff, ShoppingBasket } from "lucide-react";
import type { ReactNode } from "react";

import { ContactButtons } from "@/components/directory/contact-buttons";
import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { RestaurantsDict } from "@/i18n/resources/fr/restaurants";
import { formatPrice } from "@/lib/format";
import { governorateLabel } from "@/lib/tunisia";
import type { Locale, RestaurantDetailDTO } from "@/types";

/**
 * Delivery terms of a partner restaurant, shown BEFORE ordering (spec 5.4):
 * area served, fee, delay, minimum order and accepted payment methods.
 */
export function DeliveryInfo({
  restaurant,
  locale,
  common,
  dict,
}: {
  restaurant: RestaurantDetailDTO;
  locale: Locale;
  common: CommonDict;
  dict: RestaurantsDict;
}) {
  return (
    <section
      aria-labelledby="delivery-title"
      className="rounded-[var(--radius-card)] border border-brand-100 bg-brand-50/60 p-5 sm:p-6"
    >
      <h2 id="delivery-title" className="text-lg font-bold text-ink">
        {dict.delivery.title}
      </h2>
      <p className="mt-1 text-sm text-ink-muted">{dict.delivery.text}</p>

      <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        <Term icon={<MapPinCheck />} label={dict.delivery.zone}>
          {interpolate(dict.delivery.zoneValue, { governorate: governorateLabel(restaurant.governorate, locale) })}
        </Term>
        <Term icon={<Bike />} label={common.labels.deliveryFee}>
          {restaurant.deliveryFee === 0 ? common.labels.free : formatPrice(restaurant.deliveryFee, locale)}
        </Term>
        <Term icon={<Clock />} label={common.labels.deliveryTime}>
          {restaurant.deliveryTime}
        </Term>
        <Term icon={<ShoppingBasket />} label={common.labels.minOrder}>
          {restaurant.minOrder > 0 ? formatPrice(restaurant.minOrder, locale) : "—"}
        </Term>
        <Term icon={<Banknote />} label={dict.delivery.payment}>
          {dict.delivery.paymentValue}
        </Term>
      </dl>
    </section>
  );
}

/**
 * Shown instead of the delivery terms when the restaurant is not a partner:
 * no online order, the visitor calls or writes to the restaurant (spec 5.4 option 1).
 */
export function OfflineOrderNotice({
  restaurant,
  common,
  dict,
}: {
  restaurant: RestaurantDetailDTO;
  common: CommonDict;
  dict: RestaurantsDict;
}) {
  return (
    <section
      aria-labelledby="offline-title"
      className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-line bg-canvas p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink-muted shadow-soft">
          <PhoneOff className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="offline-title" className="text-base font-bold text-ink">
            {dict.menu.offlineTitle}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{dict.menu.offlineText}</p>
        </div>
      </div>
      <ContactButtons
        contact={{ ...restaurant, website: null, instagram: null, facebook: null }}
        common={common}
        labels={dict.sheet}
        primary="call"
      />
    </section>
  );
}

function Term({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-brand-700 shadow-soft [&_svg]:size-[18px]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-semibold text-ink-subtle">{label}</dt>
        <dd className="mt-0.5 text-sm font-semibold text-ink">{children}</dd>
      </div>
    </div>
  );
}
