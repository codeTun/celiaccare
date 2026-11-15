import {
  Amphora,
  CakeSlice,
  Candy,
  ChefHat,
  Coffee,
  CookingPot,
  Cookie,
  Croissant,
  CupSoda,
  IceCreamCone,
  Leaf,
  Milk,
  Nut,
  Package,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  Soup,
  Sprout,
  TreePalm,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

import type { CategoryIconKey } from "./category-icons";

/**
 * Icons that admins can choose for a category (spec §6.3: one distinct icon per category).
 * The key is stored in the database (Category.icon).
 */
export const CATEGORY_ICONS: Record<CategoryIconKey, { icon: LucideIcon; label: string }> = {
  bread: { icon: Croissant, label: "Pain & viennoiseries" },
  pastry: { icon: CakeSlice, label: "Pâtisserie" },
  biscuits: { icon: Cookie, label: "Biscuits" },
  couscous: { icon: CookingPot, label: "Couscous & pâtes" },
  soup: { icon: Soup, label: "Soupes & bsissa" },
  flour: { icon: Sprout, label: "Farines & céréales" },
  pantry: { icon: Amphora, label: "Épicerie & condiments" },
  nuts: { icon: Nut, label: "Fruits secs & pâtes à tartiner" },
  dates: { icon: TreePalm, label: "Dattes" },
  sweets: { icon: Candy, label: "Confiseries" },
  breakfast: { icon: Coffee, label: "Petit-déjeuner" },
  snacks: { icon: Popcorn, label: "Snacks" },
  drinks: { icon: CupSoda, label: "Boissons" },
  dairy: { icon: Milk, label: "Produits laitiers" },
  meals: { icon: UtensilsCrossed, label: "Plats préparés" },
  salad: { icon: Salad, label: "Salades" },
  pizza: { icon: Pizza, label: "Pizzas" },
  sandwich: { icon: Sandwich, label: "Sandwichs" },
  icecream: { icon: IceCreamCone, label: "Glaces" },
  chef: { icon: ChefHat, label: "Cuisine" },
  leaf: { icon: Leaf, label: "Naturel" },
  package: { icon: Package, label: "Autre" },
};

export function getCategoryIcon(key: string | null | undefined): LucideIcon {
  return (key && CATEGORY_ICONS[key as CategoryIconKey]?.icon) || Package;
}
