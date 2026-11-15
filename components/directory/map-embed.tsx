import { MapPin, MapPinned, Navigation } from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { interpolate } from "@/i18n/interpolate";
import type { CommonDict } from "@/i18n/resources/fr/common";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

import type { SheetLabels } from "./labels";
import { directionsUrl, osmEmbedUrl, osmPageUrl, type MapPlace } from "./links";
import { placeLabel } from "./place";

const externalLink = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Small OpenStreetMap map of the place (loaded only when it scrolls into view)
 * + an "Itinéraire" button opening Google Maps directions.
 * Without GPS position, a placeholder is shown and the directions use the address.
 */
export function MapEmbed({
  place,
  locale,
  common,
  labels,
  className,
}: {
  place: MapPlace & { name: string };
  locale: Locale;
  common: CommonDict;
  labels: SheetLabels;
  className?: string;
}) {
  const { latitude, longitude } = place;
  const hasPosition = latitude != null && longitude != null;

  return (
    <section
      aria-labelledby="map-title"
      className={cn("overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-soft", className)}
    >
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <h2 id="map-title" className="flex items-center gap-2 text-base font-bold text-ink">
          <MapPinned className="size-[18px] text-brand-600" aria-hidden="true" />
          {labels.map.title}
        </h2>
        {hasPosition ? (
          <a
            href={osmPageUrl(latitude, longitude)}
            {...externalLink}
            className="text-xs font-semibold text-brand-700 underline-offset-4 hover:underline"
          >
            {labels.map.enlarge}
          </a>
        ) : null}
      </div>

      {hasPosition ? (
        <iframe
          src={osmEmbedUrl(latitude, longitude)}
          title={interpolate(labels.map.frameTitle, { name: place.name })}
          loading="lazy"
          className="block aspect-[4/3] w-full border-y border-line bg-canvas"
        />
      ) : (
        <div className="grid aspect-[4/3] place-items-center border-y border-line bg-canvas bg-khatam px-6 text-center">
          <div>
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-white text-brand-600 shadow-soft">
              <MapPin className="size-5" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">{labels.map.noPosition}</p>
            <p className="mt-1 text-xs text-ink-muted">{labels.map.noPositionText}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch xl:flex-row xl:items-center">
        <p className="flex min-w-0 items-start gap-2 text-sm text-ink-muted">
          <MapPin className="mt-0.5 size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
          <span>
            {place.address ? (
              <>
                <bdi>{place.address}</bdi>
                {locale === "ar" ? "، " : ", "}
              </>
            ) : null}
            {placeLabel(place.city, place.governorate, locale)}
          </span>
        </p>
        <a
          href={directionsUrl(place)}
          {...externalLink}
          className={buttonStyles({ variant: "secondary", size: "sm", className: "shrink-0" })}
        >
          <Navigation className="rtl:-scale-x-100" aria-hidden="true" />
          {common.actions.directions}
        </a>
      </div>
    </section>
  );
}
