import type { DishCourse, GuaranteeLevel } from "@/types";

/* ==========================================================================
   French texts of the restaurant & menu admin pages (enums → labels).
   Same wording as the public site (i18n/resources/fr/common.ts).
   ========================================================================== */

export const GUARANTEE_LABELS: Record<GuaranteeLevel, { label: string; short: string; description: string }> = {
  CERTIFIED: {
    label: "Certifié sans gluten",
    short: "Certifié",
    description: "Certification officielle vérifiée (logo, organisme et numéro).",
  },
  NATURALLY_GF: {
    label: "Naturellement sans gluten",
    short: "Sans gluten",
    description: "Recettes sans gluten préparées avec précautions, sans certification officielle.",
  },
  TRACES_RISK: {
    label: "Risque de traces",
    short: "Traces possibles",
    description: "Aucun ingrédient à gluten, mais cuisine partagée : contamination possible.",
  },
};

/** Courses of a menu, in menu order (DISH_COURSES). */
export const COURSE_LABELS: Record<DishCourse, { plural: string; singular: string; add: string; empty: string }> = {
  STARTER: { plural: "Entrées", singular: "Entrée", add: "Ajouter une entrée", empty: "Aucune entrée pour l'instant" },
  MAIN: { plural: "Plats", singular: "Plat", add: "Ajouter un plat", empty: "Aucun plat pour l'instant" },
  DESSERT: { plural: "Desserts", singular: "Dessert", add: "Ajouter un dessert", empty: "Aucun dessert pour l'instant" },
  DRINK: { plural: "Boissons", singular: "Boisson", add: "Ajouter une boisson", empty: "Aucune boisson pour l'instant" },
};

/** Placeholder icon (lib/icons.ts) of a dish without a photo, per course. */
export const COURSE_ICONS: Record<DishCourse, string> = {
  STARTER: "salad",
  MAIN: "meals",
  DESSERT: "pastry",
  DRINK: "drinks",
};

/** Placeholder icon (lib/icons.ts) of a restaurant without a photo. */
export const RESTAURANT_ICON = "chef";

/** Restaurant.priceRange: 1 = €, 2 = €€, 3 = €€€. */
export const PRICE_RANGE_LABELS: Record<1 | 2 | 3, string> = {
  1: "Petit budget",
  2: "Prix moyens",
  3: "Haut de gamme",
};

export function priceRangeLabel(value: number) {
  return value === 1 || value === 2 || value === 3 ? PRICE_RANGE_LABELS[value] : String(value);
}

/** Value saved for a restaurant whose delivery time was left empty (same default as the database). */
export const DEFAULT_DELIVERY_TIME = "30–45 min";
