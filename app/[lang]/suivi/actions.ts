"use server";

import type { TrackOrderError, TrackOrderState } from "@/components/checkout/types";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/server";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import { normalizeOrderReference, trackOrder } from "@/models/fetchers/orders";
import type { Locale } from "@/types";

/**
 * Order tracking without an account (spec EF-11): the visitor gives the order reference AND the
 * phone number used for the order. When they do not match, the answer is always the same
 * "Commande introuvable" (we never reveal that a reference exists with another phone number).
 * Used with useActionState in <TrackingForm>, the language bound first: trackOrderAction.bind(null, lang).
 */
export async function trackOrderAction(
  locale: Locale,
  _prevState: TrackOrderState,
  formData: FormData,
): Promise<TrackOrderState> {
  const lang: Locale = isLocale(locale) ? locale : "fr";
  // Sent back to refill the form (React empties it after an action).
  const values = {
    reference: String(formData.get("reference") ?? "").slice(0, 40),
    phone: String(formData.get("phone") ?? "").slice(0, 30),
  };
  const fail = (message: TrackOrderError): TrackOrderState => ({ status: "error", message, values });

  // 1. Anti-abuse: invisible field + 30 searches per hour per connection.
  const trap = formData.get("website");
  if (typeof trap === "string" && trap !== "") return fail("NOT_FOUND");

  const ipHash = await getIpHash();
  const { ok } = await rateLimit(`tracking:${ipHash}`, LIMITS.tracking);
  if (!ok) return fail("RATE_LIMIT");

  // 2. Validation: "cc-7k2p9q" → "CC-7K2P9Q", "+216 20 123 456" → "20123456".
  const reference = normalizeOrderReference(values.reference);
  const phone = normalizeTunisianPhone(values.phone);
  if (!reference || !phone) {
    const { errors } = getDictionary(lang).checkout.tracking;
    return {
      ...fail("INVALID"),
      fieldErrors: {
        reference: reference ? undefined : [errors.reference],
        phone: phone ? undefined : [errors.phone],
      },
    };
  }

  // 3. The order, only when the reference AND the phone number match.
  try {
    const order = await trackOrder(reference, phone);
    if (!order) return fail("NOT_FOUND");
    return { status: "success", data: order, values };
  } catch (error) {
    console.error("[tracking] the order could not be read:", error instanceof Error ? error.message : error);
    return fail("ERROR");
  }
}
