import { z } from "zod";

import { tunisDayKey } from "@/lib/tunisia";
import { dateInput, priceInDinars, slug } from "@/lib/validators";

import { parseCoordinate, TUNISIA_BOUNDS } from "./coordinates";

/* ==========================================================================
   zod field schemas shared by the catalogue Server Actions, built on the
   project validators (lib/validators.ts). Messages are in French: they are
   shown under the fields.
   ========================================================================== */

const emptyToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

/** URL name typed by the admin. Left empty → null: the model builds it from the name. */
export const optionalSlug = z.preprocess(emptyToUndefined, slug.optional()).transform((value) => value ?? null);

/** A choice in a <select> of ids (category, artisan…). */
export function requiredId(message: string) {
  return z.coerce.number({ error: message }).int(message).positive(message);
}

/** Display order: 0 comes first. Left empty → 0. */
export const sortOrder = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number({ error: "Nombre entier attendu (ex. 3)." })
    .int("Nombre entier attendu (ex. 3).")
    .min(0, "0 minimum.")
    .max(9999, "9999 maximum.")
    .default(0),
);

const MISSING_DATE = "Indiquez la date de la vérification.";

/** Day of the last verification of a sheet (spec 6.1): required, not after today (Tunis time). */
export const verificationDate = z
  .string({ error: MISSING_DATE })
  .trim()
  .min(1, MISSING_DATE)
  .refine((day) => !/^\d{4}-\d{2}-\d{2}$/.test(day) || day <= tunisDayKey(), "La date de vérification ne peut pas être dans le futur.")
  .pipe(dateInput)
  .refine((date) => date.getUTCFullYear() >= 2000, "Date trop ancienne : vérifiez l'année.");

/** Price of a product in dinars ("12,500") → millimes, more than 0. */
export const productPrice = priceInDinars
  .refine((millimes) => millimes > 0, "Indiquez un prix supérieur à 0.")
  .refine((millimes) => millimes <= 100_000_000, "Prix trop élevé.");

/** Website: "dar-bsissa.tn" is accepted and saved as "https://dar-bsissa.tn". Left empty → null. */
export const websiteUrl = z
  .string()
  .trim()
  .max(300, "300 caractères maximum.")
  .optional()
  .transform((value) => {
    if (!value) return null;
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  })
  .refine(
    (value) => value === null || /^https?:\/\/[^\s/]+\.[^\s/]{2,}(\/\S*)?$/i.test(value),
    "Lien invalide : saisissez une adresse comme dar-bsissa.tn ou https://dar-bsissa.tn.",
  );

/** Instagram / Facebook: an account name ("@dar.bsissa") or a full link (https://…). */
export const socialAccount = z
  .string()
  .trim()
  .max(200, "200 caractères maximum.")
  .optional()
  .transform((value) => value || null)
  .refine(
    (value) => value === null || /^https?:\/\/\S+$/i.test(value) || /^@?[\w.-]{1,100}$/.test(value),
    "Saisissez le nom du compte (ex. @dar.bsissa) ou le lien complet (https://…).",
  );

/** Latitude or longitude in decimal degrees, within Tunisia. Left empty → null. */
export function coordinate(kind: "latitude" | "longitude") {
  const isLatitude = kind === "latitude";
  const min = isLatitude ? TUNISIA_BOUNDS.latMin : TUNISIA_BOUNDS.lngMin;
  const max = isLatitude ? TUNISIA_BOUNDS.latMax : TUNISIA_BOUNDS.lngMax;
  const message = `${isLatitude ? "Latitude" : "Longitude"} invalide pour la Tunisie : un nombre entre ${min} et ${max} (ex. ${
    isLatitude ? "36.8065" : "10.1815"
  }).`;
  return z
    .string()
    .optional()
    .transform((text, ctx) => {
      if (!text?.trim()) return null;
      const value = parseCoordinate(text);
      if (value === null || value < min || value > max) {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      return Math.round(value * 1_000_000) / 1_000_000; // 6 decimals ≈ 10 cm, plenty
    });
}
