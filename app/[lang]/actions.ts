"use server";

import { z } from "zod";

import { isLocale } from "@/i18n/config";
import type { CommunityDict } from "@/i18n/resources/fr/community";
import { getDictionary } from "@/i18n/server";
import { containsContact } from "@/lib/contacts";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import {
  formDataToObject,
  honeypot,
  idSchema,
  submittedValues,
  validationError,
  type ActionState,
} from "@/lib/validators";
import { createReport } from "@/models/posters/reports";
import { createReview } from "@/models/posters/reviews";
import { REPORT_REASONS, REPORT_TARGETS, type Locale, type ReportTarget } from "@/types";

/* ==========================================================================
   Public Server Actions shared by several pages (product, restaurant and
   artisan sheets):
   - submitReview: "Donner mon avis" (EF-22). The review is saved as PENDING
     and only appears on the site once a moderator approves it.
   - submitReport: "Signaler une erreur" (EF-20). Saved as OPEN for the admin queue.

   The forms bind the page language and the target:
     submitReview.bind(null, locale, { type: "PRODUCT", id: 12 })
   Anyone can call a Server Action directly, so every argument is checked again here.
   ========================================================================== */

/** The product or restaurant a review is about. */
export type ReviewTargetRef = { type: "PRODUCT" | "RESTAURANT"; id: number };

/** The sheet (product, artisan or restaurant) an error report is about. */
export type ReportTargetRef = { type: ReportTarget; id: number };

/* -------------------------------------------------------------------------- */
/*  Reviews (EF-22)                                                            */
/* -------------------------------------------------------------------------- */

export async function submitReview(
  locale: Locale,
  target: ReviewTargetRef,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { errors, reviewForm } = getDictionary(safeLocale(locale)).community;

  // 1. Anti-bot: bots that fill the hidden field get a fake success and nothing is saved.
  if (isBot(formData)) return { status: "success", message: reviewForm.success };

  // 2. Validate the target and the fields.
  const checkedTarget = reviewTargetSchema.safeParse(target);
  if (!checkedTarget.success) return { status: "error", message: errors.notFound };

  const parsed = reviewSchema(errors).safeParse(formDataToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData, errors.invalid);

  // 3. Limit the number of reviews per connection (checked after the validation,
  //    so a typo does not use up the visitor's quota).
  const ipHash = await getIpHash();
  const { ok } = await rateLimit(`review:${ipHash}`, LIMITS.review);
  if (!ok) return { status: "error", message: errors.tooMany, values: submittedValues(formData) };

  // 4. Save it as PENDING. Nothing changes on the public pages until a moderator
  //    approves it, so there is no cache to refresh here.
  const { type, id } = checkedTarget.data;
  try {
    const review = await createReview({
      productId: type === "PRODUCT" ? id : null,
      restaurantId: type === "RESTAURANT" ? id : null,
      authorName: parsed.data.authorName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      ipHash,
    });
    if (!review) return { status: "error", message: errors.notFound, values: submittedValues(formData) };
  } catch (error) {
    console.error("[submitReview]", error);
    return { status: "error", message: errors.generic, values: submittedValues(formData) };
  }

  return { status: "success", message: reviewForm.success };
}

/* -------------------------------------------------------------------------- */
/*  Error reports (EF-20)                                                      */
/* -------------------------------------------------------------------------- */

export async function submitReport(
  locale: Locale,
  target: ReportTargetRef,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { errors, report } = getDictionary(safeLocale(locale)).community;

  // 1. Anti-bot: bots that fill the hidden field get a fake success and nothing is saved.
  if (isBot(formData)) return { status: "success", message: report.success };

  // 2. Validate the target and the fields.
  const checkedTarget = reportTargetSchema.safeParse(target);
  if (!checkedTarget.success) return { status: "error", message: errors.notFound };

  const parsed = reportSchema(errors).safeParse(formDataToObject(formData));
  if (!parsed.success) return validationError(parsed.error, formData, errors.invalid);

  // 3. Limit the number of reports per connection.
  const ipHash = await getIpHash();
  const { ok } = await rateLimit(`report:${ipHash}`, LIMITS.report);
  if (!ok) return { status: "error", message: errors.tooMany, values: submittedValues(formData) };

  // 4. Save it as OPEN for the admin queue (the admin pages are never cached).
  try {
    const saved = await createReport({
      targetType: checkedTarget.data.type,
      targetId: checkedTarget.data.id,
      reason: parsed.data.reason,
      message: parsed.data.message,
      contact: parsed.data.contact,
      ipHash,
    });
    if (!saved) return { status: "error", message: errors.notFound, values: submittedValues(formData) };
  } catch (error) {
    console.error("[submitReport]", error);
    return { status: "error", message: errors.generic, values: submittedValues(formData) };
  }

  return { status: "success", message: report.success };
}

/* -------------------------------------------------------------------------- */
/*  Validation (error messages in the visitor's language)                      */
/* -------------------------------------------------------------------------- */

const reviewTargetSchema = z.object({ type: z.enum(["PRODUCT", "RESTAURANT"]), id: idSchema });
const reportTargetSchema = z.object({ type: z.enum(REPORT_TARGETS), id: idSchema });

/**
 * Fields of the "Donner mon avis" form. A review is public: it may not give a contact (phone, e-mail,
 * link, social account), since every purchase goes through CeliacCare (lib/contacts.ts).
 */
function reviewSchema(errors: CommunityDict["errors"]) {
  const withoutContact = (text: string) => !containsContact(text);
  return z.object({
    authorName: textBetween(2, 40, errors.nameLength).refine(withoutContact, errors.noContact),
    // A radio button sends "1" to "5"; nothing is sent when no star was chosen.
    rating: z.enum(["1", "2", "3", "4", "5"], { error: errors.ratingRequired }).transform(Number),
    comment: textBetween(10, 1000, errors.commentLength).refine(withoutContact, errors.noContact),
  });
}

/** Fields of the "Signaler une erreur" form. */
function reportSchema(errors: CommunityDict["errors"]) {
  return z.object({
    reason: z.enum(REPORT_REASONS, { error: errors.reasonRequired }),
    message: textBetween(10, 1000, errors.messageLength),
    contact: optionalContact(errors.contactInvalid),
  });
}

/** Required text of `min` to `max` characters, spaces around removed. */
function textBetween(min: number, max: number, message: string) {
  return z.string({ error: message }).trim().min(min, message).max(max, message);
}

/**
 * Optional e-mail or Tunisian phone number to answer the visitor.
 * "" becomes null; an e-mail is saved in lower case, a phone as its 8 digits.
 */
function optionalContact(message: string) {
  return z
    .string({ error: message })
    .trim()
    .max(120, message)
    .optional()
    .transform((value, ctx) => {
      if (!value) return null;
      if (z.email().safeParse(value).success) return value.toLowerCase();
      const phone = normalizeTunisianPhone(value);
      if (phone) return phone;
      ctx.addIssue({ code: "custom", message });
      return z.NEVER;
    });
}

/** The hidden "website" field (<HoneypotField />) is invisible to people: only bots fill it in. */
function isBot(formData: FormData) {
  return !honeypot.safeParse(formData.get("website") ?? undefined).success;
}

/** The language bound to the form, French if it is not a known one. */
function safeLocale(locale: string): Locale {
  return isLocale(locale) ? locale : "fr";
}
