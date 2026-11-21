import { localePath } from "@/i18n/config";
import { MESSAGE_TOPICS, type Locale, type MessageTopic } from "@/types";

/* ==========================================================================
   Contact page URLs: /fr/contact?sujet=commande&artisan=lilydelights#formulaire
   Plain functions (no React, no server code). The contact page reads these
   parameters to open its form on the right topic; the restaurant, artisan and
   product pages build their "Demander sur CeliacCare" links with orderRequestHref().

   Every purchase goes through CeliacCare: a visitor who wants something that
   cannot be ordered online yet writes to us, and our team contacts the business.
   The business (or product) is given by its SLUG, never by its name: the contact
   page looks the name up among the published businesses, so a link can never make
   our form or our notice show words of its own (a phone number, a website, a scam...).
   ========================================================================== */

/** ?sujet= accepts the MessageTopic values (?sujet=PARTNERSHIP) and these French words. */
const TOPIC_WORDS = new Map<string, MessageTopic>([
  ["question", "GENERAL"],
  ["partenariat", "PARTNERSHIP"],
  ["commande", "ORDER"],
  ["adresse", "SUGGESTION"],
  ["autre", "OTHER"],
]);

/** What a "Demander sur CeliacCare" link is about: an artisan, a restaurant, or one product (and its artisan). */
export type OrderRequestTarget = { kind: "artisan" | "restaurant" | "product"; slug: string };

/** URL parameter of each kind: ?artisan=…, ?restaurant=…, ?produit=… */
const TARGET_PARAMS: Record<OrderRequestTarget["kind"], string> = {
  artisan: "artisan",
  restaurant: "restaurant",
  product: "produit",
};

/** What Next.js gives for one URL parameter (an array when the parameter is repeated). */
type ParamValue = string | string[] | undefined;

function firstValue(value: ParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

/** ?sujet=commande -> "ORDER", ?sujet=partnership -> "PARTNERSHIP"; null when missing or unknown. */
export function topicFromParam(value: ParamValue): MessageTopic | null {
  const text = firstValue(value)?.trim().slice(0, 30);
  if (!text) return null;
  const upper = text.toUpperCase();
  return MESSAGE_TOPICS.find((topic) => topic === upper) ?? TOPIC_WORDS.get(text.toLowerCase()) ?? null;
}

/** A slug from the URL ("tik-tak-family"): lower-case letters, digits and dashes only, at most 100 characters. */
function slugFromParam(value: ParamValue): string | null {
  const text = firstValue(value)?.trim().toLowerCase();
  return text && /^[a-z0-9-]{1,100}$/.test(text) ? text : null;
}

/**
 * The artisan, restaurant or product named in the URL (?produit= first, then ?artisan=, then ?restaurant=),
 * or null. Only its slug: the page still has to find it among the published ones.
 */
export function orderTargetFromParams(params: Partial<Record<string, ParamValue>>): OrderRequestTarget | null {
  for (const kind of ["product", "artisan", "restaurant"] as const) {
    const slug = slugFromParam(params[TARGET_PARAMS[kind]]);
    if (slug) return { kind, slug };
  }
  return null;
}

/**
 * Link to our contact form, opened on "Une commande" for this business or product: the visitor asks
 * CeliacCare, and our team contacts the business for them.
 * orderRequestHref("fr", { kind: "artisan", slug: "lilydelights" })
 *   -> "/fr/contact?sujet=commande&artisan=lilydelights#formulaire"
 */
export function orderRequestHref(locale: Locale, target: OrderRequestTarget) {
  const query = new URLSearchParams({ sujet: "commande", [TARGET_PARAMS[target.kind]]: target.slug });
  return `${localePath(locale, "/contact")}?${query.toString()}#formulaire`;
}
