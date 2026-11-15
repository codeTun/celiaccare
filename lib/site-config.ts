/**
 * Public information about CeliacCare, used in the footer, the contact
 * page, SEO tags and JSON-LD. Edit these values before going live.
 */
export const siteConfig = {
  name: "CeliacCare",
  shortName: "CeliacCare",
  // Contact details (placeholders — replace with the real ones)
  email: "contact@celiaccare.tn",
  phone: "+216 70 000 000",
  whatsapp: "21670000000", // international format without "+", used for wa.me links
  city: "Tunis",
  country: "TN",
  address: "Tunis, Tunisie",
  openingHours: "Lun – Sam · 9h – 18h",
  openingHoursAr: "من الإثنين إلى السبت · 9:00 – 18:00",
  // Social networks: leave empty to hide the icon
  instagram: "",
  facebook: "",
  // Personal data (law n° 2004-63): delivery data is kept 90 days after delivery
  deliveryDataRetentionDays: 90,
} as const;

export type SiteConfig = typeof siteConfig;
