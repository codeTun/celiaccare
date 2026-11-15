import {
  Carrot,
  Flag,
  Inbox,
  LayoutDashboard,
  Package,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Tags,
  Truck,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

/**
 * The sections of the admin panel, as shown in the sidebar (and the mobile menu).
 * To add a section: add a line here, then create app/admin/(dashboard)/<folder>/page.tsx.
 */
export type AdminNavItem = { href: string; label: string; icon: LucideIcon };
export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Activité",
    items: [
      { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/admin/commandes", label: "Commandes", icon: ShoppingBag },
      { href: "/admin/livraisons", label: "Livraisons", icon: Truck },
      { href: "/admin/clients", label: "Clients", icon: Users },
    ],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/admin/produits", label: "Produits", icon: Package },
      { href: "/admin/categories", label: "Catégories", icon: Tags },
      { href: "/admin/ingredients", label: "Ingrédients", icon: Carrot },
      { href: "/admin/artisans", label: "Artisans", icon: Store },
      { href: "/admin/restaurants", label: "Restaurants", icon: UtensilsCrossed },
    ],
  },
  {
    label: "Communauté",
    items: [
      { href: "/admin/messages", label: "Messages", icon: Inbox },
      { href: "/admin/signalements", label: "Signalements", icon: Flag },
      { href: "/admin/avis", label: "Avis", icon: Star },
    ],
  },
  {
    label: "Compte",
    items: [{ href: "/admin/securite", label: "Sécurité", icon: ShieldCheck }],
  },
];

/** Is this link the current section? "/admin" only matches itself; others also match their sub-pages. */
export function isAdminNavItemActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The section of the current page (for the top bar title), or null. */
export function findAdminNavItem(pathname: string | null): AdminNavItem | null {
  for (const group of ADMIN_NAV) {
    const item = group.items.find((entry) => isAdminNavItemActive(entry.href, pathname));
    if (item) return item;
  }
  return null;
}
