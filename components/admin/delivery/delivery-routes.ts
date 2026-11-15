import { ListTodo, MapPinned, Users } from "lucide-react";

import type { SectionTab } from "@/components/admin/orders/section-tabs";

/* Pages, tabs and confirmation messages of the "Livraisons" section (board, zones, delivery people). */

export const DELIVERIES_PATH = "/admin/livraisons";
export const ZONES_PATH = "/admin/livraisons/zones";
export const DELIVERERS_PATH = "/admin/livraisons/livreurs";

/** The three pages of the section (SectionTabs). */
export const DELIVERY_TABS: SectionTab[] = [
  { href: DELIVERIES_PATH, label: "En cours", icon: ListTodo },
  { href: ZONES_PATH, label: "Zones de livraison", icon: MapPinned },
  { href: DELIVERERS_PATH, label: "Livreurs", icon: Users },
];

/** ?ok=<code> messages of the zones pages (they replace the generic DEFAULT_FLASH_MESSAGES). */
export const ZONE_FLASH_MESSAGES: Record<string, string> = {
  created: "La zone de livraison a été créée.",
  updated: "La zone de livraison a été enregistrée.",
  deleted: "La zone de livraison a été supprimée.",
};

/** ?ok=<code> messages of the delivery people pages. */
export const DELIVERER_FLASH_MESSAGES: Record<string, string> = {
  created: "Le livreur a été ajouté.",
  updated: "La fiche du livreur a été enregistrée.",
  deleted: "Le livreur a été supprimé. Ses commandes passées restent dans l'historique.",
};
