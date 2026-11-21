/**
 * The businesses shown in the brand band at the bottom of the home page
 * (models/fetchers/brands.ts → components/sections/home/brand-marquee.tsx).
 * Same rules as the other public DTOs: plain JSON values, already translated.
 */
export type BrandDTO = {
  kind: "producer" | "restaurant";
  slug: string;
  /** The business name (the same in both languages). */
  name: string;
  /** Its page on the website, with the locale: "/fr/artisans/glutella", "/ar/restaurants/inward". */
  href: string;
  /** Short, translated type: "Fabricant", "Boulangerie-pâtisserie", "Restaurant"... */
  typeLabel: string;
  city: string;
  /** Official logo (Cloudinary), uploaded by the admin with the business's agreement. Null → a monogram is drawn. */
  logoUrl: string | null;
};
