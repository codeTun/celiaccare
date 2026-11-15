import { Banknote, ChevronDown, Truck } from "lucide-react";

import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import type { ProductsDict } from "@/i18n/resources/fr/products";
import { formatPrice } from "@/lib/format";
import { governorateLabel } from "@/lib/tunisia";
import type { DeliveryZoneDTO, Locale } from "@/types";

import { pluralize } from "./plural";

/**
 * Delivery zones, fees, delays and payment methods, shown before ordering (spec 5.4).
 * The full list of zones opens in a <details> (works without JavaScript). Server Component.
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
  const lowestFee = zones.length > 0 ? Math.min(...zones.map((zone) => zone.fee)) : null;
  // Free delivery above an amount is set per zone (some zones have none): only promise it
  // without "selon la zone" when every paying zone has the same threshold.
  const paidZones = zones.filter((zone) => zone.fee > 0);
  const freeThresholds = paidZones.flatMap((zone) => (zone.freeFrom !== null ? [zone.freeFrom] : []));
  const lowestFreeFrom = freeThresholds.length > 0 ? Math.min(...freeThresholds) : null;
  const freeEverywhere =
    freeThresholds.length === paidZones.length && freeThresholds.every((amount) => amount === lowestFreeFrom);

  return (
    <section aria-labelledby="delivery-title" className="rounded-[var(--radius-card)] border border-line bg-white p-5">
      <h2 id="delivery-title" className="flex items-center gap-2 text-base font-bold text-ink">
        <Truck className="size-5 text-brand-600" aria-hidden="true" />
        {labels.deliveryTitle}
      </h2>

      <ul className="mt-3 flex flex-col gap-1.5 text-sm leading-relaxed text-ink-muted">
        <li>{zones.length > 0 ? pluralize(locale, zones.length, labels.deliveryZones) : labels.deliveryNone}</li>
        {/* a free zone is shown in the table below ("Gratuite") */}
        {lowestFee !== null && lowestFee > 0 ? (
          <li>{interpolate(labels.deliveryFeeFrom, { fee: formatPrice(lowestFee, locale) })}</li>
        ) : null}
        {lowestFreeFrom !== null ? (
          <li>
            {interpolate(freeEverywhere ? labels.deliveryFree : labels.deliveryFreeByZone, {
              amount: formatPrice(lowestFreeFrom, locale),
            })}
          </li>
        ) : null}
        <li className="mt-1 flex items-start gap-2 font-medium text-ink">
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
                    {common.labels.deliveryFee}
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
                    <td className="py-2 text-end font-semibold text-ink tabular">
                      {zone.fee === 0 ? common.labels.free : formatPrice(zone.fee, locale)}
                      {zone.freeFrom !== null && zone.fee > 0 ? (
                        <span className="block text-xs font-normal text-brand-700">
                          {interpolate(labels.deliveryFreeFrom, { amount: formatPrice(zone.freeFrom, locale) })}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2 ps-2 text-end text-ink-muted">{zone.delay}</td>
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
