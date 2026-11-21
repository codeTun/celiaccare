/**
 * Public information about CeliacCare, used in the footer, the contact
 * page, SEO tags and JSON-LD. Edit these values before going live.
 */
export const siteConfig = {
  name: "CeliacCare",
  shortName: "CeliacCare",
  // Demo notice on every public page, the checkout and the order confirmation (texts: dict.common.demo).
  // Turned off by the owner: CeliacCare receives every order and handles it with the businesses.
  demoMode: false as boolean,
  // true only once partnership agreements are signed: the home brand carousel then says "Nos partenaires"
  // instead of "Ils font le sans gluten en Tunisie". The listed businesses have not signed yet.
  partnersSigned: false as boolean,
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
  // Business model: customers pay only the merchants' prices and delivery is always free.
  // CeliacCare earns this share of each order's merchandise subtotal, paid by the shop or restaurant.
  commissionRate: 0.15,
} as const;

export type SiteConfig = typeof siteConfig;
