import type { Metadata } from "next";
import { notFound } from "next/navigation";

/**
 * Catch-all route: any unknown URL under /fr/... or /ar/... (for example
 * /fr/n-importe-quoi) shows the localized 404 page of app/[lang]/not-found.tsx,
 * with the site navbar and footer, instead of the bare global 404.
 * Real pages (/fr/produits...) are more specific and always win over this one.
 */

// This page never renders anything, so there is no "instant navigation" to check
// (otherwise the dev server reports that the 404 prevented that check).
export const instant = false;

// Throwing here too makes Next.js use the title of not-found.tsx ("Page introuvable").
export function generateMetadata(): Metadata {
  notFound();
}

export default function UnknownPage(): never {
  notFound();
}
