import type { RestaurantsDict } from "@/i18n/resources/fr/restaurants";

/**
 * Texts of the shared "fiche adresse" blocks (InfoSheet, MapEmbed, ContactButtons...).
 * Pages pass `dict.restaurants.sheet` or `dict.producers.sheet` (both have these keys).
 */
export type SheetLabels = RestaurantsDict["sheet"];
