"use server";

import { z } from "zod";

import { isLocale } from "@/i18n/config";
import { interpolate } from "@/i18n/interpolate";
import type { ContactDict } from "@/i18n/resources/fr/contact";
import { getDictionary } from "@/i18n/server";
import { LIMITS, rateLimit } from "@/lib/rate-limit";
import { getIpHash } from "@/lib/request";
import { normalizeTunisianPhone } from "@/lib/tunisia";
import { checkbox, formDataToObject, submittedValues, type ActionState } from "@/lib/validators";
import { createContactMessage } from "@/models/posters/messages";
import { MESSAGE_TOPICS, type Locale } from "@/types";

/* ==========================================================================
   Contact form (/contact). The message is saved with the status NEW and
   appears in the admin panel ("Messages"). Anyone can call a Server Action,
   so everything is checked here, with error messages in the page language.
   ========================================================================== */

/** The form fields, with the error messages of the visitor's language. */
function contactSchema(errors: ContactDict["errors"]) {
  const requiredText = (max: number) =>
    z
      .string({ error: errors.required })
      .trim()
      .min(1, errors.required)
      .max(max, interpolate(errors.tooLong, { max }));

  return z.object({
    topic: z.enum(MESSAGE_TOPICS, { error: errors.topic }),
    name: requiredText(100),
    // Optional e-mail: "" becomes null
    email: z
      .string()
      .trim()
      .max(254, interpolate(errors.tooLong, { max: 254 }))
      .optional()
      .transform((value) => (value ? value.toLowerCase() : null))
      .refine((value) => value === null || z.email().safeParse(value).success, errors.email),
    // Optional Tunisian phone: "" becomes null, "+216 20 123 456" becomes "20123456"
    phone: z
      .string()
      .trim()
      .optional()
      .transform((value, ctx) => {
        if (!value) return null;
        const phone = normalizeTunisianPhone(value);
        if (!phone) {
          ctx.addIssue({ code: "custom", message: errors.phone });
          return z.NEVER;
        }
        return phone;
      }),
    subject: requiredText(150),
    message: z
      .string({ error: errors.required })
      .trim()
      .min(1, errors.required)
      .min(10, errors.messageTooShort)
      .max(3000, errors.messageTooLong),
    consent: checkbox.refine((accepted) => accepted, errors.consent),
  });
}

/** Used with useActionState in components/contact/contact-form.tsx (the language is bound by the page). */
export async function sendContactMessage(lang: Locale, _prevState: ActionState, formData: FormData): Promise<ActionState> {
  const { common, contact } = getDictionary(isLocale(lang) ? lang : "fr");
  const values = submittedValues(formData); // to fill the form again after an error

  // 1. Hidden "website" field: only robots fill it. Pretend it worked and save nothing.
  if (formData.get("website")) return { status: "success" };

  // 2. Check the fields.
  const input = formDataToObject(formData);
  const result = contactSchema(contact.errors).safeParse(input);
  const fieldErrors: Record<string, string[] | undefined> = result.success ? {} : z.flattenError(result.error).fieldErrors;

  // We need a way to answer: an e-mail OR a phone number. Checked here (not in the
  // schema) so that this message appears at the same time as the other errors.
  // "reach" is not a field: the form shows it under the two fields, in place of their hint.
  const canAnswer = String(input.email ?? "").trim() !== "" || String(input.phone ?? "").trim() !== "";
  if (!canAnswer) fieldErrors.reach = [contact.errors.reach];

  if (!result.success || !canAnswer) {
    return { status: "error", message: common.forms.invalid, fieldErrors, values };
  }

  // 3. Anti-spam: at most 5 messages per hour from the same connection.
  //    Counted only for valid messages, so typing mistakes never block anyone.
  const ipHash = await getIpHash();
  const { ok } = await rateLimit(`contact:${ipHash}`, LIMITS.contact);
  if (!ok) return { status: "error", message: common.forms.tooMany, values };

  // 4. Save the message (it appears as NEW in the admin panel).
  const { topic, name, email, phone, subject, message } = result.data;
  try {
    await createContactMessage({ topic, name, email, phone, subject, message, ipHash });
  } catch (error) {
    console.error("[contact] the message could not be saved", error);
    return { status: "error", message: common.forms.genericError, values };
  }

  return { status: "success" };
}
