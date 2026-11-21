import { Croissant, Factory, House, ShoppingBasket, Sprout, Store, type LucideIcon } from "lucide-react";

import type { ProducerType } from "@/types";

/** One distinct icon per kind of small business (spec 6.3). */
export const PRODUCER_TYPE_ICONS: Record<ProducerType, LucideIcon> = {
  BAKERY: Croissant, // pâtisseries & boulangeries
  SPECIALTY_SHOP: Store, // boutiques spécialisées
  GROCERY: ShoppingBasket, // épiceries
  HOME_SELLER: House, // vendeurs à domicile (fait maison)
  COOPERATIVE: Sprout, // coopératives
  MANUFACTURER: Factory, // fabricants / petites marques sans gluten
};
