import "server-only";

import { z } from "zod";

import { DEFAULT_DELIVERY_TIME } from "@/components/admin/restaurants/labels";
import {
  checkbox,
  dateInput,
  governorate,
  idList,
  optionalEmail,
  optionalPriceInDinars,
  optionalText,
  optionalTunisianPhone,
  optionalUrl,
  priceInDinars,
  requiredText,
  slug,
  tunisianPhone,
} from "@/lib/validators";
import { DISH_COURSES, LISTED_GUARANTEE_LEVELS } from "@/types";
import type { DishInput, ImageChange, RestaurantInput } from "@/types/admin-data";

/* ==========================================================================
   Server-side validation of the restaurant and dish forms (zod 4).
   The browser checks are only a convenience: everything is checked again here.
   ========================================================================== */

/** "" or spaces → undefined, so optional fields can be left empty. */
const emptyToUndefined = (value: unknown) => (typeof value === "string" && value.trim() === "" ? undefined : value);

/** URL name typed by the admin, or null: the model then builds it from the name. */
const optionalSlug = z.preprocess(emptyToUndefined, slug.optional()).transform((value) => value ?? null);

/** Date of an <input type="date">, required, not in the future. */
const pastDate = (requiredMessage: string) =>
  z
    .string()
    .trim()
    .min(1, requiredMessage)
    .pipe(dateInput)
    .refine((date) => date.getTime() <= Date.now() + 36 * 60 * 60 * 1000, "La date ne peut pas être dans le futur.");

/** GPS coordinate typed as "36.8065" or "36,8065"; empty → null. */
const coordinate = (min: number, max: number, message: string) =>
  z
    .preprocess(
      (value) => (typeof value === "string" ? emptyToUndefined(value.trim().replace(",", ".")) : value),
      z.coerce.number({ error: message }).min(min, message).max(max, message).optional(),
    )
    .transform((value) => value ?? null);

/**
 * A field missing from the request (only possible with a hand-made request: browsers always
 * send every field) counts as empty, so the French messages ("Ce champ est obligatoire.") apply.
 */
export function withEmptyFields(fields: readonly string[], data: Record<string, string | string[]>) {
  return { ...Object.fromEntries(fields.map((field) => [field, ""])), ...data };
}

/* --------------------------------------------------------------------------
   Restaurant
   -------------------------------------------------------------------------- */

const restaurantFields = z.object({
  // Identité
  name: requiredText(120),
  slug: optionalSlug,
  cuisine: optionalText(80),
  description: optionalText(3000),
  descriptionAr: optionalText(3000),
  // Adresse (Tunisia lies between latitudes 30 and 38, longitudes 7 and 12)
  governorate,
  city: requiredText(80),
  address: requiredText(200),
  latitude: coordinate(30, 38, "Latitude invalide : un nombre entre 30 et 38 en Tunisie (ex. 36.8065)."),
  longitude: coordinate(7, 12, "Longitude invalide : un nombre entre 7 et 12 en Tunisie (ex. 10.1815)."),
  // Contacts
  phone: z.string().trim().min(1, "Le téléphone est obligatoire.").pipe(tunisianPhone),
  whatsapp: optionalTunisianPhone,
  email: optionalEmail,
  website: optionalUrl,
  instagram: optionalText(200),
  facebook: optionalText(200),
  // Horaires
  openingHours: optionalText(300),
  // Garantie & pratiques
  // Policy "100 % sans gluten only": the older levels (NATURALLY_GF, TRACES_RISK) can no longer be chosen
  guaranteeLevel: z.enum(LISTED_GUARANTEE_LEVELS, { error: "Choisissez un niveau de garantie." }),
  dedicatedKitchen: checkbox,
  dedicatedUtensils: checkbox,
  trainedStaff: checkbox,
  // Vérification (spec 6.1: no sheet without a source and a date)
  verificationSource: requiredText(200),
  verifiedAt: pastDate("Indiquez la date de la vérification."),
  // Convention & livraison
  isPartner: checkbox,
  partnerSince: z
    .preprocess(emptyToUndefined, dateInput.optional())
    .transform((value) => value ?? null)
    .refine((date) => date === null || date.getTime() <= Date.now() + 36 * 60 * 60 * 1000, "La date ne peut pas être dans le futur."),
  // No delivery fee: delivery is free for the customer (the column is saved as 0).
  deliveryTime: optionalText(40),
  minOrder: optionalPriceInDinars,
  priceRange: z.coerce
    .number({ error: "Choisissez une gamme de prix." })
    .int("Choisissez une gamme de prix.")
    .min(1, "Choisissez une gamme de prix.")
    .max(3, "Choisissez une gamme de prix."),
  // Publication
  isActive: checkbox,
});

/** Names of the text fields of the restaurant form (see withEmptyFields). */
export const RESTAURANT_FIELD_NAMES = Object.keys(restaurantFields.shape);

export const restaurantFormSchema = restaurantFields.superRefine((data, ctx) => {
  if ((data.latitude === null) !== (data.longitude === null)) {
    const path = data.latitude === null ? "latitude" : "longitude";
    ctx.addIssue({ code: "custom", path: [path], message: "Indiquez la latitude ET la longitude (ou aucune des deux)." });
  }
  // Ordering online needs the delivery delay.
  if (data.isPartner && data.deliveryTime === null) {
    ctx.addIssue({ code: "custom", path: ["deliveryTime"], message: "Indiquez le délai de livraison (ex. 30–45 min)." });
  }
});

export type RestaurantFormData = z.output<typeof restaurantFormSchema>;

/** Validated form (+ what to do with the photo and the logo) → what models/posters|puters/restaurants expect. */
export function toRestaurantInput(data: RestaurantFormData, image: ImageChange, logo: ImageChange): RestaurantInput {
  return {
    ...data,
    deliveryTime: data.deliveryTime ?? DEFAULT_DELIVERY_TIME,
    minOrder: data.minOrder ?? 0,
    image,
    logo,
  };
}

/* --------------------------------------------------------------------------
   Dish
   -------------------------------------------------------------------------- */

const dishFields = z.object({
  name: requiredText(120),
  nameAr: optionalText(120),
  description: optionalText(1000),
  descriptionAr: optionalText(1000),
  course: z.enum(DISH_COURSES, { error: "Choisissez la partie du menu." }),
  price: z
    .string()
    .trim()
    .min(1, "Indiquez le prix.")
    .pipe(priceInDinars)
    .refine((millimes) => millimes > 0, "Le prix doit être supérieur à 0."),
  isAvailable: checkbox,
  sortOrder: z.preprocess(
    (value) => emptyToUndefined(value) ?? "0",
    z.coerce
      .number({ error: "Nombre entier attendu (0, 1, 2…)." })
      .int("Nombre entier attendu (0, 1, 2…).")
      .min(0, "Entre 0 et 999.")
      .max(999, "Entre 0 et 999."),
  ),
  ingredientIds: idList.refine((ids) => ids.length <= 60, "60 ingrédients au maximum."),
});

export const dishFormSchema = dishFields;

/** Names of the text fields of the dish form (the ingredient list is an array: left out). */
export const DISH_FIELD_NAMES = Object.keys(dishFields.shape).filter((field) => field !== "ingredientIds");

export type DishFormData = z.output<typeof dishFormSchema>;

export function toDishInput(data: DishFormData, image: ImageChange): DishInput {
  return { ...data, image };
}
