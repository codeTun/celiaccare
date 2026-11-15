import { formatPhone } from "@/lib/format";
import { normalizeTunisianPhone } from "@/lib/tunisia";

/* ==========================================================================
   Links of the restaurant and artisan sheets: phone calls, WhatsApp, websites,
   social networks and maps. Plain functions (no React), safe anywhere.
   ========================================================================== */

/** "20123456" -> "tel:+21620123456" (a number in another format is kept as typed). */
export function telHref(phone: string) {
  const local = normalizeTunisianPhone(phone);
  return local ? `tel:+216${local}` : `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** WhatsApp chat link: "20123456" -> "https://wa.me/21620123456". */
export function whatsappHref(phone: string) {
  const local = normalizeTunisianPhone(phone);
  return `https://wa.me/${local ? `216${local}` : phone.replace(/\D/g, "")}`;
}

/** Phone number for display: "20123456" -> "+216 20 123 456". Always show it inside dir="ltr". */
export function displayPhone(phone: string) {
  const local = normalizeTunisianPhone(phone);
  return local ? `+216 ${formatPhone(local)}` : phone;
}

/** Makes sure a website address starts with https:// ("dar-bsissa.tn" -> "https://dar-bsissa.tn"). */
export function websiteUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/** Short text for a link: "https://www.dar-bsissa.tn/" -> "dar-bsissa.tn". */
export function shortUrl(value: string) {
  return value
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

/** Instagram: accepts a full link or an account name ("@dar.bsissa"). */
export function instagramUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.instagram.com/${encodeURIComponent(value.trim().replace(/^@/, ""))}`;
}

/** Facebook: accepts a full link or a page name ("darbsissa"). */
export function facebookUrl(value: string) {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://www.facebook.com/${encodeURIComponent(value.trim().replace(/^@/, ""))}`;
}

/** The place shown on a map. */
export type MapPlace = {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  city: string;
  governorate: string;
};

/**
 * OpenStreetMap map centred on the place, with a marker
 * (the Content-Security-Policy in next.config.ts allows frames from www.openstreetmap.org).
 */
export function osmEmbedUrl(latitude: number, longitude: number) {
  const box = [longitude - 0.006, latitude - 0.004, longitude + 0.006, latitude + 0.004]
    .map((value) => value.toFixed(5))
    .join(",");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${box}&layer=mapnik&marker=${latitude.toFixed(5)},${longitude.toFixed(5)}`;
}

/** The same place in a bigger map on openstreetmap.org. */
export function osmPageUrl(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

/** Google Maps directions to the place: the GPS position when we have it, otherwise the address. */
export function directionsUrl(place: MapPlace) {
  const destination =
    place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : [place.address, place.city, place.governorate, "Tunisie"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
