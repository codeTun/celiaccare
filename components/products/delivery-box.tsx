import { Banknote, ChevronDown, Gift, Truck } from "lucide-react";

import type { CommonDict } from "@/i18n/resources/fr/common";
import type { ProductsDict } from "@/i18n/resources/fr/products";
import { governorateLabel } from "@/lib/tunisia";
import type { DeliveryZoneDTO, Locale } from "@/types";

import { pluralize } from "./plural";

/**
 * Delivery zones, delays and payment methods, shown before ordering (spec 5.4). Delivery is
 * free everywhere we deliver. The full list of zones opens in a <details> (works without
 * JavaScript). Server Component.
 */
export function DeliveryBox({
  locale,
  zones,
  labels,
  common,
}: {
  locale: Locale;
  zones: DeliveryZoneDTO[];
  labels: ProductsDict["sheet"];
  common: CommonDict;
}) {
  return (
    <section aria-labelledby="delivery-title" className="rounded-[var(--radius-card)] border border-line bg-white p-5">
      <h2 id="delivery-title" className="flex items-center gap-2 text-base font-bold text-ink">
        <Truck className="size-5 text-brand-600" aria-hidden="true" />
        {labels.deliveryTitle}
      </h2>

      <ul className="mt-3 flex flex-col gap-1.5 text-sm leading-relaxed text-ink-muted">
        <li>{zones.length > 0 ? pluralize(locale, zones.length, labels.deliveryZones) : labels.deliveryNone}</li>
        {zones.length > 0 ? (
          <li className="flex items-start gap-2 font-semibold text-brand-700">
            <Gift className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {labels.deliveryFree}
          </li>
        ) : null}
        <li className="flex items-start gap-2 font-medium text-ink">
          <Banknote className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          {labels.payment}
        </li>
      </ul>

      {zones.length > 0 ? (
        <details className="group mt-4 rounded-2xl bg-canvas">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50 [&::-webkit-details-marker]:hidden">
            {labels.deliveryZonesToggle}
            <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="max-h-72 overflow-y-auto px-4 pb-3">
            <table className="w-full text-start text-sm">
              <thead>
                <tr className="text-xs text-ink-subtle">
                  <th scope="col" className="py-1.5 text-start font-semibold">
                    {common.labels.governorate}
                  </th>
                  <th scope="col" className="py-1.5 text-end font-semibold">
                    {common.labels.deliveryTime}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td className="py-2 pe-2 text-ink">{governorateLabel(zone.governorate, locale)}</td>
                    <td className="py-2 ps-2 text-end text-ink-muted">
                      <bdi>{zone.delay}</bdi>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      ) : null}
    </section>
  );
}
