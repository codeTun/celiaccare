"use client";

import { ExternalLink } from "lucide-react";
import { useRef, useState, type ClipboardEvent } from "react";

import { TextField } from "@/components/ui/form";

import { parseCoordinate, splitCoordinates } from "./coordinates";

/**
 * Latitude + longitude of an address. Pasting what Google Maps copies
 * ("36.80649, 10.18153") into either field fills both. When both are set,
 * a link opens the spot on Google Maps to check it.
 * Sends "latitude" and "longitude" (decimal degrees, "," or "." accepted).
 */
export function CoordinatesFields({
  latitude,
  longitude,
  errors,
}: {
  latitude: string;
  longitude: string;
  errors?: { latitude?: string[]; longitude?: string[] };
}) {
  const latitudeRef = useRef<HTMLInputElement>(null);
  const longitudeRef = useRef<HTMLInputElement>(null);
  const [point, setPoint] = useState({ latitude, longitude });

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pair = splitCoordinates(event.clipboardData.getData("text"));
    if (!pair || !latitudeRef.current || !longitudeRef.current) return;
    event.preventDefault();
    latitudeRef.current.value = pair[0];
    longitudeRef.current.value = pair[1];
    setPoint({ latitude: pair[0], longitude: pair[1] });
  }

  const lat = parseCoordinate(point.latitude);
  const lng = parseCoordinate(point.longitude);
  const mapHref = lat !== null && lng !== null ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null;
  const hint = "Sur Google Maps : clic droit sur le lieu → cliquez sur les coordonnées pour les copier, puis collez-les ici.";

  return (
    <div className="space-y-2 sm:col-span-2">
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          ref={latitudeRef}
          name="latitude"
          label="Latitude"
          inputMode="decimal"
          autoComplete="off"
          placeholder="36.8065"
          defaultValue={latitude}
          error={errors?.latitude}
          hint={hint}
          onPaste={onPaste}
          onChange={(event) => setPoint((current) => ({ ...current, latitude: event.target.value }))}
          className="tabular"
        />
        <TextField
          ref={longitudeRef}
          name="longitude"
          label="Longitude"
          inputMode="decimal"
          autoComplete="off"
          placeholder="10.1815"
          defaultValue={longitude}
          error={errors?.longitude}
          onPaste={onPaste}
          onChange={(event) => setPoint((current) => ({ ...current, longitude: event.target.value }))}
          className="tabular"
        />
      </div>
      {mapHref ? (
        <a
          href={mapHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
        >
          Vérifier l&apos;emplacement sur Google Maps
          <ExternalLink className="size-3.5" aria-hidden="true" />
          <span className="sr-only">(nouvel onglet)</span>
        </a>
      ) : null}
    </div>
  );
}
