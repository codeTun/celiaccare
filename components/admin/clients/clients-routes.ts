import { ShieldBan, ShieldX, Users } from "lucide-react";

import type { SectionTab } from "@/components/admin/orders/section-tabs";

/* Pages, tabs and confirmation messages of the "Clients" section (spec EF-35 → EF-39). */

export const CLIENTS_PATH = "/admin/clients";
export const RULES_PATH = "/admin/clients/regles";
export const ATTEMPTS_PATH = "/admin/clients/tentatives";

/** The three pages of the section (SectionTabs). */
export const CLIENTS_TABS: SectionTab[] = [
  { href: CLIENTS_PATH, label: "Clients", icon: Users },
  { href: RULES_PATH, label: "Règles téléphone", icon: ShieldBan },
  { href: ATTEMPTS_PATH, label: "Tentatives refusées", icon: ShieldX },
];

/** ?ok=<code> messages of the customers page. */
export const CLIENTS_FLASH_MESSAGES: Record<string, string> = {
  anonymized: "Nettoyage terminé : les données personnelles de plus de 90 jours ont été effacées.",
};

/** ?ok=<code> messages of the phone rules pages. */
export const RULES_FLASH_MESSAGES: Record<string, string> = {
  created: "La règle a été créée : elle s'applique dès la prochaine commande.",
  replaced: "Ce numéro avait déjà une règle : elle a été remplacée par la nouvelle.",
  updated: "La règle a été enregistrée.",
  deleted: "La règle a été supprimée : le numéro revient à la limite normale de 3 commandes par jour.",
};
